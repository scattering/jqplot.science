(function($) {    
    
    function set_transform(transform, axis) {
        // axis is 'xaxis' or 'x2axis' or 'yaxis' etc.
        var axis = (axis == null) ? 'yaxis' : axis;
        var axis_table = {'x': 0, 'y': 1, 'z': 2};        
        if (!(axis[0] in axis_table)) { return }
        var ax = axis_table[axis[0]]; // based on first character of axis name
        this['_' + axis + '_transform'] = transform;
        if (ax == 2) { 
            // zaxis: pass this along to series renderers
            for (var i=0; i<this.series.length; i++) {
                var s = this.series[i];
                if (s.set_transform) { s.set_transform(transform); }
            }
        }
        else {
            // xaxis or yaxis, handle at plot level:
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
    }
    
    function handleTransform(a,b,c,d,e) {
        console.log(a,b,c,d,e);
        this.set_transform = set_transform;
    }
    $.jqplot.postParseOptionsHooks.push(handleTransform);
       
})(jQuery);
