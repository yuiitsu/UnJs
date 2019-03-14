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
                    modelKey = 'openProperty';

                dataRow = dataRow ? dataRow : '0';
                dataColumn = dataColumn ? dataColumn : '0';
                var position = dataRow + '' + dataColumn;
                // if (!formElements.hasOwnProperty(position)) {
                //     modelKey = 'openEmptyProperty';
                // }
                self.model.form_designer.set(modelKey, position);
                //
                e.stopPropagation();
            });
        },
        /**
         * 悬停鼠标显示功能按钮
         * @param e
         */
        showActionBar: function(e) {
            // $('.form-designer-layout').off('mouseenter').on('mouseenter', 'td', function(e) {
            //     var dataRow = $(this).attr('data-row'),
            //         dataColumn = $(this).attr('data-column');

            //     dataRow = dataRow ? dataRow : '0';
            //     dataColumn = dataColumn ? dataColumn : '0';
            //     console.log(dataRow, dataColumn);
            //     self.callComponent({
            //         name: 'tooltip'
            //     }, {
            //         target: $(this)
            //     });
            //     // self.renderComponent('tooltip.view', {
            //     //     target: $(this),
            //     //     content: '内容'
            //     // }).appendTo($('body'));
            //     //
            //     e.stopPropagation();
            // });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});