/**
 * 调查表管理 - 录入与查询
 */
Controller.extend('approvalAndColl.insertAndSearch', function () {

    var self = this;
    //
    this.bind = {
        '#js-report-new click': '_event.newForm',
        '#js-report-save click': '_report'
    };

    this.index = function() {
        //
        this.watch(this.model.get(), 'reportListJson', this._renderList);
        //
        this.output('view');
        //
        this.model.queryReportList();
    };

    this.reportForm = function() {
        var modelFormDesigner = self.callModel('form_designer');
        modelFormDesigner.set('formData.formId', self.model.get('formId'));
        modelFormDesigner.queryFormDesignerDetail(function() {
            // 加载高级规则和源数据
            modelFormDesigner.queryFormAdvanceRules();
            modelFormDesigner.queryFormSourceData();
            // 获取form设计数据，渲染页面
            var data = modelFormDesigner.getFormRenderData();
            self.output('report_form', data);
        });
    };

    /**
     * 渲染列表
     * @returns {boolean}
     * @private
     */
    this._renderList = function() {
        var reportListJson = self.model.get('reportListJson'),
            reportList = [];

        try {
            reportList = JSON.parse(reportListJson);
        } catch (e) {
            self.notification.danger('数据有误，请刷新重试');
            return false;
        }

        //
        this.output('report_list', reportList, $('#js-list-container'));
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
            }
        }
        $('#js-form-verify-result').html(message);
    };

    this._event = {
        newForm: function() {
            self.callControl('approvalAndColl.insertAndSearch', 'reportForm');
        }
    }
});