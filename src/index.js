const openModalBtn = document.getElementById('create-game');
const inputBox = document.getElementById('input-name');
const submitBtn = document.getElementById('reset-btn');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('create-game');


openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
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
      localStorage.setItem('playerData', json.stringify(playerData));
      console.log('Stored string:', inputValue);
      modal.style.display = 'none';
      overlay.style.display = 'none';
    } else {
      alert('Please enter a string');
    }
  });