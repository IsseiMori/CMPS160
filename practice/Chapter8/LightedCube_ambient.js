var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Color;\n' +
	'attribute vec4 a_Normal;\n' +
	'uniform mat4 u_MvpMatrix;\n' +
	'uniform mat4 u_NormalMatrix;\n' +
	'uniform vec3 u_LightColor;\n' +
	'uniform vec3 u_LightDirection;\n' +
	'uniform vec3 u_AmbientLight;\n' +
	'varying vec4 v_Color;\n' +
	'void main(){\n' + 
	'	gl_Position = u_MvpMatrix * a_Position;\n' +
	'	vec4 normal = u_NormalMatrix * a_Normal;\n' +
	'	float nDotL = max(dot(u_LightDirection, normalize(normal.xyz)), 0.0);\n' +
	'	vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' + 
	'	vec3 ambient = u_AmbientLight * a_Color.rgb;\n' + 
	'	v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
	'}\n';

var FSHADER_SOURCE = 
	'precision mediump float;\n' +
	'varying vec4 v_Color;\n' +
	'void main(){\n' + 
	'	gl_FragColor = v_Color;\n' +

	'}\n';

function main(){
	var canvas = document.getElementById('webgl');
	if(!canvas){
		console.log("failed to retrive <canvas> element");
		return;
	}

	var gl = getWebGLContext(canvas);

	if(!gl){
		console.log("failed to get rendering context for WebGL");
		return;
	}

	if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log("Failed to initialize shaders");
		return;
	}

	var n = initVertexBuffers(gl);
	if(n < 0){
		console.log("failed to set the positions of the vertices");
		return;
	}

	gl.clearColor(0.5,0.5,0.5, 1.0);
	gl.enable(gl.DEPTH_TEST);

	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
	var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
	var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
	if(!u_MvpMatrix || !u_NormalMatrix || !u_LightDirection || !u_AmbientLight || !u_LightColor){
		console.log("failed to get the storage location");
		return;
	}

	var vpMatrix = new Matrix4();

	//modelMatrix.setTranslate(0.75, 0.0, 0.0);
	vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
	vpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

	var lightDirection = new Vector3([0.5, 3.0, 4.0]);
	lightDirection.normalize();
	gl.uniform3fv(u_LightDirection, lightDirection.elements);

	gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

	var currentAngle = 0.0;
	var modelMatrix = new Matrix4();
	var mvpMatrix = new Matrix4();
	var normalMatrix = new Matrix4();

	var tick = function(){
		currentAngle = animate(currentAngle);

		modelMatrix.setRotate(currentAngle, 0, 1, 0);
		mvpMatrix.set(vpMatrix).multiply(modelMatrix);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

		requestAnimationFrame(tick, canvas);
	};
	tick();
}

function initVertexBuffers(gl){
	// Create a cube
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3

	var vertices = new Float32Array([   // Vertex coordinates
    	 1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
	     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
	     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
	    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
	    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
	     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
	]);

	var colors = new Float32Array([    // Colors
	   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
	   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
	   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
	   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
	   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
	   1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0    // v4-v7-v6-v5 back
	]);

	var normals = new Float32Array([    // Normal
	  0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
	  1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
	  0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
	 -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
	  0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
	  0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
	]);

	var indices = new Uint8Array([       // Indices of the vertices
	     0, 1, 2,   0, 2, 3,    // front
	     4, 5, 6,   4, 6, 7,    // right
	     8, 9,10,   8,10,11,    // up
	    12,13,14,  12,14,15,    // left
	    16,17,18,  16,18,19,    // down
	    20,21,22,  20,22,23     // back
	]);

	if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
	if(!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) return -1;
	if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	var indexBuffer = gl.createBuffer();
	if(!indexBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute){
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	gl.enableVertexAttribArray(a_attribute);

	return true;
}

var ANGLE_STEP = 30.0;
var g_last = Date.now();
function animate(angle){
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;

	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}