/*$.Cow.ConnectWidget = {
init: function(){
var widget = $('#connect');
var cow = $('#cow').data('cow');
cow.events.bind('connected',{}, this._onConnect);
},
_onConnect: function() {
}
}
*/
(function($) {
$.widget("cow.ConnectWidget", {
	options: {
        // The cow.core instance
        core: undefined
    },
 _create: function() {
        var core;
        var self = this;
        var element = this.element;

        //get the mapquery object
        core = $(this.options.core).data('cow');

     

        core.bind("ws-connected", {widget: self}, self._onConnect);
        core.bind("ws-disconnected", {widget: self}, self._onDisConnect);
		element.find('.bar-content').prepend('<span id="statusicon" class="down">&nbsp;</span>');
		$('#myname').on('change', function(e, ui) {
            core.username($(this).val());
            toggleRight();
        });
		
    },
    _destroy: function() {
        this.element.removeClass('ui-dialog ui-widget ui-widget-content ' +
                                 'ui-corner-all')
            .empty();
    },
	_onConnect: function(evt) {
		var self = evt.data.widget;
        var element = self.element;
		element.find('#statusicon').addClass('up').removeClass('down');
		
		
	},
	_onDisConnect: function(evt) {
		var self = evt.data.widget;
        var element = self.element;
		element.find('#statusicon').addClass('down').removeClass('up');
		
	}
	});
})(jQuery);