/**
 *  Modal Component
 */
Component.extend('modal', function() {

    let self = this;

    /**
     * 事件绑定，被调用时自动执行
     */
    this.bindEvent = function(target) {
        $(target).show();
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});