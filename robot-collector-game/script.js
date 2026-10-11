const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");
const transformPanel = document.getElementById("transform-panel");
const robotShop = document.getElementById("robot-shop");
const closeTransformBtn = document.getElementById("close-transform");

const world = {
  width: canvas.width,
  height: canvas.height,
  groundY: 420
};

const keys = {
  left: false,
  right: false,
  jump: false,
  attack: false
};

let score = 0;
let won = false;
let gameOver = false;
let boss = null;
let projectiles = [];
let message = "";
let messageTimer = 0;
let transformOpen = false;
let lastTime = 0;
let attackCooldown = 0;

const robotCatalog = {
  default: {
    id: "default",
    name: "Default Scout",
    type: "Fighting",
    weapon: "Pulse Blaster",
    bodyColor: "#2d6cdf",
    armorColor: "#1d3d7c",
    accentColor: "#8ef0ff",
    visorColor: "#d7ebff",
    glowColor: "#60d8ff",
    armColor: "#2d6cdf",
    legColor: "#1d2d5b",
    speed: 5.2,
    jumpPower: 13.5,
    size: 1,
    damage: 18,
    cost: 0
  },
  vanta: {
    id: "vanta",
    name: "Vanta Breaker",
    type: "Fighting",
    weapon: "Blade Gauntlet + Plasma Fist",
    bodyColor: "#05070b",
    armorColor: "#20262d",
    accentColor: "#b8c5d1",
    visorColor: "#d9faff",
    glowColor: "#60d8ff",
    armColor: "#454d57",
    legColor: "#141a1f",
    speed: 5.8,
    jumpPower: 14.5,
    size: 1.12,
    damage: 34,
    cost: 1000
  },
  aegis: {
    id: "aegis",
    name: "Aegis Guard",
    type: "Defend",
    weapon: "Shield Burst",
    bodyColor: "#2fc88f",
    armorColor: "#1d8f68",
    accentColor: "#d9fff0",
    visorColor: "#eaffff",
    glowColor: "#8ff0ce",
    armColor: "#1aa06c",
    legColor: "#123c33",
    speed: 4.8,
    jumpPower: 13.0,
    size: 1.06,
    damage: 20,
    cost: 1000
  },
  sky: {
    id: "sky",
    name: "Sky Lancer",
    type: "Flying",
    weapon: "Laser Lance",
    bodyColor: "#7b5cff",
    armorColor: "#4a3bb9",
    accentColor: "#d7d0ff",
    visorColor: "#e9ebff",
    glowColor: "#b9b3ff",
    armColor: "#5647d6",
    legColor: "#221c4a",
    speed: 6.4,
    jumpPower: 15.2,
    size: 1.08,
    damage: 26,
    cost: 1000
  }
};

const ownedRobots = new Set(["default"]);
let selectedRobotId = "default";

const player = {
  x: 140,
  y: world.groundY - 110,
  width: 52,
  height: 110,
  vx: 0,
  vy: 0,
  speed: robotCatalog.default.speed,
  jumpPower: robotCatalog.default.jumpPower,
  onGround: true,
  dir: 1,
  bob: 0,
  walkCycle: 0,
  attackTimer: 0,
  shield: 0,
  fuel: 0
};

const coins = [
  { x: 280, y: 330, r: 18, collected: false },
  { x: 510, y: 270, r: 18, collected: false },
  { x: 760, y: 230, r: 18, collected: false },
  { x: 140, y: 280, r: 18, collected: false },
  { x: 880, y: 300, r: 18, collected: false }
];

const robotPickups = [
  { x: 340, y: 300, r: 18, robotId: "vanta", collected: false },
  { x: 620, y: 250, r: 18, robotId: "aegis", collected: false },
  { x: 820, y: 220, r: 18, robotId: "sky", collected: false }
];

const enemies = [
  { x: 390, y: world.groundY - 55, width: 50, height: 55, minX: 330, maxX: 620, speed: 2.2, dir: 1 },
  { x: 700, y: world.groundY - 55, width: 50, height: 55, minX: 620, maxX: 860, speed: 2.5, dir: -1 }
];

function setMessage(text) {
  message = text;
  messageTimer = 140;
}

function getSelectedRobot() {
  return robotCatalog[selectedRobotId] || robotCatalog.default;
}

function updatePlayerStats() {
  const robot = getSelectedRobot();
  player.speed = robot.speed;
  player.jumpPower = robot.jumpPower;
  player.width = 52 * robot.size;
  player.height = 110 * robot.size;
}

function renderTransformMenu() {
  robotShop.innerHTML = "";
  Object.values(robotCatalog).forEach((robot) => {
    const unlocked = ownedRobots.has(robot.id);
    const card = document.createElement("div");
    card.className = "robot-card" + (robot.id === selectedRobotId ? " selected" : "");

    const actionLabel = !unlocked ? `Buy ${robot.cost}` : robot.id === selectedRobotId ? "Equipped" : "Equip";
    const buttonClass = !unlocked ? "buy" : robot.id === selectedRobotId ? "equipped" : "";

    card.innerHTML = `
      <div class="robot-preview">
        <div class="head" style="background:${robot.bodyColor};"></div>
        <div class="visor" style="background:${robot.visorColor};"></div>
        <div class="body" style="background:${robot.bodyColor};"></div>
        <div class="arm left" style="background:${robot.armColor};"></div>
        <div class="arm right" style="background:${robot.armColor};"></div>
        <div class="leg left" style="background:${robot.legColor};"></div>
        <div class="leg right" style="background:${robot.legColor};"></div>
      </div>
      <span class="robot-name">${robot.name}</span>
      <span class="robot-type">${robot.type}</span>
      <span class="robot-weapon">Weapon: ${robot.weapon}</span>
      <span class="robot-meta">Speed ${robot.speed} • Jump ${robot.jumpPower} • DMG ${robot.damage}</span>
      <button class="robot-btn ${buttonClass}">${actionLabel}</button>
    `;

    const button = card.querySelector("button");
    button.addEventListener("click", () => {
      if (!unlocked) {
        if (score >= robot.cost) {
          score -= robot.cost;
          ownedRobots.add(robot.id);
          setMessage(`${robot.name} unlocked!`);
          updateHud();
          renderTransformMenu();
        } else {
          setMessage("Not enough coins!");
        }
        return;
      }

      selectedRobotId = robot.id;
      updatePlayerStats();
      renderTransformMenu();
      closeTransformPanel();
      setMessage(`${robot.name} equipped!`);
    });

    robotShop.appendChild(card);
  });
}

function openTransformPanel() {
  transformOpen = true;
  transformPanel.classList.remove("hidden");
  renderTransformMenu();
}

function closeTransformPanel() {
  transformOpen = false;
  transformPanel.classList.add("hidden");
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#9adbff");
  sky.addColorStop(1, "#dff4ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
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

function drawPickup(item) {
  if (item.collected) return;
  const robot = robotCatalog[item.robotId];
  if (!robot) return;

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(Math.sin(performance.now() / 280) * 0.6);

  ctx.fillStyle = robot.bodyColor;
  ctx.fillRect(-16, -16, 32, 32);
  ctx.fillStyle = robot.visorColor;
  ctx.fillRect(-11, -6, 22, 9);
  ctx.restore();
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

function drawBoss() {
  if (!boss) return;

  ctx.fillStyle = "#8a1f2d";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

  ctx.fillStyle = "#ffb0b0";
  ctx.fillRect(boss.x + 18, boss.y + 14, boss.width - 36, 16);

  ctx.fillStyle = "#111";
  ctx.fillRect(boss.x + 18, boss.y + 36, 8, 8);
  ctx.fillRect(boss.x + boss.width - 26, boss.y + 36, 8, 8);

  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Boss ${boss.health}`, boss.x, boss.y - 10);
}

function drawProjectiles() {
  for (const p of projectiles) {
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMessage() {
  if (messageTimer <= 0) return;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(250, 30, 460, 50);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, 62);
}

function drawVantaBreakerBody(robot, x, y, width, height, walk, attack) {
  const bodyX = x;
  const bodyY = y;
  const shoulderLift = attack ? -10 : 0;
  const leftLegSwing = Math.sin(walk) * 10;
  const rightLegSwing = -Math.sin(walk) * 10;
  const leftArmSwing = Math.sin(walk + Math.PI) * 16 + (attack ? -24 : 0);
  const rightArmSwing = -Math.sin(walk) * 16 + (attack ? 14 : 0);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(bodyX + width / 2, world.groundY + 10, 40, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = robot.armorColor;
  ctx.fillRect(bodyX + 9, bodyY + 16, width - 18, 38);
  ctx.fillStyle = robot.bodyColor;
  ctx.fillRect(bodyX + 15, bodyY + 26, width - 30, 28);

  ctx.fillStyle = robot.accentColor;
  ctx.fillRect(bodyX + 18, bodyY + 52, width - 36, 16);

  ctx.fillStyle = robot.glowColor;
  ctx.fillRect(bodyX + 22, bodyY + 32, width - 44, 8);

  ctx.fillStyle = robot.armorColor;
  ctx.fillRect(bodyX + 6, bodyY + 18, 10, 36);
  ctx.fillRect(bodyX + width - 16, bodyY + 18, 10, 36);

  ctx.fillStyle = robot.bodyColor;
  ctx.fillRect(bodyX + 3, bodyY + 10, width - 6, 14);
  ctx.fillStyle = robot.visorColor;
  ctx.fillRect(bodyX + 14, bodyY + 15, width - 28, 12);

  ctx.fillStyle = "#111";
  ctx.fillRect(bodyX + 18, bodyY + 16, 5, 6);
  ctx.fillRect(bodyX + width - 23, bodyY + 16, 5, 6);

  ctx.fillStyle = robot.armorColor;
  ctx.fillRect(bodyX + 12, bodyY + 62, 12, 36 + leftArmSwing * 0.18);
  ctx.fillRect(bodyX + width - 24, bodyY + 62, 12, 36 + rightArmSwing * 0.18);

  ctx.fillStyle = robot.bodyColor;
  ctx.fillRect(bodyX + 14, bodyY + 65, 10, 18);
  ctx.fillRect(bodyX + width - 24, bodyY + 65, 10, 18);

  ctx.fillStyle = robot.armColor;
  ctx.fillRect(bodyX - 10, bodyY + 42 + shoulderLift, 12, 34);
  ctx.fillRect(bodyX + width - 2, bodyY + 42 + shoulderLift, 12, 34);

  ctx.fillStyle = robot.bodyColor;
  ctx.fillRect(bodyX + 2, bodyY + 76 + leftLegSwing, 14, 30);
  ctx.fillRect(bodyX + width - 16, bodyY + 76 - rightLegSwing, 14, 30);

  ctx.fillStyle = robot.armorColor;
  ctx.fillRect(bodyX + 7, bodyY + 102 + leftLegSwing * 0.4, 8, 18);
  ctx.fillRect(bodyX + width - 15, bodyY + 102 - rightLegSwing * 0.4, 8, 18);

  ctx.fillStyle = robot.glowColor;
  ctx.fillRect(bodyX + width - 18, bodyY + 34, 12, 16);
  ctx.fillRect(bodyX + 6, bodyY + 34, 12, 16);

  if (attack) {
    ctx.fillStyle = "rgba(96, 216, 255, 0.7)";
    ctx.fillRect(bodyX + width - 28, bodyY + 44, 28, 8);
    ctx.fillStyle = "#d9faff";
    ctx.fillRect(bodyX + width - 10, bodyY + 40, 22, 18);
  }
}

function drawRobot() {
  const robot = getSelectedRobot();
  const { x, y, width, height, bob, walkCycle, attackTimer } = player;

  if (robot.id === "vanta") {
    drawVantaBreakerBody(robot, x, y + bob, width, height, walkCycle, attackTimer > 0);
    return;
  }

  const bodyX = x;
  const bodyY = y + bob;
  const walk = walkCycle;
  const leftLegSwing = Math.sin(walk) * 10;
  const rightLegSwing = -Math.sin(walk) * 10;
  const leftArmSwing = Math.sin(walk + Math.PI) * 12;
  const rightArmSwing = -Math.sin(walk) * 12;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(bodyX + width / 2, world.groundY + 10, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = robot.armorColor;
  ctx.fillRect(bodyX + 10, bodyY + 12, width - 20, 26);
  ctx.fillStyle = robot.bodyColor;
  ctx.fillRect(bodyX + 16, bodyY + 18, width - 32, 28);

  ctx.fillStyle = robot.visorColor;
  ctx.fillRect(bodyX + 12, bodyY + 18, width - 24, 12);

  ctx.fillStyle = "#111";
  ctx.fillRect(bodyX + 18, bodyY + 20, 6, 6);
  ctx.fillRect(bodyX + width - 24, bodyY + 20, 6, 6);

  ctx.fillStyle = robot.accentColor;
  ctx.fillRect(bodyX + 18, bodyY + 52, width - 36, 16);

  ctx.fillStyle = robot.bodyColor;
  ctx.fillRect(bodyX + 8, bodyY + 46, 10, 28 + leftArmSwing * 0.5);
  ctx.fillRect(bodyX + width - 18, bodyY + 46, 10, 28 + rightArmSwing * 0.5);

  ctx.fillStyle = robot.armColor;
  ctx.fillRect(bodyX - 8, bodyY + 50, 10, 30);
  ctx.fillRect(bodyX + width - 2, bodyY + 50, 10, 30);

  ctx.fillStyle = robot.legColor;
  ctx.fillRect(bodyX + 12, bodyY + 76 + leftLegSwing, 12, 26);
  ctx.fillRect(bodyX + width - 24, bodyY + 76 - rightLegSwing, 12, 26);

  ctx.fillStyle = robot.glowColor;
  ctx.fillRect(bodyX + 10, bodyY + 34, width - 20, 8);
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
  ctx.fillText("Boss defeated!", canvas.width / 2, canvas.height / 2 + 40);
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
  hud.textContent = `Score: ${score} • ${getSelectedRobot().name}`;
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

  if (player.onGround && Math.abs(player.vx) > 0.2) {
    player.walkCycle += Math.abs(player.vx) * 0.08;
  } else if (player.onGround) {
    player.walkCycle += 0.08;
  }

  if (player.shield > 0) player.shield = Math.max(0, player.shield - 0.016);
  if (player.attackTimer > 0) player.attackTimer -= 1;
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

      if (score >= 100 && !boss) {
        boss = {
          x: 720,
          y: world.groundY - 110,
          width: 90,
          height: 110,
          health: 170,
          speed: 1.8,
          dir: -1
        };
        setMessage("Boss spawned! Defeat it!");
      }
    }
  }
}

function checkRobotPickupCollection() {
  for (const pickup of robotPickups) {
    if (pickup.collected) continue;
    const dx = player.x + player.width / 2 - pickup.x;
    const dy = player.y + player.height / 2 - pickup.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 42) {
      pickup.collected = true;
      ownedRobots.add(pickup.robotId);
      setMessage(`${robotCatalog[pickup.robotId].name} unlocked!`);
    }
  }
}

function checkEnemyCollision() {
  for (const enemy of enemies) {
    const hit =
      player.x + player.width > enemy.x &&
      player.x < enemy.x + enemy.width &&
      player.y + player.height > enemy.y &&
      player.y < enemy.y + enemy.height;

    if (hit) {
      if (player.shield > 0) {
        player.x = 140;
      } else {
        gameOver = true;
      }
    }
  }
}

function checkBossCollision() {
  if (!boss) return;
  const hit =
    player.x < boss.x + boss.width &&
    player.x + player.width > boss.x &&
    player.y < boss.y + boss.height &&
    player.y + player.height > boss.y;

  if (hit) {
    if (player.shield > 0) {
      player.x = 140;
    } else {
      gameOver = true;
    }
  }
}

function updateBoss() {
  if (!boss) return;

  boss.x += boss.speed * boss.dir;
  if (boss.x < 620 || boss.x + boss.width > canvas.width - 20) {
    boss.dir *= -1;
  }

  for (const p of projectiles) {
    const dx = p.x - (boss.x + boss.width / 2);
    const dy = p.y - (boss.y + boss.height / 2);
    if (Math.abs(dx) < boss.width / 2 + p.r && Math.abs(dy) < boss.height / 2 + p.r) {
      boss.health -= p.damage;
      p.hit = true;
    }
  }

  projectiles = projectiles.filter((p) => !p.hit && p.x >= 0 && p.x <= canvas.width && p.y >= 0 && p.y <= canvas.height);
  for (const p of projectiles) {
    p.x += p.vx;
    p.y += p.vy;
  }

  if (boss.health <= 0) {
    boss = null;
    won = true;
    setMessage("Boss defeated! You earned a new robot.");
    ownedRobots.add("vanta");
    selectedRobotId = "vanta";
    updatePlayerStats();
  }
}

function attack() {
  if (attackCooldown > 0 || gameOver || won) return;
  attackCooldown = 420;
  player.attackTimer = 18;

  const robot = getSelectedRobot();

  if (robot.type === "Fighting") {
    const hitbox = {
      x: player.dir === 1 ? player.x + player.width : player.x - 70,
      y: player.y + 30,
      width: 70,
      height: 50
    };

    if (boss) {
      const hit =
        hitbox.x < boss.x + boss.width &&
        hitbox.x + hitbox.width > boss.x &&
        hitbox.y < boss.y + boss.height &&
        hitbox.y + hitbox.height > boss.y;

      if (hit) {
        boss.health -= robot.damage;
        setMessage("Direct hit!");
      }
    }
  }

  if (robot.type === "Defend") {
    player.shield = 1.2;
    setMessage(`${robot.name} shield raised!`);

    if (boss) {
      const dist = Math.abs(player.x + player.width / 2 - (boss.x + boss.width / 2));
      if (dist < 120) boss.health -= robot.damage;
    }
  }

  if (robot.type === "Flying") {
    projectiles.push({
      x: player.x + player.width / 2,
      y: player.y + 40,
      r: 8,
      vx: player.dir * 9,
      vy: 0,
      damage: robot.damage,
      hit: false
    });
    setMessage(`${robot.weapon}!`);
  }
}

function resetGame() {
  score = 0;
  won = false;
  gameOver = false;
  boss = null;
  projectiles = [];

  player.x = 140;
  player.y = world.groundY - 110;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.attackTimer = 0;
  player.shield = 0;
  player.walkCycle = 0;

  for (const coin of coins) coin.collected = false;
  for (const pickup of robotPickups) pickup.collected = false;
  for (const enemy of enemies) {
    enemy.x = enemy.minX + 20;
    enemy.dir = 1;
  }

  updateHud();
}

function animate(timestamp) {
  const delta = timestamp - lastTime || 16;
  lastTime = timestamp;

  if (!gameOver && !won) {
    handleInput();
    applyPhysics();
    updateEnemies();
    checkCoinCollection();
    checkRobotPickupCollection();
    checkEnemyCollision();
    if (boss) {
      checkBossCollision();
      updateBoss();
    }
  }

  if (attackCooldown > 0) {
    attackCooldown -= delta;
  }

  if (messageTimer > 0) {
    messageTimer -= delta * 0.06;
  }

  player.bob = Math.sin(timestamp / 180) * 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGround();

  for (const pickup of robotPickups) drawPickup(pickup);
  for (const coin of coins) drawCoin(coin);
  for (const enemy of enemies) drawEnemy(enemy);
  drawProjectiles();
  drawBoss();
  drawRobot();
  drawWinText();
  drawGameOverText();
  drawMessage();

  requestAnimationFrame(animate);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") keys.left = true;
  if (key === "arrowright" || key === "d") keys.right = true;
  if (key === "arrowup" || key === "w" || key === " ") keys.jump = true;
  if (key === "f" || key === "j") attack();
  if (key === "t") {
    if (transformOpen) closeTransformPanel();
    else openTransformPanel();
  }
  if (key === "r" && (gameOver || won)) resetGame();
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowleft" || key === "a") keys.left = false;
  if (key === "arrowright" || key === "d") keys.right = false;
  if (key === "arrowup" || key === "w" || key === " ") keys.jump = false;
});

closeTransformBtn.addEventListener("click", closeTransformPanel);
updatePlayerStats();
updateHud();
renderTransformMenu();
requestAnimationFrame(animate);
