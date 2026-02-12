const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hud = {
  health: document.getElementById("health"),
  score: document.getElementById("score"),
  shards: document.getElementById("shards"),
  wave: document.getElementById("wave"),
  message: document.getElementById("message"),
};

const world = {
  width: canvas.width,
  height: canvas.height,
  stars: Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.4,
    speed: Math.random() * 0.35 + 0.12,
  })),
};

const keys = new Set();
const bullets = [];
const enemies = [];
const shards = [];

let score = 0;
let wave = 1;
let enemySpawnTimer = 0;
let shardSpawnTimer = 0;
let gameOver = false;

const player = {
  x: world.width / 2,
  y: world.height / 2,
  radius: 18,
  speed: 3.2,
  health: 100,
  direction: { x: 1, y: 0 },
  fireCooldown: 0,
  collectedShards: 0,
};

function setMessage(text) {
  hud.message.textContent = text;
}

function updateHud() {
  hud.health.textContent = Math.max(0, Math.round(player.health));
  hud.score.textContent = score;
  hud.shards.textContent = player.collectedShards;
  hud.wave.textContent = wave;
}

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4);
  const speedScale = 1 + wave * 0.08;
  let x = 0;
  let y = 0;

  if (edge === 0) {
    x = Math.random() * world.width;
    y = -20;
  } else if (edge === 1) {
    x = world.width + 20;
    y = Math.random() * world.height;
  } else if (edge === 2) {
    x = Math.random() * world.width;
    y = world.height + 20;
  } else {
    x = -20;
    y = Math.random() * world.height;
  }

  enemies.push({
    x,
    y,
    radius: 14,
    health: 32 + wave * 3,
    speed: (0.9 + Math.random() * 0.45) * speedScale,
    damage: 8,
    color: `hsl(${100 + Math.random() * 60}, 70%, 45%)`,
  });
}

function spawnShard() {
  shards.push({
    x: Math.random() * (world.width - 60) + 30,
    y: Math.random() * (world.height - 60) + 30,
    radius: 8,
    value: 10,
  });
}

function shoot() {
  if (player.fireCooldown > 0 || gameOver) {
    return;
  }

  const magnitude = Math.hypot(player.direction.x, player.direction.y) || 1;
  const dx = player.direction.x / magnitude;
  const dy = player.direction.y / magnitude;

  bullets.push({
    x: player.x + dx * player.radius,
    y: player.y + dy * player.radius,
    dx,
    dy,
    radius: 4,
    speed: 7,
    life: 60,
  });

  player.fireCooldown = 12;
}

function handleInput() {
  let vx = 0;
  let vy = 0;

  if (keys.has("ArrowUp") || keys.has("w")) vy -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) vy += 1;
  if (keys.has("ArrowLeft") || keys.has("a")) vx -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) vx += 1;

  if (vx !== 0 || vy !== 0) {
    const magnitude = Math.hypot(vx, vy);
    player.direction.x = vx / magnitude;
    player.direction.y = vy / magnitude;
    player.x += player.direction.x * player.speed;
    player.y += player.direction.y * player.speed;
  }

  player.x = Math.max(player.radius, Math.min(world.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(world.height - player.radius, player.y));

  if (keys.has(" ")) {
    shoot();
  }
}

function updateStars() {
  for (const star of world.stars) {
    star.y += star.speed;
    if (star.y > world.height + 3) {
      star.y = -2;
      star.x = Math.random() * world.width;
    }
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.x += bullet.dx * bullet.speed;
    bullet.y += bullet.dy * bullet.speed;
    bullet.life -= 1;

    if (
      bullet.life <= 0 ||
      bullet.x < -12 ||
      bullet.y < -12 ||
      bullet.x > world.width + 12 ||
      bullet.y > world.height + 12
    ) {
      bullets.splice(i, 1);
    }
  }
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;

    enemy.x += (dx / distance) * enemy.speed;
    enemy.y += (dy / distance) * enemy.speed;

    if (distance < enemy.radius + player.radius) {
      player.health -= 0.2 + enemy.damage * 0.005;
    }

    for (let j = bullets.length - 1; j >= 0; j -= 1) {
      const bullet = bullets[j];
      const hitDistance = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
      if (hitDistance < enemy.radius + bullet.radius) {
        enemy.health -= 18;
        bullets.splice(j, 1);

        if (enemy.health <= 0) {
          enemies.splice(i, 1);
          score += 25;
          if (Math.random() < 0.3) {
            spawnShard();
          }
          break;
        }
      }
    }
  }
}

function updateShards() {
  for (let i = shards.length - 1; i >= 0; i -= 1) {
    const shard = shards[i];
    const distance = Math.hypot(player.x - shard.x, player.y - shard.y);
    if (distance < player.radius + shard.radius) {
      shards.splice(i, 1);
      player.collectedShards += 1;
      score += shard.value;
      player.health = Math.min(100, player.health + 5);
      setMessage("Shard recovered! Alien tech boosts your suit integrity.");
    }
  }
}

function drawBackground() {
  ctx.fillStyle = "#04111a";
  ctx.fillRect(0, 0, world.width, world.height);

  for (const star of world.stars) {
    ctx.fillStyle = "rgba(180, 235, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  ctx.fillStyle = "#69e0ff";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#b7f3ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(
    player.x + player.direction.x * (player.radius + 12),
    player.y + player.direction.y * (player.radius + 12),
  );
  ctx.stroke();
}

function drawBullets() {
  ctx.fillStyle = "#ffd166";
  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#132417";
    ctx.beginPath();
    ctx.arc(enemy.x - 4, enemy.y - 2, 2.4, 0, Math.PI * 2);
    ctx.arc(enemy.x + 4, enemy.y - 2, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawShards() {
  for (const shard of shards) {
    ctx.save();
    ctx.translate(shard.x, shard.y);
    ctx.rotate(Date.now() * 0.003);
    ctx.fillStyle = "#9f93ff";
    ctx.beginPath();
    ctx.moveTo(0, -shard.radius);
    ctx.lineTo(shard.radius, 0);
    ctx.lineTo(0, shard.radius);
    ctx.lineTo(-shard.radius, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = "#ffe7e7";
  ctx.font = "bold 46px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("Mission Failed", world.width / 2, world.height / 2 - 10);
  ctx.font = "24px Segoe UI";
  ctx.fillText("Press R to redeploy", world.width / 2, world.height / 2 + 36);
}

function resetGame() {
  bullets.length = 0;
  enemies.length = 0;
  shards.length = 0;
  score = 0;
  wave = 1;
  enemySpawnTimer = 0;
  shardSpawnTimer = 0;
  gameOver = false;

  player.x = world.width / 2;
  player.y = world.height / 2;
  player.health = 100;
  player.collectedShards = 0;

  setMessage("Redeployed. Continue your alien frontier mission.");
  updateHud();
}

function tick() {
  handleInput();
  updateStars();
  updateBullets();
  updateEnemies();
  updateShards();

  if (player.fireCooldown > 0) {
    player.fireCooldown -= 1;
  }

  enemySpawnTimer += 1;
  shardSpawnTimer += 1;

  const spawnRate = Math.max(18, 65 - wave * 2);
  if (enemySpawnTimer >= spawnRate) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  if (shardSpawnTimer >= 450) {
    spawnShard();
    shardSpawnTimer = 0;
  }

  if (score > wave * 220) {
    wave += 1;
    setMessage(`Alien resistance intensifies. Wave ${wave} incoming!`);
  }

  if (player.health <= 0) {
    gameOver = true;
    setMessage("Your explorer has fallen. Press R to restart the battle.");
  }
}

function render() {
  drawBackground();
  drawShards();
  drawPlayer();
  drawBullets();
  drawEnemies();

  if (gameOver) {
    drawGameOver();
  }
}

function loop() {
  if (!gameOver) {
    tick();
  }

  render();
  updateHud();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);

  if (event.key === " ") {
    event.preventDefault();
  }

  if (key === "r" && gameOver) {
    resetGame();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

setMessage("Mission active. Search for shards and repel alien hunters.");
updateHud();
loop();
