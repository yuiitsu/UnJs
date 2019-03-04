/**
 *  Input Component
 */
Component.extend('textarea', function() {

    /**
     * 事件绑定，被调用时自动执行
     */
    this.bindEvent = function() {
        $('.component-textarea').find('textarea').val('Textarea');
    };

    this.init = function() {
        console.log('Component input init.');
    };

    this.callMethod = function() {
        console.log('Component input callMethod.');
    }
});
