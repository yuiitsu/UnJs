/**
 * Model Sys Maintain
 */
Model.extend('sys.maintain', function () {
    //
    var self = this;

    this.default = {
        sysListJson: '',
        search: {
            index: 1,
            pageSize: 15,
            systemid: '',
            systemname: '',
            status: ''
        },
        searchJson: ''
    };

    /**
     * 查询系统列表
     */
    this.querySysList = function() {
        //
        this._get({
            url: '/api/v1/maintain/list',
            data: this.get('search')
        }, function(res) {
            if (res.state === 0) {
                self.set('sysListJson', JSON.stringify(res.data.result));
            }
        });
    };

    /**
     * 保存系统信息
     * @param params
     *      params['id']
     *      params['name']
     * @param callback
     */
    this.saveSystem = function(params, callback) {
        if (!params.name) {
            self.notification.danger('参数错误');
            return false;
        }
        // 执行保存
        if (params.id) {
            // 修改
            this._put({
                url: '/api/v1/maintain/update',
                data: {
                    systemName: params.name,
                    id: params.id
                },
                loading: params.target
            }, function(res) {
                if (res.state === 0) {
                    self.querySysList();
                    self.notification.success('保存成功');
                } else {
                    self.notification.danger(res.message);
                }
                //
                callback();
            })
        } else {
            // 新增
            this._post({
                url: '/api/v1/maintain/add',
                data: {
                    systemname: params.name,
                    id: params.id
                },
                loading: params.target
            }, function (res) {
                if (res.state === 0) {
                    self.querySysList();
                    self.notification.success('保存成功');
                } else {
                    self.notification.danger(res.message);
                }
                //
                callback();
            });
        }
    };

    /**
     * 停止系统
     * @param params
     *      params['id']
     *      params['status']
     * @param callback
     */
    this.stopSystem = function(params, callback) {
        //
        this._put({
            url: '/api/v1/maintain/updateStatus',
            data: params,
            loading: params.target
        }, function(res) {
            if (res.state === 0) {
                self.querySysList();
                self.notification.success('操作成功');
            } else {
                self.notification.danger(res.message);
            }
            //
            callback();
        });
    };

    /**
     * 停止系统
     * @param id
     * @param callback
     */
    this.delSystem = function(id, callback) {
        //
        this._post({
            url: '/api/v1/maintain/remove',
            data: {
                id: id
            }
        }, function(res) {
            if (res.state === 0) {
                self.querySysList();
                self.notification.success('操作成功');
            } else {
                self.notification.danger(res.message);
            }
            //
            callback();
        });
    };
});
