/**
 * jqPlot
 * Pure JavaScript plotting plugin using jQuery
 *
 * Version: 1.0.0b1_r746
 *
 * Copyright (c) 2009-2011 Chris Leonello
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
 * sprintf functions contained in jqplot.sprintf.js by Ash Searle:
 *
 *     version 2007.04.27
 *     author Ash Searle
 *     http://hexmen.com/blog/2007/03/printf-sprintf/
 *     http://hexmen.com/js/sprintf.js
 *     The author (Ash Searle) has placed this code in the public domain:
 *     "This code is unrestricted: you are free to use it however you like."
 * 
 */

/**
 * Class: jqplot.GracefulAxisRenderer
 * Authors: Brian Maranville (and Paul Kienzle?)
 * 03/2013
 * this program was created as part of the regular duties of a US government
 * employee, and is in the public domain
 */ 
 
(function($) {
    // Class: $.jqplot.GracefulAxisRenderer
    // makes more nuanced tick location choices than LinearAxisRenderer
    $.jqplot.GracefulAxisRenderer = function() {
    };
    
    $.jqplot.GracefulAxisRenderer.prototype = new $.jqplot.LinearAxisRenderer();
    $.jqplot.GracefulAxisRenderer.prototype.constructor = $.jqplot.GracefulAxisRenderer
    
    $.jqplot.GracefulAxisRenderer.prototype.createTicks = function(plot) {
        // we're are operating on an axis here
        // called with axis as scope
        var width = plot.grid._width;
        var height = plot.grid._height;
        var name = this.name; // xaxis, x2axis, yaxis, y2axis...
        var fontSize;
        if (plot.options.axes[name].tickOptions && plot.options.axes[name].tickOptions.fontSize) {
            fontSize = plot.options.axes[name].tickOptions.fontSize;
        } else {
            fontSize = '10pt';
        }
        var db = this._dataBounds;
        var initial_min = 0.0;
        var initial_max = 0.0;
        if (this.min == null || this.max == null) {
            // will be true when first plotted       
            var range = Math.abs(db.max - db.min);
            if (range == 0.0) {
                range = Math.max(Math.abs(db.max), Math.abs(db.min));
                // take the value of the single point as the range
            }
            if (range == 0.0) { 
                // if min == max == 0, give the graph some arbitrary width.
                range = 1.0;
            }
            
            initial_min = db.min - range * 0.15; // 15% past databounds
            initial_max = db.max + range * 0.15; // make this an option?
        }
            
        var min = ((this.min != null) ? this.min : initial_min);
        var max = ((this.max != null) ? this.max : initial_max);
        var ytransform = plot._transform;
        var xtransform = 'lin'; //for now
        var transform = (name.slice(0,1) == 'x')? xtransform : ytransform;
        var ticks = generate_ticks({min: min, max: max}, transform, width, height, name, fontSize);
        this.ticks = ticks;
        $.jqplot.LinearAxisRenderer.prototype.createTicks.call(this, plot);
    }
    
    //$.jqplot.preDrawHooks.push($.jqplot.GracefulAxisRenderer.init);
    
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
    
})(jQuery);    
