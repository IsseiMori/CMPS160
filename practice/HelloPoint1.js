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
	
	gl.clearColor(0.5,0.5,0.5,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'rgba(0,0,255,1.0)';
	ctx.fillRect(120,10,150,150);
}