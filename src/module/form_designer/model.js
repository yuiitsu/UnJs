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
        formDataString: '',
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
        //
        dataSource: [
            {
                text: '地区',
                value: '{api}/api/v1/datasource/getByParentIdAndCodeAndDicId?dicId=49'
            },
            {
                text: '行业',
                value: '{api}/api/v1/datasource/getByParentIdAndCodeAndDicId?dicId=66'
            },
            {
                text: '登记注册类型',
                value: '{api}/api/v1/datasource/getByParentIdAndCodeAndDicId?dicId=78'
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

    this.queryFormDesignerDetail = function(callback) {
        var formId = this.get('formData.formId');
        this._get({
            url: '/api/v1/form/info',
            data: {
                formId: formId
            }
        }, function(res) {
            if (res.state === 0) {
                var formDesignerDataString = res.data.formData,
                    formId = res.data.id,
                    formName = res.data.formName,
                    formType = res.data.formType,
                    systemId = res.data.systemId,
                    description = res.data.description,
                    formDesignerData = {},
                    formElements = [],
                    formElementsString = '',
                    formData = {
                        formId: formId,
                        formName: formName,
                        formType: formType,
                        systemId: systemId,
                        description: description
                    };

                if (formDesignerDataString) {
                    try {
                        formDesignerData = JSON.parse(formDesignerDataString);
                        formData['verifyTipsType'] = formDesignerData['verifyTipsType'];
                    } catch (e) {
                        formDesignerData = {}
                    }
                } else {
                    formDesignerData = {}
                }
                //
                self.set('formData', formData);
                self.set('formDataString', JSON.stringify(formData));

                //
                if (formDesignerData['formElements']) {
                    formElements = formDesignerData['formElements'];
                    formElementsString = JSON.stringify(formElements);
                }
                self.set('formElements', formElements);
                self.set('formElementsString', formElementsString);
            } else {
                self.notification.danger(res.message);
            }
            //
            callback();
        });
    };

    this.getFormRenderData = function() {
        var row = this.get('layout.row'),
            column = this.get('layout.column'),
            formElements = this.get('formElements'),
            formElementsLen = formElements.length,
            formTitle = this.get('formTitle'),
            openProperty = this.get('openPropertyTemp'),
            verifyTipsType = this.get('verifyTipsType');

        var data = {
            row: row,
            column: column,
            formElements: formElements,
            formTitle: formTitle,
            openProperty: openProperty ? openProperty.split(':') : ['', ''],
            verifyTipsType: verifyTipsType
        };
        //
        for (var i = 0; i < formElementsLen; i++) {
            self.buildElementData(formElements[i]);
            // var element = formElements[i],
            //     properties = element.property,
            //     rules = element.rules;

            // if (!element.hasOwnProperty('data')) {
            //     element['data'] = {};
            // }

            // for (var n in properties) {
            //     if (properties.hasOwnProperty(n)) {
            //         element['data'][n] = properties[n];
            //     }
            // }
            // for (var m in rules) {
            //     if (rules.hasOwnProperty(m)) {
            //         element['data'][n] = rules[n];
            //     }
            // }

            // if (element.hasOwnProperty('children')) {
            //     for (var j in element['children']) {
            //         if (element['children'].hasOwnProperty(j)) {
            //             var childElement = element['children'][j];
            //             if (!childElement.hasOwnProperty('data')) {
            //                 childElement['data'] = {};
            //             }

            //             for (var n in childElement.property) {
            //                 if (childElement.property.hasOwnProperty(n)) {
            //                     childElement['data'][n] = childElement.property[n];
            //                 }
            //             }
            //             for (var n in childElement.rules) {
            //                 if (childElement.rules.hasOwnProperty(n)) {
            //                     childElement['data'][n] = childElement.rules[n];
            //                 }
            //             }
            //         }
            //     }
            // }
        }
        return data;
    };

    this.buildElementData = function(element) {
        var properties = element.property,
            rules = element.rules;

        if (!element.hasOwnProperty('data')) {
            element['data'] = {};
        }

        for (var n in properties) {
            if (properties.hasOwnProperty(n)) {
                element['data'][n] = properties[n];
            }
        }
        for (var m in rules) {
            if (rules.hasOwnProperty(m)) {
                element['data'][n] = rules[n];
            }
        }

        if (element.hasOwnProperty('children')) {
            for (var j in element['children']) {
                if (element['children'].hasOwnProperty(j)) {
                    var childElement = element['children'][j];
                    if (!childElement.hasOwnProperty('data')) {
                        childElement['data'] = {};
                    }

                    for (var n in childElement.property) {
                        if (childElement.property.hasOwnProperty(n)) {
                            childElement['data'][n] = childElement.property[n];
                        }
                    }
                    for (var n in childElement.rules) {
                        if (childElement.rules.hasOwnProperty(n)) {
                            childElement['data'][n] = childElement.rules[n];
                        }
                    }
                }
            }
        }
    };

    this.saveFormDesignerData = function() {
        var formData = this.get('formData'),
            formElements = this.get('formElements'),
            formElementsLen = formElements.length;
        //
        formData['formData'] = {
            verifyTipsType: this.get('verifyTipsType'),
            formElements: formElements
        };
        // 找出需要用于搜索的字段
        var formConditionName = [],
            formConditionData = [];

        $('.js-form-control').each(function() {
            if ($(this).attr('issearchcolumn') === 'yes') {
                var name = $(this).attr('name'),
                    dataSource = $(this).attr('datasource');

                formConditionName.push(name);
                formConditionData.push({
                    name: name,
                    component: '',
                    elements: {}
                });
            }
        });
        // 遍历formElements，找到名称相同的对象，获取它使用的组件
        for (var i = 0; i < formElementsLen; i++) {
            var children = formElements[i]['children'];
            if (children) {
                for (var j in children) {
                    if (children.hasOwnProperty(j)) {
                        var component = children[j],
                            property = component.property,
                            formConditionNameIndex = formConditionName.indexOf(property.name);

                        if (formConditionNameIndex !== -1) {
                            formConditionData[formConditionNameIndex]['component'] = component.component;
                            self.buildElementData(component);
                            delete component['data']['readonly'];
                            formConditionData[formConditionNameIndex]['elements'] = component;
                        }
                    }
                }
            }
        }

        formData['formCondition'] = formConditionData;
        //
        this._put({
            url: '/api/v1/form/update',
            data: formData
        }, function(res) {
            if (res.state === 0) {
                self.notification.success('保存成功');
            } else {
                self.notification.danger(res.message);
            }
        });
    };

    this.queryFormAdvanceRules = function() {
        var formId = this.get('formData.formId');
        //
        this._get({
            url: '/api/v1/form/rule/list',
            data: {
                formId: formId
            }
        }, function(res) {
            if (res.state === 0) {
                var rules = [],
                    dataLen = res.data.length;

                for (var i = 0; i < dataLen; i++) {
                    try {
                        rules.push(JSON.parse(res.data[i]['rules']));
                    } catch (e) {
                    }
                }

                if (rules) {
                    //
                    self.set('verifyAdvanceRules', res.data);
                    self.set('verifyAdvanceRulesString', JSON.stringify(res.data));
                    // 执行rules
                    self.callComponent({
                        name: 'form_designer.property.global',
                        method: 'evalRules'
                    }, rules)
                }
            }
        });
    };

    this.saveFormAdvanceRules = function(id, name, ruleString, target, callback) {
        var formId = this.get('formData.formId'),
            url = '/api/v1/form/rule/add',
            data = {
                formId: formId,
                name: name,
                rule: ruleString
            };
        //
        if (id) {
            url = '/api/v1/form/rule/update';
            data['id'] = id;
            //
            this._put({
                url: url,
                data: data,
                loading: target
            }, function (res) {
                if (res.state === 0) {
                    self.notification.success('保存成功');
                    callback();
                } else {
                    self.notification.danger(res.message);
                }
            });
        } else {
            this._post({
                url: url,
                data: data,
                loading: target
            }, function (res) {
                if (res.state === 0) {
                    self.notification.success('保存成功');
                    callback();
                } else {
                    self.notification.danger(res.message);
                }
            });
        }
    };

    this.delFormAdvanceRules = function(id, callback) {
        this._post({
            url: '/api/v1/form/rule/remove',
            data: {
                id: id
            }
        }, function(res) {
            if (res.state === 0) {
                self.notification.success('删除成功');
                callback();
            } else {
                self.notification.danger(res.message);
            }
        });
    };

    this.queryFormSourceData = function() {
        var formId = this.get('formData.formId');
        //
        this._get({
            url: '/api/v1/form/source/list',
            data: {
                formId: formId
            }
        }, function(res) {
            if (res.state === 0) {
                //
                var sourceData = res.data,
                    dataLen = sourceData.length,
                    cacheData = {};

                for (var i = 0; i < dataLen; i++) {
                    cacheData[sourceData[i]['name']] = sourceData[i];
                }
                self.set('verifyAdvanceRulesData', cacheData);
                self.set('verifyAdvanceRulesDataString', JSON.stringify(cacheData));
            }
        });
    };

    this.saveFormSourceData = function(id, name, sourceData, target, callback) {
        var formId = this.get('formData.formId'),
            url = '/api/v1/form/source/add',
            data = {
                formId: formId,
                name: name,
                sourceData: sourceData
            };
        //
        if (id) {
            url = '/api/v1/form/source/update';
            data['id'] = id;
            //
            this._put({
                url: url,
                data: data,
                loading: target
            }, function (res) {
                if (res.state === 0) {
                    self.notification.success('保存成功');
                    callback();
                } else {
                    self.notification.danger(res.message);
                }
            });
        } else {
            this._post({
                url: url,
                data: data,
                loading: target
            }, function (res) {
                if (res.state === 0) {
                    self.notification.success('保存成功');
                    callback();
                } else {
                    self.notification.danger(res.message);
                }
            });
        }
    };

    this.delFormSourceData = function(id, callback) {
        this._post({
            url: '/api/v1/form/source/remove',
            data: {
                id: id
            }
        }, function(res) {
            if (res.state === 0) {
                self.notification.success('删除成功');
                callback();
            } else {
                self.notification.danger(res.message);
            }
        });
    }
});