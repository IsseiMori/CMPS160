var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec2 a_TexCoord;\n' +
	'varying vec2 v_TexCoord;\n' +
	'void main(){\n' + 
	'	gl_Position = a_Position;\n' +
	'	v_TexCoord = a_TexCoord;\n' + 
	'}\n';

var FSHADER_SOURCE = 
	'precision mediump float;\n' +
	'uniform sampler2D u_Sampler;\n' +
	'varying vec2 v_TexCoord;\n' +
	'void main(){\n' + 
	'	gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
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

	if(!initTextures(gl, n)){
		console.log("failed to initialize the texture");
		return;
	}
}

function initVartexBuffers(gl){
	var verticesTexCoords = new Float32Array([
		-0.5,   0.5,  -0.3,   1.7,
		-0.5,  -0.5,   -0.3,  -0.2,
		 0.5,   0.5,   1.7,   1.7,
		 0.5,  -0.5,   1.7,  -0.2
		]);
	var n = 4;

	var vertexTexCoordBuffer = gl.createBuffer();
	if(!vertexTexCoordBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

	var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
		console.log("failed to get the storage location of a_Position");
		return;
	}

	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);

	gl.enableVertexAttribArray(a_Position);

	var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
	if(a_TexCoord < 0){
		console.log("failed to get the storage location of a_TexCoord");
		return;
	}

	gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
	gl.enableVertexAttribArray(a_TexCoord);

	return n;
}

function initTextures(gl, n){
	var texture = gl.createTexture();
	if(!texture){
		console.log("failed to create texture");
		return;
	}

	var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
	if(u_Sampler < 0){
		console.log("failed to get the storage location of u_Sampler");
		return;
	}

	var image = new Image();

	image.onload = function(){
		loadTexture(gl, n, texture, u_Sampler, image);
	};

	image.src = '../resources/sky.jpg';

	return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

	gl.uniform1i(u_Sampler, 0);

	gl.clearColor(0.5,0.5,0.5, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}