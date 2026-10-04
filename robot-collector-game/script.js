const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");

const world = {
  width: canvas.width,
  height: canvas.height,
  groundY: 420
};

const keys = {
  left: false,
  right: false,
  jump: false
};

let score = 0;
let won = false;
let gameOver = false;

const player = {
  x: 140,
  y: world.groundY - 110,
  width: 52,
  height: 110,
  vx: 0,
  vy: 0,
  speed: 5.2,
  jumpPower: 13.5,
  onGround: true,
  dir: 1,
  bob: 0
};

const coins = [
  { x: 280, y: 330, r: 18, collected: false },
  { x: 510, y: 270, r: 18, collected: false },
  { x: 760, y: 230, r: 18, collected: false }
];

const enemies = [
  { x: 400, y: world.groundY - 55, width: 50, height: 55, minX: 330, maxX: 620, speed: 2.2, dir: 1 },
  { x: 680, y: world.groundY - 55, width: 50, height: 55, minX: 620, maxX: 860, speed: 2.5, dir: -1 }
];

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#9adbff");
  sky.addColorStop(1, "#dff4ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(120 + i * 110, 80 + (i % 2) * 30, 26, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGround() {
  const groundGrad = ctx.createLinearGradient(0, world.groundY, 0, canvas.height);
  groundGrad.addColorStop(0, "#7dbb71");
  groundGrad.addColorStop(1, "#4d7b4f");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, world.groundY, canvas.width, canvas.height - world.groundY);

  ctx.fillStyle = "#4c6d3f";
  ctx.fillRect(0, world.groundY, canvas.width, 10);

  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#5c8e56" : "#537f50";
    ctx.fillRect(i * 60, world.groundY + 12, 60, 16);
  }
}

function drawRobot() {
  const { x, y, width, height, bob } = player;
  const bodyX = x;
  const bodyY = y + bob;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(bodyX + width / 2, world.groundY + 10, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8dd0ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bodyX + width / 2, bodyY - 8);
  ctx.lineTo(bodyX + width / 2, bodyY - 28);
  ctx.stroke();

  ctx.fillStyle = "#ffd54d";
  ctx.beginPath();
  ctx.arc(bodyX + width / 2, bodyY - 31, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d7ebff";
  ctx.fillRect(bodyX + 8, bodyY, width - 16, 32);

  ctx.fillStyle = "#3e7ef5";
  ctx.fillRect(bodyX + 12, bodyY + 8, width - 24, 14);

  ctx.fillStyle = "#111";
  ctx.fillRect(bodyX + 14, bodyY + 12, 7, 7);
  ctx.fillRect(bodyX + width - 21, bodyY + 12, 7, 7);

  ctx.fillStyle = "#2d6cdf";
  ctx.fillRect(bodyX, bodyY + 32, width, height - 32);

  ctx.fillStyle = "#8ef0ff";
  ctx.fillRect(bodyX + 18, bodyY + 52, width - 36, 20);

  ctx.fillStyle = "#2d6cdf";
  ctx.fillRect(bodyX - 9, bodyY + 42, 10, 46);
  ctx.fillRect(bodyX + width - 1, bodyY + 42, 10, 46);

  ctx.fillStyle = "#b4d8ff";
  ctx.fillRect(bodyX - 12, bodyY + 84, 14, 10);
  ctx.fillRect(bodyX + width - 2, bodyY + 84, 14, 10);

  ctx.fillStyle = "#1d2d5b";
  ctx.fillRect(bodyX + 12, bodyY + height - 10, 12, 34);
  ctx.fillRect(bodyX + width - 24, bodyY + height - 10, 12, 34);

  ctx.fillStyle = "#14203a";
  ctx.fillRect(bodyX + 8, bodyY + height + 20, 20, 8);
  ctx.fillRect(bodyX + width - 28, bodyY + height + 20, 20, 8);
}

function drawCoin(coin) {
  if (coin.collected) return;

  const pulse = Math.sin(performance.now() / 180) * 3;

  ctx.save();
  ctx.translate(coin.x, coin.y + pulse);
  ctx.rotate(performance.now() / 220);

  ctx.fillStyle = "#ffd54d";
  ctx.beginPath();
  ctx.arc(0, 0, coin.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d59a00";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, coin.r - 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#fff6bc";
  ctx.fillRect(-2, -10, 4, 20);

  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.fillStyle = "#d64545";
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  ctx.fillStyle = "#ff9a9a";
  ctx.fillRect(enemy.x + 10, enemy.y + 12, enemy.width - 20, 12);

  ctx.fillStyle = "#111";
  ctx.fillRect(enemy.x + 12, enemy.y + 18, 7, 7);
  ctx.fillRect(enemy.x + enemy.width - 19, enemy.y + 18, 7, 7);
}

function drawWinText() {
  if (!won) return;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(250, 180, 460, 160);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.textAlign = "center";
  ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);

  ctx.font = "bold 24px Arial";
  ctx.fillText("All coins collected!", canvas.width / 2, canvas.height / 2 + 40);
}

function drawGameOverText() {
  if (!gameOver) return;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(200, 180, 560, 160);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

  ctx.font = "bold 24px Arial";
  ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 40);
}

function updateHud() {
  hud.textContent = `Score: ${score}`;
}

function handleInput() {
  if (keys.left) {
    player.vx = -player.speed;
    player.dir = -1;
  } else if (keys.right) {
    player.vx = player.speed;
    player.dir = 1;
  } else {
    player.vx = 0;
  }

  if (keys.jump && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
  }
}

function applyPhysics() {
  player.vy += 0.6;
  player.x += player.vx;
  player.y += player.vy;

  if (player.y + player.height >= world.groundY) {
    player.y = world.groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

function updateEnemies() {
  for (const enemy of enemies) {
    enemy.x += enemy.speed * enemy.dir;

    if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
      enemy.dir *= -1;
    }
  }
}

function checkCoinCollection() {
  for (const coin of coins) {
    if (coin.collected) continue;

    const dx = player.x + player.width / 2 - coin.x;
    const dy = player.y + player.height / 2 - coin.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 36) {
      coin.collected = true;
      score += 1;
      updateHud();

      if (score >= coins.length) {
        won = true;
      }
    }
  }
}

function checkEnemyCollision() {
  for (const enemy of enemies) {
    const pLeft = player.x;
    const pRight = player.x + player.width;
    const pTop = player.y;
    const pBottom = player.y + player.height;

    const eLeft = enemy.x;
    const eRight = enemy.x + enemy.width;
    const eTop = enemy.y;
    const eBottom = enemy.y + enemy.height;

    const hit =
      pRight > eLeft &&
      pLeft < eRight &&
      pBottom > eTop &&
      pTop < eBottom;

    if (hit) {
      gameOver = true;
    }
  }
}

function resetGame() {
  score = 0;
  won = false;
  gameOver = false;

  player.x = 140;
  player.y = world.groundY - 110;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;

  for (const coin of coins) coin.collected = false;
  for (const enemy of enemies) {
    enemy.dir = enemy.dir > 0 ? 1 : -1;
  }

  updateHud();
}

function animate() {
  if (!gameOver && !won) {
    handleInput();
    applyPhysics();
    updateEnemies();
    checkCoinCollection();
    checkEnemyCollision();
  }

  player.bob = Math.sin(performance.now() / 180) * 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGround();

  for (const coin of coins) {
    drawCoin(coin);
  }

  for (const enemy of enemies) {
    drawEnemy(enemy);
  }

  drawRobot();
  drawWinText();
  drawGameOverText();

  requestAnimationFrame(animate);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") keys.left = true;
  if (key === "arrowright" || key === "d") keys.right = true;
  if (key === "arrowup" || key === " " || key === "w") keys.jump = true;

  if (key === "r" && (gameOver || won)) {
    resetGame();
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") keys.left = false;
  if (key === "arrowright" || key === "d") keys.right = false;
  if (key === "arrowup" || key === " " || key === "w") keys.jump = false;
});

updateHud();
requestAnimationFrame(animate);
