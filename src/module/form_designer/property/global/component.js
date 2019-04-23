/**
 *  Form Designer Global Property Component
 */
Component.extend('form_designer.property.global', function () {

    var self = this;

    this.bind = {
        changeRowAndColumn: function () {
            $('.js-form-designer-layout').off('change').on('change', function () {
                var dataType = $(this).attr('data-type');
                //
                if (dataType) {
                    self.model.form_designer.set('layout.' + dataType, parseInt($.trim($(this).val())));
                }
            });
        },
        verifyTipsType: function () {
            $('.js-property-select-verify-tips-type').off('change').on('change', function () {
                var value = $(this).val();
                self.model.form_designer.set('verifyTipsType', value);
            });
        },
        setTitle: function () {
            $('.js-form-designer-title-input').off('input').on('input', function () {
                self.model.form_designer.set('formData.formName', $.trim($(this).val()));
            });
        },
        openGlobalRule: function () {
            $('.js-form-designer-add-global-rules').off('click').on('click', function () {
                self.renderComponent('modal.view', {
                    title: '添加规则',
                    body: self.getView('module.form_designer.rules_editor.view', {name: '', rules: []}),
                    callback: function (modal, res) {
                        //
                        self.createRulesFunc(null, modal, null);
                    }
                }).appendTo($('body'));
            });
        },
        openGlobalRuleData: function () {
            $('.js-form-designer-add-global-rules-data').off('click').on('click', function () {
                self.renderComponent('modal.view', {
                    title: '添加数据对象',
                    body: self.getView('module.form_designer.rules_editor.data_form', {}),
                    callback: function (modal) {
                        var name = modal.el('#form-designer-rules-editor-data-name').val(),
                            data = modal.el('#form-designer-rules-editor-data').val(),
                            savedData = self.model.form_designer.get('verifyAdvanceRulesData');

                        self.model.form_designer.saveFormSourceData(null, name, data, modal.$confirm(), function(res) {
                            name = name ? $.trim(name) : '';
                            data = data ? $.trim(data) : '';
                            savedData[name] = {
                                name: name,
                                sourceData: JSON.parse(data)
                            };
                            self.model.form_designer.set('verifyAdvanceRulesData', savedData);
                            self.model.form_designer.set('verifyAdvanceRulesDataString', JSON.stringify(savedData));
                            modal.close();
                        });
                    }
                }).appendTo($('body'));
            });
        },
        editGlobalRuleData: function () {
            $('.js-verify-advance-rules-data').off('click').on('click', function () {
                var key = $(this).attr('data-key'),
                    id = $(this).attr('data-id'),
                    verifyAdvanceRulesData = self.model.form_designer.get('verifyAdvanceRulesData'),
                    data = verifyAdvanceRulesData.hasOwnProperty(key) ? verifyAdvanceRulesData[key] : {};

                try {
                    data.sourceData = JSON.parse(data.sourceData);
                } catch (e) {
                }

                self.renderComponent('modal.view', {
                    title: '编辑数据对象',
                    body: self.getView('module.form_designer.rules_editor.data_form', {
                        name: data['name'],
                        data: JSON.stringify(data.sourceData)
                    }),
                    callback: function (modal) {
                        var name = modal.el('#form-designer-rules-editor-data-name').val(),
                            originName = modal.el('#form-designer-rules-editor-data-origin-name').val(),
                            data = modal.el('#form-designer-rules-editor-data').val(),
                            savedData = self.model.form_designer.get('verifyAdvanceRulesData');

                        self.model.form_designer.saveFormSourceData(id, name, data, modal.$confirm(), function(res) {
                            name = name ? $.trim(name) : '';
                            data = data ? $.trim(data) : '';
                            delete savedData[originName];
                            savedData[name] = {
                                id: id,
                                name: name,
                                sourceData: JSON.parse(data)
                            };
                            self.model.form_designer.set('verifyAdvanceRulesData', savedData);
                            self.model.form_designer.set('verifyAdvanceRulesDataString', JSON.stringify(savedData));
                            modal.close();
                        });
                    }
                }).appendTo($('body'));
            })
        },
        editGlobalRule: function () {
            $('.js-verify-advance-rules').off('click').on('click', function () {
                var index = $(this).attr('data-key'),
                    id = $(this).attr('data-id'),
                    verifyAdvanceRules = self.model.form_designer.get('verifyAdvanceRules'),
                    verifyAdvanceRulesLen = verifyAdvanceRules.length,
                    elements = self.getComponents(),
                    data = {
                        name: '',
                        rules: []
                    };

                for (var i = 0; i < verifyAdvanceRulesLen; i++) {
                    if (i === parseInt(index)) {
                        var rules = verifyAdvanceRules[i]['rules'];
                        try {
                            rules = JSON.parse(rules);
                        } catch (e) {
                            continue;
                        }
                        data = {
                            name: verifyAdvanceRules[i]['name'],
                            elements: elements,
                            rules: rules
                        };
                    }
                }
                //
                console.log(data);
                //
                self.renderComponent('modal.view', {
                    title: '编辑规则',
                    body: self.getView('module.form_designer.rules_editor.view', data),
                    callback: function (modal, res) {
                        //
                        self.createRulesFunc(id, modal, index);
                    }
                }).appendTo($('body'));
            });
        },
        rulesEditor: function() {
            $('body').off('click.rule_editor_').on('click.rule_editor_', '.form-designer-rules-editor-action-add', function(e) {
                var target = $(this),
                    dataType = target.attr('data-type'),
                    data = self.model.form_designer.get('verifyAdvanceRulesData'),
                    dataKeys = [],
                    view = '',
                    elements = self.getComponents(),
                    groupList = [];

                // group
                $('#js-verify-form').find('.js-form-control').each(function() {
                    var groupName = $(this).attr('group');
                    if (groupName) {
                        groupList.push(groupName);
                    }
                });

                // 数据对象
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        dataKeys.push(i);
                    }
                }

                switch (dataType) {
                    case 'element':
                        view = self.getView('module.form_designer.rules_editor.element', {
                            elements: elements,
                            default: ''
                        });
                        break;
                    case 'group':
                        view = self.getView('module.form_designer.rules_editor.group', {
                            groupList: groupList,
                            default: ''
                        });
                        break;
                    case 'symbol':
                        view = self.getView('module.form_designer.rules_editor.symbol');
                        break;
                    case 'condition':
                        view = self.getView('module.form_designer.rules_editor.condition');
                        break;
                    case 'custom':
                        view = self.getView('module.form_designer.rules_editor.custom');
                        break;
                    case 'value_type':
                        view = self.getView('module.form_designer.rules_editor.value_type');
                        break;
                    case 'key_on':
                        view = self.getView('module.form_designer.rules_editor.key_on');
                        break;
                    case 'data':
                        view = self.getView('module.form_designer.rules_editor.data', dataKeys);
                        break;
                }
                $('.form-designer-rules-editor-content').append(view);
            });
        },
        deleteGlobalRuleData: function () {
            $('.form-designer-global-list .js-form-designer-delete-rules-data').off('click').on('click', function () {
                var _this = $(this);
                self.callComponent({
                    name: 'confirm'
                }, {
                    message: '确定要执行此操作吗？',
                    callback: function(confirm, target) {
                        var key = _this.attr('data-key'),
                            id = _this.attr('data-id'),
                            savedData = self.model.form_designer.get('verifyAdvanceRulesData');

                        self.model.form_designer.delFormSourceData(id, function() {
                            if (savedData.hasOwnProperty(key)) {
                                delete savedData[key];
                            }
                            self.model.form_designer.set('verifyAdvanceRulesData', savedData);
                            self.model.form_designer.set('verifyAdvanceRulesDataString', JSON.stringify(savedData));
                            confirm.close();
                        });
                    }
                });
            });
        },
        deleteGlobalRule: function () {
            $('.form-designer-global-list .js-form-designer-delete-rules').off('click').on('click', function () {
                var _this = $(this);
                self.callComponent({
                    name: 'confirm'
                }, {
                    message: '确定要执行此操作吗？',
                    callback: function(confirm, target) {
                        var key = _this.attr('data-key'),
                            id = _this.attr('data-id'),
                            savedRules = self.model.form_designer.get('verifyAdvanceRules'),
                            savedRulesLen = savedRules.length;

                        self.model.form_designer.delFormAdvanceRules(id, function() {
                            for (var i = 0; i < savedRulesLen; i++) {
                                if (i === parseInt(key)) {
                                    savedRules.splice(i, 1);
                                }
                            }
                            self.model.form_designer.set('verifyAdvanceRules', savedRules);
                            self.model.form_designer.set('verifyAdvanceRulesString', JSON.stringify(savedRules));
                            confirm.close();
                        });
                    }
                });
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function () {
    };

    /**
     * 创建规则方法，挂到form_designer modal的verifyAdvanceRulesFunc下
     * @param id
     * @param modal
     * @param index
     */
    this.createRulesFunc = function(id, modal, index) {
        if (self.callComponent({
            name: 'verification'
        }, {'form': $('.form-designer-rules-editor-container')})) {
            //
            var rules = [],
                ruleName = $.trim($('#js-form-designer-rule-name').val());

            //
            $('.form-designer-rules-editor-item').each(function () {
                var dataType = $(this).attr('data-type'),
                    target = null;

                if ($(this).find('select').length > 0) {
                    target = $(this).find('select');
                } else if ($(this).find('input').length > 0) {
                    target = $(this).find('input');
                }
                if (target) {
                    rules.push({t: dataType, v: $.trim(target.val())});
                }
            });

            // 保存到数据库
            self.model.form_designer.saveFormAdvanceRules(id, ruleName, JSON.stringify(rules), modal.$confirm(),function() {
                var verifyAdvanceRules = self.model.form_designer.get('verifyAdvanceRules');
                if (!index && !id) {
                    verifyAdvanceRules.push({
                        id: '',
                        name: ruleName,
                        rules: rules
                    });
                } else {
                    var verifyAdvanceRulesLen = verifyAdvanceRules.length;
                    for (var i = 0; i < verifyAdvanceRulesLen; i++) {
                        if (i === parseInt(index)) {
                            verifyAdvanceRules[i]['name'] = ruleName;
                            verifyAdvanceRules[i]['rules'] = rules;
                        }
                    }
                }
                self.model.form_designer.set('verifyAdvanceRules', verifyAdvanceRules);
                self.model.form_designer.set('verifyAdvanceRulesString', JSON.stringify(verifyAdvanceRules));
                // 执行rule，将验证挂载到对象上
                self.evalRules(verifyAdvanceRules);
                //
                modal.close();
            });
        }
    };

    this.evalRules = function(verifyAdvanceRules) {
        //
        var symbolTransformList = ['+', '-', '*', '/'],
            symbolConditionList = ['>', '<', '>=', '<=', '!=', '=='];
        //
        for (var i in verifyAdvanceRules) {
            var evalString = ['self.model.form_designer.default.verifyAdvanceRulesFunc["' + i + '"] = function(callback) {'],
                isIf = false,
                isThen = false;
            for (var j in verifyAdvanceRules[i]) {
                var item = verifyAdvanceRules[i][j],
                    preNodeVal = '',
                    preElement = '',
                    preSymbol = '',
                    index = 0;
                switch (item.t) {
                    case 'condition':
                        if (item.v === 'if') {
                            evalString.push(item.v + '(');
                            isIf = true;
                            isThen = false;
                        } else if (item.v === 'then') {
                            evalString.push('){');
                            evalString.push('}');
                            isThen = true;
                        } else if (item.v === 'else') {
                            preNodeVal = evalString[evalString.length - 1];
                            if (preNodeVal === '}') {
                                evalString.pop();
                            }
                            evalString.push('}else{');
                            evalString.push('}');
                            isThen = true;
                        } else {
                            isIf = false;
                            isThen = false;
                        }
                        break;
                    case 'element':
                        preNodeVal = evalString[evalString.length - 1];
                        if (!isThen) {
                            if (isIf) {
                                evalString.push("document.getElementsByName('" + item.v + "')[0].value");
                            } else {
                                var elementValue = "document.getElementsByName('" + item.v + "')[0].value";
                                if (symbolConditionList.indexOf(preNodeVal) !== -1) {
                                    preSymbol = evalString.pop();
                                    preElement = evalString.pop();
                                    evalString.push('if (' + preElement + preSymbol + 'document.getElementsByName("' + item.v + '")[0].value) {return {status:true, element: "' + verifyAdvanceRules[i][j - 2].v + '"};}else{return {status: false, element: "' + verifyAdvanceRules[i][j - 2].v + '", message: "' + preSymbol + '"+ document.getElementsByName(\"' + item.v + '\")[0].value +""};}');
                                } else {
                                    if (symbolTransformList.indexOf(preNodeVal) !== -1) { evalString.push("parseInt(" + elementValue + ")");
                                    } else {
                                        evalString.push("document.getElementsByName('" + item.v + "')[0].value");
                                    }
                                }
                            }
                        } else {
                            index = preNodeVal === '}' ? evalString.length - 2 : evalString.length - 1;
                            preNodeVal = evalString[index];
                            preElement = evalString[index - 1];

                            if (symbolConditionList.indexOf(preNodeVal) !== -1) {
                                preSymbol = evalString.splice(index, 1)[0];
                                preElement = evalString.splice(index - 1, 1)[0];
                                evalString.splice(index - 1, 0, 'if (' + preElement + preSymbol + item.v + ') {return {status:true, element: "' + verifyAdvanceRules[i][j - 2].v + '"};}else{return {status: false, element: "' + verifyAdvanceRules[i][j - 2].v + '", message: "' + preSymbol + item.v + '"};}');
                            } else {
                                if (symbolTransformList.indexOf(evalString[evalString.length - 2]) !== -1) {
                                    evalString.splice(index + 1, 0, "parseInt(document.getElementsByName('" + item.v + "')[0].value)");
                                } else {
                                    evalString.splice(index + 1, 0, "document.getElementsByName('" + item.v + "')[0].value");
                                }
                            }
                        }
                        break;
                    case 'symbol':
                        if (!isThen) {
                            if (symbolTransformList.indexOf(item.v) !== -1) {
                                evalString[evalString.length - 1] = "parseInt(" + evalString[evalString.length - 1] + ")";
                            }
                            evalString.push(item.v);
                        } else {
                            if (symbolTransformList.indexOf(item.v) !== -1) {
                                evalString[evalString.length - 2] = "parseInt(" + evalString[evalString.length - 2] + ")";
                            }
                            evalString.splice(evalString.length - 1, 0, item.v);
                        }
                        break;
                    case 'custom':
                        preNodeVal = evalString[evalString.length - 1];
                        if (!isThen) {
                            if (isIf) {
                                evalString.push(item.v);
                            } else {
                                if (symbolConditionList.indexOf(preNodeVal) !== -1) {
                                    preSymbol = evalString.pop();
                                    preElement = evalString.pop();
                                    evalString.push('if (' + preElement + preSymbol + item.v + ') {return {status:true, element: "' + verifyAdvanceRules[i][j - 2].v + '"};}else{return {status: false, element: "' + verifyAdvanceRules[i][j - 2].v + '", message: "' + preSymbol + item.v + '"};}');
                                } else {
                                    evalString.push(item.v);
                                }
                            }
                        } else {
                            index = preNodeVal === '}' ? evalString.length - 2 : evalString.length - 1;
                            preNodeVal = evalString[index];
                            preElement = evalString[index - 1];

                            if (symbolConditionList.indexOf(preNodeVal) !== -1) {
                                preSymbol = evalString.splice(index, 1)[0];
                                preElement = evalString.splice(index - 1, 1)[0];
                                evalString.splice(index - 1, 0, 'if (' + preElement + preSymbol + item.v + ') {return {status:true, element: "' + verifyAdvanceRules[i][j - 2].v + '"};}else{return {status: false, element: "' + verifyAdvanceRules[i][j - 2].v + '", message: "' + preSymbol + item.v + '"};}');
                            } else {
                                evalString.splice(index + 1, 0, item.v);
                            }
                        }
                        break;
                    case 'value_type':
                        index = preNodeVal === '}' ? evalString.length - 2 : evalString.length - 1;
                        preElement = evalString[index];

                        if (item.v === 'text') {
                            evalString.splice(index, 1, preElement.replace('value', 'getAttribute("text")'));
                        }
                        break;
                    case 'key_on':
                        evalString.push(item.v);
                        break;
                    case 'data':
                        preSymbol = evalString.pop();
                        preElement = evalString.pop();
                        evalString.push("self.model.form_designer.get('verifyAdvanceRulesData')['" + item.v + "'][" + preElement + "]");
                        break;
                }
            }
            evalString.push('}');
            console.log(evalString.join(""));
            eval(evalString.join(""));
        }
    };

    this.getComponents = function() {
        var formElements = self.model.form_designer.get('formElements'),
            formElementsLen = formElements.length,
            elements = [];

        // 获取表单元素
        for (var i = 0; i < formElementsLen; i++) {
            if (formElements[i]['name'] === 'table') {
                var children = formElements[i]['children'];
                for (var j in children) {
                    if (children.hasOwnProperty(j) && children[j]['name'] !== 'label') {
                        if (children[j]['data'].hasOwnProperty('name')) {
                            elements.push(children[j]['data']['name']);
                        }
                    }
                }
            }
        }
        return elements;
    }
});