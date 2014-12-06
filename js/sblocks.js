var COLORS = [
	'tomato',
	'steelblue',
	'springgreen',
	'hotpink',
	'turquoise',
	'rebeccapurple',
	'lawngreen',
	'gold',
	'dodgerblue',
	'darkred'];
var DIMENSION = 16;
var STACKLENGTH = 3;
var DRAWDELAY = 0;
var level = 20;
var colorsNumber = 5;

colorsNumber++;
var d = document;
var $ = d.querySelectorAll.bind(document);

var gameLoop;

var matrix = new Array(DIMENSION);

function buildField() {
	var field = $('#field')[0];
	var tr, td;
	for (var i = DIMENSION - 1; i >= 0; i--) {
		tr = d.createElement('tr');
		for (var j = DIMENSION - 1; j >= 0; j--) {
			td = d.createElement('td');
			tr.appendChild(td);
		}
		field.appendChild(tr)
	}
	return field;
}

var field = buildField();

var nextColorElement = $('#next_color')[0];
var nextColor = 0;

function init() {
	initField();
	setStackHandlers(true);
	getNextColor();
}

function initField() {
	//init field matrix
	for (var i = 0; i < matrix.length; i++) {
		matrix[i] = new Array(DIMENSION);
		for (var j = 0; j < matrix[i].length; j++) {
			matrix[i][j] = {
				color: 0,
				direction: null
			};
		};
	};

	//fill stacks with random bricks
	for (var i = DIMENSION - 1 - STACKLENGTH; i >= STACKLENGTH; i--) {
		for (var j = STACKLENGTH - 1; j >= 0; j--) {
			matrix[i][j] = {
				color: getRandomInt(1, colorsNumber),
				direction: 'bottom'
			};
			matrix[DIMENSION - 1 - j][i] = {
				color: getRandomInt(1, colorsNumber),
				direction: 'left'
			};
			matrix[i][DIMENSION - 1 - j] = {
				color: getRandomInt(1, colorsNumber),
				direction: 'top'
			};
			matrix[j][i] = {
				color: getRandomInt(1, colorsNumber),
				direction: 'right'
			};
		};
	};
	//fill field with random bricks
	for (var x = 0; x < 4 + level; x++) {
		var i = getRandomInt(STACKLENGTH, DIMENSION - STACKLENGTH - 1);
		var j = getRandomInt(STACKLENGTH, DIMENSION - STACKLENGTH - 1);
		if ((i === STACKLENGTH && j === STACKLENGTH)
			|| (i === STACKLENGTH && j === DIMENSION - 1 - STACKLENGTH)
			|| (i === DIMENSION - 1 - STACKLENGTH && j === STACKLENGTH)
			|| (i === DIMENSION - 1 - STACKLENGTH && j === DIMENSION - 1 - STACKLENGTH) ) {
			x--;
			continue;
		}
		matrix[i][j].color = getRandomInt(1, colorsNumber);
	};
	updateField(true);
	return field;
}

init();

function setStackHandlers(bind) {
	var bricks = new Array((DIMENSION-STACKLENGTH*2)*STACKLENGTH*2+(DIMENSION-STACKLENGTH*2)*STACKLENGTH*2);
	//filling bricks array with target objects...
	for (var i = DIMENSION - 1 - STACKLENGTH; i >= STACKLENGTH; i--) {
		for (var j = STACKLENGTH - 1; j >= 0; j--) {
			bricks.push(field.children[j].children[i]);
			bricks.push(field.children[i].children[j]);
			bricks.push(field.children[DIMENSION - 1 - j].children[i]);
			bricks.push(field.children[i].children[DIMENSION - 1 - j]);
		};
	};

	//... and binding or unbinding them handlers
	if (bind) {
		bricks.forEach(function(element, index){
			element.addEventListener('click', brickClickHandler);
		});	
	}
	else {
		bricks.forEach(function(element, index){
			element.removeEventListener('click', brickClickHandler);
		});	
	}
}

function brickClickHandler(e) {
	var x = getChildIndex(e.target);
	var y = getChildIndex(e.target.parentNode);
	if (!moveAvailable(x, y)) {
		return false;
	}
	switch(matrix[x][y].direction){
		case 'bottom':
			if (matrix[x][STACKLENGTH].color !== 0) {
				return false;
			}
			setStackHandlers(false);
			for (var i = STACKLENGTH - 1; i >= 0; i--) {
				move(x, i);
			};
			matrix[x][0] = {
				color: getNextColor(),
				direction: 'bottom'
			}
			break;
		case 'left':
			if (matrix[DIMENSION - 1 - STACKLENGTH][y].color !== 0) {
				return false;
			}
			setStackHandlers(false);
			for (var i = DIMENSION - STACKLENGTH; i < DIMENSION; i++) {
				move(i, y);
			};
			matrix[DIMENSION - 1][y] = {
				color: getNextColor(),
				direction: 'left'
			}
			break;
		case 'top':
			if (matrix[x][DIMENSION - 1 - STACKLENGTH].color !== 0) {
				return false;
			}
			setStackHandlers(false);
			for (var i = DIMENSION - STACKLENGTH; i < DIMENSION; i++) {
				move(x, i);
			};
			matrix[x][DIMENSION - 1] = {
				color: getNextColor(),
				direction: 'top'
			}
			break;
		case 'right':
			if (matrix[STACKLENGTH][y].color !== 0) {
				return false;
			}
			setStackHandlers(false);
			for (var i = STACKLENGTH - 1; i >= 0; i--) {
				move(i, y);
			};
			matrix[0][y] = {
				color: getNextColor(),
				direction: 'right'
			}
			break;
	}
	updateField();
	clearTimeout(gameLoop);
	gameLoop = setTimeout(loop, DRAWDELAY);
}

function getChildIndex(element) {
	return [].indexOf.call(element.parentNode.children, element);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function loop() {
	var hasMoves = false;
	for (var i = matrix.length - 1 - STACKLENGTH; i >= STACKLENGTH; i--) {
		for (var j = matrix[i].length - 1 - STACKLENGTH; j >= STACKLENGTH; j--) {
			if (move(i, j)) {
				hasMoves = true;
				clearTimeout(gameLoop);
				gameLoop = setTimeout(loop, DRAWDELAY);
			}
		};
	};
	if (!hasMoves) {
		setStackHandlers(true);
		testGameEnd();
	}
}

function move(x, y) {
	if (!matrix[x][y].direction) {
		return false;
	}

	var farBorderIndex = DIMENSION - 1 - STACKLENGTH;
	var closeBorderIndex = STACKLENGTH;
	if (matrix[x][y].direction === 'bottom') {
		if (y >= farBorderIndex) {
			matrix[x][DIMENSION-1] = {
				color: 0,
				direction: null
			};
			for (var i = DIMENSION - 2; i >= DIMENSION - 1 - STACKLENGTH; i--) {
				moveBrick(x, i, x, i+1);
			};
			return false;
		}
		if (matrix[x][y+1].color === 0) {
			moveBrick(x, y, x, y+1);
			if (y+1 < farBorderIndex && matrix[x][y+2].color !== 0 && y+1 >= closeBorderIndex) {
				testCombination(x, y+1, matrix[x][y+1].color);
			}
		}
		else {
			return false;
		}
	}
	else if (matrix[x][y].direction === 'left') {
		if (x <= closeBorderIndex) {
			matrix[0][y] = {
				color: 0,
				direction: null
			};
			for (var i = 1; i <= STACKLENGTH; i++) {
				moveBrick(i, y, i-1, y);
			};
			return false;
		}
		if (matrix[x-1][y].color === 0) {
			moveBrick(x, y, x-1, y);
			if (x-1 > closeBorderIndex && matrix[x-2][y].color !== 0 && x-1 <= farBorderIndex) {
				testCombination(x-1, y, matrix[x-1][y].color);
			}
		}
		else {
			return false;
		}
	}
	else if (matrix[x][y].direction === 'top') {
		if (y <= closeBorderIndex) {
			matrix[x][0] = {
				color: 0,
				direction: null
			};
			for (var i = 1; i <= STACKLENGTH; i++) {
				moveBrick(x, i, x, i-1);
			};
			return false;
		}
		if (matrix[x][y-1].color === 0) {
			moveBrick(x, y, x, y-1);
			if (y-1 > closeBorderIndex && matrix[x][y-2].color !== 0 && y-1 <= farBorderIndex) {
				testCombination(x, y-1, matrix[x][y-1].color);
			}
		}
		else {
			return false;
		}
	}
	else if (matrix[x][y].direction === 'right') {
		if (x >= farBorderIndex) {
			matrix[DIMENSION-1][y] = {
				color: 0,
				direction: null
			};
			for (var i = DIMENSION - 2; i >= DIMENSION - 1 - STACKLENGTH; i--) {
				moveBrick(i, y, i+1, y);
			};
			return false;
		}
		if (matrix[x+1][y].color === 0) {
			moveBrick(x, y, x+1, y);
			if (x+1 < farBorderIndex && matrix[x+2][y].color !== 0 && x+1 >= closeBorderIndex) {
				testCombination(x+1, y, matrix[x+1][y].color);
			}
		}
		else {
			return false;
		}
	}
	return true;
}

function moveBrick(x, y, x1, y1) {
	matrix[x1][y1] = matrix[x][y];
	matrix[x][y] = {
		color: 0,
		direction: null
	};
	updateField();
}

function moveAvailable(x, y) {
	switch(matrix[x][y].direction){
		case 'top':
		case 'bottom':
			for (var i = DIMENSION - 1 - STACKLENGTH; i >= STACKLENGTH; i--) {
				if (matrix[x][i].color !== 0)
					return true;
			};
			break;
		case 'right':
		case 'left':
			for (var i = DIMENSION - 1 - STACKLENGTH; i >= STACKLENGTH; i--) {
				if (matrix[i][y].color !== 0)
					return true;
			};
			break;
	}
	return false;
}

function testCombination(x, y) {
	if (testCombinationRecursion(x, y, 0, 0, matrix[x][y].color, false)) {
		testCombinationRecursion(x, y, 0, 0, matrix[x][y].color, true);
		updateField();
	}
}

function testCombinationRecursion(x, y, xPrev, yPrev, color, remove, depth) {
	var isCombination = false;
	if (typeof depth == 'number') {
		depth++;
	}
	else {
		depth = 1;
	}
	if (matrix[x][y].color === color) {
		if (remove && isInField(x) && isInField(y)) {
			matrix[x][y] = {
				color: 0,
				direction: null
			};
		}
		if (depth >= 3 && !remove) {
			return true;
		}
		if (x < DIMENSION - 1 - STACKLENGTH && xPrev !== x+1) {
			if (testCombinationRecursion(x+1, y, x, y, color, remove, depth)) {
				isCombination = true;
			}
		}
		if (y < DIMENSION - 1 - STACKLENGTH && yPrev !== y+1) {
			if (testCombinationRecursion(x, y+1, x, y, color, remove, depth)) {
				isCombination = true;
			}
		}
		if (x > STACKLENGTH && xPrev !== x-1) {
			if (testCombinationRecursion(x-1, y, x, y, color, remove, depth)) {
				isCombination = true;
			}
		}
		if (y > STACKLENGTH && yPrev !== y-1) {
			if (testCombinationRecursion(x, y-1, x, y, color, remove, depth)) {
				isCombination = true;
			}
		}

		var sameNeighboursCount = 0;
		if (x < DIMENSION - 1 - STACKLENGTH && matrix[x+1][y].color === color) {
			sameNeighboursCount++;
		}
		if (y < DIMENSION - 1 - STACKLENGTH && matrix[x][y+1].color === color) {
			sameNeighboursCount++;
		}
		if (x > STACKLENGTH && matrix[x-1][y].color === color) {
			sameNeighboursCount++;
		}
		if (y > STACKLENGTH && matrix[x][y-1].color === color) {
			sameNeighboursCount++;
		}
		if (sameNeighboursCount >= 2) {
			isCombination = true;
		}
	}
	return isCombination;
}

function updateField(full) {
	for (var i = matrix.length - 1; i >= 0; i--) {
		for (var j = matrix[i].length - 1; j >= 0; j--) {
			var brickElement = field.children[j].children[i];
			color = matrix[i][j].color === 0 ? 'transparent' : COLORS[matrix[i][j].color];
			brickElement.style.backgroundColor = color;
			if (isInField(i) && isInField(j)) {
				brickElement.className = matrix[i][j].direction ? matrix[i][j].direction : '';
			}
		};
	};
}

function getNextColor() {
	var color = nextColor;
	nextColor = getRandomInt(1, colorsNumber);
	nextColorElement.style.backgroundColor = COLORS[nextColor];
	return color;
}

function isInField(coord) {
	return coord <= DIMENSION - 1 - STACKLENGTH && coord >= STACKLENGTH;
}

function testGameEnd() {
	var isFieldEmpty = true;
	for (var i = matrix.length - 1 - STACKLENGTH; i >= STACKLENGTH; i--) {
		for (var j = matrix[i].length - 1 - STACKLENGTH; j >= STACKLENGTH; j--) {
			if (matrix[i][j].color !== 0) {
				isFieldEmpty = false;
			}
		};
	};
	if (isFieldEmpty) {
		alert('game over!');
		init();
	}
}
