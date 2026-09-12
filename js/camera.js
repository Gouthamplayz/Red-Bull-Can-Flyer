let cameraStream = null;

let faceImage = null;


/* =========================
   START CAMERA
========================= */

async function startCamera() {

    const video =
        document.getElementById(
            "cameraVideo"
        );

    const error =
        document.getElementById(
            "cameraError"
        );


    try {

        if (cameraStream) {

            stopCamera();

        }


        cameraStream =
            await navigator
                .mediaDevices
                .getUserMedia({

                    video: {

                        facingMode:
                            "user",

                        width: {
                            ideal: 720
                        },

                        height: {
                            ideal: 720
                        }

                    },

                    audio: false

                });


        video.srcObject =
            cameraStream;


        error.style.display =
            "none";

    }

    catch (err) {

        console.error(err);

        error.style.display =
            "block";

    }

}


/* =========================
   STOP CAMERA
========================= */

function stopCamera() {

    if (!cameraStream) {
        return;
    }


    cameraStream
        .getTracks()
        .forEach(
            track =>
                track.stop()
        );


    cameraStream =
        null;
}


/* =========================
   CAPTURE FACE
========================= */

function captureFace() {

    const video =
        document.getElementById(
            "cameraVideo"
        );

    const flash =
        document.getElementById(
            "flash"
        );


    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        return;

    }


    const tempCanvas =
        document.createElement(
            "canvas"
        );


    const size =
        Math.min(
            video.videoWidth,
            video.videoHeight
        );


    tempCanvas.width =
        size;

    tempCanvas.height =
        size;


    const tempCtx =
        tempCanvas.getContext(
            "2d"
        );


    const sx =
        (
            video.videoWidth -
            size
        ) / 2;


    const sy =
        (
            video.videoHeight -
            size
        ) / 2;


    tempCtx.drawImage(

        video,

        sx,
        sy,

        size,
        size,

        0,
        0,

        size,
        size

    );


    faceImage =
        new Image();


    faceImage.onload =
        () => {

            showGame();

            createCan();

            const video =
                document.getElementById("cameraVideo");

            if (typeof initHandTracker === "function" && video) {
                initHandTracker(video);
            }

        };


    faceImage.src =
        tempCanvas.toDataURL(
            "image/png"
        );


    flash.style.transition =
        "none";

    flash.style.opacity =
        ".9";


    requestAnimationFrame(
        () => {

            flash.style.transition =
                "opacity .35s ease";

            flash.style.opacity =
                "0";

        }
    );

}


/* =========================
   TRIGGER SCREEN FLASH
========================= */

function triggerFlash() {
    const flash = document.getElementById("flash");
    if (!flash) return;
    flash.style.transition = "none";
    flash.style.opacity = ".9";

    requestAnimationFrame(() => {
        flash.style.transition = "opacity .35s ease";
        flash.style.opacity = "0";
    });
}


/* =========================
   UPLOAD PHOTO FILE
========================= */

function loadPhotoFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        faceImage = new Image();
        faceImage.onload = async () => {
            triggerFlash();
            showGame();
            createCan();

            if (!cameraStream) {
                await startCamera();
            }

            const video = document.getElementById("cameraVideo");
            if (typeof initHandTracker === "function" && video) {
                initHandTracker(video);
            }
        };
        faceImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}


/* =========================
   LOAD DEMO PILOT AVATAR
========================= */

function loadDemoPilot() {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 300;
    tempCanvas.height = 300;
    const ctx = tempCanvas.getContext("2d");

    // Background circle
    const bgGrad = ctx.createLinearGradient(0, 0, 300, 300);
    bgGrad.addColorStop(0, "#00d4ff");
    bgGrad.addColorStop(0.5, "#0066cc");
    bgGrad.addColorStop(1, "#001a40");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.fill();

    // Aviator / Pilot face
    ctx.fillStyle = "#ffdbac";
    ctx.beginPath();
    ctx.arc(150, 155, 75, 0, Math.PI * 2);
    ctx.fill();

    // Pilot helmet / flight cap
    ctx.fillStyle = "#d90429";
    ctx.beginPath();
    ctx.arc(150, 130, 82, Math.PI, 0);
    ctx.lineTo(230, 160);
    ctx.lineTo(210, 200);
    ctx.lineTo(190, 160);
    ctx.lineTo(110, 160);
    ctx.lineTo(90, 200);
    ctx.lineTo(70, 160);
    ctx.closePath();
    ctx.fill();

    // Aviator goggles strap
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(70, 135, 160, 12);

    // Goggles lenses
    ctx.fillStyle = "#ffc700";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 6;

    // Left lens
    ctx.beginPath();
    ctx.ellipse(120, 140, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right lens
    ctx.beginPath();
    ctx.ellipse(180, 140, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Goggles reflection gleam
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.ellipse(114, 134, 12, 8, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(174, 134, 12, 8, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Big happy smile
    ctx.strokeStyle = "#8c001a";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(150, 180, 28, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    faceImage = new Image();
    faceImage.onload = async () => {
        triggerFlash();
        showGame();
        createCan();

        if (!cameraStream) {
            await startCamera();
        }

        const video = document.getElementById("cameraVideo");
        if (typeof initHandTracker === "function" && video) {
            initHandTracker(video);
        }
    };
    faceImage.src = tempCanvas.toDataURL("image/png");
}


/* =========================
   SHOW CAMERA
========================= */

function showCamera() {

    document.getElementById(
        "cameraScreen"
    ).style.display =
        "flex";


    document.getElementById(
        "gameScreen"
    ).style.display =
        "none";


    startCamera();
}


/* =========================
   SHOW GAME
========================= */

function showGame() {

    document.getElementById(
        "cameraScreen"
    ).style.display =
        "none";


    document.getElementById(
        "gameScreen"
    ).style.display =
        "block";

}


/* =========================
   INITIALIZE PHOTO & DEMO LISTENERS
========================= */

document.addEventListener("DOMContentLoaded", () => {
    const photoInput = document.getElementById("photoInput");
    if (photoInput) {
        photoInput.addEventListener("change", event => {
            if (event.target.files && event.target.files[0]) {
                loadPhotoFile(event.target.files[0]);
            }
        });
    }

    const demoPilotBtn = document.getElementById("demoPilotBtn");
    if (demoPilotBtn) {
        demoPilotBtn.addEventListener("click", () => {
            loadDemoPilot();
        });
    }

    const pipToggleBtn = document.getElementById("pipToggleBtn");
    if (pipToggleBtn) {
        pipToggleBtn.addEventListener("click", () => {
            const pipContainer = document.getElementById("pipContainer");
            if (pipContainer) {
                pipContainer.classList.toggle("minimized");
                pipToggleBtn.textContent = pipContainer.classList.contains("minimized") ? "□" : "─";
            }
        });
    }
});
