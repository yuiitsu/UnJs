/**
 * Model Form Designer
 */
Model.extend('form_designer', function () {
    //
    var self = this;
    //
    this.default = {
        formData: {
            formId: '',
            formName: '',
            formType: 'normal',
            description: ''
        },
        components: [
            {
                id: 'layout',
                for: 'layout',
                name: '布局',
                children: [
                    {component: 'basic.text.view', key: 'text', name: '文本'},
                    {component: 'basic.table.view', key: 'table', name: '表格'}
                ]
            },
            {
                id: 'global',
                for: 'form',
                name: '通用组件',
                children: [
                    {component: 'basic.label.view', key: 'label', name: '标签'},
                    {component: 'basic.input.view', key: 'input', name: '文本/数值框'},
                    {component: 'basic.textarea.view', key: 'textarea', name: '内容框'},
                    {component: 'basic.select.view', key: 'select', name: '下拉选择框'},
                    {component: 'linkage_select.view', key: 'linkage_select', name: '联动下拉选择框'},
                    {component: 'basic.radio.view', key: 'radio', name: '单选'},
                    {component: 'basic.checkbox.view', key: 'checkbox', name: '多选'},
                    {component: 'datepicker.view', key: 'datepicker', name: '时间选择'},
                    {component: 'tree.view', key: 'tree', name: '树形菜单'},
                    {component: 'uploader.view', key: 'uploader', name: '上传'}
                ]
            },
            {
                id: 'combination',
                for: 'layout',
                name: '组合组件',
                children: [
                    {component: 'basic.label.view', key: 'label', name: '标签'},
                ]
            },
            {
                id: 'business',
                for: 'form',
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
        formTitle: '',
        formElementsString: '',
        formElements: [],
        verifyTipsType: '',
        verifyAdvanceRules: [],
        verifyAdvanceRulesString: '',
        verifyAdvanceRulesFunc: {},
        verifyAdvanceRulesData: {},
        verifyAdvanceRulesDataString: '',
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
     * @param index
     * @param isSet
     * @param row
     * @param column
     */
    this.setFormElements = function(data, index, isSet, row, column) {
        var position = '',
            formElements = this.get('formElements');
        //
        if (row === undefined && column === undefined && index === -1) {
            var openPropertyTemp = this.get('openPropertyTemp'),
                positions = openPropertyTemp.split(':');
            index = positions[0];
            position = positions[1];
        } else {
            row = row ? row : '0';
            column = column ? column : '0';
            position = row + '' + column;
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

        if (!index) {
            formElements.push(data);
        } else {
            // if (position !== 'empty' && position) {
            //     console.log('Set Form Elements Failed. position: ', position);
            //     return false;
            // }
            if (!formElements[index].hasOwnProperty('children')) {
                formElements[index]['children'] = {};
            }
            if (position !== 'empty' && position !== '') {
                formElements[index]['children'][position] = formElements[index]['children'][position] ?
                    formElements[index]['children'][position] : {};
                setValue(data, formElements[index]['children'][position]);
            } else {
                setValue(data, formElements[index]);
            }
        }

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

        var positions = openProperty.split(':'),
            index = positions[0],
            position = positions[1];

        if (openProperty === 'global') {
            formElements = {};
        } else {
            if (position === 'empty' || position === '') {
                formElements.splice(index, 1);
            } else if (formElements[index].hasOwnProperty('children') ||
                formElements[index]['children'].hasOwnProperty(position)) {
                delete formElements[index]['children'][position];
            }
        }

        this.set('openProperty', '');
        this.set('openPropertyTemp', '');
        this.set('formElements', formElements);
        this.set('formElementsString', JSON.stringify(formElements));
    };

    this.queryFormDesignerDetail = function() {
        var formId = this.get('formData.formId');
        this._get({
            url: '/api/v1/form/info',
            data: {
                formId: formId
            }
        }, function(res) {
            if (res.state === 0) {
                var formData = res.data.formData,
                    formId = res.data.formId,
                    formName = res.data.formName,
                    formType = res.data.formType,
                    description = res.data.description,
                    formDataString = '';

                if (formData) {
                    try {
                        formDataString = JSON.stringify(formData);
                    } catch (e) {
                        formData = []
                    }
                } else {
                    formData = []
                }
                self.set('formElements', formData);
                self.set('formElementsString', formDataString);
                self.set('formData.formName', formName);
                self.set('formData', {});
            } else {
                this.notification.danger(res.message);
            }
        });
    }
});