/**
 *  Toast Component
 */
Component.extend('toast', function() {

    let self = this;

    this.bind = {
        close: function() {
            $('.toast-header-close').on('click', function() {
                var data_code = $(this).attr('data-code');
                $('#toast-' + data_code).remove();
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});