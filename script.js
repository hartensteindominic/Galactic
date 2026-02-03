// AI Agent Clouds in Galactic

const scene = new THREE.Scene();
const particles = [];

// Create AI agent types
const agents = [
    { type: 'Design Agent', color: 'blue', task: 'Optimizing chunk loading...' },
    { type: 'Performance Agent', color: 'purple', task: 'Enhancing graphics...' },
    { type: 'Feature Agent', color: 'pink', task: 'Adding new features...' }
];

// Function to create clouds
function createCloud(agent) {
    const cloudGeometry = new THREE.SphereGeometry(1, 32, 32);
    const cloudMaterial = new THREE.MeshBasicMaterial({ color: agent.color, transparent: true, opacity: 0.7 });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);

    // Positioning and floating effect
    cloudMesh.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5);
    cloudMesh.rotationSpeed = Math.random() * 0.01;
    scene.add(cloudMesh);

    // Add glowing particles
    for (let i = 0; i < 100; i++) {
        const particle = new THREE.Mesh(
            new THREE.CircleGeometry(0.05, 8),
            new THREE.MeshBasicMaterial({ color: agent.color, opacity: 0.8, transparent: true })
        );
        particle.position.set(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5);
        particles.push(particle);
        scene.add(particle);
    }
}

// Create clouds for each agent type
agents.forEach(createCloud);

// UI Panel for AI Agents
const uiPanel = document.createElement('div');
uiPanel.style.position = 'fixed';
uiPanel.style.top = '10px';
uiPanel.style.right = '10px';
uiPanel.style.background = 'rgba(0, 0, 0, 0.7)';
uiPanel.style.color = 'white';
uiPanel.style.padding = '10px';
uiPanel.style.borderRadius = '5px';
document.body.appendChild(uiPanel);

function updateUIPanel() {
    uiPanel.innerHTML = '<h3>AI Agents Status:</h3>';
    agents.forEach(agent => {
        uiPanel.innerHTML += `<p>${agent.task}</p>`;
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    particles.forEach(particle => {
        particle.rotation.x += 0.01;
        particle.rotation.y += 0.01;
    });
    updateUIPanel();
    scene.children.forEach(cloud => {
        if (cloud.rotationSpeed) {
            cloud.rotation.y += cloud.rotationSpeed;
        }
    });
}

animate();