//Global variables
var gl = null;
var program = null;
var canvas = null;
var mesh = null;

//Scene creation
var camX = 0;
var camY = 0;
var camZ = 0;
var camAlpha = 0;
var camBeta = 0;

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
	fs_uv = vec2(in_uv.x, 1.0-in_uv.y);
	
	gl_Position = pMatrix * vec4(in_pos, 1);
}`;

// Fragment shader
var fs = `#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;
uniform vec4 lightDir;
//uniform float ambFact;

out vec4 color;

void main() {
	vec4 texcol = texture(u_texture, fs_uv);
	float ambFact = lightDir.w;
	float dimFact = (1.0-ambFact) * clamp(dot(normalize(fs_norm), lightDir.xyz),0.0,1.0) + ambFact;
	color = vec4(texcol.rgb * dimFact, texcol.a);
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

    // links mesh attributes to shader attributes
    program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
        
    program.vertexNormalAttribute = gl.getAttribLocation(program, "in_norm");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);
        
    program.textureCoordAttribute = gl.getAttribLocation(program, "in_uv");
    gl.enableVertexAttribArray(program.textureCoordAttribute);

    program.WVPmatrixUniform = gl.getUniformLocation(program, "pMatrix");
    program.textureUniform = gl.getUniformLocation(program, "u_texture");
    program.lightDir = gl.getUniformLocation(program, "lightDir");
    //		program.ambFact = gl.getUniformLocation(program, "ambFact");
		
	OBJ.initMeshBuffers(gl, mesh);

    // prepares the world, view and projection matrices.
    var w=canvas.clientWidth;
    var h=canvas.clientHeight;
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0.0, 0.0, w, h);
    
    perspectiveMatrix = utils.MakePerspective(60, w/h, 0.1, 1000.0);
        
    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // Load mesh using the webgl-obj-loader library
    var objStr = await utils.get_objstr("PinballDark/Body.obj"); 
    mesh = new OBJ.Mesh(objStr);

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var image = new Image();
    image.src = "StarWarsPinball.png";
    image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    };

    addMeshToScene()

    drawScene();


}

function drawScene(){
    // clear scene
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
    // compose view and light
    var viewMatrix = utils.MakeView(camX, camY, camZ, camAlpha, camBeta);
    
    gl.drawElements(gl.TRIANGLES, mesh, gl.UNSIGNED_SHORT, 0);
    
    window.requestAnimationFrame(drawScene);
}



function addMeshToScene(){
    //let mesh = allMeshes;
    let vao = gl.createVertexArray();
    //vaos[i] = vao;
    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.textures), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
  }