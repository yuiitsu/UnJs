/**
 *  Input Component
 */
Component.extend('input', function() {

    /**
     * 事件绑定，被调用时自动执行
     */
    this.bindEvent = function() {
        $('.component-input').find('input').val('Input');
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});
