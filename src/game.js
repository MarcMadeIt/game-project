document.addEventListener('DOMContentLoaded', function () {
    initializeGame();
});

function initializeGame() {
    let retrivedPlayerData = JSON.parse(localStorage.getItem('playerData'));
    let score = retrivedPlayerData.score;
    const scoreboard = document.getElementById('points');
    const timerDisplay = document.getElementById('timer');
    var shopDisplay = document.getElementById('shop');
    var shopBtn = document.getElementById("shop-btn");
    let questions = [];
    let currentQuestionIndex = 0;
    let timeLeft = 15;
    let timerInterval;
    let timerRunning;
    let showingModal;

    function updateScore() {
        document.getElementById("points").textContent = score;
    }

    function updateShopButtons(retrivedPlayerData) {
        retrivedPlayerData = JSON.parse(localStorage.getItem('playerData'));
        for (let i = 1; i <= 6; i++) {
            const button = document.querySelector(`#item${i}`);
            const itemFrame = document.querySelector(`#shop-item${i}`);
            if (button) {
                const costAttribute = button.getAttribute('data-cost');        
                if (costAttribute !== null) {
                    const cost = parseInt(costAttribute);
                    if (!isNaN(cost)) {
                        console.log(`Button #item${i}: cost = ${cost}, player score = ${retrivedPlayerData.score}`);
                        if (retrivedPlayerData.score >= cost) {
                            console.log(`Button #item${i} is enabled`);
                            
                            if (itemFrame) {
                                itemFrame.style.opacity = '1';
                            }
                        } else {
                            console.log(`Button #item${i} is disabled`);
                            button.classList.add('button-disabled');
                            if (itemFrame) {
                                itemFrame.style.opacity = '0.5';
                            }
                        }
                    } else {
                        console.error(`Invalid cost value for item${i}`);
                    }
                } else {
                    console.error(`data-cost attribute missing for item${i}`);
                }
            } else {
                console.error(`Button with id item${i} not found`);
            }
        }
        console.log('Finished updateShopButtons function');
    }

    function setupEventListeners() {
        for (let i = 1; i <= 6; i++) {
            let button = document.getElementById(`item${i}`);
            if (button) {
                button.addEventListener('click', () => buyItem(i, parseInt(button.getAttribute('data-cost'), 10)));
            } else {
                console.error(`Button with id item${i} not found`);
            }
        }
    }

    function buyItem(itemNumber) {
        const button = document.getElementById(`item${itemNumber}`);
        const cost = parseInt(button.getAttribute('data-cost'), 10);
        const soldBox = document.createElement('button');
        soldBox.id = `sold${itemNumber}`;
        soldBox.innerHTML = 'Owned! <iconify-icon icon="material-symbols:check-circle-rounded" width="20" height="20" style="color: #71d44d"></iconify-icon>';
        soldBox.classList.add('sold-box');

        console.log(`Attempting to buy Item ${itemNumber} for ${cost} points. Current score: ${score}`);

        if (retrivedPlayerData.score >= cost) {
            retrivedPlayerData.score -= cost;
            updateScore(0);
            scoreboard.textContent = retrivedPlayerData.score;
            button.parentNode.replaceChild(soldBox, button);
        } else {
            alert("You don't have enough points to buy this item.");
        }
        updateShopButtons();
    }

    window.onload = function () {
        updateScore(0);
        updateShopButtons(retrivedPlayerData);
        setupEventListeners();
    }

    shopBtn.addEventListener('click', function () {
        if (shopDisplay.style.display === 'block') {
            closeShopModal();
        } else {
            openShopModal();
        }
    });

    function openShopModal() {
        shopDisplay.style.display = 'block';
        pauseTimer();
        updateShopButtons();
    }

    function closeShopModal() {
        shopDisplay.style.display = 'none';
        startTimer();

    }

    document.getElementById('close-shop-btn').addEventListener('click', function () {
        closeShopModal();
    });

    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            questions = await response.json();
            shuffleQuestions();
            loadQuestion();
        } catch (error) {
            console.error('Failed to load questions:', error);
            const quizContainer = document.getElementById('quiz');
            if (quizContainer) {
                quizContainer.innerHTML = 'Failed to load quiz questions.';
            } else {
                console.error('Element with ID "quiz" not found');
            }
        }
    }

    function shuffleQuestions() {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
    }

    function loadQuestion() {
        const quizContainer = document.getElementById('quiz');
        const currentQuestion = questions[currentQuestionIndex];
        timeLeft = 15;
        startTimer();
        if (quizContainer) {
            currentQuestion.choices.sort(() => Math.random() - 0.5);
            quizContainer.innerHTML = `
                <div class="question">${currentQuestion.question}</div>
                <div class="options">
                    ${currentQuestion.choices.map((choice, index) => `
                        <button class="option-item" data-is-correct="${choice.isCorrect}">
                            ${choice.answer}
                        </button>
                    `).join('')}
                </div>
            `;

            // Add event listeners
            quizContainer.querySelectorAll('.option-item').forEach(button => {
                button.addEventListener('click', function () {
                    selectAnswer(this);
                });
            });
        } else {
            console.error('Element with ID "quiz" not found');
        }
    }

    function selectAnswer(selectedButton) {
        const isCorrect = selectedButton.dataset.isCorrect === 'true';
        const optionButtons = document.querySelectorAll('.option-item');
        pauseTimer();
        optionButtons.forEach(button => button.disabled = true);
        optionButtons.forEach(button => {
            const correct = button.dataset.isCorrect === 'true';
            if (correct) {
                button.style.border = '5px solid #71d44d';
                button.style.color = '#171717'  // Highlight correct answer
            } else if (button === selectedButton) {
                button.style.border = '5px solid #DF2935';
                button.style.color = '#171717'  // Highlight wrong answer selected
                updateScore(-10);
                scoreboard.textContent = retrivedPlayerData.score;
            } else {
                button.style.border = '5px solid #abb1bd';
                button.style.color = '#171717'  // Neutral color for other buttons
            }
        });

        if (isCorrect) {
            updateScore(20);
            if (scoreboard) {
                scoreboard.textContent = retrivedPlayerData.score;
            }
        }
        currentQuestionIndex++;
        setTimeout(() => {
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                // End the game -- No more questions 
            }
        }, 1500);  // Wait for 1.5 seconds before loading the next question
    }

    async function startTimer() {
        if (!timerRunning) {
            timerRunning = true;
            updateTimerDisplay();
            timerInterval = setInterval(async () => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    await timeUpModal();
                } else {
                    updateTimerDisplay();
                }
            }, 1000);
        }
    }
    function pauseTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerDisplay.textContent = "PAUSED";

    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            console.error('Element with ID "timer" not found');
        }
    }

    async function timeUpModal() {
        await new Promise((resolve) => {
            pauseTimer();
            const optionButtons = document.querySelectorAll('.option-item');
            optionButtons.forEach(button => button.disabled = true);
            showingModal = true;
            const modal = document.getElementById('time-up');
            modal.style.display = 'flex';
            updateScore(-10);
            scoreboard.textContent = retrivedPlayerData.score;
            setTimeout(() => {
                modal.style.display = 'none';
                showingModal = false;
                currentQuestionIndex++;
                resolve();
            }, 3000);
        });
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
            startTimer();
        } else {
        }
    }

    function updateScore(points) {
        retrivedPlayerData.score += points;
        if (retrivedPlayerData.score < 0) {
            retrivedPlayerData.score = 0;
        }
        localStorage.setItem('playerData', JSON.stringify(retrivedPlayerData));
        console.log("Score updated to: " + retrivedPlayerData.score);
    }

    // Load questions when the page loads
    loadQuestions();


}
