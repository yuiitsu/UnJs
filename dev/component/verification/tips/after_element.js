/**
 *  Verify Tips AfterElement Component
 */
Component.extend('verification.afterElement', function() {

    var self = this;

    this.bind = {};

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function(params) {
        var target = params.target,
            message = params.message,
            parent = target.parent().parent();

        parent.find('.verify-error').remove();
        if (message) {
            target.parent().parent().append(this.getView('component.verification.tips.after_element', message));
        }
    };
});