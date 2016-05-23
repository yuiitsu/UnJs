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

    this.version = options.version;

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

            var importLoadingId = Math.ceil(Math.random() * 10000 + 1000);
            self.importLoading.show(importLoadingId);

            var element = this.createScript(this.controllerDir + moduleName + '.' + self.version + '.js');
            this.appendToDom(element);
            element.addEventListener('load', function() {

                self.importLoading.hide(importLoadingId);
                callback(Module[moduleName]);
            });
        }
    };

    this.importLoading = {

        show: function(id) {

            var loading = document.getElementById('unjs_controller_loading');
            var loadingDom = document.createElement('div');
            loadingDom.id = 'unjs_controller_loading_' + id;
            loadingDom.className = 'unjs_controller_loading';
            var loadingImg = document.createElement('img');
            loadingImg.src = 'images/loading/loading_g.gif';
            loadingDom.appendChild(loadingImg);
            document.body.appendChild(loadingDom);
        },
        hide: function(id) {

            var loading = document.getElementById('unjs_controller_loading_' + id);
            document.body.removeChild(loading);
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
    this.asyncLoadScript = function(scriptList, libNameList, callback) {

        var taskLen = scriptList.length;
        if (taskLen <= 0) {
            return;
        }
        var existNum = 0;
        var done = self.pending(callback);
        for (var i = 0; i < taskLen; i++) {

            if (!Lib.hasOwnProperty(libNameList[i])) {
                var element = this.createScript(scriptList[i]);
                this.appendToDom(element);
                Lib[libNameList[i]] = scriptList[i];
                element.addEventListener('load', done());
            } else {
                existNum++;
            }
        }

        if (existNum == taskLen) {
            callback();
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

            var importLoadingId = Math.ceil(Math.random() * 10000 + 1000);
            self.importLoading.show(importLoadingId);
            var componentPath = componentNode ? componentNode + '/' + componentName : componentName;
            var element = this.createScript(this.componentDir + componentPath + '.' + self.version + '.js');
            this.appendToDom(element);
            element.addEventListener('load', function() {
                self.importLoading.hide(importLoadingId);
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
     * @param inPara 内部对象传递,不会显示在链接地址上
     * @param noPushState 执行pushState
     */
    this.loadControl = function(moduleName, methodName, para, inPara, noPushState) {



        var params = para && (typeof para == 'object') ? para : {};
        params['a'] = moduleName;
        params['m'] = methodName;

        if (!noPushState) {
            // 设置链接
            this.pushState(moduleName, methodName, params);
            // 记录已调用
            localStorage.setItem('pushState', moduleName + '_' + methodName);
        }

        if (inPara && typeof inPara == 'object') {

            for (var i in inPara) {
                params[i] = inPara[i];
            }
        }

        self.import(moduleName, function(module) {
            var controller = module(self, methodName, params);
            self.popstate = true;
            self.callMethod(controller, moduleName, methodName);
        });
    };

    /**
     * 输出HTML
     * @param _html html
     * @param cssObject css对象
     */
    this.display = function(_html, cssObject) {

        this.displayObject.innerHTML = _html;
        if (cssObject) {
            if (cssObject.hasOwnProperty('body')) {
                $('body').css('background-color', cssObject.body);
            }
        }
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
            //var pushState = localStorage.getItem('pushState');
            //if (pushState != moduleName + '_' + methodName) {
            //    //this.pushState(moduleName, methodName, params);
            //    // 记录已调用
            //    //localStorage.setItem('pushState', moduleName + '_' + methodName);
            //} else {
                self.popstate = true;
            //}
        }

        // 清空容器
        this.displayObject.innerHTML = '';

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
