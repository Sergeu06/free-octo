let gameBoard;
let activeBlock;
let nextBlock;
let gameInterval;
let score = 0;
let level = 1;
let isGameRunning = false;
let isBlockActive = false;

const BLOCK_SHAPES = [
    { shape: [[1, 1, 1], [0, 1, 0]], color: 'cyan' },
    { shape: [[1, 1], [1, 1]], color: 'yellow' },
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
    { shape: [[1, 1, 1, 1]], color: 'blue' },
    { shape: [[1, 1, 1], [1, 0, 0]], color: 'orange' },
    { shape: [[1, 1, 1], [0, 0, 1]], color: 'purple' }
];

export function initGame(boardElement) {
    gameBoard = boardElement;
    resetGame();
    spawnNewBlock();
}

function resetGame() {
    score = 0;
    level = 1;
    isBlockActive = false;
    clearBoard();
    updateScore();
    updateLevel();
}

function clearBoard() {
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.classList.add('block');
            gameBoard.appendChild(cell);
        }
    }
}

function spawnNewBlock() {
    if (!isBlockActive) {
        activeBlock = generateBlock();
        if (!canPlaceBlock(activeBlock)) {
            stopGame();
            showRestartButton();
        } else {
            drawBlock();
            isBlockActive = true;
        }
    }
}

function generateBlock() {
    const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
    const shapeData = BLOCK_SHAPES[randomIndex];
    return {
        shape: shapeData.shape,
        color: shapeData.color,
        position: { x: 4, y: 0 }
    };
}

function drawBlock() {
    console.log('Drawing block', activeBlock);
    clearBoard();
    Array.from(gameBoard.children).forEach((cell, index) => {
        const x = index % 10;
        const y = Math.floor(index / 10);
        if (isCellFilled({ x, y })) {
            cell.classList.add('filled');
            cell.style.backgroundColor = getCellColor({ x, y });
        }
    });
    if (activeBlock && activeBlock.shape) {
        activeBlock.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const index = (activeBlock.position.y + y) * 10 + (activeBlock.position.x + x);
                    const blockCell = gameBoard.children[index];
                    blockCell.classList.add('filled');
                    blockCell.style.backgroundColor = activeBlock.color;
                }
            });
        });
    }
}

export function rotateBlock() {
    if (activeBlock && activeBlock.shape) {
        const newShape = activeBlock.shape[0].map((val, index) =>
            activeBlock.shape.map(row => row[index]).reverse()
        );
        activeBlock.shape = newShape;
        if (!canPlaceBlock(activeBlock)) {
            activeBlock.shape = activeBlock.shape[0].map((val, index) =>
                activeBlock.shape.map(row => row[row.length - 1 - index])
            );
        }
        drawBlock();
    }
}

export function moveBlockLeft() {
    if (activeBlock && activeBlock.shape) {
        console.log('Moving block left', activeBlock);
        activeBlock.position.x -= 1;
        if (!canPlaceBlock(activeBlock)) {
            activeBlock.position.x += 1;
        }
        drawBlock();
    }
}

export function moveBlockRight() {
    if (activeBlock && activeBlock.shape) {
        console.log('Moving block right', activeBlock);
        activeBlock.position.x += 1;
        if (!canPlaceBlock(activeBlock)) {
            activeBlock.position.x -= 1;
        }
        drawBlock();
    }
}

export function moveBlockDown() {
    if (activeBlock && activeBlock.shape) {
        console.log('Moving block down', activeBlock);
        activeBlock.position.y += 1;
        if (!canMoveBlockDown()) {
            activeBlock.position.y -= 1;
            fixBlockAndSpawnNew();
        }
        drawBlock();
    }
}

function fixBlockAndSpawnNew() {
    lockBlock();
    isBlockActive = false;
    clearLines();
    spawnNewBlock();
}

function canMoveBlockDown() {
    activeBlock.position.y += 1;
    const canMove = canPlaceBlock(activeBlock);
    activeBlock.position.y -= 1;
    return canMove;
}

function canPlaceBlock(block) {
    const result = block.shape.every((row, y) =>
        row.every((cell, x) => {
            if (cell === 1) {
                const posX = block.position.x + x;
                const posY = block.position.y + y;
                const canPlace = posX >= 0 && posX < 10 && posY < 20 && !isCellFilled({ x: posX, y: posY });
                console.log(`Checking cell (${posX}, ${posY}): ${canPlace}`);
                return canPlace;
            }
            return true;
        })
    );
    console.log('Can place block:', result);
    return result;
}

function lockBlock() {
    if (!activeBlock || !activeBlock.shape) return;
    activeBlock.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                setCellFilled({ x: activeBlock.position.x + x, y: activeBlock.position.y + y }, activeBlock.color);
            }
        });
    });
}

function clearLines() {
    for (let row = 19; row >= 0; row--) {
        if (isLineFull(row)) {
            clearLine(row);
            moveLinesDown(row);
            row++;
            score += 100;
            updateScore();
            if (score % 1000 === 0) {
                level++;
                updateLevel();
                increaseSpeed();
            }
        }
    }
}

function isLineFull(row) {
    for (let col = 0; col < 10; col++) {
        if (!gameBoard.children[row * 10 + col].classList.contains('filled')) {
            return false;
        }
    }
    return true;
}

function moveLinesDown(startRow) {
    for (let row = startRow; row > 0; row--) {
        for (let col = 0; col < 10; col++) {
            const index = row * 10 + col;
            const aboveIndex = (row - 1) * 10 + col;
            gameBoard.children[index].className = gameBoard.children[aboveIndex].className;
            gameBoard.children[index].style.backgroundColor = gameBoard.children[aboveIndex].style.backgroundColor;
        }
    }
}

function isCellFilled(position) {
    const index = position.y * 10 + position.x;
    return gameBoard.children[index].classList.contains('filled');
}

function setCellFilled(position, color) {
    const index = position.y * 10 + position.x;
    gameBoard.children[index].classList.add('filled');
    gameBoard.children[index].style.backgroundColor = color;
}

function getCellColor(position) {
    const index = position.y * 10 + position.x;
    return gameBoard.children[index].style.backgroundColor;
}

function updateScore() {
    const scoreElement = document.querySelector('.score');
    if (scoreElement) {
        scoreElement.textContent = `Score: ${score}`;
    }
}

function updateLevel() {
    const levelElement = document.querySelector('.level');
    if (levelElement) {
        levelElement.textContent = `Level: ${level}`;
    }
}

function increaseSpeed() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    const newInterval = 1000 - (level - 1) * 100;
    gameInterval = setInterval(() => {
        if (isBlockActive) {
            moveBlockDown();
        } else {
            fixBlockAndSpawnNew();
        }
    }, newInterval > 100 ? newInterval : 100);
}

export function startGame() {
    if (!isGameRunning) {
        gameInterval = setInterval(() => {
            if (isBlockActive) {
                moveBlockDown();
            } else {
                fixBlockAndSpawnNew();
            }
        }, 1000);
        isGameRunning = true;
        console.log('Game started');
    }
}

export function stopGame() {
    if (isGameRunning) {
        clearInterval(gameInterval);
        isGameRunning = false;
        console.log('Game stopped');
    }
}

export function showRestartButton() {
    const restartButton = document.querySelector('.restart-button');
    if (restartButton) {
        restartButton.style.display = 'block';
    }
}

export function hideRestartButton() {
    const restartButton = document.querySelector('.restart-button');
    if (restartButton) {
        restartButton.style.display = 'none';
    }
}
