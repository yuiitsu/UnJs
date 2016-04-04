/**
 * Unjs基类
 */

/**
 * 模块
 * 新增模块添加进该对象，由路由调用
 */
var Module = {};
var Lib = {};
var View = {};
var Component = {};

var Unjs = function (options) {

    var self = this;

    // 需配置，目标容器
    this.displayObject = options.container ?
        document.getElementById(options.container) : document.getElementById('container');
    // 控制器目录
    this.controllerDir = options.controller ? options.controller : 'controller/';
    // 组件目录
    this.componentDir = options.component ? options.component : 'component/';
    // pathName
    this.pathName = null;

    this.popstate = false;

    /**
     * 呼叫方法
     * 根据method执行对应的方法,method有默认值
     */
    this.callMethod = function(module, moduleName, methodName, callback, type) {

        var callType = type ? type : '路由';

        if (typeof module[methodName] == 'function') {
            console.log(callType + ': ' + moduleName + ' => ' + methodName);
            module[methodName](callback);
        } else {
            console.log('not function');
        }
    };

    /**
     * 创建script元素
     * @param uri script文件地址
     */
    this.createScript = function(uri) {

        var scriptElemnt = document.createElement('script');
        scriptElemnt.src = uri;
        scriptElemnt.asyc = true;
        scriptElemnt.defer = true;
        scriptElemnt.type = 'text/javascript';

        return scriptElemnt;
    };

    /**
     * 将元素添加到DOM里
     * @param element 元素对象
     */
    this. appendToDom = function(element) {
        //if (!elementContainer) {
        var elementContainer = document.getElementsByTagName('head');
        elementContainer = elementContainer && elementContainer[0] ? elementContainer[0] : document.body;
        elementContainer = elementContainer || elementContainer.parent;
        //}
        elementContainer.appendChild(element);
    };

    /**
     * 加载script
     */
    this.import = function(moduleName, callback) {

        if (Module.hasOwnProperty(moduleName)) {

            callback(Module[moduleName]);
        } else {

            var element = this.createScript(this.controllerDir + moduleName + '.js');
            this.appendToDom(element);
            element.addEventListener('load', function() {

                callback(Module[moduleName]);
            });
        }
    };

    /**
     * 顺序加载
     * @param task 文件列表
     * @param callback 回调方法
     */
    this.sequenceLoadScript = function(task, callback) {

        var self = this;

        function loadScript(i) {

            if (task[i]) {

                if (!Lib.hasOwnProperty(task[i])) {
                    var element = self.createScript(task[i]);
                    self.appendToDom(element);
                    element.addEventListener('load', function() {
                        loadScript(i + 1);
                    });
                } else {

                    loadScript(i + 1);
                }
            } else {
                callback();
            }
        }

        loadScript(0);
    };

    /**
     * 同步加载文件
     * filePath 文件列表
     * callback 回调
     */
    this.asyncLoadScript = function(task, callback) {

        var taskLen = task.length;
        if (taskLen <= 0) {
            return;
        }
        var done = self.pending(callback);
        for (var i = 0; i < taskLen; i++) {

            if (!Lib.hasOwnProperty(task[i])) {
                var element = this.createScript(task[i]);
                this.appendToDom(element);
                element.addEventListener('load', done());
            }
        }
    };

    /**
     * 同步加载组件
     * @param taskObject 文件列表
     * @param callback 回调
     */
    this.asyncLoadComponent = function(taskObject, callback) {

        if (!taskObject) {
            return false;
        }

        var done = self.pending(callback);
        for (var i in taskObject) {

            if (!Component.hasOwnProperty(i)) {
                var element = this.createScript(taskObject[i]);
                this.appendToDom(element);
                element.addEventListener('load', done());
            }
        }
    };

    /**
     * 连续异步时的回调处理
     */
    this.pending = (function(callback) {

        var count = 0;
        return function(task) {
            count++;
            return function() {
                count--;
                if (count == 0) {
                    callback();
                }
            }
        }
    });

    /**
     * 加载组件
     * @param componentNode 组件节点
     * @param componentName 组件名
     * @param object 父对象
     * @param data 数据
     * @param callback 回调
     */
    this.importComponent = function(componentNode, componentName, object, data, callback) {

        var callMethod = function() {
            var component = Component[componentName](self, object, data);
            self.callMethod(component, componentName, 'init', callback, '组件');
        };

        if (!Component.hasOwnProperty(componentName)) {

            var componentPath = componentNode ? componentNode + '/' + componentName : componentName;
            var element = this.createScript(this.componentDir + componentPath + '.js');
            this.appendToDom(element);
            element.addEventListener('load', function() {

                callMethod();
            });
        } else {
            callMethod();
        }
    };

    this.getQueryString = function(name) {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  decodeURIComponent(r[2]); return null;
    };

    /**
     * 获取链接地址参数
     */
    this.getParams = function() {

        this.pathName = window.location.pathname;
        var search = window.location.search.substr(1);

        // 如果没有参数，返回null
        if (search == '') {
            return null;
        }

        // 将参数重组为对象
        var params = {};
        var paramsList = search.split('&');
        if (paramsList.length > 0) {
            for (var item in paramsList) {
                if (paramsList.hasOwnProperty(item)) {
                    var itemList = paramsList[item].split('=');
                    params[itemList[0]] = itemList[1];
                }
            }
        }

        return params;
    };

    /**
     * 设置链接地址
     * @param moduleName 模块名称
     * @param methodName 方法名称
     * @param params 参数
     */
    this.pushState = function(moduleName, methodName, params) {

        var url = [];
        if (params) {

            for (var i in params) {
                if (params.hasOwnProperty(i)) {
                    url.push(i + '=' + params[i]);
                }
            }
        } else {
            url.push('a=' + moduleName);
            url.push('m=' + methodName);
        }

        history.pushState({'params': url.join('&')}, '', this.pathName +'?' + url.join('&'));
        console.log(window.history);
    };

    /**
     * 设置标题
     */
    this.setTitle = function(title) {

        $('title').text(title);
    };

    /**
     * 加载控制器
     * @param moduleName 控制器名称
     * @param methodName 方法名称
     * @param para 参数
     */
    this.loadControl = function(moduleName, methodName, para) {

        var params = para && (typeof para == 'object') ? para : {};
        params['a'] = moduleName;
        params['m'] = methodName;
        // 设置链接
        this.pushState(moduleName, methodName, params);

        self.import(moduleName, function(module) {
            var controller = module(self, methodName, params);
            self.popstate = true;
            self.callMethod(controller, moduleName, methodName);
        });
    };

    /**
     * 输出
     */
    this.display = function(_html) {

        this.displayObject.innerHTML = _html;
    };

    /**
     * 路由
     * 根据链接地址获取module和method
     */
    this.router = function(popStatus) {

        var self = this;
        var params = this.getParams();

        var moduleName = null;
        var methodName = null;
        if (params) {
            moduleName = params['a'];
            methodName = params['m'];
        }

        moduleName = moduleName == null ? 'index' : moduleName;
        methodName = methodName == null ? 'index' : methodName;

        // 设置链接
        if (!popStatus) {
            this.pushState(moduleName, methodName, params);
        }

        self.import(moduleName, function(module) {
            var controller = module(self, methodName, params);
            self.callMethod(controller, moduleName, methodName);
        });
    };

    /**
     * 初始化
     */
    this.init = function() {

        window.onload = function() {

            self.router();
            window.addEventListener('popstate', function(e) {

                if (self.popstate) {
                    self.router(true);
                }
            });
        };
    };
};
