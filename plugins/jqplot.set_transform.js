(function($) {    
    
    function transformData(transform, axis) {
        // axis is 'xaxis' or 'x2axis' or 'yaxis' etc.
        var axis = (axis == null) ? 'yaxis' : axis;
        var axis_table = {'x': 0, 'y': 1, 'z': 2};        
        if (!(axis[0] in axis_table)) { return }
        var ax = axis_table[axis[0]]; // based on first character of axis name
        var axupper = axis[0] + 'upper';
        var axlower = axis[0] + 'lower'; // for error bars
        this['_' + axis + '_transform'] = transform;
        if (ax == 2) { 
            // zaxis: do nothing
            /*
            for (var i=0; i<this.series.length; i++) {
                var s = this.series[i];
                if (s.set_transform) { s.set_transform(transform, axis); }
            }
            */
        }
        else {
            // xaxis or yaxis, handle at plot level:
            var s, pd, sd;
            for (var i=0; i<this.series.length; i++) {
                s = this.series[i];
                if (s._data == null || s._data.length != s.data.length) {
                    s._data = $.extend(true, [], s.data);
                }
                pd = s.data;
                sd = s._data;
                if (transform == 'log') {
                    for (var j=0; j<pd.length; j++) {
                        pd[j][ax] = sd[j][ax]>0 ? Math.log(sd[j][ax]) / Math.LN10 : null;
                        if (pd[j].length > 2) {
                            pd[j][2][axupper] = sd[j][2][axupper]>0 ? Math.log(sd[j][2][axupper]) / Math.LN10 : null;
                            pd[j][2][axlower] = sd[j][2][axlower]>0 ? Math.log(sd[j][2][axlower]) / Math.LN10 : null;
                        }
                    }
                    
                } 
                else { 
                    // linear
                    for (var j=0; j<pd.length; j++) {
                        pd[j][ax] = sd[j][ax];
                        if (pd[j].length > 2) {
                            pd[j][2][axupper] = sd[j][2][axupper];
                            pd[j][2][axlower] = sd[j][2][axlower];
                        }
                    }
                }
            }
            this.axes[axis].resetScale();
        }
    }
    
    function optTransform() {
        var options = this.options;
        if (options.transform) {
            for (axis in options.transform) {
                transformData.call(this, options.transform[axis], axis); 
            }
        } 
    }

    $.jqplot.postParseOptionsHooks.push(optTransform);
    
    function annotateLabel(transform, axis) {
        // axis is 'xaxis' or 'x2axis' or 'yaxis' etc.
        var axis = (axis == null) ? 'yaxis' : axis;
        var axis_table = {'x': 0, 'y': 1, 'z': 2};        
        if (!(axis[0] in axis_table)) { return }
        var ax = axis_table[axis[0]]; // based on first character of axis name
        if (ax < 2) { // x or y
            var axislabel;
            if (transform == 'log') {
                axislabel = "log₁₀" + (this.options.axes[axis].label || "");
            } 
            else {
                axislabel = this.options.axes[axis].label || "";
            }
            this.axes[axis].labelOptions.label = axislabel;            
        }
    }
    
    
    function updateTransformLabels() {
        var options = this.options;
        if (options.transform) {
            for (axis in options.transform) {
                annotateLabel.call(this, options.transform[axis], axis); 
            }
        }
    }
    
    $.jqplot.preDrawHooks.push(updateTransformLabels);
       
})(jQuery);
