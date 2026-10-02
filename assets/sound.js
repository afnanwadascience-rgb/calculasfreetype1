const SoundManager = {
    heroVideo: null,
    soundButton: null,
    isMuted: true,

    init() {
        this.heroVideo = document.getElementById('hero-video');
        this.soundButton = document.getElementById('sound-toggle-btn');

        if (!this.heroVideo) {
            console.error(
                '[Calculas Typing] #hero-video was not found.'
            );
            return;
        }

        // Muted autoplay is allowed by modern browsers.
        this.heroVideo.muted = true;
        this.heroVideo.defaultMuted = true;
        this.heroVideo.volume = 1;

        /*
         * Make sure the intro attempts to play.
         * Failure is harmless because the user can interact manually.
         */
        const playPromise = this.heroVideo.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((error) => {
                console.warn(
                    '[Calculas Typing] Hero video autoplay was blocked:',
                    error
                );
            });
        }

        if (this.soundButton) {
            this.soundButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                this.toggleMute();
            });
        }

        this.updateButton();
    },

    async unlockAudio() {
        if (!this.heroVideo) {
            return false;
        }

        try {
            /*
             * This runs because the user clicked Start Typing.
             * The browser can therefore permit audio playback.
             */
            this.isMuted = false;
            this.heroVideo.muted = false;
            this.heroVideo.defaultMuted = false;
            this.heroVideo.volume = 1;

            await this.heroVideo.play();

            this.updateButton();

            return true;
        } catch (error) {
            console.warn(
                '[Calculas Typing] Could not enable hero audio:',
                error
            );

            this.isMuted = true;
            this.heroVideo.muted = true;

            this.updateButton();

            return false;
        }
    },

    async toggleMute() {
        if (!this.heroVideo) {
            return;
        }

        if (this.isMuted) {
            try {
                this.isMuted = false;

                this.heroVideo.muted = false;
                this.heroVideo.defaultMuted = false;
                this.heroVideo.volume = 1;

                await this.heroVideo.play();
            } catch (error) {
                console.warn(
                    '[Calculas Typing] Browser blocked intro audio:',
                    error
                );

                this.isMuted = true;
                this.heroVideo.muted = true;
                this.heroVideo.defaultMuted = true;
            }
        } else {
            this.isMuted = true;

            this.heroVideo.muted = true;
            this.heroVideo.defaultMuted = true;
        }

        this.updateButton();
    },

    updateButton() {
        if (!this.soundButton) {
            return;
        }

        this.soundButton.textContent = this.isMuted ? '🔇' : '🔊';

        this.soundButton.setAttribute(
            'aria-label',
            this.isMuted
                ? 'Enable intro sound'
                : 'Mute intro sound'
        );

        this.soundButton.setAttribute(
            'aria-pressed',
            String(!this.isMuted)
        );
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SoundManager.init();
});