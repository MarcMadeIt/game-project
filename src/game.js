

function includeHTML() {
    // Find det element, hvor du vil inkludere navbaren
    const navbarPlaceholder = document.getElementById('navbar-placeholder');

    // Brug Fetch API til at hente indholdet af navbar.html
    fetch('/navbar/navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Indsæt indholdet af navbar.html i navbarPlaceholder-diven
            navbarPlaceholder.innerHTML = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Kald funktionen for at inkludere navbaren
includeHTML();

const scoreboard = document.getElementById('points');
const timerDisplay = document.getElementById('timer');
scoreboard.textContent = score;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
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
        document.getElementById('quiz').innerHTML = 'Failed to load quiz questions.';
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
    
    quizContainer.innerHTML = `
        <div class="question">${currentQuestion.question}</div>
        <div class="options">
            ${currentQuestion.choices.map((choice, index) => `
                <button onclick="selectAnswer(${choice.isCorrect})" class="option-item">${choice.answer}</button>
            `).join('')}
        </div>
    `;
}

function selectAnswer(isCorrect) {
    if (isCorrect) {
        score++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        // end the game
    }
}

function startTimer() {
    updateTimerDisplay();
    timerRunning = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            //end the game
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Load questions when the page loads
window.onload = loadQuestions;
