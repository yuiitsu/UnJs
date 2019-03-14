/**
 *  Form Designer Layout Default Component
 */
Component.extend('form_designer.layout.default', function() {

    var self = this;

    /**
     * 事件绑定
     */
    this.bind = {
        /**
         * 选择元素，打开property面板
         */
        openProperty: function() {
            $('.form-designer-layout').off('click').on('click', 'td', function(e) {
                var dataRow = $(this).attr('data-row'),
                    dataColumn = $(this).attr('data-column'),
                    formElements = self.model.form_designer.get('formElements'),
                    modelKey = 'openProperty',
                    modelKeyTemp = 'openProperty';

                dataRow = dataRow ? dataRow : '0';
                dataColumn = dataColumn ? dataColumn : '0';
                var position = dataRow + '' + dataColumn;
                if (!formElements.hasOwnProperty(position)) {
                    // modelKey = 'openEmptyProperty';
                    position = 'empty'
                }
                self.model.form_designer.set(modelKeyTemp, position);
                self.model.form_designer.set(modelKey, position);
                //
                $('.form-designer-layout').find('td').each(function() {
                    $(this).removeClass('focus');
                });
                $(this).addClass('focus');
                //
                e.stopPropagation();
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});