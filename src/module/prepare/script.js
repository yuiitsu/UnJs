/**
 * Prepare
 * 会话状态，权限检查，菜单
 */
Controller.extend('prepare', function () {
    //
    var self = this;
    //
    this.bind = {
        '#sidebar-container li click.menu_': '_openModule',
        '#header #js-user-menu click.user_menu_': '_renderUserMenu',
        'body .user-menu-item click.user_menu_item_': '_userMenuAction'
    };

    this.index = function(callback) {
        // 数据监听
        var model = this.model.get();
        this.model.set('menuOpenModule', this.params.a);
        this.watch(model, 'menuOpenModule', '_renderMenu');
        this.watch(model, 'menuOpenChild', '_renderMenu');
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
            parent = this.model.get('menuOpenChild');

        module = module ? module : this.params.a;

        this.output('menu', {
            openModule: module,
            openChild: parent,
            list: menuList
        }, $('.menu-container'));
    };

    this._openModule = function(e) {
        var module = this.$(e).attr('data-module'),
            method = this.$(e).attr('data-method');

        module = module ? module : 'index';
        if (method) {
            method = method ? method : 'index';
            this.callControl(module, method, {});
            //
            this.model.set('menuOpenModule', module);
        }
        this.model.set('menuOpenChild', module);
    };

    this._renderUserMenu = function(e) {
        var target = self.$(e);
        self.renderComponent('tooltip.view', {
            target: target,
            content: self.getView('module.prepare.user_menu', {})
        }).appendTo($('body'));
    };

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
        self.jump('login', 'index', {});
    };
});