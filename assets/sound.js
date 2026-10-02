const SoundManager = {
    heroVideo: null,
    isMuted: false,

    init() {
        this.heroVideo = document.getElementById('hero-video');
        const soundBtn = document.getElementById('sound-toggle-btn');
        
        if (soundBtn) {
            soundBtn.addEventListener('click', () => this.toggleMute());
        }
    },

    unlockAudio() {
        if (this.heroVideo) {
            this.heroVideo.muted = false;
            this.heroVideo.volume = 1.0;
            this.heroVideo.play().catch(err => {
                console.warn("Autoplay audio play prevented:", err);
            });
        }
    },

    toggleMute() {
        if (!this.heroVideo) return;
        this.isMuted = !this.isMuted;
        this.heroVideo.muted = this.isMuted;
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.textContent = this.isMuted ? '🔇' : '🔊';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SoundManager.init();
});