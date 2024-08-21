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
    let score = 0;
    const scoreboard = document.getElementById('points');
    const timerDisplay = document.getElementById('timer');
    const ShopDisplay = document.getElementById('shop');

    if (scoreboard) {
        scoreboard.textContent = 'Points: ' + score;
    } else {
        console.error('Element with ID "points" not found');
    }

    if (timerDisplay) {
        timerDisplay.textContent = '00:10';
    } else {
        console.error('Element with ID "timer" not found');
    }

    let questions = [];
    let currentQuestionIndex = 0;
    let timeLeft = 15;
    let timerInterval;
    let timerRunning;
    let showingModal;

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
        if (!timerRunning) {
            startTimer();
        }
        if (quizContainer) {
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

        // Disable all buttons after one is clicked
        optionButtons.forEach(button => button.disabled = true);

        // Highlight the correct and wrong answers
        optionButtons.forEach(button => {
            const correct = button.dataset.isCorrect === 'true';
            if (correct) {
                button.style.border = '3px solid #71d44d';
                button.style.color = '#171717'  // Highlight correct answer
            } else if (button === selectedButton) {
                button.style.border = '3px solid #DF2935';
                button.style.color = '#171717'  // Highlight wrong answer selected
            } else {
                button.style.border = '3px solid #abb1bd';
                button.style.color = '#171717'  // Neutral color for other buttons
            }
        });

        if (isCorrect) {
            score++;
            if (scoreboard) {
                scoreboard.textContent = 'Points: ' + score;
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
        timerRunning = true;
        if (timerRunning) {
            updateTimerDisplay();
            timerInterval = setInterval(async () => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    await timeUpModal();           
                    currentQuestionIndex++;
                    loadQuestion();
                    startTimer();                  
                } else {
                    updateTimerDisplay();
                }
            }, 1000);
        } else {
            //Freeze the timer and do something -- Store etc.
        }
    }
    

    function pauseTimer() {
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
            showingModal = true;
            const modal = document.getElementById('time-up');
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.style.display = 'none';
                showingModal = false;
                resolve();
            }, 3000);
        });
    }
    

    // Load questions when the page loads
    loadQuestions();
}
