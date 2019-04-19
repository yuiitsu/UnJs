/**
 * Model Form Designer Page
 */
Model.extend('form_designer.page', function () {
    //
    var self = this;

    this.default = {
        formListJson: '',
        search: {
            index: 1,
            pageSize: 15,
            formName: '',
            status: '',
            systemId: '',
            time: ''
        },
        searchJson: ''
    };

    /**
     * 查询表单
     */
    this.queryFormList = function() {
        //
        this._get({
            url: '/api/v1/form/list',
            data: this.get('search')
        }, function(res) {
            if (res.state === 0) {
                var o = {
                    list: res.data.result,
                    time: new Date().getTime()
                };
                self.set('formListJson', JSON.stringify(o));
            }
        });
    };

    /**
     * 保存表单
     * @param data 保存数据(*)
     *      data.formId 修改时必要
     *      data.systemId
     *      data.formName
     *      data.formType
     *      data.description
     * @param target
     * @param callback
     */
    this.saveForm = function(data, target, callback) {
        if (data.formId) {
            this._put({
                url: '/api/v1/form/update',
                data: data,
                loading: target
            }, function (res) {
                if (res.state === 0) {
                    self.queryFormList();
                    self.notification.success('保存成功');
                } else {
                    self.notification.danger(res.message);
                }
                //
                callback();
            });
        } else {
            this._post({
                url: '/api/v1/form/add',
                data: data,
                loading: target
            }, function (res) {
                if (res.state === 0) {
                    self.queryFormList();
                    self.notification.success('保存成功');
                } else {
                    self.notification.danger(res.message);
                }
                //
                callback();
            });
        }
    };

    this.delForm = function(formId, callback) {
        this._post({
            url: '/api/v1/form/remove',
            data: {
                formId: formId
            }
        }, function(res) {
            if (res.state === 0) {
                self.queryFormList();
                self.notification.success('操作成功');
            } else {
                self.notification.danger(res.message);
            }
            //
            callback();
        });
    };
});