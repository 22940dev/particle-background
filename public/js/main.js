(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    MIN_PARTICLE_DIAMETER: 30,
    MAX_PARTICLE_DIAMETER: 300,
    PARTICLE_DECELERATION: 0.92,
    FRAMES: 45,
    BASE_VELOCITY: 0.5,
};

},{}],2:[function(require,module,exports){
var CONSTANTS = require('./constants.js');
var particle = require('./particle');
var mouse = require('./mouse-event')();


var container = document.getElementById("container");
var width = container.offsetWidth;
var height = container.offsetHeight;
var canvas = document.createElement("CANVAS");
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);
canvas.setAttribute('style', 'position: absolute; background: -webkit-linear-gradient(left, #00BCD4,#9C27B0);');
container.appendChild(canvas);
var ctx = canvas.getContext("2d");
var particles = [];

for(var i = 0; i < 100; i++) {
    particles.push(particle(width, height));
}

setInterval(function(){
    ctx.clearRect(0, 0, width, height);
    for(var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        particle.update_opacity();
        particle.add_mouse_velocity(mouse.movement());
        particle.update_position();
        particle.draw(ctx);
    }
    mouse.update_cursor();

}, 1000 / CONSTANTS.FRAMES);

},{"./constants.js":1,"./mouse-event":3,"./particle":4}],3:[function(require,module,exports){
module.exports = function() {

    var cursorX = 0;
    var cursorY = 0;
    var previous_cursorX = 0;
    var previous_cursorY = 0;

    document.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    };

    function update_cursor() {
        previous_cursorX = cursorX;
        previous_cursorY = cursorY;
    }

    function movement() {
        return {
            x: previous_cursorX - cursorX,
            y: previous_cursorY - cursorY,
            pos_x: cursorX,
            pos_y: cursorY
        };
    }

    return {
        update_cursor: update_cursor,
        movement: movement
    };
};

},{}],4:[function(require,module,exports){
var CONSTANTS = require('./constants.js');

module.exports = function(width, height) {

    var opacity =  Math.random() / 5;
    var opacity_increase = (Math.random() + 0.5) < 1 ? true : false;
    var minMaxDiameterDifference = CONSTANTS.MAX_PARTICLE_DIAMETER - CONSTANTS.MIN_PARTICLE_DIAMETER;
    var size = CONSTANTS.MIN_PARTICLE_DIAMETER + (Math.random() * minMaxDiameterDifference);
    var areaWidth = CONSTANTS.MAX_PARTICLE_DIAMETER * 2 + width;
    var areaHeight = CONSTANTS.MAX_PARTICLE_DIAMETER * 2 + height;
    var pos_x = (Math.random() * areaWidth) - CONSTANTS.MAX_PARTICLE_DIAMETER;
    var pos_y = (Math.random() * areaHeight) - CONSTANTS.MAX_PARTICLE_DIAMETER;
    var vel_x = (Math.random() - 0.5) * CONSTANTS.BASE_VELOCITY;
    var vel_y = (Math.random() - 0.5) * CONSTANTS.BASE_VELOCITY;
    var mouse_vel_x = 0;
    var mouse_vel_y = 0;

    function update_opacity() {
        opacity = opacity_increase ? opacity + 0.0005 : opacity - 0.0005;
        if (opacity < 0)
            opacity_increase = true;
        if (opacity > 0.2)
            opacity_increase = false;
    }

    function update_position() {
        var new_pos_x = pos_x + vel_x + mouse_vel_x;
        var new_pos_y = pos_y + vel_y + mouse_vel_y;
        mouse_vel_x *= CONSTANTS.PARTICLE_DECELERATION;
        mouse_vel_y *= CONSTANTS.PARTICLE_DECELERATION;
        pos_x = new_pos_x;
        pos_y = new_pos_y;
        validate_position();
    }

    function add_mouse_velocity(coords) {
        mouse_vel_x += coords.x / 400 / 80 * (size * 2);
        mouse_vel_y += coords.y / 400 / 80 * (size * 2);
        if (circle_hit_detection(pos_x, pos_y, coords.x, coords.y, size)) {
            var new_vel_x = coords.pos_x - pos_x;
            var new_vel_y = coords.pos_y - pos_y;
            mouse_vel_x -= new_vel_x / 20;
            mouse_vel_y -= new_vel_y / 20;
        }
    }

    function circle_hit_detection(center_x, center_y, pos_x, pos_y, size) {
        var dis_x = center_x - pos_x;
        var dis_y = center_y - pos_y;
        var distance = Math.sqrt(dis_x * dis_x + dis_y * dis_y);
        if (distance < (size / 2))
            return true;
        else
            return false;
    }

    function square_hit_detection(center_x, center_y, pos_x, pos_y, size) {
        var min_x = center_x - (size / 2);
        var max_x = center_x + (size / 2);
        var min_y = center_y - (size / 2);
        var max_y = center_y + (size / 2);
        if (pos_x > min_x && pos_x < max_x && pos_y > min_y && pos_y < max_y)
            return true;
        else
            return false;
    }

    function validate_position() {
        if (pos_x < - CONSTANTS.MAX_PARTICLE_DIAMETER)
            pos_x = width + CONSTANTS.MAX_PARTICLE_DIAMETER;
        else if (pos_x > (width + CONSTANTS.MAX_PARTICLE_DIAMETER))
            pos_x = - CONSTANTS.MAX_PARTICLE_DIAMETER;
        else if (pos_y < - CONSTANTS.MAX_PARTICLE_DIAMETER)
            pos_y = height + CONSTANTS.MAX_PARTICLE_DIAMETER;
        else if (pos_y > (height + CONSTANTS.MAX_PARTICLE_DIAMETER))
            pos_t = - CONSTANTS.MAX_PARTICLE_DIAMETER;
    }

    function draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'hsla(0, 100%, 100%,'+ opacity +')';
        ctx.arc(pos_x,pos_y,size, 0, Math.PI * 2);
        ctx.fill();
    }

    return {
        opacity: opacity,
        pos_x: pos_x,
        pos_y: pos_y,
        size: size,
        update_opacity: update_opacity,
        update_position: update_position,
        add_mouse_velocity: add_mouse_velocity,
        draw: draw
    };
};

},{"./constants.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZWxsaW90dC9wcm9qZWN0cy9wYXJ0aWNsZS1iYWNrZ3JvdW5kL3NjcmlwdHMvY29uc3RhbnRzLmpzIiwiL1VzZXJzL2VsbGlvdHQvcHJvamVjdHMvcGFydGljbGUtYmFja2dyb3VuZC9zY3JpcHRzL21haW4uanMiLCIvVXNlcnMvZWxsaW90dC9wcm9qZWN0cy9wYXJ0aWNsZS1iYWNrZ3JvdW5kL3NjcmlwdHMvbW91c2UtZXZlbnQuanMiLCIvVXNlcnMvZWxsaW90dC9wcm9qZWN0cy9wYXJ0aWNsZS1iYWNrZ3JvdW5kL3NjcmlwdHMvcGFydGljbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IscUJBQXFCLEVBQUUsRUFBRTtJQUN6QixxQkFBcUIsRUFBRSxHQUFHO0lBQzFCLHFCQUFxQixFQUFFLElBQUk7SUFDM0IsTUFBTSxFQUFFLEVBQUU7SUFDVixhQUFhLEVBQUUsR0FBRztDQUNyQixDQUFDOzs7QUNORixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUMxQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDckMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7QUFDdkM7O0FBRUEsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyRCxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO0FBQ2xDLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7QUFDcEMsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztB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O1lBQ3ZELEtBQUssR0FBRyxFQUFFLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztBQUN0RCxLQUFLOztJQUVELFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNmLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsU0FBUyxHQUFHLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUM7UUFDcEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsS0FBSzs7SUFFRCxPQUFPO1FBQ0gsT0FBTyxFQUFFLE9BQU87UUFDaEIsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLEVBQUUsS0FBSztRQUNaLElBQUksRUFBRSxJQUFJO1FBQ1YsY0FBYyxFQUFFLGNBQWM7UUFDOUIsZUFBZSxFQUFFLGVBQWU7UUFDaEMsa0JBQWtCLEVBQUUsa0JBQWtCO1FBQ3RDLElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQztDQUNMLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTUlOX1BBUlRJQ0xFX0RJQU1FVEVSOiAzMCxcbiAgICBNQVhfUEFSVElDTEVfRElBTUVURVI6IDMwMCxcbiAgICBQQVJUSUNMRV9ERUNFTEVSQVRJT046IDAuOTIsXG4gICAgRlJBTUVTOiA0NSxcbiAgICBCQVNFX1ZFTE9DSVRZOiAwLjUsXG59O1xuIiwidmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzLmpzJyk7XG52YXIgcGFydGljbGUgPSByZXF1aXJlKCcuL3BhcnRpY2xlJyk7XG52YXIgbW91c2UgPSByZXF1aXJlKCcuL21vdXNlLWV2ZW50JykoKTtcblxuXG52YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250YWluZXJcIik7XG52YXIgd2lkdGggPSBjb250YWluZXIub2Zmc2V0V2lkdGg7XG52YXIgaGVpZ2h0ID0gY29udGFpbmVyLm9mZnNldEhlaWdodDtcbnZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiQ0FOVkFTXCIpO1xuY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB3aWR0aCk7XG5jYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xuY2FudmFzLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAncG9zaXRpb246IGFic29sdXRlOyBiYWNrZ3JvdW5kOiAtd2Via2l0LWxpbmVhci1ncmFkaWVudChsZWZ0LCAjMDBCQ0Q0LCM5QzI3QjApOycpO1xuY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XG52YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbnZhciBwYXJ0aWNsZXMgPSBbXTtcblxuZm9yKHZhciBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgcGFydGljbGVzLnB1c2gocGFydGljbGUod2lkdGgsIGhlaWdodCkpO1xufVxuXG5zZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHBhcnRpY2xlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGFydGljbGUgPSBwYXJ0aWNsZXNbaV07XG4gICAgICAgIHBhcnRpY2xlLnVwZGF0ZV9vcGFjaXR5KCk7XG4gICAgICAgIHBhcnRpY2xlLmFkZF9tb3VzZV92ZWxvY2l0eShtb3VzZS5tb3ZlbWVudCgpKTtcbiAgICAgICAgcGFydGljbGUudXBkYXRlX3Bvc2l0aW9uKCk7XG4gICAgICAgIHBhcnRpY2xlLmRyYXcoY3R4KTtcbiAgICB9XG4gICAgbW91c2UudXBkYXRlX2N1cnNvcigpO1xuXG59LCAxMDAwIC8gQ09OU1RBTlRTLkZSQU1FUyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGN1cnNvclggPSAwO1xuICAgIHZhciBjdXJzb3JZID0gMDtcbiAgICB2YXIgcHJldmlvdXNfY3Vyc29yWCA9IDA7XG4gICAgdmFyIHByZXZpb3VzX2N1cnNvclkgPSAwO1xuXG4gICAgZG9jdW1lbnQub25tb3VzZW1vdmUgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgY3Vyc29yWCA9IGUucGFnZVg7XG4gICAgICAgIGN1cnNvclkgPSBlLnBhZ2VZO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVfY3Vyc29yKCkge1xuICAgICAgICBwcmV2aW91c19jdXJzb3JYID0gY3Vyc29yWDtcbiAgICAgICAgcHJldmlvdXNfY3Vyc29yWSA9IGN1cnNvclk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW92ZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwcmV2aW91c19jdXJzb3JYIC0gY3Vyc29yWCxcbiAgICAgICAgICAgIHk6IHByZXZpb3VzX2N1cnNvclkgLSBjdXJzb3JZLFxuICAgICAgICAgICAgcG9zX3g6IGN1cnNvclgsXG4gICAgICAgICAgICBwb3NfeTogY3Vyc29yWVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHVwZGF0ZV9jdXJzb3I6IHVwZGF0ZV9jdXJzb3IsXG4gICAgICAgIG1vdmVtZW50OiBtb3ZlbWVudFxuICAgIH07XG59O1xuIiwidmFyIENPTlNUQU5UUyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuXG4gICAgdmFyIG9wYWNpdHkgPSAgTWF0aC5yYW5kb20oKSAvIDU7XG4gICAgdmFyIG9wYWNpdHlfaW5jcmVhc2UgPSAoTWF0aC5yYW5kb20oKSArIDAuNSkgPCAxID8gdHJ1ZSA6IGZhbHNlO1xuICAgIHZhciBtaW5NYXhEaWFtZXRlckRpZmZlcmVuY2UgPSBDT05TVEFOVFMuTUFYX1BBUlRJQ0xFX0RJQU1FVEVSIC0gQ09OU1RBTlRTLk1JTl9QQVJUSUNMRV9ESUFNRVRFUjtcbiAgICB2YXIgc2l6ZSA9IENPTlNUQU5UUy5NSU5fUEFSVElDTEVfRElBTUVURVIgKyAoTWF0aC5yYW5kb20oKSAqIG1pbk1heERpYW1ldGVyRGlmZmVyZW5jZSk7XG4gICAgdmFyIGFyZWFXaWR0aCA9IENPTlNUQU5UUy5NQVhfUEFSVElDTEVfRElBTUVURVIgKiAyICsgd2lkdGg7XG4gICAgdmFyIGFyZWFIZWlnaHQgPSBDT05TVEFOVFMuTUFYX1BBUlRJQ0xFX0RJQU1FVEVSICogMiArIGhlaWdodDtcbiAgICB2YXIgcG9zX3ggPSAoTWF0aC5yYW5kb20oKSAqIGFyZWFXaWR0aCkgLSBDT05TVEFOVFMuTUFYX1BBUlRJQ0xFX0RJQU1FVEVSO1xuICAgIHZhciBwb3NfeSA9IChNYXRoLnJhbmRvbSgpICogYXJlYUhlaWdodCkgLSBDT05TVEFOVFMuTUFYX1BBUlRJQ0xFX0RJQU1FVEVSO1xuICAgIHZhciB2ZWxfeCA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIENPTlNUQU5UUy5CQVNFX1ZFTE9DSVRZO1xuICAgIHZhciB2ZWxfeSA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIENPTlNUQU5UUy5CQVNFX1ZFTE9DSVRZO1xuICAgIHZhciBtb3VzZV92ZWxfeCA9IDA7XG4gICAgdmFyIG1vdXNlX3ZlbF95ID0gMDtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZV9vcGFjaXR5KCkge1xuICAgICAgICBvcGFjaXR5ID0gb3BhY2l0eV9pbmNyZWFzZSA/IG9wYWNpdHkgKyAwLjAwMDUgOiBvcGFjaXR5IC0gMC4wMDA1O1xuICAgICAgICBpZiAob3BhY2l0eSA8IDApXG4gICAgICAgICAgICBvcGFjaXR5X2luY3JlYXNlID0gdHJ1ZTtcbiAgICAgICAgaWYgKG9wYWNpdHkgPiAwLjIpXG4gICAgICAgICAgICBvcGFjaXR5X2luY3JlYXNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlX3Bvc2l0aW9uKCkge1xuICAgICAgICB2YXIgbmV3X3Bvc194ID0gcG9zX3ggKyB2ZWxfeCArIG1vdXNlX3ZlbF94O1xuICAgICAgICB2YXIgbmV3X3Bvc195ID0gcG9zX3kgKyB2ZWxfeSArIG1vdXNlX3ZlbF95O1xuICAgICAgICBtb3VzZV92ZWxfeCAqPSBDT05TVEFOVFMuUEFSVElDTEVfREVDRUxFUkFUSU9OO1xuICAgICAgICBtb3VzZV92ZWxfeSAqPSBDT05TVEFOVFMuUEFSVElDTEVfREVDRUxFUkFUSU9OO1xuICAgICAgICBwb3NfeCA9IG5ld19wb3NfeDtcbiAgICAgICAgcG9zX3kgPSBuZXdfcG9zX3k7XG4gICAgICAgIHZhbGlkYXRlX3Bvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkX21vdXNlX3ZlbG9jaXR5KGNvb3Jkcykge1xuICAgICAgICBtb3VzZV92ZWxfeCArPSBjb29yZHMueCAvIDQwMCAvIDgwICogKHNpemUgKiAyKTtcbiAgICAgICAgbW91c2VfdmVsX3kgKz0gY29vcmRzLnkgLyA0MDAgLyA4MCAqIChzaXplICogMik7XG4gICAgICAgIGlmIChjaXJjbGVfaGl0X2RldGVjdGlvbihwb3NfeCwgcG9zX3ksIGNvb3Jkcy54LCBjb29yZHMueSwgc2l6ZSkpIHtcbiAgICAgICAgICAgIHZhciBuZXdfdmVsX3ggPSBjb29yZHMucG9zX3ggLSBwb3NfeDtcbiAgICAgICAgICAgIHZhciBuZXdfdmVsX3kgPSBjb29yZHMucG9zX3kgLSBwb3NfeTtcbiAgICAgICAgICAgIG1vdXNlX3ZlbF94IC09IG5ld192ZWxfeCAvIDIwO1xuICAgICAgICAgICAgbW91c2VfdmVsX3kgLT0gbmV3X3ZlbF95IC8gMjA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaXJjbGVfaGl0X2RldGVjdGlvbihjZW50ZXJfeCwgY2VudGVyX3ksIHBvc194LCBwb3NfeSwgc2l6ZSkge1xuICAgICAgICB2YXIgZGlzX3ggPSBjZW50ZXJfeCAtIHBvc194O1xuICAgICAgICB2YXIgZGlzX3kgPSBjZW50ZXJfeSAtIHBvc195O1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZGlzX3ggKiBkaXNfeCArIGRpc195ICogZGlzX3kpO1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCAoc2l6ZSAvIDIpKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzcXVhcmVfaGl0X2RldGVjdGlvbihjZW50ZXJfeCwgY2VudGVyX3ksIHBvc194LCBwb3NfeSwgc2l6ZSkge1xuICAgICAgICB2YXIgbWluX3ggPSBjZW50ZXJfeCAtIChzaXplIC8gMik7XG4gICAgICAgIHZhciBtYXhfeCA9IGNlbnRlcl94ICsgKHNpemUgLyAyKTtcbiAgICAgICAgdmFyIG1pbl95ID0gY2VudGVyX3kgLSAoc2l6ZSAvIDIpO1xuICAgICAgICB2YXIgbWF4X3kgPSBjZW50ZXJfeSArIChzaXplIC8gMik7XG4gICAgICAgIGlmIChwb3NfeCA+IG1pbl94ICYmIHBvc194IDwgbWF4X3ggJiYgcG9zX3kgPiBtaW5feSAmJiBwb3NfeSA8IG1heF95KVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZV9wb3NpdGlvbigpIHtcbiAgICAgICAgaWYgKHBvc194IDwgLSBDT05TVEFOVFMuTUFYX1BBUlRJQ0xFX0RJQU1FVEVSKVxuICAgICAgICAgICAgcG9zX3ggPSB3aWR0aCArIENPTlNUQU5UUy5NQVhfUEFSVElDTEVfRElBTUVURVI7XG4gICAgICAgIGVsc2UgaWYgKHBvc194ID4gKHdpZHRoICsgQ09OU1RBTlRTLk1BWF9QQVJUSUNMRV9ESUFNRVRFUikpXG4gICAgICAgICAgICBwb3NfeCA9IC0gQ09OU1RBTlRTLk1BWF9QQVJUSUNMRV9ESUFNRVRFUjtcbiAgICAgICAgZWxzZSBpZiAocG9zX3kgPCAtIENPTlNUQU5UUy5NQVhfUEFSVElDTEVfRElBTUVURVIpXG4gICAgICAgICAgICBwb3NfeSA9IGhlaWdodCArIENPTlNUQU5UUy5NQVhfUEFSVElDTEVfRElBTUVURVI7XG4gICAgICAgIGVsc2UgaWYgKHBvc195ID4gKGhlaWdodCArIENPTlNUQU5UUy5NQVhfUEFSVElDTEVfRElBTUVURVIpKVxuICAgICAgICAgICAgcG9zX3QgPSAtIENPTlNUQU5UUy5NQVhfUEFSVElDTEVfRElBTUVURVI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhdyhjdHgpIHtcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2hzbGEoMCwgMTAwJSwgMTAwJSwnKyBvcGFjaXR5ICsnKSc7XG4gICAgICAgIGN0eC5hcmMocG9zX3gscG9zX3ksc2l6ZSwgMCwgTWF0aC5QSSAqIDIpO1xuICAgICAgICBjdHguZmlsbCgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgIHBvc194OiBwb3NfeCxcbiAgICAgICAgcG9zX3k6IHBvc195LFxuICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICB1cGRhdGVfb3BhY2l0eTogdXBkYXRlX29wYWNpdHksXG4gICAgICAgIHVwZGF0ZV9wb3NpdGlvbjogdXBkYXRlX3Bvc2l0aW9uLFxuICAgICAgICBhZGRfbW91c2VfdmVsb2NpdHk6IGFkZF9tb3VzZV92ZWxvY2l0eSxcbiAgICAgICAgZHJhdzogZHJhd1xuICAgIH07XG59O1xuIl19
