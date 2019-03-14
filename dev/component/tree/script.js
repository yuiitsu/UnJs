/**
 *  Tree Component
 */
Component.extend('tree', function() {

    var self = this;

    this.bind = {
        init: function(params) {
            var target = $('#' + params.id);
            self.callComponent({name: 'tooltip'}, {
                target: target,
                content: self.getView('component.tree.popup')
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});