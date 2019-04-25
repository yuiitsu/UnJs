/**
 * 调查表管理 - 录入与查询
 */
Controller.extend('approvalAndColl.insertAndSearch', function () {

    var self = this;
    //
    this.bind = {
        '#js-sys-search click': '_search',
        '#js-report-new click': '_event.newForm',
        '#js-list-container .js-list-edit click.edit_': '_event.newForm',
        '#js-report-save click': '_report',
        '#js-report-submit click': '_submit',
    };

    this.index = function() {
        //
        this.watch(this.model.get(), 'formConditionJson', this._renderLayout);
        this.watch(this.model.get(), 'reportDataJson', this._renderList);
        this.watch(this.model.get(), 'searchJson', this.model.queryReportList);
        //
        this.model.queryFormCondition();
    };

    this.reportForm = function() {
        //
        this.watch(this.model.get(), 'reportId', this._renderSubmitButton);
        //
        var params = self.getParams(),
            id = params ? params.id : '',
            modelFormDesigner = self.callModel('form_designer');

        modelFormDesigner.set('formData.formId', self.model.get('formId'));
        modelFormDesigner.queryFormDesignerDetail(function() {
            // 加载高级规则和源数据
            modelFormDesigner.queryFormAdvanceRules();
            modelFormDesigner.queryFormSourceData();
            // 获取form设计数据，渲染页面
            var data = modelFormDesigner.getFormRenderData();
            // 如果有id，获取已填表单数据
            if (id) {
                self.model.queryReportDetail(id, function(res) {
                    self.output('report_form', data);
                    //
                    self.model.set('reportId', id);
                    // 将数据渲染到表单中
                    var reportData = res.reportData;
                    try {
                        reportData = JSON.parse(reportData);
                    } catch (e) {
                        self.notification.danger('数据解析有误，请刷新重试');
                        return false;
                    }
                    //
                    $('.js-form-control').each(function() {
                        var name = $(this).attr('name');
                        if (reportData.hasOwnProperty(name)) {
                            var value = reportData[name];
                            if (Object.prototype.toString.call(value) === '[object Object]') {
                                $(this).val(value.value);
                                $(this).attr('data-item-value', value.itemValue);
                            } else {
                                $(this).val(reportData[name]);
                            }
                        }
                    });
                });
            } else {
                self.output('report_form', data);
            }
        });
    };

    this._renderLayout = function() {
        var formConditionJson = self.model.get('formConditionJson'),
            formCondition = [];
        try {
            formCondition = JSON.parse(formConditionJson)['list'];
        } catch (e) {
        }
        //
        var formConditionLen = formCondition.length;
        for (var i = 0; i < formConditionLen; i++) {
            formCondition[i]['elements']['data']['placeholder'] = formCondition[i]['name'];
            formCondition[i]['elements']['data']['component'] = formCondition[i]['elements']['name'];
        }
        //
        this.output('view', {searchCondition: formCondition});
        //
        this.model.queryReportList();
    };

    /**
     * 渲染列表
     * @returns {boolean}
     * @private
     */
    this._renderList = function() {
        var reportDataJson = self.model.get('reportDataJson'),
            formCondition = self.model.get('formConditionJson'),
            reportPageData = {},
            reportList = [],
            allColumn = [];

        try {
            reportPageData = JSON.parse(reportDataJson);
            reportList = reportPageData.result;
            formCondition = JSON.parse(formCondition)['list'];
        } catch (e) {
            self.notification.danger('数据有误，请刷新重试');
            return false;
        }

        // 获取所有字段信息
        var reportListLen = reportList.length;
        if (reportListLen > 0) {
            for (var i = 0; i < reportListLen; i++) {
                for (var j in reportList[i]['reportData']) {
                    if (reportList[i]['reportData'].hasOwnProperty(j)) {
                        if (Object.prototype.toString.call(reportList[i]['reportData'][j]) === '[object Object]') {
                            reportList[i]['reportData'][j] = reportList[i]['reportData'][j]['value']
                        }
                        if (i === 0) {
                            allColumn.push(i);
                        }
                    }
                }
            }
        }
        this.output('report_list', {allColumn: allColumn, useColumn: formCondition, data: reportPageData}, $('#js-list-container'));
    };

    this._search = function() {
        var reportKey = {},
            existKey = false;
        //
        $('.js-form-control').each(function() {
            var name = $(this).attr('name'),
                value = $.trim($(this).val()),
                component = $(this).attr('component');

            if (value) {
                reportKey[name] = value;
                reportKey[name + '_type'] = component === 'input' ? 'like' : 'equal';
                existKey = true;
            }
        });
        var search = self.model.get('search');
        var status = $('#js-sys-search-status').val();
        search.time = new Date().getTime();
        search.status = status ? status : '';
        search.reportKey = reportKey;
        self.model.set('searchJson', JSON.stringify(search));
    };

    this._renderSubmitButton = function() {
        var reportId = self.model.get('reportId');
        if (!reportId) {
            $('#js-report-submit').attr('disabled', true);
        } else {
            $('#js-report-submit').attr("disabled", false);
        }
    };

    this._report = function() {
        var message = '<span class="color-danger">校验失败!</span>';
        if (self.callComponent({name: 'verification'})) {
            // 执行高级规则
            var modelFormDesigner = self.callModel('form_designer');
            var verifyAdvanceRulesFunc = modelFormDesigner.get('verifyAdvanceRulesFunc'),
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
                // 搜集数据，保存数据
                var postData = {
                    reportData: {},
                    reportKey: {}
                };

                $('.js-form-control').each(function() {
                    var name = $(this).attr('name'),
                        itemValue = $(this).attr('data-item-value'),
                        isSearchColumn = $(this).attr('issearchcolumn'),
                        value = $.trim($(this).val());

                    //
                    if (name) {

                        if (itemValue) {
                            value = {
                                itemValue: itemValue,
                                value: value
                            }
                        }
                        postData['reportData'][name] = value;
                        if (isSearchColumn === 'yes') {
                            postData['reportKey'][name] = value;
                        }
                    }
                });
                //
                self.model.saveReport(postData);
            }
        }
        $('#js-form-verify-result').html(message);
    };

    this._submit = function() {
        this.model.submit();
    };

    this._event = {
        newForm: function(e) {
            var target = self.$(e),
                id = target.attr('data-id');

            id = id ? id : '';
            self.callControl('approvalAndColl.insertAndSearch', 'reportForm', {id: id});
        }
    }
});