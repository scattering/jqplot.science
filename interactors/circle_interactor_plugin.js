// #############################################
// # Interactors as jqplot plugins             #
// # Brian Maranville                          #
// # 10/14/2011                                #
// #############################################

// ## requires interactors.js
// ## and interactor_plugin_base.js

(function($) {
    
    $.jqplot.CircleInteractorPlugin = function() {
        $.jqplot.InteractorPlugin.call(this);
    };
    $.jqplot.CircleInteractorPlugin.prototype = new $.jqplot.InteractorPlugin;
    $.jqplot.CircleInteractorPlugin.prototype.constructor = $.jqplot.CircleInteractorPlugin;
    $.jqplot.InteractorPluginSubtypes.Circle = $.jqplot.CircleInteractorPlugin;
    
    $.jqplot.CircleInteractorPlugin.prototype.init = function(options) {
        $.jqplot.InteractorPlugin.prototype.init.call(this, options);
        this.filled = true;
        this.center_x = 0;
        this.center_y = 0;
        this.r_x = 10;
        this.r_y = 0;
        this.width = 4;
        $.extend(true, this, options);
        this.p1 = new $.jqplot.PluginPoint(); this.p1.initialize(this, this.r_x, this.r_y);
        this.c = new $.jqplot.PluginCenter(); this.c.initialize(this, this.center_x, this.center_y);
        this.circle = new $.jqplot.Circle(); this.circle.initialize(this, this.c, this.p1, this.width, this.filled);
        this.circle.connectortranslatable = this.filled;
        
        this.grobs.push(this.circle, this.p1, this.c);
        
        var me = this;

        this.p1.move = function(dp) {
            var dpos = {x: dp.x || 0, y: dp.y || 0 };
            this.translateBy(dpos);
        };
        
    };
    
    $.jqplot.AnnulusInteractorPlugin = function() {
        $.jqplot.InteractorPlugin.call(this);
    };
    $.jqplot.AnnulusInteractorPlugin.prototype = new $.jqplot.InteractorPlugin;
    $.jqplot.AnnulusInteractorPlugin.prototype.constructor = $.jqplot.AnnulusInteractorPlugin;
    $.jqplot.InteractorPluginSubtypes.Annulus = $.jqplot.AnnulusInteractorPlugin;
    
    $.jqplot.AnnulusInteractorPlugin.prototype.init = function(options) {
        $.jqplot.InteractorPlugin.prototype.init.call(this, options);
        this.filled = true;
        this.center_x = 0;
        this.center_y = 0;
        this.r1_x = 10;
        this.r1_y = 0;
        this.r2_x = 20;
        this.r2_y = 0;
        this.width = 4;
        this.show_pos = true;
        $.extend(true, this, options);
        this.p1 = new $.jqplot.PluginPoint(); this.p1.initialize(this, this.r1_x, this.r1_y); this.p1.show_pos=this.show_pos;
        this.p2 = new $.jqplot.PluginPoint(); this.p2.initialize(this, this.r2_x, this.r2_y); this.p2.show_pos=this.show_pos;
        this.c = new $.jqplot.PluginCenter(); this.c.initialize(this, this.center_x, this.center_y); this.c.show_pos = this.show_pos;
        this.circle1 = new $.jqplot.Circle(); this.circle1.initialize(this, this.c, this.p1, this.width, this.filled);
        this.circle2 = new $.jqplot.Circle(); this.circle2.initialize(this, this.c, this.p2, this.width, this.filled);
        this.circle1.connectortranslatable = false;
        this.circle2.connectortranslatable = false;
        
        this.grobs.push(this.circle1, this.circle2, this.p1, this.p2, this.c);
        
        var me = this;

        this.p1.move = function(dp) {
            var dpos = {x: dp.x || 0, y: dp.y || 0 };
            this.translateBy(dpos);
        };
        this.p2.move = function(dp) {
            var dpos = {x: dp.x || 0, y: dp.y || 0 };
            this.translateBy(dpos);
        };
        
    };
    
})(jQuery);
