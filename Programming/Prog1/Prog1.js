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

	var indexBuffer = gl.createBuffer();
	var verticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	makeCircle(canvas);

	canvas.onmousedown = function(ev){
		click(ev, gl, canvas, a_Position);
	}

	gl.clearColor(0.5,0.5,0.5,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	//gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 3);
}

//make an array of 12 sided circle located at origin
var circle = [];
function makeCircle(canvas){
	var r;
	var rad = Math.PI / 180.0;
	if(canvas.width < canvas.height) r = canvas.width * 0.05;
	else r = canvas.height * 0.05;

	for(i = 0; i < 36; i+=3){
		circle[i] = 0.05 * Math.sin(30.0 * (i/3) * rad);
		circle[i+1] = 0;
		circle[i+2] = 0.05 * Math.cos(30 * (i/3) * rad);
	}
}

var prevAngle;
var prevprevAngle;
var vertices = []; //center point and 12 vertices -> pair of 39 vertices
var prevPoint = [];
var indices = [];

function click(ev, gl, canvas, a_Position){
	//convert canvas coordinate to webgl coordinate
	var x = ev.clientX;
	var y = ev.clientY;
	var rect = ev.target.getBoundingClientRect();
	x = ((x - rect.left) - (canvas.width)/2)/(canvas.width/2);
	y = ((canvas.height)/2 - (y - rect.top))/(canvas.height/2);

	var circleRotateMatrix = new Matrix4();
	var v3;
	var tmpPoints = [];
	var tmp = [];
	var angle;

	//move the circle to the clicked point and push vertices to vertices array
	if(prevAngle == null){
		prevAngle = 0;
		angle = 0;
	}else{
		//calculate the angle between current point and previous point
		angle = 180 / Math.PI * -Math.atan2(x - prevPoint[0], y - prevPoint[1]);
		//change the rotation of previous circle based on prevprevAngle and the current angle
		circleRotateMatrix.setRotate((angle + prevprevAngle) / 2.0 - prevAngle , 0, 0, 1);
		prevAngle = (angle + prevprevAngle) / 2.0;
		for(i = -36; i < 0; i+=3){
			tmpPoints[0] = vertices[vertices.length + i] - vertices[vertices.length - 39];
			tmpPoints[1] = vertices[vertices.length + i + 1] - vertices[vertices.length - 38];
			tmpPoints[2] = vertices[vertices.length + i + 2] - vertices[vertices.length - 37];
			v3 = new Vector3(tmpPoints);
			v3 = circleRotateMatrix.multiplyVector3(v3);
			tmp = new Float32Array(v3.elements);
			vertices[vertices.length + i] = tmp[0] + vertices[vertices.length - 39];
			vertices[vertices.length + i + 1] = tmp[1] + vertices[vertices.length - 38];
			vertices[vertices.length + i + 2] = tmp[2] + vertices[vertices.length - 37];
		}
	}

	//store the ceter point into vertices
	vertices.push(x);
	vertices.push(y);
	vertices.push(0);

	//modify the previous angle
	circleRotateMatrix.setRotate(angle, 0, 0, 1);
	console.log(angle, prevAngle);
	for(i = 0; i < 36; i+=3){
		tmpPoints[0] = circle[i];
		tmpPoints[1] = circle[i+1];
		tmpPoints[2] = circle[i+2];
		v3 = new Vector3(tmpPoints);
		v3 = circleRotateMatrix.multiplyVector3(v3);
		tmp = new Float32Array(v3.elements);
		vertices.push(tmp[0]+x);
		vertices.push(tmp[1]+y);
		vertices.push(tmp[2]);
	}
	
	//make polygon indeces
	if(prevprevAngle != null){
		for(i = 0; i < 11; i++){
			indices.push(vertices.length / 3 - 26 + 14 + i);
			indices.push(vertices.length / 3 - 26 + 1 + i); indices.push(vertices.length / 3 - 26 + 1 + i);
			indices.push(vertices.length / 3 - 26 + 2 + i);
			indices.push(vertices.length / 3 - 26 + 2 + i);
			indices.push(vertices.length / 3 - 26 + 15 + i); indices.push(vertices.length / 3 - 26 + 15 + i);
			indices.push(vertices.length / 3 - 26 + 14 + i);
		}
		indices.push(vertices.length / 3 - 26 + 25);
		indices.push(vertices.length / 3 - 26 + 12); indices.push(vertices.length / 3 - 26 + 12);
		indices.push(vertices.length / 3 - 26 + 1);
		indices.push(vertices.length / 3 - 26 + 1);
		indices.push(vertices.length / 3 - 26 + 14); indices.push(vertices.length / 3 - 26 + 14);
		indices.push(vertices.length / 3 - 26 + 25);
	}
 
 	//store the center point
	prevPoint[0] = x;
	prevPoint[1] = y;

	//store the angle
	prevprevAngle = prevAngle;
	prevAngle = angle;

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	//console.log(vertices);
	//console.log(indices);

	gl.clearColor(0.5,0.5,0.5, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_BYTE, 0);
}