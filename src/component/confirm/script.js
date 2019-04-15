/**
 *  Confirm Component
 */
Component.extend('confirm', function() {

    var self = this,
        id = '';

    this.bind = {
        show: function(params) {
        },
        close: function(params) {
            $('.component-confirm-container').find('.close').on('click', function() {
                self.close();
            });
        },
        ok: function(params) {
            $('.confirm-button-confirm').on('click', function() {
                if ($.isFunction(params.callback)) {
                    params.callback(self, $(this));
                }
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function(params) {
        params['id'] = parseInt(Math.random() * 100000);
        id = '#confirm-' + params['id'];
        this.renderComponent('confirm.view', params).appendTo($('body'));
    };

    this.close = function() {
        $(id).remove();
    };

    this.el = function(key) {
        return $(id).find(key);
    }
});