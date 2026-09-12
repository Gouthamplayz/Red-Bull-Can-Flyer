============================================================================================================================================================
🥫 Red Bull Can Flyer — Gives You Wiiings 🪽

A fast, fun AR web useless game where your face flies inside an authentic Red Bull can equipped with flapping cartoon wings! Pop flying cans by clicking them or using AI Finger-Gun camera gestures (`👉` point to aim, `💥` drop thumb to shoot).

---

🚀 Quick Start

Open the project in your browser using any local server:

VS Code
Right-click index.html -> Open with Live Server

```

Visit `http://127.0.0.1:5500/index.html` in your browser.

---

🎮 How to Play

1.Equip Photo/Face:
   Allow webcam access to frame your face in the reticle and click **`🚀 EQUIP WINGS & FLY`**.
   No camera? Click `📁 Upload Photo` or choose `⚡ Demo Pilot`.

2.Pop Cans (2 Ways):
   Click / Tap: Click any flying can to pop it.
   Finger-Gun Gesture (`👉` + `💥`)**:
   Raise your hand like a gun (index finger pointed, thumb up, other fingers curled).
   Move your finger to aim the crosshair over a flying can.
   Drop your thumb downward to fire a laser and pop the can!

3.Cockpit Buttons:
   Launch Can: Spawns another flying can.
   Frenzy x3: Launches 3 cans rapidly for high combos.
   Retake: Return to the camera to change pilot.
   Sound: Toggle game audio on/off.

---

📁 Project Structure

CAN FLYER/
├── index.html          # Main web page and UI layout
├── css/
│   ├── style.css       # Red Bull design tokens & colors
│   ├── camera.css      # Pilot scanner & onboarding card styles
│   └── game.css        # Flight arena, HUD telemetry & button styles
├── js/
│   ├── main.js         # App entry point & button clicks
│   ├── game.js         # Game loop, combo scoring & canvas updates
│   ├── cans.js         # Can physics, face photo & flapping wings
│   ├── handTracker.js  # MediaPipe AI finger-gun camera tracking
│   ├── camera.js       # Webcam capture & photo upload (in-memory only)
│   ├── effects.js      # Pop explosions, lasers & comic bubbles
│   └── audio.js        # Voice playback (rbv.mp3) & sound FX
├── assets/
│   ├── rbc.png         # Authentic Red Bull can graphic
│   └── rbv.mp3         # "Red Bull gives you wings!" voice clip
└── README.md           # Project guide


make it little more easy

============================================================================================================================================================
