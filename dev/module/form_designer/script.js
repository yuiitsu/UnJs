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
        '.form-designer-component-setting input.js-property-input input.setting_change_': '_settingEvent.inputChange',
        // 组件设置，选择框值变化
        '.form-designer-component-setting select.js-property-input change.setting_change_': '_settingEvent.selectChange',
        '.form-designer-component-setting input[type=radio] click.setting_click_': '_settingEvent.radioClick',
        // 组件设置，删除组件
        '.form-designer-component-setting .js-form-designer-component-del click.component_del_': '_settingEvent.delComponent'
    };

    this.index = function() {
        // 组件菜单
        this.watch(this.model.get(), 'openComponentId', '_renderComponentSelector');
        // 属性
        this.watch(this.model.get(), 'openProperty', '_renderProperty');
        this.watch(this.model.get(), 'openProperty', '_renderLayout');
        // 空Element
        this.watch(this.model.get(), 'openEmptyProperty', '_renderEmptyProperty');
        // 布局
        this.watch(this.model.get(), 'layout.row', '_renderLayout');
        this.watch(this.model.get(), 'layout.column', '_renderLayout');
        // 表单
        this.watch(this.model.get(), 'formElementsString', '_renderLayout');
        // 渲染表单设计界面
        this.output('container', {
            componentSelector: {
                list: this.model.get('components'),
                openId: ''
            }
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
     * 渲染布局
     * @private
     */
    this._renderLayout = function() {
        var row = this.model.get('layout.row'),
            column = this.model.get('layout.column'),
            formElements = this.model.get('formElements'),
            openProperty = this.model.get('openProperty');

        var data = {
            row: row,
            column: column,
            formElements: formElements,
            componentData: {},
            openProperty: openProperty ? openProperty : ''
        };
        //
        for (var i in formElements) {
            if (formElements.hasOwnProperty(i)) {
                var properties = formElements[i].property,
                    rules = formElements[i].rules;

                if (!data.componentData.hasOwnProperty(i)) {
                    data.componentData[i] = {};
                }

                for (var j in properties) {
                    if (properties.hasOwnProperty(j)) {
                        data.componentData[i][j] = properties[j];
                    }
                }
                for (var m in rules) {
                    if (rules.hasOwnProperty(m)) {
                        data.componentData[i][m] = rules[m];
                    }
                }
            }
        }
        this.output('layout.default', data, $('.form-designer-form'))
    };

    /**
     * 渲染属性设置界面
     * @private
     */
    this._renderProperty = function() {
        var position = self.model.get('openProperty'),
            formElements = self.model.get('formElements'),
            name = '',
            data = {property: {}, rules: {}};

        if (position === 'global') {
            name = 'global';
        } else {
            if (!formElements.hasOwnProperty(position)) {
                this._renderEmptyProperty();
                return false;
            } else {
                name = formElements[position].name;
                data = {
                    property: formElements[position].property,
                    rules: formElements[position].rules
                }
            }
        }
        console.log(formElements);

        self.output('property.layout', {
            name: 'module.form_designer.property.' + name + '.view',
            data: data
        }, $('.form-designer-component-setting'));
    };

    /**
     * 浸染空的设置界面
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
            key = target.attr('data-key'),
            parent = $('body');

        // 创建拖动浮动层
        parent.append(this.getView('module.form_designer.drag_tip', text));
        //
        var o = $('.form-designer-drag-tip');
        o.css({top: e.clientY + 1, left: e.clientX + 1});
        //
        parent.off('mousemove').on('mousemove', function(e) {
            o.css({top: e.clientY + 1, left: e.clientX + 1});
            e.stopPropagation();
        });
        //
        parent.off('mouseup').on('mouseup', function(e) {
            var element = document.elementFromPoint(e.clientX, e.clientY),
                target = $(element);

            if (component) {
                if ((target).attr('class') === 'form-designer-component-container') {
                    if (target.children().length === 0) {
                        // 渲染组件到目标区域
                        // self.renderComponent(component, {}).to(target);
                        // 更新数据对象
                        var row = target.attr('data-row'),
                            column = target.attr('data-column');

                        //
                        self.model.setFormElements({
                            name: key,
                            component: component,
                            property: {
                                class: 'form-designer-component-item js-form-control'
                            },
                            rules: {}
                        }, false, row, column);
                        // 渲染property setting
                        self.model.set('openProperty', row + '' + column);
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
            self.model.setFormElements(data, true);
        },
        /**
         * 选择框
         * @param e
         */
        selectChange: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data, true);
        },
        /**
         * 单选
         * @param e
         */
        radioClick: function(e) {
            var name = self.$(e).attr('name'),
                data = {};

            data[name] = self.$(e).val();
            self.model.setFormElements(data, true);
        },
        /**
         * 删除组件
         */
        delComponent: function() {
            self.model.delComponent();
        }
    }
});