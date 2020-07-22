var baseDirDark = "PinballDark/";
var baseDirLigth = "Pinball/";
var urls = {
    //Body and ball
    body: baseDirDark + "Body.obj",
    ball : baseDirDark + "Ball.obj",
    //Flippers
    leftFlipper : baseDirDark + "LeftFlipper.obj",
    rightFlipper : baseDirDark + "RightFlipper.obj",
    //Bumpers
    bumper1 : baseDirLigth + "bumper1.obj",
    bumper2 : baseDirLigth + "bumper2.obj",
    bumper3 : baseDirLigth + "bumper3.obj",
    //Puller
    puller : baseDirDark + "Puller.obj",
    //Digits right
    dr1 : baseDirDark + "DR1.obj",
    dr2 : baseDirDark + "DR1.obj",
    dr3 : baseDirDark + "DR3.obj",
    dr4 : baseDirDark + "DR4.obj",
    dr5 : baseDirDark + "DR5.obj",
    dr6 : baseDirDark + "DR6.obj",
    //Digits left
    dl1 : baseDirDark + "DL1.obj",
    dl2 : baseDirDark + "DL2.obj",
    dl3 : baseDirDark + "DL3.obj",
    dl4 : baseDirDark + "DL4.obj",
    dl5 : baseDirDark + "DL5.obj",
    dl6 : baseDirDark + "DL6.obj",
}

function getMeshes(){
    return urls;
}