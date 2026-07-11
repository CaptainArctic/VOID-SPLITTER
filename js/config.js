const CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    
    // === СТАТЫ ===
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
    
    // === ВСЕ ДОСТУПНЫЕ СТРАТЕГЕМЫ ===
    ALL_STRATEGEMS: [
        { id: 'airstrike', name: 'Авиаудар', icon: '💥', cooldown: 8, unlocked: true, description: 'Мощный удар с орбиты' },
        { id: 'turret', name: 'Турель', icon: '🤖', cooldown: 12, unlocked: true, description: 'Автоматическая турель' },
        { id: 'rocket', name: 'Ракетница', icon: '🚀', cooldown: 15, unlocked: true, description: 'Мощный выстрел (одноразовая)'},
        { id: 'napalm', name: 'Напалм', icon: '🔥', cooldown: 10, unlocked: true, description: 'Взрыв + огонь по площади'},
        { id: 'machinegun', name: 'Пулемёт', icon: '⚡', cooldown: 12, unlocked: true, description: 'Быстрая стрельба (одноразовый)'}
    ],

    DEFAULT_STRATEGEMS: ['airstrike', 'turret', 'rocket', 'napalm'],

    STRATEGEMS: {
        airstrike: { cooldown: 8, damage: 999, radius: 150 },
        turret: { cooldown: 12, duration: 5 },
        napalm: { 
                cooldown: 10, 
                damage: 20,       // Урон за тик
                tickInterval: 0.5,
                duration: 3,      // Сколько горит
                radius: 120
        },
        rocket: { 
            cooldown: 15,
            damage: 999,
            speed: 800,
            pickupTime: 10,
            fallDuration: 1.5
        },
        machinegun: {
        cooldown: 12,
        damage: 15,
        ammo: 30,
        fireRate: 0.07,
        speed: 500,
        pickupTime: 10,
        fallDuration: 1.5
    }
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