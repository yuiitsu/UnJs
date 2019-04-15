/**
 * 系统管理 - 用户管理
 */
Controller.extend('sys.user', function () {

    var self = this;

    this.bind = {
        '#js-page-search click': '_search',
        '#js-new click': '_userForm',
        '#js-sys-list-container .js-user-reset-password click.user_reset_password_': '_resetPassword',
        '#js-sys-list-container .js-sys-del click.sys_del_': '_sysDel'
    };

    this.index = function() {
        //
        this.watch(this.model.get(), 'userListJson', this._renderList);
        this.watch(this.model.get(), 'searchJson', this.model.queryList);
        //
        this.output('layout');
        //
        this.model.queryList();
    };

    /**
     * 搜索
     * @private
     */
    this._search = function() {
        var username = $.trim($('#js-search-username').val()),
            loginName = $.trim($('#js-search-login-name').val()),
            areaName = $.trim($('#js-search-area-name').val()),
            status = $('#js-search-status').val();

        this.model.set('search.userName', username);
        this.model.set('search.loginName', loginName);
        this.model.set('search.areaName', areaName);
        this.model.set('search.status', status);
        this.model.set('searchJson', JSON.stringify(this.model.get('search')));
    };

    /**
     * 渲染列表
     * @private
     */
    this._renderList = function() {
        var listJson = this.model.get('userListJson'),
            currentUserId = localStorage.getItem('userId'),
            list = [];

        try {
            list = JSON.parse(listJson);
        } catch (e) {
            self.log('SysListJson parse failed.', 'danger');
        }

        this.output('list', {list: list, currentUserId: currentUserId}, $('#js-sys-list-container'));
    };

    /**
     * 新增用户
     * @private
     */
    this._userForm = function(e) {
        var target = this.$(e),
            dataId = target.attr('data-id'),
            dataName = target.attr('data-name'),
            formTitle = dataId ? '编辑用户' : '新增用户';

        dataId = dataId ? dataId : '';
        dataName = dataName ? dataName : '';
        //
        self.renderComponent('modal.view', {
            title: formTitle,
            body: self.getView('module.sys.user.user_form', {
                name: dataName
            }),
            callback: function (modal, res) {
                if (res === 'ok') {
                    //
                    if (self.callComponent({
                        name: 'verification'
                    }, {'form': $('#js-sys-maintain-form')})) {
                        var sysName = modal.el('#js-sys-maintain-name').val();
                        sysName = sysName ? $.trim(sysName) : '';
                        self.model.saveSystem({
                            id: dataId,
                            name: sysName
                        }, function() {
                            modal.close();
                        });
                    }
                }
            }
        }).appendTo($('body'));
    };

    /**
     * 重置用户密码
     * @private
     */
    this._resetPassword = function(e) {
        var target = self.$(e),
            userId = target.attr('data-user-id');

        if (!userId) {
            self.notification.danger('数据有误，请刷新重试');
            return false;
        }
        //
        self.callComponent({
            name: 'confirm'
        }, {
            message: '确定要执行此操作吗？',
            callback: function(confirm, target) {
                self.model.resetPassword(userId, target, function(res) {
                    if (res.state === 0) {
                        self.notification.success('重置成功');
                    } else {
                        self.notification.danger(res.message);
                    }
                    confirm.close();
                });
            }
        });
    };
});
