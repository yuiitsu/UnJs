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
            message = params.message;

        if (target) {
            var parent = target.parent().parent();
            parent.find('.verify-error').remove();
            if (message) {
                target.addClass('error');
                target.parent().parent().append(this.getView('component.verification.tips.after_element', message));
            } else {
                target.removeClass('error');
            }
        } else {
            var form = $('#js-verify-form');
            form.find('.verify-error').remove();
            form.find('.js-form-control').removeClass('error');
        }
    };
});