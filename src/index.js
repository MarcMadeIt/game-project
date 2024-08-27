const openModalBtn = document.getElementById('create-game');

const inputBox = document.getElementById('input-name');
const submitBtn = document.getElementById('reset-btn');

const overlay = document.getElementById('overlay');
const CreateName = document.getElementById('create-name');

const closeBtn = document.getElementById('close-btn');

const contiuneBtn = document.getElementById('prev-cont');

const rulesBtn = document.getElementById('rules-game');
const rulesModal = document.getElementById('rules-content');

const scoreBoardBtn = document.getElementById('score-board');
const ScoreBoardModal = document.getElementById('score-board-content');

scoreBoardBtn.addEventListener('click', () => {
    ScoreBoardModal.style.display = 'flex';
});

rulesBtn.addEventListener('click', () => {
    rulesModal.style.display = 'flex';
    overlay.style.display = 'block';
});

openModalBtn.addEventListener('click', () => {
    CreateName.style.display = 'flex';
    rulesModal.style.display = 'none';
    overlay.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    CreateName.style.display = 'none';
    overlay.style.display = 'none';
    rulesModal.style.display = 'none';
});

submitBtn.addEventListener('click', (event) => {
    let inputValue = inputBox.value;
    if (!inputValue) {
        event.preventDefault();
        alert('Please enter a string');
        return;
    }
    localStorage.removeItem('score');
    localStorage.removeItem('upgradeOwnership');
    let playerData = {
        name: inputValue,
        score: 0
    };
    localStorage.setItem('playerData', JSON.stringify(playerData));
    console.log('Stored string:', inputValue);
    modal.style.display = 'none';
    overlay.style.display = 'none';
});

window.onload = function () {
    const previousGameName = document.getElementById('prev-game-name');
    const previousGameScore = document.getElementById('prev-game-score');
    const playerData = JSON.parse(localStorage.getItem('playerData'));

    if (previousGameName && previousGameScore) {
        if (playerData) {
            previousGameName.textContent = `${playerData.name}`;
            previousGameScore.textContent = `${playerData.score}`;
        } else {
            contiuneBtn.style.display = 'none';
        }
    } else {
        console.error("The elements 'prev-game' or 'prev-score' were not found in the DOM.");
    }
};