/**
 * Model Prepare
 */
Model.extend('prepare', function () {
    //
    var self = this;
    //
    this.default = {
        menuList: [],
        menuOpenModule: '',
        menuOpenChild: '',
        userId: '',
        userRole: {},
    };

    this.getUserInfo = function(success, failed) {
        var userId = localStorage.getItem('userId');
        this._get({
            url: '/api/v1/user/info',
            data: {
                userId: userId
            }
        }, function(res) {
            if (res.state === 0) {
                self.set('userId', userId);
                self.set('userRole', res.data.role[0]);
                success();
            } else {
                failed();
            }
        });
    };

    this.getMenu = function(callback) {
        this._get({
            url: '/api/v1/role/info',
            data: {
                roleId: self.get('userRole')['id']
            }
        }, function(res) {
            //
            var menuList = menuList = [
                    {
                        name: '首页',
                        module: 'index',
                        method: 'index'
                    }
                ],
                resList = res.data.stcReses,
                resLen = resList.length;

            for (var i = 0; i < resLen; i++) {
                self._buildMenu(resList[i], menuList);
            }
            self.set('menuList', menuList);
            //
            callback();
        });
    };

    /**
     * 修改用户密码
     * @param params
     *      params['oldPwd']
     *      params['newPwd']
     * @param target
     * @param callback
     */
    this.updateUserPassword = function(params, target, callback) {
        this._put({
            url: '/api/v1/user/pwd',
            data: params,
            loading: target
        }, function(res) {

            callback(res);
        });
    };

    /**
     * 构建菜单，将API数据转为可用于显示的菜单结构
     * @param data
     * @param menuList
     * @private
     */
    this._buildMenu = function(data, menuList) {
        if (data.resourceType === 1) {
            //
            var keys = data.key.split('_'),
                keyLen = keys.length,
                module = keys.join('.'),
                method = keyLen === 1 ? '': keys.splice(1, keyLen - 1).join('_'),
                children = data.children,
                childrenLen = children ? children.length : 0;
            //
            var menu = {
                'name': data.name,
                'module': module,
            };
            if (method) {
                menu['method'] = 'index';
            }
            menuList.push(menu);
            //
            if (childrenLen > 0) {
                var menuLen = menuList.length;
                menuList[menuLen - 1]['children'] = [];
                for (var i = 0; i < childrenLen; i++) {
                    self._buildMenu(children[i], menuList[menuLen - 1]['children']);
                }
            }
        }
    };
});
