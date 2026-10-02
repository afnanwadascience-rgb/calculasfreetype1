document.addEventListener('DOMContentLoaded', () => {
const startBtn = document.getElementById('start-btn');
const heroContainer = document.getElementById('hero-container');
const typingContainer = document.getElementById('typing-container');
const resultsContainer = document.getElementById('results-container');
const restartBtn = document.getElementById('restart-btn');
const resultsRestartBtn = document.getElementById('results-restart-btn');
const modeButtons = document.querySelectorAll('.mode-btn');
const typingInput = document.getElementById('typing-input');


/*
 * Start the typing test.
 *
 * The click itself is a legitimate browser user gesture, so it can
 * also be used to unlock audio if the browser allows it.
 */
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (typeof SoundManager !== 'undefined') {
            SoundManager.unlockAudio();
        }

        if (heroContainer) {
            heroContainer.classList.add('hidden');
        }

        if (resultsContainer) {
            resultsContainer.classList.add('hidden');
        }

        if (typingContainer) {
            typingContainer.classList.remove('hidden');
        }

        if (typeof TypingEngine !== 'undefined') {
            TypingEngine.startTest('standard');
        }

        // Give the typing field focus immediately.
        requestAnimationFrame(() => {
            if (typingInput) {
                typingInput.focus();
            }
        });
    });
}

/*
 * Restart from the typing screen.
 */
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        if (typeof TypingEngine !== 'undefined') {
            TypingEngine.restart();
        }

        requestAnimationFrame(() => {
            if (typingInput) {
                typingInput.focus();
            }
        });
    });
}

/*
 * Restart from the results screen.
 */
if (resultsRestartBtn) {
    resultsRestartBtn.addEventListener('click', () => {
        if (resultsContainer) {
            resultsContainer.classList.add('hidden');
        }

        if (typingContainer) {
            typingContainer.classList.remove('hidden');
        }

        if (typeof TypingEngine !== 'undefined') {
            TypingEngine.restart();
        }

        requestAnimationFrame(() => {
            if (typingInput) {
                typingInput.focus();
            }
        });
    });
}

/*
 * Typing modes.
 */
modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        modeButtons.forEach((btn) => {
            btn.classList.remove('active');
        });

        button.classList.add('active');

        const mode = button.dataset.mode || 'standard';

        if (typeof TypingEngine !== 'undefined') {
            TypingEngine.startTest(mode);
        }

        requestAnimationFrame(() => {
            if (typingInput) {
                typingInput.focus();
            }
        });
    });
});

/*
 * Allow the user to click the passage itself to focus typing.
 */
const passageDisplay = document.getElementById('passage-display');

if (passageDisplay && typingInput) {
    passageDisplay.addEventListener('click', () => {
        typingInput.focus();
    });
}

/*
 * Basic runtime diagnostics.
 * These help identify broken script loading without changing the UI.
 */
if (typeof TypingEngine === 'undefined') {
    console.error(
        '[Calculas Typing] TypingEngine was not loaded. Check assets/engine.js.'
    );
}

if (typeof SoundManager === 'undefined') {
    console.error(
        '[Calculas Typing] SoundManager was not loaded. Check assets/sound.js.'
    );
}


});
