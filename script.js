// Seleciona o canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let gameStarted = false;
let car = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 120,
    width: 100,
    height: 100,
    speed: 10,
    img: new Image(),
    turbo: false,
    turboSpeed: 15
};
car.img.src = './car.png'; // Carro Mitsubishi amarelo

let roadSpeed = 5;
let frames = 0;
let obstacles = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Desenhar a pista
function drawBackground() {
    ctx.fillStyle = '#808080';
    ctx.fillRect(100, 0, 200, canvas.height);

    // Linhas da pista
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i + roadSpeed * 5);
        ctx.lineTo(canvas.width / 2, i + 20 + roadSpeed * 5);
        ctx.stroke();
    }

    // Lateral com árvores
    ctx.fillStyle = 'green';
    const asideSize = 50;
    ctx.fillRect(0, 0, asideSize, canvas.height); // Esquerda
    ctx.fillRect(100, 0, asideSize, canvas.height); // Direita

    // Desenhar árvores
    ctx.fillStyle = '#654321';
    for (let i = 0; i < canvas.height; i += 150) {
        ctx.fillRect(40, i + roadSpeed * 5, 20, 50); // Árvore esquerda
        ctx.fillRect(340, i + roadSpeed * 5, 20, 50); // Árvore direita
    }
}

// Desenhar o carro
function drawCar() {
    ctx.drawImage(car.img, car.x, car.y, car.width, car.height);

    // Efeito de turbo
    if (car.turbo) {
        ctx.fillStyle = 'orange';
        ctx.fillRect(car.x + car.width / 2 - 10, car.y + car.height, 20, 40);
    }
}

// Função para criar obstáculos
function createObstacle() {
    let obstacle = {
        x: Math.random() * 200 + 100,
        y: -100,
        width: 50,
        height: 100,
        color: 'red'
    };
    obstacles.push(obstacle);
}

// Desenhar obstáculos
function drawObstacles() {
    obstacles.forEach((obstacle, index) => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        obstacle.y += roadSpeed;

        // Remover obstáculos que saem da tela
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
        }

        // Colisão
        if (
            car.x < obstacle.x + obstacle.width &&
            car.x + car.width > obstacle.x &&
            car.y < obstacle.y + obstacle.height &&
            car.y + car.height > obstacle.y
        ) {
            gameOver();
        }
    });
}

// Atualizar o jogo
function updateGame() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpar canvas

    drawBackground();
    drawCar();
    drawObstacles();

    frames += 1;
    roadSpeed += 0.005; // Aumentar a velocidade da pista gradualmente

    if (frames % 120 === 0) {
        createObstacle(); // Criar um obstáculo a cada 2 segundos
    }

    // Atualizar pontuação
    document.getElementById('score').textContent = `Pontuação: ${score}`;
    
    // Super velocidade
    if (car.turbo) {
        roadSpeed = car.turboSpeed;
    } else {
        roadSpeed = 5 + frames / 1000; // Velocidade normal
    }

    requestAnimationFrame(updateGame); // Loop do jogo
}

// Função de Game Over
function gameOver() {
    alert('Game Over! Sua pontuação foi: ' + score);
    
    // Salvar a pontuação mais alta
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        alert('Parabéns! Você bateu o recorde com ' + highScore + ' pontos.');
    }

    resetGame();
}

// Reiniciar o jogo
function resetGame() {
    obstacles = [];
    score = 0;
    frames = 0;
    roadSpeed = 5;
    car.x = canvas.width / 2 - car.width / 2;
    gameStarted = false;
    document.getElementById('startBtn').style.display = 'block'; // Mostrar o botão de novo
}

const uiConfig = {
    asideSize: 50
};

const elementsMap = {
    appScreen: '.app-screen',
    initialPage: '.app__initial',
    gamePage: '.app__game',
    endPage: '.app__end',
    startButton: 'startBtn',
    canvas: 'gameCanvas'
};

class App {
    constructor() {
        this.screen = document.querySelector(elementsMap.appScreen);
        const rect = this.screen.getBoundingClientRect();
        this.device = {
            width: rect.width,
            height: rect.height
        };
        this.uiConfig = uiConfig;
        this.canvas = document.getElementById(elementsMap.canvas);
        this.startButton = document.getElementById(elementsMap.startButton);
        this.initialPage = document.querySelector(elementsMap.initialPage);
        this.gamePage = document.querySelector(elementsMap.gamePage);
        this.endPage = document.querySelector(elementsMap.endPage);

        this.gameStarted = false;
        this.roadSpeed = 5;
        this.startX = 0;

        this.setupCanvas();
        this.setupContext();
        this.setupCar();
        this.addListeners();
    }

    setupCar(){
        const car = {
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height - 161,
            width: 80,
            height: 161,
            speed: 10,
            img: new Image(),
            turbo: false,
            turboSpeed: 15
        };
        car.img.src = './car.png'; 

        this.car = car;
    }
    setupCanvas(){
        if (!this.canvas) return;

        this.canvas.width = this.device.width;
        this.canvas.height = this.device.height;
    }
    setupContext() {
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
    }

    addListeners() {
        this.startButton.addEventListener('click', this.onStartButtonClick.bind(this));
        document.addEventListener('keydown', this.onDocumentKeyDown.bind(this));
        document.addEventListener('keyup', this.onDocumentoKeyUp.bind(this));
        this.canvas.addEventListener('touchstart', this.onCanvasTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.onCanvasTouchMove.bind(this));
    }

    onCanvasTouchStart(event) {
        this.startX = event.touches[0].clientX;
    }
    onCanvasTouchMove(event) {
        let touchX = event.touches[0].clientX;
        if (touchX < startX && car.x > 100) {
            this.car.x -= this.car.speed;
        } else if (touchX > startX && car.x < this.canvas.width - this.car.width - 100) {
            this.car.x += this.car.speed;
        }
    }

    onDocumentoKeyUp(event) {
        if (event.key === ' ') {
            this.car.turbo = false;
        }
    }

    onDocumentKeyDown(event) {
        if (event.key === 'ArrowLeft' && this.car.x > 100) {
            this.car.x -= this.car.speed;
        } else if (event.key === 'ArrowRight' && this.car.x < this.canvas.width - this.car.width - 100) {
            this.car.x += this.car.speed;
        } else if (event.key === 'Enter') {
            this.car.turbo = true;
        }
    }

    onStartButtonClick() {
        if (
            !this.initialPage ||
            !this.gamePage
        ) return;

        this.initialPage.setAttribute('aria-hidden', 'true');
        this.gamePage.setAttribute('aria-hidden', 'false');

        this.gameStarted = true;

        this.updateGame();
    }

    updateGame() {
        if (!this.gameStarted) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawCar();

        requestAnimationFrame(this.updateGame.bind(this));
    }

    drawBackground() {
        this.ctx.fillStyle = '#808080';
        const offset = this.canvas.width * 0.1;
        const asideSizeTotal = this.uiConfig.asideSize * 2;
        const drivewayWidth = this.canvas.width - asideSizeTotal;
        this.ctx.fillRect(this.uiConfig.asideSize, 0, drivewayWidth, this.canvas.height);
    
        // Linhas da pista
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 5;
        for (let i = 0; i < this.canvas.height; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, i + this.roadSpeed * 5);
            this.ctx.lineTo(this.canvas.width / 2, i + 20 + this.roadSpeed * 5);
            this.ctx.stroke();
        }
    
        // Lateral com árvores
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(0, 0, this.uiConfig.asideSize, this.canvas.height); // Esquerda
        this.ctx.fillRect(this.uiConfig.asideSize+drivewayWidth, 0, this.uiConfig.asideSize, this.canvas.height); // Direita
    
        // Desenhar árvores
        this.ctx.fillStyle = '#654321';
        for (let i = 0; i < this.canvas.height; i += 150) {
            this.ctx.fillRect(((this.uiConfig.asideSize/2) - 10), i + this.roadSpeed * 5, 20, 50); // Árvore esquerda 100 - 20 = 80
            this.ctx.fillRect(((this.canvas.width - (this.uiConfig.asideSize/2)) - 10), i + this.roadSpeed * 5, 20, 50); // Árvore direita
        }
    }

    drawCar() {
        this.ctx.drawImage(this.car.img, this.car.x, this.car.y, this.car.width, this.car.height);
    
        // Efeito de turbo
        if (this.car.turbo) {
            this.ctx.fillStyle = 'orange';
            this.ctx.fillRect(this.car.x + this.car.width / 2 - 10, this.car.y + this.car.height, 20, 40);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const app = new App();
})


// Controle por gestos (mobile)
let startX = 0;
canvas.addEventListener('touchstart', function(event) {
    startX = event.touches[0].clientX;
});

canvas.addEventListener('touchmove', function(event) {
    let touchX = event.touches[0].clientX;
    if (touchX < startX && car.x > 100) {
        car.x -= car.speed;
    } else if (touchX > startX && car.x < canvas.width - car.width - 100) {
        car.x += car.speed;
    }
});
