{
	'use strict';

	function Point(coordinate, index, parent) {
		[this.x, this.y] = coordinate;
		this.index = index;
		this.parent = parent;

		this.left_distance = this.index;
		this.right_distance = this.parent.count - this.index - 1;
		this.distance = Math.min(this.left_distance, this.right_distance);
	}
	Point.prototype = {
		prev() { return this.parent.points[this.index - 1] || null; },
		next() { return this.parent.points[this.index + 1] || null; },
		derivative(n) {
			if(n === 0)
				return this.y;
			if(n > this.distance)
				return null;
			const prev = this.prev(), next = this.next();
			return (prev.derivative(n - 1) - next.derivative(n - 1)) / (prev.x - next.x);
		},
	};

	const factDown_buffer = [[1]];
	function factDown(start, count) {
		if(start in factDown_buffer)
			return factDown_buffer[start][count];
		const row = factDown_buffer[start] = [1];
		let product = 1;
		while(start)
			row.push(product *= start--);
		return row[count];
	}
	function derivativePolynomialAt(dimension, d_rank, x) {
		const poly = Array(dimension).fill(0);
		for(let i = 0, power = 1; i < dimension - d_rank; ++i, power *= x)
			poly[i + d_rank] = factDown(i + d_rank, d_rank) * power;
		return poly;
	}
	function computePolynomial(coefficient, x) {
		let sum = 0, power = 1;
		for(let i = 0; i < coefficient.length; ++i) {
			sum += power * coefficient[i];
			power *= x;
		}
		return sum;
	}

	function Interval(start, end, parent) {
		this.start = start;
		this.end = end;
		this.parent = parent;

		this.span = this.end.x - this.start.x;
		
		this.coefficients_buffer = [];
	}
	Interval.prototype = {
		contains(x) { return x >= this.start.x && x <= this.end.x; },
		computeCoefficient(d_left, d_right) {
			const matrix = [], vector = [];
			const dimension = d_left + d_right + 2;
			for(let i = 0; i <= d_left; ++i) {
				matrix.push(derivativePolynomialAt(dimension, i, this.start.x));
				vector.push(this.start.derivative(i));
			}
			for(let i = 0; i <= d_right; ++i) {
				matrix.push(derivativePolynomialAt(dimension, i, this.end.x));
				vector.push(this.end.derivative(i));
			}
			const coefficient = math.multiply(math.inv(matrix), vector);
			this.coefficients_buffer[d_left][d_right] = coefficient;
		},
		coefficients(d_left, d_right) {
			if(!(d_left in this.coefficients_buffer)) {
				this.coefficients_buffer[d_left] = [];
				this.computeCoefficient(d_left, d_right);
			}
			if(!(d_right in this.coefficients_buffer[d_left]))
				this.computeCoefficient(d_left, d_right);
			return this.coefficients_buffer[d_left][d_right];
		},
		tween(x, rank) {
			const r_left = Math.min(this.start.distance, rank);
			const r_right = Math.min(this.end.distance, rank);
			const coefficient = this.coefficients(r_left, r_right);
			return computePolynomial(coefficient, x);
		},
	};

	function Scatter(coordinates) {
		this.count = coordinates.length;

		this.points = coordinates.slice()
			.sort((a, b) => a.x - b.x)
			.map((coordinate, i) => new Point(coordinate, i, this));

		this.intervals = [];
		for(let i = 1; i < this.count; ++i) {
			const interval = new Interval(this.points[i - 1], this.points[i], this);
			this.intervals.push(interval);
		}

		this.xmin = this.points[0].x;
		this.xmax = this.points[this.count - 1].x;
		this.xspan = this.xmax - this.xmin;

		this.ymin = Infinity;
		this.ymax = -Infinity;
		for(const point of this.points) {
			const y = point.y;
			if(y < this.ymin)
				this.ymin = y;
			if(y > this.ymax)
				this.ymax = y;
		}
		this.yspan = this.ymax - this.ymin;
	}
	Scatter.prototype = {
		tween(x, rank) {
			if(x < this.xmin || x > this.xmax)
				return null;
			const interval = this.intervals.find(i => i.contains(x));
			return interval.tween(x, rank);
		},
	};

	window.Scatter = Scatter;
}