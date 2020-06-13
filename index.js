'use strict';

const make_scatter = (f, dx, xmin, xmax) => new Scatter([...function *(){
	let x = xmin;
	do {
		yield [x, f(x)];
		x += dx
	} while(x < xmax);
	return;
}()], true);

const C = make_scatter(x => Math.random(x), .1, 0, 5);

const cvs = document.getElementById('cvs'), ctx = cvs.getContext('2d');
const dx = 1e-3;
const [w, h] = [cvs.width, cvs.height] = [800, 400];
const [wm, hm] = [10, 50];	// margins against overflow
const scr = (x, y, s) => [
	(w - wm * 2) * (x - s.xmin) / s.xspan + wm,
	(h - hm * 2) * (1 - (y - s.ymin) / s.yspan) + hm
];
const colors = ['red', 'green', 'blue', 'purple'];
for(let rank = 0; rank < 4; ++rank) {
	ctx.beginPath();
	ctx.moveTo(...scr(0, C.tween(C.xmin, rank), C));
	for(let x = dx; x <= C.xmax; x += dx)
		ctx.lineTo(...scr(x, C.tween(x, rank), C));
	ctx.strokeStyle = colors[rank];
	ctx.stroke();
}
ctx.strokeStyle = 'black';
for(const point of C.points) {
	ctx.beginPath();
	ctx.arc(...scr(point.x, point.y, C), 2, 0, 6.3);
	ctx.closePath();
	ctx.fill();
}