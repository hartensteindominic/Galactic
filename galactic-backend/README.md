# Galactic Garden Backend

Backend server for the Infinite Galactic Garden metaverse with xAI Grok integration, multiplayer WebSocket support, and NFT minting capabilities.

## Features

- 🤖 **xAI Grok Integration** - AI-powered code analysis, generation, and chat
- 🎮 **Multiplayer System** - Real-time player synchronization via WebSocket
- 🖼️ **NFT System** - Mint gardens as NFTs with metadata and rarity
- 💬 **Chat System** - Real-time multiplayer chat
- 🔒 **Security** - CORS enabled, input validation, error handling

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd galactic-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set your xAI API key in `.env`:
```
PORT=3000
XAI_API_KEY=your_actual_xai_api_key_here
```

4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

**GET** `/health`
- Returns server status
- No authentication required

### AI Endpoints (xAI Grok)

All AI endpoints use the xAI Grok-Beta model.

#### Analyze Code
**POST** `/api/ai/analyze`
```json
{
  "code": "function example() { ... }",
  "language": "javascript"
}
```

#### Rewrite Code
**POST** `/api/ai/rewrite`
```json
{
  "code": "original code",
  "instruction": "make it more efficient",
  "language": "javascript"
}
```

#### Customize Style
**POST** `/api/ai/customize-style`
```json
{
  "css": "body { color: black; }",
  "preferences": "make it dark themed with neon accents"
}
```

#### Generate Feature
**POST** `/api/ai/generate-feature`
```json
{
  "description": "create a particle effect system",
  "language": "javascript"
}
```

#### Fix Bug
**POST** `/api/ai/fix-bug`
```json
{
  "code": "buggy code",
  "bugDescription": "function returns undefined",
  "language": "javascript"
}
```

#### Optimize Code
**POST** `/api/ai/optimize`
```json
{
  "code": "code to optimize",
  "language": "javascript"
}
```

#### Garden Suggestions
**POST** `/api/ai/suggest-garden`
```json
{
  "gardenData": {
    "trees": 50,
    "flowers": 200
  }
}
```

#### Chat with Grok
**POST** `/api/ai/chat`
```json
{
  "message": "How can I improve my garden?",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

### NFT Endpoints

#### Mint Garden NFT
**POST** `/api/nft/mint-garden`
```json
{
  "address": "0x123...",
  "gardenData": {
    "trees": [...],
    "flowers": [...]
  },
  "metadata": {
    "name": "My Garden",
    "description": "A beautiful garden"
  }
}
```

Returns:
```json
{
  "success": true,
  "tokenId": 1,
  "metadataURI": "ipfs://Qm...",
  "rarity": "Rare",
  "message": "Successfully minted Rare garden NFT #1!"
}
```

#### Get User's Gardens
**GET** `/api/nft/my-gardens/:address`

Returns:
```json
{
  "success": true,
  "address": "0x123...",
  "count": 3,
  "gardens": [
    {
      "tokenId": 1,
      "name": "My Garden #1",
      "rarity": "Rare",
      "mintedAt": 1234567890
    }
  ]
}
```

#### Load Garden from NFT
**GET** `/api/nft/load-garden/:tokenId`

Returns the full garden data including tree/flower positions.

#### NFT Statistics
**GET** `/api/nft/stats`

Returns statistics about minted NFTs.

## WebSocket Protocol

Connect to `ws://localhost:3000` for multiplayer functionality.

### Events from Server

#### Connected
```json
{
  "type": "connected",
  "playerId": "abc123",
  "message": "Connected to Galactic Garden"
}
```

#### Player List
```json
{
  "type": "playerList",
  "players": [
    {
      "id": "xyz789",
      "username": "Player_xyz7",
      "position": { "x": 0, "y": 2, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 }
    }
  ]
}
```

#### Player Joined
```json
{
  "type": "playerJoined",
  "player": {
    "id": "xyz789",
    "username": "Player_xyz7",
    "position": { "x": 0, "y": 2, "z": 0 }
  }
}
```

#### Player Moved
```json
{
  "type": "playerMoved",
  "playerId": "xyz789",
  "position": { "x": 10, "y": 2, "z": 5 },
  "rotation": { "x": 0, "y": 1.5, "z": 0 }
}
```

#### Player Left
```json
{
  "type": "playerLeft",
  "playerId": "xyz789"
}
```

#### Chat Message
```json
{
  "type": "chat",
  "playerId": "xyz789",
  "username": "Player_xyz7",
  "message": "Hello!",
  "timestamp": 1234567890
}
```

### Events to Server

#### Update Position
```json
{
  "type": "position",
  "position": { "x": 10, "y": 2, "z": 5 },
  "rotation": { "x": 0, "y": 1.5, "z": 0 }
}
```

#### Send Chat Message
```json
{
  "type": "chat",
  "message": "Hello everyone!"
}
```

#### Update Username
```json
{
  "type": "username",
  "username": "CoolPlayer123"
}
```

## Deployment

### Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set build command: `cd galactic-backend && npm install`
5. Set start command: `cd galactic-backend && npm start`
6. Add environment variable: `XAI_API_KEY`
7. Deploy!

### Railway.app

1. Install Railway CLI or use web interface
2. Run `railway init` in backend directory
3. Set environment variable: `XAI_API_KEY`
4. Run `railway up`

### Heroku

1. Install Heroku CLI
2. Run `heroku create`
3. Set environment variable: `heroku config:set XAI_API_KEY=your_key`
4. Deploy: `git push heroku main`

### Environment Variables for Production

- `XAI_API_KEY` - Your xAI API key (required)
- `PORT` - Port to run server on (optional, defaults to 3000)

## Technology Stack

- **Express.js** - Web server framework
- **WebSocket (ws)** - Real-time multiplayer
- **Axios** - HTTP client for xAI API
- **xAI Grok** - AI model for code analysis and generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Security Notes

- API key is stored in environment variables
- CORS is enabled for all origins (configure for production)
- Input validation on all endpoints
- Error handling to prevent information leakage
- Rate limiting should be added for production

## Development

To run in development mode with auto-reload:
```bash
npm run dev
```

## Testing

Test the API with curl:
```bash
# Health check
curl http://localhost:3000/health

# Test AI chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, Grok!"}'
```

Test WebSocket with a browser or WebSocket client.

## License

MIT
