const SoundManager = {
heroVideo: null,
soundButton: null,
isMuted: true,
initialized: false,


init() {
    this.heroVideo = document.getElementById('hero-video');
    this.soundButton = document.getElementById('sound-toggle-btn');

    if (!this.heroVideo) {
        console.warn('[Calculas Typing] Hero video not found.');
        return;
    }

    /*
     * Start muted so the browser is allowed to autoplay the intro.
     * Audio can be enabled after a real user interaction.
     */
    this.heroVideo.muted = true;
    this.heroVideo.volume = 1.0;

    if (this.soundButton) {
        this.soundButton.addEventListener('click', (event) => {
            // Prevent the click from triggering anything underneath it.
            event.stopPropagation();
            this.toggleMute();
        });
    }

    this.updateButton();

    this.initialized = true;
},

async unlockAudio() {
    if (!this.heroVideo) {
        return false;
    }

    /*
     * This function is called from a genuine user interaction.
     * That makes it safe to request audio playback under normal
     * browser autoplay rules.
     */
    try {
        this.isMuted = false;
        this.heroVideo.muted = false;
        this.heroVideo.volume = 1.0;

        await this.heroVideo.play();

        this.updateButton();

        return true;
    } catch (error) {
        /*
         * If the browser still blocks playback, don't try to bypass
         * the restriction. Keep the video usable and report the issue.
         */
        console.warn(
            '[Calculas Typing] Browser prevented unmuted video playback:',
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

    if (this.heroVideo.muted || this.isMuted) {
        try {
            this.isMuted = false;
            this.heroVideo.muted = false;
            this.heroVideo.volume = 1.0;

            await this.heroVideo.play();

            this.updateButton();
        } catch (error) {
            console.warn(
                '[Calculas Typing] Unable to enable intro audio:',
                error
            );

            this.isMuted = true;
            this.heroVideo.muted = true;
            this.updateButton();
        }
    } else {
        this.isMuted = true;
        this.heroVideo.muted = true;
        this.updateButton();
    }
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
