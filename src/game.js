document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    // Cache DOM elements
    const scoreboard = document.getElementById('points');
    const timerDisplay = document.getElementById('timer');
    const shopDisplay = document.getElementById('shop');
    const shopBtn = document.getElementById("shop-btn");
    const quizContainer = document.getElementById('quiz');
    const closeShopBtn = document.getElementById('close-shop-btn');
    const defaultImage = document.querySelector('#racoon');

    // Cache player data and upgrade ownership
    let retrivedPlayerData = JSON.parse(localStorage.getItem('playerData')) || { score: 0 };
    let upgradeOwnership = JSON.parse(localStorage.getItem('upgradeOwnership')) || [false, false, false, false, false, false];
    
    // Initialize game state
    let questions = [];
    let currentQuestionIndex = 0;
    let timeLeft = 20;
    let timerInterval;
    let timerRunning = false;
    let showingModal = false;

    // Update scoreboard and timer display
    updateScore(0);
    updateTimerDisplay();

    // Setup initial event listeners
    shopBtn.addEventListener('click', toggleShopModal);
    closeShopBtn?.addEventListener('click', closeShopModal);

    setupEventListeners();
    loadQuestions();

    function updateScore(points) {
        retrivedPlayerData.score = Math.max(0, retrivedPlayerData.score + points);
        scoreboard.textContent = retrivedPlayerData.score;
        localStorage.setItem('playerData', JSON.stringify(retrivedPlayerData));
        console.log("Score updated to:", retrivedPlayerData.score);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function setupEventListeners() {
        for (let i = 1; i <= 6; i++) {
            const button = document.getElementById(`item${i}`);
            button?.addEventListener('click', () => buyItem(i));
        }
    }

    function loadQuestions() {
        fetch('questions.json')
            .then(response => response.json())
            .then(data => {
                questions = data;
                shuffleQuestions();
                loadQuestion();
            })
            .catch(error => {
                console.error('Failed to load questions:', error);
                quizContainer.innerHTML = 'Failed to load quiz questions.';
            });
    }

    function shuffleQuestions() {
        questions.sort(() => Math.random() - 0.5);
    }

    function loadQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;

        quizContainer.innerHTML = `
            <div class="question">${currentQuestion.question}</div>
            <div class="options">
                ${currentQuestion.choices.map(choice => `
                    <button class="option-item" data-is-correct="${choice.isCorrect}">${choice.answer}</button>
                `).join('')}
            </div>
        `;

        quizContainer.querySelectorAll('.option-item').forEach(button => {
            button.addEventListener('click', () => selectAnswer(button));
        });

        timeLeft = 20;
        startTimer();
    }

    function selectAnswer(selectedButton) {
        const isCorrect = selectedButton.dataset.isCorrect === 'true';
        const optionButtons = quizContainer.querySelectorAll('.option-item');

        optionButtons.forEach(button => {
            button.disabled = true;
            button.style.border = button.dataset.isCorrect === 'true' ? '5px solid #71d44d' : '5px solid #DF2935';
        });

        pauseTimer();
        if (isCorrect) updateScore(20); else updateScore(-10);

        setTimeout(() => {
            if (++currentQuestionIndex < questions.length) loadQuestion();
            else console.log('Game Over: No more questions.');
        }, 1500);
    }

    function buyItem(itemNumber) {
        if (upgradeOwnership[itemNumber - 1]) return alert("You already own this item.");
        
        const cost = parseInt(document.getElementById(`item${itemNumber}`).getAttribute('data-cost'), 10);
        if (retrivedPlayerData.score < cost) return alert("You don't have enough points.");

        retrivedPlayerData.score -= cost;
        updateScore(0);
        upgradeOwnership[itemNumber - 1] = true;
        localStorage.setItem('upgradeOwnership', JSON.stringify(upgradeOwnership));
        updateShopButtons();
    }

    function updateShopButtons() {
        let anyUpgradeOwned = false;
        for (let i = 1; i <= 6; i++) {
            const button = document.querySelector(`#item${i}`);
            const itemFrame = document.querySelector(`#shop-item${i}`);
            const upgradeContent = document.querySelector(`#upgradeContent${i}`);
            const isOwned = upgradeOwnership[i - 1];
            const cost = parseInt(button?.getAttribute('data-cost'), 10);
            
            if (isOwned) {
                anyUpgradeOwned = true;
                button.parentNode.replaceChild(createSoldButton(i), button);
                upgradeContent.style.display = 'flex';
            } else if (retrivedPlayerData.score >= cost) {
                button.classList.remove('button-disabled');
                itemFrame.style.opacity = '1';
            } else {
                button.classList.add('button-disabled');
                itemFrame.style.opacity = '0.5';
            }
        }

        defaultImage.style.display = anyUpgradeOwned ? 'none' : 'flex';
    }

    function createSoldButton(item) {
        const soldBox = document.createElement('button');
        soldBox.id = `sold${item}`;
        soldBox.innerHTML = 'Owned! <iconify-icon icon="material-symbols:check-circle-rounded" width="20" height="20" style="color: #71d44d"></iconify-icon>';
        soldBox.classList.add('sold-box');
        soldBox.disabled = true;
        return soldBox;
    }

    function startTimer() {
        if (timerRunning) return;
        timerRunning = true;
        timerInterval = setInterval(() => {
            if (--timeLeft <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                timeUpModal();
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerDisplay.textContent = "PAUSED";
    }

    function timeUpModal() {
        pauseTimer();
        const modal = document.getElementById('time-up');
        modal.style.display = 'flex';
        updateScore(-10);
        setTimeout(() => {
            modal.style.display = 'none';
            if (++currentQuestionIndex < questions.length) {
                loadQuestion();
                startTimer();
            }
        }, 3000);
    }

    function toggleShopModal() {
        if (shopDisplay.style.display === 'flex') closeShopModal();
        else openShopModal();
    }

    function openShopModal() {
        shopDisplay.style.display = 'flex';
        pauseTimer();
        updateShopButtons();
    }

    function closeShopModal() {
        shopDisplay.style.display = 'none';
        startTimer();
    }
}
