'use strict';

const make_scatter = (f, dx, xmin, xmax) => new Scatter([...function *(){
	let x = xmin;
	do {
		yield [x, f(x)];
		x += dx
	} while(x < xmax);
	return;
}()], true);

const C = make_scatter(x => Math.sin(x), .1, 0, 2);

const cvs = document.getElementById('cvs'), ctx = cvs.getContext('2d');
const dx = 1e-2;
const [w, h] = [cvs.width, cvs.height] = [512, 512];
const scr = (x, y, s) => [w * (x - s.xmin) / s.xspan, h * (1 - (y - s.ymin) / s.yspan)];
const rank = 1;
ctx.beginPath();
ctx.moveTo(...scr(0, C.tween(C.xmin, rank), C));
for(let x = dx; x <= C.xmax; x += dx) {
	ctx.lineTo(...scr(x, C.tween(x, rank), C));
}
ctx.stroke();
for(const point of C.points) {
	ctx.beginPath();
	ctx.arc(...scr(point.x, point.y, C), 2, 0, 6.3);
	ctx.closePath();
	ctx.fill();
}