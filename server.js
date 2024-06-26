document.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");

	let gameState = "menu";
	let score = 0;
	let highScore = 0;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const numberImages = [];

	for (let i = 0; i <= 9; i++) {
		const numberImage = new Image();
		numberImage.src = `public/numbers/${i}.png`;
		numberImages.push(numberImage);
	}

	function drawNumber(number, x, y) {
		const digits = number.toString().split("");
		let offsetX = 0;
		for (let digit of digits) {
			ctx.drawImage(numberImages[parseInt(digit)], x + offsetX, y);
			offsetX += 30;
		}
	}

	const startButton = {
		x: canvas.width / 2 - 184 / 2,
		y: canvas.height / 2 - 267 / 2,
		width: 184,
		height: 267,
	};

	canvas.addEventListener("click", (event) => {
		const rect = canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		if (gameState === "menu") {
			if (
				mouseX >= startButton.x &&
				mouseY >= startButton.y &&
				mouseX <= startButton.x + startButton.width &&
				mouseY <= startButton.y + startButton.height
			) {
				gameState = "play";
				resetGame();
			}
		} else if (gameState === "gameOver") {
			if (
				mouseX >= gameOverButton.x &&
				mouseY >= gameOverButton.y &&
				mouseX <= gameOverButton.x + gameOverButton.width &&
				mouseY <= gameOverButton.y + gameOverButton.height
			) {
				gameState = "menu";
			}
		}
	});

	function resetGame() {
		bird.y = 150;
		bird.dy = 0;
		pipes = [];
		frames = 0;
		score = 0;
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "Alt" || event.key === "Tab") {
			return;
		}

		if (gameState === "menu" || gameState === "gameOver") {
			gameState = "play";
			resetGame();
		}

		bird.dy = -2.5;
		wing.play();
	});

	const startImage = new Image();
	startImage.src = "public/message.png";

	function drawStartScreen() {
		ctx.drawImage(
			startImage,
			startButton.x,
			startButton.y,
			startButton.width,
			startButton.height
		);
	}

	const gameOverImage = new Image();
	gameOverImage.src = "public/gameover.png";

	const gameOverButton = {
		x: canvas.width / 2 - 192 / 2,
		y: canvas.height / 2 - 142 / 2,
		width: 192,
		height: 42,
	};

	function drawGameOverScreen() {
		ctx.drawImage(
			gameOverImage,
			gameOverButton.x,
			gameOverButton.y,
			gameOverButton.width,
			gameOverButton.height
		);
	}

	const pipeWidth = 90;
	const pipeGap = 190;

	let pipes = [];

	function generatePipe() {
		let topPipeHeight = Math.random() * (canvas.height / 2);
		let bottomPipeHeight = canvas.height - topPipeHeight - pipeGap;

		pipes.push({
			x: canvas.width,
			top: {
				height: topPipeHeight,
			},
			bottom: {
				height: bottomPipeHeight,
			},
		});
	}

	const pipeImage = new Image();
	pipeImage.src = "public/pipe-green.png";

	function drawPipe(pipe) {
		ctx.save();
		ctx.translate(0, pipe.top.height);
		ctx.scale(1, -1);
		ctx.drawImage(pipeImage, pipe.x, 0, pipeWidth, pipe.top.height);
		ctx.restore();

		let bottomY = pipe.top.height + pipeGap;
		ctx.drawImage(pipeImage, pipe.x, bottomY, pipeWidth, pipe.bottom.height);
	}

	function drawPipes() {
		for (let pipe of pipes) {
			drawPipe(pipe);
		}
	}

	const deathSound = new Audio("public/sounds/oof.mp3");
	const pointSound = new Audio("public/sounds/point.wav");

	function updatePipes() {
		if (gameState === "play") {
			for (let pipe of pipes) {
				pipe.x -= 2;

				if (checkCollision(pipe)) {
					gameState = "gameOver";
					deathSound.play();
				}

				if (bird.x > pipe.x + pipeWidth && !pipe.passed) {
					pipe.passed = true;
					score++;
					pointSound.play();

					if (score > highScore) {
						highScore = score;
					}
				}
			}

			pipes = pipes.filter((pipe) => pipe.x + pipeWidth > 0);
		}
	}

	const birdImageTop = new Image();
	birdImageTop.src = "public/yellowbird-upflap.png";

	const birdImageMid = new Image();
	birdImageMid.src = "public/yellowbird-midflap.png";

	const birdImageBottom = new Image();
	birdImageBottom.src = "public/yellowbird-downflap.png";

	const bird = {
		x: 150,
		y: 150,
		width: 60,
		height: 50,
		dy: 0,
	};

	const birdImages = [birdImageTop, birdImageMid, birdImageBottom];
	let birdImageIndex = 0;

	let birdRotationDelay = 20;

	function drawBird() {
		ctx.save();
		ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
		if (bird.dy < 0) {
			ctx.rotate(-0.5);
			birdRotationDelay = 30;
		} else if (birdRotationDelay <= 0) {
			ctx.rotate(0.9);
		} else {
			birdRotationDelay--;
		}
		ctx.drawImage(
			birdImages[birdImageIndex],
			-bird.width / 2,
			-bird.height / 2,
			bird.width,
			bird.height
		);
		ctx.restore();
		if (frames % 10 === 0) {
			birdImageIndex = (birdImageIndex + 1) % birdImages.length;
		}
	}

	const wing = new Audio("public/sounds/wing.wav");

	function updateBird() {
		if (gameState === "play") {
			bird.y += bird.dy;
			bird.dy += 0.07;

			if (bird.y + bird.height >= canvas.height - baseImage.height) {
				gameState = "gameOver";
				deathSound.play();
			}
		}
	}

	function checkCollision(pipe) {
		if (bird.y <= pipe.top.height) {
			if (bird.x + bird.width >= pipe.x && bird.x <= pipe.x + pipeWidth) {
				return true;
			}
		}

		let bottomY = pipe.top.height + pipeGap;
		if (bird.y + bird.height >= bottomY) {
			if (bird.x + bird.width >= pipe.x && bird.x <= pipe.x + pipeWidth) {
				return true;
			}
		}

		return false;
	}

	function drawScore() {
		const scoreX = canvas.width / 2 - 100;
		const y = 50;
		drawNumber(score, scoreX, y);

		if (gameState === "gameOver") {
			const highScoreX = canvas.width / 2 + 100;
			drawNumber(highScore, highScoreX, y);
		}
	}

	const baseImage = new Image();
	baseImage.src = "public/base.png";

	let baseX = 0;

	function drawBase() {
		for (let i = 0; i <= canvas.width / baseImage.width + 400; i++) {
			ctx.drawImage(
				baseImage,
				baseX + i * baseImage.width,
				canvas.height - baseImage.height
			);
		}
	}

	function updateBase() {
		if (gameState === "play") {
			baseX -= 3;
			if (baseX <= -baseImage.width) {
				baseX = 0;
			}
		}
	}

	function gameLoop() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (gameState === "menu") {
			drawStartScreen();
		} else {
			drawPipes();
			drawBird();
			drawBase();
			drawScore();

			if (gameState === "play") {
				updatePipes();
				updateBird();
				updateBase();

				if (frames % 240 === 0) {
					generatePipe();
				}

				frames++;
			} else if (gameState === "gameOver") {
				drawGameOverScreen();
			}
		}

		requestAnimationFrame(gameLoop);
	}

	let frames = 0;

	gameLoop();
});
