/**
 * Model Form Designer
 */
Model.extend('form_designer', function () {
    //
    var self = this;
    //
    this.default = {
        components: [
            // {
            //     id: 'layout',
            //     name: '布局',
            //     children: [
            //         {component: 'layout_default', key: 'default', name: '默认布局'},
            //     ]
            // },
            {
                id: 'global',
                name: '通用组件',
                children: [
                    {component: 'basic.label.view', key: 'label', name: '标签'},
                    {component: 'basic.input.view', key: 'input', name: '文本/数值框'},
                    {component: 'basic.textarea.view', key: 'textarea', name: '内容框'},
                    {component: 'basic.select.view', key: 'select', name: '选择菜单'},
                    {component: 'basic.radio.view', key: 'radio', name: '单选'},
                    {component: 'basic.checkbox.view', key: 'checkbox', name: '多选'},
                    {component: 'datepicker.view', key: 'datepicker', name: '时间选择'},
                    {component: 'tree.view', key: 'tree', name: '树形菜单'}
                ]
            },
            {
                id: 'combination',
                name: '组合组件',
                children: [
                    {component: 'basic.label.view', key: 'label', name: '标签'},
                ]
            },
            {
                id: 'business',
                name: '业务组件',
                children: [
                    {component: 'basic.label.view', key: 'label', name: '标签'},
                ]
            }
        ],
        openComponentId: '',
        openPropertyTemp: '',
        openProperty: '',
        openEmptyProperty: '',
        layout: {
            row: 4,
            column: 4
        },
        formElementsString: '',
        formElements: {
            // '00': {
            //     name: 'label',
            //     component: 'basic.label.view',
            //     property: {
            //     },
            //     rules: {}
            // }
        },
        verifyTipsType: '',
        // 临时
        region: [
            {
                name: '重庆',
                children: [
                    {
                        name: '渝北区',
                        children: [
                            {
                                name: '两路镇'
                            },
                            {
                                name: '玉峰山镇'
                            }
                        ]
                    },
                    {
                        name: '江北区',
                        children: [
                            {
                                name: '观音桥'
                            }
                        ]
                    }
                ]
            },
            {
                name: '上海',
                children: [
                    {
                        name: '浦东新区',
                        children: [
                            {
                                name: '张江镇'
                            },
                            {
                                name: '梅西'
                            }
                        ]
                    },
                    {
                        name: '闵行',
                        children: [
                            {
                                name: '老外街'
                            },
                            {
                                name: '大桥'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    /**
     * 设置formElements数据
     * @param data
     * @param isSet
     * @param row
     * @param column
     */
    this.setFormElements = function(data, isSet, row, column) {
        var position = '',
            formElements = this.get('formElements');
        //
        if (row === undefined && column === undefined) {
            position = this.get('openPropertyTemp');
        } else {
            row = row ? row : '0';
            column = column ? column : '0';
            position = row + '' + column;
        }

        if (!position) {
            console.log('Set Form Elements Failed. position: ', position);
            return false;
        }

        /**
         * 设置值
         * @param data
         * @param formElements
         */
        function setValue(data, formElements) {
            //
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    var keys = i.split('.');
                    if (keys.length > 1) {
                        if (keys[1] === 'minLength' || keys[1] === 'maxLength') {
                            var length = [0, 0],
                                index = keys[1] === 'minLength' ? 0 : 1;

                            if (!formElements[keys[0]].hasOwnProperty('length')) {
                                formElements[keys[0]]['length'] = ''
                            } else {
                                length = JSON.parse(formElements[keys[0]]['length'].replace(/\'/g, '"'));
                            }
                            length[index] = data[i];
                            formElements[keys[0]]['length'] = JSON.stringify(length).replace(/"/g, "'");
                        } else {
                            if (!formElements[keys[0]].hasOwnProperty(keys[1])) {
                                if (keys[1] !== 'readonly' || (keys[1] === 'readonly' && data[i] === '1')) {
                                    formElements[keys[0]][keys[1]] = data[i];
                                }
                            } else {
                                if (Object.prototype.toString.call(data[i]) === '[object Object]') {
                                    setValue(data[i], formElements[keys[0]][keys[1]]);
                                } else {
                                    if (keys[1] !== 'readonly' || (keys[1] === 'readonly' && data[i] === '1')) {
                                        formElements[keys[0]][keys[1]] = data[i];
                                    } else {
                                        delete formElements[keys[0]][keys[1]];
                                    }
                                }
                            }
                        }
                    } else {
                        if (!formElements.hasOwnProperty(i)) {
                            formElements[i] = data[i];
                        } else {
                            if (Object.prototype.toString.call(data[i]) === '[object Object]') {
                                setValue(data[i], formElements[i]);
                            } else {
                                formElements[i] = data[i];
                            }
                        }
                    }
                }
            }
        }

        formElements[position] = formElements[position] ? formElements[position] : {};
        setValue(data, formElements[position]);
        this.set('formElements', formElements);
        if (isSet) {
            this.set('formElementsString', JSON.stringify(formElements));
        }
    };

    this.delComponent = function() {
        var openProperty = this.get('openProperty'),
            formElements = this.get('formElements');

        if (!openProperty) {
            return false;
        }

        if (openProperty === 'global') {
            formElements = {};
        } else if (formElements.hasOwnProperty(openProperty)) {
            delete formElements[openProperty];
        }

        this.set('openProperty', '');
        this.set('openPropertyTemp', '');
        this.set('formElements', formElements);
        this.set('formElementsString', JSON.stringify(formElements));
    };
});