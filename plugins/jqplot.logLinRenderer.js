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
        this.set_transform = transformData;
    }
    
    function transformData(transform, axis) {
        // axis is 'xaxis' or 'x2axis' or 'yaxis' etc.
        var axis = (axis == null) ? 'yaxis' : axis;
        var axis_table = {'x': 0, 'y': 1};        
        if (!(axis[0] in axis_table)) { throw "can only transform x or y axis" }
        var ax = axis_table[axis[0]]; // based on first character of axis name
        this['_' + axis + '_transform'] = transform;
        if (transform == 'log') {
            for (var i=0; i<this.series.length; i++) {
                var pd = this.series[i]._plotData;
                //var sd = this.series[i].data;
                var d = this.data[i];
                for (var j=0; j<pd.length; j++) {
                    pd[j][ax] = d[j][ax]>0 ? Math.log(d[j][ax]) / Math.LN10 : null;
                }
            }
            this.axes[axis].resetScale();
            this.axes[axis].labelOptions.label = "log₁₀" + (this.options.axes[axis].label || "");
            this.replot();
        } else { // transform == 'lin'
            for (var i=0; i<this.series.length; i++) {
                var pd = this.series[i]._plotData;
                //var sd = this.series[i].data;
                var d = this.data[i];
                for (var j=0; j<pd.length; j++) {
                    pd[j][ax] = d[j][ax];
                    //sd[j][1] = d[j][1];
                }
            }
            this.axes[axis].resetScale();
            this.axes[axis].labelOptions.label = this.options.axes[axis].label || "";
            this.replot();
        }
    }
    
       
})(jQuery);
