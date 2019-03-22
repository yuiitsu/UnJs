/**
 * core.js
 * 核心
 * 解析路由
 * 注册控制器对象、数据对象、组件对象、视图对象并加载它们
 * author: onlyfu
 * update: 2017-01-13
 */
var _core = {

    // 控制器默认目录
    controllerDir: 'controller/',
    // 控制器对象
    controller: {},
    // 数据对象
    model: {},
    // 组件对象
    component: {},
    // 视图对象
    view: {},
    // 事件
    event: {},
    //
    api: {},


    /**
     * 继承
     * @param func 函数
     * @returns {*}
     */
    extends: function (func) {
        var self = this;
        var F_temp = function(){
            this._super = self;
        };
        F_temp.prototype = this;
        func.prototype = new F_temp();
        func.prototype.constructor = func;
        return new func();
    },

    /**
     * 拷贝对象属性
     * @param parent 父对象
     * @param focus 目标对象
     */
    copy_object: function (parent, focus) {

        for (var i in parent) {
            if (typeof parent[i] === 'object') {
                focus[i] = (parent[i].constructor === Array) ? [] : {};
                this.copy_object(parent[i], focus[i]);
            } else {
                focus[i] = parent[i];
            }
        }

        return focus;
    },

    /**
     * 呼叫控制器
     * @param name 控制器名
     * @param method 控制器方法
     * @param para 显式参数,会在链接地址上显示
     * @param inPara 隐式参数,不会在链接地址上显示
     * @param options 其它参数对象
     *          options.noPushStatus: true/false
     *          options.replaceStatus: true/false
     */
    callControl: function (name, method, para, inPara, options) {

        this.log('路由: ' + name + ' => ' + method);
        //Controller.pageView.putModelIdToNextView();
        if (!this.controller) {
            this.log('未找到控制器对象', 'err');
            this.err('未找到控制器对象');
            return;
        }

        if (!this.controller[name]) {
            this.log('未找到控制器[' + name + ']', 'err');
            this.err('未找到控制器[' + name + ']');
            return;
        }

        if (!this.controller[name][method]) {
            this.log('未找到控制器方法[' + method + ']', 'err');
            this.err('未找到控制器方法[' + method + ']');
            return;
        }

        options = options || {};
        var params = para && (typeof para === 'object') ? para : {};
        params['a'] = name;
        params['m'] = method;

        if (!options.noPushStatus) {
            // 设置链接
            this.pushState(name, method, params, options.replaceStatus);
        }

        if (inPara && typeof inPara === 'object') {
            for (var i in inPara) {
                params[i] = inPara[i];
            }
        }
        this.handModel(name);
        this.controller[name][method](para);
    },

    /**
     * 呼叫子控制器
     * @param subName 子控制器名
     * @param params 参数
     * @param other 其它父控制器名
     */
    callSub: function (subName, params, other) {
        if (other) {
            this.controller[other]['sub'][subName].init(params);
        } else {
            this['sub'][subName].init(params);
        }
    },

    callModule: function(name, method, params) {
        this.log('Module: ' + name + ' => ' + method);
        //Controller.pageView.putModelIdToNextView();
        if (!this.controller) {
            this.log('未找到控制器对象', 'err');
            this.err('未找到控制器对象');
            return;
        }

        if (!this.controller[name]) {
            this.log('未找到控制器[' + name + ']', 'err');
            this.err('未找到控制器[' + name + ']');
            return;
        }

        if (!this.controller[name][method]) {
            this.log('未找到控制器方法[' + method + ']', 'err');
            this.err('未找到控制器方法[' + method + ']');
            return;
        }
        // this.handModel(name);
        this.controller[name][method](params);
    },

    /**
     * 呼叫组件
     * @param options 配置项
     * @param params 参数
     * @param func 在new出组件实例的时候执行的函数
     */
    callComponent: function (options, params, func) {
        let self = this,
            name = options.name,
            data = options.data,
            callback = options.callback,
            method = options.method || 'init',
            domObject = options.domObject;

        if (this.component.hasOwnProperty(name)) {
            let comp = new this.component[name];
            if (typeof comp[method] === 'function') {
                if (Object.prototype.toString.call(func) === '[object Function]') {
                    func.call(this);
                }

                if (comp.hasOwnProperty('lazyInit') || comp.hasOwnProperty('bind')) {
                    window.setTimeout(function() {
                        //
                        if (Object.prototype.toString.call(comp.bind) === '[object Object]') {
                            for (var i in comp.bind) {
                                if (comp.bind.hasOwnProperty(i) &&
                                    Object.prototype.toString.call(comp.bind[i]) === '[object Function]') {
                                    comp.bind[i](params, data, callback, domObject);
                                }
                            }
                        }
                        //
                        if (Object.prototype.toString.call(comp['lazyInit']) === '[object Function]') {
                            comp['lazyInit'](params, data, callback, domObject);
                        }
                    });
                }
                return comp[method](params, data, callback, domObject);
            } else {
                this.log('Component [' + name + ']['+ method +'] is not function', 'err');
            }
        } else {
            this.log('组件[' + name + '] 不存在', 'err');
        }
    },

    /**
     * 渲染组件
     * @param name
     * @param data
     */
    renderComponent: function(name, data) {
        var componentViewName = 'component.' + name;
        if (!this.view.hasOwnProperty(componentViewName)) {
            this.log('组件[' + name + '] 不存在', 'err');
        }

        //
        var html = this.view[componentViewName].init(data);

        return {
            to: function(target) {
                target.html(html);
            },
            appendTo: function(target) {
                target.append(html);
            }
        };
    },

    /**
     * 获取model实例
     * @param  modelName [model名称]
     * @return [model实例]
     */
    callModel: function (modelName) {
        return Model.model[modelName] || this;
    },

    /**
     * 获取model数据
     * @param key 属性
     * @return {[type]} [返回属性值]
     */
    get: function (key) {
        var val = this.default || (this.model && this.model.default) || {},
            keys = [],
            i = 0;
        if (typeof key === 'string') {
            keys = key.split('.');
        } else if (key === undefined) {
            return val;
        } else {
            keys = [key];
        }
        for (; i < keys.length; i++) {
            if (typeof val === 'object') {
                val = val[keys[i]];
            } else {
                val = 'undefined';
                break;
            }
        }
        return val;
    },

    /**
     * 设置model数据
     * @param {[type]} key   [属性]
     * @param {[type]} value [value]
     * @param {[type]} is_copy [是否拷贝]
     */
    set: function (key, value, is_copy) {
        var obj = this.default || (this.model && this.model.default) || {},
            keys = [],
            i = 0;
        if (typeof key === 'string') {
            keys = key.split('.');
        } else if (typeof key === 'number') {
            keys = [key];
        } else if (typeof key === 'object') {
            for (var x in key) {
                arguments.callee.apply(this, [x, key[x]]);
            }
        }

        for (; i < keys.length; i++) {
            if (typeof obj === 'object') {
                if (i === keys.length - 1) {
                    var data = obj[keys[i]];
                    if (is_copy) {
                        for (var j in value) {
                            data[j] = value[j];
                        }
                        value = this.copy_object(data, {});
                    }
                    obj[keys[i]] = value;
                    break;
                }
                if (typeof obj[keys[i]] === 'object') {
                    obj = obj[keys[i]];
                } else {
                    obj = obj[keys[i]] = {};
                }
            } else {
                break;
            }
        }
        return this;
    },

    /**
     * 输出模板
     * @param name 模板名
     * @param data 数据
     * @param object 输出对象ID名
     */
    display: function (name, data, object) {
        if (this.view.hasOwnProperty(name)) {
            object.html(this.view[name].init(data)).show();
        } else {
            this.log('View not exist.['+ name +']', 'err');
        }

        if (this.hasOwnProperty('bind')) {
            this.bindEvent(this.bind);
        }
    },

    /*
     * 获取当前页面url,?后面的
     */
    getUrl: function () {
        return window.location.search.substr(1);
    },

    /**
     * 获取模板
     * @param name 模板名
     * @param data 数据
     * @returns {*}
     */
    getView: function (name, data) {
        try {
            return this.view[name].init(data);
        } catch (e) {
            console.warn(name + '模版找不到');
            console.error(e);
            return '<div>模版未找到</div>';
        }
    },

    /**
     * 获取Event标记对象
     * @param tag
     * @returns {{type: *, name: string}}
     */
    getEventTagObject: function (tag) {
        var tagType = tag[0];
        var tagName = tag.substr(1);
        return {
            'type': tagType,
            'name': tagName
        };
    },

    /**
     * 处理event,将不支持事件转为支持事件,如touchstart转为click
     * @param event
     */
    processEvent: function (event) {
        if (event === 'touchstart') {
            if (!document.hasOwnProperty('ontouchstart')) {
                return 'click';
            }
        }

        return event;
    },

    /**
     * 设置事件
     * @param e
     * @param i
     * @param parentTagStr
     * @param focusTagStr
     */
    setEvent: function (e, i, parentTagStr, focusTagStr) {
        var self = this;
        var focusTag = this.getEventTagObject(focusTagStr);

        function getTarget(target) {
            var nextTarget = target.nodeType === 1 ? target.parentElement : target.parentNode;
            if (focusTag.type === '.') {
                if (target.className) {
                    var classNameStr = target.className;
                    var classNameList = classNameStr.split(' ');
                    if (classNameList.indexOf(focusTag.name) !== -1) {
                        self[self.bind[i]](e);
                    } else {
                        getTarget(nextTarget);
                    }
                }
            }

            if (focusTag.type === '#') {
                if (target.id) {
                    var id = target.id;
                    if (id === focusTag.name) {
                        if (typeof i === 'string') {
                            self[self.bind[i]](e);
                        } else {
                            i(e);
                        }
                    } else {
                        getTarget(nextTarget);
                    }
                }
            }
        }

        if (parentTagStr) {
            getTarget(e.target);
        } else {
            if (typeof i === 'string') {
                self[self.bind[i]](e);
            } else {
                i(e);
            }
        }
    },

    /**
     * 绑定事件
     * @param bindList
     * @param containerObject
     */
    // 'event_delegate' 将会被委托
    bindEvent: function (bindList, containerObject) {
        for (var i in bindList) {
            var index = i.lastIndexOf(" ");
            var tag = i.substr(0, index);
            var event = this.processEvent(i.substr(index + 1));
            this.bindEventDo({
                'target': tag,
                'event': event
            }, i, containerObject, bindList);
        }
    },

    /**
     * 执行绑定
     * @param tagObject 目标对象
     * @param i
     * @param containerObject
     * @param bindList
     */
    bindEventDo: function (tagObject, i, containerObject, bindList) {
        var self = this;
        var $target = tagObject.target !== 'window' ? $(tagObject.target) : $(window);
        var event = '';
        var eventArr = tagObject.event.split('_');
        if (eventArr[eventArr.length - 1] === '') {
            event = eventArr.join("_");
        }
        var eve = bindList[i];
        if (event) {
            var match =
                tagObject.target.match(/([\.\#\>\~\+\*\s]?[\w\-\_\[\]\=\"]*)[\>\~\+\*\s]*([\.\#]?[\w\-\_\[\]\=\"]*)/);
            var parent = match[1];
            var children = match[2] ? match[2] : parent;
            parent = $(parent).length ? parent : containerObject;
            $(parent).off(event).on(event, children, function (e) {
                var methodArr = eve.split('.');
                try {
                    for (var j = 0, method = self; j < methodArr.length; j++) {
                        if (method.hasOwnProperty(methodArr[j])) {
                            method = method[methodArr[j]];
                        } else {
                            self = method['sub'][methodArr[j]];
                            method = self.init;
                        }
                    }
                    method.call(self, e);
                } catch (e) {
                    console.error(e);
                }
            });
        } else {
            $target.off(tagObject.event).on(tagObject.event, function (e) {
                var methodArr = eve.split('.');
                try {
                    for (var j = 0, method = self; j < methodArr.length; j++) {
                        if (method.hasOwnProperty(methodArr[j])) {
                            method = method[methodArr[j]];
                        } else {
                            self = method['sub'][methodArr[j]];
                            method = self.init;
                        }
                    }
                    method.call(self, e);
                } catch (e) {
                    console.error(e);
                }
            });
        }

    },

    $: function (e) {
        return $(e.currentTarget);
    },

    /**
     * 记录Event到View
     * @param bindIndex
     * @param viewId
     */
    recodeEvent: function (bindIndex, viewId) {

        var focusViewId = viewId ? viewId : this.displayObject.id;

        if (!this.event[focusViewId]) {
            this.event[focusViewId] = [];
        }
        this.event[focusViewId].push({
            'type': this._info.type,
            'name': this._info.name,
            'event': bindIndex,
            'func': this.bind[bindIndex]
        });
    },

    /**
     * 拷贝事件到目标View
     * @param fromViewId
     * @param focusViewId
     */
    copyEvent: function (fromViewId, focusViewId) {

        var eventList = this.event[fromViewId];
        if (!eventList) {
            this.log("未找到来源View事件对象", "err");
            return false;
        }

        for (var i in eventList) {
            var eventStr = eventList[i].event;
            var objects = eventStr.split(' ');
            var tag = objects[0];
            var tagList = tag.split('>');
            var parentTagStr = null;
            var focusTagStr;
            if (tagList.length === 2) {
                parentTagStr = tagList[0];
                focusTagStr = tagList[1];
            } else {
                focusTagStr = tagList[0];
            }
            var func = eventList[i].func;
            this.bindEventDo({
                'type': eventList[i].type,
                'name': eventList[i].name,
                'event': objects[1]
            }, func, parentTagStr, focusTagStr, focusViewId);
        }
    },

    /**
     * 增加API地址
     * @param apiList API地址列表
     */
    apiAppend: function (apiList) {
        for (var i in apiList) {
            this.api[i] = apiList[i];
        }
    },

    /**
     * AJAX请求
     * @param options 参数对象
     */
    _ajax: function (options) {

        var xhr = null;
        try {
            if (window.XMLHttpRequest) {
                xhr = new window.XMLHttpRequest();
            } else if (window.ActiveXObject) {
                xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
            }
        } catch (e) {
        }

        if (!xhr) {
            console.log('无法创建XMLHttpRequest对象');
            return false;
        }

        // 针对某些特定版本的mozillar浏览器的BUG进行修正
        if (xhr.overrideMimeType) {
            xhr.overrideMimeType('text/xml');
        }

        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        var para = '';
        if(!options.data){
            options.data = {};
        }
        if (options.data) {
            for (var x in options.data) {
                var data_x = typeof options.data[x] === 'object' ? JSON.stringify(options.data[x]) : options.data[x];
                var code_data_x = data_x;
                try {
                    code_data_x = decodeURIComponent(data_x);
                } catch (e) {
                    console.warn(e);
                }
                if(code_data_x === data_x  && Object.prototype.toString.call(data_x) === '[object String]'){
                    data_x = encodeURIComponent(data_x);
                }
                para += x + '=' + data_x + '&';
            }
            para = para.substring(0, para.length - 1);
            // console.log(para);
        }
        if (options.type === 'GET') {
            if (options.data) {
                xhr.open(options.type, options.url + '?' + para, true);
            }
            xhr.send();
        } else if (options.type === 'POST' || options.type === 'PUT') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            if (options.headers) {
                for (var i in options.headers) {
                    xhr.setRequestHeader(i, options.headers[i]);
                }
            }
            xhr.send(para);
        } else if (options.type === 'DELETE') {
            if (options.headers) {
                xhr.setRequestHeader("para", options.headers.para);
            }
            xhr.send(null);
        } else {
            options.error('request type error, ' + options.type + '');
        }

        // 处理超时
        var timeoutTimer;
        if (options.timeout > 0) {
            if (timeoutTimer) {
                clearTimeout(timeoutTimer);
            }
            timeoutTimer = setTimeout(function () {
                if (xhr.readyState !== 4) {
                    xhr.abort("timeout");
                    console.log('aborted');
                }
            }, options.timeout);
        }

        // 注册回调函数
        xhr.onreadystatechange = function () {
            // 0未初始化, 还没有调用send()方法
            // 1载入, 已调用send()方法，正在发送请求
            // 2载入完成, send()方法执行完成，已经接收到全部响应内容
            // 3交互, 正在解析响应内容
            // 4完成, 响应内容解析完成，可以在客户端调用了
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    var responseData;
                    try {
                        responseData = JSON.parse(xhr.response);
                    } catch (e) {
                        responseData = xhr.responseText;
                    }
                    options.success(responseData);
                } else {
                    options.error(xhr.responseText || 'error');
                }
                options.complete(xhr, xhr.status);
            }
        };

        return xhr;
    },

    /**
     * 设置链接地址
     * @param moduleName
     * @param methodName
     * @param params
     * @param replace
     */
    pushState: function (moduleName, methodName, params, replace) {
        var url = [];
        var time = new Date().getTime();
        if (typeof params === 'object' && Object.keys(params).length) {
            //var indexFlag = params['a'] == 'index' && params['m'] == 'index';
            params['time'] = time;
            for (var i in params) {
                if (params.hasOwnProperty(i)) {
                    url.push(i + '=' + params[i]);
                    //if (indexFlag) {
                    //    if (i != 'a' && i != 'm') {
                    //        url.push(i + '=' + params[i]);
                    //    }
                    //} else {
                    //    url.push(i + '=' + params[i]);
                    //}
                    //if ((i == 'a' || i == 'm') && indexFlag) {
                    //} else {
                    //    url.push(i + '=' + params[i]);
                    //}
                }
            }
        } else {
            url.push('a=' + moduleName);
            url.push('m=' + methodName);
        }
        //url.push('time=' + time);
        // this.pageView.addUrl(url.join('&'), replace);
        // 以下有问题
        if (replace) {
            history.replaceState({
                'params': url.join('&')
            }, '', '?' + url.join('&'));
        } else {
            //if (moduleName == 'index' && methodName == 'index') {
            //    history.pushState({'params': url.join('&')}, '', '/');
            //} else {
            history.pushState({
                'params': url.join('&')
            }, '', '?' + url.join('&'));
            //}
        }
    },

    /**
     * 监听纯数据对象属性变化
     * @param  {[type]}   data [对象名称]
     * @param  {[type]}   key  [监听的属性]
     * @param  {Function} cb   [属性值变化时执行函数]
     * @param  {obj} caller    [执行回调this指向,默认指向调用者]
     * @return {[obj]}         [obj 打开不触发绑定事件的开关]
     */
    watch: function (data, key, cb, caller) {
        var uid = 0;
        var silence = false;

        function observe(obj, key) {
            if (!obj || typeof obj !== 'object') {
                return;
            }
            return new Observer(obj, key);
        }

        function Observer(data, key) {
            this.data = data;
            this.listen(data, key);
        }

        Observer.prototype = {
            listen: function (data, key) {
                var self = this,
                    i = 0,
                    val = data,
                    keys = [];
                if (typeof key === 'string') {
                    keys = key.split('.');
                    for (; i < keys.length; i++) {
                        if (typeof val === 'object') {
                            val[keys[i]] = val[keys[i]] !== undefined ? val[keys[i]] : undefined;
                            this.define(val, keys[i]);
                            if (i !== keys.length - 1) {
                                if (typeof val[keys[i]] !== 'object') {
                                    val = val[keys[i]] = {};
                                } else {
                                    val = val[keys[i]];
                                }
                            }
                        }
                    }
                } else {
                    Object.keys(data).forEach(function (key) {
                        self.define(data, key);
                    });
                }

            },
            define: function (data, key) {
                var configurableObj = Object.getOwnPropertyDescriptor(data, key) || {};
                if (configurableObj.configurable === true && configurableObj.set === undefined) {
                    this.defineReactive(data, key, data[key]);
                }
            },
            defineReactive: function (data, key, val) {
                var dep = new Dep(); //所有的订阅者闭包，只能通过读取值往订阅器里面添加订阅者
                //observe(val); //值为obj时接着遍历监听

                // 针对数组处理,redefine [me
                if (Object.prototype.toString.call(data[key]) === '[object Array]') {
                    var arrayMethod = ['push', 'pop', 'reverse', 'shift', 'unshift', 'splice'];


                    var fake = new Array();

                    // 添加 addDep方法，手动加入订阅器
                    fake.addDep = function () {
                        if (Dep.target) {
                            dep.depend()
                        }
                    };
                    fake['notify_list'] = [];
                    // 防止 for in 遍历时读取到 自定义 属性
                    Object.defineProperty(fake, 'addDep', {
                        enumerable: false
                    });
                    Object.defineProperty(fake, 'notify_list', {
                        enumerable: false
                    });

                    for (var i in arrayMethod) {
                        arrayMethod.forEach(function (method) {
                            var originMethod = Array.prototype[method];
                            fake[method] = function () {
                                var changed = originMethod.apply(this, arguments);
                                fake.notify_list.forEach(function (item) {
                                    item();
                                });
                                return changed;
                            };
                            // 防止 for in 遍历时读取到 [method] 属性
                            Object.defineProperty(fake, 'notify_list', {
                                enumerable: false
                            });
                            Object.defineProperty(fake, method, {
                                enumerable: false
                            });
                        });
                    }

                    if (data[key]['notify_list']) {
                        data[key]['notify_list'].push(dep.notify.bind(dep));
                    } else {
                        data[key].__proto__ = fake;
                        data[key]['notify_list'].push(dep.notify.bind(dep));
                    }

                }


                Object.defineProperty(data, key, {
                    enumerable: true, // 可枚举
                    configurable: true, // 能再define
                    get: function () {
                        //读取data里面的值的时候，加入订阅者

                        if (Dep.target) {
                            dep.depend();
                        }
                        return val;
                    },
                    set: function (newVal) {
                        if (newVal === val) {
                            return;
                        }
                        val = newVal;
                        // 新的值是object的话，进行监听
                        //observe(newVal);
                        // 通知订阅者
                        dep.notify();
                    }
                });
            }
        };

        //订阅器
        function Dep() {
            //
            this.id = uid++;
            this.subs = []; //订阅者加入数组
        }

        Dep.prototype = {
            addSub: function (sub) {
                // 防止重复添加监听
                var flag = _core.reduce(this.subs, function (acc, current) {
                    return acc && !(current.cb === sub.cb);
                }, true);
                if (flag) {
                    this.subs.push(sub);
                }
            },
            depend: function () {
                Dep.target.addDep(this); //将订阅者加入数组
            },
            removeSub: function (sub) {
                var index = this.subs.indexOf(sub);
                if (index !== -1) {
                    this.subs.splice(index, 1);
                }
            },
            //通知订阅者，干活
            notify: function () {
                this.subs.forEach(function (sub) {
                    sub.update(); //订阅者干活
                });
            }
        };
        Dep.target = null; //订阅者watch实例，订阅时往订阅器里面加入就是该实例

        //订阅者
        function Watcher(data, exp, cb, caller) {
            this.cb = cb;
            this.data = data;
            this.depIds = {};
            this.exp = exp;
            this.value = this.get();
            this.caller = caller || this;
        }

        Watcher.prototype = {
            callback: function(value, oldValue) {
                var cb = this.caller[this.cb] ? this.caller[this.cb] :
                    (this.caller.sub && this.caller.sub[this.cb] ? this.caller.sub[this.cb].init : this.cb);
                silence || ( typeof cb === 'function' && cb.call(this.caller, value, oldValue));
            },
            update: function () {
                var value = this.get();
                var oldValue = this.value;
                // 数组直接触发回调
                if (Object.prototype.toString.call(value) === '[object Array]') {
                    this.value = value;
                    //silence || ( typeof this.cb === 'function' && this.cb.call(this.caller, value, oldValue));
                    this.callback(value, oldValue);
                    return;
                }
                if (value !== oldValue) {
                    this.value = value;
                    //silence || ( typeof this.cb === 'function' && this.cb.call(this.caller, value, oldValue));
                    this.callback(value, oldValue);
                }
            },
            addDep: function (dep) {
                if (!this.depIds.hasOwnProperty(dep.id)) {
                    dep.addSub(this);
                    this.depIds[dep.id.toString()] = dep;
                }
            },
            get: function () {
                Dep.target = this;
                var value = this.getVMVal();
                Dep.target = null;
                return value;
            },
            getVMVal: function () {
                var exp = this.exp.split('.') || [];
                var val = this.data; //触发数据的get(Observer),直接将订阅者加入订阅器
                exp.forEach(function (k) {
                    if (typeof val === 'object') {
                        val = val[k]; //触发数据的get(Observer),直接将订阅者加入订阅器
                    }
                });
                return val;
            }
        };
        var realWatch = function (data, key, cb, caller) {
            caller = caller || this;
            observe(data, key);
            new Watcher(data, key, cb, caller); //添加订阅者
            return {
                openSilence: function () {
                    silence = true;
                },
                closeSilence: function () {
                    silence = false;
                }
            };
        };
        realWatch.openSilence = function () {
            silence = true;
        };
        realWatch.closeSilence = function () {
            silence = false;
        };

        return realWatch;
    }(),

    /**
     * 监听纯数据对象属性变化,和watch不同的是，该方法会检测属性key是否被监听过，被监听过将不在监听，即使观察者函数不是同一个也将不再监听
     * @param  {object}   data [对象名称]
     * @param  {string}   key  [监听的属性]
     * @param  {Function} cb   [属性值变化时执行函数]
     * @param  {obj} caller    [执行回调this指向,默认指向调用者]
     * @return {[obj]}         [obj 打开不触发绑定事件的开关]
     */
    watchByCheckFn: function (data, key, cb, caller) {
        var keyArr = key.split('.'),
            realKey = key,
            obj = data;
        keyArr.forEach(function (k, i) {
            if (i !== keyArr.length - 1) {
                obj = obj[k];
                if (obj === undefined) {
                    obj = {};
                }
            } else {
                realKey = k;
            }
        });
        var configurableObj = Object.getOwnPropertyDescriptor(obj, realKey) || {};
        if (!Object.keys(configurableObj).length || configurableObj.configurable === true &&
            configurableObj.set === undefined) {
            return this.watch(data, key, cb, caller);
        }
    },

    // reduce
    reduce: function (array, action, acc) {
        // 检查参数合法性
        if (!this.isArray(array)) {
            return acc;
        }
        // 檢查原生 reduce
        if (Array.prototype.reduce) {
            return array.reduce(action, acc);
        }

        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                acc = action(acc, array[i]);
            }
        }
        return acc;
    },

    isArray: function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    },

    /**
     * 处理model数据，重置model
     * @param module 模块名称，根据模块名称重置model
     */
    handModel: function (module) {
        if (Model.model[module]) {
            Model.model[module].default = Model.copy_object(Model.model[module]._default, {});
        }
    },

    /**
     * 输出LOG
     * @param type 类型, ok/err
     * @param text 内容
     */
    log: function (text, type) {
        type = type || 'ok';
        console.log('[UnJs]' + type + ': ' + text);
    },


    /**
     * 继承Base类
     * @param name 对象名称
     * @param func 对象方法
     * @param parent 父类方法(用于子控制器或model)
     */
    extend: function (name, func, parent) {
        // 继承Base对象
        var c,
            F_temp;
        if (parent) {
            //加一个临时函数，使函数的constructor以及_super指向正确
            F_temp = function(){};
            F_temp.prototype = this[this.type][parent];
            func.prototype = new F_temp();
            func.prototype.constructor = func;
            func.prototype._super = this[this.type][parent];
            c = new func();
            c._info = {
                'name': name,
                'type': this.type,
                'sub': true
            };

            if (!this[this.type][parent].hasOwnProperty('sub')) {
                this[this.type][parent]['sub'] = {};
            }
            this[this.type][parent]['sub'][name] = c;
            //this[this.type][parent]['sub'][name].model = c;
        } else {
            F_temp = function(){
                this._super = _core;
            };
            F_temp.prototype = _core;
            func.prototype = new F_temp();
            func.prototype.constructor = func;
            c = new func();
            c._info = {
                'name': name,
                'type': this.type,
                'sub': false
            };
            if (this.type === 'model') {
                c.default = c.default || {};
                c._default = this.copy_object(c.default, {});
                c._models = {};
                if (Controller.controller[name]) {
                    Controller.controller[name].model = c;
                }
            }
            if (this.type === 'controller' && Model.model[name]) {
                c.model = Model.model[name];
            }
            this[this.type][name] = c;
        }
    },

    /**
     * 获取链接地址参数
     */
    getParams: function (search) {
        this.pathName = window.location.pathname;
        search = search || window.location.search.substr(1);

        // 如果没有参数，返回null
        if (search === '') {
            return {};
        }

        // 将参数重组为对象
        var params = {};
        var paramsList = search.split('&');
        if (paramsList.length > 0) {
            for (var item in paramsList) {
                if (paramsList.hasOwnProperty(item)) {
                    var itemList = paramsList[item].split('=');
                    var key = itemList[0];
                    if (itemList.length === 2) {
                        params[key] = itemList[1];
                    } else if (itemList.length > 2) {
                        itemList.shift();
                        params[key] = itemList.join('=');
                    }
                }
            }
        }

        return params;
    },

    /**
     * 路由,通过解析地址,调用呼叫方法
     */
    router: function (search, prepare) {
        var self = this;
        var params = search && search !== 'undefined' ? this.getParams(search.replace("\?", "")) : (this.getParams() || {});
        var moduleName = params['a'] === undefined ? 'index' : params['a'];
        var methodName = params['m'] === undefined ? 'index' : params['m'];
        //保护私有方法
        if (methodName.indexOf('_') === 0) {
            self.log('_ 开头的方法不允许访问[' + moduleName + ' = > ' + methodName + ']', 'err');
            self.err("_ 开头的方法不允许访问[" + moduleName + " = > " + methodName + "]");
            return false;
        }
        //if (this.pageView.router()) {
        if (!prepare) {
            this.import(moduleName, function (module) {
                if (module.hasOwnProperty(methodName)) {
                    module.params = params;
                    module[methodName]();
                } else {
                    //console.log('[UnJs]err: 未找到方法[' + moduleName + ' = > ' + methodName + ']');
                    self.log('未找到方法[' + moduleName + ' = > ' + methodName + ']', 'err');
                    self.err("未找到方法[" + moduleName + " = > " + methodName + "]");
                }
            });
        } else {
            this.import(prepare.module, function(module) {
                var prepareMethod = prepare.method ? prepare.method : 'index';
                if (module.hasOwnProperty(prepareMethod)) {
                    module.params = params;
                    module[prepareMethod] (function() {
                        self.import(moduleName, function (module) {
                            if (module.hasOwnProperty(methodName)) {
                                module.params = params;
                                module[methodName]();
                            } else {
                                //console.log('[UnJs]err: 未找到方法[' + moduleName + ' = > ' + methodName + ']');
                                self.log('未找到方法[' + moduleName + ' = > ' + methodName + ']', 'err');
                                self.err("未找到方法[" + moduleName + " = > " + methodName + "]");
                            }
                        });
                    });
                } else {
                    self.err("未找到方法[" + moduleName + " = > " + methodName + "]");
                }
            });
        }
        //}
    },

    /**
     * 加载script
     * @param moduleName 模块名
     * @param callback 回调方法
     */
    import: function (moduleName, callback) {
        if (this[this.type].hasOwnProperty(moduleName)) {
            callback(this[this.type][moduleName]);
        } else {
            //console.log('[UnJs]err: 未找到控制器[' + moduleName + ']');
            this.log('未找到控制器[' + moduleName + ']', 'err');
            this.err("未找到控制器[" + moduleName + "]");
        }
    },

    /**
     * 错误输出
     * @param msg 消息
     */
    err: function (msg) {
        //document.body.innerHTML = '<div style="padding:10px;background-color:#fff;">' +
        //    '<h1 style="padding-bottom:10px;border-bottom:1px solid #ccc;">出错啦</h1>' +
        //    '<div style="padding:10px 0;">' + msg + '</div>' +
        //    '<div style="padding:10px 0;text-align:right;color:#ccc;"><i>WmJs v' + this.version + '</i></div>' +
        //    '</div>';
        this.callControl('error', 'index', {
            message: msg,
            version: this.version
        }, null, {
            noPushStatus: true
        });
    },

    /**
     * 初始化
     */
    init: function (options) {
        var self = this;
        _core.version = options.version;
        window.onload = function () {
            self.router(options.search, options.prepare);
            window.setTimeout(function () {
                window.addEventListener('popstate', function (e) {
                    self.router(null, options.prepare);
                });
            }, 0);
        };
    }
};

var F = function (type) {
    this.type = type;
};
F.prototype = _core;

// 数据对象
var Model = new F('model');
// 组件对象
// var Component = new F('component');
// 视图对象
var View = new F('view');
// 控制器对象
var Controller = new F('controller');
var Component = function () {
    var Component_temp = function () {
        this._super = _core;
        this.type = 'component';
    };
    Component_temp.prototype = _core;
    var Component_func = function () {
        /**
         * 继承Base类
         * @param name 对象名称
         * @param func 对象方法
         * @param parent 父类方法(用于子控制器或model)
         */
        this.extend = function (name, func, parent) {
            // 继承Base对象
            if (parent) {
                if (this.type === 'component') {
                    this[this.type][name] = func;
                    if (Object.prototype.toString.call(this[this.type][parent]) === "[object Function]") {
                        var parent_instance = new this[this.type][parent]();
                        var F_temp = function () {
                        };
                        F_temp.prototype = parent_instance;
                        func.prototype = new F_temp();
                        func.prototype.constructor = func;
                        func.prototype._super = parent_instance;
                    } else {
                        this.componentExtendHandler(parent, func);
                    }
                }
            } else {
                var F_temp = function () {
                    this._super = Component;
                };
                F_temp.prototype = Component;
                func.prototype = new F_temp();
                func.prototype.constructor = func;
                this[this.type][name] = func;
            }
        };

        /**
         * 处理component继承
         * @param func 对象方法
         * @param parent 父类方法(用于component)
         */
        this.componentExtendHandler = function (parent, func) {
            if (Object.prototype.toString.call(this['component'][parent]) === '[object Array]') {
                this['component'][parent].push(func);
            } else if (Object.prototype.toString.call(this['component'][parent]) === "[object Undefined]") {
                this['component'][parent] = [func];
                this.watch(this['component'], parent, function (newVal, oldVal) {
                    if (Object.prototype.toString.call(newVal) === "[object Function]") {
                        var parent_func = new newVal();
                        var F_temp = function () {
                        };
                        F_temp.prototype = parent_func;
                        oldVal.forEach(function (v_func, i, arr) {
                            v_func.prototype = new F_temp();
                            v_func.prototype.constructor = v_func;
                            v_func.prototype._super = parent_func;
                        });
                    }

                });
            } else {

            }
        };

        /**
         * 通知订阅者干活,由组件自行通知
         * @param params 订阅者执行函数的参数object;
         */
        this.notify = function (type, params) {
            var subs = this.subs[type];
            if (Object.prototype.toString.call(subs) === '[object Array]') {
                subs.forEach(function (sub, i, arr) {
                    if (Object.prototype.toString.call(sub) === '[object Function]') {
                        sub.call(this, params);
                    }
                }, this)
            }
        };

        //添加订阅者
        this.addSubscriber = function (type, sub) {
            var subs = this.subs[type];
            if (Object.prototype.toString.call(subs) === '[object Array]' && subs.indexOf(sub) === -1) {
                subs.push(sub);
            }
        };

        //订阅者取消订阅
        this.removeSubscriber = function (type, sub) {
            var subs = this.subs[type],
                index = Object.prototype.toString.call(subs) === '[object Array]' ? subs.indexOf(sub) : -1;
            if (index !== -1) {
                subs.splice(index, 1);
            }
        };
    };
    Component_func.prototype = new Component_temp();
    Component_func.prototype.constructor = Component_func;
    return (new Component_func());
}();

