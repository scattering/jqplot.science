(function($) {
    // inherit from LineRenderer
    $.jqplot.logLinRenderer = function(){
        $.jqplot.LineRenderer.call(this);
    };
    
    $.jqplot.logLinRenderer.prototype = new $.jqplot.LineRenderer();
    $.jqplot.logLinRenderer.prototype.constructor = $.jqplot.logLinRenderer;
    
    // called with scope of a series
    $.jqplot.logLinRenderer.prototype.init = function(options, plot) {
        // Group: Properties
        //
        $.jqplot.LineRenderer.prototype.init.call(this, options, plot);
        this.logLin = true;
    }
    
       
})(jQuery);
