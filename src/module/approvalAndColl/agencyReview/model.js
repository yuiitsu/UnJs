/**
 * Model approvalAndColl agencyReview
 */
Model.extend('approvalAndColl.agencyReview', function () {
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

    this.queryReportList = function () {
        this._get({
            url: '/api/v1/form/report/data/agentList',
            data: this.get('search')
        }, function (res) {
            if (res.state === 0) {
                self.set('reportDataJson', JSON.stringify(res.data));
            } else {
                self.notification.danger(res.message);
            }
        });
    };

    this.review = function(isPass) {
        var reportId = this.get('reportId');
        //
        this._put({
            url: '/api/v1/form/report/data/review',
            data: {
                id: reportId,
                isPass: isPass
            }
        }, function(res) {
            if (res.state === 0) {
                self.notification.success('审核成功');
            } else {
                self.notification.danger(res.message);
            }
        });
    };
});