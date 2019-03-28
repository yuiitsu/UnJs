/**
 *  Modal Component
 */
Component.extend('modal', function() {

    var self = this,
        id = '';

    this.bind = {
        show: function(params) {
            id = params.target;
            $(id).show();
        },
        close: function(params) {
            $('.modal-dialog').find('.close').on('click', function() {
                self.close();
            });
        },
        ok: function(params) {
            console.log(params);
            $('.modal-button-confirm').on('click', function() {
                if ($.isFunction(params.data.callback)) {
                    params.data.callback(self, 'ok');
                }
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };

    this.close = function() {
        $(id).remove();
    };
});