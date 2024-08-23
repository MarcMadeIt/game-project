const openModalBtn = document.getElementById('create-game');
const inputBox = document.getElementById('input-name');
const submitBtn = document.getElementById('reset-btn');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('create-name');
const closeBtn = document.getElementById('close-btn');
const contiuneBtn = document.getElementById('prev-cont');

openModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    overlay.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
});

submitBtn.addEventListener('click', () => {
    localStorage.removeItem('score');
    let inputValue = inputBox.value;
    if (inputValue) {
        let playerData = {
            name: inputValue,
            score: 0
        };
        localStorage.setItem('playerData', JSON.stringify(playerData));
        console.log('Stored string:', inputValue);
        modal.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        alert('Please enter a string');
    }
});

window.onload = function() {
    const previousGameName = document.getElementById('prev-game');
    const previousGameScore = document.getElementById('prev-score');
    const playerData = JSON.parse(localStorage.getItem('playerData'));

    if (playerData) {
        previousGameName.textContent = `${playerData.name}`;
        previousGameScore.textContent = `${playerData.score}`;
    } else {
        contiuneBtn.style.display = 'none';
    }
};