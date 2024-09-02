import { startGame, stopGame, showRestartButton, hideRestartButton, initGame, moveBlockDown, moveBlockLeft, moveBlockRight, rotateBlock } from './gameLogic.js';

document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.game-board');
    const startButton = document.querySelector('.start-button');
    const restartButton = document.querySelector('.restart-button');

    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log('Start button clicked');
            startGame();
            hideRestartButton();
            startButton.classList.add('hidden');
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked');
            stopGame();
            initGame(gameBoard);
            startGame();
            hideRestartButton();
        });
    }

    document.addEventListener('keydown', (event) => {
        console.log('Key pressed:', event.key);
        switch (event.key) {
            case 'ArrowUp':
                console.log('Rotate block');
                rotateBlock();
                break;
            case 'ArrowLeft':
                console.log('Move block left');
                moveBlockLeft();
                break;
            case 'ArrowRight':
                console.log('Move block right');
                moveBlockRight();
                break;
            case 'ArrowDown':
                moveBlockDown();
                break;
        }
    });

    initGame(gameBoard);
});
