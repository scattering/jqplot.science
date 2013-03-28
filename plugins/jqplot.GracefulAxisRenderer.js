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
 * Author: Brian Maranville and Paul Kienzle
 * 03/2013
 * this program was created as part of the regular duties of a US government
 * employee, and is in the public domain
 */ 
 
(function($) {
    // Class: $.jqplot.GracefulAxisRenderer
    // makes more nuanced tick location choices than LinearAxisRenderer
    $.jqplot.GracefulAxisRenderer = function() {
    };
    
    $.jqplot.GracefulAxisRenderer.prototype = new LinearAxisRenderer();
    $.jqplot.GracefulAxisRenderer.prototype.constructor = $.jqplot.GracefulAxisRenderer
    
    $.jqplot.GracefulAxisRenderer.prototype.createTicks = function(plot) {
        // we're are operating on an axis here
        // called with axis as scope
        var ticks = generate_ticks({min: this.min, max: this.max});
        this.ticks = ticks;
        return $.jqplot.LinearAxisRenderer.prototype.call(this, plot);
    }
    
    $.jqplot.preDrawHooks.push($.jqplot.GracefulAxisRenderer.init);
    
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
