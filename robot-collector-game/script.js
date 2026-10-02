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

const player = {
  x: 140,
  y: world.groundY - 110,
  width: 52,
  height: 110,
  vx: 0,
  vy: 0,
  speed: 4.5,
  jumpPower: 13,
  onGround: true,
  dir: 1,
  bob: 0
};

const coins = [
  { x: 300, y: 330, r: 18, collected: false },
  { x: 560, y: 290, r: 18, collected: false },
  { x: 780, y: 250, r: 18, collected: false }
];

function drawRobot() {
  const { x, y, width, height, dir, bob } = player;

  const bodyX = x;
  const bodyY = y + bob;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(bodyX - 5, world.groundY + 5, width + 10, 10);

  ctx.fillStyle = "#2d6cdf";
  ctx.fillRect(bodyX, bodyY + 18, width, height - 18);

  ctx.fillStyle = "#a7d0ff";
  ctx.fillRect(bodyX + 8, bodyY, width - 16, 30);

  ctx.fillStyle = "#111";
  ctx.fillRect(bodyX + 12, bodyY + 8, 8, 8);
  ctx.fillRect(bodyX + width - 20, bodyY + 8, 8, 8);

  ctx.fillStyle = "#3a7cff";
  ctx.fillRect(bodyX - 8, bodyY + 28, 10, 42);
  ctx.fillRect(bodyX + width - 2, bodyY + 28, 10, 42);

  ctx.fillStyle = "#1b2d5b";
  ctx.fillRect(bodyX + 12, bodyY + height - 10, 12, 36);
  ctx.fillRect(bodyX + width - 24, bodyY + height - 10, 12, 36);

  ctx.fillStyle = "#4a9cff";
  ctx.fillRect(bodyX + width / 2, bodyY - 14, 4, 18);
  ctx.fillStyle = "#ffdf4a";
  ctx.beginPath();
  ctx.arc(bodyX + width / 2, bodyY - 22, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = "#6d8f63";
  ctx.fillRect(0, world.groundY, canvas.width, canvas.height - world.groundY);

  ctx.fillStyle = "#4a6d4a";
  ctx.fillRect(0, world.groundY, canvas.width, 10);
}

function drawCoin(coin) {
  if (coin.collected) return;

  ctx.fillStyle = "#ffd84d";
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d9a800";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.r - 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#fff1a8";
  ctx.fillRect(coin.x - 2, coin.y - 10, 4, 20);
}

function drawWinText() {
  if (!won) return;

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(260, 190, 440, 120);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Arial";
  ctx.textAlign = "center";
  ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);
}

function updateHud() {
  hud.textContent = "Score: " + score;
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

function checkCoinCollection() {
  for (const coin of coins) {
    if (coin.collected) continue;

    const dx = (player.x + player.width / 2) - coin.x;
    const dy = (player.y + player.height / 2) - coin.y;
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

function animate() {
  handleInput();
  applyPhysics();
  checkCoinCollection();

  player.bob = Math.sin(performance.now() / 200) * 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();

  for (const coin of coins) {
    drawCoin(coin);
  }

  drawRobot();
  drawWinText();

  requestAnimationFrame(animate);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
  }
  if (event.key === "ArrowUp" || event.key === " " || event.key.toLowerCase() === "w") {
    keys.jump = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
  if (event.key === "ArrowUp" || event.key === " " || event.key.toLowerCase() === "w") {
    keys.jump = false;
  }
});

updateHud();
requestAnimationFrame(animate);
