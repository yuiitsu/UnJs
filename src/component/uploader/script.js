/**
 *  Uploader Component
 */
Component.extend('uploader', function() {

    var self = this;

    this.bind = {
        init: function(params) {
            var id = params.id;
            $('#' + id).on('change', function() {
                var _this = $(this),
                    file = $(this).val();
                    // file = $(this)[0].files[0];

                self.renderComponent('toast.view', {
                    title: '上传',
                    body: '正在上传...'
                }).appendTo($('body'));

                setTimeout(function() {
                    _this.next().find('input').val(file);
                    $('.toast-body').html('上传完成');
                    setTimeout(function() {
                        $('.toast-container').remove();
                    }, 1000);
                }, 2000)
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});