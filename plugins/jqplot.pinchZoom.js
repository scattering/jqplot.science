/**
 * jqplot.jquerymobile plugin
 * jQuery Mobile virtual event support.
 *
 * Version: @VERSION
 * Revision: @REVISION
 *
 * Copyright (c) 2011 Takashi Okamoto
 * jqPlot is currently available for use in all personal or commercial projects 
 * under both the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL 
 * version 2.0 (http://www.gnu.org/licenses/gpl-2.0.html) licenses. This means that you can 
 * choose the license that best suits your project and use it accordingly. 
 *
 * Although not required, the author would appreciate an email letting him 
 * know of any substantial use of jqPlot.  You can reach the author at: 
 * chris at jqplot dot com or see http://www.jqplot.com/info.php .
 *
 * If you are feeling kind and generous, consider supporting the project by
 * making a donation at: http://www.jqplot.com/donate.php .
 *
 */
(function($) {
    function bestLinearInterval(range) {
        var expv = Math.floor(Math.log(range)/Math.LN10);
        var magnitude = Math.pow(10, expv);
        var f = range / magnitude;

        if (f<=1.6) {return 0.2*magnitude;}
        if (f<=4.0) {return 0.5*magnitude;}
        if (f<=8.0) {return magnitude;}
        return 2*magnitude; 
    };
    
    function generateLinearTicks(min, max) {
        var ticks = [];
        var tickInterval = bestLinearInterval(max-min);
        var expv = Math.floor(Math.log(tickInterval)/Math.LN10);
        var magnitude = Math.pow(10, expv);

        ticks.push([min, ' ']);
        var tick = min - mod(min, tickInterval) + tickInterval;
        while (tick < max) {
            if (Math.abs(tick) < 1e-13) tick = 0;
            var sigdigits = Math.ceil(Math.log(Math.abs(tick)/magnitude)/Math.LN10) - 1;
            var numdigits = Math.floor(Math.log(Math.abs(tick))/Math.LN10) + 1;
            if (sigdigits > 20) sigdigits = 20;
            if (sigdigits < 0) sigdigits = 0;
            if (numdigits < 4 && numdigits >= -2) {
                var fixeddigits;
                if (sigdigits < numdigits) { fixeddigits = 0; }
                else { fixeddigits = sigdigits - numdigits + 1; }
                ticks.push([tick, tick.toFixed(fixeddigits)]);
            } else {
                ticks.push([tick, tick.toExponential(sigdigits)]);
            }
            tick += tickInterval;
        }
        ticks.push([max,' ']);
        return ticks
    };
    
    function nextLogTick(val, round) {
        // finds the next log tick above the current value,
        // using 1, 2, 5, 10, 20, ... scaling
        var expv = Math.floor(Math.log(val)/Math.LN10);
        //var expv = Math.floor(val);
        var magnitude = Math.pow(10, expv);
        var f = val / magnitude;
        if (round) f = Math.round(f);
        
        var newf;
        if      (f<1.0) { newf = 1 }
        else if (f<2.0) { newf = 2 }
        else if (f<5.0) { newf = 5 }
        else if (f<10.0) { newf = 10 }
        else { newf = 20 };
        return {value: newf * magnitude, label: newf.toFixed() + 'e' + expv.toFixed()}
        
//        if (f<2.0) {return 2.0*magnitude;}
//        if (f<5.0) {return 5.0*magnitude;}
//        if (f<10.) {return 10.0*magnitude;}
//        return 20*magnitude; 
    };
    
    function prevLogTick(val) {
        // finds the next log tick above the current value,
        // using 1, 2, 5, 10, 20, ... scaling
        var expv = Math.floor(Math.log(val)/Math.LN10);
        //var expv = Math.floor(val);
        var magnitude = Math.pow(10, expv);
        var f = val / magnitude;

        if (f>10.0) {return 10.0*magnitude;}
        if (f>5.0) {return 5.0*magnitude;}
        if (f>2.0) {return 2.0*magnitude;}
        if (f>1.0) {return 1.0*magnitude;}
        return 0.5*magnitude;
    };
    
    function mod(a,b) {
        return a % b < 0 ? b + a % b : a % b
    };
    
    function generate12510ticks(min, max) {
        var ticks = [];
        ticks.push([min, ' ']); // ticks are positioned with log
        var tick = nextLogTick(Math.pow(10, min), false);
        //console.log(tick);
        //var tickpos = tick.value;
        var tickpos = Math.log(tick.value)/Math.LN10;
        var i = 0;
        while( tickpos < max && i < 100 ) {
            
            ticks.push([tickpos, tick.label]);
            tick = nextLogTick(tick.value, true);
            tickpos = Math.log(tick.value)/Math.LN10;
            i++;
        }
        ticks.push([max, ' ']);
        if (ticks.length < 4) {
            var newticks = generateLinearTicks(Math.pow(10, min), Math.pow(10, max));
            newticks[0] = [min, ' '];
            for (var i=1; i<(newticks.length-1); i++) {
                newticks[i][0] = Math.log(newticks[i][0])/Math.LN10;
            }
            newticks[newticks.length-1] = [max, ' '];
            ticks = newticks;
        }
        return ticks
    };
    
    
    function generateMagTicks(min, max, magdiff) {
        var ticks = [];
        ticks.push([min, ' ']); // ticks are positioned with log
        var tick = Math.pow(10, Math.ceil(min/magdiff) * magdiff);
        var tickpos = Math.round(Math.log(tick)/Math.LN10);
        var i = 0;
        while( tickpos < max && i < 100 ) {
            ticks.push([tickpos, '1e'+tickpos.toFixed()]);
            //tick *= Math.pow(10, magdiff);
            tickpos = Math.round(tickpos + magdiff);
            i++;
        }
        ticks.push([max, ' ']);
        return ticks
    };
    
    
    function generate_ticks(ticklimits, transform) {
        var transform = transform || 'lin';
        var min = ticklimits.min,
            max = ticklimits.max;
        var ticks = [];
        if (transform == 'lin') {
            ticks = generateLinearTicks(min, max);
        } 
        else if (transform == 'log') {
            var scalespan = max - min;
            if (scalespan >= 3) { 
                var magdiff = Math.ceil((scalespan / 5)); // more than five, divide by two.
                ticks = generateMagTicks(min, max, magdiff); 
            } else { ticks = generate12510ticks(min, max); }
        } 
        else {
            // unknown transform - return max and min
            ticks.push(min);
            ticks.push(max);
        }
        return ticks; 
    };
    
    
    var initializePinchZoom = function(plot) {
         var getCoords = function(pos) {
            // have to correct for the fact that jqplot p2u calculates
            // in terms of pixels with respect to outer (containing) canvas
            // not the actual graph canvas...
            var xpixel = pos.x + plot.eventCanvas._ctx.canvas.offsetLeft;
            var ypixel = pos.y + plot.eventCanvas._ctx.canvas.offsetTop;
            var coords = { x: plot.series[0]._xaxis.p2u(xpixel),
                           y: plot.series[0]._yaxis.p2u(ypixel) }
            return coords
        }
        
        var putCoords = function(coords) {
            var pos = {};
            if ('x' in coords) {
                pos.x = plot.series[0]._xaxis.u2p(coords.x);
                pos.x -= plot.eventCanvas._ctx.canvas.offsetLeft;
            }
            if ('y' in coords) {
                pos.y = plot.series[0]._yaxis.u2p(coords.y);
                pos.y -= plot.eventCanvas._ctx.canvas.offsetTop;
            }
            return pos     
        }
        
        var center, dist;
        
        var panPlot = function(prevpos, pos) {
            var newcoords = getCoords(pos);
            var prevcoords = getCoords(prevpos);
            var xtransf = plot.series[0]._xaxis.transform || 'lin';
            var ytransf = plot.series[0]._yaxis.transform || 'lin';
            
            var dx = newcoords.x - prevcoords.x;
            var dy = newcoords.y - prevcoords.y;

            var xmin = plot.series[0]._xaxis.min - dx;
            var xmax = plot.series[0]._xaxis.max - dx;
            var ymin = plot.series[0]._yaxis.min - dy;
            var ymax = plot.series[0]._yaxis.max - dy;

            var xticks = generate_ticks({min:xmin, max:xmax}, xtransf);
            var yticks = generate_ticks({min:ymin, max:ymax}, ytransf);
            $('#pan').html(JSON.stringify([xticks, yticks, plot._drawCount], 3));
            plot.series[0]._xaxis.ticks = xticks;
            plot.series[0]._yaxis.ticks = yticks;
            plot.redraw();
        }
    
        var handleTwoTouchStart = function(ev) {
            //alert('to touch');
            var oev = ev.originalEvent;
            if (oev.touches.length != 2) { return }
            oev.preventDefault();
            oev.stopPropagation();
            touchdown = [true, true];
            var t1 = oev.touches[0];
            var t2 = oev.touches[1];
            center = {
                x: ((t1.pageX + t2.pageX) / 2.0), 
                y: ((t1.pageY + t2.pageY) / 2.0)};
            plot.plugins.pinchZoom.center = center;
            plot.plugins.pinchZoom.touchmoves = 0;
            dist = {x: t1.pageX - t2.pageX, y: t1.pageY - t2.pageY}
            document.getElementById('start').innerHTML = "center: " + JSON.stringify(center);
            document.getElementById('start').innerHTML += " dist: " + JSON.stringify(dist);
            document.getElementById('start').innerHTML += " offsetTop: " + JSON.stringify(plot.eventCanvas._ctx.canvas.offsetTop);
            document.getElementById('start').innerHTML += " coords: " + JSON.stringify(getCoords(center));            
            
        }
        
        var handleTwoTouchLeave = function(ev) {
            var move = document.getElementById('move');
            move.innerHTML += 'leave' ;
            move.innerHTML += String(Object.keys(ev));
        
        }
        
        function copyTouch(touch) {
            return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
        }
        
        var handleTouchUp = function(ev) {
            var oev = ev.originalEvent;
        }
        
        var handleTwoTouchMove = function(ev) {
            var oev = ev.originalEvent;
            //if (oev.touches.length != 2) { return }
            oev.preventDefault();
            oev.stopPropagation();
            //var t1 = oev.targetTouches[0];
            //var t2 = oev.targetTouches[1];
            var t1 = oev.touches[0];
            var t2 = oev.touches[1];
            var old_center = plot.plugins.pinchZoom.center;
            var new_center = {x: ((t1.pageX + t2.pageX) / 2.0), y: ((t1.pageY + t2.pageY) / 2.0)};
            var new_dist = {x: t1.pageX - t2.pageX, y: t1.pageY - t2.pageY}
            var dcenter = {x: new_center.x - old_center.x, y: new_center.y - old_center.y};
            var ddist = {x: new_dist.x - dist.x, y: new_dist.y - dist.y}
            var move = document.getElementById('move');
            move.innerHTML = "new_center: " + JSON.stringify(new_center);
            move.innerHTML += "center: " + JSON.stringify(dcenter);
            move.innerHTML += " dist: " + JSON.stringify(ddist);
            move.innerHTML += "<br>" + t1.target.id;
            move.innerHTML += "<br>" + t2.target.id;
            move.innerHTML += "<br>" + (plot.plugins.pinchZoom.touchmoves++).toString();
            //plot.plugins.pinchZoom.touches = oev.touches;
            panPlot(old_center, new_center);
            
        }
        
        $(plot.eventCanvas._ctx.canvas).on("touchstart", handleTwoTouchStart);
        //plot.eventCanvas._ctx.canvas.ontouchstart = handleTwoTouchStart;
        //$(plot.eventCanvas._ctx.canvas).on("touchmove", handleTwoTouchMove);
        //$(plot.target).off("touchmove");
        if (!(plot.plugins.pinchZoom.handlersInitialized)) {
            $(plot.target).on("touchmove", handleTwoTouchMove);
            plot.plugins.pinchZoom.handlersInitialized = true;
        }
        $(plot.eventCanvas._ctx.canvas).on("touchleave", handleTwoTouchLeave);
        //$(plot.eventCanvas._ctx.canvas).on("touchend", function() {alert("all good things..."); });
        if (plot.plugins.pinchZoom.touches) {
          try{
            var evt = document.createEvent('TouchEvent');
            evt.initUIEvent('touchstart', true, true);

            evt.view = window;
            evt.altKey = false;
            evt.ctrlKey = false;
            evt.shiftKey = false;
            evt.metaKey = false;
            evt.touches = plot.plugins.pinchZoom.touches

            plot.eventCanvas._ctx.canvas.dispatchEvent(evt);
            $("#pan").html("dispatching touch events");
          }
          catch (ex) {
            alert(ex);
          }
        }
    }
    
    function postDraw() {
        initializePinchZoom(this);
    }
    
    function postInit() {
        this.plugins.pinchZoom = {};
    }
    $.jqplot.postDrawHooks.push(postDraw);
    $.jqplot.postInitHooks.push(postInit);
    
})(jQuery);
