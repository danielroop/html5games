var imageRepository = new function() {
    this.background = new Image();
    this.ship = new Image();
    this.bullet = new Image();
    this.enemy = new Image();
    this.enemyBullet = new Image();
    
    var numberOfImages = 5;
    var numberOfImagesLoaded = 0;
    
    function imageLoaded() {
        numberOfImagesLoaded++;
        
        if (numberOfImagesLoaded >= numberOfImages) {
            window.init();
        }
    }
    
    this.background.onload = function() {
        imageLoaded();
    };
    
    this.ship.onload = function() {
        imageLoaded();
    };
    
    this.bullet.onload = function() {
        imageLoaded();
    };
    
    this.enemy.onload = function() {
        imageLoaded();
    };
    
    this.enemyBullet.onload = function() {
        imageLoaded();
    };
    
    this.background.src = "img/bg.png";
    this.ship.src = "img/ship.png";
    this.bullet.src = "img/bullet.png";
    this.enemy.src = "img/enemyship.png";
    this.enemyBullet.src = "img/enemybullet.png";
}

function Drawlable() {
    this.init = function(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
    
    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    
    
    this.draw = function() {
        
    };
}

function Background() {
    this.speed = 1;
    
    
    this.draw = function() {
        this.y += this.speed;
        this.context.drawImage(imageRepository.background, this.x, this.y);
        
        // Draw another image at the top edge of the first image
        this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);
        
        
        if (this.y >= this.canvasHeight) {
            this.y = 0;
        }
    }
}

Background.prototype = new Drawlable();

function Game() {
    this.init = function() {
        this.bgCanvas = document.getElementById("background");
        this.shipCanvas = document.getElementById("ship");
        this.mainCanvas = document.getElementById("main");
        
        if (this.bgCanvas.getContext) {
            this.bgContext = this.bgCanvas.getContext("2d");
            this.shipContext = this.shipCanvas.getContext("2d");
            this.mainContext = this.mainCanvas.getContext("2d");
            
            Background.prototype.context = this.bgContext;
            Background.prototype.canvasHeight = this.bgCanvas.height;
            Background.prototype.canvasWidth = this.bgCanvas.width;
            
            Ship.prototype.context = this.shipContext;
            Ship.prototype.canvasHeight = this.shipCanvas.height;
            Ship.prototype.canvasWidth = this.shipCanvas.width;
            
            Bullet.prototype.context = this.mainContext;
            Bullet.prototype.canvasHeight = this.mainCanvas.height;
            Bullet.prototype.canvasWidth = this.mainCanvas.width;
            
            Enemy.prototype.context = this.mainContext;
            Enemy.prototype.canvasHeight = this.mainCanvas.height;
            Enemy.prototype.canvasWidth = this.mainCanvas.width;
            
            
            //Setup the Background
            this.background = new Background();
            this.background.init(0,0);

            //Setup the Ship
            this.ship = new Ship();
            var shipStartX = this.shipCanvas.width/2 - imageRepository.ship.width;
            var shipStartY = this.shipCanvas.height - imageRepository.ship.height;
            
            this.ship.init(shipStartX, shipStartY, imageRepository.ship.width, imageRepository.ship.height);
            
            //Setup the Enemies
            this.enemyPool = new Pool(30);
            this.enemyPool.init("enemy");
            
            var height = imageRepository.enemy.height;
            var width = imageRepository.enemy.width;
            var x = 100;
            var y = -height;
            var spacer = height * 1.5
            
            for (var i = 1; i < 19; i++) {
                this.enemyPool.get(x, y, 2);
                x += width + 25;
                
                if (i % 6 == 0) {
                    x = 100;
                    y += spacer;
                }
            }
            
            this.enemyBulletPool = new Pool(5);
            this.enemyBulletPool.init("enemyBullet");

            
            
            return true;
        } else {
            return false;
        }
    };
    
    this.start = function() {
        this.ship.draw();
        animate();
    };
}

function Pool(maxSize) {
    var size = maxSize;
    var pool = [];
    
    this.init = function(type) {
        if (type == "bullet") {
            for (var i = 0; i < size; i++) {
                var bullet = new Bullet(type);
                
                bullet.init(0,0,imageRepository.bullet.width, imageRepository.bullet.height);
                pool[i] = bullet;
            }
        } else if (type == "enemyBullet") {
            for (var i = 0; i < size; i++) {
                var enemyBullet = new Bullet(type);
                
                enemyBullet.init(0,0,imageRepository.enemyBullet.width, imageRepository.enemyBullet.height);
                pool[i] = enemyBullet;
            }
        } else if (type == "enemy") {
            for (var i = 0; i < size; i++) {
                var enemy = new Enemy(type);
                
                enemy.init(0,0,imageRepository.enemy.width, imageRepository.enemy.height);
                pool[i] = enemy;
            }
            
        }
    };
    
    this.get = function(x,y,speed) {
        if (!pool[size-1].alive) {
            pool[size-1].spawn(x,y,speed);
            pool.unshift(pool.pop());
        }
    };
    
    this.getTwo = function(x1,y1,speed1, x2,y2, speed2) {
        if (!pool[size-1].alive && !pool[size-2].alive) {
            this.get(x1,y1,speed1);
            this.get(x2,y2,speed2);
        }
    };
    
    this.animate = function() {
        for (var i = 0; i < size; i++) {
            if(pool[i].alive) {
                if (pool[i].draw()) {
                    pool[i].clear();
                    pool.push(pool.splice(i,1)[0]);
                }
            } else {
                break;
            }
        }
    };
}

function Bullet(type) {
    this.alive = false;
    this.type = type;
    
    this.spawn = function(x,y,speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };
    
    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        
        
        if (this.type == "bullet") {
            this.y -= this.speed;
            
            if (this.y <= 0 - this.height){
                return true;
            } else {
                this.context.drawImage(imageRepository.bullet, this.x, this.y);
            }    
        } else if (this.type == "enemyBullet") {
            this.y += this.speed;
            
            if (this.y > this.canvasHeight){
                return true;
            } else {
                this.context.drawImage(imageRepository.enemyBullet, this.x, this.y);
            }    
        }
    };
    
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    }
}

Bullet.prototype = new Drawlable();

function Ship() {
    this.speed = 3;
    this.bulletPool = new Pool(30);
    this.bulletPool.init("bullet");
    
    var fireRate = 15;
    var counter = 0;
    
    this.draw = function() {
        this.context.drawImage(imageRepository.ship, this.x, this.y);
    };
    
    this.move = function() {
        counter++;
        
        if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.up || KEY_STATUS.down) {
            this.context.clearRect(this.x, this.y, this.width, this.height);
            
            if (KEY_STATUS.left) {
                this.x -= this.speed;
                if (this.x < 0) this.x = 0;
            }
            
            if (KEY_STATUS.right) {
                this.x += this.speed;
                if (this.x >= this.canvasWidth - this.width) this.x = this.canvasWidth-this.width;
            }
            
            if (KEY_STATUS.up) {
                this.y -= this.speed;
                if (this.y < 0) this.y = 0;
            }
            
            if (KEY_STATUS.down) {
                this.y += this.speed;
                if (this.y >= this.canvasHeight - this.height) this.y = this.canvasHeight-this.height;
            }
        
            this.draw();
        }
        
        if (KEY_STATUS.space && counter >= fireRate) {
            this.fire();
            counter = 0;
        }
    }
    
    this.fire = function() {
        this.bulletPool.getTwo(this.x+16, this.y, 3, this.x+43, this.y, 3);
    }
}

Ship.prototype = new Drawlable();

function Enemy() {
    var precentFire = .01;
    var chance = 0;
    this.alive = false;
    
    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.speedX = 0;
        this.speedY = speed;
        this.alive = true;
        
        //This is creating a box in which each individual moves within, that is why it isn't the real edge of the screen.
        this.leftEdge = this.x - 90;
        this.rightEdge = this.x + this.width;
        this.bottomEdge = this.y + 100; 
    };
    
    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        this.x += this.speedX;
        this.y += this.speedY;
        
        
        
        if (this.x <= this.leftEdge) {
            this.speedX = this.speed;
        }
        
        if (this.x > this.rightEdge - this. width) {
            this.speedX = -this.speed;
        }
        
        if (this.y >= this.bottomEdge - this.height) {
            this.speed = 1.5;
            this.speedY = 0;
            this.speedX = -this.speed;
            this.y -= 5;
        }
        
        this.context.drawImage(imageRepository.enemy, this.x, this.y);
        
        chance = Math.floor(Math.random()*101);
        if (chance/100 < precentFire) {
            this.fire();
        }
    };
    
    this.fire = function() {
        var bulletX = this.x + (this.width / 2);
        var bulletY = this.y + this.height;
        
        game.enemyBulletPool.get(bulletX, bulletY, 2.5);
    };
    
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.leftEdge = 0;
        this.rightEdge = 0;
        this.bottomEdge = 0;
        this.alive = false;
        this.speed = 0;
        this.speedX = 0;
        this.speedY = 0;
    }
}

Enemy.prototype = new Drawlable();

function animate() {
    requestAnimFrame(animate);
    game.background.draw();
    game.ship.move();
    game.ship.bulletPool.animate();
    game.enemyPool.animate();
    game.enemyBulletPool.animate();
}

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame   ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
      };
})();


// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
var KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}
 
// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
var KEY_STATUS = {};
for (var code in KEY_CODES) {
  KEY_STATUS[ KEY_CODES[ code ]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}


/**
 * Initialize the Game and starts it.
 */
var game = new Game();
 
function init() {
  if(game.init())
    game.start();
}