/* ===================================================
   HAND TRACKER & FINGER GUN GESTURE ENGINE
   =================================================== */

let handTrackerReady = false;
let handDetected = false;
let isAiming = false;
let isLockedOn = false;
let lockedCan = null;

// Smoothed aim coordinates
let aimX = window.innerWidth / 2;
let aimY = window.innerHeight / 2;
let targetAimX = aimX;
let targetAimY = aimY;

// Gesture state
let thumbWasCocked = false;
let lastShootTime = 0;
const SHOOT_COOLDOWN_MS = 240;

// MediaPipe instances
let handsModel = null;
let cameraInstance = null;
let pipCtx = null;


/* =========================
   INITIALIZE HAND TRACKER
========================= */

function initHandTracker(videoStreamElement) {

    if (!window.Hands) {
        console.warn("MediaPipe Hands library not yet loaded. Retrying in 500ms...");
        setTimeout(() => initHandTracker(videoStreamElement), 500);
        return;
    }

    try {

        handsModel = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        handsModel.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.55,
            minTrackingConfidence: 0.55
        });

        handsModel.onResults(onHandResults);

        setupPiPCanvas();

        // Start processing frames from video
        startVideoProcessing(videoStreamElement);

        handTrackerReady = true;
        updatePipStatus("🟡 RAISE HAND (POINT 👉)", "waiting");

    } catch (err) {
        console.error("Hand tracker initialization error:", err);
        updatePipStatus("⚠️ TRACKER ERROR", "error");
    }

}


/* =========================
   VIDEO FRAME PROCESSING
========================= */

let isProcessingFrame = false;

function startVideoProcessing(videoEl) {

    if (!videoEl) return;

    async function processLoop() {

        if (videoEl.readyState >= 2 && !videoEl.paused && handsModel) {

            if (!isProcessingFrame) {

                isProcessingFrame = true;

                try {

                    await handsModel.send({ image: videoEl });

                } catch (e) {

                    // Ignore temporary frame drops

                } finally {

                    isProcessingFrame = false;

                }

            }

        }

        requestAnimationFrame(processLoop);

    }

    requestAnimationFrame(processLoop);

}


/* =========================
   PIP CAMERA CANVAS SETUP
========================= */

function setupPiPCanvas() {

    const canvas = document.getElementById("pipCanvas");

    if (canvas) {

        canvas.width = 160;
        canvas.height = 120;
        pipCtx = canvas.getContext("2d");

    }

}


/* =========================
   PIP STATUS BADGE UPDATE
========================= */

function updatePipStatus(text, statusClass = "") {

    const badge = document.getElementById("pipStatusText");

    if (badge) {

        badge.textContent = text;
        badge.className = "pip-status-badge " + statusClass;

    }

}


/* =========================
   MEDIAPIPE RESULTS CALLBACK
========================= */

function onHandResults(results) {

    // Render onto PiP preview
    renderPiP(results);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {

        handDetected = false;
        isAiming = false;
        isLockedOn = false;
        lockedCan = null;
        updatePipStatus("🟡 RAISE HAND (POINT 👉)", "waiting");
        return;

    }

    handDetected = true;

    const landmarks = results.multiHandLandmarks[0];

    // Landmark references
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];

    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const indexMCP = landmarks[5];

    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const middleMCP = landmarks[9];

    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Distance helper
    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // Hand normalization scale (wrist to middle MCP)
    const handScale = Math.max(0.01, dist(wrist, middleMCP));

    /*
       1. Coordinate Mapping (Mirrored webcam)
    */

    const mirroredX = 1 - indexTip.x;
    const rawY = indexTip.y;

    targetAimX = mirroredX * window.innerWidth;
    targetAimY = rawY * window.innerHeight;

    // Smooth aim position with Lerp
    aimX += (targetAimX - aimX) * 0.42;
    aimY += (targetAimY - aimY) * 0.42;

    /*
       2. Gesture Pose Classification (Finger Gun)
       - Index extended
       - Middle, ring, pinky curled into palm
    */

    const indexExtended = dist(wrist, indexTip) > dist(wrist, indexPIP) * 1.12;
    const middleCurled = dist(wrist, middleTip) < dist(wrist, middlePIP) * 1.18 || dist(middleTip, middleMCP) / handScale < 0.65;
    const ringCurled = dist(ringTip, wrist) / handScale < 1.1;
    const pinkyCurled = dist(pinkyTip, wrist) / handScale < 1.05;

    isAiming = indexExtended && (middleCurled || ringCurled);

    /*
       3. Can Lock-on Detection
    */

    if (typeof findCanAt === "function") {

        lockedCan = findCanAt(aimX, aimY);
        isLockedOn = lockedCan !== null;

    }

    /*
       4. Shoot Trigger Detection
       - Trigger A: Thumb Hammer Drop
       - Trigger B: Pinch (Thumb touches index/middle knuckle)
    */

    const thumbToIndexDist = dist(thumbTip, indexMCP) / handScale;
    const thumbToMiddleDist = dist(thumbTip, middleTip) / handScale;
    const pinchDist = dist(thumbTip, indexTip) / handScale;

    // Thumb cocked high (ready to fire)
    const thumbCocked = thumbToIndexDist > 0.48;

    // Thumb hammer depressed / dropped
    const thumbDropped = thumbToIndexDist < 0.36;

    // Pinch trigger
    const pinchTrigger = pinchDist < 0.26 || thumbToMiddleDist < 0.28;

    const now = performance.now();

    if (isAiming) {

        if (isLockedOn) {

            updatePipStatus("🎯 LOCKED ON! SHOOT!", "locked");

        } else {

            updatePipStatus("🟢 AIMING (DROP THUMB TO SHOOT)", "aiming");

        }

        // Fire trigger check
        const firedHammer = thumbWasCocked && thumbDropped;
        const firedPinch = pinchTrigger;

        if ((firedHammer || firedPinch) && (now - lastShootTime > SHOOT_COOLDOWN_MS)) {

            lastShootTime = now;
            executeShoot(aimX, aimY);

        }

        thumbWasCocked = thumbCocked;

    } else {

        updatePipStatus("⚪ EXTEND INDEX FINGER 👉", "detecting");
        thumbWasCocked = false;

    }

}


/* =========================
   EXECUTE SHOOT ACTION
========================= */

function executeShoot(x, y) {

    // Trigger visual muzzle flash and sound/can pop
    if (typeof shootAt === "function") {

        shootAt(x, y);

    }

    // Interactive message celebration
    const gameMsg = document.getElementById("gameMessage");

    if (gameMsg) {

        const msgText = gameMsg.querySelector(".msg-text") || gameMsg;
        msgText.textContent = isLockedOn ? "💥 DIRECT HIT! PEW PEW!" : "⚡ LASER FIRED!";

    }

}


/* =========================
   RENDER PIP PREVIEW
========================= */

function renderPiP(results) {

    if (!pipCtx) return;

    const w = pipCtx.canvas.width;
    const h = pipCtx.canvas.height;

    pipCtx.clearRect(0, 0, w, h);

    // Draw live webcam feed (mirrored)
    if (results.image) {

        pipCtx.save();
        pipCtx.translate(w, 0);
        pipCtx.scale(-1, 1);
        pipCtx.drawImage(results.image, 0, 0, w, h);
        pipCtx.restore();

        // Dark overlay for HUD clarity
        pipCtx.fillStyle = "rgba(0, 12, 32, 0.45)";
        pipCtx.fillRect(0, 0, w, h);

    }

    // Draw hand skeleton on PiP
    if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {

        const lms = results.multiHandLandmarks[0];

        pipCtx.save();
        pipCtx.lineWidth = 2;
        pipCtx.strokeStyle = isLockedOn ? "#ff3366" : (isAiming ? "#00d4ff" : "rgba(255, 255, 255, 0.6)");
        pipCtx.fillStyle = "#ffffff";

        // Connections list
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],       // Index
            [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring
            [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [0, 17]                               // Palm base
        ];

        for (const [i, j] of connections) {

            const x1 = (1 - lms[i].x) * w;
            const y1 = lms[i].y * h;
            const x2 = (1 - lms[j].x) * w;
            const y2 = lms[j].y * h;

            pipCtx.beginPath();
            pipCtx.moveTo(x1, y1);
            pipCtx.lineTo(x2, y2);
            pipCtx.stroke();

        }

        // Highlight index tip (aimer)
        const tipX = (1 - lms[8].x) * w;
        const tipY = lms[8].y * h;

        pipCtx.fillStyle = isLockedOn ? "#ff1234" : "#00d4ff";
        pipCtx.beginPath();
        pipCtx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
        pipCtx.fill();

        pipCtx.restore();

    }

}


/* =========================
   DRAW TARGETING CROSSHAIR
========================= */

function drawReticle(ctx) {

    if (!handDetected || !isAiming) return;

    ctx.save();

    const t = performance.now() * 0.003;
    const color = isLockedOn ? "#ff1234" : "#00d4ff";
    const accentColor = isLockedOn ? "#ffc700" : "#ffffff";
    const reticleRadius = isLockedOn ? 38 : 28;

    // 1. Center targeting laser dot
    ctx.fillStyle = accentColor;
    ctx.shadowColor = color;
    ctx.shadowBlur = isLockedOn ? 20 : 12;

    ctx.beginPath();
    ctx.arc(aimX, aimY, isLockedOn ? 4.5 : 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Rotating outer reticle ring
    ctx.strokeStyle = color;
    ctx.lineWidth = isLockedOn ? 2.5 : 1.8;

    ctx.beginPath();
    ctx.arc(aimX, aimY, reticleRadius, t, t + Math.PI * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(aimX, aimY, reticleRadius, t + Math.PI * 1.65, t + Math.PI * 1.95);
    ctx.stroke();

    // 3. Crosshair tick marks
    const tickDist = reticleRadius + 6;
    const tickLen = 6;

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;

    // Top
    ctx.beginPath();
    ctx.moveTo(aimX, aimY - tickDist);
    ctx.lineTo(aimX, aimY - tickDist - tickLen);
    ctx.stroke();

    // Bottom
    ctx.beginPath();
    ctx.moveTo(aimX, aimY + tickDist);
    ctx.lineTo(aimX, aimY + tickDist + tickLen);
    ctx.stroke();

    // Left
    ctx.beginPath();
    ctx.moveTo(aimX - tickDist, aimY);
    ctx.lineTo(aimX - tickDist - tickLen, aimY);
    ctx.stroke();

    // Right
    ctx.beginPath();
    ctx.moveTo(aimX + tickDist, aimY);
    ctx.lineTo(aimX + tickDist + tickLen, aimY);
    ctx.stroke();

    // 4. Lock-on brackets & target text
    if (isLockedOn) {

        const bSize = reticleRadius + 14;
        const bLen = 10;

        ctx.strokeStyle = "#ff1234";
        ctx.lineWidth = 2.5;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(aimX - bSize, aimY - bSize + bLen);
        ctx.lineTo(aimX - bSize, aimY - bSize);
        ctx.lineTo(aimX - bSize + bLen, aimY - bSize);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(aimX + bSize - bLen, aimY - bSize);
        ctx.lineTo(aimX + bSize, aimY - bSize);
        ctx.lineTo(aimX + bSize, aimY - bSize + bLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(aimX - bSize, aimY + bSize - bLen);
        ctx.lineTo(aimX - bSize, aimY + bSize);
        ctx.lineTo(aimX - bSize + bLen, aimY + bSize);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(aimX + bSize - bLen, aimY + bSize);
        ctx.lineTo(aimX + bSize, aimY + bSize);
        ctx.lineTo(aimX + bSize, aimY + bSize - bLen);
        ctx.stroke();

        // Target Lock Tag
        ctx.font = "900 11px Arial, sans-serif";
        ctx.fillStyle = "#ffc700";
        ctx.textAlign = "center";
        ctx.fillText("● LOCK-ON", aimX, aimY + bSize + 16);

    }

    ctx.restore();

}
