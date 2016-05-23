/**
 * 组件
 * 对话框-确认
 */

var confirm = function(unjs, object, data) {

    var self = this;

    this.init = function(callback) {

        var _html = View.dialog.confirm(data);
        $('body').append(_html).css('overflow', 'hidden');

        // 监听确认
        $('#wm_dialog_button_confirm').click(function() {

            self.remove();
            if ($.isFunction(callback)) {

                callback(true);
            }
        });

        // 监听取消
        $('#wm_dialog_button_cancel').click(function() {
            self.remove();
            if ($.isFunction(callback)) {

                callback(false);
            }
        });
    };

    this.remove = function() {
        $('#wm_dialog').remove();
        $('body').css('overflow', 'auto');
    };

    return this;
};

unjs.Component.confirm = confirm;
