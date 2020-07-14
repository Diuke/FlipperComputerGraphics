//Global variables
var gl = null;
var program = null;
var canvas = null;
var meshes = {};
var worldMatrices = [];
var bodyLocalMatrix = null;
var gLightDir = [-1.0, 0.0, 0.0, 0.0];
var locationMatrices = [];
var vaos = [];

var objectKeys = [
    "body", "ball", 
    "leftFlipper", "rightFlipper" , 
    "bumper1" , "bumper2" , "bumper3" , "puller" , 
    "dr1" , "dr2" , "dr3" , "dr4" , "dr5" , "dr6",
    "dl1" , "dl2" , "dl3" , "dl4" , "dl5" , "dl6"
]

//Lights and colors constants
var materialColor = [0.0, 0.0, 0.0];
var ambientLight = [0.9, 0.9, 0.9];
var ambientMaterial = [0.9, 0.9, 0.9];
var emission = [1.0, 1.0, 1.0];    
var dirLightAlpha = utils.degToRad(60);
var dirLightBeta = utils.degToRad(50);
var directionalLight = [
    Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
    Math.sin(dirLightAlpha),
    Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
];
var directionalLightColor = [0.0, 0.0, 1.0];

var ballx = -0.30053;
var bally = 8.5335;
var ballz = -5.9728;
var ballx_spd = 0.02;
var bally_spd = 0.0;
var ballz_spd = 0.0;

//Camera constants

var camX = 0;
var camY = 21.1;
var camZ = -8.4;
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

const XYZ_BASE_SPEED = 0.05;
const ANGLE_BASE_SPEED = 1;

//Game control keys
const FLIPPER_RIGHT = "ArrowRight";
const FLIPPER_LEFT = "ArrowLeft";
const FLIPPER_SHOOT = "ArrowDown";

//Key handlers
function keyDownHandler(event){
    console.log(camX + ", " + camY + ", " + camZ);
    console.log(camAlpha + ", " + camBeta);
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
    }
}

function keyUpHandler(event){
    camX_spd = 0;
    camY_spd = 0;
    camZ_spd = 0;
    camAlpha_spd = 0;
    camBeta_spd = 0;
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

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
	fs_pos = in_pos;
	fs_norm = in_norm;
	fs_uv = in_uv;
	
	gl_Position = pMatrix * vec4(in_pos, 1);
}`;

// Fragment shader
var fs = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;
uniform vec3 lightDir;
uniform vec3 lightColor;
uniform vec3 mDiffColor;
uniform vec3 ambientLightColor;
uniform vec3 ambientMaterial;

uniform vec3 emit;

out vec4 color;

void main() {
    vec4 texcol = texture(u_texture, fs_uv);
    vec3 nNormal = normalize(fs_norm);

    vec3 lDir = normalize(lightDir);

    //Lambert color
    vec3 diff = clamp(dot(-lDir,nNormal), 0.0, 1.0) * lightColor;
    vec3 lambertColor = mDiffColor * diff;

    vec3 ambient = ambientLightColor * ambientMaterial;

    //computing BRDF color
    vec3 tempColor = clamp(lambertColor + ambient + emit, 0.0, 1.0);

    //compose final color with texture
    color = vec4(texcol.rgb * tempColor, texcol.a);
}`;

async function main(){
    var canvas = document.getElementById("my-canvas");

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

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var image = new Image();
    image.src = "StarWarsPinball.png";
    image.onload = function () {
        //gl.activeTexture(gl.TEXTURE0);
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
    program.textureUniform = gl.getUniformLocation(program, "u_texture");
    program.lightDir = gl.getUniformLocation(program, "lightDir");

    program.ambientLightColor = gl.getUniformLocation(program, "ambientLightColor");
    program.ambientMaterial = gl.getUniformLocation(program, "ambientMaterial");
    program.materialDiffColor = gl.getUniformLocation(program, 'mDiffColor');
    program.emissionColor = gl.getUniformLocation(program, "emit");    
    program.lightColor = gl.getUniformLocation(program, 'lightColor');

    
    //Add all meshes 
    for(const key of objectKeys) {
        let mesh = meshes[key];
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        vaos[key] = vao;
    
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

let iter = 0;
let iter2 = 0;
let angleSpd = 2;
let ball = new Ball(ballx, bally, ballz);
ball.applyForce(0, 0.001); 
let time = Date.now();
let dt = 1000/30;
function drawScene(){
    let currentTime = Date.now();
    if(currentTime - time > dt){
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

        ball.update();
        if(ball.z < 0) ball.applyForce(0, 0.001); 

        // compose view and light
        let viewMatrix = utils.MakeView(camX, camY, camZ, camAlpha, camBeta);

        worldMatrices["ball"] = ball.getWorldMatrix();
        worldMatrices["rightFlipper"] = utils.multiplyMatrices(worldMatrices["rightFlipper"], utils.MakeRotateYMatrix(angleSpd));
        worldMatrices["leftFlipper"] = utils.multiplyMatrices(worldMatrices["leftFlipper"], utils.MakeRotateYMatrix(-angleSpd));

        for(const key of objectKeys) {
            let mesh = meshes[key];
            var worldViewMatrix = utils.multiplyMatrices(viewMatrix, worldMatrices[key]);
            var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);

            var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(worldMatrices));
            var lightDirectionTransformed = utils.normalize(utils.multiplyMatrix3Vector3(lightDirMatrix, directionalLight));

            gl.uniform3fv(program.materialDiffColor, materialColor);
            gl.uniform3fv(program.lightColor, directionalLightColor);
            gl.uniform3fv(program.ambientLightColor, ambientLight);
            gl.uniform3fv(program.ambientMaterial, ambientMaterial);
            gl.uniform3fv(program.lightDir, lightDirectionTransformed);

            gl.uniformMatrix4fv(program.WVPmatrixUniform, gl.FALSE, utils.transposeMatrix(projectionMatrix));	

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(program.textureUniform, 0);

            
            gl.bindVertexArray(vaos[key]);
            gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0); 
        }
        
        window.requestAnimationFrame(drawScene);
    } else {
        window.requestAnimationFrame(drawScene);
    }
}
