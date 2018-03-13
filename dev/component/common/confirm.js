/**
 * Created by onlyfu on 2017/5/23.
 */

Component.extend('common.confirm', function() {
    var self = this;

    /**
     * 入口方法
     * @param params 参数
     * @param data
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
        var $body = $('body');
        $body.append(this.vc('confirm', data));
        var o = $('.wm-confirm-box');
        $('.wm-confirm-ok').click(function() {
            if ($.isFunction(data['ok'])) {
                data['ok'](function() {
                    self.hide();
                });
            }
        });

        $('.wm-confirm-cancel').click(function() {
            if ($.isFunction(data['cancel'])) {
                data['cancel'](function() {
                    self.hide();
                });
            } else {
                self.hide();
            }
        });

        // 防止回车键触发当前鼠标下的按钮事件
        $body.on('keydown', this.preventEnterKeyEvent);
    };

    this.preventEnterKeyEvent = function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    };

    this.hide = function () {
        var o = $('.wm-confirm-box');
        o.remove();
        $('body').off('keydown', this.preventEnterKeyEvent);
    };
});
