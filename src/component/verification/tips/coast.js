/**
 *  Verify Tips Coast Component
 */
Component.extend('verification.toast', function() {

    var self = this;

    this.bind = {};

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function(params) {
        var target = params.target,
            name = params.name,
            message = params.message,
            body = name ? name + message : '对象未有名称，请先设置';

        if (message && $('.toast-container').length === 0) {
            this.renderComponent('toast.view', {
                title: '错误',
                body: body
            }).appendTo($('body'));
        }
    };
});