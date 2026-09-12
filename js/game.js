const canvas =
    document.getElementById(
        "gameCanvas"
    );


const ctx =
    canvas.getContext(
        "2d"
    );


let lastTime = 0;

let gameRunning = false;

let clickTotal = 0;

let combo = 0;

let comboTimer = 0;


/* =========================
   RESIZE
========================= */

function resizeCanvas() {

    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        window.innerWidth * dpr;


    canvas.height =
        window.innerHeight * dpr;


    canvas.style.width =
        window.innerWidth + "px";


    canvas.style.height =
        window.innerHeight + "px";


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


/* =========================
   CLICK COUNTER
========================= */

function incrementClicks() {

    clickTotal++;

    combo++;

    comboTimer =
        3;


    document.getElementById(
        "clickCount"
    ).textContent =
        clickTotal;


    document.getElementById(
        "comboCount"
    ).textContent =
        combo;


    /*
       Dynamic HUD, Wings Power Meter & Combo Effects
    */

    const meterBar = document.getElementById("meterBar");
    const meterPercent = document.getElementById("meterPercent");
    if (meterBar && meterPercent) {
        const energy = Math.min(150, 100 + combo * 10);
        meterPercent.textContent = energy + "%";
        meterBar.style.width = Math.min(100, (energy / 150) * 100) + "%";
        meterBar.style.filter = combo >= 3 ? "brightness(1.5) drop-shadow(0 0 10px #ffcc00)" : "brightness(1.2)";
    }

    const comboCard =
        document.getElementById("comboCard");

    if (comboCard) {
        if (combo > 1) {
            comboCard.classList.add("active-combo");
            if (combo >= 4) {
                comboCard.classList.add("fire-combo");
            }
        }
    }

    const gameMsg =
        document.getElementById("gameMessage");

    if (gameMsg) {
        const msgText =
            gameMsg.querySelector(".msg-text") || gameMsg;

        if (combo >= 4) {
            msgText.textContent = `🔥 ${combo}x COMBO! MAXIMUM WINGS OVERDRIVE!`;
        } else if (combo > 1) {
            msgText.textContent = `⚡ ${combo}x COMBO! GIVES YOU WIIINGS!`;
        } else {
            msgText.textContent = `💥 RED BULL CAN POPPED!`;
        }
    }

}


/* =========================
   GAME UPDATE
========================= */

function updateGame(dt) {

    updateCans(dt);

    updateParticles(dt);

    updateBubbles(dt);

    if (typeof updateLasers === "function") {
        updateLasers(dt);
    }


    /*
       Combo timeout
    */

    comboTimer -=
        dt / 60;


    if (
        comboTimer <= 0
    ) {

        combo = 0;

        document.getElementById(
            "comboCount"
        ).textContent =
            "0";

        const meterBar = document.getElementById("meterBar");
        const meterPercent = document.getElementById("meterPercent");
        if (meterBar && meterPercent) {
            meterPercent.textContent = "100%";
            meterBar.style.width = "100%";
            meterBar.style.filter = "brightness(1)";
        }

        const comboCard =
            document.getElementById("comboCard");

        if (comboCard) {
            comboCard.classList.remove("active-combo", "fire-combo");
        }

        const gameMsg =
            document.getElementById("gameMessage");

        if (gameMsg) {
            const msgText =
                gameMsg.querySelector(".msg-text") || gameMsg;

            msgText.textContent =
                "PIT RADIO // POINT WITH FINGER GUN 👉 OR CLICK CAN TO POP!";
        }

    }

}



/* =========================
   GAME DRAW
========================= */

function drawGame() {

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    drawCans(ctx);

    drawParticles(ctx);

    drawBubbles(ctx);

    if (typeof drawLasers === "function") {
        drawLasers(ctx);
    }

    if (typeof drawReticle === "function") {
        drawReticle(ctx);
    }

}


/* =========================
   GAME LOOP
========================= */

function gameLoop(
    timestamp
) {

    if (!lastTime) {

        lastTime =
            timestamp;

    }


    const dt =
        Math.min(

            (
                timestamp -
                lastTime
            ) / 16.6667,

            3

        );


    lastTime =
        timestamp;


    updateGame(dt);

    drawGame();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================
   START GAME
========================= */

function startGame() {

    if (gameRunning) {
        return;
    }


    gameRunning =
        true;


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================
   CANVAS CLICK
========================= */

canvas.addEventListener(
    "click",
    event => {

        if (typeof shootAt === "function") {
            shootAt(event.clientX, event.clientY, event.clientX, window.innerHeight);
        } else {
            clickCan(
                event.clientX,
                event.clientY
            );
        }

    }
);


/* =========================
   TOUCH
========================= */

canvas.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.touches[0];


        if (!touch) {
            return;
        }


        if (typeof shootAt === "function") {
            shootAt(touch.clientX, touch.clientY, touch.clientX, window.innerHeight);
        } else {
            clickCan(
                touch.clientX,
                touch.clientY
            );
        }


        event.preventDefault();

    },
    {
        passive: false
    }
);


/* =========================
   NEW CAN
========================= */

function addNewCan() {

    createCan();

}


/* =========================
   START
========================= */

startGame();