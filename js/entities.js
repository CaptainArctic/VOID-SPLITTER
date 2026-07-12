console.log('✅ entities.js загружен');

const W = CONFIG.WIDTH;
const H = CONFIG.HEIGHT;

function spawnParticles(x, y, color, count = CONFIG.PARTICLE_COUNT, speed = CONFIG.PARTICLE_SPEED) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 50 + Math.random() * speed;
        state.particles.push({
            x, y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            radius: 2 + Math.random() * 5,
            color: color,
            life: 0.3 + Math.random() * 0.5,
            maxLife: 0.3 + Math.random() * 0.5
        });
    }
}

function explosionParticles(x, y, color) {
    spawnParticles(x, y, color, 30, 400);
    spawnParticles(x, y, '#ffffff', 10, 200);
}

function shootBullet(targetX, targetY) {
    const p = state.player;
    const stats = getPlayerStats(); // ← ДОБАВИТЬ

    const dx = targetX - p.x;
    const dy = targetY - p.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 5) return;

    spawnParticles(p.x + Math.cos(p.angle) * 18, p.y + Math.sin(p.angle) * 18, '#00ffff', 5, 150);

    state.bullets.push({
        x: p.x + Math.cos(p.angle) * 16,
        y: p.y + Math.sin(p.angle) * 16,
        vx: (dx / len) * stats.bulletSpeed,
        vy: (dy / len) * stats.bulletSpeed,
        radius: CONFIG.BULLET_RADIUS,
        damage: stats.damage,
        life: CONFIG.BULLET_LIFE,
        trail: [],
        owner: 'player'
    });
}

function startDash() {
    const p = state.player;
    if (p.isDashing) return;
    if (state.gameOver) return;

    let dx = 0, dy = 0;
    if (window.keys.w) dy = -1;
    if (window.keys.s) dy = 1;
    if (window.keys.a) dx = -1;
    if (window.keys.d) dx = 1;
    
    if (dx === 0 && dy === 0) {
        const mx = window.mouse.x - p.x;
        const my = window.mouse.y - p.y;
        const len = Math.sqrt(mx * mx + my * my);
        if (len > 10) {
            dx = mx / len;
            dy = my / len;
        }
    } else {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
    }

    p.isDashing = true;
    p.dashTimer = CONFIG.DASH_DURATION;
    p.dashDx = dx * CONFIG.DASH_SPEED;
    p.dashDy = dy * CONFIG.DASH_SPEED;
    
    spawnParticles(p.x, p.y, CONFIG.COLORS.player, 15, 200);
    p.invincible = true;
    dispatchMessage('💨 Рывок!');
}

// ============================================================
//  СПАВН ВРАГОВ (С УЧЁТОМ СЛОЖНОСТИ)
// ============================================================

function spawnEnemy() {
    const diff = state.difficulty || CONFIG.DEFAULT_DIFFICULTY;
    const diffConfig = CONFIG.DIFFICULTY_LEVELS[diff] || CONFIG.DIFFICULTY_LEVELS[5];

    const type = CONFIG.ENEMY_TYPES[Math.floor(Math.random() * CONFIG.ENEMY_TYPES.length)];

    let x, y;
    const mapWidth = typeof MAP_WIDTH !== 'undefined' ? MAP_WIDTH : 800;
    const mapHeight = typeof MAP_HEIGHT !== 'undefined' ? MAP_HEIGHT : 600;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: x = Math.random() * mapWidth; y = -30; break;
        case 1: x = mapWidth + 30; y = Math.random() * mapHeight; break;
        case 2: x = Math.random() * mapWidth; y = mapHeight + 30; break;
        case 3: x = -30; y = Math.random() * mapHeight; break;
    }

    // ⭐ ОДНО ОБЪЯВЛЕНИЕ КАЖДОЙ ПЕРЕМЕННОЙ
    let hp = CONFIG.ENEMY_BASE_HP * diffConfig.health;
    let speed = (CONFIG.ENEMY_BASE_SPEED + Math.random() * 30) * diffConfig.speedMultiplier;
    let radius = CONFIG.ENEMY_BASE_RADIUS;
    let color = '#ff4444';
    let damage = CONFIG.ENEMY_DAMAGE * diffConfig.damage;
    let detectionRange = 250;
    let name = 'Враг';

    // Настройка под тип врага (БЕЗ ПОВТОРНЫХ let!)
    if (type === 'scout') { 
        color = '#ff8844'; 
        radius = 12; 
        speed *= 1.2; 
        name = 'Разведчик'; 
    }
    else if (type === 'warrior') { 
        color = '#ff4444'; 
        hp *= 2; 
        radius = 16; 
        name = 'Воин'; 
    }
    else if (type === 'hunter') { 
        color = '#ff00ff'; 
        radius = 11; 
        speed *= 1.5; 
        name = 'Охотник'; 
    }

    state.enemies.push({
        x, y, radius, hp, maxHp: hp, speed,
        type, color, damage, name,
        dead: false,
        attackCooldown: 0,
        patrolTarget: null,
        patrolTimer: 0,
        state: 'patrol',
        detectionRange: detectionRange,
        wobble: Math.random() * Math.PI * 2
    });
}

// ============================================================
//  ПУЛЕМЁТ
// ============================================================

function fireMachinegun() {
    const mg = state.strategems.machinegun;
    if (!mg.pickedUp || mg.fired) return;
    if (mg.ammo <= 0) {
        mg.fired = true;
        mg.pickedUp = false;
        mg.active = false;
        document.getElementById('machinegunIndicator').style.display = 'none';
        dispatchMessage('⚡ Пулемёт опустошён!');
        return;
    }
    if (state.gameOver) return;
    
    const p = state.player;
    const mx = window.mouse.x + camera.x;
    const my = window.mouse.y + camera.y;
    const dx = mx - p.x;
    const dy = my - p.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len < 5) return;
    
    state.bullets.push({
        x: p.x + Math.cos(p.angle) * 18,
        y: p.y + Math.sin(p.angle) * 18,
        vx: (dx/len) * 550,
        vy: (dy/len) * 550,
        radius: 3,
        damage: CONFIG.STRATEGEMS.machinegun.damage || 15,
        life: 1.8,
        trail: [],
        owner: 'player',
        color: '#ffdd44',
        isMachinegun: true
    });
    
    spawnParticles(p.x + Math.cos(p.angle) * 22, p.y + Math.sin(p.angle) * 22, '#ffdd44', 3, 70);
    spawnParticles(p.x + Math.cos(p.angle) * 22, p.y + Math.sin(p.angle) * 22, '#ffcc44', 2, 50);
    
    mg.ammo--;
    
    const indicator = document.getElementById('machinegunIndicator');
    if (indicator) {
        indicator.textContent = `⚡ Пулемёт [${mg.ammo}]`;
    }
    
    if (mg.ammo <= 0) {
        mg.fired = true;
        mg.pickedUp = false;
        mg.active = false;
        if (indicator) indicator.style.display = 'none';
        dispatchMessage('⚡ Пулемёт опустошён!');
    }
}

// ============================================================
//  РАКЕТНИЦА
// ============================================================

function fireRocket() {
    const rocket = state.strategems.rocket;
    if (!rocket.pickedUp || rocket.fired) return;
    if (state.gameOver) return;
    
    const p = state.player;
    const mx = window.mouse.x + camera.x;
    const my = window.mouse.y + camera.y;
    const dx = mx - p.x;
    const dy = my - p.y;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len < 10) return;
    
    state.bullets.push({
        x: p.x + Math.cos(p.angle) * 20,
        y: p.y + Math.sin(p.angle) * 20,
        vx: (dx/len) * 700,
        vy: (dy/len) * 700,
        radius: 8,
        damage: 999,
        life: 2.5,
        trail: [],
        owner: 'player',
        color: '#ff8800',
        isRocket: true
    });
    
    spawnParticles(p.x + Math.cos(p.angle) * 25, p.y + Math.sin(p.angle) * 25, '#ff8800', 30, 300);
    spawnParticles(p.x + Math.cos(p.angle) * 25, p.y + Math.sin(p.angle) * 25, '#ffcc44', 20, 200);
    
    rocket.fired = true;
    rocket.pickedUp = false;
    rocket.active = false;
    
    state.shootCooldown = 0;
    
    const indicator = document.getElementById('rocketIndicator');
    if (indicator) indicator.style.display = 'none';
    
    dispatchMessage('🚀 Ракета выпущена!');
}