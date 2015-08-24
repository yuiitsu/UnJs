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

    // 配置
    self.config = {};

    // 路由配置
    self.route_conf = {};

    self.res = {};

    self.params = {};

    /**
     * 启动服务
     */
    self.run = function(){
        var argv = process.argv;
        var port = argv[2];

        self.server(port);
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
        self.route_conf = route;
    }

    self.server = function(port){

        var port = !port ? 3000 : port;

        Http.createServer(function(req, res){

            self.res = res;
            self.req = req;

            self.route(req, res);

        }).listen(port);   

        console.log('HTTP server is listening at port %s', port);
    }

    /**
     * 路由
     */
    self.route = function(req, res){
        params = Url.parse(req.url, true);
        // check static
        if(params.pathname.indexOf(Config.static_dir) != -1){
            self.setCache(params.path, res);
        }else{
            var controller_name = '';
            for(var k in self.route_conf){
                if(params.pathname == k){
                    controller_name = self.route_conf[k];
                    break;
                }
            } 
            if(!controller_name){
                self.res.writeHead(404, {'Content-Type': 'text/plain'});
                self.res.write('404');
                self.res.end();
                return;
            }
            self.import(controller_name, res, params);
        }
    }

    /**
     * 加载controller
     * @params controller_name string 控制器名称 
     */
    self.import = function(controller_name, res, params){
        require('../'+ Config['controller_dir'] +'/' + controller_name)(self);
    }

    /**
     * 获取GET数据
     * @params key string 下标
     */
    self._GET = function(key){
        params = Url.parse(self.req.url, true);
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
     * 输出
     */
    self.write = function(str){
        self.res.write(str);
    }

    /**
     * 结束
     */
    self.end = function(){
        self.res.end();
    }

    /**
     * 设置浏览器静态文件缓存
     */
    self.setCache = function(path, res){
        var file_match = /^(gif|png|jpg|js|css)$/ig;
        var max_age = 606024365;

        var file_path = '.' + path;
        

        Fs.exists(file_path, function(exists){
            if(!exists){
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end();
            }else{
                Fs.stat(file_path, function(error, stat){
                    if(!error){
                        var last_modified = stat.mtime.toUTCString();
                        var if_modified_since = "If-Modified-Since".toLowerCase();

                        res.setHeader("Last-Modified", last_modified);
                        
                        if(ext.match(file_match)){
                            var expires = new Date();
                            expires.setTime(expires.getTime() + max_age * 1000);
                            res.setHeader("Expires", expires.toUTCString());
                            res.setHeader("cache-Control", "max-age=" + max_age);
                        }

                        if(req.headers[if_modified_since] && last_modified == req.headers[if_modified_since]){
                            res.writeHead(304, "Not Modified");
                            res.end();
                        }else{
                            var ext = Path.extname(file_path);
                            ext = ext ? ext.slice(1) : 'unknown';
                            var content_type = self.types[ext] || "text/plain";

                            Fs.readFile(file_path, 'binary', function(error, data){
                                if(error){
                                    res.writeHead(500, 'Internal Server Error', {'Content-Type': 'text/plain'});
                                    res.end(error);
                                }else{
                                    res.writeHead(200, {'Content-Type': content_type});
                                    res.write(data, 'binary');
                                    res.end();
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
        var out_data = data;
        Fs.readFile('./'+ Config.template_dir +'/'+ template_name +'.html', 'utf-8', function(error, data){

            var html = data;

            // include
            var patt = /\{\% include \'(.+)\' \%\}/ig;
            while(sub = patt.exec(data)){
                var subs = sub;
                content = Fs.readFileSync('./template/' + subs[1], 'utf-8');
                html = html.replace(subs[0], content);
            }

            // 替换数据
            if(out_data){
                var patt = /\{\{ (.+?) \}\}/ig;
                while(item = patt.exec(html)){
                    var items = item;
                    html = html .replace(items[0], out_data[items[1]]);
                }
            }

            self.res.writeHead(200, {'Content-Type': 'text/html'});
            self.res.write(html);
            self.res.end();

        })
    }
    
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

module.exports = UnJs;
