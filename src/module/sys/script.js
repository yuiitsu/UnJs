/**
 * 系统管理
 */
Controller.extend('sys', function () {

    var self = this;
    //
    this.bind = {
        '.sys-control click': '_event.control'
    };

    /**
     * 系统维护
     */
    this.maintain = function() {
        this.output('maintain');
    };

    this._event = {
        control: function(e) {
            var target = self.$(e),
                module = target.attr('data-module'),
                method = target.attr('data-method'),
                systemId = target.attr('data-sys-id');

            self.callControl(module, method, {
                systemId: systemId
            });
        }
    };
});