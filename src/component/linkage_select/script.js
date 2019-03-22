/**
 *  Linkage Select Component
 */
Component.extend('linkage_select', function() {
    //
    var self = this;
    /**
     * 事件绑定，被调用时自动执行
     */
    this.bind =  {
        change: function(params) {
            var id = params.id,
                parent = $('#component-linkage-select-' + id);
            // $('.component-input').find('input').val('Input');
            parent.off('chage').on('change', 'select', function() {
                // 请求数据，如果有，创建一个选择框
                // 模拟
                var thisIndex = $(this).parent().index(),
                    nextIndex = thisIndex + 1,
                    value = $(this).val();
                //
                parent.find('select').each(function() {
                    if (thisIndex < $(this).parent().index()) {
                        $(this).parent().remove();
                    }
                });
                if (value) {
                    var data = {
                        list: [{text: nextIndex + '级', value: nextIndex}]
                    };
                    self.renderComponent('basic.select.view', data).appendTo(parent);
                }
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});