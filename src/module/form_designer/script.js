/**
 * Form Designer
 */
Controller.extend('form_designer', function () {
    var self = this;
    // 事件监听
    this.bind = {
        // 左侧组件菜单开关
        '.form-designer-component-selector h2 click.designer_component_': '_openComponentSelector',
        // 拖拽组件到指定区域
        '.form-designer-component-selector li mousedown.drag_': '_drag',
        // 组件设置，文本框值变化
        '.form-designer-component-setting .js-property-input input.setting_change_': '_settingEvent.inputChange',
        // 组件设置，选择框值变化
        '.form-designer-component-setting .js-property-select change.setting_select_change_': '_settingEvent.selectChange',
        '.form-designer-component-setting input[type=radio] click.setting_radio_click_': '_settingEvent.radioClick',
        '.form-designer-component-setting .js-form-designer-component-datepicker change.setting_change_': '_settingEvent.datepickerChange',
        // 组件设置，删除组件
        '.form-designer-component-setting .js-form-designer-component-del click.component_del_': '_settingEvent.delComponent',
        //
        '#js-form-designer-verify-test click': '_settingEvent.verifyTest',
        //
        '#js-form-designer-save click': '_saveForm',
        //
        '.form-designer-form #js-verify-form mouseenter.form_mouseenter_': '_settingEvent.formMouseEnter',
        '.form-designer-form #js-verify-form mouseleave.form_mouseleave_': '_settingEvent.formMouseLeave',
        '.form-designer-layout-container .js-form-designer-component-item click.component_container_click_': '_settingEvent.editComponent',
    };

    this.index = function() {
        //
        this.watch(this.model.get(), 'formDataString', '_renderContainer');
        // 组件菜单
        this.watch(this.model.get(), 'openComponentId', '_renderComponentSelector');
        // 属性
        this.watch(this.model.get(), 'openProperty', '_renderProperty');
        this.watch(this.model.get(), 'verifyAdvanceRulesDataString', '_renderProperty');
        this.watch(this.model.get(), 'verifyAdvanceRulesString', '_renderProperty');
        //this.watch(this.model.get(), 'openProperty', '_renderLayout');
        // 空Element
        this.watch(this.model.get(), 'openEmptyProperty', '_renderEmptyProperty');
        // 布局
        this.watch(this.model.get(), 'layout.row', '_renderLayout');
        this.watch(this.model.get(), 'layout.column', '_renderLayout');
        // 表单
        this.watch(this.model.get(), 'formElementsString', '_renderLayout');
        //
         this.watch(this.model.get(), 'verifyTipsType', '_renderLayout');

        //
        var params = self.getParams(),
            formId = params.formId;

        if (!formId) {
            this.notification.danger('参数不正确');
            return false;
        }
        this.model.set('formData.formId', formId);

        // 请求数据
        this.model.queryFormDesignerDetail(function() {
            self.model.queryFormAdvanceRules();
            self.model.queryFormSourceData();
        });
    };

    /**
     * 打开组件选择下拉菜单
     * @param e
     * @private
     */
    this._openComponentSelector = function(e) {
        var id = this.$(e).attr('data-id');
        if (id) {
            this.model.set('openComponentId', id);
        } else {
            // 打开全局设置
            this.model.set('openPropertyTemp', ':global');
            this.model.set('openProperty', 'global');
        }
    };

    /**
     * 渲染组件选择界面
     * @private
     */
    this._renderComponentSelector = function() {
        this.output('component', {
            list: this.model.get('components'),
            openId: this.model.get('openComponentId')
        }, $('.form-designer-component-selector'));
    };

    /**
     * 渲染容器
     * @private
     */
    this._renderContainer = function() {
        var formData = self.model.get('formData');
        // 渲染表单设计界面
        this.output('container', {
            componentSelector: {
                list: this.model.get('components')
            },
            formData: formData
        });
    };

    /**
     * 渲染布局
     * @private
     */
    this._renderLayout = function() {
        var data = this.model.getFormRenderData();
        this.output('layout.default', data, $('.form-designer-form'))
    };

    /**
     * 渲染属性设置界面
     * @private
     */
    this._renderProperty = function() {
        var openProperty = self.model.get('openProperty'),
            positions = openProperty ? openProperty.split(':') : ['', ''],
            index = positions[0],
            position = positions[1],
            formElements = self.model.get('formElements'),
            data = self.model.get('formData'),
            dataSource = self.model.get('dataSource'),
            dataSourceLen = dataSource.length,
            dataSourceCopy = [],
            name = '',
            element = null;
        //
        data['property'] = {};
        data['rules'] = {};
        //
        for (var i = 0; i < dataSourceLen; i++) {
            dataSourceCopy.push(dataSource[i]);
        }
        dataSourceCopy.push({text: '自定义', value: 'custom'});
        data['dataSource'] = dataSourceCopy;

        if (!index || index === 'global') {
            data['verifyAdvanceRulesData'] = self.model.get('verifyAdvanceRulesData');
            data['verifyAdvanceRules'] = self.model.get('verifyAdvanceRules');
            self.output('property.global.view', data, $('.form-designer-component-setting'));
        } else {
            if (formElements[index]) {
                if (position === 'empty' || !position || !formElements[index].hasOwnProperty('children')) {
                    self.model.set('openPropertyTemp', index + ':empty');
                    element = formElements[index] ;
                } else {
                    if (!formElements[index]['children'].hasOwnProperty(position)) {
                        this._renderEmptyProperty();
                        return false;
                    } else {
                        element = formElements[index]['children'][position];
                    }
                }

                name = element.name;
                data = {
                    property: element.property,
                    rules: element.rules,
                    dataSource: dataSourceCopy
                };
                self.output('property.layout', {
                    name: 'module.form_designer.property.' + name + '.view',
                    data: data
                }, $('.form-designer-component-setting'));
            } else {
                this._renderEmptyProperty();
            }
        }
    };

    /**
     * 渲染空的设置界面
     * @private
     */
    this._renderEmptyProperty = function() {
        self.output('property.empty.view', {}, $('.form-designer-component-setting'));
    };

    /**
     * 拖动组件到表单区域
     * @param e
     * @private
     */
    this._drag = function(e) {
        var target = this.$(e),
            text = target.text(),
            component = target.attr('data-component'),
            _for = target.attr('data-for'),
            key = target.attr('data-key'),
            _body = $('body');

        // 创建拖动浮动层
        _body.append(this.getView('module.form_designer.drag_tip', text));
        //
        var o = $('.form-designer-drag-tip');
        o.css({top: e.clientY + 1, left: e.clientX + 1});
        //
        _body.off('mousemove').on('mousemove', function(e) {
            o.css({top: e.clientY + 1, left: e.clientX + 1});
            e.stopPropagation();
        });
        //
        _body.off('mouseup').on('mouseup', function(e) {
            var element = document.elementFromPoint(e.clientX, e.clientY),
                target = $(element);

            if (component) {
                if (_for === 'form') {
                    if (target.hasClass('js-form-designer-component-item')) {
                        if (target.children().length === 0) {
                            // 更新数据对象
                            var index = target.attr('data-index'),
                                row = target.attr('data-row'),
                                column = target.attr('data-column'),
                                position = index + ':' + row + '' + column;

                            self.model.set('openPropertyTemp', position);
                            //
                            self.model.setFormElements({
                                name: key,
                                component: component,
                                property: {
                                    class: 'form-designer-component-item js-form-control'
                                },
                                rules: {}
                            }, index, true, row, column);
                            // 渲染property setting
                            self.model.set('openProperty', position);
                        }
                    } else {
                        console.log('通用组件须先有表格布局');
                    }
                }

                if (_for === 'layout') {
                    if (self.inArea) {
                        self.model.setFormElements({
                            name: key,
                            component: component,
                            property: {},
                            rules: {}
                        }, null, true);
                    }
                }
            }
            text = '';
            component = '';
            key = '';
            o.remove();
            e.stopPropagation();
        });
    };

    /**
     * 组件设置事件
     * @type {{inputChange: _settingEvent.inputChange}}
     * @private
     */
    this._settingEvent = {
        /**
         * 文本框值变化
         * @param e
         */
        inputChange: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = $.trim(self.$(e).val());
            self.model.setFormElements(data, -1, true);
        },
        /**
         * 选择框
         * @param e
         */
        selectChange: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data, -1, true);
        },
        /**
         * 单选
         * @param e
         */
        radioClick: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data,  -1, true);
        },
        datepickerChange: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data, -1, true);
        },
        /**
         * 删除组件
         */
        delComponent: function() {
            self.model.delComponent();
        },
        /**
         * 测试验证
         */
        verifyTest: function() {
            var message = '<span class="color-danger">校验失败!</span>';
            if (self.callComponent({name: 'verification'})) {
                // 执行高级规则
                var verifyAdvanceRulesFunc = self.model.get('verifyAdvanceRulesFunc'),
                    isSuccess = true;
                for (var i in verifyAdvanceRulesFunc) {
                    if (verifyAdvanceRulesFunc.hasOwnProperty(i)) {
                        var res = verifyAdvanceRulesFunc[i]();
                        if (res && res.status === false) {
                            self.callComponent({name: 'verification.afterElement'}, {
                                target: $('.js-form-control[name="'+ res.element +'"]'),
                                message: res.message
                            });
                            isSuccess = false;
                            break;
                        } else {
                            self.callComponent({name: 'verification.afterElement'}, {
                                target: '',
                                message: ''
                            })
                        }
                    }
                }
                if (isSuccess) {
                    message = '<span class="color-success">校验成功!</span>';
                }
            }
            $('#js-form-verify-result').html(message);
        },
        formMouseEnter: function(e) {
            self.inArea = true;
        },
        formMouseLeave: function(e) {
            self.inArea = false;
        },
        editComponent: function(e) {
            var target = self.$(e),
                index = target.attr('data-index'),
                dataRow = target.attr('data-row'),
                dataColumn = target.attr('data-column'),
                formElements = self.model.get('formElements'),
                position = '';

            if (dataRow && dataColumn) {
                dataRow = dataRow ? dataRow : '0';
                dataColumn = dataColumn ? dataColumn : '0';
                position = dataRow + '' + dataColumn;
            }

            if (!formElements[index]) {
                position = 'empty'
            } else {
                if (formElements[index].hasOwnProperty('children') &&
                    !formElements[index]['children'].hasOwnProperty(position)) {
                    position = 'empty'
                }
            }

            position = index + ':' + position;
            self.model.set('openPropertyTemp', position);
            self.model.set('openProperty', position);

            //
            $('.form-designer-layout-container')
                .find('.js-form-designer-component-item').each(function() {
                $(this).removeClass('focus');
            });
            target.addClass('focus');
        }
    };

    this._saveForm = function() {
        this.model.saveFormDesignerData();
    }
});