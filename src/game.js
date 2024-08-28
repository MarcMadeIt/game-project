document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
    // Cache player data and upgrade ownership
    let retrievedPlayerData = JSON.parse(localStorage.getItem('playerData')) || { score: 0 };
    let upgradeOwnership = loadUpgradeOwnership();

    // Cache DOM elements
    const scoreboard = document.getElementById('points');
    const timerDisplay = document.getElementById('timer');
    const shopDisplay = document.getElementById('shop');
    const shopBtn = document.getElementById("shop-btn");
    const quizContainer = document.getElementById('quiz');
    const closeShopBtn = document.getElementById('close-shop-btn');
    const defaultImage = document.querySelector('#racoon');

    // Initialize game state
    let questions = [];
    let currentQuestionIndex = 0;
    let timeLeft = 20;
    let timerInterval;
    let timerRunning = false;
    let showingModal = false;

    // Update scoreboard and timer display
    if (scoreboard) scoreboard.textContent = retrievedPlayerData.score;
    if (timerDisplay) timerDisplay.textContent = '00:20';

    // Setup initial event listeners
    shopBtn.addEventListener('click', toggleShopModal);
    closeShopBtn?.addEventListener('click', closeShopModal);

    setupShopEventListeners();
    loadQuestions();

    // Function to update score
    function updateScore(points) {
        retrievedPlayerData.score = Math.max(0, retrievedPlayerData.score + points);
        if (scoreboard) scoreboard.textContent = retrievedPlayerData.score;
        localStorage.setItem('playerData', JSON.stringify(retrievedPlayerData));
        console.log("Score updated to:", retrievedPlayerData.score);
    }

    // Function to update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    // Function to load upgrade ownership from localStorage
    function loadUpgradeOwnership() {
        const ownershipJSON = localStorage.getItem('upgradeOwnership');
        return ownershipJSON ? JSON.parse(ownershipJSON) : [false, false, false, false, false, false];
    }

    // Function to save upgrade ownership to localStorage
    function saveUpgradeOwnership(ownership) {
        const ownershipJSON = JSON.stringify(ownership);
        localStorage.setItem('upgradeOwnership', ownershipJSON);
    }

    // Function to setup event listeners for shop buttons
    function setupShopEventListeners() {
        for (let i = 1; i <= 6; i++) {
            const button = document.getElementById(`item${i}`);
            button?.addEventListener('click', () => buyItem(i));
        }
    }

    // Function to load questions from JSON file
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
                if (quizContainer) {
                    quizContainer.innerHTML = 'Failed to load quiz questions.';
                }
            });
    }

    // Function to shuffle questions
    function shuffleQuestions() {
        questions.sort(() => Math.random() - 0.5);
    }

    // Function to load a question
    function loadQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;

        if (quizContainer) {
            currentQuestion.choices.sort(() => Math.random() - 0.5);
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
        } else {
            console.error('Quiz container not found.');
        }

        timeLeft = 20;
        startTimer();
    }

    // Function to handle answer selection
    function selectAnswer(selectedButton) {
        const isCorrect = selectedButton.dataset.isCorrect === 'true';
        const optionButtons = quizContainer.querySelectorAll('.option-item');

        optionButtons.forEach(button => {
            button.disabled = true;
            if (button.dataset.isCorrect === 'true') {
                button.style.border = '5px solid #71d44d';  // Highlight correct answer
            } else if (button === selectedButton) {
                button.style.border = '5px solid #DF2935';  // Highlight wrong answer selected
            } else {
                button.style.border = '5px solid #abb1bd';  // Neutral color for other buttons
            }
        });

        pauseTimer();
        updateScore(isCorrect ? 20 : -10);

        setTimeout(() => {
            if (++currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                console.log('Game Over: No more questions.');
            }
        }, 1500);
    }

    // Function to handle item purchase
    function buyItem(itemNumber) {
        if (upgradeOwnership[itemNumber - 1]) {
            alert("You already own this item.");
            return;
        }

        const button = document.getElementById(`item${itemNumber}`);
        const cost = parseInt(button?.getAttribute('data-cost'), 10);

        if (retrievedPlayerData.score >= cost) {
            retrievedPlayerData.score -= cost;
            updateScore(0);
            upgradeOwnership[itemNumber - 1] = true;
            saveUpgradeOwnership(upgradeOwnership);
            updateShopButtons();
        } else {
            alert("You don't have enough points.");
        }
    }

    // Function to update shop buttons
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
                if (upgradeContent) upgradeContent.style.display = 'flex';
            } else if (retrievedPlayerData.score >= cost) {
                button.classList.remove('button-disabled');
                if (itemFrame) itemFrame.style.opacity = '1';
            } else {
                button.classList.add('button-disabled');
                if (itemFrame) itemFrame.style.opacity = '0.5';
            }
        }

        if (defaultImage) {
            defaultImage.style.display = anyUpgradeOwned ? 'none' : 'flex';
        }
    }

    // Function to create a "sold" button
    function createSoldButton(item) {
        const soldBox = document.createElement('button');
        soldBox.id = `sold${item}`;
        soldBox.innerHTML = 'Owned! <iconify-icon icon="material-symbols:check-circle-rounded" width="20" height="20" style="color: #71d44d"></iconify-icon>';
        soldBox.classList.add('sold-box');
        soldBox.disabled = true;
        return soldBox;
    }

    // Timer functions
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
        if (timerDisplay) timerDisplay.textContent = "PAUSED";
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

    // Function to toggle shop modal visibility
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
