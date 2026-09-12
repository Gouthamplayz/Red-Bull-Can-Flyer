let audioContext = null;
let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById("muteButton");
    if (btn) {
        btn.innerHTML = isMuted ? "<span>🔇 MUTED</span>" : "<span>🔊 SOUND</span>";
        btn.classList.toggle("muted", isMuted);
    }
    return isMuted;
}


/* =========================
   AUDIO CONTEXT
========================= */

function getAudioContext() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        audioContext =
            new AudioContext();
    }

    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }

    return audioContext;
}


/* =========================
   RED BULL VOICE (rbv.mp3)
========================= */

const rbvAudio = new Audio("assets/rbv.mp3");
rbvAudio.preload = "auto";

// Pre-unlock on first user interaction
document.addEventListener("click", () => {
    if (rbvAudio.paused && rbvAudio.currentTime === 0) {
        rbvAudio.load();
    }
}, { once: true });

function sayWings() {

    if (isMuted) return;

    try {

        // Clone node for seamless overlapping audio when cans are popped in rapid succession
        const voiceInstance = rbvAudio.cloneNode();
        voiceInstance.volume = 1.0;

        const playPromise =
            voiceInstance.play();

        if (playPromise !== undefined) {

            playPromise.catch(
                error => {

                    // Fallback to primary instance if cloning playback was restricted
                    rbvAudio.currentTime = 0;
                    rbvAudio.play().catch(() => {});

                }
            );

        }

    }

    catch (error) {

        try {
            rbvAudio.currentTime = 0;
            rbvAudio.play().catch(() => {});
        } catch (e) {}

    }
}



/* =========================
   CAN CLICK SOUND
========================= */

function wingsChime() {

    if (isMuted) return;

    const audio =
        getAudioContext();

    if (!audio) {
        return;
    }


    const oscillator =
        audio.createOscillator();

    const gain =
        audio.createGain();


    oscillator.type =
        "sine";


    oscillator.frequency.setValueAtTime(
        650,
        audio.currentTime
    );


    oscillator.frequency.exponentialRampToValueAtTime(
        1100,
        audio.currentTime + .18
    );


    gain.gain.setValueAtTime(
        .0001,
        audio.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        .15,
        audio.currentTime + .02
    );


    gain.gain.exponentialRampToValueAtTime(
        .0001,
        audio.currentTime + .22
    );


    oscillator.connect(gain);

    gain.connect(
        audio.destination
    );


    oscillator.start();

    oscillator.stop(
        audio.currentTime + .23
    );
}


/* =========================
   FALL SOUND
========================= */

function fallSound() {

    if (isMuted) return;

    const audio =
        getAudioContext();

    if (!audio) {
        return;
    }


    const oscillator =
        audio.createOscillator();

    const gain =
        audio.createGain();


    oscillator.type =
        "triangle";


    oscillator.frequency.setValueAtTime(
        500,
        audio.currentTime
    );


    oscillator.frequency.exponentialRampToValueAtTime(
        100,
        audio.currentTime + .35
    );


    gain.gain.setValueAtTime(
        .0001,
        audio.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        .12,
        audio.currentTime + .03
    );


    gain.gain.exponentialRampToValueAtTime(
        .0001,
        audio.currentTime + .35
    );


    oscillator.connect(gain);

    gain.connect(
        audio.destination
    );


    oscillator.start();

    oscillator.stop(
        audio.currentTime + .36
    );
}


/* =========================
   SHOOT LASER SOUND
========================= */

function shootLaserSound() {

    if (isMuted) return;

    const audio =
        getAudioContext();

    if (!audio) {
        return;
    }

    try {

        const osc =
            audio.createOscillator();

        const gain =
            audio.createGain();

        osc.type =
            "sawtooth";

        osc.frequency.setValueAtTime(
            1600,
            audio.currentTime
        );

        osc.frequency.exponentialRampToValueAtTime(
            150,
            audio.currentTime + 0.14
        );

        gain.gain.setValueAtTime(
            0.18,
            audio.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audio.currentTime + 0.14
        );

        osc.connect(gain);
        gain.connect(audio.destination);

        osc.start();
        osc.stop(audio.currentTime + 0.15);

    } catch (e) {
        console.warn("Laser audio error:", e);
    }
}