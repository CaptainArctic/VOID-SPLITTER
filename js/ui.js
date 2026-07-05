console.log('✅ ui.js загружен');

function showMenu() {
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = 'flex';
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

function startDailyRun() {
    const menu = document.getElementById('menu');
    if (menu) menu.style.display = 'none';
    
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
    
    if (state.spawnTimer) {
        clearInterval(state.spawnTimer);
        state.spawnTimer = null;
    }
    
    const hint = document.getElementById('evacuationHint');
    if (hint) hint.style.display = 'none';
    
    updateHUD();
}

function showDeathScreen() {
    state.gameOver = true;
    const death = document.getElementById('deathScreen');
    if (death) {
        const deathKills = document.getElementById('deathKills');
        if (deathKills) deathKills.textContent = state.kills;
        
        const deathTime = document.getElementById('deathTime');
        if (deathTime) deathTime.textContent = state.levelTime.toFixed(1) + 'с';
        
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
        const resultKills = document.getElementById('resultKills');
        if (resultKills) resultKills.textContent = state.kills;
        
        const resultTime = document.getElementById('resultTime');
        if (resultTime) resultTime.textContent = state.levelTime.toFixed(1) + 'с';
        
        const resultCrystals = document.getElementById('resultCrystals');
        if (resultCrystals) resultCrystals.textContent = state.crystals;
        
        const resultScore = document.getElementById('resultScore');
        if (resultScore) resultScore.textContent = state.score;
        
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
    
    // Здоровье
    const healthEl = document.getElementById('hudHealth');
    if (healthEl) {
        const hearts = '❤️'.repeat(Math.max(0, p.health)) + '🖤'.repeat(Math.max(0, p.maxHealth - p.health));
        healthEl.textContent = hearts || '💀';
    }
    
    // Убийства
    const killsEl = document.getElementById('hudKills');
    if (killsEl) killsEl.textContent = state.kills;
    
    // Осталось врагов
    const remainingEl = document.getElementById('hudRemaining');
    if (remainingEl) {
        const total = CONFIG.LEVEL_ENEMIES || 10;
        remainingEl.textContent = Math.max(0, total - state.kills);
    }
    
    // Время
    const timeEl = document.getElementById('hudTime');
    if (timeEl) timeEl.textContent = state.levelTime.toFixed(1) + 'с';
    
    // Кристаллы
    const crystalsEl = document.getElementById('hudCrystals');
    if (crystalsEl) crystalsEl.textContent = `💎 ${state.crystals}`;
    
    // Комбо
    const comboEl = document.getElementById('hudCombo');
    if (comboEl) comboEl.textContent = `x${state.combo}`;
}

function updateStatus() {
    // Заглушка
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Инициализация UI...');
    
    // Кнопка "Высадка"
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startDailyRun);
        console.log('✅ Кнопка "Высадка" привязана');
    } else {
        console.warn('⚠️ Кнопка "startBtn" не найдена');
    }
    
    // Кнопка "Рестарт"
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartRun);
        console.log('✅ Кнопка "Рестарт" привязана');
    } else {
        console.warn('⚠️ Кнопка "restartBtn" не найдена');
    }
    
    // Кнопка "Результаты"
    const resultsBtn = document.getElementById('resultsBtn');
    if (resultsBtn) {
        resultsBtn.addEventListener('click', closeResults);
        console.log('✅ Кнопка "Результаты" привязана');
    } else {
        console.warn('⚠️ Кнопка "resultsBtn" не найдена');
    }
    
    // Показываем меню через 100мс
    setTimeout(() => {
        showMenu();
        console.log('✅ Меню показано');
    }, 100);
});