const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const aiRoutes = require('./routes/ai');
const nftRoutes = require('./routes/nft');

// Use routes
app.use('/api/ai', aiRoutes);
app.use('/api/nft', nftRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Galactic Garden Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message 
    });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for multiplayer
const wss = new WebSocket.Server({ server });

// Store connected players
const players = new Map();

wss.on('connection', (ws) => {
    console.log('New player connected');
    
    // Generate unique player ID
    const playerId = Math.random().toString(36).substring(7);
    
    // Store player connection
    players.set(playerId, {
        ws: ws,
        username: 'Player_' + playerId.substring(0, 4),
        position: { x: 0, y: 2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    });
    
    // Send player their ID
    ws.send(JSON.stringify({
        type: 'connected',
        playerId: playerId,
        message: 'Connected to Galactic Garden'
    }));
    
    // Send list of existing players
    const existingPlayers = Array.from(players.entries())
        .filter(([id]) => id !== playerId)
        .map(([id, data]) => ({
            id: id,
            username: data.username,
            position: data.position,
            rotation: data.rotation
        }));
    
    ws.send(JSON.stringify({
        type: 'playerList',
        players: existingPlayers
    }));
    
    // Broadcast new player to all other players
    broadcast({
        type: 'playerJoined',
        player: {
            id: playerId,
            username: players.get(playerId).username,
            position: players.get(playerId).position,
            rotation: players.get(playerId).rotation
        }
    }, playerId);
    
    // Handle messages from this player
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'position':
                    // Update player position
                    if (players.has(playerId)) {
                        players.get(playerId).position = data.position;
                        players.get(playerId).rotation = data.rotation;
                        
                        // Broadcast position to other players
                        broadcast({
                            type: 'playerMoved',
                            playerId: playerId,
                            position: data.position,
                            rotation: data.rotation
                        }, playerId);
                    }
                    break;
                    
                case 'chat':
                    // Broadcast chat message
                    const player = players.get(playerId);
                    if (player) {
                        broadcast({
                            type: 'chat',
                            playerId: playerId,
                            username: player.username,
                            message: data.message,
                            timestamp: Date.now()
                        });
                    }
                    break;
                    
                case 'username':
                    // Update player username
                    if (players.has(playerId)) {
                        players.get(playerId).username = data.username;
                        broadcast({
                            type: 'playerUpdated',
                            playerId: playerId,
                            username: data.username
                        }, playerId);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    // Handle player disconnect
    ws.on('close', () => {
        console.log('Player disconnected:', playerId);
        players.delete(playerId);
        
        // Broadcast player left to all players
        broadcast({
            type: 'playerLeft',
            playerId: playerId
        });
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast message to all players (except excluded player)
function broadcast(message, excludePlayerId = null) {
    const messageStr = JSON.stringify(message);
    
    players.forEach((player, id) => {
        if (id !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(messageStr);
        }
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`🌟 Galactic Garden Backend running on port ${PORT}`);
    console.log(`🔗 HTTP API: http://localhost:${PORT}`);
    console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
