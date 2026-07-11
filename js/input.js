console.log('✅ input.js загружен');

const canvas = document.getElementById('gameCanvas');

window.addEventListener('keydown', function(e) {
    const key = e.key.toLowerCase();
    
    // === ДВИЖЕНИЕ ===
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        window.keys[key] = true;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    if (key === 'shift') {
        window.keys.shift = true;
        e.preventDefault();
        if (typeof startDash === 'function') startDash();
        return false;
    }
    
    if (key === 'r') {
        e.preventDefault();
        if (typeof restartRun === 'function') restartRun();
        return false;
    }
    
    if (key === 'e') {
        e.preventDefault();
        if (typeof evacuate === 'function') evacuate();
        return false;
    }
    
    // === СТРАТЕГЕМЫ (читаем из выбранных слотов) ===
    if (key === '1') {
        e.preventDefault();
        const type = state.selectedStrategems[0];
        if (type && typeof useStrategem === 'function') {
            useStrategem(type);
        } else {
            dispatchMessage('⚠️ Слот 1 пуст');
        }
    }
    if (key === '2') {
        e.preventDefault();
        const type = state.selectedStrategems[1];
        if (type && typeof useStrategem === 'function') {
            useStrategem(type);
        } else {
            dispatchMessage('⚠️ Слот 2 пуст');
        }
    }
    if (key === '3') {
        e.preventDefault();
        const type = state.selectedStrategems[2];
        if (type && typeof useStrategem === 'function') {
            useStrategem(type);
        } else {
            dispatchMessage('⚠️ Слот 3 пуст');
        }
    }
    if (key === '4') {
        e.preventDefault();
        const type = state.selectedStrategems[3];
        if (type && typeof useStrategem === 'function') {
            useStrategem(type);
        } else {
            dispatchMessage('⚠️ Слот 4 пуст');
        }
    }
    
    // === КЛАВИША F — ПОДБОР ===
    if (key === 'f') {
        e.preventDefault();
        // Проверяем ракетницу
        const rocket = state.strategems.rocket;
        if (rocket.active && !rocket.pickedUp && !rocket.fired) {
            const p = state.player;
            const dx = p.x - rocket.x;
            const dy = p.y - rocket.y;
            if (dx*dx + dy*dy < 50*50) {
                rocket.pickedUp = true;
                dispatchMessage('🚀 Ракетница подобрана! ЛКМ — выстрел');
                document.getElementById('rocketIndicator').style.display = 'block';
                return;
            }
        }
        // Проверяем пулемёт
        const mg = state.strategems.machinegun;
        if (mg.active && !mg.pickedUp && !mg.fired) {
            const p = state.player;
            const dx = p.x - mg.x;
            const dy = p.y - mg.y;
            if (dx*dx + dy*dy < 50*50) {
                mg.pickedUp = true;
                dispatchMessage('⚡ Пулемёт подобран! ЛКМ — стрельба');
                document.getElementById('machinegunIndicator').style.display = 'block';
                return;
            }
        }
        dispatchMessage('⚠️ Рядом нет капсулы');
    }
});

window.addEventListener('keyup', function(e) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        window.keys[key] = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    if (key === 'shift') {
        window.keys.shift = false;
        e.preventDefault();
        return false;
    }
});

canvas.setAttribute('tabindex', '0');

canvas.addEventListener('click', function() {
    canvas.focus();
});

document.addEventListener('click', function() {
    canvas.focus();
});

canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    window.mouse.x = (e.clientX - rect.left) * scaleX;
    window.mouse.y = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousedown', function(e) {
    if (e.button === 0) {
        window.mouse.down = true;
        e.preventDefault();
    }
});

canvas.addEventListener('mouseup', function(e) {
    if (e.button === 0) {
        window.mouse.down = false;
        e.preventDefault();
    }
});

canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

console.log('✅ input.js');