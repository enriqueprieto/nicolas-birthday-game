// Seleciona o canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameStarted = false;
let lineOffset = 0; // Variável para controlar o deslocamento das faixas
let treeOffset = 0; // Variável para controlar o deslocamento das árvores
let car = {
    x: canvas.width / 2 - 65 / 2, // Centraliza o carro
    y: canvas.height - 180,
    width: 65, // nova largura
    height: Math.round(65 * (161 / 80)), // altura proporcional
    speed: 10,
    img: new Image(),
    turbo: false,
    turboSpeed: 10,
    turboEffectImg: new Image() 
};
car.img.src = './car.png'; // Carro Mitsubishi amarelo
car.turboEffectImg.src = './rocket-fire.webp';

let roadSpeed = 5;
let frames = 0;
let obstacles = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

const obstacleImages = {
    cone: new Image(),
    bar: new Image(),
    wheels: new Image()
};
obstacleImages.cone.src = './obstacule-cone.png';
obstacleImages.bar.src = './obstacule-bar.png';
obstacleImages.wheels.src = './obstacule-wheels.png';

// Carregar imagem da pílula de turbo
const turboPillImage = new Image();
turboPillImage.src = './turbo-image.png';

// Configurações do canvas para responsividade
function resizeCanvas() {
    const sideLaneWidth = 75; // Largura fixa dos canteiros laterais
    const maxWidth = 400;
    const scaleFactor = Math.min(window.innerWidth / maxWidth, 1);
    
    canvas.width = maxWidth * scaleFactor;
    canvas.height = window.innerHeight;

    // Recalcular a posição e tamanho do carro
    car.width = 65; // nova largura
    car.height = Math.round(car.width * (161 / 80)); 
    car.x = canvas.width / 2 - car.width / 2;
    car.y = canvas.height - car.height - 20; // Posicionar o carro próximo ao fundo
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
const treeImage = new Image();
treeImage.src = './tree.png';
treeImage.onload = function() {
    console.log('Imagme pronta para desenhar');
}
// Desenhar a pista
// Desenhar as linhas divisórias da pista com o deslocamento
// Desenhar a pista
function drawBackground() {
    const sideLaneWidth = 75; // Largura dos canteiros laterais
    const roadWidth = canvas.width - sideLaneWidth * 2; // A pista ocupa o restante

    // Desenhar os canteiros verdes
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, sideLaneWidth, canvas.height); // Esquerda
    ctx.fillRect(canvas.width - sideLaneWidth, 0, sideLaneWidth, canvas.height); // Direita

    // Desenhar a pista
    ctx.fillStyle = '#808080';
    ctx.fillRect(sideLaneWidth, 0, roadWidth, canvas.height);

    // Linhas da pista
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;

    // Movimentar as faixas brancas
    for (let i = 0; i < canvas.height; i += 40) {
        const dashPos = (i + frames * roadSpeed) % canvas.height; // Posição das faixas ajustada
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, dashPos);
        ctx.lineTo(canvas.width / 2, dashPos + 20);
        ctx.stroke();
    }

    // Desenhar árvores como imagens
    const treeWidth = 50; // Largura fixa da árvore
    for (let i = 0; i < canvas.height; i += 150) {
        const treeHeight = 50; // Alterna entre 50px e 100px
        const treePos = (i + frames * roadSpeed) % canvas.height; // Posição ajustada das árvores

        // Árvore esquerda
        ctx.drawImage(treeImage, sideLaneWidth / 2 - treeWidth / 2, treePos, treeWidth, treeHeight);

        // Árvore direita
        ctx.drawImage(treeImage, canvas.width - sideLaneWidth / 2 - treeWidth / 2, treePos, treeWidth, treeHeight);
    }
}

// Desenhar o carro
function drawCar() {
    ctx.drawImage(car.img, car.x, car.y, car.width, car.height);

    // Efeito de turbo
    if (car.turbo) {
        ctx.drawImage(car.turboEffectImg, car.x, car.y + car.height, car.width, 40); // Ajuste a altura conforme necessário
    }
}

function createObstacle() {
    const obstacleTypes = [
        { img: obstacleImages.cone },
        { img: obstacleImages.bar },
        { img: obstacleImages.wheels }
    ];
    
    // Escolher um tipo de obstáculo aleatoriamente
    const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    let obstacle = {
        x: Math.random() * (canvas.width * 0.5) + canvas.width * 0.25,
        y: -100,
        width: 50,
        height: 50,
        points: 2,
        img: obstacleType.img
    };
    
    obstacles.push(obstacle);
}
// Desenhar obstáculos com diferentes tipos
function drawObstacles() {
    obstacles.forEach((obstacle, index) => {
        ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        obstacle.y += roadSpeed;

        // Remover obstáculos que saem da tela
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score += obstacle.points; // Aumenta a pontuação de acordo com o tipo de obstáculo
        }

        // Colisão com o carro
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
let turboPill = null; // Variável para armazenar a pílula de turbo
let turboActiveTime = 0; // Controla o tempo de turbo

function createTurboPill() {
    turboPill = {
        x: Math.random() * (canvas.width * 0.5) + canvas.width * 0.25,
        y: -50,
        width: 50,
        height: 50,
        img: turboPillImage
    };
}

// Desenhar a pílula de turbo
function drawTurboPill() {
    if (turboPill) {
        ctx.drawImage(turboPill.img, turboPill.x, turboPill.y, turboPill.width, turboPill.height);
        turboPill.y += roadSpeed;

        // Remover a pílula se sair da tela
        if (turboPill.y > canvas.height) {
            turboPill = null;
        }

        // Colisão com o carro (ativa o turbo)
        if (
            turboPill &&
            car.x < turboPill.x + turboPill.width &&
            car.x + car.width > turboPill.x &&
            car.y < turboPill.y + turboPill.height &&
            car.y + car.height > turboPill.y
        ) {
            car.turbo = true;
            turboActiveTime = frames; // Marca o tempo de ativação do turbo
            turboPill = null; // Remove a pílula após a coleta
        }
    }
}

// Atualizar o status do turbo
function updateTurbo() {
    if (car.turbo && frames - turboActiveTime > 300) { // Turbo dura 10 segundos (600 frames)
        car.turbo = false;
        roadSpeed = 5; // Retorna à velocidade normal
    }
}

// Atualizar o jogo
function updateGame() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpar canvas

    drawBackground();
    drawCar();
    drawObstacles();
    drawTurboPill();
    updateTurbo(); // Atualizar status do turbo

    frames += 1;
    roadSpeed += 0.005; // Aumentar a velocidade da pista gradualmente

    if (frames % 120 === 0) {
        createObstacle(); // Criar um obstáculo a cada 2 segundos
    }

    if (frames % 300 === 0 && !turboPill) {
        createTurboPill(); // Criar uma pílula de turbo a cada 5 segundos
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
    car.turbo = false;
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
    if (event.key === 'ArrowLeft' && car.x > canvas.width * 0.25) {
        car.x -= car.speed;
    } else if (event.key === 'ArrowRight' && car.x < canvas.width * 0.75 - car.width) {
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
    if (touchX < startX && car.x > canvas.width * 0.25) {
        car.x -= car.speed;
    } else if (touchX > startX && car.x < canvas.width * 0.75 - car.width) {
        car.x += car.speed;
    }
});
