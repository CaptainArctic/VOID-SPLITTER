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
    const dx = targetX - p.x;
    const dy = targetY - p.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 5) return;

    spawnParticles(p.x + Math.cos(p.angle) * 18, p.y + Math.sin(p.angle) * 18, '#00ffff', 5, 150);

    state.bullets.push({
        x: p.x + Math.cos(p.angle) * 16,
        y: p.y + Math.sin(p.angle) * 16,
        vx: (dx / len) * CONFIG.BULLET_SPEED,
        vy: (dy / len) * CONFIG.BULLET_SPEED,
        radius: CONFIG.BULLET_RADIUS,
        damage: CONFIG.BULLET_DAMAGE,
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

function spawnEnemy() {
    const types = CONFIG.ENEMY_TYPES;
    const type = types[Math.floor(Math.random() * types.length)];

    const mapWidth = typeof MAP_WIDTH !== 'undefined' ? MAP_WIDTH : 800;
    const mapHeight = typeof MAP_HEIGHT !== 'undefined' ? MAP_HEIGHT : 600;
    
    let x, y;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: x = 50 + Math.random() * (mapWidth - 100); y = -30; break;
        case 1: x = mapWidth + 30; y = 50 + Math.random() * (mapHeight - 100); break;
        case 2: x = 50 + Math.random() * (mapWidth - 100); y = mapHeight + 30; break;
        case 3: x = -30; y = 50 + Math.random() * (mapHeight - 100); break;
    }

    let hp = CONFIG.ENEMY_BASE_HP;
    let speed = CONFIG.ENEMY_BASE_SPEED + Math.random() * 30;
    let radius = CONFIG.ENEMY_BASE_RADIUS;
    let color = '#ff4444';
    let damage = CONFIG.ENEMY_DAMAGE;
    let detectionRange = 250;
    let name = 'Враг';

    if (type === 'scout') { color = '#ff8844'; radius = 12; speed *= 1.2; name = 'Разведчик'; }
    else if (type === 'warrior') { color = '#ff4444'; hp = 2; radius = 16; name = 'Воин'; }
    else if (type === 'hunter') { color = '#ff00ff'; radius = 11; speed *= 1.5; name = 'Охотник'; }

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