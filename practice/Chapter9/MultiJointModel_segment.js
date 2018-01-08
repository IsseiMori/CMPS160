var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Normal;\n' +
	'uniform mat4 u_MvpMatrix;\n' +
	'uniform mat4 u_ModeMatrix;\n' +
	'uniform mat4 u_NormalMatrix;\n' +
	'uniform vec3 u_LightColor;\n' +
	'uniform vec3 u_LightPosition;\n' +
	'uniform vec3 u_AmbientLight;\n' +
	'varying vec4 v_Color;\n' +
	'void main(){\n' + 
	'	gl_Position = u_MvpMatrix * a_Position;\n' +
	'	vec4 color = vec4(0.0, 1.0, 0.3, 1.0);\n' +
	'	vec4 normal = u_NormalMatrix * a_Normal;\n' +
	'	vec4 vertexPosition = u_ModeMatrix * a_Position;\n' +
	'	vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
	'	float nDotL = max(dot(lightDirection, normalize(normal.xyz)), 0.0);\n' +
	'	vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' + 
	'	vec3 ambient = u_AmbientLight * color.rgb;\n' + 
	'	v_Color = vec4(diffuse + ambient, color.a);\n' + 
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

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	var u_ModeMatrix = gl.getUniformLocation(gl.program, 'u_ModeMatrix');
	var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
	var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
	var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
	if(a_Position < 0 || !u_ModeMatrix || !u_MvpMatrix || !u_NormalMatrix || !u_LightPosition || !u_AmbientLight || !u_LightColor){
		console.log("failed to get the storage location");
		return;
	}

	var vpMatrix = new Matrix4();

	//modelMatrix.setTranslate(0.75, 0.0, 0.0);
	vpMatrix.setPerspective(50, canvas.width/canvas.height, 1.0, 100.0);
	vpMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

	gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

	gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
	gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

	document.onkeydown = function(ev){
		keydown(ev, gl, n, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
	};

	draw(gl, n, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var ANGLE_STEP = 3.0;
var g_arm1Angle = 90.0;
var g_joint1Angle = 45.0;
var g_joint2Angle = 0.0;
var g_joint3Angle = 0.0;

function keydown(ev, gl, n, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix){
	switch(ev.keyCode){
		case 40: //up arrow key -> positive rotation of joint1 z-axis
			if(g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
			break;
		case 38: //Down arrow key -> negative rotation of joint1 z-axis
			if(g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
			break;
		case 39: //left arrow key -> negative rtation of arm1 y-axis
			g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360; 
			break;
		case 37: //left arrow key -> negative rtation of arm1 y-axis
			g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360; 
			break;
		case 90:
			g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
			break;
		case 88:
			g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
			break;
		case 86:
			if(g_joint3Angle < 60.0)
				g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
			break;
		case 67:
			if(g_joint3Angle > -60.0)
				g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
			break;
		default: return;
	}
	draw(gl, n, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var g_baseBuffer = null;
var g_arm1Buffer = null;
var g_arm2Buffer = null;
var g_palmBuffer = null;
var g_fingerBuffer = null;

function initVertexBuffers(gl){
	// Vertex coordinate (prepare coordinates of cuboids for all segments)
	var vertices_base = new Float32Array([ // Base(10x2x10)
	   5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0,  5.0, 0.0, 5.0, // v0-v1-v2-v3 front
	   5.0, 2.0, 5.0,  5.0, 0.0, 5.0,  5.0, 0.0,-5.0,  5.0, 2.0,-5.0, // v0-v3-v4-v5 right
	   5.0, 2.0, 5.0,  5.0, 2.0,-5.0, -5.0, 2.0,-5.0, -5.0, 2.0, 5.0, // v0-v5-v6-v1 up
	  -5.0, 2.0, 5.0, -5.0, 2.0,-5.0, -5.0, 0.0,-5.0, -5.0, 0.0, 5.0, // v1-v6-v7-v2 left
	  -5.0, 0.0,-5.0,  5.0, 0.0,-5.0,  5.0, 0.0, 5.0, -5.0, 0.0, 5.0, // v7-v4-v3-v2 down
	   5.0, 0.0,-5.0, -5.0, 0.0,-5.0, -5.0, 2.0,-5.0,  5.0, 2.0,-5.0  // v4-v7-v6-v5 back
	]);

	var vertices_arm1 = new Float32Array([  // Arm1(3x10x3)
	   1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
	   1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
	   1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
	  -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
	  -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
	   1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
	]);

	var vertices_arm2 = new Float32Array([  // Arm2(4x10x4)
	   2.0, 10.0, 2.0, -2.0, 10.0, 2.0, -2.0,  0.0, 2.0,  2.0,  0.0, 2.0, // v0-v1-v2-v3 front
	   2.0, 10.0, 2.0,  2.0,  0.0, 2.0,  2.0,  0.0,-2.0,  2.0, 10.0,-2.0, // v0-v3-v4-v5 right
	   2.0, 10.0, 2.0,  2.0, 10.0,-2.0, -2.0, 10.0,-2.0, -2.0, 10.0, 2.0, // v0-v5-v6-v1 up
	  -2.0, 10.0, 2.0, -2.0, 10.0,-2.0, -2.0,  0.0,-2.0, -2.0,  0.0, 2.0, // v1-v6-v7-v2 left
	  -2.0,  0.0,-2.0,  2.0,  0.0,-2.0,  2.0,  0.0, 2.0, -2.0,  0.0, 2.0, // v7-v4-v3-v2 down
	   2.0,  0.0,-2.0, -2.0,  0.0,-2.0, -2.0, 10.0,-2.0,  2.0, 10.0,-2.0  // v4-v7-v6-v5 back
	]);

	var vertices_palm = new Float32Array([  // Palm(2x2x6)
	   1.0, 2.0, 3.0, -1.0, 2.0, 3.0, -1.0, 0.0, 3.0,  1.0, 0.0, 3.0, // v0-v1-v2-v3 front
	   1.0, 2.0, 3.0,  1.0, 0.0, 3.0,  1.0, 0.0,-3.0,  1.0, 2.0,-3.0, // v0-v3-v4-v5 right
	   1.0, 2.0, 3.0,  1.0, 2.0,-3.0, -1.0, 2.0,-3.0, -1.0, 2.0, 3.0, // v0-v5-v6-v1 up
	  -1.0, 2.0, 3.0, -1.0, 2.0,-3.0, -1.0, 0.0,-3.0, -1.0, 0.0, 3.0, // v1-v6-v7-v2 left
	  -1.0, 0.0,-3.0,  1.0, 0.0,-3.0,  1.0, 0.0, 3.0, -1.0, 0.0, 3.0, // v7-v4-v3-v2 down
	   1.0, 0.0,-3.0, -1.0, 0.0,-3.0, -1.0, 2.0,-3.0,  1.0, 2.0,-3.0  // v4-v7-v6-v5 back
	]);

	var vertices_finger = new Float32Array([  // Fingers(1x2x1)
	   0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
	   0.5, 2.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 2.0,-0.5, // v0-v3-v4-v5 right
	   0.5, 2.0, 0.5,  0.5, 2.0,-0.5, -0.5, 2.0,-0.5, -0.5, 2.0, 0.5, // v0-v5-v6-v1 up
	  -0.5, 2.0, 0.5, -0.5, 2.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
	  -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
	   0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 2.0,-0.5,  0.5, 2.0,-0.5  // v4-v7-v6-v5 back
	]);

	// Normal
	var normals = new Float32Array([
	   0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
	   1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
	   0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
	  -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
	   0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
	   0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
	]);

	// Indices of the vertices
	var indices = new Uint8Array([
	   0, 1, 2,   0, 2, 3,    // front
	   4, 5, 6,   4, 6, 7,    // right
	   8, 9,10,   8,10,11,    // up
	  12,13,14,  12,14,15,    // left
	  16,17,18,  16,18,19,    // down
	  20,21,22,  20,22,23     // back
	]);

	g_baseBuffer = initArrayBufferForLaterUse(gl, vertices_base, 3, gl.FLOAT);
	g_arm1Buffer = initArrayBufferForLaterUse(gl, vertices_arm1, 3, gl.FLOAT);
	g_arm2Buffer = initArrayBufferForLaterUse(gl, vertices_arm2, 3, gl.FLOAT);
	g_palmBuffer = initArrayBufferForLaterUse(gl, vertices_palm, 3, gl.FLOAT);
	g_fingerBuffer = initArrayBufferForLaterUse(gl, vertices_finger, 3, gl.FLOAT);

	if(!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;

	var indexBuffer = gl.createBuffer();
	if(!indexBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return indices.length;
}

function initArrayBufferForLaterUse(gl, data, num, type){
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	buffer.num = num;
	buffer.type = type;

	return buffer;
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

var g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4();

function draw(gl, n, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH__BUFFER_BIT);

	//Draw a base
	var baseHeight = 2.0;
	g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
	drawSegment(gl, n, g_baseBuffer, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

	//Arm1
	var arm1Length = 10.0;
	g_modelMatrix.translate(0.0, baseHeight, 0.0);
	g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
	drawSegment(gl, n, g_arm1Buffer, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

	//Arm2
	var arm2Length = 10.0;
	g_modelMatrix.translate(0.0, arm1Length, 0.0);
	g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
	drawSegment(gl, n, g_arm2Buffer, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

	//A Palm
	var palmLength = 2.0;
	g_modelMatrix.translate(0.0, arm2Length, 0.0);
	g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);
	drawSegment(gl, n, g_palmBuffer, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);

	//Move to the center of the tip of the palm
	g_modelMatrix.translate(0.0, palmLength, 0.0);

	//Finger 1
	pushMatrix(g_modelMatrix);
		g_modelMatrix.translate(0.0, 0.0, 2.0);
		g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);
		drawSegment(gl, n, g_fingerBuffer, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
	g_modelMatrix = popMatrix();

	//Finger 2
	g_modelMatrix.translate(0.0, 0.0, -2.0);
	g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
	drawSegment(gl, n, g_fingerBuffer, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
}

var g_normalMatrix = new Matrix4();

function drawSegment(gl, n, buffer, vpMatrix, a_Position, u_MvpMatrix, u_NormalMatrix){
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(a_Position, buffer.num, buffer.type, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	g_mvpMatrix.set(vpMatrix);
	g_mvpMatrix.multiply(g_modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

	g_normalMatrix.setInverseOf(g_modelMatrix);
	g_normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

var g_matrixStack = [];

function pushMatrix(m){
	var m2 = new Matrix4(m);
	g_matrixStack.push(m2);
}

function popMatrix(){
	return g_matrixStack.pop();
}



