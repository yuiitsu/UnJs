/**
 * Prepare
 * 会话状态，权限检查，菜单
 */
Controller.extend('prepare', function () {
    //
    var self = this;
    //
    this.bind = {
        '#sidebar-container .menu-level-1 click.menu_1_': '_openModule',
        '#sidebar-container .menu-level-2 click.menu_2_': '_openModule',
        '#header #js-user-menu click.user_menu_': '_renderUserMenu',
        'body .user-menu-item click.user_menu_item_': '_userMenuAction'
    };

    this.index = function(callback) {
        // 数据监听
        var model = this.model.get(),
            module = this.params.a,
            method = this.params.m ? this.params.m : '';
        this.model.set('menuOpenModule', module);
        this.model.set('menuOpenMethod', method);
        this.watch(model, 'menuOpenModule', '_renderMenu');
        this.watch(model, 'menuOpenMethod', '_renderMenu');
        //
        this._checkAuthorization();
        //
        callback();
    };

    /**
     * 检查授权
     */
    this._checkAuthorization = function() {
        // 获取用户信息
        this.model.getUserInfo(function() {
            //
            $('#app').show();
            //
            self.output('sidebar', {}, $('#sidebar-container'));
            //
            self.output('header', {}, $('#header'));
            //
            self._getMenu();
        }, function() {
            console.log('GetUserInfo Failed.');
        });

    };

    /**
     * 获取菜单并渲染
     */
    this._getMenu = function() {
        // 向服务器请求数据
        this.model.getMenu(function() {
            // 渲染菜单到页面
            self._renderMenu();
        });
    };

    /**
     * 渲染菜单
     */
    this._renderMenu = function() {
        var menuList = this.model.get('menuList'),
            module = this.model.get('menuOpenModule'),
            method = this.model.get('menuOpenMethod'),
            moduleNodes = module.split('.');

        module = module ? module : this.params.a;

        this.output('menu', {
            openModule: moduleNodes[0],
            openMethod: module,
            list: menuList
        }, $('.menu-container'));
    };

    this._openModule = function(e) {
        var module = self.$(e).attr('data-module'),
            method = self.$(e).attr('data-method');

        module = module ? module : 'index';
        method = method ? method : '';
        if (method) {
            method = method ? method : 'index';
            this.callControl(module, method, {});
            //
        }
        this.model.set('menuOpenMethod', method);
        this.model.set('menuOpenModule', module);
        // this.model.set('menuOpenChild', module);
    };

    this._renderUserMenu = function(e) {
        var target = self.$(e);
        self.renderComponent('tooltip.view', {
            target: target,
            content: self.getView('module.prepare.view.user.menu', {})
        }).appendTo($('body'));
    };

    /**
     * 用户菜单事件处理，根本data-type调用对应的方法
     * @param e
     * @private
     */
    this._userMenuAction = function(e) {
        var target = self.$(e),
            dataType = target.attr('data-type');

        if (self.hasOwnProperty(dataType)) {
            self[dataType]();
        } else {
            self.log('方法不存在: ' + dataType, 'error');
        }
    };

    /**
     * 用户退出
     * @private
     */
    this._user_logout = function() {
        localStorage.setItem('token', '');
        self.jump('login', 'index', {a: 'login'});
    };

    /**
     * 修改密码
     * @private
     */
    this._user_password_update = function() {
        //
        self.renderComponent('modal.view', {
            title: '修改密码',
            body: self.getView('module.prepare.view.user.update_password', {}),
            callback: function (modal, res) {
                if (res === 'ok') {
                    //
                    if (self.callComponent({
                        name: 'verification'
                    }, {'form': $('#js-sys-user-password-form')})) {
                        var oldPassword = modal.el('#js-sys-user-old-password').val(),
                            newPassword = modal.el('#js-sys-user-new-password').val();

                        oldPassword = oldPassword ? $.trim(oldPassword) : '';
                        newPassword = newPassword ? $.trim(newPassword) : '';
                        self.model.updateUserPassword({
                            oldPwd: oldPassword,
                            newPwd: newPassword
                        }, modal.$confirm(), function(res) {
                            if (res.state === 0) {
                                modal.close();
                            } else {
                                self.notification.danger(res.message);
                            }
                        });
                    }
                }
            }
        }).appendTo($('body'));
    };

    this._user_edit = function() {
        //
        self.renderComponent('modal.view', {
            title: '修改用户资料',
            body: self.getView('module.prepare.view.user.update_info', {}),
            callback: function (modal, res) {
                if (res === 'ok') {
                    //
                    if (self.callComponent({
                        name: 'verification'
                    }, {'form': $('#js-sys-user-password-form')})) {
                        // var oldPassword = modal.el('#js-sys-user-old-password').val(),
                        //     newPassword = modal.el('#js-sys-user-new-password').val();

                        // oldPassword = oldPassword ? $.trim(oldPassword) : '';
                        // newPassword = newPassword ? $.trim(newPassword) : '';
                        // self.model.updateUserPassword({
                        //     oldPwd: oldPassword,
                        //     newPwd: newPassword
                        // }, modal.$confirm(), function(res) {
                        //     if (res.state === 0) {
                        //         modal.close();
                        //     } else {
                        //         self.notification.danger(res.message);
                        //     }
                        // });
                        console.log('update user password');
                    }
                }
            }
        }).appendTo($('body'));
    };
});