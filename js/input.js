console.log('✅ input.js загружен');

const canvas = document.getElementById('gameCanvas');

window.addEventListener('keydown', function(e) {
    const key = e.key.toLowerCase();
    
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
    
    if (key === '1') { e.preventDefault(); if (typeof useStrategem === 'function') useStrategem('airstrike'); }
    if (key === '2') { e.preventDefault(); if (typeof useStrategem === 'function') useStrategem('shield'); }
    if (key === '3') { e.preventDefault(); if (typeof useStrategem === 'function') useStrategem('turret'); }
    if (key === '4') { e.preventDefault(); if (typeof useStrategem === 'function') useStrategem('medkit'); }
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