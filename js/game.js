console.log('✅ game.js загружен');

const ctx = canvas.getContext('2d');
const camera = { x: 0, y: 0 };

function update(dt) {
    if (state.gameOver) return;
    if (state.levelComplete) return;

    const p = state.player;

    // === ДВИЖЕНИЕ ===
    let dx = 0, dy = 0;
    if (window.keys.w) dy = -1;
    if (window.keys.s) dy = 1;
    if (window.keys.a) dx = -1;
    if (window.keys.d) dx = 1;

    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }

    let speed = CONFIG.PLAYER_SPEED;
    
    if (p.isDashing) {
        p.dashTimer -= dt;
        p.x += p.dashDx * dt;
        p.y += p.dashDy * dt;
        if (Math.random() < 0.3) {
            spawnParticles(p.x, p.y, CONFIG.COLORS.player, 2, 100);
        }
        if (p.dashTimer <= 0) {
            p.isDashing = false;
            p.invincible = false;
            spawnParticles(p.x, p.y, CONFIG.COLORS.player, 10, 150);
        }
    } else {
        p.x += dx * speed * dt;
        p.y += dy * speed * dt;
    }

    const mapWidth = typeof MAP_WIDTH !== 'undefined' ? MAP_WIDTH : 800;
    const mapHeight = typeof MAP_HEIGHT !== 'undefined' ? MAP_HEIGHT : 600;
    p.x = Math.max(p.radius, Math.min(mapWidth - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(mapHeight - p.radius, p.y));

    // === КАМЕРА ===
    camera.x = p.x - W / 2;
    camera.y = p.y - H / 2;
    camera.x = Math.max(0, Math.min(mapWidth - W, camera.x));
    camera.y = Math.max(0, Math.min(mapHeight - H, camera.y));

    // === ПРИЦЕЛ В МИРОВЫХ КООРДИНАТАХ ===
    const worldMouseX = window.mouse.x + camera.x;
    const worldMouseY = window.mouse.y + camera.y;
    p.angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);

    // === СТРЕЛЬБА ===
    state.shootCooldown -= dt;
    if (window.mouse.down && state.shootCooldown <= 0 && !p.isDashing) {
        shootBullet(worldMouseX, worldMouseY);
        state.shootCooldown = CONFIG.SHOOT_COOLDOWN;
    }

    // === ПУЛИ ===
    state.bullets.forEach(b => {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 6) b.trail.shift();
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
    });
    state.bullets = state.bullets.filter(b =>
        b.life > 0 && b.x > -50 && b.x < mapWidth + 50 && b.y > -50 && b.y < mapHeight + 50
    );

    // === ВРАГИ ===
    state.enemies.forEach(e => {
        if (e.dead) return;

        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < e.detectionRange) {
            e.state = 'chase';
        } else if (e.state === 'chase' && dist > e.detectionRange * 1.5) {
            e.state = 'patrol';
            e.patrolTarget = null;
        }

        if (e.state === 'chase') {
            if (dist > 0) {
                const moveX = (dx / dist) * e.speed * dt;
                const moveY = (dy / dist) * e.speed * dt;
                if (typeof checkWallCollision === 'function') {
                    if (!checkWallCollision(e.x + moveX, e.y, e.radius)) {
                        e.x += moveX;
                    }
                    if (!checkWallCollision(e.x, e.y + moveY, e.radius)) {
                        e.y += moveY;
                    }
                } else {
                    e.x += moveX;
                    e.y += moveY;
                }
            }
            
            e.attackCooldown -= dt;
            if (dist < p.radius + e.radius && !p.invincible && e.attackCooldown <= 0) {
                p.health -= e.damage || 999;
                p.invincible = true;
                spawnParticles(p.x, p.y, '#ff4444', 20);
                updateHUD();
                setTimeout(() => { p.invincible = false; }, 500);
                e.attackCooldown = 1;

                if (p.health <= 0) {
                    showDeathScreen();
                    return;
                }
            }
        } else {
            e.patrolTimer -= dt;
            if (e.patrolTimer <= 0 || e.patrolTarget === null) {
                const angle = Math.random() * Math.PI * 2;
                const dist2 = 50 + Math.random() * 100;
                e.patrolTarget = {
                    x: e.x + Math.cos(angle) * dist2,
                    y: e.y + Math.sin(angle) * dist2
                };
                e.patrolTimer = 2 + Math.random() * 3;
            }

            if (e.patrolTarget) {
                const dx2 = e.patrolTarget.x - e.x;
                const dy2 = e.patrolTarget.y - e.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (dist2 > 5) {
                    const moveX = (dx2 / dist2) * e.speed * 0.3 * dt;
                    const moveY = (dy2 / dist2) * e.speed * 0.3 * dt;
                    if (typeof checkWallCollision === 'function') {
                        if (!checkWallCollision(e.x + moveX, e.y, e.radius)) {
                            e.x += moveX;
                        }
                        if (!checkWallCollision(e.x, e.y + moveY, e.radius)) {
                            e.y += moveY;
                        }
                    } else {
                        e.x += moveX;
                        e.y += moveY;
                    }
                }
            }
        }

        e.x = Math.max(e.radius, Math.min(mapWidth - e.radius, e.x));
        e.y = Math.max(e.radius, Math.min(mapHeight - e.radius, e.y));
    });

    // === СТОЛКНОВЕНИЯ ПУЛЬ ===
    state.bullets.forEach(b => {
        state.enemies.forEach(e => {
            if (e.dead) return;
            const dx = e.x - b.x;
            const dy = e.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < e.radius + b.radius) {
                e.hp -= b.damage;
                b.life = 0;
                spawnParticles(b.x, b.y, '#ffaa00', 8);
                
                if (e.hp <= 0) {
                    e.dead = true;
                    state.kills++;
                    state.crystals += 5 + Math.floor(Math.random() * 5);
                    state.score += 10;
                    explosionParticles(e.x, e.y, e.color);
                    updateCombo();
                    updateHUD();
                }
            }
        });
    });

    state.enemies = state.enemies.filter(e => !e.dead);

    // === ТУРЕЛЬ (заглушка) ===
    if (typeof updateTurret === 'function') updateTurret(dt);
    if (typeof updateStrategemCooldowns === 'function') updateStrategemCooldowns(dt);
    if (typeof updateComboTimer === 'function') updateComboTimer(dt);

    // === ЧАСТИЦЫ ===
    state.particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= dt;
        p.radius *= (1 - dt * 0.5);
    });
    state.particles = state.particles.filter(p => p.life > 0 && p.radius > 0.3);

    // === ВРЕМЯ ===
    state.levelTime += dt;

    // === ПРОВЕРКА ЗАВЕРШЕНИЯ ===
    checkLevelComplete();
    if (typeof updateStatus === 'function') updateStatus();

    // Тряска камеры (эффект авиаудара)
    if (typeof applyCameraShake === 'function') 
    {
        applyCameraShake();
    }
}

function draw() {
    const p = state.player;
    const mapWidth = typeof MAP_WIDTH !== 'undefined' ? MAP_WIDTH : 800;
    const mapHeight = typeof MAP_HEIGHT !== 'undefined' ? MAP_HEIGHT : 600;

    ctx.fillStyle = CONFIG.COLORS.bg || '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // ===== ЗЕМЛЯ =====
    ctx.fillStyle = CONFIG.COLORS.ground || '#1a1a2e';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // ===== ДОРОГИ =====
    ctx.fillStyle = CONFIG.COLORS.road || '#2a2a4e';
    for (let y = 0; y < mapHeight; y += 120) {
        ctx.fillRect(0, y, mapWidth, 8);
    }
    for (let x = 0; x < mapWidth; x += 120) {
        ctx.fillRect(x, 0, 8, mapHeight);
    }

    // ===== ЗДАНИЯ =====
    if (typeof map !== 'undefined' && map.buildings) {
        for (const b of map.buildings) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(b.x + 5, b.y + 5, b.w, b.h);
            ctx.fillStyle = b.color || '#1a2a3a';
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = b.ruined ? 'rgba(100,50,50,0.3)' : 'rgba(0,150,255,0.1)';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        }
    }

    // ===== ЧАСТИЦЫ =====
    state.particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius, 0.5), 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ===== ВРАГИ =====
    state.enemies.forEach(e => {
        if (e.dead) return;

        const glow = ctx.createRadialGradient(e.x, e.y, 2, e.x, e.y, e.radius * 2);
        glow.addColorStop(0, e.color + '44');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = e.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x - 4, e.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e.x + 4, e.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        const angleToPlayer = Math.atan2(state.player.y - e.y, state.player.x - e.x);
        const eyeOffset = 2;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(e.x - 4 + Math.cos(angleToPlayer) * eyeOffset, e.y - 3 + Math.sin(angleToPlayer) * eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e.x + 4 + Math.cos(angleToPlayer) * eyeOffset, e.y - 3 + Math.sin(angleToPlayer) * eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (e.hp < e.maxHp) {
            const barWidth = e.radius * 1.6;
            const barHeight = 3;
            const barX = e.x - barWidth / 2;
            const barY = e.y - e.radius - 8;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#44ff44' : '#ff4444';
            ctx.fillRect(barX, barY, barWidth * (e.hp / e.maxHp), barHeight);
        }
    });

    // ===== ПУЛИ =====
    state.bullets.forEach(b => {
        b.trail.forEach((t, i) => {
            const alpha = i / b.trail.length * 0.5;
            ctx.globalAlpha = alpha;
            const trailColor = b.color || '#00ccff';
            ctx.fillStyle = trailColor;
            ctx.beginPath();
            ctx.arc(t.x, t.y, b.radius * (i / b.trail.length), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        const bulletColor = b.color || '#00ccff';
        const grad = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, b.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, bulletColor);
        grad.addColorStop(1, bulletColor === '#ffaa44' ? '#884422' : '#004466');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = bulletColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // ===== ИГРОК =====
    const glow = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, 60);
    glow.addColorStop(0, CONFIG.COLORS.playerGlow || 'rgba(0, 221, 255, 0.3)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(2, 2, p.radius, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, p.radius);
    grad.addColorStop(0, '#44ddff');
    grad.addColorStop(0.4, '#0088cc');
    grad.addColorStop(1, '#004466');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = p.invincible ? 'rgba(255,255,255,0.8)' : 'rgba(0, 204, 255, 0.6)';
    ctx.lineWidth = p.invincible ? 3 : 2;
    ctx.stroke();

    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.moveTo(p.radius + 4, 0);
    ctx.lineTo(p.radius - 6, -6);
    ctx.lineTo(p.radius - 6, 6);
    ctx.closePath();
    ctx.fill();

    if (window.keys.w || window.keys.s || window.keys.a || window.keys.d) {
        ctx.fillStyle = 'rgba(255, 180, 50, 0.6)';
        ctx.beginPath();
        ctx.arc(-p.radius - 4, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-p.radius - 4, 5, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(-p.radius - 2, -8);
        ctx.lineTo(-p.radius - 12 - Math.random() * 6, 0);
        ctx.lineTo(-p.radius - 2, 8);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    ctx.restore();


    // ===== ПРИЦЕЛ (поверх камеры) =====
    const mx = window.mouse.x;
    const my = window.mouse.y;
    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mx - 15, my);
    ctx.lineTo(mx + 15, my);
    ctx.moveTo(mx, my - 15);
    ctx.lineTo(mx, my + 15);
    ctx.stroke();

    const alive = state.enemies.filter(e => !e.dead).length;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '12px monospace';
    ctx.fillText(`👾 ${alive}`, 10, H - 15);
    
    // ===== ТЕСТ ТУРЕЛИ (КРАСНЫЙ КВАДРАТ) =====
const turret = state.strategems.turret;
ctx.fillStyle = '#ff0000';
ctx.font = '20px monospace';
ctx.fillText(`turret.active=${turret.active} x=${turret.x} y=${turret.y}`, 10, 100);

if (turret.active) {
    ctx.fillStyle = 'rgba(255,0,0,0.9)';
    ctx.fillRect(turret.x - 30, turret.y - 30, 60, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText('ТУРЕЛЬ', turret.x - 25, turret.y + 5);
}
}

function dispatchMessage(msg) {
    const el = document.getElementById('dispatcher');
    if (el) {
        el.textContent = msg;
        el.style.opacity = 1;
        clearTimeout(el._timeout);
        el._timeout = setTimeout(() => {
            el.style.opacity = 0.6;
        }, 2500);
    }
    console.log('📢 Диспетчер:', msg);
}