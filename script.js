//canvas elements
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext('2d');

//scoring elements with some UI elements as well
const scoreDisplay = document.querySelector('#scoreDisplay');
const highscoreDisplay = document.querySelector('#highscoreDisplay');
const scoreEl = document.querySelector('#scoreEl');
const highscoreEl = document.querySelector('#highscoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');
const bigHighScoreEl = document.querySelector('#bigHighScoreEl');
const textScoreEl = document.querySelector('#textScoreEl');
const gameovertxt = document.querySelector('#gameovertxt');
const newHighScoreText = document.querySelector('#newHighScoreText');

//level up and lives elements
var level, lvlMul = 1;
const mark = 100;

//UI elements
const title = document.querySelector('#title');
const instruction = document.querySelector('#instruction');
const instBtn = document.querySelector('#instBtn');
//const fullscreenBtn = document.querySelector('#fullscreenBtn');
//const muteBtn = document.querySelector('#muteBtn');
const MUTE = false;
const holder = document.querySelector('#holder');
const progress = document.querySelector('#progress');

//sound effects
var VOLUME = 1.0;
var projectileSound = new Sound('audio/Misc 02.mp3', 10, VOLUME);
var attackSound = new Sound('audio/Iceattack.mp3', 5, VOLUME);
var deadSound = new Sound('audio/Healing Full.mp3');

//music set up
var music = new Audio('audio/ballgamebgm.mp3');
music.addEventListener('ended', () => {
    this.currentTime = 0;
    this.play();
}, false); //music loop

class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile
{
    constructor(x, y, radius, color, velocity)
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw()
    {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill(); 
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy
{
    constructor(x, y, radius, color, velocity)
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.textScore = 250;
    }
    draw()
    {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();   
        c.closePath();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle
{
    constructor(x, y, radius, color, velocity)
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1
    }
    draw()
    {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();   
        c.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01
    }
}

const x = canvas.width/2;
const y = canvas.height/2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];
level = 1;

function init(){
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;   
    level = 1;
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 8) + 8;

        let x
        let y

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        
        lvlMul = level / ((level * 9) / 10) + Math.random();
        const color = 'hsl('+Math.random()*360+', 50%, 50%)'; //gives different color to the elements

        const angle = Math.atan2(
            canvas.height/2-y,
            canvas.width/2-x
        );
        
        const velocity = {
            x: Math.cos(angle) * lvlMul,
            y: Math.sin(angle) * lvlMul
        };
    
        enemies.push(new Enemy(x, y, radius, color, velocity));

    },1100);
}

let animationID;
let score = 0;
const SAVE_KEY_SCORE= "highscore"; //score key for local storage
var scoreHigh;
var scoreString = localStorage.getItem(SAVE_KEY_SCORE);
if(scoreString == null){
    scoreHigh = 100;
    highscoreEl.innerHTML = 100;
    bigHighScoreEl.innerHTML = 100;
}
else{
    scoreHigh = parseInt(scoreString);
    highscoreEl.innerHTML = parseInt(scoreString);
    bigHighScoreEl.innerHTML = parseInt(scoreString);
}

function animate(){
    animationID = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'; //the 0.1 argument gives the fading effect to the elements moving across the screen
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    level = parseInt(score / mark) + 1;

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1);
        }
        else{
            particle.update();
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();

        //remove from egdes of screen
        if(projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0)
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        //calculates the distance between the enemy and player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        
        //end game
        if(dist - enemy.radius - player.radius < 1){
            music.pause();
            deadSound.play();

            //create explosions of the player
            for(let i=0; i < player.radius * 4; i++){
                particles.push(new Particle(player.x, player.y, Math.random() * 2, player.color, {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
                }))                
            }
            player.color = 'black';

            setTimeout(() => {                
                cancelAnimationFrame(animationID);
                music.currentTime = 0;
                modalEl.style.display = 'flex';
                gameovertxt.style.display = 'block';
                bigScoreEl.style.display = 'block';
                textScoreEl.style.display = 'block';
                bigScoreEl.innerHTML = score;
                bigHighScoreEl.innerHTML = parseInt(localStorage.getItem(SAVE_KEY_SCORE));
                startGameBtn.innerHTML = "R e s t a r t";
                title.style.display = 'none';
                instruction.style.display = 'none';
                instBtn.style.display = 'block';
                scoreDisplay.style.display = 'none';
                highscoreDisplay.style.display = 'none';
                if(score == scoreHigh){
                    newHighScoreText.style.display = 'block';
                }

                var a;
                instBtn.addEventListener('click', () => {
                    if(a == 1){
                        gameovertxt.style.display = 'block';
                        bigScoreEl.style.display = 'block';
                        textScoreEl.style.display = 'block';
                        title.style.display = 'none';
                        instruction.style.display = 'none';
                        instBtn.innerHTML = "I n s t r u c t i o n s";
                        if(score == scoreHigh){
                            newHighScoreText.style.display = 'block';
                        }
                        return a = 0;
                    }
                    else{
                        gameovertxt.style.display = 'none';
                        newHighScoreText.style.display = 'none';
                        bigScoreEl.style.display = 'none';
                        textScoreEl.style.display = 'none';
                        title.style.display = 'block';
                        instruction.style.display = 'block';
                        instBtn.innerHTML = "H i d e\xa0\xa0I n s t r u c t i o n s";
                        return a = 1;
                    }
                })
            }, 500);
            
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            //projectiles touch enemy
            if(dist - enemy.radius - projectile.radius < 1){
                
                //create explosions
                for(let i=0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }

                if(enemy.radius - 12 > 8){
                    //increase our score
                    score += 10;
                    scoreEl.innerHTML = score;
                    if(score > scoreHigh) {
                        scoreHigh = score;
                        localStorage.removeItem(SAVE_KEY_SCORE);
                        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);                    
                    }
                    highscoreEl.innerHTML = scoreHigh;

                    //shrinking animation
                    gsap.to(enemy, {
                        radius: enemy.radius - 12
                    });

                    setTimeout(() => {
                        //add sound effects
                        attackSound.play();
                        music.volume = 0.5;
                        projectiles.splice(projectileIndex, 1);
                    },0);
                    music.volume = 1.0;
                }
                else{

                    //increase our score
                    score += 25;
                    scoreEl.innerHTML = score;
                    if(score > scoreHigh)
                    {
                        scoreHigh = score;
                        localStorage.removeItem(SAVE_KEY_SCORE);
                        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);                    
                    }
                    highscoreEl.innerHTML = scoreHigh;

                    //removes from scene altogether
                    setTimeout(() => {
                        //add sound effects
                        attackSound.play();
                        music.volume = 0.5;
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    },0);
                    music.volume = 1.0;
                }
            }
        })        
    });
}

function Sound(src, maxStreams = 1, vol = 1.0){
    this.volume = vol
    this.streamNum = 0;
    this.streams = [];
    for(var i = 0; i< maxStreams; i++) {
        this.streams.push(new Audio(src));
        this.streams[i].volume = vol;
    }

    this.play = function() {
        this.streamNum = (this.streamNum + 1) % maxStreams;
        this.streams[this.streamNum].play();
    }

    this.muted = function() {
        if(music.muted == true){
            this.streams[this.streamNum].muted = true;
        }
        else{
            this.streams[this.streamNum].muted = false;
        }
    }
}

//triggering the click event
canvas.addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY-canvas.height/2,
        event.clientX-canvas.width/2
        );
    const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
    };
    projectileSound.play();
    projectiles.push(new Projectile(canvas.width/2,canvas.height/2,5,'white',velocity));
});

//start button function
startGameBtn.addEventListener('click', () => {
    //removing and adding some elements
    modalEl.style.display = 'none';
    scoreDisplay.style.display = 'block';
    highscoreDisplay.style.display = 'block';

    //starting the game
    music.play();
    init();
    animate();
    spawnEnemies();

    //restarting
    if(startGameBtn.innerHTML == "R e s t a r t"){
        location.reload();
    }
})