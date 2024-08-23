document.addEventListener('DOMContentLoaded', function () {
    function includeHTML() {
        return Promise.all([
            fetch('/navbar/index.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    const navbarPlaceholder = document.getElementById('navbar-placeholder');
                    if (navbarPlaceholder) {
                        navbarPlaceholder.innerHTML = data;
                    } else {
                        console.error('Element with ID "navbar-placeholder" not found');
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation for navbar:', error);
                }),

            fetch('/main/index.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    const mainPlaceholder = document.getElementById('main-placeholder');
                    if (mainPlaceholder) {
                        mainPlaceholder.innerHTML = data;
                    } else {
                        console.error('Element with ID "main-placeholder" not found');
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation for main content:', error);
                })
        ]);
    }

    // Call the function and then initialize game logic
    includeHTML().then(() => {
        // Initialize game logic only after HTML is inserted
        initializeGame();
    });
});

function initializeGame() {
    let retrivedPlayerData = JSON.parse(localStorage.getItem('playerData'));
    let score = retrivedPlayerData.score;

    const scoreboard = document.getElementById('points');
    const timerDisplay = document.getElementById('timer');
    var shopDisplay = document.getElementById('shop');
    var shopBtn = document.getElementById("shop-btn");


    if (scoreboard) {
        scoreboard.textContent = score;
    } else {
        console.error('Element with ID "points" not found');
    }

    if (timerDisplay) {
        timerDisplay.textContent = '00:15';
    } else {
        console.error('Element with ID "timer" not found');
    }

    let questions = [];
    let currentQuestionIndex = 0;
    let timeLeft = 15;
    let timerInterval;
    let timerRunning;
    let showingModal;
    

function buyItem(itemNumber, cost) {
    if (score >= cost) {
        score -= cost;
        updateScore();
        alert(`You purchased Item ${itemNumber} for ${cost} points!`); 
        updateScore(score);
    } else {
        alert("You don't have enough points to buy this item.");
    }
    updateShopButtons();
}

function updateShopButtons() {
    for (let i = 1; i <= 5; i++) {
        let button = document.getElementById(`item${i}`);
        
        if (button) { // Ensure the button exists
            let match = button.textContent.match(/\d+/);
            
            if (match) { // Ensure a number was found
                let cost = parseInt(match[0]);
                
                if (score < cost) {
                    button.disabled = true; // Not enough money -- Disable button
                } else {
                    button.disabled = false; // Enable button
                }
            } else {
                console.error(`No number found in button text for item${i}`);
            }
        } else {
            console.error(`Button with id item${i} not found`);
        }
    }
}


    function updateScore() {
        document.getElementById("points").textContent = score;
    }

    shopBtn.addEventListener('click', function () {
        if (shopDisplay.style.display === 'block') {
            closeShopModal();
        } else {
            openShopModal();
        }
    });
    
    function openShopModal() {
        shopDisplay.style.display = 'block';  // Open modal
        pauseTimer();
        updateShopButtons();
    }
    
    function closeShopModal() {
        shopDisplay.style.display = 'none';  // Close modal
        startTimer(); 
    }

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
        startTimer();
        timeLeft = 15;
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

        optionButtons.forEach(button => button.disabled = true);
        optionButtons.forEach(button => {
            const correct = button.dataset.isCorrect === 'true';
            if (correct) {
                button.style.border = '3px solid #71d44d';
                button.style.color = '#171717'  // Highlight correct answer
            } else if (button === selectedButton) {
                button.style.border = '3px solid #DF2935';
                button.style.color = '#171717'  // Highlight wrong answer selected
                updateScore(-10);
                scoreboard.textContent = retrivedPlayerData.score;
            } else {
                button.style.border = '3px solid #abb1bd';
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
                    currentQuestionIndex++;
                    loadQuestion();
                    startTimer();
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

    function timeUpModal() {
        return new Promise((resolve) => {
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
                timerRunning = true;
                resolve();
            }, 3000);
        });
    }

    function updateScore(points) {
        retrivedPlayerData.score += points;
        localStorage.setItem('playerData', JSON.stringify(retrivedPlayerData));
        console.log("Score updated to: " + score);
    }

    // Load questions when the page loads
    loadQuestions();

    
}
