let cellsNo = 20
let cellSize = 400 / cellsNo
let difficulty = 1

let score = 0

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const btnStart = document.querySelector('.btn-start')
const btnPause = document.querySelector('.btn-pause')
const scoreVal = document.querySelector('.score_val')


let direction
const DIR = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
}

// ctx.strokeStyle = '#616161'
ctx.strokeStyle = '#27373F'
ctx.fillStyle = '#fff'

let snake = []
let food = null
let paused = false
let needsGrowth = false

let lastUpdate, lastFood, tick
let state
let flash = false
let lastKeyPressed

function update() {
	tick = Date.now()
	
	
	if (hasCollisions()) {
		flash = true
		return
	}
	
	if (tick - lastUpdate > 500 / difficulty) {
		if (lastKeyPressed && lastKeyPressed !== direction) {
			setDirection(lastKeyPressed)
		}
		
		moveSnake()
		lastUpdate = tick
	}
	
	if (tick - lastFood > foodTreshold()) {
		putFood()
	}
	
	if (headMeetsFood()) {
		needsGrowth = true
		food = null
		putFood()
		setScore(score + difficulty)
	}
}

function foodTreshold() {
	return (5000 / difficulty) * cellsNo
}

function hasCollisions() {
	const head = snake[0]
	const check = snake.concat([])
	check.shift()
	return check.find(
		c => c.x === head.x && c.y === head.y
	)
}

function snakeContains(cell) {
	return snake.find(c => c.x === cell.x && c.y === cell.y)
}

function headMeetsFood() {
	const head = snake[0]
	return food && (head.x == food.x && head.y === food.y)
}

function moveSnake() {
	const head = snake[0]
	const next = Object.assign({}, head)
	
	switch(direction) {
		case DIR.LEFT:
			--next.x;
			break;
		case DIR.UP:
			--next.y;
			break;
		case DIR.RIGHT:
			++next.x;
			break;
		case DIR.DOWN:
			++next.y;
			break;
	}
	
	if (next.x >= cellsNo) next.x = 0
	if (next.y >= cellsNo) next.y = 0
	if (next.x < 0) next.x = cellsNo -1
	if (next.y < 0) next.y = cellsNo -1

	if (!needsGrowth) {
		snake.pop()
	}
	
	needsGrowth = false
	snake.unshift(next);
}

function putFood() {
	do {
		food = {
			x: ~~(Math.random() * (cellsNo - 1)),
			y: ~~(Math.random() * (cellsNo - 1))
		}
	} while (snakeContains(food))
	
	lastFood = tick
}

function draw() {
	ctx.clearRect(0, 0, 400, 400)
	drawCells()
	drawFood()
	if (flash && ~~(Date.now() / 100) % 2 === 0) {
		return
	}
	drawSnake()
}

function drawCells() {
	for (var i = 0; i < cellsNo; ++i)
		for (var j = 0; j < cellsNo; ++j) 
			drawCell(i, j)
}

function drawFood() {
	if (food) {	
		ctx.fillStyle = '#4FC3F7'
		fillCell(food.x, food.y)
		ctx.fillStyle = '#fff'
	}
}

function drawCell(i, j) {
	ctx.strokeRect(
		i * cellSize, 
		j * cellSize, 
		cellSize, cellSize
	)
}

function drawSnake() {
	snake.forEach(
	 ({x, y}) => fillCell(x, y)
	)
}

function fillCell(x, y) {
	ctx.beginPath()
	ctx.rect(
		x * cellSize, 
		y * cellSize, 
		cellSize, cellSize
	)
	
	ctx.closePath()
	ctx.fill()
	ctx.stroke()
} 

function setScore(next) {
	score = next
	scoreVal.textContent = score
}

function startGame() {
	btnStart.textContent = 'restart'
	flash = false
	lastKeyPressed = null
	food = null
	setScore(0)
	direction = DIR.LEFT
	lastFood = lastUpdate = Date.now()
	paused = false
	setTimeout(putFood, 1000)
	const startX = cellsNo/2
	snake = [startX, startX+1, startX+2, startX+3].map(
		x => ({x, y: 15})
	)
}

function loop() {
	requestAnimationFrame(loop)
	draw()
	
	if (paused) return
	update()
}

requestAnimationFrame(loop)

btnStart.addEventListener('click', startGame)
btnPause.addEventListener('click', pause)

function pause() {
	paused = !paused
	btnPause.textContent = paused ? 'resume' : 'pause'
}

window.addEventListener('keydown', onKeyDown)
function onKeyDown({keyCode}) {
	switch (true) {
		case (keyCode === DIR.DOWN && direction === DIR.UP):
		case (keyCode === DIR.UP && direction === DIR.DOWN):	
		case (keyCode === DIR.LEFT && direction === DIR.RIGHT):
		case (keyCode === DIR.RIGHT && direction === DIR.LEFT):
			return 
	}
	
	lastKeyPressed = keyCode
}

function setDirection(keyCode) {
	direction = keyCode
}

function checkFood() {
	if (!food) return
	
	if (food.x >= cellsNo) {
		food.x = cellsNo -1
	}
	
	if (food.y >= cellsNo) {
		food.y = cellsNo -1
	}
}

class RangeSlider {
	constructor(el, cb) {
		this.input = el.querySelector('input')
		this.slider = el.querySelector('.range_inputSlider')
		this.value = el.querySelector('.range_inputValue')
		
		this.input.addEventListener('input', _ => this.onChange())
		this.input.addEventListener('keydown', e => {
			e.preventDefault()	
		})
		
		this.onChangeCallback = cb
		this.onChange()
	}
	
	onChange() {
		this.value.textContent = this.input.value
		this.slider.style.transform = `scaleX(${(this.input.value / this.input.step) / 10})`
		this.onChangeCallback(this.input.value)
	}
}


new RangeSlider(
	document.querySelector('.range-difficulty'), 
	value => difficulty = Number(value)
)
	
new RangeSlider(
	document.querySelector('.range-columns'),
	value => {
		cellsNo = Number(value)
		cellSize = 400 / cellsNo
		checkFood()
	}
)


// --- TOUCH CONTROLS
var isPointerDown, pointerStart, pointerPos

function onTouchStart(e) {
	const {clientX, clientY} = e.touches[0]
    isPointerDown = true
	pointerStart = {x: clientX, y: clientY}
	pointerPos = Object.assign({}, pointerStart)
}

function onTouchMove(e) {
	const {clientX, clientY} = e.touches[0]
    pointerPos = {x: clientX, y: clientY}
}

function onTouchEnd() {
	if (!isPointerDown) return
	isPointerDown = false
	
	const deltaX = pointerStart.x - pointerPos.x
	const deltaY = pointerStart.y - pointerPos.y
	const keyCode = touchToKeyCode(deltaX, deltaY)
	
	if (keyCode) onKeyDown({keyCode})
}
 
function touchToKeyCode(x, y) {
	if (Math.abs(x) > Math.abs(y)) {
		if (x < -1) {
			keyCode = DIR.RIGHT
		} else if (x > 1) {
			keyCode = DIR.LEFT
		} 
	} else {
		if (y < -1) {
			keyCode = DIR.DOWN
		} else if (y > 1) {
			keyCode = DIR.UP
		}
	}
	
	return keyCode
}


canvas.addEventListener('touchstart', onTouchStart)
window.addEventListener('touchmove', onTouchMove)
window.addEventListener('touchend', onTouchEnd)