document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const heroContainer = document.getElementById('hero-container');
    const typingContainer = document.getElementById('typing-container');
    const resultsContainer = document.getElementById('results-container');

    const restartBtn = document.getElementById('restart-btn');
    const resultsRestartBtn = document.getElementById('results-restart-btn');

    const modeButtons = document.querySelectorAll('.mode-btn');
    const typingInput = document.getElementById('typing-input');
    const passageDisplay = document.getElementById('passage-display');

    let currentMode = 'standard';

    function focusTypingInput() {
        if (!typingInput) return;

        requestAnimationFrame(() => {
            typingInput.focus();
        });
    }

    function startTypingTest(mode = 'standard') {
        currentMode = mode;

        if (heroContainer) {
            heroContainer.classList.add('hidden');
        }

        if (resultsContainer) {
            resultsContainer.classList.add('hidden');
        }

        if (typingContainer) {
            typingContainer.classList.remove('hidden');
        }

        if (typeof TypingEngine === 'undefined') {
            console.error(
                '[Calculas Typing] TypingEngine is not available. Check assets/engine.js.'
            );
            return;
        }

        if (typeof TypingEngine.startTest !== 'function') {
            console.error(
                '[Calculas Typing] TypingEngine.startTest() is missing.'
            );
            return;
        }

        try {
            TypingEngine.startTest(currentMode);
        } catch (error) {
            console.error(
                '[Calculas Typing] Failed to start typing test:',
                error
            );
        }

        focusTypingInput();
    }

    // Start Typing
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            /*
             * The click is a genuine user interaction, so audio may
             * be unlocked here when the browser permits it.
             *
             * We do not depend on the audio succeeding for the
             * typing test to start.
             */
            if (
                typeof SoundManager !== 'undefined' &&
                typeof SoundManager.unlockAudio === 'function'
            ) {
                SoundManager.unlockAudio();
            }

            startTypingTest('standard');
        });
    }

    // Restart from typing screen
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (
                typeof TypingEngine !== 'undefined' &&
                typeof TypingEngine.restart === 'function'
            ) {
                try {
                    TypingEngine.restart();
                } catch (error) {
                    console.error(
                        '[Calculas Typing] Restart failed:',
                        error
                    );
                }
            } else {
                startTypingTest(currentMode);
            }

            focusTypingInput();
        });
    }

    // Try Again from results
    if (resultsRestartBtn) {
        resultsRestartBtn.addEventListener('click', () => {
            startTypingTest(currentMode);
        });
    }

    // Mode buttons
    modeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode || 'standard';

            currentMode = mode;

            modeButtons.forEach((btn) => {
                btn.classList.remove('active');
            });

            button.classList.add('active');

            /*
             * Only start/restart a test when the typing screen is visible.
             * This prevents hidden controls from starting the engine.
             */
            if (
                typingContainer &&
                !typingContainer.classList.contains('hidden')
            ) {
                startTypingTest(currentMode);
            }
        });
    });

    // Clicking the passage focuses the real input
    if (passageDisplay && typingInput) {
        passageDisplay.addEventListener('click', focusTypingInput);
    }

    // Helpful diagnostics
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