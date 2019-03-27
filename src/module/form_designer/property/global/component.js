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
                            var dataType = $(this).attr('data-type'),
                                target = null;

                            if ($(this).find('select').length > 0) {
                                target = $(this).find('select');
                            } else if ($(this).find('input').length > 0) {
                                target = $(this).find('input');
                            }
                            rules.push({t: dataType, v: $.trim(target.val())});
                        });
                        var verifyAdvanceRules = self.model.form_designer.get('verifyAdvanceRules');
                        verifyAdvanceRules.push(rules);
                        self.model.form_designer.set('verifyAdvanceRules', verifyAdvanceRules);

                        for (var i in verifyAdvanceRules) {
                            var evalString = ['self.model.form_designer.default.verifyAdvanceRulesFunc["0"] = function(callback) {'],
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
                                        }
                                        if (item.v === 'then') {
                                            evalString.push('){');
                                            evalString.push('}');
                                            isThen = true;
                                        }
                                        break;
                                    case 'element':
                                        preNodeVal = evalString[evalString.length - 1];
                                        if (!isThen) {
                                            if (preNodeVal === '=') {
                                                evalString[evalString.length - 2] = evalString[evalString.length - 2].replace('.val()', ".val($('.js-form-control[name=\"" + item.v + "\"]').val())");
                                                evalString.pop();
                                            } else {
                                                evalString.push("$('.js-form-control[name=\"" + item.v + "\"]').val()");
                                            }
                                        } else {
                                            index = preNodeVal === '}' ? evalString.length - 2 : evalString.length - 1;
                                            preNodeVal = evalString[index];
                                            preElement = evalString[index - 1];

                                            if (preNodeVal === '>' || preNodeVal === '<') {
                                                preSymbol = evalString.splice(index, 1)[0];
                                                preElement = evalString.splice(index - 1, 1)[9];
                                                evalString.splice(index - 1, 0, 'if ('+ preElement + preSymbol + item.v +') {return {status:true, element: "'+ verifyAdvanceRules[i][j - 2].v +'"};}else{return {status: false, element: "'+ verifyAdvanceRules[i][j - 2].v +'", message: "'+ preSymbol + item.v +'"};}');
                                            } else {
                                                evalString.splice(index + 1, 0, "$('.js-form-control[name=\""+ item.v +"\"]').val()");
                                            }
                                        }
                                        break;
                                    case 'symbol':
                                        if (!isThen) {
                                            evalString.push(item.v);
                                        } else {
                                            evalString.splice(evalString.length - 1, 0, item.v);
                                        }
                                        break;
                                    case 'custom':
                                        preNodeVal = evalString[evalString.length - 1];
                                        if (!isThen) {
                                            if (preNodeVal === '=') {
                                                evalString[evalString.length - 2] = evalString[evalString.length - 2].replace('.val()', '.val(' + item.v + ')');
                                                evalString.pop();
                                            } else if (preNodeVal === '>' || preNodeVal === '<') {
                                                preSymbol = evalString.pop();
                                                preElement = evalString.pop();
                                                evalString.push('if (' + preElement + preSymbol + item.v + ') {return {status:true, element: "' + verifyAdvanceRules[i][j - 2].v + '"};}else{return {status: false, element: "' + verifyAdvanceRules[i][j - 2].v + '", message: "' + preSymbol + item.v + '"};}');
                                            } else {
                                                evalString.push(item.v);
                                            }
                                        } else {
                                             index = preNodeVal === '}' ? evalString.length - 2 : evalString.length - 1;
                                            preNodeVal = evalString[index];
                                            preElement = evalString[index - 1];

                                             if (preNodeVal === '>' || preNodeVal === '<') {
                                                preSymbol = evalString.splice(index, 1)[0];
                                                preElement = evalString.splice(index - 1, 1)[0];
                                                evalString.splice(index - 1, 0, 'if (' + preElement + preSymbol + item.v + ') {return {status:true, element: "' + verifyAdvanceRules[i][j - 2].v + '"};}else{return {status: false, element: "' + verifyAdvanceRules[i][j - 2].v + '", message: "' + preSymbol + item.v + '"};}');
                                            } else {
                                                evalString.splice(index + 1, 0, item.v);
                                            }
                                        }
                                        break;
                                }
                            }
                            evalString.push('}');
                            console.log(evalString.join(""));
                            eval(evalString.join(""));
                        }
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