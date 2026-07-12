// ============================================================
//  progression.js — Прогрессия и сохранения
// ============================================================

console.log('✅ progression.js загружен');

// ===== ЗАГРУЗКА / СОХРАНЕНИЕ =====

function loadProgress() {
    const saved = localStorage.getItem('voidSplitterProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Объединяем с дефолтными значениями (на случай новых полей)
            state.progress = { ...state.progress, ...data };
        } catch (e) {
            console.warn('⚠️ Ошибка загрузки прогресса, используем дефолтный');
        }
    }
    saveProgress();
}

function saveProgress() {
    localStorage.setItem('voidSplitterProgress', JSON.stringify(state.progress));
}

// ===== ДОБАВЛЕНИЕ НАГРАД =====

function addCrystals(amount) {
    state.progress.crystals += amount;
    saveProgress();
    updateHUD();
}

function addRunRewards(kills, wave, difficulty) {
    // Базовые кристаллы за убийства
    let crystals = kills * (5 + Math.floor(Math.random() * 10));
    
    // Бонус за завершение забега
    crystals += 20 + wave * 2;
    
    // Бонус за сложность
    if (difficulty >= 5) crystals *= 1.5;
    if (difficulty >= 8) crystals *= 1.5;
    
    crystals = Math.floor(crystals);
    
    state.progress.crystals += crystals;
    state.progress.totalKills += kills;
    state.progress.totalRuns += 1;
    
    if (state.score > state.progress.bestScore) {
        state.progress.bestScore = state.score;
    }
    if (wave > state.progress.bestWave) {
        state.progress.bestWave = wave;
    }
    
    saveProgress();
    updateHUD();
    return crystals;
}

// ===== УЛУЧШЕНИЯ =====

function getUpgradeCost(statName) {
    const baseCost = CONFIG.UPGRADE_COSTS[statName] || 50;
    const currentLevel = state.progress.upgrades[statName] || 0;
    // Стоимость растёт с каждым уровнем: baseCost * (1 + level * 0.3)
    return Math.floor(baseCost * (1 + currentLevel * 0.3));
}

function getUpgradeEffect(statName) {
    const level = state.progress.upgrades[statName] || 0;
    const effectPerLevel = CONFIG.UPGRADE_EFFECTS[statName] || 0;
    return level * effectPerLevel;
}

function getPlayerStats() {
    const base = {
        health: CONFIG.MAX_HEALTH,
        speed: CONFIG.PLAYER_SPEED,
        damage: CONFIG.BULLET_DAMAGE,
        fireRate: CONFIG.SHOOT_COOLDOWN,
        bulletSpeed: CONFIG.BULLET_SPEED
    };
    
    return {
        health: base.health + getUpgradeEffect('health'),
        speed: base.speed + getUpgradeEffect('speed'),
        damage: base.damage + getUpgradeEffect('damage'),
        fireRate: Math.max(0.03, base.fireRate - getUpgradeEffect('fireRate')),
        bulletSpeed: base.bulletSpeed + getUpgradeEffect('bulletSpeed')
    };
}

function upgradeStat(statName) {
    const currentLevel = state.progress.upgrades[statName] || 0;
    if (currentLevel >= CONFIG.UPGRADE_MAX_LEVEL) {
        dispatchMessage(`⚠️ ${statName} уже на максимальном уровне!`);
        return false;
    }
    
    const cost = getUpgradeCost(statName);
    if (state.progress.crystals < cost) {
        dispatchMessage(`⚠️ Недостаточно кристаллов! Нужно ${cost}`);
        return false;
    }
    
    state.progress.crystals -= cost;
    state.progress.upgrades[statName] = currentLevel + 1;
    saveProgress();
    updateHUD();
    updateUpgradeUI();
    dispatchMessage(`✅ ${statName} улучшен до ${currentLevel + 1} уровня!`);
    return true;
}

// ===== ОБНОВЛЕНИЕ UI =====

function updateUpgradeUI() {
    const stats = getPlayerStats();
    const progress = state.progress;
    
    // Обновляем отображение статов в меню улучшений
    const statNames = ['health', 'speed', 'damage', 'fireRate', 'bulletSpeed'];
    statNames.forEach(name => {
        const levelEl = document.getElementById(`upgradeLevel_${name}`);
        const costEl = document.getElementById(`upgradeCost_${name}`);
        const valueEl = document.getElementById(`upgradeValue_${name}`);
        
        if (levelEl) {
            const level = progress.upgrades[name] || 0;
            levelEl.textContent = `${level}/${CONFIG.UPGRADE_MAX_LEVEL}`;
        }
        if (costEl) {
            const cost = getUpgradeCost(name);
            costEl.textContent = cost;
        }
        if (valueEl) {
            const val = stats[name];
            const base = {
                health: CONFIG.MAX_HEALTH,
                speed: CONFIG.PLAYER_SPEED,
                damage: CONFIG.BULLET_DAMAGE,
                fireRate: CONFIG.SHOOT_COOLDOWN,
                bulletSpeed: CONFIG.BULLET_SPEED
            };
            valueEl.textContent = `${base[name]} → ${val}`;
        }
    });
    
    // Кристаллы
    const crystalsEl = document.getElementById('upgradeCrystals');
    if (crystalsEl) crystalsEl.textContent = progress.crystals;
}

// ===== ЗАГРУЗКА ПРИ СТАРТЕ =====
loadProgress();
console.log('📊 Прогресс загружен:', state.progress);