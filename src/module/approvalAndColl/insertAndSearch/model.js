/**
 * Model approvalAndColl insertAndSearch
 */
Model.extend('approvalAndColl.insertAndSearch', function () {
    //
    var self = this;

    this.default = {
        reportDataJson: '',
        search: {
            index: 1,
            pageSize: 15,
            formId: '',
            systemId: '',
            status: '',
            userId: '',
            reportKey: '',
            time: ''
        },
        searchJson: '',
        formConditionJson: '',
        //
        formId: '568753424502358016',
        reportId: ''
    };

    this.queryReportList= function() {
        this._get({
            url: '/api/v1/form/report/data/list',
            data: this.get('search')
        }, function(res) {
            if (res.state === 0) {
                self.set('reportDataJson', JSON.stringify(res.data));
            } else {
                self.notification.danger(res.message);
            }
        });
    };

    this.queryReportDetail = function(id, callback) {
        this._get({
            url: '/api/v1/form/report/info',
            data: {
                id: id
            }
        }, function(res) {
            if (res.state === 0) {
                callback(res.data);
            } else {
                self.notification.danger(res.message);
            }
        });
    };

    this.queryFormCondition = function(callback) {
        this._get({
            url: '/api/v1/form/conditionInfo',
            data: {
                formId: this.get('formId')
            }
        }, function(res) {
            if (res.state === 0) {
                //
                try {
                    var formCondition = JSON.parse(res.data);
                    if (callback) {
                        callback(formCondition);
                    } else {
                        self.set('formConditionJson', JSON.stringify({
                            list: formCondition,
                            time: new Date().getTime()
                        }));
                    }
                } catch (e) {
                    self.notification.danger('查询条件数据有误，请刷新重试');
                }
            } else {
                self.notification.danger(res.message);
            }
        });
    };

    this.saveReport = function(data) {
        var modelFormDesigner = self.callModel('form_designer'),
            formData = modelFormDesigner.get('formData'),
            reportId = this.get('reportId');

        data['formId'] = formData['formId'];
        data['systemId'] = formData['systemId'];
        //
        if (reportId) {
            data['id'] = reportId;
            //
            this._put({
                url: '/api/v1/form/report/update',
                data: data
            }, function (res) {
                if (res.state === 0) {
                    self.set('reportId', res.data.id);
                    self.notification.success('保存成功');
                } else {
                    self.notification.danger(res.message);
                }
            });
        } else {
            this._post({
                url: '/api/v1/form/report/add',
                data: data
            }, function (res) {
                if (res.state === 0) {
                    self.set('reportId', res.data.id);
                    self.notification.success('保存成功');
                } else {
                    self.notification.danger(res.message);
                }
            });
        }
    };

    this.submit = function() {
        var reportId = this.get('reportId');
        //
        this._put({
            url: '/api/v1/form/report/data/submit',
            data: {
                id: reportId
            }
        }, function(res) {
            if (res.state === 0) {
                self.notification.success('提交成功');
            } else {
                self.notification.danger(res.message);
            }
        });
    };
});
