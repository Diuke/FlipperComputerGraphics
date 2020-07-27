//Global variables
var gl = null;
var program = null;
var canvas = null;
var meshes = {};
var worldMatrices = [];
var bodyLocalMatrix = null;
var locationMatrices = [];
var vaos = [];
var walls = [];
var isPlaying = false;
var ballPushed = false;

//Objects
var ball;
var flipperLeft;
var flipperRight;
var highScores = {}
var actualScores = {}

var objectKeys = [
    "body", "ball", 
    "leftFlipper", "rightFlipper" , 
    "bumper1" , "bumper2" , "bumper3" , "bumper4", "puller" , 
    "dr1" , "dr2" , "dr3" , "dr4" , "dr5" , "dr6",
    "dl1" , "dl2" , "dl3" , "dl4" , "dl5" , "dl6",
]

var ballx = -2.5;
var bally = 8.5335;
var ballz = -5.9728;
var ballx_spd = 0.0;
var bally_spd = 0.0;
var ballz_spd = 0.0;
var puller_hold = 0;

//Camera constants

var camX = 0;
var camY = 21.1;
var camZ = -10.4;
var camAlpha = -61.1;
var camBeta = 180;
/*
var camX = -0.4499999999999998;
var camY = 9.599999999999838;
var camZ = -0.2500000000000156;
var camAlpha = -23.1;
var camBeta =  18;
*/
var camX_spd = 0;
var camY_spd = 0;
var camZ_spd = 0;
var camAlpha_spd = 0;
var camBeta_spd = 0;

//Keyboard events for camera movement
window.addEventListener("keydown", keyDownHandler);
window.addEventListener("keyup", keyUpHandler);

//Camera movement keys
const CAM_UP = "w";
const CAM_DOWN = "s";
const CAM_IN = "a";
const CAM_OUT = "d";
const CAM_LEFT = "x";
const CAM_RIGHT = "z";
const CAM_ROT_Z_UP = "e";
const CAM_ROT_Z_DOWN = "q";
const CAM_ROT_X_CLOCKWISE = "r";
const CAM_ROT_X_COUNTERCLOCKWISE = "f";

const FLIPPER_LEFT = "1";
const light2 = "2";
const light3 = "3";
const light4 = "4";
const light5 = "5";
const light6 = "6";
const light7 = "7";
const light8 = "8";
const light9 = "9";
const FLIPPER_RIGHT = "0";

const XYZ_BASE_SPEED = 0.5;
const ANGLE_BASE_SPEED = 1;

//Game control keys
const BALL_RIGHT = "ArrowRight";
const BALL_LEFT = "ArrowLeft";
const BALL_DOWN = "ArrowDown";
const BALL_UP = "ArrowUp";
const PULLER_PUSH = " ";

const digitsUV = [[0.735309, 0.956854, 0.760579, 0.918019, 0.760579, 0.956854, 0.735309, 0.918019],[0.636297, 0.996017, 0.661567, 0.957183, 0.661567, 0.996017, 0.636297, 0.957183],[0.660956, 0.996505, 0.686226, 0.957671, 0.686226, 0.996505, 0.660956, 0.957671], [0.685614, 0.996261, 0.710884, 0.957427, 0.710884, 0.996261, 0.685614, 0.957427],[0.710760, 0.996749, 0.736030, 0.957915, 0.736030, 0.996749, 0.710760, 0.957915],[0.735907, 0.996749, 0.761177, 0.957915, 0.761177, 0.996749, 0.735907, 0.957915],[0.635321, 0.956466, 0.660591, 0.917632, 0.660591, 0.956466, 0.635321, 0.917632], [0.660705, 0.956272, 0.685975, 0.917438, 0.685975, 0.956272, 0.660705, 0.917438], [0.684927, 0.956466, 0.710197, 0.917632, 0.710197, 0.956466, 0.684927, 0.917632],[0.710118, 0.956466, 0.735388, 0.917632, 0.735388, 0.956466, 0.710118, 0.917632]];

//Key handlers
function keyDownHandler(event){
    //console.log(camX + ", " + camY + ", " + camZ);
    //console.log(camAlpha + ", " + camBeta);
    switch(event.key){
        case(CAM_UP): camY_spd = XYZ_BASE_SPEED;break;
        case(CAM_DOWN): camY_spd = -XYZ_BASE_SPEED;break;
        case(CAM_LEFT): camZ_spd = XYZ_BASE_SPEED;break;
        case(CAM_RIGHT): camZ_spd = -XYZ_BASE_SPEED;break;
        case(CAM_IN): camX_spd = XYZ_BASE_SPEED;break;
        case(CAM_OUT): camX_spd = -XYZ_BASE_SPEED;break;
        case(CAM_ROT_X_CLOCKWISE): camAlpha_spd = ANGLE_BASE_SPEED;break;
        case(CAM_ROT_X_COUNTERCLOCKWISE): camAlpha_spd = -ANGLE_BASE_SPEED;break;
        case(CAM_ROT_Z_UP): camBeta_spd = ANGLE_BASE_SPEED;break;
        case(CAM_ROT_Z_DOWN): camBeta_spd = -ANGLE_BASE_SPEED;break;

        case(BALL_RIGHT): ballx_spd = -0.27; break;
        case(BALL_LEFT): ballx_spd = 0.27; break;
        case(BALL_UP): ballz_spd = 0.27; break;
        case(BALL_DOWN): ballz_spd = -0.27; break;

        case(PULLER_PUSH): puller_hold = true; break;

        case(FLIPPER_LEFT):{
            flipperLeft.isMovingUp = true;
            flipperLeft.isMovingDown = false;
            break;
        }
        case(FLIPPER_RIGHT): {
            flipperRight.isMovingUp = true;
            flipperRight.isMovingDown = false;
            break;
        } 
    }
}

function keyUpHandler(event){
    switch(event.key){
        case(CAM_UP): camY_spd = 0;break;
        case(CAM_DOWN): camY_spd = 0;break;
        case(CAM_LEFT): camZ_spd = 0;break;
        case(CAM_RIGHT): camZ_spd = 0;break;
        case(CAM_IN): camX_spd = 0;break;
        case(CAM_OUT): camX_spd = 0;break;
        case(CAM_ROT_X_CLOCKWISE): camAlpha_spd = 0;break;
        case(CAM_ROT_X_COUNTERCLOCKWISE): camAlpha_spd = 0;break;
        case(CAM_ROT_Z_UP): camBeta_spd = 0;break;
        case(CAM_ROT_Z_DOWN): camBeta_spd = -0;break;

        case(PULLER_PUSH): puller_hold = false; break;

        case(BALL_RIGHT): ballx_spd = 0; break;
        case(BALL_LEFT): ballx_spd = 0; break;
        case(BALL_UP): ballz_spd = 0; break;
        case(BALL_DOWN): ballz_spd = 0; break;

        case(FLIPPER_RIGHT): {
            flipperRight.isMovingDown = true;
            flipperRight.isMovingUp = false;
            break;
        }
        case(FLIPPER_LEFT):{
            flipperLeft.isMovingDown = true;
            flipperLeft.isMovingUp = false;
            break;
        }
        

    }
    
}

defShaderParams = {
	ambientType: "ambient",
	diffuseType: "lambert",
	ambientLightColor: [1.0,1.0,1.0,1.0],
	diffuseColor: [0.1 ,0.1,0.1,1],
	ambientMatColor: [0,0.1,0.1,1.0],
	emitColor: [136,136,136,1],

    //lightColor: [122/255,185/255,87/255,1],
    lightColor: [1,1,1,1],
	LPosX: 20,
	LPosY: 30,
	LPosZ: 10,
	LDirTheta: 0,
	LDirPhi: 0,
    LTarget: 61,
    DTexMix: 0.8,

}

// Vertex shader
var vs = `#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

layout(location = POSITION_LOCATION) in vec3 in_pos;
layout(location = NORMAL_LOCATION) in vec3 in_norm;
layout(location = UV_LOCATION) in vec2 in_uv;

uniform mat4 pMatrix;
uniform mat4 wMatrix;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
    //fs_pos = in_pos(wMatrix * vec4(in_pos, 1.0)).xyz;
    fs_pos = in_pos;
	fs_norm = in_norm;
	fs_uv = in_uv;
	
	gl_Position = pMatrix * vec4(in_pos, 1.0);
}`;

// Fragment shader
var fs = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;
uniform vec3 eyePos;

uniform vec3 LPos;
//uniform vec3 LDir;
uniform vec3 lightDir;
uniform vec4 lightColor;

uniform float DTexMix;
uniform vec4 ambientLightColor;
uniform vec4 diffuseColor;
uniform vec4 ambientMatColor;
uniform vec4 emitColor;

out vec4 color;

vec4 compDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec4 diffColor) {
	// Diffuse
	// --> Lambert
	vec4 diffuseLambert = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0) * diffColor;
	// ----> Select final component
	return diffuseLambert;
}


void main() {
    vec3 LDir = lightDir;
    vec4 texcol = texture(u_texture, fs_uv);
    vec4 diffColor = diffuseColor * (1.0-DTexMix) + texcol * DTexMix;
	vec4 ambColor = ambientMatColor * (1.0-DTexMix) + texcol * DTexMix;
	vec4 emit = emitColor * (1.0-DTexMix) +
				   texcol * DTexMix * 
				   			max(max(emitColor.r, emitColor.g), emitColor.b);
	
	vec3 normalVec = normalize(fs_norm);
	vec3 eyedirVec = normalize(eyePos - fs_pos);
	
	vec3 lDir;
	
	vec4 lColor;
	
    vec4 ambientColor;
    
    lDir = normalize(LPos - fs_pos);
	lColor = lightColor;

    ambientColor = ambientLightColor;

    // Ambient
	vec4 ambient = ambientColor * ambColor;
	// Diffuse
	vec4 diffuse = compDiffuse(lDir, lColor, normalVec, diffColor);

    vec4 out_color = clamp(ambient + diffuse, 0.0, 1.0);	
  
    color = vec4(out_color.rgb, 1.0);
}`

async function main(){
    let welcome = document.getElementById("welcome");
    let welcome2_help = document.getElementById("welcome2_help");
    let yoda_GO = document.getElementById("yoda_GO");
    let flipper = document.getElementById("flipper");
    let puller_sound = document.getElementById("puller_sound");
    let bumper = document.getElementById("bumper");
    let wall_collision = document.getElementById("wall_collision");
    let chewie = document.getElementById("chewie");
    displayControls();
    var canvas = document.getElementById("my-canvas");
    var lives = document.getElementById("lives-display");
    lives.innerHTML = 3;

    try{
		gl= canvas.getContext("webgl2");
	} catch(e){
		console.log(e);
    }
    
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);
    program = utils.createProgram(gl, vertexShader, fragmentShader);

    gl.useProgram(program);

    // prepares the world, view and projection matrices.
    var w=canvas.clientWidth;
    var h=canvas.clientHeight;
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0.0, 0.0, w, h);
    
    perspectiveMatrix = utils.MakePerspective(60, w/h, 0.1, 1000.0);
        
    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    //Load all initial world matrices
    worldMatrices = getInitialWorldmatrices();

    // Load all meshes
    var meshUrls = getMeshes();
    for(const key of objectKeys) {
        meshes[key] = await utils.loadMesh(meshUrls[key]);
        OBJ.initMeshBuffers(gl, meshes[key]);
        console.log(meshes[key]);
    }

    showPage();    
    

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var image = new Image();
    image.src = "StarWarsPinball2.png";
    image.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    };

    // links mesh attributes to shader attributes
    program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
    //gl.enableVertexAttribArray(program.vertexPositionAttribute);
        
    program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
    //gl.enableVertexAttribArray(program.vertexNormalAttribute);
        
    program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
    //gl.enableVertexAttribArray(program.textureCoordAttribute);

    program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
    program.WmatrixUniform = gl.getUniformLocation(program, "wMatrix");
    program.textureUniform = gl.getUniformLocation(program, "u_texture");
    program.LDir = gl.getUniformLocation(program, "LDir");

    program.ambientLightColor = gl.getUniformLocation(program, "ambientLightColor");
    program.ambientMaterial = gl.getUniformLocation(program, "ambientMatColor");
    //program.materialDiffColor = gl.getUniformLocation(program, 'mDiffColor');
    program.emissionColor = gl.getUniformLocation(program, "emitColor");    
    program.lightColor = gl.getUniformLocation(program, 'lightColor');
    program.diffuseColor = gl.getUniformLocation(program, 'diffuseColor');
    program.DTexMix = gl.getUniformLocation(program, 'DTexMix');

    program.lightPos = gl.getUniformLocation(program, 'LPos')

    
    //Add all meshes 
    for(const key of objectKeys) {
        let mesh = meshes[key];
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        vaos[key] = vao;

        if(key.includes('dl') || key.includes('dr')) {
            mesh.textures = digitsUV[0];
        }
    
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.vertexPositionAttribute);
        gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    
        var uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.textures), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.textureCoordAttribute);
        gl.vertexAttribPointer(program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    
        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.vertexNormalAttribute);
        gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);  
    }
    
    

    drawScene();


}

function playWelcome(){
    let welcomeCallback = welcome.play();
    welcome.onended = function(e){
        var loader = document.getElementById("load-init");
        loader.style.display = 'none';
    }
    var button = document.getElementById("welcome-button");
    button.attributes.disabled = true;
    
}

function showPage() {
    
}


let iter = 0;
let iter2 = 0;
let angleSpd = 2;

ball = new Ball();
puller = new Puller()
flipperLeft = new Flipper(0.6906, 8.4032, -5.6357+z_fix, 29.8, -3.24+15, -5.64, 'left');
flipperRight = new Flipper(-1.307, 8.4032, -5.635+z_fix, 150.0, -3.24+15, -5.64, 'right');
let wallB1 = new Wall(-4.8728, 3.8272,  2.14947, 'wallB1');
let wallB2 = new Wall(2.14947, -2.55053, 2.9, 'wallB2');
let wallB3 = new Wall(-4.8728, 3.8272,  -2.55053, 'wallB3');
let wallS1 = new Wall(2.14947, 0.79947, -4.8728, 'wallS1');
let wallS2 = new Wall(-1.40053, -2.65053, -4.8728, 'wallS2');
let wallGO = new Wall(0.89947, -1.60053, -7.1728, 'wallGO');
var bumper_radius = 0.4;
let B1 = new Bumper(0.7, 0.605, bumper_radius, 'B1');
let B2 = new Bumper(-0.2, 1.4272, bumper_radius, 'B2');
let B3 = new Bumper(-1.1, 0.605, bumper_radius, 'B3');
let B4 = new Bumper(-0.2, -1, 1.5*bumper_radius, 'B4');
walls = [wallB1, wallB2, wallB3, wallS1, wallS2, wallGO];
bumpers = [B1, B2, B3, B4];
//ball.applyForce(0.3,0.6); 
let time = Date.now();
let dt = 1000/100; //50 FPS
function drawScene(){
    var t = utils.degToRad(defShaderParams.LDirTheta);
    var p = utils.degToRad(defShaderParams.LDirPhi);
    //console.log(defShaderParams.LDirTheta + ", " + defShaderParams.LDirPhi);
    //console.log(t + ", " + p);
    directionalLight = [
        
        Math.sin(t) * Math.sin(p),
        Math.cos(t),
        Math.sin(t) * Math.cos(p)
    ];

    let currentTime = Date.now();
    if(currentTime - time > dt){
        let scored = false
        let addS = isPlaying ? 10 : 0
        let Sdigits = ((score + addS) + "").padStart(6, "0").split('').reverse()
        let Hdigits = (highScore + "").padStart(6, "0").split('').reverse()

        time = currentTime;
        // clear scene
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //Camera movement
        camX += camX_spd;
        camY += camY_spd;
        camZ += camZ_spd;
        camAlpha += camAlpha_spd;
        camBeta += camBeta_spd;
        

        
        /*
        ball.xSpeed = ballx_spd;
        ball.zSpeed = ballz_spd;
        ball.updateMove();
        flipperLeft.collision(ball);
        flipperRight.collision(ball);
        ball.collides(walls, bumpers, puller);
        */
        
        //console.log(ball.xSpeed + ", " + ball.zSpeed);-----REMOVE WHEN FINISHED
        
        
        puller.update(puller_hold, ball);
        flipperRight.update();
        flipperLeft.update();
        if(ballPushed){
            ball.update();
            scored = ball.collides(walls, bumpers, puller);
            flipperLeft.collision(ball);
            flipperRight.collision(ball);
            if(!isPlaying){
                ball.update();
            }
        }
        

        //if(ball.z < 0) ball.applyForce(0, 0.001); 

        // compose view and light
        let viewMatrix = utils.MakeView(camX, camY, camZ, camAlpha, camBeta);

        worldMatrices["ball"] = ball.getWorldMatrix();
        worldMatrices["puller"] = puller.getWorldMatrix();
        worldMatrices["rightFlipper"] = flipperLeft.getWorldMatrix();
        worldMatrices["leftFlipper"] = flipperRight.getWorldMatrix();

        for(const key of objectKeys) {
            let mesh = meshes[key];

            if(scored || !isPlaying) {
                if(key.includes('dl') || key.includes('dr')) {
                    var digit = parseInt(key[2]) - 1
                    if(key.includes('dl')) mesh.textures = digitsUV[parseInt(Hdigits[digit])]
                    if(key.includes('dr')) mesh.textures = digitsUV[parseInt(Sdigits[digit])]
                }
            }

            var worldViewMatrix = utils.multiplyMatrices(viewMatrix, worldMatrices[key]);
            var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);

            var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(worldMatrices[key]));
            var lightDirectionTransformed = utils.normalize(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));

            //var lightDirectionTransformed =  utils.multiplyMatrixVector(worldMatrices[key], directionalLight);;

            //gl.uniform3fv(program.materialDiffColor, defShaderParams);
            gl.uniform4fv(program.lightColor, defShaderParams.lightColor);
            gl.uniform4fv(program.diffuseColor, defShaderParams.diffuseColor);
            gl.uniform4fv(program.ambientLightColor, defShaderParams.ambientLightColor);
            gl.uniform4fv(program.ambientMaterial, defShaderParams.ambientMatColor);
            gl.uniform4fv(program.emitColor, defShaderParams.emitColor);
            gl.uniform3fv(program.lightDir, lightDirectionTransformed);
            gl.uniform1f(program.DTexMix, defShaderParams.DTexMix);
            gl.uniform3fv(program.lightPos, [defShaderParams.LPosX, defShaderParams.LPosY, defShaderParams.LPosZ]);

            gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix));	
            gl.uniformMatrix4fv(program.WmatrixUniform, gl.FALSE, utils.transposeMatrix(worldMatrices[key]));	

            if(key.includes('dl') || key.includes('dr')) {
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(mesh.textures));
                gl.vertexAttribPointer(program.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
            }
            
            gl.bindVertexArray(vaos[key]);
            gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0); 
        }
        
        window.requestAnimationFrame(drawScene);
    } else {
        window.requestAnimationFrame(drawScene);
    }
}

    
