let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;

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

async function initApp() {
    try {
        const response = await fetch('./questions.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        questions = data.sort(() => Math.random() - 0.5);
        displayQuestion();
    } catch (error) {
        console.error("Error:", error);
        questionText.innerText = "Error loading questions. Make sure questions.json is in this folder.";
    }
}

function displayQuestion() {
    resetState();
    const q = questions[currentQuestionIndex];
    categoryTag.innerHTML = `<span>${q.icon}</span> ${q.category}`;
    skillTag.innerText = q.skillLevel;
    questionText.innerText = q.question;

    q.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('w-full', 'p-4', 'text-left', 'border', 'border-[#D1C9B8]', 'rounded-lg', 'hover:bg-[#F9F7F2]', 'transition-all', 'mb-3', 'text-sm');
        button.addEventListener('click', () => handleAnswer(index, q.correctAnswer));
        optionsContainer.appendChild(button);
    });
}

function handleAnswer(selectedIndex, correctIndex) {
    const buttons = optionsContainer.querySelectorAll('button');
    const isCorrect = selectedIndex === correctIndex;
    const q = questions[currentQuestionIndex];

    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        buttons[selectedIndex].style.backgroundColor = "#E8F5E9";
        buttons[selectedIndex].style.borderColor = "#4CAF50";
        score++;
        streak++;
        confetti({ particleCount: 50, spread: 60, colors: ['#7A857E', '#D1C9B8'] });
    } else {
        buttons[selectedIndex].style.backgroundColor = "#FFEBEE";
        buttons[selectedIndex].style.borderColor = "#F44336";
        buttons[correctIndex].style.backgroundColor = "#E8F5E9";
        streak = 0;
    }

    updateDashboard();
    showExplanation(isCorrect, selectedIndex, q);
}

function showExplanation(isCorrect, selectedIndex, q) {
    explanationContainer.classList.remove('hidden');
    feedbackHeading.innerText = isCorrect ? "Excellent!" : "Keep Learning.";
    feedbackHeading.style.color = isCorrect ? "#4CAF50" : "#F44336";
    const distractor = q.distractorExplanations[selectedIndex] || "";
    explanationText.innerHTML = isCorrect ? q.explanation : `<strong>Note:</strong> ${distractor}<br><br>${q.explanation}`;
}

function updateDashboard() {
    streakDisplay.innerText = streak;
    progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
}

function resetState() {
    explanationContainer.classList.add('hidden');
    while (optionsContainer.firstChild) optionsContainer.removeChild(optionsContainer.firstChild);
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) displayQuestion();
    else {
        questionText.innerText = `Session Complete! Score: ${score}/${questions.length}`;
        resetState();
    }
});

initApp();