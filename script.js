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
    ctx.lineWidth = 5;
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i + roadSpeed * 5);
        ctx.lineTo(canvas.width / 2, i + 20 + roadSpeed * 5);
        ctx.stroke();
    }

    // Lateral com árvores
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 100, canvas.height); // Esquerda
    ctx.fillRect(300, 0, 100, canvas.height); // Direita

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

// Iniciar o jogo
document.getElementById('startBtn').addEventListener('click', function() {
    this.style.display = 'none'; // Esconder o botão
    canvas.style.display = 'block';
    gameStarted = true;
    updateGame();
});

// Movimento do carro com setas
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft' && car.x > 100) {
        car.x -= car.speed;
    } else if (event.key === 'ArrowRight' && car.x < canvas.width - car.width - 100) {
        car.x += car.speed;
    } else if (event.key === ' ') {
        car.turbo = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === ' ') {
        car.turbo = false;
    }
});

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
