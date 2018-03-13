/**
 * 自定义父类
 * @constructor
 */

var Core = Core.extends(function () {

    this.quitStatus = false;
    this.displayObject = document.getElementById('wm-main');

    this.$el = function () {
        return $(this.displayObject);
    };

    /**
     * 获取view组件
     * @param name
     * @param data
     */
    this.vc = function (name, data) {
        return this.view['component.' + name].init(data);
    };

    this.objIsEmpty = function (obj) {
        for (var i in obj) {
            return false;
        }
        return true;
    };

    /**
     * 同步加载文件
     * filePath 文件列表
     * callback 回调
     */
    this.asyncLoadScript = function (scriptList, libNameList, callback) {

        var taskLen = scriptList.length;
        if (taskLen <= 0) {
            return;
        }
        var existNum = 0;
        var done = this.pending(callback);
        for (var i = 0; i < taskLen; i++) {
            if (!WmJs.Lib.hasOwnProperty(libNameList[i])) {
                var element = this.createScript(scriptList[i]);
                this.appendToDom(element);
                WmJs.Lib[libNameList[i]] = scriptList[i];
                element.addEventListener('load', done());
            } else {
                existNum++;
            }
        }
        if (existNum === taskLen) {
            callback();
        }
    };

    /**
     * 模板输出
     * @param name 模板名
     * @param data 数据
     * @param object 输出对象
     */
    this.output = function (name, data, object) {
        var info = this._info || {},
            params = this.getParams() || {'a': 'index'};
        if (info.sub) {
            info = this._super._info || {};
        }
        //当调用者为控制器的时候且路由和控制器不是同一个的时候，不渲染
        if (info['type'] === 'controller' && info['name'] !== params['a']) {
            return false;
        }
        this.display(name, data, object || document.getElementById('wm-main'));
    };

    this.showMainView = function (templateName, data, displayObject) {
        $(displayObject).html(this.view[templateName].init(data));
    };

    /**
     * GET请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param go_on 在返回code不为0 的时候，是否执行successCallback 回调，默认不执行,可为对象或者boolean,为boolean的时候，默认将错误信息提示出来，为obj的时候，可以对默认行为进行配置{go:'是否执行成功回调',show_notification:'是否显示提示信息',msg:'显示信息，默认为后台传过来的值'}
     * @param errCallback 错误回调
     */
    this._get = function (options, successCallback, errCallback, go_on) {
        var self = this;
        options.type = "GET";
        return this._request_auth(options, successCallback, errCallback, go_on);
    };

    /**
     * POST请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     * @param go_on 在返回code不为0 的时候，是否执行successCallback 回调，默认不执行,可为对象或者boolean,为boolean的时候，默认将错误信息提示出来，为obj的时候，可以对默认行为进行配置{go:'是否执行成功回调',show_notification:'是否显示提示信息',msg:'显示信息，默认为后台传过来的值'}
     */
    this._post = function (options, successCallback, errCallback, go_on) {
        options.type = "POST";
        return this._request_auth(options, successCallback, errCallback, go_on);
    };

    /**
     * PUT请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     * @param go_on 在返回code不为0 的时候，是否执行successCallback 回调，默认不执行,可为对象或者boolean,为boolean的时候，默认将错误信息提示出来，为obj的时候，可以对默认行为进行配置{go:'是否执行成功回调',show_notification:'是否显示提示信息',msg:'显示信息，默认为后台传过来的值'}
     */
    this._put = function (options, successCallback, errCallback, go_on) {
        options.type = "PUT";
        return this._request_auth(options, successCallback, errCallback), go_on;
    };

    /**
     * DELETE请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     * @param go_on 在返回code不为0 的时候，是否执行successCallback 回调，默认不执行,可为对象或者boolean,为boolean的时候，默认将错误信息提示出来，为obj的时候，可以对默认行为进行配置{go:'是否执行成功回调',show_notification:'是否显示提示信息',msg:'显示信息，默认为后台传过来的值'}
     */
    this._delete = function (options, successCallback, errCallback, go_on) {
        options.type = "DELETE";
        return this._request_auth(options, successCallback, errCallback, go_on);
    };

    /**
     * 请求并检查是否登录
     * @param options 参数
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     * @param go_on 在返回code不为0 的时候，是否执行successCallback 回调，默认不执行,可为对象或者boolean,为boolean的时候，默认将错误信息提示出来，为obj的时候，可以对默认行为进行配置{go:'是否执行成功回调',show_notification:'是否显示提示信息',msg:'显示信息，默认为后台传过来的值'}
     * @returns {*}
     * @private
     */
    this._request_auth = function (options, successCallback, errCallback, go_on) {
        var self = this,
            go = false,
            show_notification = true,
            msg = null;
        if (wc.isBool(go_on)) {
            go = go_on;
        } else if (wc.isObject(go_on)) {
            go = !!go_on.go;
            show_notification = wc.isUndefined(go_on.show_notification) ? true : !!go_on.show_notification;
            msg = go_on.msg;
        }
        return this._request(options, function (res) {
            // todo.
        }, errCallback);
    };

    /**
     * 调用AJAX
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     * @param go_on 在返回code不为0 的时候，是否执行successCallback 回调，默认不执行
     * @private
     */
    this._request = function (options, successCallback, errCallback, go_on) {
        var self = this;
        var opt = {
            "url": options.url,
            "type": options.type,
            "dataType": options.dataType ? options.dataType : 'json',
            "timeout": 10000,
            "data": options.data,
            success: function (response) {
                // 请求成功，调用回函函数
                if (response === 'request error') {
                    if ($.isFunction(errCallback)) {
                        errCallback('请求失败，请重试');
                    }
                } else {
                    if ($.isFunction(successCallback)) {
                        successCallback(response);
                    }
                }
            },
            error: function () {
                // todo
            },
            complete: function (XMLHttpRequest, status) {
                // todo
            }
        };

        if (options.hasOwnProperty('headers') && options['headers']) {
            opt.headers = options.headers;
        }

        var ajaxTimer = this._ajax(opt);
    };
});