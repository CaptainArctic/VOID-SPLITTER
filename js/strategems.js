// ============================================================
//  strategems.js — Стратегемы (авиаудар, щит, турель, аптечка)
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
        case 'airstrike':
            // Авиаудар по позиции мыши в МИРОВЫХ координатах
            const worldX = window.mouse.x + camera.x;
            const worldY = window.mouse.y + camera.y;
            
            // Эффект удара
            spawnParticles(worldX, worldY, '#ff8800', 50, 500);
            spawnParticles(worldX, worldY, '#ffffff', 30, 300);
            spawnParticles(worldX, worldY, '#ff4400', 40, 400);
            
            // Урон врагам в радиусе
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
            
            // Тряска камеры
            if (typeof shakeCamera === 'function') shakeCamera(5);
            
            dispatchMessage(`💥 Авиаудар! Уничтожено ${hitCount} врагов`);
            s.cooldown = CONFIG.STRATEGEMS.airstrike.cooldown;
            break;
            
        case 'shield':
            // Щит — неуязвимость
            s.active = true;
            s.timer = CONFIG.STRATEGEMS.shield.duration;
            state.player.invincible = true;
            state.player.invincibleTimer = CONFIG.STRATEGEMS.shield.duration;
            
            // Визуальный эффект щита (частицы)
            spawnParticles(p.x, p.y, '#44ddff', 30, 200);
            dispatchMessage('🛡️ Щит активирован!');
            s.cooldown = CONFIG.STRATEGEMS.shield.cooldown;
            break;
            
        case 'turret':
            // Турель — ставится рядом с игроком
            s.active = true;
            s.timer = CONFIG.STRATEGEMS.turret.duration;
            s.x = p.x + Math.cos(p.angle) * 40;
            s.y = p.y + Math.sin(p.angle) * 40;
            
            // Визуальный эффект установки
            spawnParticles(s.x, s.y, '#ffaa44', 20, 150);
            dispatchMessage('🤖 Турель развёрнута!');
            s.cooldown = CONFIG.STRATEGEMS.turret.cooldown;
            break;
            
        case 'medkit':
            // Аптечка — восстанавливает HP
            if (p.health >= p.maxHealth) {
                dispatchMessage('❤️ Уже полное здоровье');
                return;
            }
            p.health = Math.min(p.health + 1, p.maxHealth);
            spawnParticles(p.x, p.y, '#ff44ff', 20, 150);
            dispatchMessage('❤️ +1 HP');
            updateHUD();
            s.cooldown = CONFIG.STRATEGEMS.medkit.cooldown;
            break;
    }
    
    // Обновляем UI стратегем
    updateStrategemUI();
    updateHUD();
}

// ============================================================
//  ОБНОВЛЕНИЕ UI СТРАТЕГЕМ
// ============================================================

function updateStrategemUI() {
    const types = ['airstrike', 'shield', 'turret', 'medkit'];
    const icons = ['💥', '🛡️', '🤖', '❤️'];
    
    types.forEach((type, i) => {
        const s = state.strategems[type];
        const cooldownEl = document.getElementById(`cooldown${i+1}`);
        const stratEl = document.getElementById(`strat${i+1}`);
        
        if (cooldownEl) {
            if (s.cooldown > 0) {
                cooldownEl.textContent = Math.ceil(s.cooldown);
                stratEl.classList.add('on-cooldown');
            } else {
                cooldownEl.textContent = '';
                stratEl.classList.remove('on-cooldown');
            }
        }
        
        // Индикатор активности (для щита и турели)
        if (s.active && stratEl) {
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
    const types = ['airstrike', 'shield', 'turret', 'medkit'];
    types.forEach(type => {
        const s = state.strategems[type];
        if (s.cooldown > 0) {
            s.cooldown -= dt;
            if (s.cooldown < 0) s.cooldown = 0;
        }
        
        // Обработка активных стратегем
        if (s.active) {
            if (type === 'shield') {
                s.timer -= dt;
                state.player.invincibleTimer = s.timer;
                if (s.timer <= 0) {
                    s.active = false;
                    state.player.invincible = false;
                    dispatchMessage('🛡️ Щит отключён');
                    updateStrategemUI();
                }
                // Визуальный эффект щита (пульсация)
                if (Math.random() < 0.2) {
                    spawnParticles(state.player.x, state.player.y, '#44ddff', 2, 50);
                }
            }
            if (type === 'turret') {
                s.timer -= dt;
                if (s.timer <= 0) {
                    s.active = false;
                    dispatchMessage('🤖 Турель отключена');
                    spawnParticles(s.x, s.y, '#ffaa44', 15, 150);
                    updateStrategemUI();
                }
            }
        }
    });
    
    // Обновляем UI стратегем (кулдауны)
    updateStrategemUI();
}

// ============================================================
//  ТУРЕЛЬ (стреляет по врагам)
// ============================================================

function updateTurret(dt) {
    const t = state.strategems.turret;
    if (!t.active) return;
    
    // Найти ближайшего врага
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
        // Стреляем в врага каждые 0.3 секунды
        if (!t._shootTimer) t._shootTimer = 0;
        t._shootTimer -= dt;
        
        if (t._shootTimer <= 0) {
            const dx = nearest.x - t.x;
            const dy = nearest.y - t.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len > 0) {
                state.bullets.push({
                    x: t.x + (dx/len) * 16,
                    y: t.y + (dy/len) * 16,
                    vx: (dx/len) * 450,
                    vy: (dy/len) * 450,
                    radius: 4,
                    damage: 30,
                    life: 1.5,
                    trail: [],
                    owner: 'turret',
                    color: '#ffaa44'
                });
                spawnParticles(t.x + (dx/len) * 18, t.y + (dy/len) * 18, '#ffaa44', 3, 80);
                t._shootTimer = 0.3;
            }
        }
    } else {
        t._shootTimer = 0;
    }
    
    // Визуальный эффект турели (вращение)
    t.angle = (t.angle || 0) + dt * 2;
}

// ============================================================
//  ТРЯСКА КАМЕРЫ (ЭФФЕКТ АВИАУДАРА)
// ============================================================

let shakeIntensity = 0;
let shakeTimer = 0;

function shakeCamera(intensity) {
    shakeIntensity = intensity;
    shakeTimer = 0.3;
}

// Вызывать в game.js в update, чтобы трясти камеру
function applyCameraShake() {
    if (shakeTimer > 0) {
        shakeTimer -= 0.016; // примерно 1 кадр
        const offsetX = (Math.random() - 0.5) * shakeIntensity * 2;
        const offsetY = (Math.random() - 0.5) * shakeIntensity * 2;
        camera.x += offsetX;
        camera.y += offsetY;
        if (shakeTimer <= 0) {
            shakeIntensity = 0;
        }
    }
}