console.log('✅ state.js загружен');

const state = {
    player: {
        x: 400,
        y: 300,
        radius: CONFIG.PLAYER_RADIUS,
        health: CONFIG.MAX_HEALTH,
        maxHealth: CONFIG.MAX_HEALTH,
        angle: 0,
        invincible: false,
        invincibleTimer: 0,
        isDashing: false,
        dashTimer: 0,
        dashDx: 0,
        dashDy: 0
    },
    difficulty: parseInt(localStorage.getItem('voidSplitterDifficulty')) || CONFIG.DEFAULT_DIFFICULTY,
    bullets: [],
    enemies: [],
    particles: [],
    strategems: {
        airstrike: { cooldown: 0, active: false },
        turret: { cooldown: 0, active: false, timer: 0, x: 0, y: 0, angle: 0, _shootTimer: 0 },
        rocket: { cooldown: 0, active: false, pickedUp: false, fired: false, timer: 0, x: 0, y: 0, angle: 0 },
        napalm: { cooldown: 0, active: false, timer: 0, x: 0, y: 0, radius: 120, tickTimer: 0 },
        machinegun: { cooldown: 0, active: false, pickedUp: false, fired: false, timer: 0, x: 0, y: 0, angle: 0, ammo: 0, _shootTimer: 0 }
    },
    wave: 1,
    kills: 0,
    crystals: 0,
    score: 0,
    combo: 1,
    comboTimer: 0,
    shootCooldown: 0,
    gameOver: false,
    levelComplete: false,
    isEvacuating: false,
    levelTime: 0,
    spawnTimer: null,
    enemiesSpawned: 0,
    totalEnemies: CONFIG.LEVEL_ENEMIES,
    // Выбранные стратегемы (загружаем из localStorage)
    selectedStrategems: []
};

const keys = { w: false, a: false, s: false, d: false, shift: false };
const mouse = { x: 400, y: 300, down: false };

window.state = state;
window.keys = keys;
window.mouse = mouse;

console.log('✅ state.js');