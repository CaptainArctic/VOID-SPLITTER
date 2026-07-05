console.log('✅ map.js загружен');

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 900;

const map = {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    buildings: [],
    walls: [],
    spawnPoints: []
};

function generateMap() {
    map.buildings = [];
    map.walls = [];
    map.spawnPoints = [];

    const blockSize = 100;
    const cols = Math.floor(MAP_WIDTH / blockSize);
    const rows = Math.floor(MAP_HEIGHT / blockSize);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * blockSize;
            const y = r * blockSize;
            
            if (Math.random() < 0.6) {
                const isRuined = Math.random() < 0.2;
                const building = {
                    x: x + 3,
                    y: y + 3,
                    w: blockSize - 6,
                    h: blockSize - 6,
                    color: isRuined ? '#2a1a2a' : '#1a2a3a',
                    ruined: isRuined,
                    windows: []
                };
                
                const wc = Math.floor((building.w - 20) / 25);
                const wr = Math.floor((building.h - 20) / 25);
                for (let wi = 0; wi < Math.min(wr, 3); wi++) {
                    for (let wj = 0; wj < Math.min(wc, 3); wj++) {
                        if (Math.random() < 0.5) {
                            building.windows.push({
                                x: 10 + wj * 25,
                                y: 10 + wi * 25,
                                w: 12,
                                h: 16,
                                lit: Math.random() < 0.3
                            });
                        }
                    }
                }
                map.buildings.push(building);
            }
        }
    }

    // Точки спавна
    for (let i = 0; i < 20; i++) {
        const x = 80 + Math.random() * (MAP_WIDTH - 160);
        const y = 80 + Math.random() * (MAP_HEIGHT - 160);
        let inside = false;
        for (const b of map.buildings) {
            if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) {
                inside = true;
                break;
            }
        }
        if (!inside) {
            map.spawnPoints.push({ x, y });
        }
    }
}

function checkWallCollision(x, y, radius) {
    for (const wall of map.walls) {
        const cx = Math.max(wall.x, Math.min(x, wall.x + wall.w));
        const cy = Math.max(wall.y, Math.min(y, wall.y + wall.h));
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy < radius * radius) {
            return true;
        }
    }
    return false;
}

function getSpawnPoint() {
    if (map.spawnPoints.length === 0) return { x: 400, y: 300 };
    const idx = Math.floor(Math.random() * map.spawnPoints.length);
    return map.spawnPoints[idx];
}

generateMap();
console.log('🗺️ Карта сгенерирована:', map.buildings.length, 'зданий');