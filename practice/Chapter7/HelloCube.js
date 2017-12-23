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

	var n = initVertexBuffers(gl);
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

	//modelMatrix.setTranslate(0.75, 0.0, 0.0);
	viewMatrix.setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
	projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);

	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	gl.clearColor(0.5,0.5,0.5, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl){
	var verticesColors = new Float32Array([
		// Vertex coordinates and color
	    1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
	   -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
	   -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
	    1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
	    1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
	    1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
	   -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
	   -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
	]);

	// Indices of the vertices
	var indices = new Uint8Array([
	   0, 1, 2,   0, 2, 3,    // front
	   0, 3, 4,   0, 4, 5,    // right
	   0, 5, 6,   0, 6, 1,    // up
	   1, 6, 7,   1, 7, 2,    // left
	   7, 4, 3,   7, 3, 2,    // down
	   4, 7, 6,   4, 6, 5     // back
	]);

	var vertexColorBuffer = gl.createBuffer();
	if(!vertexColorBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	var indexBuffer = gl.createBuffer();
	if(!indexBuffer){
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

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

	return indices.length;
}