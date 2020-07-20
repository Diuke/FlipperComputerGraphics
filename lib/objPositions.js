const yFix = -0.65;
const zFix = -1;
const angleFix = 7.5;

var bodyLocationMatrix = utils.MakeWorld(0.0, yFix, zFix, 0.0, angleFix, 0.0, 1.0);
var ballLocalMatrix = utils.MakeWorld(-0.30053, 8.5335, -5.9728, 0.0, 0.0, 0.0, 1.0);
var dl1LocalMatrix = utils.MakeWorld(0.4366, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dl2LocalMatrix = utils.MakeWorld(0.713, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dl3LocalMatrix = utils.MakeWorld(0.9923, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dl4LocalMatrix = utils.MakeWorld(1.3917, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dl5LocalMatrix = utils.MakeWorld(1.6681, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dl6LocalMatrix = utils.MakeWorld(1.9474, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dr1LocalMatrix = utils.MakeWorld(-2.8273, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dr2LocalMatrix = utils.MakeWorld(-2.5509, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dr3LocalMatrix = utils.MakeWorld(-2.2716, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dr4LocalMatrix = utils.MakeWorld(-1.8722, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dr5LocalMatrix = utils.MakeWorld(-1.5958, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var dr6LocalMatrix = utils.MakeWorld(-1.316, 12.789-1.29, 4.1852+0.61, 0.0, -101.0, 0.0, 1.0);
var leftFlipperLocalMatrix = utils.MakeWorld(0.6906, 8.4032, -5.6357+0.49,29.8,-3.24+15,-5.64, 1.0);
var rightFlipperLocalMatrix = utils.MakeWorld(-1.307, 8.4032, -5.6357+0.49, 150.0,-3.24+15,-5.64, 1.0);
var leftButtonLocalMatrix = utils.MakeWorld(2.6175, 8.7853, -6.6902, 0.0, 0.0, -90.0, 1.0);
var rightButtonLocalMatrix = utils.MakeWorld(-2.97, 8.7853, -6.6902, 0.0, 0.0, 90.0, 1.0);
var pullerLocalMatrix = utils.MakeWorld(-2.5264, 8.3925, -7.5892, 0.0, -90.0, 0.0, 1.0);
var bumper1LocalMatrix = utils.MakeWorld(0.7, 9.1362+yFix, 0.605, -6.51, 0.0, 0.0, 1.0);
var bumper2LocalMatrix = utils.MakeWorld(-0.2, 9.1362+yFix, 1.4272, -6.51, 0.0, 0.0, 1.0);
var bumper3LocalMatrix = utils.MakeWorld(-1.1, 9.1362+yFix, 0.605, -6.51, 0.0, 0.0, 1.0);

var worlds = {
    //Body and ball
    body: bodyLocationMatrix,
    ball : ballLocalMatrix,
    //Flippers
    leftFlipper : leftFlipperLocalMatrix,
    rightFlipper : rightFlipperLocalMatrix,
    //Bumpers
    bumper1 : bumper1LocalMatrix,
    bumper2 : bumper2LocalMatrix,
    bumper3 : bumper3LocalMatrix,
    //Puller
    puller : pullerLocalMatrix,
    //Digits right
    dr1 : dr1LocalMatrix,
    dr2 : dr2LocalMatrix,
    dr3 : dr3LocalMatrix,
    dr4 : dr4LocalMatrix,
    dr5 : dr5LocalMatrix,
    dr6 : dr6LocalMatrix,
    //Digits left
    dl1 : dl1LocalMatrix,
    dl2 : dl2LocalMatrix,
    dl3 : dl3LocalMatrix,
    dl4 : dl4LocalMatrix,
    dl5 : dl5LocalMatrix,
    dl6 : dl6LocalMatrix,
};

function getInitialWorldmatrices(){
    return worlds;
}
