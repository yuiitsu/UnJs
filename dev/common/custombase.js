/**
 * 自定义父类
 * @constructor
 */
var Core = _core.extends(function () {
    //
    this.displayObject = document.getElementById('container');

    /**
     *
     * @returns {JQuery<HTMLElement> | jQuery | HTMLElement}
     */
    this.$el = function () {
        return $(this.displayObject);
    };

    this.getScreen = function (type) {
        var result = [];
        result['scrollTop'] = window.self.document.documentElement.scrollTop ?
            window.self.document.documentElement.scrollTop : window.self.document.body.scrollTop;
        result['scrollHeight'] = window.self.document.documentElement.scrollHeight ?
            window.self.document.documentElement.scrollHeight : window.self.document.body.scrollHeight;
        result['clientHeight'] = window.self.document.documentElement.clientHeight ?
            window.self.document.documentElement.clientHeight : window.self.document.body.clientHeight;
        result['clientWidth'] = window.self.document.documentElement.clientWidth ?
            window.self.document.documentElement.clientWidth : window.self.document.body.clientWidth;

        return result[type];
    };

    /**
     * 获取当前页面地址或指定地址
     * @param url
     * @returns {string}
     */
    this.getPathUrl = function (url) {
        url = url ? encodeURI(encodeURIComponent(url)) : window.location.pathname + window.location.search;
        return url;
    };

    /**
     * 获取view组件
     * @param name
     * @param data
     */
    this.vc = function (name, data) {
        return this.view['component.' + name].init(data);
    };

    /**
     * 模板输出
     * @param name 模板名
     * @param data 数据
     * @param object 输出对象
     */
    this.output = function (name, data, object) {
        this.display(name, data, object || $('#container'));
    };

    /**
     * 获取模板数据
     * @param name
     * @param data
     */
    this.get_view = function (name, data) {
        try {
            return this.view[name].init(data);
        } catch (e) {
            console.warn(name + '模版找不到');
            console.error(e);
            return '<div>模版未找到</div>';
        }
    };

    /**
     * 跳转地址
     * @param name
     * @param method
     * @param params
     * @param is_www
     * @params replace
     */
    this.jump = function (name, method, params, is_www, replace) {
        var paramsList = [];
        params['m'] = method;
        for (var i in params) {
            if (i === 'm' && method) {
                paramsList.push(i + '=' + method);
            } else {
                if (i === 'shop_id') {
                    params[i] = wmShopId;
                }
                paramsList.push(i + '=' + params[i]);
            }
        }
        //var host = '';
        var host = window.location.origin;
        var href = name + '?' + paramsList.join('&');
        href = host ? host + '/' + href : href;
        if (replace) {
            window.location.replace(href);
        } else {
            location.href = href;
        }
    };

    /**
     * 全屏模板输出
     * @param name 模板名
     * @param data 数据
     * @param object 输出对象
     */
    this.outputFull = function (name, data, object) {
        var fullContainer = document.getElementById('wmContainer-full');
        $(fullContainer).removeClass('hidden');
        fullContainer.innerHTML = this.view[name].init(data);
    };

    this.closeFull = function () {
        $('#wmContainer-full').addClass('hidden');
    };

    //产生唯一随机数
    this.guid = function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };

    /**
     * GET请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     */
    this._get = function (options, successCallback, errCallback) {
        options.type = "GET";
        return this._request_auth(options, successCallback, errCallback);
    };

    /**
     * POST请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     */
    this._post = function (options, successCallback, errCallback) {
        options.type = "POST";
        return this._request_auth(options, successCallback, errCallback);
    };

    /**
     * PUT请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     */
    this._put = function (options, successCallback, errCallback) {
        options.type = "PUT";
        return this._request_auth(options, successCallback, errCallback);
    };

    /**
     * DELETE请求
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     */
    this._delete = function (options, successCallback, errCallback) {
        options.type = "DELETE";
        return this._request_auth(options, successCallback, errCallback);
    };

    /**
     * 请求并检查是否登录
     * @param options 参数
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     * @returns {*}
     * @private
     */
    this._request_auth = function (options, successCallback, errCallback) {
        var self = this;
        var request_num = 1;
        return this._request(options, function response(res) {
            if (options['needless_login']) {
                successCallback(res);
            } else {
                if (res && res.hasOwnProperty('code')) {
                    if (res.code === 1007) {
                        // 调起登录组件
                        request_num++;
                        if (request_num > 2) {
                            //防止死循环
                            successCallback(res);
                            return;
                        }
                        self.callComponent({
                            name: 'login.login',
                            callback: function () {
                                self._request(options, response)
                            },
                            needless_check: true
                        }, {});

                    } else {
                        successCallback(res);
                    }
                } else {
                    // 数据异常
                }
            }
        }, errCallback);
    };

    /**
     * 调用AJAX
     * @param options 参数对象
     * @param successCallback 成功回调
     * @param errCallback 错误回调
     * @private
     */
    this._request = function (options, successCallback, errCallback) {
        var self = this;
        if (options['loading']) {
            this.callComponent({
                name: 'common.loading'
            }, {
                action: 'show',
                object: options.loading.object
            });
        }

        var opt = {
            "url": options.url,
            "type": options.type,
            "dataType": options.dataType ? options.dataType : 'json',
            "timeout": 10000,
            "data": options.data,
            success: function (response) {
                self.callComponent({
                    name: 'common.loading'
                }, {
                    action: 'hide'
                });
                // 请求成功，调用回调函数
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
                self.callComponent({
                    name: 'common.loading'
                }, {
                    action: 'hide'
                });
                ajaxTimer.abort();
                console.log('ajax error');
                if ($.isFunction(errCallback)) {
                    errCallback('请求失败,请重试');
                }
                console.log('ajax request error');
                !options.no_show_error && self.callComponent({
                    name: 'common.top_notifications',
                    data: {
                        msg: '请求失败，请重试',
                        type: 'danger'
                    }
                }, 'show');
            },
            complete: function (XMLHttpRequest, status) {
                //self.callComponent({
                //    name: 'common.loading'
                //}, {
                //    action: 'hide'
                //});
                if (status === 'timeout') {
                    ajaxTimer.abort();
                    console.log('ajax timeout');
                    if ($.isFunction(errCallback)) {
                        errCallback('ajax request timeout');
                    }
                    console.log('ajax request timeout');
                }
            }
        };

        if (options.hasOwnProperty('headers') && options['headers']) {
            opt.headers = options.headers;
        }

        var ajaxTimer = this._ajax(opt);
    };
});

