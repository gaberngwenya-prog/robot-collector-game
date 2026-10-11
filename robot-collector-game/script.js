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
let jumpCount = 0;

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
    cost: 0,
    ability: "shockwave"
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
    cost: 1000,
    ability: "heavySlam"
  },
  redRiot: {
    id: "redRiot",
    name: "Red Riot",
    type: "Defend",
    weapon: "Giant Axe",
    bodyColor: "#d64545",
    armorColor: "#d4af37",
    accentColor: "#ff9a9a",
    visorColor: "#ff6666",
    glowColor: "#ff4444",
    armColor: "#c23030",
    legColor: "#8b0000",
    speed: 5.0,
    jumpPower: 14.0,
    size: 1.15,
    damage: 50,
    cost: 1000,
    ability: "boomerangAxe",
    maxJumps: 3
  },
  ironCrusher: {
    id: "ironCrusher",
    name: "Iron Crusher",
    type: "Fighting",
    weapon: "Hammer Gauntlet",
    bodyColor: "#444444",
    armorColor: "#8b6914",
    accentColor: "#ffa500",
    visorColor: "#ffd700",
    glowColor: "#ff8c00",
    armColor: "#555555",
    legColor: "#2b2b2b",
    speed: 5.3,
    jumpPower: 14.0,
    size: 1.1,
    damage: 30,
    cost: 1000,
    ability: "shockwave"
  },
  emberFang: {
    id: "emberFang",
    name: "Ember Fang",
    type: "Fighting",
    weapon: "Flame Claw",
    bodyColor: "#cc0000",
    armorColor: "#1a1a1a",
    accentColor: "#ff6600",
    visorColor: "#ff8800",
    glowColor: "#ff6600",
    armColor: "#990000",
    legColor: "#330000",
    speed: 5.8,
    jumpPower: 14.8,
    size: 1.08,
    damage: 32,
    cost: 1000,
    ability: "flameBurst"
  },
  voltRavager: {
    id: "voltRavager",
    name: "Volt Ravager",
    type: "Fighting",
    weapon: "Lightning Fists",
    bodyColor: "#0066ff",
    armorColor: "#333333",
    accentColor: "#00ffff",
    visorColor: "#aaffff",
    glowColor: "#00ffff",
    armColor: "#0044cc",
    legColor: "#000066",
    speed: 6.1,
    jumpPower: 15.0,
    size: 1.09,
    damage: 28,
    cost: 1000,
    ability: "chainLightning"
  },
  graniteSentinel: {
    id: "graniteSentinel",
    name: "Granite Sentinel",
    type: "Defend",
    weapon: "Tower Shield + Shock Spear",
    bodyColor: "#808080",
    armorColor: "#daa520",
    accentColor: "#ffff00",
    visorColor: "#ffff99",
    glowColor: "#ffcc00",
    armColor: "#696969",
    legColor: "#404040",
    speed: 4.5,
    jumpPower: 13.2,
    size: 1.12,
    damage: 22,
    cost: 1000,
    ability: "defensiveBarrier"
  },
  bastionWarden: {
    id: "bastionWarden",
    name: "Bastion Warden",
    type: "Defend",
    weapon: "Drill Shield",
    bodyColor: "#2d5016",
    armorColor: "#2a2a2a",
    accentColor: "#00ff00",
    visorColor: "#66ff66",
    glowColor: "#00ff00",
    armColor: "#1a3d0f",
    legColor: "#0d1f08",
    speed: 4.7,
    jumpPower: 13.5,
    size: 1.11,
    damage: 24,
    cost: 1000,
    ability: "drillCharge"
  },
  tideWard: {
    id: "tideWard",
    name: "Tide Ward",
    type: "Defend",
    weapon: "Tidal Blade",
    bodyColor: "#003366",
    armorColor: "#c0c0c0",
    accentColor: "#66ffff",
    visorColor: "#99ffff",
    glowColor: "#00ffff",
    armColor: "#001144",
    legColor: "#000033",
    speed: 5.0,
    jumpPower: 13.8,
    size: 1.1,
    damage: 23,
    cost: 1000,
    ability: "tidalWave"
  },
  skyReaper: {
    id: "skyReaper",
    name: "Sky Reaper",
    type: "Flying",
    weapon: "Twin Swords + Wing Blades",
    bodyColor: "#1a1a1a",
    armorColor: "#c0c0c0",
    accentColor: "#ffffff",
    visorColor: "#ffffff",
    glowColor: "#9900ff",
    armColor: "#333333",
    legColor: "#0a0a0a",
    speed: 6.7,
    jumpPower: 15.4,
    size: 1.08,
    damage: 27,
    cost: 1000,
    ability: "aerialDive"
  },
  mirageStriker: {
    id: "mirageStriker",
    name: "Mirage Striker",
    type: "Flying",
    weapon: "Plasma Daggers",
    bodyColor: "#4d0066",
    armorColor: "#333333",
    accentColor: "#ff00ff",
    visorColor: "#ff99ff",
    glowColor: "#ff00ff",
    armColor: "#330044",
    legColor: "#1a0033",
    speed: 6.9,
    jumpPower: 15.8,
    size: 1.09,
    damage: 29,
    cost: 1000,
    ability: "teleportSlash"
  },
  novaTether: {
    id: "novaTether",
    name: "Nova Tether",
    type: "Flying",
    weapon: "Laser Harpoon",
    bodyColor: "#00ccff",
    armorColor: "#ffffff",
    accentColor: "#99ffff",
    visorColor: "#ccffff",
    glowColor: "#00ffff",
    armColor: "#0099cc",
    legColor: "#003366",
    speed: 6.5,
    jumpPower: 15.2,
    size: 1.08,
    damage: 26,
    cost: 1000,
    ability: "harpoonPull"
  },
  starViper: {
    id: "starViper",
    name: "Star Viper",
    type: "Flying",
    weapon: "Multi-shot Plasma Cannon",
    bodyColor: "#0a0a0a",
    armorColor: "#c0c0c0",
    accentColor: "#cccccc",
    visorColor: "#66ccff",
    glowColor: "#00ccff",
    armColor: "#1a1a1a",
    legColor: "#050505",
    speed: 6.8,
    jumpPower: 15.7,
    size: 1.1,
    damage: 31,
    cost: 1000,
    ability: "rapidBurst"
  },
  prismCore: {
    id: "prismCore",
    name: "Prism Core",
    type: "Flying",
    weapon: "Refraction Beam",
    bodyColor: "#ff69b4",
    armorColor: "#ff1493",
    accentColor: "#ffb6c1",
    visorColor: "#fff0f5",
    glowColor: "#ff1493",
    armColor: "#db7093",
    legColor: "#c71585",
    speed: 6.6,
    jumpPower: 15.3,
    size: 1.09,
    damage: 25,
    cost: 1000,
    ability: "prismShield"
  },
  inferno: {
    id: "inferno",
    name: "Inferno",
    type: "Fighting",
    weapon: "Magma Crusher",
    bodyColor: "#ff3300",
    armorColor: "#ff6600",
    accentColor: "#ffaa00",
    visorColor: "#ffff00",
    glowColor: "#ff4400",
    armColor: "#cc0000",
    legColor: "#660000",
    speed: 5.4,
    jumpPower: 14.2,
    size: 1.13,
    damage: 36,
    cost: 1000,
    ability: "magmaWave"
  },
  frostbyte: {
    id: "frostbyte",
    name: "Frostbyte",
    type: "Defend",
    weapon: "Ice Spear",
    bodyColor: "#00ccff",
    armorColor: "#66ffff",
    accentColor: "#99ffff",
    visorColor: "#ccffff",
    glowColor: "#00eeff",
    armColor: "#0099cc",
    legColor: "#003366",
    speed: 4.9,
    jumpPower: 13.7,
    size: 1.1,
    damage: 21,
    cost: 1000,
    ability: "frostFreeze"
  },
  shadowBlade: {
    id: "shadowBlade",
    name: "Shadow Blade",
    type: "Fighting",
    weapon: "Void Katana",
    bodyColor: "#0a0a0a",
    armorColor: "#1a1a1a",
    accentColor: "#333333",
    visorColor: "#990033",
    glowColor: "#ff0066",
    armColor: "#0d0d0d",
    legColor: "#050505",
    speed: 6.2,
    jumpPower: 14.9,
    size: 1.07,
    damage: 35,
    cost: 1000,
    ability: "shadowStrike"
  },
  ironclad: {
    id: "ironclad",
    name: "Ironclad",
    type: "Defend",
    weapon: "Fortress Fists",
    bodyColor: "#333333",
    armorColor: "#696969",
    accentColor: "#a9a9a9",
    visorColor: "#d3d3d3",
    glowColor: "#888888",
    armColor: "#505050",
    legColor: "#1a1a1a",
    speed: 4.6,
    jumpPower: 13.4,
    size: 1.14,
    damage: 28,
    cost: 1000,
    ability: "ironSkin"
  },
  swiftwind: {
    id: "swiftwind",
    name: "Swiftwind",
    type: "Flying",
    weapon: "Gale Cutters",
    bodyColor: "#87ceeb",
    armorColor: "#4169e1",
    accentColor: "#e0ffff",
    visorColor: "#b0e0e6",
    glowColor: "#87ceeb",
    armColor: "#1e90ff",
    legColor: "#191970",
    speed: 7.1,
    jumpPower: 15.9,
    size: 1.06,
    damage: 24,
    cost: 1000,
    ability: "windBurst"
  },
  photonSlash: {
    id: "photonSlash",
    name: "Photon Slash",
    type: "Flying",
    weapon: "Light Sabers",
    bodyColor: "#ffff00",
    armorColor: "#ffd700",
    accentColor: "#ffff99",
    visorColor: "#fffacd",
    glowColor: "#ffff00",
    armColor: "#ffcc00",
    legColor: "#cc9900",
    speed: 6.9,
    jumpPower: 15.6,
    size: 1.08,
    damage: 30,
    cost: 1000,
    ability: "lightWave"
  },
  geomancer: {
    id: "geomancer",
    name: "Geomancer",
    type: "Defend",
    weapon: "Stone Pillar",
    bodyColor: "#8b4513",
    armorColor: "#daa520",
    accentColor: "#d2b48c",
    visorColor: "#f5deb3",
    glowColor: "#cd853f",
    armColor: "#704214",
    legColor: "#3e2723",
    speed: 4.8,
    jumpPower: 13.6,
    size: 1.12,
    damage: 26,
    cost: 1000,
    ability: "earthwall"
  },
  nexus: {
    id: "nexus",
    name: "Nexus",
    type: "Fighting",
    weapon: "Plasma Blade",
    bodyColor: "#1a1a4d",
    armorColor: "#00ff00",
    accentColor: "#00ffff",
    visorColor: "#00ff00",
    glowColor: "#00ff00",
    armColor: "#006600",
    legColor: "#003300",
    speed: 5.9,
    jumpPower: 14.6,
    size: 1.1,
    damage: 33,
    cost: 1000,
    ability: "plasmaOverload"
  },
  titanForge: {
    id: "titanForge",
    name: "Titan Forge",
    type: "Defend",
    weapon: "Molten Hammer",
    bodyColor: "#cc6600",
    armorColor: "#ff9900",
    accentColor: "#ffaa00",
    visorColor: "#ffcc00",
    glowColor: "#ff6600",
    armColor: "#993300",
    legColor: "#663300",
    speed: 4.7,
    jumpPower: 13.3,
    size: 1.16,
    damage: 27,
    cost: 1000,
    ability: "moltenShield"
  }
};

const rarityAssignments = {
  default: "Common",
  vanta: "Rare",
  redRiot: "Rare",
  ironCrusher: "Rare",
  emberFang: "Rare",
  voltRavager: "Rare",
  graniteSentinel: "Rare",
  bastionWarden: "Rare",
  tideWard: "Common",
  skyReaper: "Rare",
  mirageStriker: "Rare",
  novaTether: "Rare",
  starViper: "Rare",
  prismCore: "Epic",
  inferno: "Epic",
  frostbyte: "Rare",
  shadowBlade: "Rare",
  ironclad: "Rare",
  swiftwind: "Epic",
  photonSlash: "Epic",
  geomancer: "Rare",
  nexus: "Rare",
  titanForge: "Epic"
};

Object.values(robotCatalog).forEach((robot) => {
  robot.rarity = rarityAssignments[robot.id] || "Common";
});

const extraRobots = {
  frostbiteFang: {
    id: "frostbiteFang",
    name: "Frostbite Fang",
    type: "Defend",
    weapon: "Ice Breaker Axe",
    bodyColor: "#bfeaff",
    armorColor: "#dfeef5",
    accentColor: "#7dd3fc",
    visorColor: "#e0f2fe",
    glowColor: "#38bdf8",
    armColor: "#bae6fd",
    legColor: "#0f172a",
    speed: 4.8,
    jumpPower: 13.7,
    size: 1.12,
    damage: 23,
    cost: 1000,
    ability: "iceBurst",
    rarity: "Rare"
  },
  crimsonViper: {
    id: "crimsonViper",
    name: "Crimson Viper",
    type: "Fighting",
    weapon: "Twin Serrated Blades",
    bodyColor: "#8b0000",
    armorColor: "#7c2d12",
    accentColor: "#fca5a5",
    visorColor: "#fecaca",
    glowColor: "#f87171",
    armColor: "#991b1b",
    legColor: "#450a0a",
    speed: 6.2,
    jumpPower: 14.9,
    size: 1.09,
    damage: 35,
    cost: 1000,
    ability: "dashSlash",
    rarity: "Rare"
  },
  solArc: {
    id: "solArc",
    name: "Sol Arc",
    type: "Flying",
    weapon: "Solar Lance",
    bodyColor: "#facc15",
    armorColor: "#d97706",
    accentColor: "#fef3c7",
    visorColor: "#fef9c3",
    glowColor: "#fbbf24",
    armColor: "#f59e0b",
    legColor: "#78350f",
    speed: 6.6,
    jumpPower: 15.3,
    size: 1.08,
    damage: 29,
    cost: 1000,
    ability: "solarBeam",
    rarity: "Epic"
  },
  cinderPulse: {
    id: "cinderPulse",
    name: "Cinder Pulse",
    type: "Fighting",
    weapon: "Flame Drill",
    bodyColor: "#1f2937",
    armorColor: "#f97316",
    accentColor: "#fdba74",
    visorColor: "#fed7aa",
    glowColor: "#fb923c",
    armColor: "#ea580c",
    legColor: "#431407",
    speed: 5.7,
    jumpPower: 14.4,
    size: 1.12,
    damage: 33,
    cost: 1000,
    ability: "burningDrill",
    rarity: "Epic"
  },
  atlasPrime: {
    id: "atlasPrime",
    name: "Atlas Prime",
    type: "Defend",
    weapon: "Gravity Hammer",
    bodyColor: "#94a3b8",
    armorColor: "#b45309",
    accentColor: "#fef3c7",
    visorColor: "#f8fafc",
    glowColor: "#e2e8f0",
    armColor: "#64748b",
    legColor: "#334155",
    speed: 4.4,
    jumpPower: 13.1,
    size: 1.14,
    damage: 27,
    cost: 1000,
    ability: "gravityPulse",
    rarity: "Rare"
  },
  neonHex: {
    id: "neonHex",
    name: "Neon Hex",
    type: "Flying",
    weapon: "Hex Shot Launcher",
    bodyColor: "#111827",
    armorColor: "#9d174d",
    accentColor: "#f9a8d4",
    visorColor: "#fbcfe8",
    glowColor: "#e879f9",
    armColor: "#7e22ce",
    legColor: "#1f2937",
    speed: 7.0,
    jumpPower: 16.0,
    size: 1.09,
    damage: 28,
    cost: 1000,
    ability: "hexRounds",
    rarity: "Epic"
  },
  tempestHowler: {
    id: "tempestHowler",
    name: "Tempest Howler",
    type: "Fighting",
    weapon: "Storm Claw",
    bodyColor: "#64748b",
    armorColor: "#334155",
    accentColor: "#bae6fd",
    visorColor: "#dbeafe",
    glowColor: "#38bdf8",
    armColor: "#475569",
    legColor: "#0f172a",
    speed: 6.4,
    jumpPower: 15.0,
    size: 1.08,
    damage: 31,
    cost: 1000,
    ability: "cycloneBlast",
    rarity: "Rare"
  },
  obsidianEcho: {
    id: "obsidianEcho",
    name: "Obsidian Echo",
    type: "Defend",
    weapon: "Echo Shield",
    bodyColor: "#0f172a",
    armorColor: "#4c1d95",
    accentColor: "#ddd6fe",
    visorColor: "#d8b4fe",
    glowColor: "#a78bfa",
    armColor: "#312e81",
    legColor: "#1e1b4b",
    speed: 4.9,
    jumpPower: 13.9,
    size: 1.1,
    damage: 21,
    cost: 1000,
    ability: "reflectShots",
    rarity: "Rare"
  },
  brimstoneGoliath: {
    id: "brimstoneGoliath",
    name: "Brimstone Goliath",
    type: "Fighting",
    weapon: "Molten Axe",
    bodyColor: "#7c2d12",
    armorColor: "#b45309",
    accentColor: "#fdba74",
    visorColor: "#fef3c7",
    glowColor: "#fb923c",
    armColor: "#9a4d15",
    legColor: "#431407",
    speed: 5.1,
    jumpPower: 14.1,
    size: 1.16,
    damage: 34,
    cost: 1000,
    ability: "fireSlam",
    rarity: "Rare"
  },
  zenithWisp: {
    id: "zenithWisp",
    name: "Zenith Wisp",
    type: "Flying",
    weapon: "Starburst Rifle",
    bodyColor: "#e2e8f0",
    armorColor: "#93c5fd",
    accentColor: "#dbeafe",
    visorColor: "#e0f2fe",
    glowColor: "#7dd3fc",
    armColor: "#60a5fa",
    legColor: "#1d4ed8",
    speed: 7.2,
    jumpPower: 16.2,
    size: 1.07,
    damage: 30,
    cost: 1000,
    ability: "starBurst",
    rarity: "Epic"
  }
};

Object.entries(extraRobots).forEach(([id, robot]) => {
  robotCatalog[id] = robot;
  robot.rarity = robot.rarity || "Common";
});

const getRarityColor = (rarity) => {
  switch (rarity) {
    case "Common": return "#7dd3fc";
    case "Rare": return "#a78bfa";
    case "Epic": return "#fbbf24";
    case "Legendary": return "#f97316";
    default: return "#e2e8f0";
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
  health: 100,
  maxHealth: 100,
  inAir: 0
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
  { x: 620, y: 250, r: 18, robotId: "redRiot", collected: false },
  { x: 820, y: 220, r: 18, robotId: "skyReaper", collected: false }
];

const enemies = [
  { x: 390, y: world.groundY - 55, width: 50, height: 55, minX: 330, maxX: 620, speed: 2.2, dir: 1, type: "basic", health: 20, maxHealth: 20 },
  { x: 700, y: world.groundY - 55, width: 50, height: 55, minX: 620, maxX: 860, speed: 2.5, dir: -1, type: "tank", health: 40, maxHealth: 40 }
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
  player.maxHealth = 100;
  player.health = player.maxHealth;
  jumpCount = 0;
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
      <span class="robot-rarity" style="color:${getRarityColor(robot.rarity)}; font-weight: bold; display: block; margin-bottom: 6px;">${robot.rarity}</span>
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

function drawHealthBar(x, y, health, maxHealth, width = 40, height = 6) {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(x - width / 2, y - height - 2, width, height);
  
  const healthPercent = Math.max(0, health / maxHealth);
  const healthColor = healthPercent > 0.5 ? "#00ff00" : healthPercent > 0.25 ? "#ffaa00" : "#ff0000";
  
  ctx.fillStyle = healthColor;
  ctx.fillRect(x - width / 2, y - height - 2, width * healthPercent, height);
  
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - width / 2, y - height - 2, width, height);
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
  if (enemy.type === "basic") {
    ctx.fillStyle = "#d64545";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    ctx.fillStyle = "#ff9a9a";
    ctx.fillRect(enemy.x + 10, enemy.y + 12, enemy.width - 20, 12);

    ctx.fillStyle = "#111";
    ctx.fillRect(enemy.x + 12, enemy.y + 18, 7, 7);
    ctx.fillRect(enemy.x + enemy.width - 19, enemy.y + 18, 7, 7);
  } else if (enemy.type === "tank") {
    ctx.fillStyle = "#8b3a3a";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    ctx.fillStyle = "#d9a67a";
    ctx.fillRect(enemy.x + 8, enemy.y + 10, enemy.width - 16, 14);

    ctx.fillStyle = "#111";
    ctx.fillRect(enemy.x + 10, enemy.y + 20, 8, 8);
    ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 20, 8, 8);

    ctx.fillStyle = "#a67c52";
    ctx.fillRect(enemy.x + 14, enemy.y + 32, 6, 20);
    ctx.fillRect(enemy.x + enemy.width - 20, enemy.y + 32, 6, 20);
  }

  drawHealthBar(enemy.x + enemy.width / 2, enemy.y - 10, enemy.health, enemy.maxHealth, 30, 4);
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

  drawHealthBar(boss.x + boss.width / 2, boss.y - 15, boss.health, boss.maxHealth, 60, 6);
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

  if (player.shield > 0) {
    ctx.strokeStyle = "rgba(160,255,255,0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(bodyX + width / 2, bodyY + height / 2, 52, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawHealthBar(bodyX + width / 2, bodyY - 25, player.health, player.maxHealth, 50, 5);
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

  if (player.shield > 0) {
    ctx.strokeStyle = "rgba(160,255,255,0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(bodyX + width / 2, bodyY + height / 2, 42, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawHealthBar(bodyX + width / 2, bodyY - 25, player.health, player.maxHealth, 50, 5);
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
  hud.textContent = `Score: ${score} • ${getSelectedRobot().name} • Health: ${Math.ceil(player.health)}/${player.maxHealth}`;
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
    jumpCount = 1;
  } else if (keys.jump && jumpCount > 0 && jumpCount < (getSelectedRobot().maxJumps || 1)) {
    player.vy = -player.jumpPower;
    jumpCount++;
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
    jumpCount = 0;
  } else {
    player.onGround = false;
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
          health: 250,
          maxHealth: 250,
          speed: 1.8,
          dir: -1,
          attackCooldown: 0,
          patternTimer: 0
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
        enemy.health -= 15;
        if (enemy.health <= 0) {
          score += 10;
          updateHud();
          enemy.x = -100;
        }
      } else {
        player.health = Math.max(0, player.health - 10);
        if (player.health <= 0) gameOver = true;
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
      player.health = Math.max(0, player.health - 5);
      if (player.health <= 0) gameOver = true;
    }
  }
}

function updateBoss() {
  if (!boss) return;

  boss.x += boss.speed * boss.dir;
  if (boss.x < 620 || boss.x + boss.width > canvas.width - 20) {
    boss.dir *= -1;
  }

  boss.patternTimer++;
  boss.attackCooldown = Math.max(0, boss.attackCooldown - 1);

  if (boss.attackCooldown <= 0) {
    const pattern = Math.floor(Math.random() * 3);
    
    if (pattern === 0) {
      boss.speed = 4.5;
      boss.attackCooldown = 180;
    } else if (pattern === 1) {
      const projectileDir = boss.x < player.x + player.width / 2 ? 1 : -1;
      projectiles.push({
        x: boss.x + boss.width / 2,
        y: boss.y + 30,
        r: 6,
        vx: projectileDir * 6,
        vy: 0,
        damage: 8,
        hit: false,
        isBossAttack: true
      });
      boss.attackCooldown = 120;
    } else {
      for (let i = -1; i <= 1; i++) {
        projectiles.push({
          x: boss.x + boss.width / 2 + i * 40,
          y: boss.y + boss.height,
          r: 10,
          vx: 0,
          vy: 3,
          damage: 15,
          hit: false,
          isBossAttack: true
        });
      }
      boss.attackCooldown = 140;
    }
  }

  for (const p of projectiles) {
    if (p.isBossAttack) continue;
    
    const dx = p.x - (boss.x + boss.width / 2);
    const dy = p.y - (boss.y + boss.height / 2);
    if (Math.abs(dx) < boss.width / 2 + p.r && Math.abs(dy) < boss.height / 2 + p.r) {
      boss.health -= p.damage;
      p.hit = true;
    }
  }

  for (const p of projectiles) {
    if (!p.isBossAttack) continue;
    
    const dx = p.x - (player.x + player.width / 2);
    const dy = p.y - (player.y + player.height / 2);
    if (Math.abs(dx) < player.width / 2 + p.r && Math.abs(dy) < player.height / 2 + p.r) {
      if (player.shield <= 0) {
        player.health = Math.max(0, player.health - p.damage);
        if (player.health <= 0) gameOver = true;
      }
      p.hit = true;
    }
  }

  projectiles = projectiles.filter((p) => !p.hit && p.x >= -50 && p.x <= canvas.width + 50 && p.y >= -50 && p.y <= canvas.height + 50);
  for (const p of projectiles) {
    p.x += p.vx;
    p.y += p.vy;
  }

  if (boss.health <= 0) {
    boss = null;
    won = true;
    setMessage("Boss defeated!");
    const randomRobots = ["vanta", "redRiot", "skyReaper", "ironCrusher", "emberFang"];
    const reward = randomRobots[Math.floor(Math.random() * randomRobots.length)];
    if (!ownedRobots.has(reward)) {
      ownedRobots.add(reward);
    }
  }

  updateHud();
}

function attack() {
  if (attackCooldown > 0 || gameOver || won) return;
  attackCooldown = 420;
  player.attackTimer = 18;

  const robot = getSelectedRobot();

  if (robot.ability === "boomerangAxe") {
    const projectile = {
      x: player.x + player.width / 2,
      y: player.y + 40,
      r: 12,
      vx: player.dir * 10,
      vy: 0,
      damage: robot.damage,
      hit: false,
      isBossAttack: false,
      isAxe: true,
      distTraveled: 0,
      maxDist: 200
    };
    projectiles.push(projectile);
    setMessage(`${robot.weapon}!`);
  } else if (robot.type === "Fighting") {
    const hitbox = {
      x: player.dir === 1 ? player.x + player.width : player.x - 70,
      y: player.y + 30,
      width: 70,
      height: 50
    };

    for (const enemy of enemies) {
      if (enemy.x < 0) continue;
      const hit =
        hitbox.x < enemy.x + enemy.width &&
        hitbox.x + hitbox.width > enemy.x &&
        hitbox.y < enemy.y + enemy.height &&
        hitbox.y + hitbox.height > enemy.y;
      if (hit) {
        enemy.health -= robot.damage;
        if (enemy.health <= 0) {
          score += 10;
          updateHud();
          enemy.x = -100;
        }
      }
    }

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
  } else if (robot.type === "Defend") {
    player.shield = 1.5;
    setMessage(`${robot.name} shield raised!`);
  } else if (robot.type === "Flying") {
    for (let i = -1; i <= 1; i++) {
      projectiles.push({
        x: player.x + player.width / 2,
        y: player.y + 40,
        r: 8,
        vx: player.dir * 9 + i * 2,
        vy: i * 2,
        damage: robot.damage,
        hit: false,
        isBossAttack: false
      });
    }
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
  player.health = player.maxHealth;
  jumpCount = 0;

  for (const coin of coins) coin.collected = false;
  for (const pickup of robotPickups) pickup.collected = false;
  for (const enemy of enemies) {
    enemy.x = enemy.minX + 20;
    enemy.dir = 1;
    enemy.health = enemy.maxHealth;
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
  for (const enemy of enemies) {
    if (enemy.x >= 0) drawEnemy(enemy);
  }
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
