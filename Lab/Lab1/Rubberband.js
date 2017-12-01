var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'void main(){\n' + 
	'	gl_Position = a_Position;\n' +
	'}\n';

var FSHADER_SOURCE = 
	'void main(){\n' + 
	'	gl_FragColor = vec4(0.0,0.0,0.0,1.0);\n' +
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

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
		console.log("failed to get a_Position");
		return;
	}

	initVartexBuffers(gl, a_Position);

	canvas.onmousedown = function(ev){
		if(ev.which == 3){
			console.log(vertices);
		}
		click(ev, gl, canvas, a_Position);
	}

	canvas.onmousemove = function(ev){
		hover(ev, gl, canvas, a_Position);
	}

	gl.clearColor(1.0,1.0,1.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
}

var vertices = [];

function click(ev, gl, canvas, a_Position){
	var x = ev.clientX;
	var y = ev.clientY;

	var rect = ev.target.getBoundingClientRect();
	x = ((x - rect.left) - (canvas.width)/2)/(canvas.width/2);
	y = ((canvas.height)/2 - (y - rect.top))/(canvas.height/2);

	vertices.push(x);
	vertices.push(y);

	console.log(x, y);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(a_Position);

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
}

function hover(ev, gl, canvas, a_Position){
	if(vertices.length > 0){
		var x = ev.clientX;
		var y = ev.clientY;

		var rect = ev.target.getBoundingClientRect();

		x = ((x - rect.left) - (canvas.width)/2)/(canvas.width/2);
		y = ((canvas.height)/2 - (y - rect.top))/(canvas.height/2);

		var movePoint = [x,y];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(movePoint)), gl.STATIC_DRAW);

		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(a_Position);

		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.LINE_STRIP, 0, vertices.concat(movePoint).length / 2);
	}
}

function initVartexBuffers(gl, a_Position){

	var vertexBuffer = gl.createBuffer();
	if(!vertexBuffer){
		console.log("failed to create the buffer object");
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(a_Position);
}