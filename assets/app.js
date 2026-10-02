document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const heroContainer = document.getElementById('hero-container');
    const typingContainer = document.getElementById('typing-container');
    const restartBtn = document.getElementById('restart-btn');
    const resultsRestartBtn = document.getElementById('results-restart-btn');
    const modeButtons = document.querySelectorAll('.mode-btn');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Unlock audio upon user interaction per browser security rules
            if (typeof SoundManager !== 'undefined') {
                SoundManager.unlockAudio();
            }

            // Hide hero, show typing test
            if (heroContainer) heroContainer.classList.add('hidden');
            if (typingContainer) typingContainer.classList.remove('hidden');

            // Initialize Typing Engine
            if (typeof TypingEngine !== 'undefined') {
                TypingEngine.startTest('standard');
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (typeof TypingEngine !== 'undefined') {
                TypingEngine.restart();
            }
        });
    }

    if (resultsRestartBtn) {
        resultsRestartBtn.addEventListener('click', () => {
            document.getElementById('results-container').classList.add('hidden');
            document.getElementById('typing-container').classList.remove('hidden');
            if (typeof TypingEngine !== 'undefined') {
                TypingEngine.restart();
            }
        });
    }

    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const mode = e.target.getAttribute('data-mode');
            if (typeof TypingEngine !== 'undefined') {
                TypingEngine.startTest(mode);
            }
        });
    });
});