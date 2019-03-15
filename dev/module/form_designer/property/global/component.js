/**
 *  Form Designer Global Property Component
 */
Component.extend('form_designer.property.global', function() {

    var self = this;

    this.bind = {
        changeRowAndColumn: function() {
            $('.js-form-designer-layout').off('change').on('change', function() {
                var dataType = $(this).attr('data-type');
                //
                if (dataType) {
                    self.model.form_designer.set('layout.' + dataType, parseInt($.trim($(this).val())));
                }
            });
        },
        verifyTipsType: function() {
            $('.js-property-select-verify-tips-type').on('change', function() {
                var value = $(this).val();
                self.model.form_designer.set('verifyTipsType', value);
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});