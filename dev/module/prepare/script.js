/**
 * Prepare
 * 会话状态，权限检查，菜单
 */
Controller.extend('prepare', function () {
    //
    var self = this;
    //
    this.bind = {
        '#sidebar-container li click.menu_': 'openModule'
    };

    this.index = function(callback) {
        // 数据监听
        var model = this.model.get();
        this.model.set('menuOpenModule', this.params.a);
        this.watch(model, 'menuOpenModule', 'renderMenu');
        this.watch(model, 'menuOpenChild', 'renderMenu');
        //
        this.checkAuthorization();
        //
        callback();
    };

    /**
     * 检查授权
     */
    this.checkAuthorization = function() {
        //
        this.output('layout', {}, $('#sidebar-container'));
        //
        this.output('header', {}, $('#header'));
        //
        this.getMenu();
    };

    /**
     * 获取菜单并渲染
     */
    this.getMenu = function() {
        // 向服务器请求数据
        // 渲染菜单到页面
        this.renderMenu();
    };

    /**
     * 渲染菜单
     */
    this.renderMenu = function() {
        var module = this.model.get('menuOpenModule'),
            parent = this.model.get('menuOpenChild');

        module = module ? module : this.params.a;

        this.output('menu', {
            openModule: module,
            openChild: parent,
            list: [
                {
                    name: '首页',
                    module: 'index',
                    method: 'index'
                },
                {
                    name: '表单设计',
                    module: 'form_designer',
                    method: 'index'
                },
                {
                    name: '测试模块',
                    module: 'test',
                    children: [
                        {
                            name: '二级菜单一',
                            module: 'test_child',
                            method: 'index'
                        },
                        {
                            name: '二级菜单二',
                            module: 'test_child',
                            method: 'index'
                        }
                    ]
                }
            ]
        }, $('.menu-container'));
    };

    this.openModule = function(e) {
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
});