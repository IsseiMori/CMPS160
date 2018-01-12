var VSHADER_SOURCE = 
	'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Normal;\n' +
	'attribute vec4 a_Color;\n' +
	'uniform vec3 u_LightDirection;\n' +
	'varying vec4 v_Color;\n' +
	'void main(){\n' + 
	'	gl_Position = a_Position;\n' +
	//'	float nDotL = max(dot(u_LightDirection, normalize(a_Normal.xyz)),0.0);\n' +
	//'	v_Color = vec4(vec3(0.0, 1.0, 0.0) * nDotL, 1.0);\n' +
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

	gl.enable(gl.DEPTH_TEST);

	//initialize buffers
	var indexBuffer = gl.createBuffer();
	var verticesBuffer = gl.createBuffer();
	var normalBuffer = gl.createBuffer();
	var colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	//get Shader attributes
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
	if(u_LightDirection < 0){
		console.log("failed to get the storage location");
		return;
	}

	//set lightDirection
	var lightDirection = new Vector3([1.0, 1.0, 1.0]);
	lightDirection.normalize();
	gl.uniform3fv(u_LightDirection, lightDirection.elements);

	makeCircle(canvas);

	canvas.onmousedown = function(ev){
		click(ev, gl, canvas, verticesBuffer, normalBuffer, colorBuffer, a_Position, a_Normal, a_Color, lightDirection);
	}

	gl.clearColor(0.5,0.5,0.5,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 3);
}

//make an array of 12 sided circle located at origin
var circle = [];
function makeCircle(canvas){
	//2 vertices for each side
	//72 vertices in total
	var r;
	var rad = Math.PI / 180.0;
	if(canvas.width < canvas.height) r = canvas.width * 0.05;
	else r = canvas.height * 0.05;

	for(i = 0; i < 36; i+=3){
		circle.push(0.05 * Math.sin(30.0 * (i/3) * rad));
		circle.push(0.0);
		circle.push(0.05 * Math.cos(30 * (i/3) * rad));
		//copy coordinate for next side
		if(i > 0){
			circle.push(0.05 * Math.sin(30.0 * (i/3) * rad));
			circle.push(0.0);
			circle.push(0.05 * Math.cos(30 * (i/3) * rad));
		}
		if(i == 33){
			circle.push(circle[0]);
			circle.push(circle[1]);
			circle.push(circle[2]);
		}
	}
}

var prevAngle;
var prevprevAngle;
var vertices = []; //center point and 12 vertices -> pair of 39 vertices
var prevPoint = [];
var indices = [];
//  48---49 26---27
//   |   |   |   |
//   |___|   |___|
//	23   24  1    2
//
//
var normals = [];
var colors = [0.0,1.0,0.0];
var colorsFlat = [];
var colorsSmooth = [];

function click(ev, gl, canvas, verticesBuffer, normalBuffer, colorBuffer, a_Position, a_Normal, a_Color, lightDirection){
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
		for(i = -75; i < 0; i+=3){
			//calculate object coordinate
			tmpPoints[0] = vertices[vertices.length + i] - vertices[vertices.length - 75];
			tmpPoints[1] = vertices[vertices.length + i + 1] - vertices[vertices.length - 74];
			tmpPoints[2] = vertices[vertices.length + i + 2] - vertices[vertices.length - 73];
			v3 = new Vector3(tmpPoints);
			v3 = circleRotateMatrix.multiplyVector3(v3);
			tmp = new Float32Array(v3.elements);
			vertices[vertices.length + i] = tmp[0] + vertices[vertices.length - 75];
			vertices[vertices.length + i + 1] = tmp[1] + vertices[vertices.length - 74];
			vertices[vertices.length + i + 2] = tmp[2] + vertices[vertices.length - 73];
		}

		//copy the circle vertices for the next polygon
		if(vertices.length > 75){
			var currentLength = vertices.length;
			for(i = -75; i < 0; i++){
				vertices.push(vertices[currentLength + i]);
			}
		}
	}

	//store the ceter point into vertices
	vertices.push(x);
	vertices.push(y);
	vertices.push(0);

	//store new circle
	circleRotateMatrix.setRotate(angle, 0, 0, 1);
	for(i = 0; i < 72; i+=3){
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
		for(i = 0; i < 24; i+=2){
			indices.push(vertices.length / 3 - 50 + 26 + i);
			indices.push(vertices.length / 3 - 50 + 1 + i);
			indices.push(vertices.length / 3 - 50 + 2 + i);
			indices.push(vertices.length / 3 - 50 + 2 + i);
			indices.push(vertices.length / 3 - 50 + 27 + i);
			indices.push(vertices.length / 3 - 50 + 26 + i);
		}
	}
	//recalculate normals for the lastest 2 circles
	calculateNormals();

	calculateFlatShadingColor(lightDirection);
 
 	//store the center point
	prevPoint[0] = x;
	prevPoint[1] = y;

	//store the angle
	prevprevAngle = prevAngle;
	prevAngle = angle;

	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Normal);

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsFlat), gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Color);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
	console.log(vertices);
	console.log(indices);
	console.log(normals);
	console.log(colorsFlat);

	gl.clearColor(0.5,0.5,0.5, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}

function calculateFlatShadingColor(lightDirection){
	var n = 0;
	if(vertices.length > 75) n = 2;
	if(vertices.length > 150) n = 4;

	for(j = 1; j <= n; j++){
		for(i = 3; i <= 72; i+=3){
			var len = vertices.length;

			//normal
			v_Normal = new Vector3([normals[len - 75 * j + i], normals[len - 75 * j + i + 1], normals[len - 75 * j + i + 2]]);

			//normalize normal vector
			v_Normal.normalize();

			//dot product
			var nDotL = [lightDirection.elements[0] * v_Normal.elements[0], lightDirection.elements[1] * v_Normal.elements[1], lightDirection.elements[2] * v_Normal.elements[2]];

			//set nDotL minimum value to 0
			if(nDotL[0] < 0.0) nDotL[0] = 0.0;
			if(nDotL[1] < 0.0) nDotL[1] = 0.0;
			if(nDotL[2] < 0.0) nDotL[2] = 0.0;

			//store color to color array
			colorsFlat[len - 75 * j + i] = colors[0] * nDotL[0];
			colorsFlat[len - 75 * j + i + 1] = colors[1] * nDotL[1];
			colorsFlat[len - 75 * j + i + 2] = colors[2] * nDotL[2];
		}
	}
}

function calculateNormals(){
	
	var x = []; //first vector
	var y = []; //first vector
	var n = []; //result normal vector
	if(vertices.length > 75){
		for(i = 3; i <= 69; i+=6){
			x[0] = vertices[vertices.length - 150 + i] - vertices[vertices.length - 75 + i];
			x[1] = vertices[vertices.length - 75 + 1 + i] - vertices[vertices.length - 75 + 1 + i];
			x[2] = vertices[vertices.length - 75 + 2 + i] - vertices[vertices.length - 75 + 2 + i];
			y[0] = vertices[vertices.length - 150 + 3 + i] - vertices[vertices.length - 150 + i];
			y[1] = vertices[vertices.length - 150 + 4 + i] - vertices[vertices.length - 150 + 1 + i];
			y[2] = vertices[vertices.length - 150 + 5 + i] - vertices[vertices.length - 150 + 2 + i];
			n = crossProduct(x,y);
			normals[vertices.length - 150 + i] = n[0];
			normals[vertices.length - 150 + i + 1] = n[1];
			normals[vertices.length - 150 + i + 2] = n[2];
			normals[vertices.length - 150 + i + 3] = n[0];
			normals[vertices.length - 150 + i + 4] = n[1];
			normals[vertices.length - 150 + i + 5] = n[2];
			normals[vertices.length - 75 + i] = n[0];
			normals[vertices.length - 75 + i + 1] = n[1];
			normals[vertices.length - 75 + i + 2] = n[2];
			normals[vertices.length - 75 + i + 3] = n[0];
			normals[vertices.length - 75 + i + 4] = n[1];
			normals[vertices.length - 75 + i + 5] = n[2];
		}
		if(vertices.length > 150){
			for(i = 3; i <= 69; i+=6){
				x[0] = vertices[vertices.length - 300 + i] - vertices[vertices.length - 225 + i];
				x[1] = vertices[vertices.length - 225 + 1 + i] - vertices[vertices.length - 225 + 1 + i];
				x[2] = vertices[vertices.length - 225 + 2 + i] - vertices[vertices.length - 225 + 2 + i];
				y[0] = vertices[vertices.length - 300 + 3 + i] - vertices[vertices.length - 300 + i];
				y[1] = vertices[vertices.length - 300 + 4 + i] - vertices[vertices.length - 300 + 1 + i];
				y[2] = vertices[vertices.length - 300 + 5 + i] - vertices[vertices.length - 300 + 2 + i];
				n = crossProduct(x,y);
				normals[vertices.length - 300 + i] = n[0];
				normals[vertices.length - 300 + i + 1] = n[1];
				normals[vertices.length - 300 + i + 2] = n[2];
				normals[vertices.length - 300 + i + 3] = n[0];
				normals[vertices.length - 300 + i + 4] = n[1];
				normals[vertices.length - 300 + i + 5] = n[2];
				normals[vertices.length - 225 + i] = n[0];
				normals[vertices.length - 225 + i + 1] = n[1];
				normals[vertices.length - 225 + i + 2] = n[2];
				normals[vertices.length - 225 + i + 3] = n[0];
				normals[vertices.length - 225 + i + 4] = n[1];
				normals[vertices.length - 225 + i + 5] = n[2];
			}
		}
	}
}

function crossProduct(x, y){
	var result = [];
	result[0] = x[1] * y[2] - x[2] * y[1];
	result[1] = x[2] * y[0] - x[0] * y[2];
	result[2] = x[0] * y[1] - x[1] * y[0];

	return result;
}




