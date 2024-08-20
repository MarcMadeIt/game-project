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
    let score = 7;
    const scoreboard = document.getElementById('points');
    const timerDisplay = document.getElementById('timer');

    if (scoreboard) {
        scoreboard.textContent = ' Points: ' + score;
    } else {
        console.error('Element with ID "points" not found');
    }

    if (timerDisplay) {
        timerDisplay.textContent = '00:10'; // Initialize timer display or adjust as needed
    } else {
        console.error('Element with ID "timer" not found');
    }

    let questions = [];
    let currentQuestionIndex = 0;
    let timeLeft = 10;
    let timerInterval;
    let timerRunning;

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
        if (quizContainer) {
            quizContainer.innerHTML = `
                <div class="question">${currentQuestion.question}</div>
                <div class="options">
                    ${currentQuestion.choices.map((choice, index) => `
                        <button onclick="selectAnswer(${choice.isCorrect})" class="option-item">${choice.answer}</button>
                    `).join('')}
                </div>
            `;
        } else {
            console.error('Element with ID "quiz" not found');
        }
    }

    function selectAnswer(isCorrect) {
        if (isCorrect) {
            score++;
            if (scoreboard) {
                scoreboard.textContent = score;
            }
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            // End the game
        }
    }

    function startTimer() {
        updateTimerDisplay();
        timerRunning = true;
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // End the game
            } else {
                updateTimerDisplay();
            }
        }, 1000);
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

    // Load questions when the page loads
    loadQuestions();
}
