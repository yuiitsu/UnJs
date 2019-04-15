/**
 * Model Sys User
 */
Model.extend('sys.user', function () {
    //
    var self = this;

    this.default = {
        userListJson: '',
        search: {
            index: 1,
            pageSize: 15,
            userName: '',
            loginName: '',
            areaName: '',
            status: ''
        },
        searchJson: ''
    };

    /**
     * 查询用户列表
     */
    this.queryList = function() {
        //
        this._get({
            url: '/api/v1/user/list',
            data: this.get('search')
        }, function(res) {
            if (res.state === 0) {
                self.set('userListJson', JSON.stringify(res.data.result));
            }
        });
    };

    this.saveUser = function() {};

    /**
     * 重置用户密码
     * @param userId
     * @param target
     * @param callback
     */
    this.resetPassword = function(userId, target, callback) {
        this._put({
            url: '/api/v1/user/resetPwd',
            data: {
                userId: userId
            },
            loading: target
        }, function(res) {
            callback(res);
        });
    };
});
