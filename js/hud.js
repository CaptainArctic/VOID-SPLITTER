// ============================================================
//  hud.js — Обновление интерфейса
// ============================================================

console.log('✅ hud.js загружен');

function updateHUD() {
    const hudWave = document.getElementById('hudWave');
    const hudKills = document.getElementById('hudKills');
    const hudXenolite = document.getElementById('hudXenolite');
    const hudScore = document.getElementById('hudScore');
    const hudHealth = document.getElementById('hudHealth');

    if (hudWave) hudWave.textContent = state.wave;
    if (hudKills) hudKills.textContent = state.kills;
    if (hudXenolite) hudXenolite.textContent = `💎 ${state.xenolite}`;
    if (hudScore) hudScore.textContent = state.score;

    if (hudHealth) {
        const hearts = hudHealth.querySelectorAll('.heart');
        hearts.forEach((h, i) => {
            if (i < state.player.health) {
                h.classList.remove('lost');
            } else {
                h.classList.add('lost');
            }
        });
    }
}

function updateStatus() {
    const keyDisplay = document.getElementById('keyDisplay');
    const posDisplay = document.getElementById('posDisplay');

    if (keyDisplay) {
        const k = keys;
        keyDisplay.textContent =
            `W:${k.w ? '✅' : '⬜'} A:${k.a ? '✅' : '⬜'} S:${k.s ? '✅' : '⬜'} D:${k.d ? '✅' : '⬜'}`;
    }

    if (posDisplay) {
        posDisplay.textContent =
            `X:${Math.round(state.player.x)} Y:${Math.round(state.player.y)}`;
    }
}

function gameOverHandler() {
    state.gameOver = true;
    if (state.spawnTimer) clearInterval(state.spawnTimer);

    const score = state.kills * 10 + state.xenolite;
    if (score > state.maxScore) {
        state.maxScore = score;
        localStorage.setItem('nexusMaxScore', score);
    }

    const finalScore = document.getElementById('finalScore');
    const finalWave = document.getElementById('finalWave');
    const finalKills = document.getElementById('finalKills');
    const gameOver = document.getElementById('gameOver');

    if (finalScore) finalScore.textContent = score;
    if (finalWave) finalWave.textContent = state.wave;
    if (finalKills) finalKills.textContent = state.kills;
    if (gameOver) gameOver.classList.add('show');
}

function restartGame() {
    state.player.x = 400;
    state.player.y = 300;
    state.player.health = CONFIG.MAX_HEALTH;
    state.player.invincible = false;
    state.wave = 1;
    state.kills = 0;
    state.xenolite = 0;
    state.score = 0;
    state.bullets = [];
    state.enemies = [];
    state.particles = [];
    state.gameOver = false;
    state.waveActive = false;
    state.shootCooldown = 0;
    state.spawningComplete = false;
    if (state.spawnTimer) clearInterval(state.spawnTimer);

    const gameOver = document.getElementById('gameOver');
    if (gameOver) gameOver.classList.remove('show');

    updateHUD();
    startWave();
}

document.addEventListener('DOMContentLoaded', function() {
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
});