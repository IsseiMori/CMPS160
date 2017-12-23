var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Color;\n' +
	'uniform mat4 u_ProjMatrix;\n' +
	'varying vec4 v_Color;\n' +
	'void main(){\n' + 
	'	gl_Position = u_ProjMatrix * a_Position;\n' +
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

	var nf = document.getElementById('nearFar');
	if(!nf){
		console.log("failed to retrive <p> element");
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

	var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
	if(u_ProjMatrix < 0){
		console.log("failed to get the storage location of u_ProjMatrix");
		return;
	}

	var projMatrix = new Matrix4();

	document.onkeydown = function(ev){
		keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf);
	};

	draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

var g_near = 0.0, g_far = 0.5;
function keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf){
	switch(ev.keyCode){
		case 39: g_near += 0.01; break;
		case 37: g_near -= 0.01; break;
		case 38: g_far += 0.01; break;
		case 40: g_far -= 0.01; break;
		default: return;
	}

	draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

function draw(gl, n, u_ProjMatrix, projMatrix, nf){
	//var lookAt = new Matrix4();
	//lookAt.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
	projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far);
	//var lookOrtho = projMatrix.multiply(lookAt);
	//gl.uniformMatrix4fv(u_ProjMatrix, false, lookOrtho.elements);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

	nf.innerHTML = 'near : ' + Math.round(g_near * 100)/100 + 'far : ' + Math.round(g_far * 100)/100

	gl.clearColor(0.5,0.5,0.5, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVartexBuffers(gl){
	var verticesColors = new Float32Array([
    // Vertex coordinates and color(RGBA)
		 0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
		-0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
		 0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 

		 0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
		-0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
		 0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

		 0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
		-0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
		 0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
  	]);
  	var n = 9;

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