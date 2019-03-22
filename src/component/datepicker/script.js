/**
 *  Date Selector Component
 */
Component.extend('date_selector', function() {

    this.bind = {
        init: function(params) {
            var target = $('#' + params.id);
            if (!target.attr('readonly')) {
                target.datepicker({
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: "yy-mm-dd"
                });
            }
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});