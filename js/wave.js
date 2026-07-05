console.log('✅ wave.js загружен');

let enemiesSpawned = 0;
let totalEnemies = 10;  // Значение по умолчанию

function startLevel() {
    if (state.gameOver) return;

    // Берём из CONFIG, если есть
    totalEnemies = (typeof CONFIG !== 'undefined' && CONFIG.LEVEL_ENEMIES) ? CONFIG.LEVEL_ENEMIES : 10;
    enemiesSpawned = 0;

    state.enemies = [];
    state.bullets = [];
    state.particles = [];
    state.kills = 0;
    state.crystals = 0;
    state.score = 0;
    state.levelTime = 0;
    state.levelComplete = false;
    state.isEvacuating = false;
    state.gameOver = false;

    if (state.spawnTimer) {
        clearInterval(state.spawnTimer);
        state.spawnTimer = null;
    }

    const hint = document.getElementById('evacuationHint');
    if (hint) hint.style.display = 'none';

    console.log(`🔫 Спавним ${totalEnemies} врагов...`);

    state.spawnTimer = setInterval(() => {
        if (enemiesSpawned >= totalEnemies || state.gameOver) {
            clearInterval(state.spawnTimer);
            state.spawnTimer = null;
            dispatchMessage(`👾 Все ${totalEnemies} врагов на месте! Уничтожьте их.`);
            updateHUD();
            return;
        }
        spawnEnemy();
        enemiesSpawned++;
        updateHUD();
    }, CONFIG.WAVE_SPAWN_INTERVAL || 500);

    dispatchMessage(`🚀 Высадка! Уничтожьте ${totalEnemies} врагов.`);
    updateHUD();
}

function checkLevelComplete() {
    if (state.spawnTimer !== null) return;
    if (state.gameOver) return;
    if (state.levelComplete) return;

    const alive = state.enemies.filter(e => !e.dead).length;
    if (alive === 0 && enemiesSpawned >= totalEnemies) {
        state.levelComplete = true;
        dispatchMessage(`✅ Все враги уничтожены! Нажмите E для эвакуации.`);
        const hint = document.getElementById('evacuationHint');
        if (hint) hint.style.display = 'block';
    }
}