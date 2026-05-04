// --- State Management ---
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let progress = 0;

// --- Selectors ---
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const categoryTag = document.getElementById('category-tag');
const skillTag = document.getElementById('skill-tag');
const explanationContainer = document.getElementById('explanation-container');
const explanationText = document.getElementById('explanation-text');
const feedbackHeading = document.getElementById('feedback-heading');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const streakDisplay = document.getElementById('streak-count');

// --- Initialization ---
async function initApp() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        // Shuffle questions for a fresh experience every time
        questions = data.sort(() => Math.random() - 0.5);
        loadProgress();
        displayQuestion();
    } catch (error) {
        console.error("Error loading ISC questions:", error);
        questionText.innerText = "Failed to load questions. Please check questions.json.";
    }
}

// --- Core Logic ---
function displayQuestion() {
    resetState();
    const q = questions[currentQuestionIndex];

    // Set Metadata
    categoryTag.innerHTML = `<span>${q.icon}</span> ${q.category}`;
    skillTag.innerText = q.skillLevel;
    questionText.innerText = q.question;

    // Build Options
    q.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => handleAnswer(index, q.correctAnswer));
        optionsContainer.appendChild(button);
    });
}

function handleAnswer(selectedIndex, correctIndex) {
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    const isCorrect = selectedIndex === correctIndex;
    const q = questions[currentQuestionIndex];

    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        buttons[selectedIndex].classList.add('correct');
        handleSuccess();
    } else {
        buttons[selectedIndex].classList.add('incorrect');
        buttons[correctIndex].classList.add('correct'); // Show the right answer
        handleFailure();
    }

    showExplanation(isCorrect, selectedIndex, q);
}

function showExplanation(isCorrect, selectedIndex, questionObj) {
    explanationContainer.classList.remove('hidden');
    
    if (isCorrect) {
        const compliments = ["¡Excelente!", "Great job!", "Perfect!", "Muy bien!"];
        feedbackHeading.innerText = compliments[Math.floor(Math.random() * compliments.length)];
        feedbackHeading.style.color = "var(--correct)";
        explanationText.innerText = questionObj.explanation;
    } else {
        feedbackHeading.innerText = "Not quite.";
        feedbackHeading.style.color = "var(--incorrect)";
        // Show specific explanation for the wrong choice if it exists
        const distractorDesc = questionObj.distractorExplanations[selectedIndex] || "";
        explanationText.innerHTML = `<strong>Why that choice was wrong:</strong> ${distractorDesc}<br><br><strong>Key Concept:</strong> ${questionObj.explanation}`;
    }
}

// --- Gamification Elements ---
function handleSuccess() {
    score++;
    streak++;
    saveProgress();
    updateDashboard();
    
    // Trigger Confetti in your brand colors
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B948E', '#DBD4C1', '#7A857E']
    });

    // Animate the streak counter
    streakDisplay.parentElement.classList.add('streak-pop');
    setTimeout(() => streakDisplay.parentElement.classList.remove('streak-pop'), 400);
}

function handleFailure() {
    streak = 0;
    saveProgress();
    updateDashboard();
    document.getElementById('question-card').classList.add('shake');
    setTimeout(() => document.getElementById('question-card').classList.remove('shake'), 400);
}

function updateDashboard() {
    streakDisplay.innerText = streak;
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Update User Level based on score
    const levelTag = document.getElementById('user-level');
    if (score > 8) levelTag.innerText = "ISC Master";
    else if (score > 4) levelTag.innerText = "Audit Lead";
    else levelTag.innerText = "Junior Auditor";
}

// --- Navigation & Persistence ---
function resetState() {
    explanationContainer.classList.add('hidden');
    while (optionsContainer.firstChild) {
        optionsContainer.removeChild(optionsContainer.firstChild);
    }
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showFinalResults();
    }
});

function showFinalResults() {
    resetState();
    questionText.innerText = "Study Session Complete!";
    categoryTag.innerText = "Summary";
    skillTag.innerText = "Results";
    optionsContainer.innerHTML = `
        <div class="text-center p-6">
            <p class="text-4xl mb-4">🎓</p>
            <p class="mb-6">You scored ${score} out of ${questions.length}!</p>
            <button onclick="location.reload()" class="w-full py-4 bg-[#7A857E] text-white text-xs uppercase tracking-widest">Restart Session</button>
        </div>
    `;
}

function saveProgress() {
    localStorage.setItem('isc_streak', streak);
    localStorage.setItem('isc_score', score);
}

function loadProgress() {
    streak = parseInt(localStorage.getItem('isc_streak')) || 0;
    score = parseInt(localStorage.getItem('isc_score')) || 0;
    updateDashboard();
}

// Start the app
initApp();