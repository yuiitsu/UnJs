/**
 *  Tree Component
 */
Component.extend('tree', function() {

    var self = this;

    this.bind = {
        init: function(params) {
            var target = $('#' + params.id),
                data = [];
            // 检查dataSource
            if (target.attr('datasource')) {
                // 获取数据
                data = self.model.form_designer.get('region');
            }

            $(target).on('focus', function() {
                if (data.length > 0) {
                    // 渲染
                    // self.callComponent({name: 'tooltip'}, {
                    //     target: target,
                    //     content: self.getView('component.tree.popup', data)
                    // });
                    self.renderComponent('tooltip.view', {
                        target: target,
                        content: self.getView('component.tree.popup', data)
                    }).appendTo($('body'));
                }
            });
        },
        select: function(params) {
            var target = $('#' + params.id);
            $('body').off('click', '.component-tree-popup-title')
                .on('click', '.component-tree-popup-title', function(e) {
                var next = $(this).next();
                if (next.length > 0) {
                    if (next.css('display') === 'none') {
                        next.show();
                    } else {
                        next.hide();
                    }
                } else {
                    target.val($(this).attr('data-value'));
                }
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