let circle, ball, maxBallSize, increaseSize, delay, bounceStrength, notes;
let ballSize, posX, posY, velocityX, velocityY, gravity, bounceAcceleration;
let intervalId, gameOver, paused;
let initialSpeedX, initialSpeedY; // Добавим переменные для хранения начальной скорости шара
let audioVolume = 1.0;

function initialize() {
    circle = document.querySelector('.circle');
    ball = document.querySelector('.ball');
    maxBallSize = circle.clientWidth;
    increaseSize = 5;
    delay = 25;
    bounceStrength = 1.1;
    notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    gameOver = false;
    paused = false;
    initialSpeedX = Math.random() * 4 - 2; // Задаем начальную скорость X
    initialSpeedY = Math.random() * 4 - 2; // Задаем начальную скорость Y
    resetBall();
    resetBall();
    intervalId = setInterval(createTrail, 100); // Перезапуск интервала создания следов
    moveBall();
}

function resetBall() {
    increaseSize = 5;
    delay = 25;
    bounceStrength = 1.1;
    ballSize = 50;
    posX = circle.clientWidth / 2 - ballSize / 2;
    posY = circle.clientHeight / 2 - ballSize / 2;
    
    // Сбрасываем начальную скорость шара
    velocityX = initialSpeedX;
    velocityY = initialSpeedY;
    
    // Сбрасываем ускорение шара
    gravity = 0.2;
    bounceAcceleration = 1.0;
    
    ball.style.width = `${ballSize}px`;
    ball.style.height = `${ballSize}px`;
    ball.style.left = `${posX}px`;
    ball.style.top = `${posY}px`;
}


function playNote() {
    if (gameOver || paused) return;
    const audio = new Audio(`notes/${notes[Math.floor(Math.random() * notes.length)]}.mp3`);
    audio.volume = audioVolume;
    audio.play();
}

function createTrail() {
    if (gameOver || paused) return;
    const trail = document.createElement('div');
    trail.className = 'trail';
    trail.style.width = `${ballSize}px`;
    trail.style.height = `${ballSize}px`;
    trail.style.left = `${posX}px`;
    trail.style.top = `${posY}px`;
    trail.style.background = getComputedStyle(ball).backgroundColor;
    circle.appendChild(trail);
}

function moveBall() {
    if (gameOver || paused) return;

    posX += velocityX;
    posY += velocityY;
    velocityY += gravity;

    const dx = posX + ballSize / 2 - circle.clientWidth / 2;
    const dy = posY + ballSize / 2 - circle.clientHeight / 2;
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

    if (distanceToCenter + ballSize / 2 >= circle.clientWidth / 2) {
        const angle = Math.atan2(dy, dx);
        const normalX = dx / distanceToCenter;
        const normalY = dy / distanceToCenter;
        const dotProduct = velocityX * normalX + velocityY * normalY;

        velocityX = (velocityX - 2 * dotProduct * normalX) * bounceAcceleration;
        velocityY = (velocityY - 2 * dotProduct * normalY) * bounceAcceleration;

        velocityX *= bounceStrength;
        velocityY *= bounceStrength;

        posX = circle.clientWidth / 2 - ballSize / 2 + (circle.clientWidth / 2 - ballSize / 2) * normalX;
        posY = circle.clientHeight / 2 - ballSize / 2 + (circle.clientHeight / 2 - ballSize / 2) * normalY;

        setTimeout(() => {
            const prevBallSize = ballSize;
            ballSize = Math.min(ballSize + increaseSize, maxBallSize);
            const sizeIncrease = ballSize - prevBallSize;

            ball.style.width = `${ballSize}px`;
            ball.style.height = `${ballSize}px`;

            // Корректировка позиции шара после увеличения
            posX -= sizeIncrease / 2;
            posY -= sizeIncrease / 2;
            ball.style.left = `${posX}px`;
            ball.style.top = `${posY}px`;

            if (ballSize >= maxBallSize) {
                gameOver = true;
                document.querySelector('.game-over').style.display = 'block';
                clearInterval(intervalId);
            }
        }, delay);

        playNote();
    }

    ball.style.left = `${posX}px`;
    ball.style.top = `${posY}px`;

    if (!gameOver && !paused) {
        requestAnimationFrame(moveBall);
    }
}

function restart() {
    resetVelocity(); // Сбрасываем скорость шара перед началом игры
    document.querySelector('.game-over').style.display = 'none';
    gameOver = false;
    paused = false;
    resetBall();
    const trails = document.querySelectorAll('.trail');
    trails.forEach(trail => trail.remove());
    clearInterval(intervalId);
    moveBall();

    // Вызываем функцию создания следа
    intervalId = setInterval(createTrail, 100);
}

function resetVelocity() {
    initialSpeedX = Math.random() * 4 - 2; // Генерируем новую начальную скорость X
    initialSpeedY = Math.random() * 4 - 2; // Генерируем новую начальную скорость Y
    velocityX = initialSpeedX;
    velocityY = initialSpeedY;
}


function togglePause() {
    paused = !paused;
    document.getElementById('settingsModal').style.display = paused ? 'block' : 'none';
    document.getElementById('overlay').style.display = paused ? 'block' : 'none';

    if (!paused) {
        moveBall();
    }
}

function changeVolume(value) {
    audioVolume = value;
}

function restartFromModal() {
    togglePause();
    restart();
}

function continueGame() {
    togglePause();
}

// Запуск игры
initialize();