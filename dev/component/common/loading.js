/**
 * 对话框组件 - loading
 * author: onlyfu
 * update: 2017-02-08
 */
Component.extend('common.loading', function () {

    /**
     * 入口方法
     * @param params 参数
     */
    this.init = function (params) {
        if ($.isFunction(this[params])) {
            this[params]();
        }
    };

    /**
     * 显示
     */
    this.show = function () {
        var $el = $('#wm_loading');
        if ($el.length === 0) {
            var $html = $(this.getView('public.loading'));
            $html.appendTo($('body'));
            setTimeout(function () {
                $html.addClass('show');
            });
        } else {
            this.time_id = setTimeout(function () {
                if(!$el.hasClass('hidden')){
                    $el.find('.wm-loading-box').addClass('show');
                }
            }, 0);
            $el.removeClass('hidden');
        }
    };

    /**
     * 隐藏
     */
    this.hide = function () {
        var $el = $('#wm_loading');
        $el.addClass('hidden').find('.wm-loading-box').removeClass('show');
    };
});