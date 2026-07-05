console.log('✅ init.js загружен');
console.log('🎮 HELLDIVERS: MIAMI запускается...');

let lastTime = 0;

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

console.log('📋 WASD — движение, Shift — рывок, ЛКМ — стрельба, E — эвакуация, R — рестарт');

requestAnimationFrame(gameLoop);