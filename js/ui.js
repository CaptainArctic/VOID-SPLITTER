console.log('✅ ui.js загружен');

// ============================================================
//  ВЫБОР СТРАТЕГЕМ (4 из 5)
// ============================================================

let selectedSlots = [null, null, null, null];

function openStrategemSelect() {
    console.log('🎯 openStrategemSelect вызван');
    
    // Скрываем меню
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = 'none';

    // Скрываем игровой контейнер
    const container = document.getElementById('gameContainer');
    if (container) container.style.display = 'none';
    
    const selectScreen = document.getElementById('strategemSelect');
    if (selectScreen) {
        selectScreen.style.display = 'flex';
        console.log('✅ Экран выбора показан');
    } else {
        console.error('❌ Элемент #strategemSelect не найден!');
    }
    loadStrategemSelection();
    renderStrategemPool();
    renderSlots();
}

function closeStrategemSelect() {
    const selectScreen = document.getElementById('strategemSelect');
    if (selectScreen) selectScreen.style.display = 'none';

    // Показываем игровой контейнер
    const container = document.getElementById('gameContainer');
    if (container) container.style.display = 'block';

    showMenu();
}

function loadStrategemSelection() {
    const saved = localStorage.getItem('voidSplitterStrategems');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.length === 4) {
                selectedSlots = data;
                return;
            }
        } catch {}
    }
    // По умолчанию
    selectedSlots = [...CONFIG.DEFAULT_STRATEGEMS];
    while (selectedSlots.length < 4) {
        selectedSlots.push(null);
    }
    saveStrategemSelection();
}

function saveStrategemSelection() {
    localStorage.setItem('voidSplitterStrategems', JSON.stringify(selectedSlots));
    state.selectedStrategems = [...selectedSlots];
}

function renderSlots() {
    const allStrats = CONFIG.ALL_STRATEGEMS;
    for (let i = 0; i < 4; i++) {
        const slotEl = document.querySelector(`.slot[data-slot="${i}"]`);
        const iconEl = document.getElementById(`slotIcon${i}`);
        const nameEl = document.getElementById(`slotName${i}`);
        
        if (selectedSlots[i]) {
            const strat = allStrats.find(s => s.id === selectedSlots[i]);
            if (strat) {
                slotEl.classList.add('filled');
                iconEl.textContent = strat.icon;
                nameEl.textContent = strat.name;
            }
        } else {
            slotEl.classList.remove('filled');
            iconEl.textContent = '⬜';
            nameEl.textContent = 'Пусто';
        }
    }
}

function renderStrategemPool() {
    const pool = document.getElementById('strategemPool');
    if (!pool) return;
    pool.innerHTML = '';
    
    const allStrats = CONFIG.ALL_STRATEGEMS;
    const isFull = selectedSlots.filter(s => s !== null).length >= 4;
    
    allStrats.forEach(strat => {
        const isSelected = selectedSlots.includes(strat.id);
        const isInSlot = selectedSlots.indexOf(strat.id) !== -1;
        
        const div = document.createElement('div');
        div.className = `strategem-item ${isSelected ? 'selected' : ''}`;
        div.innerHTML = `${strat.icon} ${strat.name}`;
        
        div.addEventListener('click', () => {
            if (isSelected) {
                // Убираем из слота
                const idx = selectedSlots.indexOf(strat.id);
                if (idx !== -1) selectedSlots[idx] = null;
            } else if (!isFull) {
                // Добавляем в первый пустой слот
                const emptyIdx = selectedSlots.indexOf(null);
                if (emptyIdx !== -1) {
                    selectedSlots[emptyIdx] = strat.id;
                }
            } else {
                dispatchMessage('⚠️ Все 4 слота заполнены!');
                return;
            }
            renderSlots();
            renderStrategemPool();
            saveStrategemSelection();
        });
        
        pool.appendChild(div);
    });
}

// ============================================================
//  МЕНЮ И ИГРА
// ============================================================

function showMenu() {
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = 'flex';

    // Скрываем игровой контейнер (canvas + HUD)
     const container = document.getElementById('gameContainer');
    if (container) container.style.display = 'none';

    updateMenuStats();
}

function updateMenuStats() {
    const enemyCount = document.getElementById('enemyCount');
    if (enemyCount) enemyCount.textContent = CONFIG.LEVEL_ENEMIES || 10;
    
    const menuCrystals = document.getElementById('menuCrystals');
    if (menuCrystals) menuCrystals.textContent = '0';
    const menuShards = document.getElementById('menuShards');
    if (menuShards) menuShards.textContent = '0';
    const menuTokens = document.getElementById('menuTokens');
    if (menuTokens) menuTokens.textContent = '0';
}

function updateStrategemHUD() {
    const slots = state.selectedStrategems || [];
    const allStrats = CONFIG.ALL_STRATEGEMS;
    
    for (let i = 0; i < 4; i++) {
        const stratId = slots[i];
        const strat = allStrats.find(s => s.id === stratId);
        const stratEl = document.getElementById(`strat${i+1}`);
        
        if (stratEl && strat) {
            // Иконка и название
            const iconEl = stratEl.querySelector('.icon');
            const nameEl = stratEl.querySelector('.name');
            const cooldownEl = stratEl.querySelector('.cooldown');
            
            if (iconEl) iconEl.textContent = strat.icon;
            if (nameEl) nameEl.textContent = strat.name;
            
            // ⭐ КУЛДАУН БЕРЁМ ИЗ state.strategems[stratId]
            const s = state.strategems[stratId];
            if (cooldownEl && s) {
                if (s.cooldown > 0) {
                    cooldownEl.textContent = Math.ceil(s.cooldown);
                    stratEl.classList.add('on-cooldown');
                } else {
                    cooldownEl.textContent = '';
                    stratEl.classList.remove('on-cooldown');
                }
            }
            
            // Индикатор активности
            if (s && s.active) {
                stratEl.style.borderColor = '#44ff88';
                stratEl.style.boxShadow = '0 0 20px rgba(68,255,136,0.2)';
            } else {
                stratEl.style.borderColor = '';
                stratEl.style.boxShadow = '';
            }
        }
    }
}

function startDailyRun() {
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = 'none';
    
     // Показываем игровой контейнер
    const container = document.getElementById('gameContainer');
    if (container) container.style.display = 'block';

     updateStrategemHUD();

    resetGameState();
    startLevel();
    dispatchMessage('🚀 Высадка на планету!');
}

function resetGameState() {
    const p = state.player;
    p.health = CONFIG.MAX_HEALTH;
    p.maxHealth = CONFIG.MAX_HEALTH;
    p.x = 400;
    p.y = 300;
    p.angle = 0;
    p.invincible = false;
    p.isDashing = false;
    p.dashTimer = 0;
    p.invincibleTimer = 0;
    
    state.bullets = [];
    state.enemies = [];
    state.particles = [];
    state.kills = 0;
    state.crystals = 0;
    state.score = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.gameOver = false;
    state.levelComplete = false;
    state.isEvacuating = false;
    state.levelTime = 0;
    state.shootCooldown = 0;
    
    // Сбрасываем стратегемы
    const s = state.strategems;
    s.airstrike.active = false;
    s.airstrike.cooldown = 0;
    s.turret.active = false;
    s.turret.cooldown = 0;
    s.rocket.active = false;
    s.rocket.cooldown = 0;
    s.rocket.pickedUp = false;
    s.rocket.fired = false;
    s.napalm.active = false;
    s.napalm.cooldown = 0;
    s.machinegun.active = false;
    s.machinegun.cooldown = 0;
    s.machinegun.pickedUp = false;
    s.machinegun.fired = false;
    s.machinegun.ammo = 0;
    
    if (state.spawnTimer) {
        clearInterval(state.spawnTimer);
        state.spawnTimer = null;
    }
    
    const hint = document.getElementById('evacuationHint');
    if (hint) hint.style.display = 'none';
    
    document.getElementById('rocketIndicator').style.display = 'none';
    document.getElementById('machinegunIndicator').style.display = 'none';
    
    updateHUD();
}

function showDeathScreen() {
    state.gameOver = true;

    const container = document.getElementById('gameContainer');
    if (container) container.style.display = 'none';
    
    const death = document.getElementById('deathScreen');
    if (death) {
        document.getElementById('deathKills').textContent = state.kills;
        document.getElementById('deathTime').textContent = state.levelTime.toFixed(1) + 'с';
        death.style.display = 'flex';
    }
    if (state.spawnTimer) {
        clearInterval(state.spawnTimer);
        state.spawnTimer = null;
    }
    dispatchMessage('💀 Боец пал! Нажми R для перезагрузки.');
}

function restartRun() {
    const death = document.getElementById('deathScreen');
    if (death) death.style.display = 'none';

      const container = document.getElementById('gameContainer');
    if (container) container.style.display = 'block';
    
    resetGameState();
    startLevel();
    dispatchMessage('🔄 Перезагрузка... Боец, ты снова в строю!');
}

function evacuate() {
    if (!state.levelComplete) {
        dispatchMessage('⚠️ Уничтожьте всех врагов сначала!');
        return;
    }
    if (state.gameOver) return;
    if (state.isEvacuating) return;

    state.isEvacuating = true;
    showResults();
}

function showResults() {
    const results = document.getElementById('results');
    if (results) {
        document.getElementById('resultKills').textContent = state.kills;
        document.getElementById('resultTime').textContent = state.levelTime.toFixed(1) + 'с';
        document.getElementById('resultCrystals').textContent = state.crystals;
        document.getElementById('resultScore').textContent = state.score;
        results.style.display = 'flex';
    }
    if (state.spawnTimer) {
        clearInterval(state.spawnTimer);
        state.spawnTimer = null;
    }
}

function closeResults() {
    const results = document.getElementById('results');
    if (results) results.style.display = 'none';
    showMenu();
}

function updateHUD() {
    const p = state.player;
    
    const healthEl = document.getElementById('hudHealth');
    if (healthEl) {
        const hearts = '❤️'.repeat(Math.max(0, p.health)) + '🖤'.repeat(Math.max(0, p.maxHealth - p.health));
        healthEl.textContent = hearts || '💀';
    }
    
    const killsEl = document.getElementById('hudKills');
    if (killsEl) killsEl.textContent = state.kills;
    
    const remainingEl = document.getElementById('hudRemaining');
    if (remainingEl) {
        const total = CONFIG.LEVEL_ENEMIES || 10;
        remainingEl.textContent = Math.max(0, total - state.kills);
    }
    
    const timeEl = document.getElementById('hudTime');
    if (timeEl) timeEl.textContent = state.levelTime.toFixed(1) + 'с';
    
    const crystalsEl = document.getElementById('hudCrystals');
    if (crystalsEl) crystalsEl.textContent = `💎 ${state.crystals}`;
    
    const comboEl = document.getElementById('hudCombo');
    if (comboEl) comboEl.textContent = `x${state.combo}`;
}

function updateStatus() {
    // Заглушка
}

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Инициализация UI...');
    
    // Кнопка "Высадка" — открывает выбор стратегем
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            openStrategemSelect();
        });
        console.log('✅ Кнопка "Высадка" привязана');
    }
    
    // Кнопка подтверждения выбора
    const confirmBtn = document.getElementById('confirmStrategemsBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const filled = selectedSlots.filter(s => s !== null).length;
            if (filled < 4) {
                dispatchMessage('⚠️ Заполните все 4 слота!');
                return;
            }
            saveStrategemSelection();
            closeStrategemSelect();
            startDailyRun();
        });
        console.log('✅ Кнопка "Подтвердить" привязана');
    }
    
    // Кнопка сброса
    const resetBtn = document.getElementById('resetStrategemsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            selectedSlots = [...CONFIG.DEFAULT_STRATEGEMS];
            while (selectedSlots.length < 4) {
                selectedSlots.push(null);
            }
            renderSlots();
            renderStrategemPool();
            saveStrategemSelection();
            dispatchMessage('🔄 Сброшено до стандартного набора');
        });
        console.log('✅ Кнопка "Сброс" привязана');
    }
    
    // Кнопка "Рестарт"
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartRun);
        console.log('✅ Кнопка "Рестарт" привязана');
    }
    
    // Кнопка "Результаты"
    const resultsBtn = document.getElementById('resultsBtn');
    if (resultsBtn) {
        resultsBtn.addEventListener('click', closeResults);
        console.log('✅ Кнопка "Результаты" привязана');
    }
    
    setTimeout(() => {
        showMenu();
        console.log('✅ Меню показано');
    }, 100);
});