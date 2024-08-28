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
    let timeLeft = 20;
    let timerInterval;
    let timerRunning;
    let showingModal;

    function updateScore() {
        document.getElementById("points").textContent = score;
    }

    function loadUpgradeOwnership() {
        const ownershipJSON = localStorage.getItem('upgradeOwnership');
        if (ownershipJSON) {
            return JSON.parse(ownershipJSON);
        } else {
            return [false, false, false, false, false, false];
        }
    }
    
        function saveUpgradeOwnership(ownership) {
        const ownershipJSON = JSON.stringify(ownership);
        localStorage.setItem('upgradeOwnership', ownershipJSON);
    }

    function updateShopButtons() {
        const retrivedPlayerData = JSON.parse(localStorage.getItem('playerData'));
        const upgradeOwnership = loadUpgradeOwnership();
        const defaultImage = document.querySelector('#racoon');
        let anyUpgradeOwned = false;
    
        for (let i = 1; i <= 6; i++) {
            const button = document.querySelector(`#item${i}`);
            const itemFrame = document.querySelector(`#shop-item${i}`);
            const upgradeContent = document.querySelector(`#upgradeContent${i}`);
            const costAttribute = button?.getAttribute('data-cost');
    
            if (button) {
                if (costAttribute !== null) {
                    const cost = parseInt(costAttribute, 10);
                    if (!isNaN(cost)) {
                        const isOwned = upgradeOwnership[i - 1];
                        const canAfford = retrivedPlayerData.score >= cost;
    
                        console.log(`Button #item${i}: cost = ${cost}, player score = ${retrivedPlayerData.score}, owned = ${isOwned}`);
    
                        if (canAfford && !isOwned) {
                            console.log(`Button #item${i} is enabled`);
                            button.classList.remove('button-disabled');
                            if (itemFrame) {
                                itemFrame.style.opacity = '1';
                            }
                        } else {
                            console.log(`Button #item${i} is disabled`);
                            button.classList.add('button-disabled');
                            if (itemFrame) {
                                itemFrame.style.opacity = '0.5';
                            }
    
                            if (isOwned) {
                                anyUpgradeOwned = true;
                                sold(i);
                                showUpgrade(i);
                            } else if (upgradeContent) {
                                upgradeContent.style.display = 'none';
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
    
        if (defaultImage) {
            if (anyUpgradeOwned) {
                defaultImage.style.display = 'none';  
            } else {
                defaultImage.style.display = 'flex';
            }
        } else {
            console.error("Default image element not found");
        }
    
        console.log('Finished updateShopButtons function');
    }
    
    

    async function sold(item){
        const soldBox = document.createElement('button');
        soldBox.id = `sold${item}`;
        soldBox.innerHTML = 'Owned! <iconify-icon icon="material-symbols:check-circle-rounded" width="20" height="20" style="color: #71d44d"></iconify-icon>';
        soldBox.classList.add('sold-box');
        button = document.querySelector(`#item${item}`);
        button.parentNode.replaceChild(soldBox, button);
        document.getElementById(`sold${item}`).disabled = true;
        showUpgrade(item);
        itemFrame = document.querySelector(`#shop-item${item}`);
        if (itemFrame) {
            itemFrame.style.opacity = '1';
        }
    }

    function showUpgrade(item) {
        const upgradeContent = document.querySelector(`#upgrades${item}`);
        
        if (upgradeContent) {
            upgradeContent.style.display = 'flex';
        } else {
            console.error(`Upgrade content with id upgrades${item} not found.`);
        }
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
        let upgradeOwnership = loadUpgradeOwnership();
    
        if (upgradeOwnership[itemNumber - 1]) {
            alert("You already own this item.");
            return;
        }
    
        if (retrivedPlayerData.score >= cost) {
            retrivedPlayerData.score -= cost;
            updateScore(0);
            upgradeOwnership[itemNumber - 1] = true;
            saveUpgradeOwnership(upgradeOwnership); 
            sold(itemNumber);
            showUpgrade(itemNumber);      
            updateShopButtons(); 
            console.log(`Bought item ${itemNumber}. Remaining score: ${retrivedPlayerData.score}`);
        } else {
            alert("You don't have enough points to buy this item.");
        }
    }
    

    window.onload = function () {
        updateScore(0);
        updateShopButtons(retrivedPlayerData);
        setupEventListeners();
    }

    shopBtn.addEventListener('click', function () {
        if (shopDisplay.style.display === 'flex') {
            closeShopModal();
            updateShopButtons();
        } else {
            openShopModal();
        }
    });

    function openShopModal() {
        shopDisplay.style.display = 'flex';
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
        timeLeft = 20;
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
        scoreboard.textContent = retrivedPlayerData.score;
        localStorage.setItem('playerData', JSON.stringify(retrivedPlayerData));
        console.log("Score updated to: " + retrivedPlayerData.score);
    }

    // Load questions when the page loads
    loadQuestions();


}
