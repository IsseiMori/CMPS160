var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'uniform flaot u_CosB, u_SinB;\n' + 
	'void main(){\n' + 
	'	gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;\n' +
	'	gl_Position.y = a_Position.x * u_SinB - a_Position.y * u_CosB;\n' +
	'	gl_Position.z = a_Position.z; \n' +
	'	gl_Position.w = 1.0; \n' + 
	'}\n';

var FSHADER_SOURCE = 
	'void main(){\n' + 
	'	gl_FragColor = vec4(1.0,1.0,0.0,1.0);\n' +
	'}\n';

var ANGLE = 90.0;

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

	var radian = Math.PI * ANGLE / 180.0;
	var cosB = Math.cos(radian);
	var sinB = Math.sin(radian);

	var u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');

	var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
	if(u_Translation < 0){
		console.log("failed to get u_Translation");
		return;
	}

	gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);

	
	gl.clearColor(0.5,0.5,0.5,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVartexBuffers(gl){
	var vertices = new Float32Array([
		0.0, 0.5, -0.5, -0.5, 0.5, -0.5
		]);
	var n = 3;

	var vertexBuffer = gl.createBuffer();
	if(!vertexBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
		console.log("failed to get the storage location of a_Position");
		return;
	}

	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(a_Position);

	return n;
}