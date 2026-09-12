const cans = [];

let totalCans = 0;


/* =========================
   CAN IMAGE ASSET (rbc.png)
========================= */

const canImage = new Image();
canImage.src = "assets/rbc.png";

let processedCanCanvas = null;
let canAspectRatio = 0.39; // Authentic slim Red Bull can aspect ratio

function processCanImage(img) {
    try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) return img;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
        tCtx.drawImage(img, 0, 0);

        const imgData = tCtx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Check if corner/outer pixels are white/light background
        const samplePoints = [
            0,
            (w - 1) * 4,
            ((h - 1) * w) * 4,
            ((h - 1) * w + (w - 1)) * 4,
            Math.floor(w / 2) * 4
        ];

        let hasWhiteBorder = false;
        for (let i = 0; i < samplePoints.length; i++) {
            const idx = samplePoints[i];
            if (data[idx + 3] > 100 && data[idx] > 230 && data[idx + 1] > 230 && data[idx + 2] > 230) {
                hasWhiteBorder = true;
                break;
            }
        }

        if (hasWhiteBorder) {
            const visited = new Uint8Array(w * h);
            const queueX = new Int32Array(w * h);
            const queueY = new Int32Array(w * h);
            let head = 0;
            let tail = 0;

            function enqueue(x, y) {
                const pos = y * w + x;
                if (!visited[pos]) {
                    visited[pos] = 1;
                    queueX[tail] = x;
                    queueY[tail] = y;
                    tail++;
                }
            }

            for (let x = 0; x < w; x++) {
                enqueue(x, 0);
                enqueue(x, h - 1);
            }
            for (let y = 1; y < h - 1; y++) {
                enqueue(0, y);
                enqueue(w - 1, y);
            }

            while (head < tail) {
                const qx = queueX[head];
                const qy = queueY[head];
                head++;

                const idx = (qy * w + qx) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];

                if (a > 0 && r > 215 && g > 215 && b > 215) {
                    data[idx + 3] = 0;

                    if (qx + 1 < w) enqueue(qx + 1, qy);
                    if (qx - 1 >= 0) enqueue(qx - 1, qy);
                    if (qy + 1 < h) enqueue(qx, qy + 1);
                    if (qy - 1 >= 0) enqueue(qx, qy - 1);
                }
            }

            tCtx.putImageData(imgData, 0, 0);
        }

        let minX = w, minY = h, maxX = 0, maxY = 0;
        let found = false;
        for (let y = 0; y < h; y++) {
            const rowOffset = y * w * 4;
            for (let x = 0; x < w; x++) {
                if (data[rowOffset + x * 4 + 3] > 20) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }

        if (found && maxX > minX && maxY > minY) {
            const cropW = maxX - minX + 1;
            const cropH = maxY - minY + 1;
            const croppedCanvas = document.createElement("canvas");
            croppedCanvas.width = cropW;
            croppedCanvas.height = cropH;
            const cCtx = croppedCanvas.getContext("2d");
            cCtx.drawImage(tempCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
            return croppedCanvas;
        }

        return tempCanvas;
    } catch (e) {
        console.warn("Could not process can image:", e);
        return img;
    }
}

canImage.onload = () => {
    processedCanCanvas = processCanImage(canImage);
    if (processedCanCanvas && processedCanCanvas.height > 0) {
        canAspectRatio = processedCanCanvas.width / processedCanCanvas.height;
    }
};

if (canImage.complete && canImage.naturalWidth > 0) {
    processedCanCanvas = processCanImage(canImage);
    if (processedCanCanvas && processedCanCanvas.height > 0) {
        canAspectRatio = processedCanCanvas.width / processedCanCanvas.height;
    }
}


/* =========================
   CREATE CAN
========================= */

function createCan() {

    if (!faceImage) {
        return;
    }


    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    const can = {

        id:
            Date.now() +
            Math.random(),


        x:
            width * .15 +
            Math.random() *
            width * .7,


        y:
            height + 120,


        vx:
            (
                Math.random() -
                .5
            ) * 1.5,


        vy:
            -(
                2 +
                Math.random() * 2
            ),


        rotation:
            (
                Math.random() -
                .5
            ) * .4,


        vrot:
            (
                Math.random() -
                .5
            ) * .025,


        scale:
            .9 +
            Math.random() * .25,


        image:
            faceImage,


        state:
            "flying",


        fallVelocity:
            0,


        cooldown:
            0,


        squish:
            0,


        age:
            0,


        wingAngle:
            0,


        hitFlash:
            0

    };


    cans.push(can);


    totalCans++;


    document.getElementById(
        "canCount"
    ).textContent =
        totalCans;

}


/* =========================
   CAN HIT
========================= */

function hitCan(can) {

    if (
        can.state !==
        "flying"
    ) {

        return;

    }


    /*
       VOICE ONLY WHEN CLICKED
    */

    sayWings();


    wingsChime();


    can.state =
        "falling";


    can.fallVelocity =
        1;


    can.cooldown =
        5;


    can.hitFlash =
        1;


    can.squish =
        1;


    can.vrot +=
        (
            Math.random() -
            .5
        ) * .3;


    createParticles(
        can.x,
        can.y,
        25
    );


    createBubble(
        "NO WINGS! 😭",
        can.x,
        can.y - 120
    );


    screenFlash();


    fallSound();


    incrementClicks();

}


/* =========================
   UPDATE CAN
========================= */

function updateCan(
    can,
    dt
) {

    can.age +=
        dt;


    can.squish *=
        .9;


    can.hitFlash *=
        .9;


    /*
       FLYING
    */

    if (
        can.state ===
        "flying"
    ) {

        can.x +=
            can.vx * dt;


        can.y +=
            can.vy * dt;


        can.rotation +=
            can.vrot * dt;


        /*
           Natural floating
        */

        can.x +=
            Math.sin(
                can.age * .035
            ) * .35;


        can.wingAngle =
            Math.sin(
                can.age * .18
            ) * .20;


        /*
           Screen wrapping
        */

        if (
            can.x < -100
        ) {

            can.x =
                window.innerWidth + 100;

        }


        if (
            can.x >
            window.innerWidth + 100
        ) {

            can.x = -100;

        }

    }


    /*
       FALLING
    */

    if (
        can.state ===
        "falling"
    ) {

        can.fallVelocity +=
            .25 * dt;


        can.y +=
            can.fallVelocity *
            dt;


        can.rotation +=
            can.vrot * dt;


        /*
           Slow horizontal movement
        */

        can.x +=
            can.vx *
            .5 *
            dt;


        /*
           Countdown
        */

        can.cooldown -=
            dt / 60;


        /*
           Once cooldown finishes
        */

        if (
            can.cooldown <= 0
        ) {

            can.cooldown = 0;

            can.state =
                "recovering";

        }


        /*
           Remove only if far below
        */

        if (
            can.y >
            window.innerHeight + 250
        ) {

            can.y =
                window.innerHeight + 100;

            can.fallVelocity =
                0;

        }

    }


    /*
       RECOVERING
    */

    if (
        can.state ===
        "recovering"
    ) {

        /*
           Rise back into the sky
        */

        can.y -=
            3 * dt;


        can.rotation *=
            .96;


        can.wingAngle *=
            .9;


        if (
            can.y <
            window.innerHeight - 200
        ) {

            can.state =
                "flying";


            can.vy =
                -(
                    2 +
                    Math.random() * 2
                );


            can.vx =
                (
                    Math.random() -
                    .5
                ) * 1.5;

        }

    }

}


/* =========================
   DRAW RED BULL WINGS
========================= */

function drawWing(
    ctx,
    side,
    width,
    height,
    angle
) {

    ctx.save();

    // Attach wing at upper-mid side of can body
    const rootX =
        side * (width * 0.40);

    const rootY =
        -height * 0.14;

    ctx.translate(
        rootX,
        rootY
    );

    // Dynamic wing flap angle
    ctx.rotate(
        side * angle
    );

    // Mirror symmetrically for left wing
    ctx.scale(
        side,
        1
    );

    const w =
        width * 1.45;

    const h =
        height * 0.55;

    /*
       Main Feathered Wing (Classic Red Bull Cartoon Wing)
    */

    ctx.beginPath();

    // Start at wing root
    ctx.moveTo(
        0,
        0
    );

    // Top sweeping leading edge arch
    ctx.bezierCurveTo(
        w * 0.22,
        -h * 0.70,
        w * 0.65,
        -h * 0.88,
        w * 0.95,
        -h * 0.72
    );

    // Primary Feather Tip 1 (Topmost)
    ctx.quadraticCurveTo(
        w * 1.05,
        -h * 0.68,
        w * 1.08,
        -h * 0.60
    );

    ctx.quadraticCurveTo(
        w * 0.92,
        -h * 0.48,
        w * 0.84,
        -h * 0.44
    );

    // Primary Feather Tip 2 (Longest flight feather)
    ctx.quadraticCurveTo(
        w * 0.98,
        -h * 0.40,
        w * 1.04,
        -h * 0.30
    );

    ctx.quadraticCurveTo(
        w * 0.88,
        -h * 0.22,
        w * 0.80,
        -h * 0.18
    );

    // Primary Feather Tip 3
    ctx.quadraticCurveTo(
        w * 0.92,
        -h * 0.14,
        w * 0.96,
        -h * 0.04
    );

    ctx.quadraticCurveTo(
        w * 0.80,
        0.02,
        w * 0.72,
        0.05
    );

    // Primary Feather Tip 4
    ctx.quadraticCurveTo(
        w * 0.82,
        0.12,
        w * 0.84,
        0.20
    );

    ctx.quadraticCurveTo(
        w * 0.70,
        0.22,
        w * 0.62,
        0.24
    );

    // Secondary Feathers / Lower scallops returning to can
    ctx.quadraticCurveTo(
        w * 0.54,
        h * 0.36,
        w * 0.42,
        h * 0.32
    );

    ctx.quadraticCurveTo(
        w * 0.36,
        h * 0.40,
        w * 0.24,
        h * 0.32
    );

    ctx.quadraticCurveTo(
        w * 0.12,
        h * 0.28,
        0,
        h * 0.14
    );

    ctx.closePath();

    // Gradient fill for soft dimensional shading
    const wingGrad =
        ctx.createLinearGradient(
            0,
            -h * 0.8,
            w,
            h * 0.3
        );

    wingGrad.addColorStop(
        0,
        "#ffffff"
    );

    wingGrad.addColorStop(
        0.65,
        "#fdfefe"
    );

    wingGrad.addColorStop(
        1,
        "#edf3f8"
    );

    ctx.fillStyle =
        wingGrad;

    ctx.fill();

    // Clean cartoon outline (Red Bull comic style)
    ctx.strokeStyle =
        "#243242";

    ctx.lineWidth =
        2.4;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";

    ctx.stroke();

    /*
       Interior Feather Ribs / Quills (Red Bull hand-drawn comic details)
    */

    ctx.strokeStyle =
        "rgba(40, 65, 95, 0.35)";

    ctx.lineWidth =
        1.8;

    // Rib into Tip 1
    ctx.beginPath();
    ctx.moveTo(
        w * 0.95,
        -h * 0.58
    );
    ctx.quadraticCurveTo(
        w * 0.72,
        -h * 0.46,
        w * 0.45,
        -h * 0.28
    );
    ctx.stroke();

    // Rib into Tip 2
    ctx.beginPath();
    ctx.moveTo(
        w * 0.90,
        -h * 0.28
    );
    ctx.quadraticCurveTo(
        w * 0.68,
        -h * 0.18,
        w * 0.40,
        -h * 0.08
    );
    ctx.stroke();

    // Rib into Tip 3
    ctx.beginPath();
    ctx.moveTo(
        w * 0.82,
        -h * 0.02
    );
    ctx.quadraticCurveTo(
        w * 0.60,
        0.06,
        w * 0.38,
        0.12
    );
    ctx.stroke();

    /*
       Covert feather tier (upper shoulder tuft)
    */

    ctx.fillStyle =
        "rgba(255, 255, 255, 0.85)";

    ctx.beginPath();

    ctx.moveTo(
        w * 0.08,
        -h * 0.25
    );

    ctx.quadraticCurveTo(
        w * 0.32,
        -h * 0.42,
        w * 0.48,
        -h * 0.20
    );

    ctx.quadraticCurveTo(
        w * 0.36,
        -h * 0.04,
        w * 0.18,
        0.02
    );

    ctx.quadraticCurveTo(
        w * 0.08,
        0,
        0,
        0
    );

    ctx.closePath();

    ctx.fill();

    ctx.strokeStyle =
        "rgba(40, 65, 95, 0.4)";

    ctx.lineWidth =
        1.5;

    ctx.stroke();

    ctx.restore();

}



/* =========================
   DRAW BULL EMBLEM
========================= */

function drawBull(
    ctx,
    size
) {

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();


    ctx.moveTo(
        -size * .4,
        -size * .1
    );


    ctx.quadraticCurveTo(
        -size * .75,
        -size * .45,
        -size * .9,
        -size * .3
    );


    ctx.quadraticCurveTo(
        -size * .7,
        size * .1,
        -size * .25,
        size * .2
    );


    ctx.quadraticCurveTo(
        0,
        size * .45,
        size * .25,
        size * .2
    );


    ctx.quadraticCurveTo(
        size * .7,
        size * .1,
        size * .9,
        -size * .3
    );


    ctx.quadraticCurveTo(
        size * .75,
        -size * .45,
        size * .4,
        -size * .1
    );


    ctx.quadraticCurveTo(
        0,
        -size * .3,
        -size * .4,
        -size * .1
    );


    ctx.closePath();

    ctx.fill();

}


/* =========================
   DRAW CAN
========================= */

function drawCan(
    ctx,
    can
) {

    const height =
        230 * can.scale;

    const width =
        height * canAspectRatio;


    ctx.save();


    ctx.translate(
        can.x,
        can.y
    );


    ctx.rotate(
        can.rotation
    );


    const squish =
        1 +
        can.squish * .08;


    ctx.scale(
        1,
        squish
    );


    /*
       Wings disappear while
       can is falling.
    */

    if (
        can.state ===
        "flying"
    ) {

        drawWing(
            ctx,
            -1,
            width,
            height,
            can.wingAngle
        );


        drawWing(
            ctx,
            1,
            width,
            height,
            -can.wingAngle
        );

    }


    /*
       Can body: rbc.png
    */

    const canSource =
        processedCanCanvas ||
        canImage;

    if (
        canSource &&
        (canSource.width || canSource.naturalWidth)
    ) {

        ctx.drawImage(
            canSource,
            -width / 2,
            -height / 2,
            width,
            height
        );

    } else {

        ctx.fillStyle =
            "#d71920";

        ctx.beginPath();

        ctx.roundRect(
            -width / 2,
            -height / 2,
            width,
            height,
            12
        );

        ctx.fill();

    }


    /*
       Face (Photo inside can) - Positioned at top, above RED BULL logo
    */

    const faceRadius =
        width * .38;

    const faceY =
        -height * .32;


    ctx.save();

    ctx.beginPath();

    ctx.arc(
        0,
        faceY,
        faceRadius,
        0,
        Math.PI * 2
    );

    ctx.clip();


    if (can.image) {

        ctx.drawImage(
            can.image,
            -faceRadius,
            faceY - faceRadius,
            faceRadius * 2,
            faceRadius * 2
        );

    }

    ctx.restore();


    /*
       Face border
    */

    ctx.save();

    ctx.strokeStyle =
        "white";

    ctx.lineWidth =
        3.5;

    ctx.shadowColor =
        "rgba(0, 0, 0, 0.45)";

    ctx.shadowBlur =
        6;

    ctx.beginPath();

    ctx.arc(
        0,
        faceY,
        faceRadius,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();


    /*
       Cooldown overlay
    */

    if (
        can.state ===
        "falling"
    ) {

        ctx.save();

        ctx.fillStyle =
            "rgba(0,0,0,.55)";

        ctx.beginPath();

        ctx.roundRect(
            -width / 2,
            -height / 2,
            width,
            height,
            12
        );

        ctx.fill();


        /*
           Cooldown number
        */

        ctx.fillStyle =
            "white";

        ctx.font =
            `900 ${26 * can.scale}px Arial`;

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            Math.ceil(
                can.cooldown
            ),
            0,
            0
        );


        ctx.font =
            `bold ${11 * can.scale}px Arial`;

        ctx.fillText(
            "NO WINGS",
            0,
            24 * can.scale
        );

        ctx.restore();

    }


    /*
       Hit flash
    */

    if (
        can.hitFlash > .05
    ) {

        ctx.save();

        ctx.fillStyle =
            `rgba(255,255,255,${can.hitFlash * .55})`;

        ctx.beginPath();

        ctx.roundRect(
            -width / 2,
            -height / 2,
            width,
            height,
            12
        );

        ctx.fill();

        ctx.restore();

    }


    ctx.restore();

}



/* =========================
   UPDATE ALL CANS
========================= */

function updateCans(dt) {

    for (
        let i = cans.length - 1;
        i >= 0;
        i--
    ) {

        updateCan(
            cans[i],
            dt
        );

    }

}


/* =========================
   DRAW ALL CANS
========================= */

function drawCans(ctx) {

    for (
        const can of cans
    ) {

        drawCan(
            ctx,
            can
        );

    }

}


/* =========================
   CLICK DETECTION
========================= */

function clickCan(
    x,
    y
) {

    for (
        let i = cans.length - 1;
        i >= 0;
        i--
    ) {

        const can =
            cans[i];


        const dx =
            x - can.x;


        const dy =
            y - can.y;


        const height =
            230 * can.scale;

        const width =
            height * canAspectRatio;

        // Check in rotated local coordinate space for precise hit detection
        const cos = Math.cos(-can.rotation);
        const sin = Math.sin(-can.rotation);
        const lx = cos * dx - sin * dy;
        const ly = sin * dx + cos * dy;

        const halfW = (width / 2) + 15;
        const halfH = (height / 2) + 15;

        if (
            Math.abs(lx) <= halfW &&
            Math.abs(ly) <= halfH
        ) {

            /*
               Already falling?
               Don't allow another hit.
            */

            if (
                can.state !==
                "flying"
            ) {

                return;

            }


            hitCan(can);

            return;

        }

    }

}


/* =========================
   CAN HIT TESTING & SHOOTING
========================= */

function findCanAt(x, y) {

    for (let i = cans.length - 1; i >= 0; i--) {

        const can = cans[i];

        if (can.state !== "flying") {
            continue;
        }

        const dx = x - can.x;
        const dy = y - can.y;

        const height = 230 * can.scale;
        const width = height * canAspectRatio;

        const cos = Math.cos(-can.rotation);
        const sin = Math.sin(-can.rotation);
        const lx = cos * dx - sin * dy;
        const ly = sin * dx + cos * dy;

        const halfW = (width / 2) + 22;
        const halfH = (height / 2) + 22;

        if (Math.abs(lx) <= halfW && Math.abs(ly) <= halfH) {
            return can;
        }

    }

    return null;

}

function shootAt(targetX, targetY, originX = null, originY = null) {

    const startX = originX !== null ? originX : (targetX * 0.4 + window.innerWidth * 0.3);
    const startY = originY !== null ? originY : window.innerHeight;

    if (typeof shootLaserSound === "function") {
        shootLaserSound();
    }

    const hit = findCanAt(targetX, targetY);

    if (hit) {

        if (typeof createLaserBeam === "function") {
            createLaserBeam(startX, startY, hit.x, hit.y, true);
        }

        hitCan(hit);
        return hit;

    } else {

        if (typeof createLaserBeam === "function") {
            createLaserBeam(startX, startY, targetX, targetY, false);
        }

        return null;

    }

}