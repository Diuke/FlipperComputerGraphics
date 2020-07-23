function displayControls() {
    // displaying game controls
    let gameControls = document.getElementById("gameControls");
    let gc1 = document.createElement("li");
    let gc2 = document.createElement("li");
    let gc3 = document.createElement("li");

    gc1.innerHTML = "left flipper: 1";
    gc2.innerHTML = "right flipper: 2";
    gc3.innerHTML = "launch ball: space";

    gameControls.appendChild(gc1);
    gameControls.appendChild(gc2);
    gameControls.appendChild(gc3);

    // displaying camera controls
    let cameraControls = document.getElementById("cameraControls");
    let cc1 = document.createElement("li");
    let cc2 = document.createElement("li");
    let cc3 = document.createElement("li");
    let cc4 = document.createElement("li");
    let cc5 = document.createElement("li");
    let cc6 = document.createElement("li");
    let cc7 = document.createElement("li");
    let cc8 = document.createElement("li");
    let cc9 = document.createElement("li");
    let cc10 = document.createElement("li");

    cc1.innerHTML = "move forward: z" 
    cc2.innerHTML = "move backward: x" ;
    cc3.innerHTML = "move left: a" ;
    cc4.innerHTML = "move right: d" ;
    cc5.innerHTML = "move up: w";
    cc6.innerHTML = "move down: s ";
    cc7.innerHTML = "tilt up: r" ;
    cc8.innerHTML = "tilt down: f" ;
    cc9.innerHTML = "pan left: q" ;
    cc10.innerHTML = "pan right: e" ;

    cameraControls.appendChild(cc1);
    cameraControls.appendChild(cc2);
    cameraControls.appendChild(cc3);
    cameraControls.appendChild(cc4);
    cameraControls.appendChild(cc5);
    cameraControls.appendChild(cc6);
    cameraControls.appendChild(cc7);
    cameraControls.appendChild(cc8);
    cameraControls.appendChild(cc9);
    cameraControls.appendChild(cc10);

 /*    // preload ballsCounter, gameOver and loading elements
    ballCounter = document.getElementById("ballCounter");
    gameOverBg = document.getElementById("gameOverBg");
    gameOverMsg = document.getElementById("gameOverMsg");
    loadingBg = document.getElementById("loadingBg");
    loadingMsg = document.getElementById("loadingMsg");
    
    updateBallCounter(lives, false); */
   
}
