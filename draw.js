//Global variables
var gl = null;
var program = null;
var canvas = null;
var meshes = {};
var worldMatrices = [];
var bodyLocalMatrix = null;
var gLightDir = [];
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

//Camera constants
var camX = 0;
var camY = 20;
var camZ = -10;
var camAlpha = -54;
var camBeta = 180;

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

var positionAttributeLocation = null;
var normalAttributeLocation = null;
var uvAttributeLocation = null;
var textLocation = null;

gLightDir = [-1.0, 0.0, 0.0, 0.0];

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

function drawScene(){
    // clear scene
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // compose view and light
    var viewMatrix = utils.MakeView(camX, camY, camZ, camAlpha, camBeta);

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
}
