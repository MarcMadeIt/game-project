const resetBtn = document.getElementById('reset-btn');

resetBtn.addEventListener('click', () => {
  localStorage.removeItem('score');
  console.log('Local storage has been reset');
});