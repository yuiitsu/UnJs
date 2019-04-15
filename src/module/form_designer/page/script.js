/**
 * Form Designer Page
 */
Controller.extend('form_designer.page', function () {
    var self = this;

    this.bind = {
        '.form-designer-control click': '_event.control',

    };

    this.index = function() {
        this.output('view', {});
    };

    this._event = {
        control: function(e) {
            var target = self.$(e),
                module = target.attr('data-module'),
                systemId = target.attr('data-sys-id');

            self.callControl(module, 'index', {
                systemId: systemId
            });
        }
    };
});
