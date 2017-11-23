var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute float a_PointSize;\n' +
	'void main(){\n' + 
	'	gl_Position = a_Position;\n' +
	'	gl_PointSize = a_PointSize;\n' + 
	'}\n';

var FSHADER_SOURCE = 
	'void main(){\n' + 
	'	gl_FragColor = vec4(1.0,1.0,0.0,1.0);\n' +
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
		console.log("failed to get the storage location of a_Position");
		return;
	}

	var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
	if(a_PointSize < 0){
		console.log("failed to get the storage location for a_PointSize");
		return;
	}

	canvas.onmousedown = function(ev){
		click(ev, gl, canvas, a_Position);
	}

	gl.vertexAttrib1f(a_PointSize, 10.0);
	
	gl.clearColor(0.5,0.5,0.5,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];

function click(ev, gl, canvas, a_Position){
	var x = ev.clientX;
	var y = ev.clientY;

	var rect = ev.target.getBoundingClientRect();

	x = ((x - rect.left) - (canvas.width)/2)/(canvas.width/2);
	y = ((canvas.height)/2 - (y - rect.top))/(canvas.height/2);

	g_points.push([x,y]);

	gl.clear(gl.COLOR_BUFFER_BIT);

	var len = g_points.length;

	for(var i = 0; i < len; i++){
		var xy = g_points[i];
		gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
		gl.drawArrays(gl.POINTS, 0, 1);
	}
}