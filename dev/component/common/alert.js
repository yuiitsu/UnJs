/**
 * Created by onlyfu on 2017/5/11.
 */
/**
 * 确认对话框
 * author: onlyfu
 * update: 2017-05-11
 */
Component.extend('common.alert', function() {

    this.loadingObj = $('#wm-alert');

    /**
     * 入口方法
     * @param params 参数
     */
    this.init = function(params, data) {
        if ($.isFunction(this[params])) {
            this[params](data);
        }
    };

    /**
     * 显示
     */
    this.show = function(data) {
        if ($('#wm-alert').length === 0) {
            $('body').append(this.getView('public.alert', data));
        } else {
            $('#wm-alert').show();
        }

        $('#wm-alert .confirm').click(function() {
            location.href = "login.html";
        });
    };

    /**
     * 隐藏
     */
    this.hide = function() {
        $('#wm-alert').hide();
    };
});
