var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Color;\n' +
	'varying vec4 v_Color;\n' +
	'void main(){\n' + 
	'	gl_Position = a_Position;\n' +
	'	gl_PointSize = 10.0;\n' + 
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

	
	gl.clearColor(0.5,0.5,0.5,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVartexBuffers(gl){
	var verticesColors = new Float32Array([
		0.0, 0.5, 1.0, 0.0, 0.0,
		-0.5, -0.5, 0.0, 1.0, 0.0,
		0.5, -0.5, 0.0, 0.0, 1.0,
		]);
	var n = 3;

	var vertexBuffer = gl.createBuffer();
	if(!vertexBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	var FSIZE = verticesColors.BYTES_PER_ELEMENT;

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
		console.log("failed to get the storage location of a_Position");
		return;
	}

	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);

	gl.enableVertexAttribArray(a_Position);

	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0){
		console.log("failed to get the storage location of a_Color");
		return;
	}

	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
	gl.enableVertexAttribArray(a_Color);

	return n;
}