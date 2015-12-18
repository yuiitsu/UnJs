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

var Config = require('./config');

var UnJs = function(){

    var self = this;

    self.request;
    self.response;

    // 配置
    self.config = {};

    // 路由配置
    self.routeConf = {};

    self.params = {};

    /**
     * 设置request
     */
    self.setRequest = function(request) {
        self.request = request;
    }

    /**
     * 设置response
     */
    self.setResponse = function(response) {
        self.response = response;
    }

    /**
     * 设置配置文件
     * 使用自定义配置文件继承系统配置
     */
    self.setConfig = function(config){
        for(var k in config){
            Config[k] = config[k];
        }
        self.config = Config;
    }

    /**
     * 设置路由
     */
    self.setRoute = function(route){
        self.routeConf = route;
    }

    /**
     * 路由
     */
    self.route = function(){
        params = Url.parse(self.request.url, true);
        // check static
        if(params.pathname.indexOf(Config.static_dir) != -1){
            self.setCache(params.path);
        }else{
            var controllerName = '';
            for(var k in self.routeConf){
                if(params.pathname == k){
                    controllerName = self.routeConf[k];
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
    }

    /**
     * 加载controller
     * @params controller_name string 控制器名称 
     */
    self.import = function(controller_name, params){
        require('../'+ Config['controller_dir'] +'/' + controller_name)(self);
    }

    /**
     * 获取GET数据
     * @params key string 下标
     */
    self._GET = function(key){
        params = Url.parse(self.request.url, true);
        return params.query[key];
    }

    /**
     * 获取POST数据
     * @params key string 下标
     */
    self._POST = function(key){
        return;
    }

    /**
     * 跳转
     */
    self.redirect = function(url){
        self.response.setHeader('Location', url);
        self.response.writeHead(302);
        self.response.end();
    }

    /**
     * 输出
     */
    self.write = function(str){
        self.response.write(str);
    }

    /**
     * 结束
     */
    self.end = function(html){
        self.response.writeHead(200, {'Content-Type': 'text/html'});
        if (html) {
            self.response.write(html);
        }
        self.response.end();
    }

    /**
     * 读取文件
     * @params filePath 文件地址
     * @params callback 回调函数
     */
    self.readFile = function(filePath, callback){
        Fs.readFile(filePath, 'utf-8', function(error, data){
            callback(error, data);
        })
    }

    /**
     * 读取目录
     */
    self.readDir = function(path, callback) {
        Fs.readdir(path, function(error, files) {
            callback(error, files);
        });
    }

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
                elf.response.end();
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
    }
    
    /**
     * 模板输出
     */
    self.display = function(template_name, data){

        var getTemplate = function(template_file){
            Fs.readFile(template_file, 'utf-8', function(error, data){
                var html = data;
                var hasSub = false;
                //
                var done = self.pending(function(returns) {
                    // 遍历字典
                    for(var key in returns) {
                        html = html.replace(key, returns[key]);
                    }

                    // 替换数据
                    if(out_data){
                        var patt = /\{\{ (.+?) \}\}/ig;
                        while(item = patt.exec(html)){
                            var items = item;
                            html = html .replace(items[0], out_data[items[1]]);
                        }
                    }

                    self.end(html);
                    //self.response.writeHead(200, {'Content-Type': 'text/html'});
                    //self.response.write(html);
                    //self.response.end();
                });

                // include
                var patt = /\{\% include \'(.+)\' \%\}/ig;
                while(sub = patt.exec(data)){
                    hasSub = true;
                    var subs = sub;
                    Fs.readFile('./template/' + subs[1], 'utf-8', done(subs[0]));
                }

                if (!hasSub) {
                    //self.response.writeHead(200, {'Content-Type': 'text/html'});
                    //self.response.write(html);
                    //self.response.end();
                    self.end(html);
                }
            })
        }

        var out_data = data;
        // 检测文件
        var template_file = './'+ self.config.template_dir +'/' + template_name +'.html';
        Fs.exists(template_file, function(exists){
            if(!exists){
                template_file = './unjs/'+ self.config.template_dir +'/'+ template_name +'.html';
                if(Fs.existsSync(template_file)){
                    getTemplate(template_file);           
                }else{
                    self.response.writeHead(200, {'Content-Type': 'text/html'});
                    self.response.write('Not Found Tempate File');
                    self.response.end();
                }
            }else{
                getTemplate(template_file);           
            }
        });
    }

    /**
     * 读取文件 
     */ 
    self.readFile = function(filePath, callback){
        Fs.readFile(filePath, 'utf-8', function(error, data){
            callback(error, data);
        });
    }

    /**
     *
     */
    self.pending = (function(callback) {
        var count = 0;
        var returns = {};
        return function(sub) {
            count++;
            return function(error, data) {
                count--;
                if (!error) {
                    returns[sub] = data; 
                    if (count == 0) {
                        callback(returns);
                    }
                }
            }
        }
    });
    
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
        "xml": "text/xml"
    }
}

var Server = {

    /**
     * 启动服务
     */
    server: function(port, config, route){

        var port = !port ? 3000 : port;

        Http.createServer(function(req, res){

            var u = new UnJs();
            u.setRequest(req);
            u.setResponse(res);
            u.setConfig(config);
            u.setRoute(route);
            u.route();

        }).listen(port);   

        console.log('HTTP server is listening at port %s', port);
    },

    /**
     * 运行
     */
    run: function(config, route){
        var argv = process.argv;
        var port = argv[2];

        this.server(port, config, route);
    }
}

module.exports = Server;
