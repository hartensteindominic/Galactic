# 🌟 Infinite Galactic Neural Garden

A fully functional Web3 metaverse experience featuring procedurally generated 3D gardens, xAI Grok integration, multiplayer capabilities, and NFT minting.

![Galactic Garden](https://img.shields.io/badge/Status-Live-success)
![Three.js](https://img.shields.io/badge/Three.js-r128-blue)
![xAI Grok](https://img.shields.io/badge/xAI-Grok--Beta-purple)
![Web3](https://img.shields.io/badge/Web3-MetaMask-orange)

## ✨ Features

### 🎮 Core Experience
- **Procedural Garden Generation** - 50 unique trees and 200 colorful flowers
- **First-Person Controls** - WASD movement, mouse look, sprint with Shift
- **AI Agent Clouds** - 4 floating AI agents with pulsing animations
- **Dynamic Lighting** - Real-time shadows and fog effects
- **Terrain Variation** - Procedurally generated ground height

### 🤖 AI Integration (xAI Grok)
- **Code Analysis** - Analyze your code for bugs and improvements
- **Code Optimization** - Get AI-powered performance suggestions
- **Style Customization** - Natural language CSS modifications
- **Feature Generation** - Generate new code features
- **Bug Fixing** - AI-assisted debugging
- **Chat Assistant** - Interactive Grok chat for help

### 🌐 Multiplayer
- **Real-time Sync** - See other players in your garden
- **Position Tracking** - Smooth player movement interpolation
- **Chat System** - Real-time messaging with other players
- **Player Avatars** - Colored spheres with username labels
- **WebSocket** - Low-latency multiplayer communication

### 🖼️ NFT System
- **Mint Gardens** - Save your garden as an NFT
- **Rarity System** - Common, Rare, Epic, Legendary
- **Gallery View** - Browse your minted gardens
- **Load Gardens** - Restore saved gardens from NFTs
- **IPFS Metadata** - Decentralized metadata storage

### 💎 Subscription Tiers
- **Free Explorer** - Basic garden access
- **AR Access** (0.0001 ETH) - Augmented reality mode
- **VR Experience** (0.0005 ETH) - Virtual reality mode
- **Neural Premium** (0.001 ETH) - Brainwave interface
- **Quantum Elite** (0.005 ETH) - All features unlocked

### 🧠 Neural Interface
- **Brainwave Visualization** - Real-time EEG pattern simulation
- **Theta/Alpha/Beta Waves** - Multi-wave visualization
- **Animated Canvas** - Smooth sine wave animations

## 🚀 Quick Start

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/hartensteindominic/Galactic.git
cd Galactic
```

2. Serve the frontend (any HTTP server):
```bash
python3 -m http.server 8080
# or
npx serve
```

3. Open `http://localhost:8080` in your browser

### Backend Setup

1. Navigate to backend directory:
```bash
cd galactic-backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

## 📦 Technology Stack

### Frontend
- **Three.js** - 3D rendering engine
- **A-Frame** - AR/VR framework
- **Web3/MetaMask** - Blockchain integration
- **WebSocket Client** - Real-time multiplayer
- **Vanilla JavaScript** - No framework dependencies

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **WebSocket (ws)** - Real-time communication
- **xAI Grok API** - AI integration
- **Axios** - HTTP client
- **CORS** - Cross-origin support

### AI
- **xAI Grok-Beta** - Advanced language model
- **Natural Language Processing** - Code and style understanding
- **Code Generation** - Feature and optimization suggestions

### Blockchain
- **Ethereum** - Smart contract platform
- **MetaMask** - Web3 wallet
- **IPFS** - Decentralized storage (mocked)

## 🎮 Controls

- **W/A/S/D** - Move around the garden
- **Mouse** - Look around (click to enable)
- **Shift** - Sprint
- **Space** - Jump
- **Click** - Lock pointer for mouse look

## 🔧 Configuration

### Frontend Configuration

Edit `script-advanced.js` to change API endpoints:

```javascript
const API_URL = 'http://localhost:3000'; // Backend URL
const WS_URL = 'ws://localhost:3000';    // WebSocket URL
```

### Backend Configuration

Edit `galactic-backend/.env`:

```env
PORT=3000
XAI_API_KEY=your_api_key_here
```

## 📡 API Documentation

Full API documentation is available in [galactic-backend/README.md](galactic-backend/README.md)

### Key Endpoints

- `GET /health` - Health check
- `POST /api/ai/analyze` - Analyze code
- `POST /api/ai/chat` - Chat with Grok
- `POST /api/nft/mint-garden` - Mint garden NFT
- `GET /api/nft/my-gardens/:address` - Get user's gardens
- WebSocket: Real-time multiplayer

## 🚢 Deployment

### Deploy Backend

#### Render.com (Recommended)
1. Push code to GitHub
2. Import repository on Render
3. Create new Web Service
4. Use `render.yaml` configuration
5. Add `XAI_API_KEY` environment variable
6. Deploy!

#### Railway.app
```bash
railway login
railway init
railway up
```

#### Heroku
```bash
heroku create galactic-backend
heroku config:set XAI_API_KEY=your_key
git push heroku main
```

### Deploy Frontend

#### Vercel
```bash
vercel --prod
```

#### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Deploy from main branch
3. Update API URLs to production backend

#### Netlify
```bash
netlify deploy --prod
```

### Production Configuration

1. Update API URLs in `script-advanced.js`:
```javascript
const API_URL = 'https://your-backend.onrender.com';
const WS_URL = 'wss://your-backend.onrender.com';
```

2. Enable CORS for your frontend domain in backend

3. Set up HTTPS for both frontend and backend

## 🔒 Security

- API keys stored in environment variables
- Input validation on all endpoints
- CORS protection
- MetaMask signature verification (recommended for production)
- Rate limiting (should be added for production)
- No private keys in frontend code

## 🧪 Testing

### Test Frontend
1. Open browser console (F12)
2. Check for errors
3. Test controls (WASD, mouse)
4. Verify garden loads (50 trees, 200 flowers)
5. Test MetaMask connection
6. Try payment flow
7. Test AR/VR modes
8. Test neural interface

### Test Backend
```bash
# Health check
curl http://localhost:3000/health

# Test AI chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# Test NFT stats
curl http://localhost:3000/api/nft/stats
```

### Test Multiplayer
1. Open two browser windows
2. Connect to multiplayer in both
3. Move in one window
4. Verify other player appears and moves
5. Test chat messages

## 📊 Project Structure

```
Galactic/
├── index.html              # Main HTML page
├── script.js               # Core Three.js functionality
├── script-advanced.js      # Multiplayer & AI features
├── style.css               # Styles
├── web3-integration.js     # Web3 utilities
├── galactic-backend/       # Backend server
│   ├── server.js           # Express + WebSocket server
│   ├── routes/
│   │   ├── ai.js          # xAI Grok integration
│   │   └── nft.js         # NFT system
│   ├── package.json       # Dependencies
│   ├── .env              # Environment variables
│   └── README.md         # Backend documentation
├── render.yaml            # Render.com config
├── railway.json           # Railway.app config
├── Procfile              # Heroku config
├── vercel.json           # Vercel config
└── README.md             # This file
```

## 🎯 Features Checklist

- [x] Procedural garden generation (50 trees, 200 flowers)
- [x] WASD + mouse camera controls
- [x] AI agent clouds (4 colored, floating, pulsing)
- [x] MetaMask wallet integration
- [x] Subscription system with localStorage
- [x] Payment processing with MetaMask
- [x] AR/VR modes with A-Frame
- [x] Neural interface with brainwave animation
- [x] Backend server with Express
- [x] xAI Grok integration (8 endpoints)
- [x] WebSocket multiplayer system
- [x] Real-time chat
- [x] NFT minting and loading
- [x] AI control panel
- [x] NFT gallery
- [x] Deployment configurations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

- **Three.js** - 3D graphics library
- **A-Frame** - AR/VR framework
- **xAI Grok** - AI capabilities
- **MetaMask** - Web3 integration

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check backend logs for API errors
- Verify xAI API key is valid
- Ensure MetaMask is installed

## 🌟 Future Enhancements

- [ ] Smart contract deployment for NFTs
- [ ] IPFS integration for real storage
- [ ] Voice chat in multiplayer
- [ ] Garden editing tools
- [ ] Seasonal themes
- [ ] Weather effects
- [ ] More plant varieties
- [ ] Sound effects and music
- [ ] Mobile support
- [ ] VR controller support

## 🚀 Live Demo

Coming soon! Deploy to try it out yourself.

---

Made with 💜 by the Galactic Garden team

**Powered by xAI Grok-Beta**
