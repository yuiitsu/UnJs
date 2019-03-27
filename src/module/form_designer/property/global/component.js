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
        },
        setTitle: function() {
            $('.js-form-designer-title-input').on('input', function() {
                self.model.form_designer.set('formTitle', $.trim($(this).val()));
            });
        },
        openGlobalRule: function() {
            $('.js-form-designer-add-global-rules').off('click').on('click', function() {
                self.renderComponent('modal.view', {
                    title: '添加规则',
                    body: self.getView('module.form_designer.rules_editor.view'),
                    callback: function(modal, res) {
                        //
                        var rules = [];
                        $('.form-designer-rules-editor-item').each(function() {
                            var dataType = $(this).attr('data-type');
                            rules.push($(this).find())
                        });
                    }
                }).appendTo($('body'));
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});