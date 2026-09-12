document.addEventListener(
    "DOMContentLoaded",
    () => {

        const captureButton =
            document.getElementById(
                "captureBtn"
            );


        const newCanButton =
            document.getElementById(
                "newCanButton"
            );


        const cameraButton =
            document.getElementById(
                "cameraButton"
            );


        /*
           Capture face
        */

        captureButton.addEventListener(
            "click",
            () => {

                captureFace();

            }
        );


        /*
           Create another can
        */

        newCanButton.addEventListener(
            "click",
            () => {

                if (faceImage) {

                    addNewCan();

                } else {

                    showCamera();

                }

            }
        );


        /*
           Return to camera
        */

        cameraButton.addEventListener(
            "click",
            () => {

                showCamera();

            }
        );


        /*
           Frenzy Multi-Can Launch
        */

        const frenzyButton =
            document.getElementById(
                "frenzyButton"
            );

        if (frenzyButton) {

            frenzyButton.addEventListener(
                "click",
                () => {

                    if (faceImage) {

                        addNewCan();

                        setTimeout(
                            () => addNewCan(),
                            140
                        );

                        setTimeout(
                            () => addNewCan(),
                            280
                        );

                    } else {

                        showCamera();

                    }

                }
            );

        }


        /*
           Mute Audio Toggle
        */

        const muteButton =
            document.getElementById(
                "muteButton"
            );

        if (muteButton) {

            muteButton.addEventListener(
                "click",
                () => {

                    if (typeof toggleMute === "function") {

                        toggleMute();

                    }

                }
            );

        }


        /*
           Start camera
        */

        showCamera();

    }
);