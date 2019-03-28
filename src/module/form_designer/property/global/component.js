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
            $('.js-property-select-verify-tips-type').on('change', function () {
                var value = $(this).val();
                self.model.form_designer.set('verifyTipsType', value);
            });
        },
        setTitle: function () {
            $('.js-form-designer-title-input').on('input', function () {
                self.model.form_designer.set('formTitle', $.trim($(this).val()));
            });
        },
        openGlobalRule: function () {
            $('.js-form-designer-add-global-rules').off('click').on('click', function () {
                self.renderComponent('modal.view', {
                    title: '添加规则',
                    body: self.getView('module.form_designer.rules_editor.view', []),
                    callback: function (modal, res) {
                        //
                        var rules = [];
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
                        var verifyAdvanceRules = self.model.form_designer.get('verifyAdvanceRules');
                        verifyAdvanceRules.push(rules);
                        self.model.form_designer.set('verifyAdvanceRules', verifyAdvanceRules);
                        self.model.form_designer.set('verifyAdvanceRulesString', JSON.stringify(verifyAdvanceRules));

                        //
                        var symbolTransformList = ['+', '-', '*', '/'],
                            symbolConditionList = ['>', '<', '>=', '<=', '!=', '=='];

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
                                                    if (symbolTransformList.indexOf(preNodeVal) !== -1) {
                                                        evalString.push("parseInt(" + elementValue + ")");
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
                                    case 'keyOn':
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
                            //
                            modal.close();
                        }
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

                        name = name ? $.trim(name) : '';
                        data = data ? $.trim(data) : '';
                        savedData[name] = JSON.parse(data);
                        self.model.form_designer.set('verifyAdvanceRulesData', savedData);
                        self.model.form_designer.set('verifyAdvanceRulesDataString', JSON.stringify(savedData));
                        modal.close();
                    }
                }).appendTo($('body'));
            });
        },
        editGlobalRuleData: function () {
            $('.js-verify-advance-rules-data').off('click').on('click', function () {
                var key = $(this).text(),
                    verifyAdvanceRulesData = self.model.form_designer.get('verifyAdvanceRulesData'),
                    data = verifyAdvanceRulesData.hasOwnProperty(key) ? verifyAdvanceRulesData[key] : {};

                self.renderComponent('modal.view', {
                    title: '编辑数据对象',
                    body: self.getView('module.form_designer.rules_editor.data_form', {
                        name: key,
                        data: JSON.stringify(data)
                    }),
                    callback: function (modal) {
                        var name = modal.el('#form-designer-rules-editor-data-name').val(),
                            originName = modal.el('#form-designer-rules-editor-data-origin-name').val(),
                            data = modal.el('#form-designer-rules-editor-data').val(),
                            savedData = self.model.form_designer.get('verifyAdvanceRulesData');

                        name = name ? $.trim(name) : '';
                        data = data ? $.trim(data) : '';
                        delete savedData[originName];
                        savedData[name] = JSON.parse(data);
                        self.model.form_designer.set('verifyAdvanceRulesData', savedData);
                        self.model.form_designer.set('verifyAdvanceRulesDataString', JSON.stringify(savedData));
                        modal.close();
                    }
                }).appendTo($('body'));
            })
        },
        editGlobalRule: function () {
            $('.js-verify-advance-rules').off('click').on('click', function () {
                var index = $(this).attr('data-key'),
                    verifyAdvanceRules = self.model.form_designer.get('verifyAdvanceRules'),
                    verifyAdvanceRulesLen = verifyAdvanceRules.length,
                    formElements = self.model.form_designer.get('formElements'),
                    formElementsLen = formElements.length,
                    elements = [],
                    data = [];

                // 获取表单元素
                for (var j= 0; i < formElementsLen; i++) {
                    if (formElements[j]['name'] === 'table') {
                        var children = formElements[j]['children'];
                        for (var c in children) {
                            if (children.hasOwnProperty(c) && children[c]['name'] !== 'label') {
                                if (children[c]['data'].hasOwnProperty('name')) {
                                    elements.push(children[c]['data']['name']);
                                }
                            }
                        }
                    }
                }

                for (var i = 0; i < verifyAdvanceRulesLen; i++) {
                    if (i === parseInt(index)) {
                        if (verifyAdvanceRules[i].t === 'element') {
                            data = {
                                elements: elements,
                                v: verifyAdvanceRules[i]
                            }
                        } else {
                            data = verifyAdvanceRules[i];
                        }
                    }
                }
                console.log(data);
                self.renderComponent('modal.view', {
                    title: '编辑规则',
                    body: self.getView('module.form_designer.rules_editor.view', data),
                    callback: function (modal, res) {

                    }
                }).appendTo($('body'));
            });
        },
        deleteGlobalRuleData: function () {
            $('.form-designer-global-list .js-form-designer-delete-rules-data').off('click').on('click', function () {
                var key = $(this).attr('data-key'),
                    savedData = self.model.form_designer.get('verifyAdvanceRulesData');

                if (savedData.hasOwnProperty(key)) {
                    delete savedData[key];
                }
                self.model.form_designer.set('verifyAdvanceRulesData', savedData);
                self.model.form_designer.set('verifyAdvanceRulesDataString', JSON.stringify(savedData));
            });
        },
        deleteGlobalRule: function () {
            $('.form-designer-global-list .js-form-designer-delete-rules').off('click').on('click', function () {
                var key = $(this).attr('data-key'),
                    savedRules = self.model.form_designer.get('verifyAdvanceRules'),
                    savedRulesLen = savedRules.length;

                for (var i = 0; i < savedRulesLen; i++) {
                    if (i === parseInt(key)) {
                        savedRules.splice(i, 1);
                    }
                }
                self.model.form_designer.set('verifyAdvanceRules', savedRules);
                self.model.form_designer.set('verifyAdvanceRulesString', JSON.stringify(savedRules));
            });
        }
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function () {
    };
});