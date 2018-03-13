/**
 * WmJs
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
var Iconv = require('iconv-lite');
var Config = require('./config');
var Cookie = require('./cookie');
var Template = require('./template');

var UnJs = function () {

    var self = this;
    self.fs = Fs;
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
    self.setRequest = function (request) {
        self.request = request;
    };

    /**
     * 设置response
     */
    self.setResponse = function (response) {
        self.response = response;
    };

    /**
     * 设置配置文件
     * 使用自定义配置文件继承系统配置
     */
    self.setConfig = function (config) {
        for (var k in config) {
            if (config.hasOwnProperty(k)) {
                Config[k] = config[k];
            }
        }
        self.config = Config;
    };

    /**
     * 设置路由
     */
    self.setRoute = function (route) {
        self.routeConf = route;
    };

    self.setApiHost = function (apiHost) {
        //self.apiHost = Config.api[apiHost];
        self.apiHost = apiHost;
    };

    /**
     * 路由,判断静态文件和控制器
     */
    self.route = function () {

        var params = Url.parse(self.request.url, true);
        self.params = params;
        var pathname = params.pathname;

        var isStatic = false;
        var staticDirList = [];
        for (var i in Config.build.scripts) {
            staticDirList.push(Config.build.scripts[i]);
        }
        staticDirList.push(Config.build.styleDir);
        staticDirList.push(Config.build.staticDir);
        staticDirList.push(Config.build.tempDir);
        staticDirList.push(Config.build.commonDir);
        staticDirList.push(Config.build.coreDir);
        for (var i in staticDirList) {
            if (pathname.indexOf('/' + staticDirList[i] + '/') != -1) {
                isStatic = true;
            }
        }

        //if (isStatic) {
        //    // 是静态资源
        //    self.setCache(params['path']);
        //} else {
        // 不是静态资源
        // 检查是否为转发请求
        var isRequestFlag = false;
        var requestFlag = Config.requestFlag;
        for (var i in requestFlag) {
            if (pathname.indexOf(requestFlag[i]) != -1) {
                isRequestFlag = true;
            }
        }

        if (isRequestFlag) {
            // 是转发请求
            self.sendHttpRequest();
        } else {
            if (isStatic) {
                self.setCache(params['path']);
            } else {
                // 不是转发请求
                var controllerName = '';
                for (var k in self.routeConf) {
                    if (pathname == k) {
                        if (self.routeConf.hasOwnProperty(k)) {
                            controllerName = self.routeConf[k];
                        }
                        break;
                    }
                }
                if (!controllerName) {
                    controllerName = 'index';
                }
                self.import(controllerName);
            }
        }
        //}
    };

    /**
     * 加载controller
     * @params controller_name string 控制器名称
     */
    self.import = function (controller_name) {
        require('./' + Config['controller_dir'] + '/' + controller_name)(self);
    };

    /**
     * 模板输出
     */
    self.display = function (templateName, data) {
        // 检测文件
        var templateFile = './' + self.config.template_dir + '/' + templateName + '.html';
        Fs.exists(templateFile, function (exists) {
            if (!exists) {
                templateFile = './wmjs/' + self.config.template_dir + '/' + templateName + '.html';
                if (!Fs.existsSync(templateFile)) {
                    self.response.writeHead(200, {'Content-Type': 'text/html'});
                    self.response.write('Not Found Tempate File');
                    self.response.end();
                }
            }

            Template.parse(templateFile, data, self);
        });
    };

    /**
     * 获取GET数据
     * @params key string 下标
     */
    self._get = function (key) {
        self.params = Url.parse(self.request.url, true);
        return self.params.query[key];
    };

    /**
     * 获取POST数据
     * @params callback function 回调方法
     */
    self._post = function (callback) {

        self.request.setEncoding('utf-8');
        var postDataString = '';

        // 接收数据
        self.request.addListener('data', function (postDataChunk) {

            postDataString += postDataChunk;
        });

        // 接收完毕
        self.request.addListener("end", function () {

            var postDataObject = null;
            if (postDataString) {
                postDataObject = queryString.parse(postDataString);
            }
            callback(postDataObject, postDataString);
        });
    };

    /**
     * 输出
     */
    self.write = function (str) {
        self.response.write(str);
    };

    /**
     * 执行控制器中的方法
     * @param object 控制器对象
     * @param method 方法名
     */
    self.doFunction = function (object, method) {

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
    self.result = function (status, message, data) {

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
    self.end = function (html, paraContentType, statusCode) {
        statusCode = isNaN(statusCode) ? 200 : statusCode;
        var contentType = paraContentType ? paraContentType : 'text/html';
        self.response.writeHead(statusCode, {'Content-Type': contentType});
        self.response.write(html);
        self.response.end();
    };

    /*
     * 发送http请求
     */
    self.sendHttpRequest = function (options, callback) {

        var jsessionid = self.cookie.get(self, 'JSESSIONID');
        var token = self.cookie.get(self, 'token');

        var request = function (url, data, postDataString) {
            var header = self.request.headers,
                headers = {
                    'user-agent': header['user-agent'],
                    'cookie': header.hasOwnProperty('cookie') ? header['cookie'] : '',
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
                };

            var hosts = self.apiHost.split(":");
            if (url.indexOf('/api/events/') !== -1 || url.indexOf('/api/funnels/') !== -1) {
                hosts[0] = '120.55.241.136';
                hosts[1] = '8007';
                data = postDataString;
                headers['content-type'] = 'application/json';
            }
            var reqParams = {
                hostname: hosts[0],
                port: hosts[1] ? hosts[1] : '',
                path: url,
                method: method,
                headers: headers
            };

            var body = '';
            var req = Http.request(reqParams, function (response) {

                var headers = response.headers;
                console.log(headers);
                response.on('data', function (d) {
                    body += d;
                }).on('end', function () {
                    var cookieList = headers['set-cookie'];
                    if (cookieList) {
                        var cookieListLen = cookieList.length;
                        for (var i = 0; i < cookieListLen; i++) {
                            cookieList[i] = cookieList[i].replace(/Domain=.*;?/, 'Domain=localhost;Path=/;');
                        }
                        self.response.setHeader('Set-Cookie', cookieList.join(';'));
                    }
                    //if (cookieList) {
                    //    self.response.setHeader('Set-Cookie', cookieList.join(';'));
                    //}

                    if (callback) {
                        callback(body);
                    } else {
                        self.end(body, headers['content-type'], response.statusCode);
                    }
                });
            });

            req.on('error', function (e) {
                console.log('problem with request: ' + e.message);
                self.end('request error');
            });

            if (data) {
                if (typeof data === 'string') {
                    req.write(data);
                } else {
                    req.write(queryString.stringify(data));
                }
            }
            req.end();
        };

        var url = self.request.url;
        var method = self.request.method;
        if (options) {
            self.request.url = options.url + '?para=' + encodeURIComponent(JSON.stringify(options.data));
            self.request.method = 'GET';
            var para = JSON.stringify(options.data);
            request(url);
        } else {
            if (method === 'GET') {
                var para = self._get('para');
                request(url);
            }

            if (method === 'DELETE') {
                request(url);
            }

            if (method === 'POST' || method === 'PUT') {
                self._post(function (data, postDataString) {
                    request(url, data, postDataString);
                });
            }
        }
    };

    /**
     * 读取文件
     * @params filePath 文件地址
     * @params callback 回调函数
     */
    self.readFile = function (filePath, callback) {
        Fs.readFile(filePath, 'utf-8', function (error, data) {
            callback(error, data);
        })
    };

    /**
     * 设置浏览器静态文件缓存
     */
    self.setCache = function (path) {
        var file_match = /^(gif|png|jpg|js|css|ttf|woff)$/ig;
        var max_age = 606024365;

        var file_path = './dev' + path;

        Fs.exists(file_path, function (exists) {
            if (!exists) {
                self.response.writeHead(404, {'Content-Type': 'text/plain'});
                self.response.end();
            } else {
                Fs.stat(file_path, function (error, stat) {
                    var ext = Path.extname(file_path);
                    ext = ext ? ext.slice(1) : 'unknown';
                    var content_type = self.types[ext] || "text/plain";
                    if (!error) {
                        var last_modified = stat.mtime.toUTCString();
                        var if_modified_since = "If-Modified-Since".toLowerCase();

                        self.response.setHeader("Last-Modified", last_modified);

                        if (ext.match(file_match)) {
                            var expires = new Date();
                            expires.setTime(expires.getTime() + max_age * 1000);
                            self.response.setHeader("Expires", expires.toUTCString());
                            self.response.setHeader("cache-Control", "max-age=" + max_age);
                        }

                        if (self.request.headers[if_modified_since] && last_modified == self.request.headers[if_modified_since]) {
                            self.response.writeHead(304, "Not Modified");
                            self.response.end();
                        } else {
                            Fs.readFile(file_path, 'binary', function (error, data) {
                                if (error) {
                                    self.response.writeHead(500, 'Internal Server Error', {'Content-Type': 'text/plain'});
                                    self.response.end(error);
                                } else {
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
     * 异步回调时的计数处理
     */
    self.pending = (function (callback) {
        var count = 0;
        var returns = {};
        return function (task) {
            count++;
            return function (error, data) {
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
    self.asyncSeries = function (task, func, callback) {
        var taskLen = task.length;
        if (taskLen <= 0) {
            console.log(taskLen);
            return;
        }
        var done = self.pending(callback);
        for (var i = 0; i < taskLen; i++) {
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
        //"ico": "image/x-icon",
        "woff": "application/font-woff",
        "ttf": "application/font-ttf",
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

    /**
     * 解析模板
     * @param line 行代码
     */
    self.templateParse = function (line) {

        if (!line || line == '') {
            return null;
        }

        var result = line.trim().replace(new RegExp(/'/g), "\\'");
        var parseStatus = false;

        /**
         * 解析变量
         */
        var parseData = function () {

            var item;
            // 检查变量
            var patt = /\{\{ (.+?) \}\}/i;
            while (item = patt.exec(result)) {

                result = result.replace(item[0], "'+" + item[1].replace(new RegExp(/\\/g), "") + "+'");
            }
        };

        /**
         * 解析定义
         */
        var parseVer = function () {
            var item;
            // 检查变量
            var patt = /\{\{ var (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "var " + item[1].replace(new RegExp(/\\/g), "") + ";");
            }
        };

        /**
         * 解析条件
         */
        var parseCondition = function () {

            var item;
            var patt = /\{\{ if (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "if(" + item[1].replace(new RegExp(/\\/g), "") + "){");
            }

            patt = /\{\{ else if (.+?) \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "} else if(" + item[1].replace(new RegExp(/\\/g), "") + "){");
            }

            patt = /\{\{ else \}\}/i;
            while (item = patt.exec(result)) {
                parseStatus = true;
                result = result.replace(item[0], "} else {");
            }
        };

        /**
         * 解析循环
         */
        var parseLoop = function () {

            var item;
            var patt = /\{\{ loop (.+?) \}\}/i;
            while (item = patt.exec(result)) {

                parseStatus = true;
                result = result.replace(item[0], "for(" + item[1].replace(new RegExp(/\\/g), "") + "){");
            }
        };

        /**
         * 解析结束
         */
        var parseEnd = function () {

            var item;
            var patt = /\{\{ end \}\}/i;
            while (item = patt.exec(result)) {

                parseStatus = true;
                result = result.replace(item[0], "}");
            }
        };

        var parseTag = function () {
            var item,
                needParseChild = false;
            var customizePatt = /\b(a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdi|bdo|big|blockquote|body|br|button|canvas|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|label|legend|li|link|main|map|mark|menu|menuitem|nav|object|ol|optgroup|option|output|p|param|pre|pregress|q|rp|rt|ruby|s|section|select|small|source|span|strong|style|sub|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video|wbr)\b/i;
            var patt = /<([\w\.]+)([^]*?)>([^]*?)<\/\1>/gi;
            while (item = patt.exec(result)) {
                //item 0匹配的内容 1标签名 2标签属性 3标签包裹的内容
                //判断是否自定义标签
                if (/*!customizePatt.test(item[1])*/ item[1].indexOf('.') >= 0) {
                    var attr = {},
                        attrPatt = /\w+?=\\?\".*?\\?\"/gi,
                        attrStr = item[2].trim(),
                        attrArr = attrStr.match(attrPatt) || [];
                    attrArr.forEach(function (currentValue, i, array) {
                        var currentValueArr = currentValue.match(/(\S+?)=(.*)/),
                            key = currentValue && currentValue[1] ? currentValueArr[1].trim() : '',
                            value = currentValue && currentValue[2] ? currentValueArr[2].replace(/\\?\"/g, '') : '';
                        attr[key] = value;
                    });
                    parseStatus = true;
                    if (item[3].trim()) {
                        attr['childHtml'] = item[3];
                        needParseChild = true;
                    }
                    attr = JSON.stringify(attr);
                    //将大括号里转化后的字符串再转化成对象
                    if (attr.indexOf('+') >= 0) {
                        var match,
                            valuePatt = /\"\'\+([^]+?)\+\'\"/i;
                        while (match = valuePatt.exec(attr)) {
                            attr = attr.replace(match[0], match[1]);
                        }
                    }
                    result = result.replace(item[0], "html += this.getView('" + item[1] + "'," + attr + ");");
                    patt = /<([\w\.]+)([^]*?)>([^]*?)<\/\1>/gi;
                } else {
                    // break;
                }
            }
            if (needParseChild) {
                //将解析后的嵌套的模板进行拼接
                var childPatt = /\"childHtml\"\:\"[^]*?(html \+= [^]*?;)[^]*\"/,
                    childMatch,
                    childStrMatch,
                    childStr = '',
                    pat = /html \+= ([^]+?\}\));/;
                while (childMatch = childPatt.exec(result)) {
                    childStrMatch = pat.exec(childMatch[1]);
                    childStr = childStrMatch && childStrMatch[1];
                    result = result.replace(childMatch[1], '" + ' + childStr + '+ "');
                }
            }

        };


        parseLoop();
        parseCondition();
        parseEnd();
        parseVer();
        parseData();
        parseTag();

        if (!parseStatus) {
            result = "html += '" + result + "';";
        }

        return result;
    };
};

module.exports = UnJs;
