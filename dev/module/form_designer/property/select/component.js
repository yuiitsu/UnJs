/**
 *  Form Designer Select Property Component
 */
Component.extend('form_designer.property.select', function() {

    var self = this;
    /**
     * 事件绑定，被调用时自动执行
     */
    this.bind = {
        selectChange: function() {
            $('select.js-property-select').on('change', function() {
                var name = $(this).attr('name'),
                    value = $(this).val(),
                    target = $('#js-property-custom-option-container');

                if (name === 'property.dataSource' && value === 'custom') {
                    target.show();
                } else {
                    target.hide();
                }
            });
        },
        addCustomOption: function() {
            $('#js-add-custom-option').off('click').on('click', function() {
                $('#js-property-custom-option')
                    .append(self.getView('module.form_designer.property.select.custom_option'));
            });
        },
        delCustomOption: function() {
            $('#js-property-custom-option')
                .on('click', '.form-designer-component-custom-option-del', function() {
                $(this).parent().remove();
            })
        },
        inputChange: function() {
            $('#js-property-custom-option')
                .on('change', '.js-property-custom-option-input', function() {
                    var texts = [],
                        values = [],
                        list = [],
                        data = {};
                    //
                    $('.js-property-custom-option-input').each(function() {
                        var name = $(this).attr('name'),
                            value = $.trim($(this).val());

                        if (name === 'value') {
                            values.push(value);
                        } else {
                            texts.push(value);
                        }
                    });
                    //
                    var optionLen = texts.length;
                    for (var i = 0; i < optionLen; i++) {
                        if (texts[i] && values[i]) {
                            list.push({
                                text: texts[i],
                                value: values[i]
                            })
                        }
                    }
                    //
                    if (list.length > 0) {
                        data['property.list'] = list;
                        self.model.form_designer.setFormElements(data, true);
                    }
                })
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});