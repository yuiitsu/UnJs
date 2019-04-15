/**
 *  Notification Component
 *  usage:
 *
 *  self.renderComponent('notification.view', {
 *      status: 'danger',
 *      timeout: timeout,
 *      message: text
 *  }).appendTo($('body'));
 *
 *  params:
 *  status: danger/success/default，不传默认为default
 *  timeout: 自动关闭时间，值<=0则为不自动关闭
 *  message: 显示文本
 */
Component.extend('notification', function() {

    /**
     * 绑定方法，异步方法，在组件渲染完后遍历对象执行所有方法
     * @type {{init: bind.init, close: bind.close}}
     */
    this.bind = {
        init: function(params) {
            var id = params.id,
                timeout = params.timeout ? params.timeout : 2000;

            // 检查dom上是否已有notification，如果有把其它的先清除
            $('.component-notification').each(function() {
                var dataId = $(this).attr('data-id');
                if (parseInt(dataId) !== id) {
                    $(this).remove();
                }
            });
            // 为当前对象添加计时器移除
            if (timeout > 0) {
                setTimeout(function () {
                    $('#notification-' + id).remove();
                }, timeout);
            }
        },
        close: function(params) {
            $('.component-notification .mdi-close').on('click', function() {
                $('#notification-' + params.id).remove();
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});