// Initialize the scene and renderer
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.005);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Attach to gardenCanvas div instead of body
const canvasContainer = document.getElementById('gardenCanvas');
if (canvasContainer) {
    canvasContainer.appendChild(renderer.domElement);
} else {
    document.body.appendChild(renderer.domElement);
}

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Ground plane and environment setup
const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d5016,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

// Add terrain height variation
const vertices = ground.geometry.attributes.position.array;
for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = Math.random() * 2 - 1; // Random height between -1 and 1
}
ground.geometry.attributes.position.needsUpdate = true;
ground.geometry.computeVertexNormals();
scene.add(ground);

// Garden elements
const trees = [];
const flowers = [];

// Create a tree using Three.js meshes
function createTree(x, z) {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Foliage (3 spheres for a fuller look)
    const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0d5e1f,
        roughness: 0.9
    });
    
    for (let i = 0; i < 3; i++) {
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 3 + i * 0.5;
        foliage.position.x = (Math.random() - 0.5) * 0.5;
        foliage.position.z = (Math.random() - 0.5) * 0.5;
        foliage.castShadow = true;
        tree.add(foliage);
    }
    
    tree.position.set(x, 0, z);
    return tree;
}

// Create a flower using Three.js meshes
function createFlower(x, z) {
    const flower = new THREE.Group();
    
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x0d5e1f });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    flower.add(stem);
    
    // Petals (5 small spheres in a circle)
    const colors = [0xff006e, 0x00f2ff, 0x7b2ff7, 0xffaa00, 0xff3366];
    const petalColor = colors[Math.floor(Math.random() * colors.length)];
    const petalGeometry = new THREE.SphereGeometry(0.1, 6, 6);
    const petalMaterial = new THREE.MeshStandardMaterial({ 
        color: petalColor,
        emissive: petalColor,
        emissiveIntensity: 0.3
    });
    
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.x = Math.cos(angle) * 0.15;
        petal.position.z = Math.sin(angle) * 0.15;
        petal.position.y = 0.5;
        flower.add(petal);
    }
    
    // Center
    const centerGeometry = new THREE.SphereGeometry(0.08, 6, 6);
    const centerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.5;
    flower.add(center);
    
    flower.position.set(x, 0, z);
    return flower;
}

// Function to generate garden
function generateGarden() {
    console.log('Generating garden...');
    
    // Generate 50 trees with random placement
    for (let i = 0; i < 50; i++) {
        const x = (Math.random() - 0.5) * 180; // Within 200x200 plane
        const z = (Math.random() - 0.5) * 180;
        const tree = createTree(x, z);
        trees.push(tree);
        scene.add(tree);
    }
    
    // Generate 200 flowers with random placement
    for (let i = 0; i < 200; i++) {
        const x = (Math.random() - 0.5) * 190;
        const z = (Math.random() - 0.5) * 190;
        const flower = createFlower(x, z);
        flowers.push(flower);
        scene.add(flower);
    }
    
    console.log(`Garden generated: ${trees.length} trees, ${flowers.length} flowers`);
}

// Camera controls
const moveSpeed = 0.3;
const sprintMultiplier = 2;
const keys = { w: false, a: false, s: false, d: false, shift: false };
let mouseX = 0, mouseY = 0;
let isPointerLocked = false;

// Event listeners for controls
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

// Pointer lock for mouse controls
const pointerLock = () => {
    document.body.requestPointerLock();
};

document.body.addEventListener('click', () => {
    if (!isPointerLocked) {
        pointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body;
});

document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        mouseX -= event.movementX * 0.002;
        mouseY -= event.movementY * 0.002;
        mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));
    }
});

// Update camera based on controls
function updateCamera() {
    // Apply mouse look
    camera.rotation.order = 'YXZ';
    camera.rotation.y = mouseX;
    camera.rotation.x = mouseY;
    
    // Calculate movement
    const speed = keys.shift ? moveSpeed * sprintMultiplier : moveSpeed;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    
    forward.y = 0;
    forward.normalize();
    right.y = 0;
    right.normalize();
    
    if (keys.w) camera.position.addScaledVector(forward, speed);
    if (keys.s) camera.position.addScaledVector(forward, -speed);
    if (keys.a) camera.position.addScaledVector(right, -speed);
    if (keys.d) camera.position.addScaledVector(right, speed);
    
    // Keep camera above ground (collision detection)
    if (camera.position.y < 2) {
        camera.position.y = 2;
    }
    
    // Keep camera within bounds
    camera.position.x = Math.max(-95, Math.min(95, camera.position.x));
    camera.position.z = Math.max(-95, Math.min(95, camera.position.z));
}

// MetaMask wallet connection
let walletAddress = null;

async function connectWallet() {
    console.log('Connecting wallet...');
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            walletAddress = accounts[0];
            console.log('Connected account:', walletAddress);
            
            // Update UI
            const btn = document.getElementById('connectWallet');
            if (btn) {
                btn.textContent = walletAddress.substring(0, 6) + '...' + walletAddress.substring(38);
                btn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
            }
            
            // Show subscription banner
            const banner = document.getElementById('subscriptionStatusBanner');
            if (banner) {
                banner.style.display = 'block';
                banner.textContent = '✅ Wallet Connected';
            }
            
            // Check existing subscriptions
            checkSubscriptions();
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet: ' + error.message);
        }
    } else {
        alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
}

// Setup wallet button
document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }
});

// Subscription management
function saveSubscription(tier, amount) {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
    subscriptions[tier] = {
        active: true,
        amount: amount,
        timestamp: Date.now()
    };
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    console.log('Subscription saved:', tier);
    updateSubscriptionUI();
}

function checkSubscriptions() {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
    console.log('Checking subscriptions:', subscriptions);
    updateSubscriptionUI();
    return subscriptions;
}

function updateSubscriptionUI() {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
    
    // Update button states
    const tiers = {
        'ar': 'AR Access',
        'vr': 'VR Experience',
        'neural': 'Neural Premium',
        'quantum': 'Quantum Elite'
    };
    
    Object.keys(tiers).forEach(key => {
        const btn = document.getElementById(`btn-${key}`);
        if (btn && subscriptions[tiers[key]] && subscriptions[tiers[key]].active) {
            btn.textContent = '✅ Active';
            btn.classList.add('active');
            btn.disabled = true;
        }
    });
}

// Payment processing functions
let currentPaymentTier = null;
let currentPaymentAmount = null;

function openPayment(tier, amount) {
    if (!walletAddress) {
        alert('Please connect your wallet first!');
        return;
    }
    
    currentPaymentTier = tier;
    currentPaymentAmount = amount;
    
    const modal = document.getElementById('paymentModal');
    const details = document.getElementById('paymentDetails');
    
    if (modal && details) {
        details.innerHTML = `
            <h3>${tier}</h3>
            <p style="margin: 20px 0;">Amount: <strong>${amount} ETH</strong></p>
            <button class="subscribe-btn" onclick="processPayment()" style="width: 100%; max-width: 300px;">
                Pay with MetaMask
            </button>
        `;
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentPaymentTier = null;
    currentPaymentAmount = null;
}

async function processPayment() {
    if (!walletAddress || !currentPaymentTier || !currentPaymentAmount) {
        alert('Payment information missing!');
        return;
    }
    
    const statusDiv = document.getElementById('transactionStatus');
    
    try {
        statusDiv.innerHTML = '<p>Processing payment...</p>';
        statusDiv.style.background = 'rgba(0, 242, 255, 0.2)';
        
        // Convert ETH to Wei (1 ETH = 10^18 Wei) using BigInt for precision
        const amountInWei = '0x' + BigInt(Math.floor(parseFloat(currentPaymentAmount) * 1e18)).toString(16);
        
        // Send transaction (in production, use proper contract/recipient address)
        // TODO: Replace with actual recipient address or smart contract
        const transactionHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: walletAddress,
                to: walletAddress, // DEMO ONLY - Replace with actual recipient address
                value: amountInWei,
            }],
        });
        
        console.log('Transaction hash:', transactionHash);
        
        // Save subscription
        saveSubscription(currentPaymentTier, currentPaymentAmount);
        
        statusDiv.innerHTML = `
            <p style="color: #00ff88;">✅ Payment successful!</p>
            <p style="font-size: 12px; margin-top: 10px;">Transaction: ${transactionHash.substring(0, 10)}...</p>
        `;
        statusDiv.style.background = 'rgba(0, 255, 136, 0.2)';
        
        setTimeout(() => {
            closeModal();
        }, 3000);
        
    } catch (error) {
        console.error('Payment error:', error);
        statusDiv.innerHTML = `<p style="color: #ff006e;">❌ Payment failed: ${error.message}</p>`;
        statusDiv.style.background = 'rgba(255, 0, 110, 0.2)';
    }
}

// AR/VR launch functions
function launchAR() {
    const subscriptions = checkSubscriptions();
    if (!subscriptions['AR Access']) {
        alert('Please subscribe to AR Access to use this feature!');
        return;
    }
    
    const arView = document.getElementById('arView');
    if (arView) {
        arView.style.display = 'block';
        console.log('AR mode activated');
    }
}

function exitAR() {
    const arView = document.getElementById('arView');
    if (arView) {
        arView.style.display = 'none';
        console.log('AR mode deactivated');
    }
}

function launchVR() {
    const subscriptions = checkSubscriptions();
    if (!subscriptions['VR Experience']) {
        alert('Please subscribe to VR Experience to use this feature!');
        return;
    }
    
    const vrView = document.getElementById('vrView');
    if (vrView) {
        vrView.style.display = 'block';
        console.log('VR mode activated');
    }
}

function exitVR() {
    const vrView = document.getElementById('vrView');
    if (vrView) {
        vrView.style.display = 'none';
        console.log('VR mode deactivated');
    }
}

// Neural interface
let brainwaveInterval = null;

function toggleNeural() {
    const subscriptions = checkSubscriptions();
    if (!subscriptions['Neural Premium']) {
        alert('Please subscribe to Neural Premium to use this feature!');
        return;
    }
    
    const panel = document.getElementById('neuralPanel');
    if (panel) {
        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
            startBrainwave();
            console.log('Neural interface activated');
        } else {
            panel.style.display = 'none';
            stopBrainwave();
            console.log('Neural interface deactivated');
        }
    }
}

function closeNeural() {
    const panel = document.getElementById('neuralPanel');
    if (panel) {
        panel.style.display = 'none';
        stopBrainwave();
    }
}

function startBrainwave() {
    const canvas = document.getElementById('brainwaveCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let phase = 0;
    
    brainwaveInterval = setInterval(() => {
        ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw multiple sine waves for different brain wave types
        const waves = [
            { color: '#ff006e', frequency: 0.02, amplitude: 15, offset: 0 },      // Theta
            { color: '#00f2ff', frequency: 0.04, amplitude: 10, offset: 20 },     // Alpha
            { color: '#7b2ff7', frequency: 0.06, amplitude: 8, offset: 40 }       // Beta
        ];
        
        waves.forEach((wave, index) => {
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                const y = canvas.height / 2 + 
                         Math.sin((x + phase) * wave.frequency) * wave.amplitude +
                         Math.sin((x + phase) * wave.frequency * 2) * (wave.amplitude / 2);
                
                if (x === 0) {
                    ctx.moveTo(x, y + wave.offset);
                } else {
                    ctx.lineTo(x, y + wave.offset);
                }
            }
            
            ctx.stroke();
        });
        
        phase += 2;
    }, 50);
}

function stopBrainwave() {
    if (brainwaveInterval) {
        clearInterval(brainwaveInterval);
        brainwaveInterval = null;
    }
}

// AI Agent clouds
const clouds = [];
const cloudData = [
    { name: 'Code Agent', color: 0x00f2ff, position: { x: 20, y: 15, z: 0 }, status: 'Analyzing garden structure...' },
    { name: 'Design Agent', color: 0x7b2ff7, position: { x: 0, y: 18, z: 20 }, status: 'Optimizing aesthetics...' },
    { name: 'Security Agent', color: 0xff006e, position: { x: -20, y: 16, z: 0 }, status: 'Monitoring for threats...' },
    { name: 'Performance Agent', color: 0x00ff88, position: { x: 0, y: 17, z: -20 }, status: 'Analyzing frame rates...' }
];

function createClouds() {
    console.log('Creating AI agent clouds...');
    
    cloudData.forEach((data, index) => {
        // Create cloud group
        const cloud = new THREE.Group();
        
        // Main cloud body (multiple spheres for fluffy effect)
        for (let i = 0; i < 5; i++) {
            const sphereGeometry = new THREE.SphereGeometry(1 + Math.random() * 0.5, 16, 16);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.7
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.x = (Math.random() - 0.5) * 2;
            sphere.position.y = (Math.random() - 0.5) * 1;
            sphere.position.z = (Math.random() - 0.5) * 2;
            cloud.add(sphere);
        }
        
        cloud.position.set(data.position.x, data.position.y, data.position.z);
        cloud.userData = { 
            name: data.name, 
            baseY: data.position.y,
            floatOffset: Math.random() * Math.PI * 2,
            status: data.status
        };
        
        clouds.push(cloud);
        scene.add(cloud);
    });
    
    console.log(`Created ${clouds.length} AI agent clouds`);
    
    // Start status updates
    updateStatusPanel();
    setInterval(updateStatusPanel, 3000);
}

// Animate clouds (floating and pulsing)
function animateClouds() {
    const time = Date.now() * 0.001;
    
    clouds.forEach((cloud, index) => {
        // Floating animation
        cloud.position.y = cloud.userData.baseY + Math.sin(time + cloud.userData.floatOffset) * 1;
        
        // Pulsing emissive effect
        cloud.children.forEach(sphere => {
            if (sphere.material.emissive) {
                sphere.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + index) * 0.3;
            }
        });
        
        // Slow rotation
        cloud.rotation.y += 0.001;
    });
}

// Status panel for AI Agent
const statusMessages = {
    'Code Agent': [
        'Analyzing garden structure...',
        'Optimizing render loops...',
        'Checking for code vulnerabilities...',
        'Implementing new features...'
    ],
    'Design Agent': [
        'Optimizing aesthetics...',
        'Balancing color schemes...',
        'Arranging spatial layouts...',
        'Enhancing visual harmony...'
    ],
    'Security Agent': [
        'Monitoring for threats...',
        'Scanning for anomalies...',
        'Validating transactions...',
        'Protecting garden data...'
    ],
    'Performance Agent': [
        'Analyzing frame rates...',
        'Optimizing memory usage...',
        'Monitoring GPU performance...',
        'Reducing render overhead...'
    ]
};

function updateStatusPanel() {
    clouds.forEach(cloud => {
        const messages = statusMessages[cloud.userData.name];
        if (messages) {
            cloud.userData.status = messages[Math.floor(Math.random() * messages.length)];
        }
    });
    
    // Log status to console (can be shown in UI later)
    if (clouds.length > 0) {
        console.log('AI Agents Status:', clouds.map(c => `${c.userData.name}: ${c.userData.status}`).join(' | '));
    }
}

// UI Functions
function toggleUI() {
    const panel = document.getElementById('uiPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.transition = 'opacity 1s';
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update camera controls
    updateCamera();
    
    // Animate AI clouds
    animateClouds();
    
    // Render the scene
    renderer.render(scene, camera);
}

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Infinite Galactic Garden...');
    generateGarden();
    createClouds();
    checkSubscriptions();
    animate();
    
    // Hide loading screen after everything is loaded
    setTimeout(() => {
        hideLoadingScreen();
    }, 2000);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});