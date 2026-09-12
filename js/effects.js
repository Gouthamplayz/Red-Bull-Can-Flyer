const particles = [];

const bubbles = [];


/* =========================
   PARTICLE
========================= */

function createParticles(
    x,
    y,
    amount = 24
) {

    const palette = [
        "#ea0029", // Red Bull Crimson
        "#ff1744", // Bright Red
        "#ffcc00", // Red Bull Sun Gold
        "#ffe066", // Bright Gold
        "#0066ff", // Electric Blue
        "#00d4ff", // Cyan Spark
        "#ffffff", // Silver Sparkle
        "#dce6f2"  // Platinum
    ];

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - .5) *
                8,

            vy:
                (Math.random() - .5) *
                8,

            life: 1,

            size:
                2.5 +
                Math.random() * 5,

            color:
                palette[
                    Math.floor(
                        Math.random() *
                        palette.length
                    )
                ]

        });

    }
}


/* =========================
   UPDATE PARTICLES
========================= */

function updateParticles(dt) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];


        p.x +=
            p.vx * dt;

        p.y +=
            p.vy * dt;


        p.vy +=
            .12 * dt;


        p.life -=
            .035 * dt;


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }
}


/* =========================
   DRAW PARTICLES
========================= */

function drawParticles(ctx) {

    for (
        const p of particles
    ) {

        ctx.save();

        ctx.globalAlpha =
            Math.max(
                0,
                p.life
            );

        ctx.fillStyle =
            p.color || "white";


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }
}


/* =========================
   FLASH
========================= */

function screenFlash() {

    const flash =
        document.getElementById(
            "flash"
        );


    flash.style.transition =
        "none";

    flash.style.opacity =
        ".8";


    requestAnimationFrame(
        () => {

            flash.style.transition =
                "opacity .3s ease";

            flash.style.opacity =
                "0";

        }
    );
}


/* =========================
   BUBBLE
========================= */

function createBubble(
    text,
    x,
    y
) {

    bubbles.push({

        text: text,

        x: x,

        y: y,

        life: 1

    });

}


/* =========================
   UPDATE BUBBLES
========================= */

function updateBubbles(dt) {

    for (
        let i = bubbles.length - 1;
        i >= 0;
        i--
    ) {

        const bubble =
            bubbles[i];


        bubble.y -=
            .5 * dt;

        bubble.life -=
            .018 * dt;


        if (
            bubble.life <= 0
        ) {

            bubbles.splice(
                i,
                1
            );

        }

    }
}


/* =========================
   DRAW BUBBLES
========================= */

function drawBubbles(ctx) {

    ctx.save();

    ctx.font =
        "bold italic 14px 'Barlow Condensed', 'Outfit', sans-serif";

    ctx.textAlign =
        "center";


    for (
        const bubble of bubbles
    ) {

        ctx.globalAlpha =
            bubble.life;


        const width =
            ctx.measureText(
                bubble.text
            ).width + 28;


        ctx.fillStyle =
            "rgba(0, 14, 38, 0.92)";

        ctx.strokeStyle =
            "#ffcc00";

        ctx.lineWidth =
            2;


        ctx.beginPath();

        ctx.roundRect(
            bubble.x - width / 2,
            bubble.y - 25,
            width,
            32,
            12
        );

        ctx.fill();

        ctx.stroke();


        ctx.fillStyle =
            "#ffffff";


        ctx.fillText(
            bubble.text,
            bubble.x,
            bubble.y - 4
        );

    }


    ctx.restore();
}


/* =========================
   LASER BEAMS & MUZZLE FLASHES
========================= */

const lasers = [];
const muzzleFlashes = [];

function createLaserBeam(startX, startY, targetX, targetY, isHit = false) {
    lasers.push({
        x1: startX,
        y1: startY,
        x2: targetX,
        y2: targetY,
        life: 1.0,
        isHit: isHit,
        width: isHit ? 5 : 3.5
    });

    createMuzzleFlash(startX, startY);
}

function createMuzzleFlash(x, y) {
    muzzleFlashes.push({
        x: x,
        y: y,
        radius: 32,
        life: 1.0
    });
}

function updateLasers(dt) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].life -= 0.1 * dt;
        if (lasers[i].life <= 0) {
            lasers.splice(i, 1);
        }
    }

    for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
        muzzleFlashes[i].life -= 0.16 * dt;
        muzzleFlashes[i].radius += 2.5 * dt;
        if (muzzleFlashes[i].life <= 0) {
            muzzleFlashes.splice(i, 1);
        }
    }
}

function drawLasers(ctx) {
    for (const flash of muzzleFlashes) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, flash.life);
        const grad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.45, "rgba(0, 212, 255, 0.85)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    for (const laser of lasers) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, laser.life);

        // Outer glow
        ctx.strokeStyle = laser.isHit ? "rgba(0, 212, 255, 0.8)" : "rgba(0, 140, 255, 0.6)";
        ctx.lineWidth = laser.width * 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

        // Inner white-hot laser core
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = laser.width;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();

        ctx.restore();
    }
}