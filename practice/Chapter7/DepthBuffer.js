var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Color;\n' +
	'uniform mat4 u_MvpMatrix;\n' +
	'varying vec4 v_Color;\n' +
	'void main(){\n' + 
	'	gl_Position = u_MvpMatrix * a_Position;\n' +
	'	v_Color = a_Color;\n' + 
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

	var n = initVartexBuffers(gl);
	if(n < 0){
		console.log("failed to set the positions of the vertices");
		return;
	}

	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	if(u_MvpMatrix < 0){
		console.log("failed to get the storage location of u_MvpMatrix");
		return;
	}

	var projMatrix = new Matrix4();
	var viewMatrix = new Matrix4();
	var modelMatrix = new Matrix4();
	var mvpMatrix = new Matrix4();

	modelMatrix.setTranslate(0.75, 0.0, 0.0);
	viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
	projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);

	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	gl.clearColor(0.5,0.5,0.5, 1.0);
	gl.enable(gl.DEPTH_TEST)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);

	modelMatrix.setTranslate(-0.75, 0.0, 0.0);
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initVartexBuffers(gl){
	var verticesColors = new Float32Array([
		// Vertex coordinates and color
		 0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
	    -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
	     0.5, -1.0,   0.0,  1.0,  0.4,  0.4, 

	     0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
	    -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
	     0.5, -1.0,  -2.0,  1.0,  0.4,  0.4, 

	     0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
	    -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
	     0.5, -1.0,  -4.0,  1.0,  0.4,  0.4, 
  	]);
  	var n = 9; // Three vertices per triangle * 6

	var vertexColorBuffer = gl.createBuffer();
	if(!vertexColorBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var FSIZE = verticesColors.BYTES_PER_ELEMENT;

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
		console.log("failed to get the storage location of a_Position");
		return;
	}

	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);

	gl.enableVertexAttribArray(a_Position);

	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0){
		console.log("failed to get the storage location of a_Color");
		return;
	}

	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
	gl.enableVertexAttribArray(a_Color);

	return n;
}