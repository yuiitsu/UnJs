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
            $('.modal-content').find('.close').on('click', function() {
                self.close();
            });
        },
        ok: function(params) {
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

    this.el = function(key) {
        return $(id).find(key);
    };

    this.$confirm = function() {
        return $(id).find('.modal-button-confirm');
    }
});