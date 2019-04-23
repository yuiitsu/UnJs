/**
 * Model approvalAndColl insertAndSearch
 */
Model.extend('approvalAndColl.insertAndSearch', function () {
    //
    var self = this;

    this.default = {
        reportListJson: '',
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
        //
        formId: '568753424502358016'
    };

    this.queryReportList= function() {
        this._get({
            url: '/api/v1/form/report/list',
            data: this.get('search')
        }, function(res) {

        });
    }
});
