const CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    
    // === HOTLINE MIAMI ===
    MAX_HEALTH: 5,
    PLAYER_SPEED: 280,
    PLAYER_RADIUS: 12,
    DASH_SPEED: 800,
    DASH_DURATION: 0.15,
    
    BULLET_SPEED: 600,
    BULLET_DAMAGE: 50,
    BULLET_RADIUS: 4,
    BULLET_LIFE: 1.5,
    SHOOT_COOLDOWN: 0.08,
    
    // === УРОВЕНЬ ===
    LEVEL_ENEMIES: 10,
    
    // === ВРАГИ ===
    ENEMY_TYPES: ['scout', 'warrior', 'hunter'],
    ENEMY_BASE_HP: 1,
    ENEMY_BASE_SPEED: 140,
    ENEMY_BASE_RADIUS: 14,
    ENEMY_DAMAGE: 999,
    
    // === ВОЛНЫ ===
    WAVE_BASE_ENEMIES: 3,
    WAVE_ENEMIES_PER_WAVE: 2,
    WAVE_SPAWN_INTERVAL: 500,
    WAVE_DELAY: 1500,
    
    // === СТРАТЕГЕМЫ ===
    STRATEGEMS: {
        airstrike: { cooldown: 8, cost: 0 },
        shield: { cooldown: 4, cost: 0 },
        turret: { cooldown: 12, cost: 0 },
        medkit: { cooldown: 6, cost: 0 }
    },
    
    // === КОМБО ===
    COMBO_TIMEOUT: 2.0,
    
    // === ЧАСТИЦЫ ===
    PARTICLE_COUNT: 20,
    PARTICLE_SPEED: 300,
    
    // === ЦВЕТА ===
    COLORS: {
        player: '#00ddff',
        playerGlow: 'rgba(0, 221, 255, 0.3)',
        bullet: '#00ffff',
        bg: '#0a0a1a',
        ground: '#1a1a2e',
        road: '#2a2a4e'
    }
};

console.log('✅ config.js');