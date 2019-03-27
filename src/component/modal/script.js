/**
 *  Modal Component
 */
Component.extend('modal', function() {

    let self = this;

    this.bind = {
        show: function(params) {
            $(params.target).show();
        },
        close: function(params) {
            $('.modal-dialog').find('.close').on('click', function() {
                $(params.target).remove();
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
});