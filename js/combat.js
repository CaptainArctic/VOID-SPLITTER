console.log('✅ combat.js (заглушка)');

function updateCombo() {
    state.combo++;
    state.comboTimer = CONFIG.COMBO_TIMEOUT;
    const comboEl = document.getElementById('hudCombo');
    if (comboEl) {
        comboEl.textContent = `x${state.combo}`;
    }
}

function updateComboTimer(dt) {
    if (state.comboTimer > 0) {
        state.comboTimer -= dt;
        if (state.comboTimer <= 0) {
            state.combo = 1;
            const comboEl = document.getElementById('hudCombo');
            if (comboEl) comboEl.textContent = 'x1';
        }
    }
}