// ============================================================
//  strategems.js — Стратегемы (авиаудар, турель, ракетница)
// ============================================================

console.log('✅ strategems.js загружен');

// ============================================================
//  ИСПОЛЬЗОВАНИЕ СТРАТЕГЕМЫ
// ============================================================

function useStrategem(type) {
    if (state.gameOver) {
        dispatchMessage('⚠️ Боец пал, стратегемы недоступны');
        return;
    }
    
    const s = state.strategems[type];
    if (!s) return;
    if (s.cooldown > 0) {
        dispatchMessage(`⏳ Стратегема перезаряжается (${Math.ceil(s.cooldown)}с)`);
        return;
    }
    if (s.active) {
        dispatchMessage(`⚠️ Стратегема уже активна`);
        return;
    }

    // Проверяем, есть ли враги (для авиаудара и турели)
    if (type === 'airstrike' || type === 'turret') {
        const hasEnemies = state.enemies.some(e => !e.dead);
        if (!hasEnemies) {
            dispatchMessage('⚠️ Врагов нет, сохрани стратегему');
            return;
        }
    }

    const p = state.player;

    switch(type) {
        case 'airstrike': {
            const worldX = window.mouse.x + camera.x;
            const worldY = window.mouse.y + camera.y;
            
            spawnParticles(worldX, worldY, '#ff8800', 50, 500);
            spawnParticles(worldX, worldY, '#ffffff', 30, 300);
            spawnParticles(worldX, worldY, '#ff4400', 40, 400);
            
            let hitCount = 0;
            state.enemies.forEach(e => {
                if (e.dead) return;
                const dx = e.x - worldX;
                const dy = e.y - worldY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    e.hp -= 999;
                    if (e.hp <= 0) {
                        e.dead = true;
                        state.kills++;
                        state.crystals += 10 + Math.floor(Math.random() * 10);
                        state.score += 20;
                        explosionParticles(e.x, e.y, e.color);
                        updateCombo();
                        hitCount++;
                    }
                }
            });
            
            if (typeof shakeCamera === 'function') shakeCamera(5);
            dispatchMessage(`💥 Авиаудар! Уничтожено ${hitCount} врагов`);
            s.cooldown = CONFIG.STRATEGEMS.airstrike.cooldown;
            break;
        }
            
        case 'rocket': {
            const rocketTargetX = window.mouse.x + camera.x;
            const rocketTargetY = window.mouse.y + camera.y;
            
            s.active = true;
            s.x = rocketTargetX;
            s.y = rocketTargetY;
            s.timer = CONFIG.STRATEGEMS.rocket.pickupTime || 10;
            s.pickedUp = false;
            s.fired = false;
            s.angle = 0;
            
            spawnParticles(rocketTargetX, rocketTargetY - 30, '#ff8844', 40, 300);
            spawnParticles(rocketTargetX, rocketTargetY - 30, '#ffcc44', 30, 200);
            
            dispatchMessage('🚀 Капсула с ракетницей падает! Подойдите и нажмите F');
            s.cooldown = CONFIG.STRATEGEMS.rocket.cooldown;
            break;
        }


        case 'napalm': {
    const wx = window.mouse.x + camera.x;
    const wy = window.mouse.y + camera.y;
    
    const napalmConfig = CONFIG.STRATEGEMS.napalm; // ← ПОЛУЧАЕМ КОНФИГ
    
    s.active = true;
    s.x = wx;
    s.y = wy;
    s.timer = napalmConfig.duration || 3;
    s.radius = napalmConfig.radius || 120;
    s.tickTimer = 0;
    
    // Эффект взрыва
    spawnParticles(wx, wy, '#ff4400', 60, 500);
    spawnParticles(wx, wy, '#ff8800', 40, 400);
    spawnParticles(wx, wy, '#ffcc00', 30, 300);
    spawnParticles(wx, wy, '#ffffff', 20, 200);
    
    // Кольцевая волна
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const dist = 20 + Math.random() * 60;
        state.particles.push({
            x: wx + Math.cos(angle) * dist,
            y: wy + Math.sin(angle) * dist,
            vx: Math.cos(angle) * (100 + Math.random() * 100),
            vy: Math.sin(angle) * (100 + Math.random() * 100),
            radius: 3 + Math.random() * 5,
            color: ['#ff4400', '#ff6600', '#ff8800', '#ffcc00'][Math.floor(Math.random() * 4)],
            life: 0.5 + Math.random() * 0.5,
            maxLife: 0.5 + Math.random() * 0.5
        });
    }
    
    dispatchMessage('🔥 Напалм! Огненная зона активирована!');
    s.cooldown = CONFIG.STRATEGEMS.napalm.cooldown;
    break;
}

        case 'turret': {
            s.active = true;
            s.timer = CONFIG.STRATEGEMS.turret.duration;
            s.x = p.x + Math.cos(p.angle) * 40;
            s.y = p.y + Math.sin(p.angle) * 40;
            s.angle = p.angle;
            s._shootTimer = 0;
            
            spawnParticles(s.x, s.y, '#ffaa44', 20, 150);
            dispatchMessage('🤖 Турель развёрнута!');
            s.cooldown = CONFIG.STRATEGEMS.turret.cooldown;
            break;
        }
    }
    
    updateStrategemUI();
    updateHUD();
}

// ============================================================
//  ОБНОВЛЕНИЕ UI СТРАТЕГЕМ
// ============================================================

function updateStrategemUI() {
    const types = ['airstrike', 'turret', 'rocket', 'napalm'];
    const icons = ['💥', '🤖', '🚀'];
    
    types.forEach((type, i) => {
        const s = state.strategems[type];
        const cooldownEl = document.getElementById(`cooldown${i+1}`);
        const stratEl = document.getElementById(`strat${i+1}`);
        
        if (cooldownEl) {
            if (s && s.cooldown > 0) {
                cooldownEl.textContent = Math.ceil(s.cooldown);
                if (stratEl) stratEl.classList.add('on-cooldown');
            } else {
                cooldownEl.textContent = '';
                if (stratEl) stratEl.classList.remove('on-cooldown');
            }
        }
        
        if (s && s.active && stratEl) {
            stratEl.style.borderColor = '#44ff88';
            stratEl.style.boxShadow = '0 0 20px rgba(68,255,136,0.2)';
        } else if (stratEl) {
            stratEl.style.borderColor = '';
            stratEl.style.boxShadow = '';
        }
    });
}

// ============================================================
//  ОБНОВЛЕНИЕ КУЛДАУНОВ
// ============================================================

function updateStrategemCooldowns(dt) {
    const types = ['airstrike', 'turret', 'rocket', 'napalm'];
    types.forEach(type => {
        const s = state.strategems[type];
        if (!s) return;
        
        if (s.cooldown > 0) {
            s.cooldown -= dt;
            if (s.cooldown < 0) s.cooldown = 0;
        }
        
        if (s.active) {
            if (type === 'turret') {
                s.timer -= dt;
                if (s.timer <= 0) {
                    s.active = false;
                    dispatchMessage('🤖 Турель отключена');
                    spawnParticles(s.x, s.y, '#ffaa44', 15, 150);
                    updateStrategemUI();
                }
            }
            if (type === 'rocket') {
                // Ракетница обрабатывается в update() game.js
                // Таймер капсулы обновляется там же
            }
        }
    });
    
    updateStrategemUI();
}

// ============================================================
//  ТУРЕЛЬ
// ============================================================

function updateTurret(dt) {
    const t = state.strategems.turret;
    if (!t || !t.active) return;
    
    // Вращаем турель
    t.angle = (t.angle || 0) + dt * 1.5;
    
    let nearest = null;
    let minDist = Infinity;
    state.enemies.forEach(e => {
        if (e.dead) return;
        const dx = e.x - t.x;
        const dy = e.y - t.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
            minDist = dist;
            nearest = e;
        }
    });
    
    if (nearest && minDist < 350) {
        if (!t._shootTimer) t._shootTimer = 0;
        t._shootTimer -= dt;
        
        if (t._shootTimer <= 0) {
            const dx = nearest.x - t.x;
            const dy = nearest.y - t.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len > 0) {
                state.bullets.push({
                    x: t.x + (dx/len) * 18,
                    y: t.y + (dy/len) * 18,
                    vx: (dx/len) * 450,
                    vy: (dy/len) * 450,
                    radius: 4,
                    damage: 25,
                    life: 1.5,
                    trail: [],
                    owner: 'turret',
                    color: '#ff8844'
                });
                spawnParticles(t.x + (dx/len) * 20, t.y + (dy/len) * 20, '#ffaa44', 4, 80);
                t._shootTimer = 0.25;
            }
        }
    } else {
        t._shootTimer = 0;
    }
}

// ============================================================
//  ТРЯСКА КАМЕРЫ
// ============================================================

let shakeIntensity = 0;
let shakeTimer = 0;

function shakeCamera(intensity) {
    shakeIntensity = intensity;
    shakeTimer = 0.3;
}

function applyCameraShake() {
    if (shakeTimer > 0) {
        shakeTimer -= 0.016;
        const offsetX = (Math.random() - 0.5) * shakeIntensity * 2;
        const offsetY = (Math.random() - 0.5) * shakeIntensity * 2;
        camera.x += offsetX;
        camera.y += offsetY;
        if (shakeTimer <= 0) {
            shakeIntensity = 0;
        }
    }
}