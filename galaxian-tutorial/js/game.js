var imageRepository = new function() {
    this.background = new Image();
    this.ship = new Image();
    this.bullet = new Image();
    
    var numberOfImages = 3;
    var numberOfImagesLoaded = 0;
    
    function imageLoaded() {
        numberOfImagesLoaded++;
        
        if (numberOfImagesLoaded >= numberOfImages) {
            window.init();
        }
    }
    
    this.background.onload = function() {
        imageLoaded();
    }
    
    this.ship.onload = function() {
        imageLoaded();
    }
    
    this.bullet.onload = function() {
        imageLoaded();
    }
    
    this.background.src = "img/bg.png"
    this.ship.src = "img/ship.png"
    this.bullet.src = "img/bullet.png"
    
    
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
            
            this.background = new Background();
            this.background.init(0,0);
            
            this.ship = new Ship();
            var shipStartX = this.shipCanvas.width/2 - imageRepository.ship.width;
            var shipStartY = this.shipCanvas.height - imageRepository.ship.height;
            
            this.ship.init(shipStartX, shipStartY, imageRepository.ship.width, imageRepository.ship.height);
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
    
    this.init = function() {
        for (var i = 0; i < size; i++) {
            var bullet = new Bullet();
            console.log(imageRepository.bullet.width + " :: " +  imageRepository.bullet.height)
            
            bullet.init(0,0,imageRepository.bullet.width, imageRepository.bullet.height);
            pool[i] = bullet;
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

function Bullet() {
    this.alive = false;
    
    this.spawn = function(x,y,speed) {
        console.log(x + " :: " + y);
        
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };
    
    this.draw = function() {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        this.y -= this.speed;
        
        if (this.y <= 0 - this.height){
            return true;
        } else {
            this.context.drawImage(imageRepository.bullet, this.x, this.y);
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
    this.bulletPool.init();
    
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



function animate() {
    requestAnimFrame(animate);
    game.background.draw();
    game.ship.move();
    game.ship.bulletPool.animate();
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