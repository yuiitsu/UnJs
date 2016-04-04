/**
 * UnJs
 * 
 * author: onlyfu
 * update: 2015-08-24
 */

var Http = require('http');
var Url = require('url');
var Os = require('os');
var Fs = require('fs');
var Path = require('path');
var queryString = require('querystring');
var watch = require('watch');
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;

var Template = require('./template');
var Config = require('./config');
var Cookie = require('./cookie');

var UnJs = function(){

    var self = this;
    // cookie
    self.cookie = Cookie;
    // http request请求对象
    self.request = null;
    // http response对象
    self.response = null;
    // 配置
    self.config = null;
    // 路由配置
    self.routeConf = null;
    // 链接地址参数
    self.params = null;
    // api host
    self.apiHost = null;

    /**
     * 设置request
     */
    self.setRequest = function(request) {
        self.request = request;
    };

    /**
     * 设置response
     */
    self.setResponse = function(response) {
        self.response = response;
    };

    /**
     * 设置配置文件
     * 使用自定义配置文件继承系统配置
     */
    self.setConfig = function(config){
        for(var k in config){
            if (config.hasOwnProperty(k)) {
                Config[k] = config[k];
            }
        }
        self.config = Config;
    };

    /**
     * 设置路由
     */
    self.setRoute = function(route){
        self.routeConf = route;
    };

    /**
     *
     */
    self.setReadPool = function(pool) {
        self.readPool = pool;
    };

    self.setWritePool = function(pool) {
        self.writePool = pool;
    };

    self.setApiHost = function(apiHost) {
        self.apiHost = apiHost;
    };

    /**
     * 获取请求的地址
     */
    self.getUrl = function() {
    
        //var params = Url.parse(self.request.url, true);
        return self.request.url;
    };

    /**
     * 获取客户端IP
     */
    self.getClientIp = function() {
        return self.request.headers['x-forwarded-for'] ||
        self.request.connection.remoteAddress ||
        self.request.socket.remoteAddress ||
        self.request.connection.socket.remoteAddress;
    };

    /**
     * 路由,判断静态文件和控制器
     */
    self.route = function(){

        var params = Url.parse(self.request.url, true);
        var notStatic = false;
        // check static
        if (Config.static.type == 'single') {
            if (params.pathname.indexOf(Config.static.controller) != -1 || 
                params.pathname.indexOf(Config.static.images) != -1 || 
                params.pathname.indexOf(Config.static.lib) != -1 || 
                params.pathname.indexOf(Config.static.css) != -1 ||
                params.pathname.indexOf(Config.static.component) != -1 ||
                params.pathname.indexOf('favicon.ico') != -1) {
                
                self.setCache(Config.static.baseDir + params['path']);
                //self.setCache(params['path']);
            } else {
                notStatic = true;   
            }
        } else {
            if(params.pathname.indexOf(Config.static_dir) != -1 || 
                params.pathname.indexOf('favicon.ico') != -1){
                self.setCache(params['path']);
            }else{
                notStatic = true;   
            }
        }

        if (notStatic) {

            var controllerName = '';
            for(var k in self.routeConf){
                if(params.pathname == k){
                    if (self.routeConf.hasOwnProperty(k)) {
                        controllerName = self.routeConf[k];
                    }
                    break;
                }
            }
            if(!controllerName){
                //self.response.writeHead(404, {'Content-Type': 'text/plain'});
                //self.display('404', {});
                //return;

                controllerName = self.apiHost;
            }

            self.import(controllerName, params);
        }
    };

    /**
     * 加载controller
     * @params controller_name string 控制器名称 
     */
    self.import = function(controller_name){
        require('../'+ Config['controller_dir'] +'/' + controller_name)(self);
    };

    /**
     * 加载服务
     * @param serviceName String 服务名称
     */
    self.service = function(serviceName) {

    };

    /**
     * 获取GET数据
     * @params key string 下标
     */
    self._get = function(key){
        self.params = Url.parse(self.request.url, true);
        return self.params.query[key];
    };

    /**
     * 获取POST数据
     * @params callback function 回调方法
     */
    self._post = function(callback){

        self.request.setEncoding('utf-8');
        var postDataString = '';

        // 接收数据
        self.request.addListener('data', function(postDataChunk) {

            postDataString += postDataChunk;
        });

        // 接收完毕
        self.request.addListener("end", function() {

            var postDataObject = null;
            if (postDataString) {
                postDataObject = queryString.parse(postDataString);
            }
            callback(postDataObject);
        });
    };

    /**
     * 跳转
     */
    self.redirect = function(url){
        self.response.setHeader('Location', url);
        self.response.writeHead(302);
        self.response.end();
    };

    /**
     * 输出
     */
    self.write = function(str){
        self.response.write(str);
    };

    /**
     * 执行控制器中的方法
     * @param object 控制器对象
     * @param method 方法名
     */
    self.doFunction = function(object, method) {
    
        try {
            if (typeof object[method] == 'function') {
                
                object[method]();
            } else {
                
                object['index']();
            }
        } catch (e) {
            
            self.end('not found method');
        }
    };

    /**
     * 返回JSON
     */
    self.result = function(status, message, data) {
    
        var result = {};

        if (status != 0) {
            result.status = status;
        }

        if (message) {
            result.msg = message;
        }

        if (data) {
            result.data = data;
        }

        self.end(JSON.stringify(result));
    };

    /**
     * 结束
     */
    self.end = function(html, paraContentType){
        
        var contentType = paraContentType ? paraContentType : 'text/html';
        self.response.writeHead(200, {'Content-Type': contentType});
        if (html) {
            self.response.write(html);
        }
        self.response.end();
    };

    /**
     * 读取文件
     * @params filePath 文件地址
     * @params callback 回调函数
     */
    self.readFile = function(filePath, callback){
        Fs.readFile(filePath, 'utf-8', function(error, data){
            callback(error, data);
        })
    };

    /**
     * 读取目录
     */
    self.readDir = function(path, callback) {
        Fs.readdir(path, function(error, files) {
            callback(error, files);
        });
    };

    /**
     * 设置浏览器静态文件缓存
     */
    self.setCache = function(path){
        var file_match = /^(gif|png|jpg|js|css)$/ig;
        var max_age = 606024365;

        var file_path = '.' + path;

        Fs.exists(file_path, function(exists){
            if(!exists){
                self.response.writeHead(404, {'Content-Type': 'text/plain'});
                self.response.end();
            }else{
                Fs.stat(file_path, function(error, stat){
                    var ext = Path.extname(file_path);
                    ext = ext ? ext.slice(1) : 'unknown';
                    var content_type = self.types[ext] || "text/plain";
                    if(!error){
                        var last_modified = stat.mtime.toUTCString();
                        var if_modified_since = "If-Modified-Since".toLowerCase();

                        self.response.setHeader("Last-Modified", last_modified);
                        
                        if(ext.match(file_match)){
                            var expires = new Date();
                            expires.setTime(expires.getTime() + max_age * 1000);
                            self.response.setHeader("Expires", expires.toUTCString());
                            self.response.setHeader("cache-Control", "max-age=" + max_age);
                        }

                        if(self.request.headers[if_modified_since] && last_modified == self.request.headers[if_modified_since]){
                            self.response.writeHead(304, "Not Modified");
                            self.response.end();
                        }else{
                            Fs.readFile(file_path, 'binary', function(error, data){
                                if(error){
                                    self.response.writeHead(500, 'Internal Server Error', {'Content-Type': 'text/plain'});
                                    self.response.end(error);
                                }else{
                                    self.response.writeHead(200, {'Content-Type': content_type});
                                    self.response.write(data, 'binary');
                                    self.response.end();
                                }
                            })
                        }
                    }
                });
            }
        });
    };
    
    /**
     * 模板输出
     */
    self.display = function(templateName, data){
        // 检测文件
        var templateFile = './'+ self.config.template_dir +'/' + templateName +'.html';
        Fs.exists(templateFile, function(exists){
            if(!exists){
                templateFile = './unjs/'+ self.config.template_dir +'/'+ templateName +'.html';
                if(!Fs.existsSync(templateFile)){
                    self.response.writeHead(200, {'Content-Type': 'text/html'});
                    self.response.write('Not Found Tempate File');
                    self.response.end();
                }
            }

            Template.parse(templateFile, data, self);
        });
    };

    /**
     * 读取文件 
     */ 
    self.readFile = function(filePath, callback){
        Fs.readFile(filePath, 'utf-8', function(error, data){
            callback(error, data);
        });
    };

    /**
     * 异步回调时的计数处理
     */
    self.pending = (function(callback) {
        var count = 0;
        var returns = {};
        return function(task) {
            count++;
            return function(error, data) {
                count--;
                if (!error) {
                    returns[task] = data; 
                    if (count == 0) {
                        callback(returns);
                    }
                }
            }
        }
    });

    /**
     * 连续异步时的回调处理
     */
    self.asyncSeries = function(task, func, callback) {
        var taskLen = task.length;
        if (taskLen <= 0) {
            console.log(taskLen);
            return;
        }
        var done = self.pending(callback);
        for(var i = 0; i < taskLen; i++) {
            func(task[i], done);
        }
    };
    
    /**
     * 静态文件类型对应的Content-Type
     */
    self.types = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        "gif": "image/gif",
        "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "json": "application/json",
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tiff": "image/tiff",
        "txt": "text/plain",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "xml": "text/xml",
        "ico": "text/html"
    };

    
};

var Server = {

    // 构建输出html的运行状态
    buildViewStatus: false,
    buildImageStatus: false,
    // 配置文件
    config: null,
    // 系统
    os: Os.platform(),

    /**
     * 启动服务
     */
    server: function(port, config, route, apiHost){

        var lisPort = !port ? 3000 : port;

        Http.createServer(function(req, res){

            var u = new UnJs();

            u.setRequest(req);
            u.setResponse(res);
            u.setConfig(config);
            u.setRoute(route);
            u.setApiHost(apiHost);
            u.route();

        }).listen(lisPort);

        console.log('HTTP server is listening at port %s', lisPort);
        // 监听前端文件变化
        this.watch();
    },

    /**
     * 运行
     */
    run: function(paraConfig, route){

        var argv = process.argv;
        var argvLen = argv.length;

        if (argvLen < 2) {
            console.error('create server failed, params error');
            return false;
        }

        var port = 3000;
        var buildType = false;
        var apiHost = '';

        for (var i = 0; i < argvLen; i++) {

            switch (argv[i]) {

                case '-p':
                    port = argv[i + 1];
                    break;
                case '-b':
                    buildType = argv[i + 1];
                    break;
                case '-h':
                    apiHost = argv[i + 1];
                    break;
            }
        }

        this.config = paraConfig;

        this.server(port, paraConfig, route, apiHost);

        if (buildType) {
            this.build();
        }
    },

    /**
     * 监听前端文件变化，进行解析、合并、复制到html文件夹的操作
     */
    watch: function() {

        var self = this;
        var buildIndexStatus = false;
        console.log('watching...');

        watch.watchTree('static', function(f, curr, prev) {
        
            console.log('f: '+ f +', curr: '+ curr +', prev: ' + prev);
            if (typeof f == 'object' && curr == null && prev == null) {
            } else if (curr.nlink === 0) {
                // 删除一个文件
                //self.delFile();
            } else {
                if (f.indexOf('/'+ self.config.output.view +'/') != -1 || f.indexOf('\\'+ self.config.output.view +'\\') != -1) {
                    // 处理模板
                    self.buildView();
                } else {
                    // 修改一个文件
                    self.copyFile(f);
                }
            }
        });
    },

    /**
     * 拷贝目录
     * @param sourceDir 源目录
     * @param targetDir 目标目录
     * @param fileExt 检测文件类型
     * @param callback 回调
     */
    copyDir: function(sourceDir, targetDir, fileExt, callback) {

        var self = this;
        Fs.readdir(sourceDir, function(error, paths) {
            paths.forEach(function(path) {
            
                var sourcePath = sourceDir + '/' + path;
                var targetPath = targetDir + '/' + path;
                Fs.stat(sourcePath, function(error, path) {
                    if (error) {
                        console.log(error);
                        return;
                    }

                    if (path.isFile()) {
                        console.log('复制文件：' + sourcePath);
                        if (Path.extname(sourcePath).slice(1).match(fileExt)) {
                        
                            Fs.exists(targetDir, function(exist) {
                                if (exist) {
                                    var readable = Fs.createReadStream(sourcePath);
                                    var writeable = Fs.createWriteStream(targetPath);
                                    readable.pipe(writeable);
                                } else {
                                    Fs.mkdir(targetDir, function(error) {
                                        if (error) {
                                            //console.log('mkdir targetDir: ' + targetDir + ', error: ' + error);
                                        }
                                        var readable = Fs.createReadStream(sourcePath);
                                        var writeable = Fs.createWriteStream(targetPath);
                                        readable.pipe(writeable);
                                    });
                                }
                            });
                        }
                    } else if(path.isDirectory()) {
                        self.copyDir(sourcePath, targetPath, fileExt, callback);
                    }
                });
            });

            callback();
        });
    },

    /**
     * 拷贝单个文件
     * @param sourceFile 来源文件
     */
    copyFile: function(sourceFile) {
    
        var self = this;
        Fs.stat(sourceFile, function(error, path) {
        
            if (error) {
                console.log('copyFile: ' + error);
            }

            if (path.isFile()) {

                var itmes;
                if (self.os == 'win32') {
                    items = sourceFile.split('\\');
                } else {
                    items = sourceFile.split('/');
                }
                var targetPath = [self.config.output.base.target];
                var sourcePath = [];
                for (var i in items) {
                    
                    sourcePath.push(items[i]);
                    if (items[i] == self.config.output.base.source) {
                        continue;
                    }

                    targetPath.push(items[i]);
                    var toPath = self.os == 'win32' ? targetPath.join('\\') : targetPath.join('/');
                    var fromPath = self.os == 'win32' ? sourcePath.join('\\') : sourcePath.join('/');

                    var stat = Fs.lstatSync(fromPath);
                    if(stat.isDirectory() && !Fs.existsSync(toPath)) {
                        console.log('创建目录: ' + toPath);
                        Fs.mkdirSync(toPath);
                    } else if(stat.isFile()) {
                        console.log('复制文件: ' + sourceFile + ' => ' + toPath);
                        var readable = Fs.createReadStream(sourceFile);
                        var writeable = Fs.createWriteStream(toPath);
                        readable.pipe(writeable);
                    }
                }
            }
        });
    },

    /**
     * 压缩JS
     * @params sourceList 来源JS文件
     * @params target 输出目标JS
     */
    jsMini: function(sourceList, target) {
    
        var resultCode;
        for (var i in sourceList) {
            var orgCode = Fs.readFileSync(sourceList[i], 'utf8');
            var ast = jsp.parse(orgCode);
            ast = pro.ast_mangle(ast);
            ast = pro.ast_squeeze(ast);
            resultCode += ';' + pro.gen_code(ast);
        }
        //this.copyFile();
    },

    /**
     * 构建模板
     */
    buildView: function() {
    
        var self = this;
        var sourceDir = self.config.output.base.source;
        var targetDir = self.config.output.base.target;
        var libDir = self.config.output.lib;
        var fromSource = sourceDir + '/' + self.config.output.view;
        var toSource = targetDir + '/' + libDir;
        var source;

        console.log('fromSource: ' + fromSource);

        var viewScript = [];
        var viewNodeObject = {};
        var doBuild = function(sourcePath) {
            var paths = Fs.readdirSync(sourcePath);

            paths.forEach(function(path) {

                var itemPath = sourcePath + '/' + path;
                var stat = Fs.lstatSync(itemPath);
                if (stat.isDirectory()) {
                    doBuild(itemPath);
                } else if (stat.isFile()) {

                    console.log('读取文件: ' + itemPath);
                    // 获取node做为子对象
                    var nodes = itemPath.split('/');
                    if (nodes.length != 4) {
                        console.log('构建View对象失败,模板目录深度错误');
                        return;
                    }
                    var nodePath = nodes[2];
                    var childs = path.split('.');
                    var viewScriptString = '';
                    if (!viewNodeObject.hasOwnProperty(nodePath)) {
                        viewScriptString = "View." + nodePath + " = {};";
                        viewNodeObject[nodePath] = true;
                    }
                    var file = Fs.readFileSync(itemPath, 'utf8');
                    if (file) {
                        var lines = file.split('\n');
                        var result = ['var html = "";'];
                        for (var index in lines) {
                            var line = self.templateParse(lines[index]);
                            if (line) {
                                result.push(line);
                            }
                        }

                        viewScript.push(viewScriptString + self.createViewObject(nodePath + '.' + childs[0], result.join('')) + ';');
                    }
                }
            });
        };

        doBuild(fromSource);

        // 生成view.js
        Fs.writeFileSync(toSource + '/view.js', viewScript.join(''), 'utf8');
    },

    /**
     * 构建输出html
     */
    build: function() {
    
        var self = this;

        console.log('build......');

        var fileExt = /^(gif|png|jpg|css|html|js)$/ig;
        var sourceDir = this.config.output.base.source;
        var targetDir = this.config.output.base.target;

        this.copyDir(sourceDir, targetDir, fileExt, function() {
        
        });

        this.buildView();
    },

    /**
     * 解析模板
     * @param line 行代码
     */
    templateParse: function(line) {

        if (!line || line == '') {
            return null;
        }

        var result = line.trim();
        var parseStatus = false;

        /**
         * 解析变量
         */
        var parseVer = function() {

            var item;
            // 检查变量
            var patt = /\{\{ (.+?) \}\}/ig;
            while (item = patt.exec(result)) {

                result = result.replace(item[0], "\"+" + item[1] + "+\"");
            }
        };

        /**
         * 解析条件
         */
        var parseCondition = function() {

            var item;
            var patt = /\{\{ if (.+?) \}\}/ig;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "if("+ item[1] +"){");
            }

            patt = /\{\{ else if (.+?) \}\}/ig;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "} else if("+ item[1] +"){");
            }

            patt = /\{\{ else \}\}/ig;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "} else {");
            }
        };

        /**
         * 解析循环
         */
        var parseLoop = function() {

            var item;
            var patt = /\{\{ loop (.+?) \}\}/ig;
            while (item = patt.exec(result)) {

                parseStatus = true;
                result = result.replace(item[0], "for("+ item[1] +"){");
            }
        };

        /**
         * 解析结束
         */
        var parseEnd = function() {

            var item;
            var patt = /\{\{ end \}\}/ig;
            while (item = patt.exec(result)) {

                parseStatus = true;
                result = result.replace(item[0], "}");
            }
        };


        parseLoop();
        parseCondition();
        parseEnd();
        parseVer();

        if (!parseStatus) {
            result = 'html += "' + result + '";';
        }

        return result;
    },

    /**
     * 构建view对象
     * @param node 子对象
     * @param scriptText 脚本文本
     */
    createViewObject: function(node, scriptText) {

        var txt = ['View.'+ node +'= function(data){'];
        txt.push(scriptText);
        txt.push('return html;');
        txt.push('}');

        console.log(txt.join(''));
        return txt.join('');
    }
};

module.exports = Server;
