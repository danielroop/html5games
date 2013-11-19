var GameConstants = {
    segmentWidth : 10,
    width : 45,
    height: 45
}

var GameUtils = {
    paintCell : function(x, y, color){
        var canvas = $("#canvas")[0];
        var ctx = canvas.getContext("2d");

        ctx.fillStyle = color;
        ctx.fillRect(x*GameConstants.segmentWidth, y*GameConstants.segmentWidth, GameConstants.segmentWidth, GameConstants.segmentWidth);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*GameConstants.segmentWidth, y*GameConstants.segmentWidth, GameConstants.segmentWidth, GameConstants.segmentWidth);
    },
    
    collides : function(a, b) {
        return a.x == b.x && a.y == b.y
    }
}

var Food = function(color) {
    this.color = color;
    this.x = 0;
    this.y = 0;
    
    this.draw = function() {
        GameUtils.paintCell(this.x, this.y, this.color);
    };
    
    this.move = function() {
        this.x = Math.floor(Math.random() * (GameConstants.width));
        this.y = Math.floor(Math.random() * (GameConstants.height));
    };
}


var Snake = function(length, color) {
    this.color = color;
    this.justAte = false;
    
    this.segments = [];
    for(var i = 0; i < length; i++) {
        this.segments.unshift({
            x : 0 + i,
            y : 0 + 0
        });
    }
        
    this.draw = function() {
        for (var i = 0; i < this.segments.length; i++) {
            GameUtils.paintCell(this.segments[i].x, this.segments[i].y, this.color);
        }
    };
    
    this.eat = function() {
        this.justAte = true;
    }
    
    this.move = function(direction) {
        var newSegment = {}
        if (!this.justAte) {
            newSegment = this.segments.pop();
        } else {
            this.justAte = false;
        }

        newSegment.x = this.head().x;
        newSegment.y = this.head().y;
        
        if (direction == "right") newSegment.x++
        else if (direction == "left") newSegment.x--
        else if (direction == "up") newSegment.y--
        else if (direction == "down") newSegment.y++
        
        this.segments.unshift(newSegment);
    };
    
    this.head = function() {
        return this.segments[0];
    }
    
};
