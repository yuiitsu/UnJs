/**
 *  Modal Component
 */
Component.extend('modal', function() {

    let self = this;

    this.bind = {
        show: function(target) {
            $(target).show();
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});