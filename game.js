import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const root = document.getElementById('game-root');
const statsEl = document.getElementById('stats');
const msgEl = document.getElementById('message');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0f2e, 0.024);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 650);
camera.position.set(0, 2.5, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.appendChild(renderer.domElement);

const ambient = new THREE.AmbientLight(0x5874ff, 0.42);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0x9cc6ff, 1.2);
moon.position.set(15, 30, 12);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.near = 0.5;
moon.shadow.camera.far = 160;
moon.shadow.camera.left = -45;
moon.shadow.camera.right = 45;
moon.shadow.camera.top = 45;
moon.shadow.camera.bottom = -45;
scene.add(moon);

const back = new THREE.PointLight(0x6df6ff, 1.4, 52);
back.position.set(-10, 5, -8);
scene.add(back);

const floorMat = new THREE.MeshStandardMaterial({
  color: 0x1a2038,
  metalness: 0.2,
  roughness: 0.86,
  emissive: 0x101626,
  emissiveIntensity: 0.22
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(170, 170, 40, 40), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const rim = new THREE.Mesh(
  new THREE.TorusGeometry(20, 0.95, 18, 160),
  new THREE.MeshStandardMaterial({ color: 0x66d7ff, emissive: 0x3399ff, emissiveIntensity: 0.34, metalness: 0.7, roughness: 0.38 })
);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.16;
scene.add(rim);

const starsGeo = new THREE.BufferGeometry();
const starCount = 1400;
const starPoints = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  starPoints[i3] = (Math.random() - 0.5) * 560;
  starPoints[i3 + 1] = Math.random() * 240 + 20;
  starPoints[i3 + 2] = (Math.random() - 0.5) * 560;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(starPoints, 3));
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xb9d9ff, size: 0.85 }));
scene.add(stars);

const obstacles = [];
for (let i = 0; i < 55; i++) {
  const r = Math.random() > 0.55 ? 0.8 + Math.random() * 2.1 : 1.1 + Math.random() * 2.8;
  const h = 1.5 + Math.random() * 8;
  const rock = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.8, r, h, 7 + Math.floor(Math.random() * 6)),
    new THREE.MeshStandardMaterial({
      color: 0x24304c,
      roughness: 0.85,
      metalness: 0.2,
      emissive: 0x0a1224,
      emissiveIntensity: 0.2
    })
  );
  const theta = Math.random() * Math.PI * 2;
  const radius = 6 + Math.random() * 60;
  rock.position.set(Math.cos(theta) * radius, h / 2, Math.sin(theta) * radius);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
  obstacles.push({ pos: rock.position, radius: r + 1.25, height: h });
}

const player = {
  position: new THREE.Vector3(0, 1.45, 8),
  velocity: new THREE.Vector3(),
  yaw: Math.PI,
  pitch: -0.09,
  health: 100,
  energy: 100,
  score: 0,
  alive: true,
  shotCooldown: 0,
  dodgeCooldown: 0
};

const input = { w: false, a: false, s: false, d: false, sprint: false };
const raycaster = new THREE.Raycaster();
const bullets = [];
const enemyBolts = [];
const particles = [];
const aliens = [];

let wave = 1;
let killsInWave = 0;
let neededKills = 7;
let gameOver = false;
let pointerLocked = false;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const playerRadius = 0.85;
function collideWithObstacles(targetPosition) {
  for (const ob of obstacles) {
    if (Math.abs(targetPosition.y - ob.pos.y) > ob.height) continue;
    const dx = targetPosition.x - ob.pos.x;
    const dz = targetPosition.z - ob.pos.z;
    const dist = Math.hypot(dx, dz);
    const minDist = ob.radius + playerRadius;
    if (dist < minDist) {
      const push = (minDist - dist) + 0.001;
      targetPosition.x += (dx / (dist || 0.001)) * push;
      targetPosition.z += (dz / (dist || 0.001)) * push;
    }
  }
}

function makeAlien(position) {
  const color = new THREE.Color().setHSL(0.46 + Math.random() * 0.2, 0.9, 0.52);
  const g = new THREE.Group();

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1.02, 20, 14),
    new THREE.MeshStandardMaterial({
      color: 0x77ffc8,
      emissive: color,
      emissiveIntensity: 0.75,
      roughness: 0.3,
      metalness: 0.5
    })
  );
  shell.castShadow = true;

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 16, 12),
    new THREE.MeshBasicMaterial({ color })
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.12, 12, 42),
    new THREE.MeshStandardMaterial({ color: 0xadffe4, emissive: color, emissiveIntensity: 0.65 })
  );
  ring.rotation.x = Math.PI / 2;

  g.add(shell, core, ring);
  g.position.copy(position);
  scene.add(g);

  aliens.push({
    mesh: g,
    health: 45 + wave * 8,
    radius: 1.1,
    shootCooldown: 0.5 + Math.random() * 1.2,
    speed: 3 + Math.random() * 1.7 + wave * 0.15,
    bob: Math.random() * Math.PI * 2
  });
}

function spawnWave() {
  const amount = 5 + wave * 2;
  for (let i = 0; i < amount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 24 + Math.random() * 26 + wave * 1.7;
    const p = new THREE.Vector3(Math.cos(angle) * dist, 1.6 + Math.random() * 2.8, Math.sin(angle) * dist);
    makeAlien(p);
  }
  msgEl.innerHTML = `Wave ${wave} incoming`;
  setTimeout(() => {
    if (!gameOver) msgEl.innerHTML = '';
  }, 1300);
}

function addParticle(position, color, spread = 1.2, count = 12) {
  for (let i = 0; i < count; i++) {
    const vel = new THREE.Vector3((Math.random() - 0.5) * spread, Math.random() * spread, (Math.random() - 0.5) * spread);
    particles.push({
      pos: position.clone(),
      vel,
      life: 0.45 + Math.random() * 0.55,
      color
    });
  }
}

function shootPlayer() {
  if (!pointerLocked || gameOver || !player.alive || player.shotCooldown > 0) return;

  player.shotCooldown = 0.14;
  const dir = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    Math.cos(player.yaw) * Math.cos(player.pitch)
  ).normalize();

  const origin = player.position.clone().add(new THREE.Vector3(0, 0.1, 0));
  bullets.push({ pos: origin, vel: dir.multiplyScalar(65), life: 1.25, damage: 22 });
}

function fireEnemyBolt(fromPos) {
  const dir = player.position.clone().sub(fromPos).normalize();
  dir.y += (Math.random() - 0.5) * 0.08;
  enemyBolts.push({
    pos: fromPos.clone(),
    vel: dir.normalize().multiplyScalar(20 + wave),
    life: 2.2,
    damage: 9 + wave * 0.8
  });
}

function handleKeys(e, down) {
  switch (e.code) {
    case 'KeyW': input.w = down; break;
    case 'KeyA': input.a = down; break;
    case 'KeyS': input.s = down; break;
    case 'KeyD': input.d = down; break;
    case 'ShiftLeft':
    case 'ShiftRight': input.sprint = down; break;
    case 'Space':
      if (down && player.dodgeCooldown <= 0 && player.energy >= 15) {
        const dir = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
        player.velocity.addScaledVector(dir, 12);
        player.energy -= 15;
        player.dodgeCooldown = 1.2;
      }
      break;
    default:
      break;
  }
}

document.addEventListener('keydown', (e) => handleKeys(e, true));
document.addEventListener('keyup', (e) => handleKeys(e, false));

document.addEventListener('mousemove', (e) => {
  if (!pointerLocked) return;
  const s = 0.0022;
  player.yaw -= e.movementX * s;
  player.pitch -= e.movementY * s;
  player.pitch = clamp(player.pitch, -1.2, 1.2);
});

document.addEventListener('mousedown', () => {
  if (!pointerLocked) {
    renderer.domElement.requestPointerLock();
    return;
  }
  shootPlayer();
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
  if (!pointerLocked && !gameOver) {
    msgEl.innerHTML = 'Click to lock pointer and resume';
  } else if (!gameOver) {
    msgEl.innerHTML = '';
  }
});

function updatePlayer(dt) {
  if (!player.alive) return;

  const forward = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);

  const move = new THREE.Vector3();
  if (input.w) move.add(forward);
  if (input.s) move.sub(forward);
  if (input.a) move.sub(right);
  if (input.d) move.add(right);

  const moving = move.lengthSq() > 0;
  if (moving) move.normalize();

  const speed = input.sprint && player.energy > 0 ? 10.3 : 7.1;
  if (input.sprint && moving && player.energy > 0) {
    player.energy = Math.max(0, player.energy - dt * 17);
  } else {
    player.energy = Math.min(100, player.energy + dt * 11);
  }

  const accel = moving ? 39 : 20;
  const drag = moving ? 7 : 12;

  player.velocity.x += (move.x * speed - player.velocity.x) * Math.min(1, accel * dt);
  player.velocity.z += (move.z * speed - player.velocity.z) * Math.min(1, accel * dt);

  player.velocity.x *= Math.exp(-drag * dt);
  player.velocity.z *= Math.exp(-drag * dt);

  const next = player.position.clone().addScaledVector(player.velocity, dt);
  collideWithObstacles(next);
  next.y = 1.45;
  player.position.copy(next);

  player.shotCooldown = Math.max(0, player.shotCooldown - dt);
  player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
}

function updateAliens(dt, elapsed) {
  for (let i = aliens.length - 1; i >= 0; i--) {
    const a = aliens[i];
    const toPlayer = player.position.clone().sub(a.mesh.position);
    const dist = toPlayer.length();

    const desired = toPlayer.clone().normalize();
    if (dist > 8) {
      a.mesh.position.addScaledVector(desired, a.speed * dt);
    } else if (dist < 4.5) {
      a.mesh.position.addScaledVector(desired, -a.speed * 0.8 * dt);
    }

    a.bob += dt * (2.2 + a.speed * 0.2);
    a.mesh.position.y = 1.7 + Math.sin(a.bob) * 0.7;
    a.mesh.rotation.y += dt * 0.9;

    a.shootCooldown -= dt;
    if (a.shootCooldown <= 0 && dist < 30 && player.alive) {
      fireEnemyBolt(a.mesh.position.clone());
      a.shootCooldown = Math.max(0.35, 1.3 - wave * 0.06) + Math.random() * 0.9;
    }

    if (dist < a.radius + 0.8) {
      player.health -= dt * (8 + wave * 0.9);
      addParticle(player.position.clone(), 0xff5f7f, 0.9, 2);
    }

    if (a.health <= 0) {
      addParticle(a.mesh.position.clone(), 0x9cffed, 2.6, 26);
      scene.remove(a.mesh);
      aliens.splice(i, 1);
      player.score += 120 + wave * 15;
      killsInWave += 1;
    }
  }

  back.intensity = 1.2 + Math.sin(elapsed * 1.4) * 0.35;
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.pos.addScaledVector(b.vel, dt);
    b.life -= dt;

    for (const alien of aliens) {
      const hitDist = b.pos.distanceTo(alien.mesh.position);
      if (hitDist < alien.radius + 0.36) {
        alien.health -= b.damage;
        addParticle(b.pos.clone(), 0x8bfbff, 1.2, 8);
        b.life = 0;
        break;
      }
    }

    if (b.life <= 0) bullets.splice(i, 1);
  }

  for (let i = enemyBolts.length - 1; i >= 0; i--) {
    const bolt = enemyBolts[i];
    bolt.pos.addScaledVector(bolt.vel, dt);
    bolt.life -= dt;

    if (bolt.pos.distanceTo(player.position) < 1.1 && player.alive) {
      player.health -= bolt.damage;
      addParticle(player.position.clone(), 0xff6f97, 1.5, 12);
      bolt.life = 0;
    }

    if (bolt.life <= 0) enemyBolts.splice(i, 1);
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.vel.y -= 4.8 * dt;
    p.pos.addScaledVector(p.vel, dt);
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function updateCamera(dt) {
  const aimOffset = new THREE.Vector3(
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    Math.cos(player.yaw) * Math.cos(player.pitch)
  );
  const bobble = Math.sin(performance.now() * 0.008) * Math.min(0.13, player.velocity.length() * 0.01);

  const cameraPos = player.position.clone().add(new THREE.Vector3(0, 1.5 + bobble, 0));
  camera.position.lerp(cameraPos, Math.min(1, dt * 15));
  camera.lookAt(camera.position.clone().add(aimOffset));
}

const tracerGeo = new THREE.SphereGeometry(0.1, 8, 8);
const tracerMat = new THREE.MeshBasicMaterial({ color: 0x8ce8ff });
const boltGeo = new THREE.SphereGeometry(0.13, 8, 8);
const boltMat = new THREE.MeshBasicMaterial({ color: 0xff5a8f });
const sparkGeo = new THREE.SphereGeometry(0.07, 6, 6);

function drawTransientObjects() {
  const previous = scene.children.filter((c) => c.userData.transient);
  for (const item of previous) scene.remove(item);

  for (const b of bullets) {
    const m = new THREE.Mesh(tracerGeo, tracerMat);
    m.position.copy(b.pos);
    m.userData.transient = true;
    scene.add(m);
  }

  for (const e of enemyBolts) {
    const m = new THREE.Mesh(boltGeo, boltMat);
    m.position.copy(e.pos);
    m.userData.transient = true;
    scene.add(m);
  }

  for (const p of particles) {
    const m = new THREE.Mesh(
      sparkGeo,
      new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: clamp(p.life * 1.4, 0, 1) })
    );
    m.position.copy(p.pos);
    m.userData.transient = true;
    scene.add(m);
  }
}

function refreshHud() {
  const hp = clamp(Math.round(player.health), 0, 100);
  const energy = Math.round(player.energy);
  const aliensLeft = aliens.length;

  statsEl.innerHTML = [
    `Health: <b style="color:${hp < 30 ? '#ff7386' : '#b0f3ff'}">${hp}</b>`,
    `Energy: <b>${energy}</b>`,
    `Score: <b>${player.score}</b>`,
    `Wave: <b>${wave}</b>`,
    `Aliens Remaining: <b>${aliensLeft}</b>`
  ].join('<br/>');
}

function handleProgression() {
  if (aliens.length === 0 && !gameOver) {
    if (killsInWave >= neededKills) {
      wave += 1;
      killsInWave = 0;
      neededKills = 6 + wave * 2;
      player.health = clamp(player.health + 14, 0, 100);
      player.energy = clamp(player.energy + 20, 0, 100);
      spawnWave();
    } else {
      spawnWave();
    }
  }

  if (player.health <= 0 && !gameOver) {
    gameOver = true;
    player.alive = false;
    msgEl.innerHTML = `Defeat. Final Score: ${player.score}<br/>Reload page to fight again.`;
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let prev = performance.now();
spawnWave();
msgEl.innerHTML = 'Click to lock pointer and start';

function loop(now) {
  const dt = Math.min((now - prev) / 1000, 0.033);
  prev = now;

  updatePlayer(dt);
  updateAliens(dt, now * 0.001);
  updateBullets(dt);
  updateParticles(dt);
  updateCamera(dt);
  handleProgression();
  refreshHud();

  drawTransientObjects();
  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
