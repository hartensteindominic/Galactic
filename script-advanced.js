// Advanced features for Infinite Galactic Garden
// Requires script.js to be loaded first

// Configuration
const API_URL = 'http://localhost:3000'; // Change for production
const WS_URL = 'ws://localhost:3000'; // Change for production

// WebSocket connection for multiplayer
let ws = null;
let myPlayerId = null;
let remotePlayers = new Map();
let isMultiplayerConnected = false;

// Notification system
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(0, 242, 255, 0.95);
        color: #0a0a0f;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 5px 20px rgba(0, 242, 255, 0.5);
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-dismiss
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Multiplayer System
function connectMultiplayer() {
    if (isMultiplayerConnected) {
        showNotification('Already connected to multiplayer!');
        return;
    }
    
    try {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log('Connected to multiplayer server');
            isMultiplayerConnected = true;
            showNotification('✅ Connected to multiplayer!');
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleMultiplayerMessage(data);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            showNotification('❌ Multiplayer connection error');
        };
        
        ws.onclose = () => {
            console.log('Disconnected from multiplayer server');
            isMultiplayerConnected = false;
            showNotification('Disconnected from multiplayer');
            
            // Clear remote players
            remotePlayers.forEach((player) => {
                scene.remove(player.mesh);
            });
            remotePlayers.clear();
        };
        
        // Send position updates every 100ms
        setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN && camera) {
                ws.send(JSON.stringify({
                    type: 'position',
                    position: {
                        x: camera.position.x,
                        y: camera.position.y,
                        z: camera.position.z
                    },
                    rotation: {
                        x: camera.rotation.x,
                        y: camera.rotation.y,
                        z: camera.rotation.z
                    }
                }));
            }
        }, 100);
        
    } catch (error) {
        console.error('Failed to connect to multiplayer:', error);
        showNotification('❌ Failed to connect to multiplayer');
    }
}

function handleMultiplayerMessage(data) {
    switch (data.type) {
        case 'connected':
            myPlayerId = data.playerId;
            console.log('My player ID:', myPlayerId);
            break;
            
        case 'playerList':
            // Add existing players
            data.players.forEach(player => {
                addRemotePlayer(player);
            });
            break;
            
        case 'playerJoined':
            addRemotePlayer(data.player);
            showNotification(`${data.player.username} joined`);
            break;
            
        case 'playerMoved':
            updateRemotePlayer(data.playerId, data.position, data.rotation);
            break;
            
        case 'playerLeft':
            removeRemotePlayer(data.playerId);
            break;
            
        case 'chat':
            displayChatMessage(data.username, data.message);
            break;
    }
}

// Remote player management
function addRemotePlayer(player) {
    if (remotePlayers.has(player.id)) return;
    
    // Create avatar (simple colored sphere)
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00f2ff,
        emissive: 0x00f2ff,
        emissiveIntensity: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(player.position.x, player.position.y, player.position.z);
    
    // Add name label (using canvas texture)
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 242, 255, 0.8)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#0a0a0f';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.username, 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.y = 1.5;
    sprite.scale.set(2, 0.5, 1);
    mesh.add(sprite);
    
    scene.add(mesh);
    
    remotePlayers.set(player.id, {
        mesh: mesh,
        username: player.username,
        targetPosition: player.position,
        targetRotation: player.rotation
    });
    
    console.log('Added remote player:', player.username);
}

function updateRemotePlayer(playerId, position, rotation) {
    const player = remotePlayers.get(playerId);
    if (!player) return;
    
    // Smooth interpolation to new position
    player.targetPosition = position;
    player.targetRotation = rotation;
}

function removeRemotePlayer(playerId) {
    const player = remotePlayers.get(playerId);
    if (!player) return;
    
    scene.remove(player.mesh);
    remotePlayers.delete(playerId);
    console.log('Removed remote player:', playerId);
}

// Update remote players (call in animation loop)
function updateRemotePlayers() {
    remotePlayers.forEach((player) => {
        if (player.targetPosition) {
            // Smooth interpolation
            player.mesh.position.x += (player.targetPosition.x - player.mesh.position.x) * 0.1;
            player.mesh.position.y += (player.targetPosition.y - player.mesh.position.y) * 0.1;
            player.mesh.position.z += (player.targetPosition.z - player.mesh.position.z) * 0.1;
        }
    });
}

// Chat System
let chatVisible = false;

function createChatUI() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatContainer';
    chatContainer.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 20px;
        width: 350px;
        background: rgba(10, 10, 15, 0.95);
        border: 2px solid rgba(0, 242, 255, 0.3);
        border-radius: 15px;
        padding: 15px;
        display: none;
        z-index: 1000;
    `;
    
    chatContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #00f2ff;">💬 Chat</h3>
            <button onclick="toggleChat()" style="background: none; border: none; color: #00f2ff; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <div id="chatMessages" style="height: 200px; overflow-y: auto; margin-bottom: 10px; padding: 10px; background: rgba(26, 26, 46, 0.5); border-radius: 10px;"></div>
        <div style="display: flex; gap: 10px;">
            <input type="text" id="chatInput" placeholder="Type message..." style="flex: 1; padding: 10px; background: rgba(26, 26, 46, 0.8); border: 1px solid rgba(0, 242, 255, 0.3); border-radius: 10px; color: white;">
            <button onclick="sendChatMessage()" style="padding: 10px 20px; background: linear-gradient(135deg, #00f2ff, #7b2ff7); border: none; border-radius: 10px; color: #0a0a0f; font-weight: bold; cursor: pointer;">Send</button>
        </div>
    `;
    
    document.body.appendChild(chatContainer);
    
    // Handle Enter key
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function toggleChat() {
    chatVisible = !chatVisible;
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        chatContainer.style.display = chatVisible ? 'block' : 'none';
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!isMultiplayerConnected || !ws || ws.readyState !== WebSocket.OPEN) {
        showNotification('Not connected to multiplayer!');
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'chat',
        message: message
    }));
    
    input.value = '';
}

function displayChatMessage(username, message) {
    const messagesDiv = document.getElementById('chatMessages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'margin-bottom: 8px; padding: 5px; border-radius: 5px; background: rgba(0, 242, 255, 0.1);';
    messageDiv.innerHTML = `<strong style="color: #00f2ff;">${username}:</strong> <span style="color: #fff;">${message}</span>`;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// AI Control Panel
function createAIControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'aiControlPanel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 370px;
        width: 300px;
        background: rgba(10, 10, 15, 0.95);
        border: 2px solid rgba(123, 47, 247, 0.5);
        border-radius: 20px;
        padding: 20px;
        z-index: 999;
    `;
    
    panel.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #7b2ff7; text-align: center;">🤖 AI Control Panel</h3>
        <button onclick="analyzeCode()" class="ai-btn">📊 Analyze Code</button>
        <button onclick="optimizeCode()" class="ai-btn">✨ Optimize Code</button>
        <button onclick="customizeStyle()" class="ai-btn">🎨 Customize Style</button>
        <button onclick="mintGardenNFT()" class="ai-btn">🖼️ Mint Garden NFT</button>
        <button onclick="loadMyGardens()" class="ai-btn">🏡 My Gardens</button>
        <button onclick="connectMultiplayer()" class="ai-btn">🌐 Join Multiplayer</button>
        <button onclick="toggleChat()" class="ai-btn">💬 Chat</button>
        <button onclick="openGrokChat()" class="ai-btn">🤖 Chat with Grok</button>
    `;
    
    // Add button styles
    const style = document.createElement('style');
    style.textContent = `
        .ai-btn {
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #7b2ff7, #ff006e);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
        }
        .ai-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(123, 47, 247, 0.5);
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(panel);
}

// AI Integration Functions
async function analyzeCode() {
    try {
        const code = `// Current garden code snapshot
Trees: ${trees.length}
Flowers: ${flowers.length}
AI Clouds: ${clouds.length}
Camera Position: ${JSON.stringify(camera.position)}`;
        
        showNotification('🤖 Analyzing with Grok...');
        
        const response = await fetch(`${API_URL}/api/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: 'javascript' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Code Analysis:\n\n' + data.analysis);
        } else {
            showNotification('❌ Analysis failed');
        }
    } catch (error) {
        console.error('Error analyzing code:', error);
        showNotification('❌ Error: ' + error.message);
    }
}

async function optimizeCode() {
    try {
        showNotification('🤖 Optimizing with Grok...');
        
        const response = await fetch(`${API_URL}/api/ai/optimize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code: 'function animate() { requestAnimationFrame(animate); updateCamera(); animateClouds(); renderer.render(scene, camera); }',
                language: 'javascript'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Optimization Suggestions:\n\n' + data.result);
        } else {
            showNotification('❌ Optimization failed');
        }
    } catch (error) {
        console.error('Error optimizing:', error);
        showNotification('❌ Error: ' + error.message);
    }
}

async function customizeStyle() {
    const preferences = prompt('Describe how you want to customize the style:\n(e.g., "make it darker with more neon colors")');
    if (!preferences) return;
    
    try {
        showNotification('🤖 Customizing style with Grok...');
        
        const response = await fetch(`${API_URL}/api/ai/customize-style`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Style Suggestions:\n\n' + data.css);
        } else {
            showNotification('❌ Style customization failed');
        }
    } catch (error) {
        console.error('Error customizing style:', error);
        showNotification('❌ Error: ' + error.message);
    }
}

// NFT System
async function mintGardenNFT() {
    if (!walletAddress) {
        showNotification('❌ Please connect wallet first!');
        return;
    }
    
    try {
        showNotification('🖼️ Minting garden NFT...');
        
        // Capture garden state
        const gardenData = {
            trees: trees.map(tree => ({
                position: { x: tree.position.x, y: tree.position.y, z: tree.position.z }
            })),
            flowers: flowers.map(flower => ({
                position: { x: flower.position.x, y: flower.position.y, z: flower.position.z }
            })),
            timestamp: Date.now()
        };
        
        const response = await fetch(`${API_URL}/api/nft/mint-garden`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: walletAddress,
                gardenData: gardenData,
                metadata: {
                    name: `Galactic Garden #${Date.now()}`,
                    description: 'A unique procedurally generated garden'
                }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`✅ ${data.message}`);
            alert(`Garden NFT Minted!\n\nToken ID: ${data.tokenId}\nRarity: ${data.rarity}\nMetadata: ${data.metadataURI}`);
        } else {
            showNotification('❌ Minting failed');
        }
    } catch (error) {
        console.error('Error minting NFT:', error);
        showNotification('❌ Error: ' + error.message);
    }
}

async function loadMyGardens() {
    if (!walletAddress) {
        showNotification('❌ Please connect wallet first!');
        return;
    }
    
    try {
        showNotification('🏡 Loading your gardens...');
        
        const response = await fetch(`${API_URL}/api/nft/my-gardens/${walletAddress}`);
        const data = await response.json();
        
        if (data.success) {
            displayNFTGallery(data.gardens);
        } else {
            showNotification('❌ Failed to load gardens');
        }
    } catch (error) {
        console.error('Error loading gardens:', error);
        showNotification('❌ Error: ' + error.message);
    }
}

function displayNFTGallery(gardens) {
    // Remove existing gallery
    const existing = document.getElementById('nftGallery');
    if (existing) existing.remove();
    
    // Create gallery
    const gallery = document.createElement('div');
    gallery.id = 'nftGallery';
    gallery.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 800px;
        max-height: 80%;
        overflow-y: auto;
        background: rgba(10, 10, 15, 0.98);
        border: 2px solid #00f2ff;
        border-radius: 20px;
        padding: 30px;
        z-index: 10000;
    `;
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #00f2ff;">🏡 My Garden NFTs</h2>
            <button onclick="document.getElementById('nftGallery').remove()" style="background: none; border: none; color: #00f2ff; font-size: 24px; cursor: pointer;">✕</button>
        </div>
        <p style="color: #a0a0b0; margin-bottom: 20px;">You own ${gardens.length} garden NFT${gardens.length !== 1 ? 's' : ''}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
    `;
    
    gardens.forEach(garden => {
        const rarityColors = {
            'Common': '#a0a0b0',
            'Rare': '#00f2ff',
            'Epic': '#7b2ff7',
            'Legendary': '#ffaa00'
        };
        
        html += `
            <div style="background: rgba(26, 26, 46, 0.8); border: 2px solid ${rarityColors[garden.rarity]}; border-radius: 15px; padding: 15px; cursor: pointer;" onclick="loadGardenFromNFT(${garden.tokenId})">
                <h4 style="margin: 0 0 10px 0; color: ${rarityColors[garden.rarity]};">${garden.name}</h4>
                <p style="font-size: 12px; color: #a0a0b0; margin: 5px 0;">Token #${garden.tokenId}</p>
                <p style="font-size: 14px; color: ${rarityColors[garden.rarity]}; font-weight: bold; margin: 5px 0;">${garden.rarity}</p>
                <p style="font-size: 11px; color: #a0a0b0; margin: 5px 0;">Trees: ${garden.attributes[0].value}</p>
                <p style="font-size: 11px; color: #a0a0b0; margin: 5px 0;">Flowers: ${garden.attributes[1].value}</p>
                <button style="width: 100%; margin-top: 10px; padding: 8px; background: linear-gradient(135deg, #00f2ff, #7b2ff7); border: none; border-radius: 8px; color: #0a0a0f; font-weight: bold; cursor: pointer;">Load Garden</button>
            </div>
        `;
    });
    
    html += '</div>';
    gallery.innerHTML = html;
    document.body.appendChild(gallery);
}

async function loadGardenFromNFT(tokenId) {
    try {
        showNotification('🏡 Loading garden...');
        
        const response = await fetch(`${API_URL}/api/nft/load-garden/${tokenId}`);
        const data = await response.json();
        
        if (data.success) {
            // Clear existing garden
            trees.forEach(tree => scene.remove(tree));
            flowers.forEach(flower => scene.remove(flower));
            trees.length = 0;
            flowers.length = 0;
            
            // Load saved garden
            if (data.gardenData.trees) {
                data.gardenData.trees.forEach(treeData => {
                    const tree = createTree(treeData.position.x, treeData.position.z);
                    trees.push(tree);
                    scene.add(tree);
                });
            }
            
            if (data.gardenData.flowers) {
                data.gardenData.flowers.forEach(flowerData => {
                    const flower = createFlower(flowerData.position.x, flowerData.position.z);
                    flowers.push(flower);
                    scene.add(flower);
                });
            }
            
            showNotification(`✅ Loaded ${data.rarity} garden #${tokenId}`);
            document.getElementById('nftGallery').remove();
        } else {
            showNotification('❌ Failed to load garden');
        }
    } catch (error) {
        console.error('Error loading garden:', error);
        showNotification('❌ Error: ' + error.message);
    }
}

// Grok Chat
function openGrokChat() {
    const existing = document.getElementById('grokChatModal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'grokChatModal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        max-height: 80%;
        background: rgba(10, 10, 15, 0.98);
        border: 2px solid #7b2ff7;
        border-radius: 20px;
        padding: 30px;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #7b2ff7;">🤖 Chat with Grok</h2>
            <button onclick="document.getElementById('grokChatModal').remove()" style="background: none; border: none; color: #7b2ff7; font-size: 24px; cursor: pointer;">✕</button>
        </div>
        <div id="grokChatMessages" style="height: 300px; overflow-y: auto; margin-bottom: 20px; padding: 15px; background: rgba(26, 26, 46, 0.5); border-radius: 10px;"></div>
        <div style="display: flex; gap: 10px;">
            <input type="text" id="grokChatInput" placeholder="Ask Grok anything..." style="flex: 1; padding: 12px; background: rgba(26, 26, 46, 0.8); border: 1px solid rgba(123, 47, 247, 0.5); border-radius: 10px; color: white;">
            <button onclick="sendGrokMessage()" style="padding: 12px 20px; background: linear-gradient(135deg, #7b2ff7, #ff006e); border: none; border-radius: 10px; color: white; font-weight: bold; cursor: pointer;">Send</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle Enter key
    document.getElementById('grokChatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendGrokMessage();
        }
    });
}

async function sendGrokMessage() {
    const input = document.getElementById('grokChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesDiv = document.getElementById('grokChatMessages');
    
    // Display user message
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'margin-bottom: 10px; text-align: right;';
    userMsg.innerHTML = `<div style="display: inline-block; background: rgba(0, 242, 255, 0.2); padding: 10px 15px; border-radius: 10px; max-width: 80%;"><strong style="color: #00f2ff;">You:</strong> ${message}</div>`;
    messagesDiv.appendChild(userMsg);
    
    input.value = '';
    input.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const grokMsg = document.createElement('div');
            grokMsg.style.cssText = 'margin-bottom: 10px;';
            grokMsg.innerHTML = `<div style="display: inline-block; background: rgba(123, 47, 247, 0.2); padding: 10px 15px; border-radius: 10px; max-width: 80%;"><strong style="color: #7b2ff7;">Grok:</strong> ${data.response}</div>`;
            messagesDiv.appendChild(grokMsg);
        } else {
            messagesDiv.innerHTML += '<p style="color: #ff006e;">Error: ' + data.error + '</p>';
        }
    } catch (error) {
        messagesDiv.innerHTML += '<p style="color: #ff006e;">Error: ' + error.message + '</p>';
    }
    
    input.disabled = false;
    input.focus();
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Initialize advanced features
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing advanced features...');
    createAIControlPanel();
    createChatUI();
});

// Hook into existing animation loop if it exists
if (typeof animate !== 'undefined') {
    const originalAnimate = animate;
    window.animate = function() {
        originalAnimate();
        updateRemotePlayers();
    };
} else {
    // Create animation loop hook
    function animateAdvanced() {
        requestAnimationFrame(animateAdvanced);
        updateRemotePlayers();
    }
    animateAdvanced();
}

console.log('🚀 Advanced features loaded!');
