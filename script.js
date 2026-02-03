// Infinite Galactic Neural Garden - Complete Implementation
const WALLET_ADDRESS = '0x02f93c7547309ca50eeab446daebe8ce8e694cbb';
let userWallet = null, scene, camera, renderer, neuralActive = false;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false;
let velocity = new THREE.Vector3(), direction = new THREE.Vector3();
const chunks = new Map(), CHUNK_SIZE = 50, RENDER_DISTANCE = 5, objects = [];

// Seeded random for procedural generation
function seededRandom(x, z) {
    const seed = x * 374761393 + z * 668265263;
    return ((seed ^ (seed >>> 16)) & 0xFFFFFF) / 0xFFFFFF;
}

// Generate chunk with trees and flowers
function generateChunk(cx, cz) {
    const key = `${cx},${cz}`;
    if (chunks.has(key)) return;
    chunks.set(key, true);
    
    const groundGeo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x2d5016, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE);
    ground.userData.chunk = key;
    scene.add(ground);
    objects.push(ground);
    
    for (let i = 0; i < 5; i++) {
        const rand = seededRandom(cx * 1000 + i, cz * 1000 + i);
        const x = cx * CHUNK_SIZE + (rand - 0.5) * CHUNK_SIZE;
        const z = cz * CHUNK_SIZE + (seededRandom(cx * 1000 + i + 1, cz * 1000 + i + 1) - 0.5) * CHUNK_SIZE;
        
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 4);
        const trunkMat = new THREE.MeshPhongMaterial({ color: 0x4a3520 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 2, z);
        trunk.userData.chunk = key;
        scene.add(trunk);
        objects.push(trunk);
        
        const leavesGeo = new THREE.SphereGeometry(2, 8, 8);
        const leavesMat = new THREE.MeshPhongMaterial({ color: 0x00ff44 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(x, 5, z);
        leaves.userData.chunk = key;
        scene.add(leaves);
        objects.push(leaves);
    }
    
    for (let i = 0; i < 10; i++) {
        const rand = seededRandom(cx * 2000 + i, cz * 2000 + i);
        const x = cx * CHUNK_SIZE + (rand - 0.5) * CHUNK_SIZE;
        const z = cz * CHUNK_SIZE + (seededRandom(cx * 2000 + i + 1, cz * 2000 + i + 1) - 0.5) * CHUNK_SIZE;
        
        const flowerGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const colors = [0xff006e, 0x00f2ff, 0x7b2ff7, 0xffff00];
        const flowerMat = new THREE.MeshPhongMaterial({ color: colors[Math.floor(rand * colors.length)] });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(x, 0.3, z);
        flower.userData.chunk = key;
        scene.add(flower);
        objects.push(flower);
    }
}

function unloadChunk(cx, cz) {
    const key = `${cx},${cz}`;
    if (!chunks.has(key)) return;
    chunks.delete(key);
    for (let i = objects.length - 1; i >= 0; i--) {
        if (objects[i].userData.chunk === key) {
            scene.remove(objects[i]);
            objects[i].geometry.dispose();
            objects[i].material.dispose();
            objects.splice(i, 1);
        }
    }
}

function updateChunks() {
    const playerX = Math.floor(camera.position.x / CHUNK_SIZE);
    const playerZ = Math.floor(camera.position.z / CHUNK_SIZE);
    
    for (let cx = playerX - RENDER_DISTANCE; cx <= playerX + RENDER_DISTANCE; cx++) {
        for (let cz = playerZ - RENDER_DISTANCE; cz <= playerZ + RENDER_DISTANCE; cz++) {
            generateChunk(cx, cz);
        }
    }
    
    const toUnload = [];
    chunks.forEach((_, key) => {
        const [cx, cz] = key.split(',').map(Number);
        if (Math.abs(cx - playerX) > RENDER_DISTANCE || Math.abs(cz - playerZ) > RENDER_DISTANCE) {
            toUnload.push([cx, cz]);
        }
    });
    toUnload.forEach(([cx, cz]) => unloadChunk(cx, cz));
}

function initGarden() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 100);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 10;
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gardenCanvas').appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffee, 0.8);
    sunLight.position.set(50, 100, 50);
    scene.add(sunLight);
    
    const fountainGeo = new THREE.CylinderGeometry(2, 2, 1);
    const fountainMat = new THREE.MeshPhongMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.7 });
    const fountain = new THREE.Mesh(fountainGeo, fountainMat);
    fountain.position.y = 0.5;
    scene.add(fountain);
    
    updateChunks();
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', () => renderer.domElement.requestPointerLock());
    
    setTimeout(() => { document.getElementById('loadingScreen').style.display = 'none'; }, 1000);
    animate();
}

function onKeyDown(e) {
    switch(e.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': if (canJump) velocity.y += 50; canJump = false; break;
    }
}

function onKeyUp(e) {
    switch(e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}

let yaw = 0, pitch = 0;
function onMouseMove(e) {
    if (document.pointerLockElement !== renderer.domElement) return;
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
}

function animate() {
    requestAnimationFrame(animate);
    
    const speed = 0.5;
    direction.set(0, 0, 0);
    if (moveForward) direction.z -= 1;
    if (moveBackward) direction.z += 1;
    if (moveLeft) direction.x -= 1;
    if (moveRight) direction.x += 1;
    direction.normalize();
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    camera.position.addScaledVector(forward, direction.z * speed);
    camera.position.addScaledVector(right, direction.x * speed);
    
    velocity.y -= 9.8 * 0.01;
    camera.position.y += velocity.y * 0.01;
    if (camera.position.y <= 10) { camera.position.y = 10; velocity.y = 0; canJump = true; }
    
    updateChunks();
    renderer.render(scene, camera);
}

function toggleUI() {
    const panel = document.getElementById('uiPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function checkSubscriptions() {
    const subs = JSON.parse(localStorage.getItem('galacticSubscriptions') || '[]');
    const banner = document.getElementById('subscriptionStatusBanner');
    if (subs.length > 0) {
        banner.textContent = '✅ Active: ' + subs.join(', ');
        banner.style.display = 'block';
        subs.forEach(sub => {
            const btnId = 'btn-' + sub.toLowerCase().replace(' ', '').replace('access', '').replace('experience', '').replace('premium', 'neural').replace('elite', 'quantum');
            const btn = document.getElementById(btnId);
            if (btn) { btn.textContent = '✅ Active'; btn.classList.add('active'); btn.onclick = null; }
        });
    }
}

function saveSubscription(plan) {
    let subs = JSON.parse(localStorage.getItem('galacticSubscriptions') || '[]');
    if (!subs.includes(plan)) { subs.push(plan); localStorage.setItem('galacticSubscriptions', JSON.stringify(subs)); }
    checkSubscriptions();
}

function launchAR() {
    const subs = JSON.parse(localStorage.getItem('galacticSubscriptions') || '[]');
    if (subs.includes('AR Access') || subs.includes('Neural Premium') || subs.includes('Quantum Elite')) {
        document.getElementById('arView').style.display = 'block';
    } else {
        alert('⚠️ Subscribe to AR Access tier (0.0001 ETH) to unlock!');
    }
}

function exitAR() { document.getElementById('arView').style.display = 'none'; }

function launchVR() {
    const subs = JSON.parse(localStorage.getItem('galacticSubscriptions') || '[]');
    if (subs.includes('VR Experience') || subs.includes('Neural Premium') || subs.includes('Quantum Elite')) {
        document.getElementById('vrView').style.display = 'block';
    } else {
        alert('⚠️ Subscribe to VR Experience tier (0.0005 ETH) to unlock!');
    }
}

function exitVR() { document.getElementById('vrView').style.display = 'none'; }

function toggleNeural() {
    neuralActive = !neuralActive;
    const panel = document.getElementById('neuralPanel');
    panel.style.display = neuralActive ? 'block' : 'none';
    if (neuralActive) startBrainwave();
}

function closeNeural() {
    neuralActive = false;
    document.getElementById('neuralPanel').style.display = 'none';
}

function startBrainwave() {
    const canvas = document.getElementById('brainwaveCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = 80;
    let offset = 0;
    
    function draw() {
        if (!neuralActive) return;
        ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ff006e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height / 2 + Math.sin((x + offset) * 0.05) * 15 + Math.sin((x + offset) * 0.1) * 8;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        offset += 2;
        requestAnimationFrame(draw);
    }
    draw();
}

document.getElementById('connectWallet').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userWallet = accounts[0];
            const short = `${userWallet.substring(0, 6)}...${userWallet.substring(38)}`;
            document.getElementById('connectWallet').textContent = `✓ ${short}`;
            alert('✅ Wallet connected: ' + short);
        } catch (error) {
            alert('❌ Failed to connect wallet');
        }
    } else {
        alert('⚠️ Please install MetaMask!');
    }
});

function openPayment(plan, price) {
    if (!userWallet) {
        alert('⚠️ Please connect MetaMask first!');
        return;
    }
    const subs = JSON.parse(localStorage.getItem('galacticSubscriptions') || '[]');
    if (subs.includes(plan)) {
        alert('✅ You already have this subscription!');
        return;
    }
    const modal = document.getElementById('paymentModal');
    const details = document.getElementById('paymentDetails');
    details.innerHTML = `<h3>${plan}</h3><p style="font-size: 32px; color: #00f2ff; margin: 20px 0;">${price} ETH</p><p style="color: #a0a0b0;">To: ${WALLET_ADDRESS}</p><button class="subscribe-btn" onclick="processPayment('${price}', '${plan}')">💳 Confirm Payment</button>`;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

async function processPayment(amount, plan) {
    const status = document.getElementById('transactionStatus');
    status.style.background = 'rgba(0, 242, 255, 0.1)';
    status.style.color = '#00f2ff';
    status.textContent = '⏳ Processing...';
    try {
        await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                to: WALLET_ADDRESS,
                from: userWallet,
                value: '0x' + Math.floor(parseFloat(amount) * 1e18).toString(16)
            }]
        });
        saveSubscription(plan);
        status.style.background = 'rgba(0, 255, 136, 0.1)';
        status.style.color = '#00ff88';
        status.textContent = `✅ Success! ${plan} activated!`;
        setTimeout(() => closeModal(), 3000);
    } catch (error) {
        status.style.background = 'rgba(255, 0, 110, 0.1)';
        status.style.color = '#ff006e';
        status.textContent = '❌ Payment failed';
    }
}

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

window.addEventListener('load', () => {
    initGarden();
    checkSubscriptions();
});
