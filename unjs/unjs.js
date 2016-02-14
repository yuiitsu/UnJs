/**
 * UnJs
 * 
 * author: onlyfu
 * update: 2015-08-24
 */

var Http = require('http');
var Url = require('url');
var Fs = require('fs');
var Path = require('path');
var queryString = require('querystring');

var Template = require('./template');
var Config = require('./config');
var Cookie = require('./cookie');

var UnJs = function(){

    var self = this;

    self.cookie = Cookie;

    self.request = null;
    self.response = null;

    // 配置
    self.config = null;

    // 路由配置
    self.routeConf = null;

    self.params = null;

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

    self.setReadPool = function(pool) {
        self.readPool = pool;
    };

    self.setWritePool = function(pool) {
        self.writePool = pool;
    };

    self.getUrl = function() {
    
        //var params = Url.parse(self.request.url, true);
        return self.request.url;
    };

    self.getClientIp = function() {
        return self.request.headers['x-forwarded-for'] ||
        self.request.connection.remoteAddress ||
        self.request.socket.remoteAddress ||
        self.request.connection.socket.remoteAddress;
    };

    /**
     * 路由
     */
    self.route = function(){
        var params = Url.parse(self.request.url, true);
        // check static
        if(params.pathname.indexOf(Config.static_dir) != -1 || params.pathname.indexOf('favicon.ico') != -1){
            self.setCache(params['path']);
        }else{
            
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
                self.response.writeHead(404, {'Content-Type': 'text/plain'});
                self.display('404', {});
                return;
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

    /**
     * 启动服务
     */
    server: function(port, config, route){

        var lisPort = !port ? 3000 : port;

        Http.createServer(function(req, res){

            var u = new UnJs();
            u.setRequest(req);
            u.setResponse(res);
            u.setConfig(config);
            u.setRoute(route);
            u.route();

        }).listen(lisPort);

        console.log('HTTP server is listening at port %s', lisPort);
    },

    /**
     * 运行
     */
    run: function(config, route){
        var argv = process.argv;
        var port = argv[2];

        this.server(port, config, route);
    }
};

module.exports = Server;
