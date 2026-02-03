// Initialize the scene and renderer
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0a0f, 10, 100);
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Attach renderer to gardenCanvas
const gardenCanvas = document.getElementById('gardenCanvas');
if (gardenCanvas) {
    gardenCanvas.appendChild(renderer.domElement);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00f2ff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const trees = [];
const flowers = [];

function generateGarden() {
    for (let i = 0; i < 50; i++) {
        const tree = createTree();
        tree.position.set((Math.random() - 0.5) * 180, 0, (Math.random() - 0.5) * 180);
        scene.add(tree);
        trees.push(tree);
    }
    for (let i = 0; i < 200; i++) {
        const flower = createFlower();
        flower.position.set((Math.random() - 0.5) * 180, 0, (Math.random() - 0.5) * 180);
        scene.add(flower);
        flowers.push(flower);
    }
    console.log('Garden generated!');
}

function createTree() {
    const tree = new THREE.Group();
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3020 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    tree.add(trunk);
    const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d8016 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 3.5;
    tree.add(foliage);
    return tree;
}

function createFlower() {
    const flower = new THREE.Group();
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x0a8020 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    flower.add(stem);
    const colors = [0xff006e, 0x00f2ff, 0x7b2ff7, 0xffbe0b];
    const petalGeometry = new THREE.SphereGeometry(0.15, 6, 6);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.y = 0.5;
    flower.add(petal);
    return flower;
}

const controls = { moveForward: false, moveBackward: false, moveLeft: false, moveRight: false, sprint: false };
let velocity = new THREE.Vector3();
let rotation = { x: 0, y: 0 };
let isPointerLocked = false;

window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyW') controls.moveForward = true;
    if (event.code === 'KeyS') controls.moveBackward = true;
    if (event.code === 'KeyA') controls.moveLeft = true;
    if (event.code === 'KeyD') controls.moveRight = true;
    if (event.code === 'ShiftLeft') controls.sprint = true;
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'KeyW') controls.moveForward = false;
    if (event.code === 'KeyS') controls.moveBackward = false;
    if (event.code === 'KeyA') controls.moveLeft = false;
    if (event.code === 'KeyD') controls.moveRight = false;
    if (event.code === 'ShiftLeft') controls.sprint = false;
});

document.addEventListener('click', () => {
    if (!isPointerLocked) document.body.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body;
});

document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        rotation.y -= event.movementX * 0.002;
        rotation.x -= event.movementY * 0.002;
        rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
    }
});

function updateCamera(delta) {
    const speed = controls.sprint ? 10 : 5;
    let direction = new THREE.Vector3();
    direction.z = Number(controls.moveForward) - Number(controls.moveBackward);
    direction.x = Number(controls.moveRight) - Number(controls.moveLeft);
    direction.normalize();
    camera.rotation.order = 'YXZ';
    camera.rotation.y = rotation.y;
    camera.rotation.x = rotation.x;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();
    camera.position.addScaledVector(forward, direction.z * speed * delta);
    camera.position.addScaledVector(right, direction.x * speed * delta);
    if (camera.position.y < 2) camera.position.y = 2;
}

const clouds = [];

function createClouds() {
    const cloudAgents = [
        { name: 'Code', color: 0x00f2ff },
        { name: 'Design', color: 0x7b2ff7 },
        { name: 'Security', color: 0xff006e },
        { name: 'Performance', color: 0xffbe0b }
    ];
    cloudAgents.forEach((agent, index) => {
        const cloudGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 16, 16);
            const material = new THREE.MeshStandardMaterial({ color: agent.color, transparent: true, opacity: 0.6 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 1.5);
            cloudGroup.add(sphere);
        }
        const angle = (index / cloudAgents.length) * Math.PI * 2;
        cloudGroup.position.set(Math.cos(angle) * 30, 8 + index * 2, Math.sin(angle) * 30);
        scene.add(cloudGroup);
        clouds.push(cloudGroup);
    });
}

let walletConnected = false;
let userAccount = null;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            walletConnected = true;
            const btn = document.getElementById('connectWallet');
            if (btn) btn.textContent = userAccount.substring(0, 6) + '...' + userAccount.substring(38);
            console.log('Wallet connected:', userAccount);
        } catch (error) {
            console.error('Wallet connection failed:', error);
        }
    } else {
        alert('Please install MetaMask!');
    }
}

function openPayment(tier, amount) {
    if (!walletConnected) {
        alert('Please connect MetaMask first!');
        return;
    }
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function processPayment() {
    alert('Payment processing (demo mode)');
    closeModal();
}

function saveSubscription(tier) {
    localStorage.setItem('subscription', tier);
}

function checkSubscriptions() {
    return localStorage.getItem('subscription');
}

function launchAR() {
    const arView = document.getElementById('arView');
    if (arView) arView.style.display = 'block';
}

function exitAR() {
    const arView = document.getElementById('arView');
    if (arView) arView.style.display = 'none';
}

function launchVR() {
    const vrView = document.getElementById('vrView');
    if (vrView) vrView.style.display = 'block';
}

function exitVR() {
    const vrView = document.getElementById('vrView');
    if (vrView) vrView.style.display = 'none';
}

function toggleNeural() {
    const panel = document.getElementById('neuralPanel');
    if (panel) panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function closeNeural() {
    const panel = document.getElementById('neuralPanel');
    if (panel) panel.style.display = 'none';
}

function startBrainwave() {
    console.log('Brainwave animation started');
}

function toggleUI() {
    const panel = document.getElementById('uiPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }, 2000);
    }
}

function updateStatusPanel() {
    console.log('Status panel updated');
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    updateCamera(delta);
    renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', () => {
    generateGarden();
    createClouds();
    animate();
    hideLoadingScreen();
    const connectBtn = document.getElementById('connectWallet');
    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});