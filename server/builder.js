/**
 * Builder
 */
const Fs = require('fs');
const Path = require('path');
const uglify = require('uglify-js');
const cleanCSS = require('clean-css');

const Builder = {

    config: null,
    /**
     * 拷贝目录
     * @param sourceDir 源目录
     * @param targetDir 目标目录
     * @param fileExt 检测文件类型
     * @param miniFile
     */
    copyDir: function (sourceDir, targetDir, fileExt, miniFile) {
        var self = this;
        var paths = Fs.readdirSync(sourceDir);
        if (paths) {
            paths.forEach(function (path) {

                var sourcePath = sourceDir + '/' + path;
                var targetPath = targetDir + '/' + path;
                var stat = Fs.lstatSync(sourcePath);
                if (stat.isFile()) {
                    var extName = Path.extname(sourcePath).slice(1);
                    if (extName.match(fileExt)) {
                        var readable, writeable;
                        if (Fs.existsSync(targetDir)) {
                            console.log('复制文件: ' + sourcePath + ' => ' + targetPath);
                            if (miniFile && extName === 'js') {
                                self.jsMini(sourcePath, targetPath);
                            } else {
                                readable = Fs.createReadStream(sourcePath);
                                writeable = Fs.createWriteStream(targetPath);
                                readable.pipe(writeable);
                            }
                        } else {
                            console.log('创建目录: ' + targetDir);
                            Fs.mkdirSync(targetDir);
                            readable = Fs.createReadStream(sourcePath);
                            writeable = Fs.createWriteStream(targetPath);
                            readable.pipe(writeable);
                        }
                    }
                } else if (stat.isDirectory()) {

                    if (!Fs.existsSync(targetPath)) {
                        console.log('创建目录: ' + targetPath);
                        Fs.mkdirSync(targetPath);
                    } else {
                        console.log('目录存在: ' + targetPath);
                    }
                    self.copyDir(sourcePath, targetPath, fileExt, miniFile);
                }
                //}
            });
        }
    },

    /**
     * 清空目录
     * @param targetDir
     */
    delDir: function (targetDir) {
        let self = this,
            paths = Fs.readdirSync(targetDir);

        if (paths) {
            paths.forEach(function (path) {
                let targetPath = targetDir + '/' + path,
                    stat = Fs.lstatSync(targetPath);

                if (stat.isFile()) {
                    // 如果是文件，直接删除
                    console.log('删除文件: ' + targetPath);
                    Fs.unlinkSync(targetPath);
                } else if (stat.isDirectory()) {
                    self.delDir(targetPath);
                }
            });
        }
    },

    /**
     * 压缩JS
     * @params sourceList 来源JS文件
     * @params target 输出目标JS
     */
    jsMini: function (sourceList, target) {

        //var result = uglify.minify(sourceList);
        //Fs.writeFileSync(target, result['code'], 'utf8');
    },

    /**
     * 构建模板
     */
    buildView: function (miniFile) {
        console.log('buildView...');

        let self = this,
            sourceDir = self.config.devDir + '/' + self.config.build.viewDir,
            targetDir = self.config.build.distDir + '/scripts',
            fromSource = sourceDir,
            toSource = targetDir,
            viewScript = [],
            viewNodeObject = {};

        let  doBuild = function (sourcePath) {
            let paths = Fs.readdirSync(sourcePath);
            paths.forEach(function (path) {
                let itemPath = sourcePath + '/' + path,
                    stat = Fs.lstatSync(itemPath);

                if (stat.isDirectory()) {
                    doBuild(itemPath);
                } else if (stat.isFile()) {
                    console.log('读取文件: ' + itemPath);
                    // 获取node做为子对象
                    let nodes = itemPath.split('/');
                    if (nodes.length !== 4) {
                        console.log('构建View对象失败,模板目录深度错误');
                        return;
                    }
                    let nodePath = nodes[2],
                        children = path.split('.'),
                        viewScriptString = '';

                    if (!viewNodeObject.hasOwnProperty(nodePath)) {
                        viewScriptString = "WmJs.View." + nodePath + " = {};";
                        viewNodeObject[nodePath] = true;
                    }
                    let file = Fs.readFileSync(itemPath, 'utf8');
                    if (file) {
                        let lines = file.split('\n'),
                            result = ['var html = "";'];

                        for (let index in lines) {
                            let line = self.templateParse(lines[index]);
                            if (line) {
                                result.push(line);
                            }
                        }

                        viewScript.push(viewScriptString +
                            self.createViewObject(nodePath + '.' + children[0], result.join('')) + ';');
                    }
                }
            });
        };

        doBuild(fromSource);

        // 生成view.js
        let viewFile = toSource + '/view.js';
        Fs.writeFileSync(viewFile, viewScript.join(''), 'utf8');
        if (miniFile) {
            this.jsMini([viewFile], viewFile);
        }
        console.log('buildView success');
    },

    // /**
    //  * 获取目录下所有文件列表
    //  * @param dirList 目标目录
    //  */
    //getFileList: function(dirList) {
    //
    //    for (var i in dirList) {
    //        var dirPath = server.config.devDir + '/' + dirList[i];
    //        var paths = server.fs.readdirSync(dirPath);
    //        if (paths) {
    //            paths.forEach(function(path) {
    //                var filePath = dirList[i] + '/' + path;
    //                var stat = server.fs.lstatSync(server.config.devDir + '/' + filePath);
    //                if (stat.isFile()) {
    //                    // 如果是文件
    //                    fileList.push(filePath);
    //                } else {
    //                    // 是目录
    //                    getFileList([dirList[i] + '/' + path]);
    //                }
    //            });
    //        }
    //    }
    //},

    buildView2: function (devDir, distDir) {
        console.log('buildView...');
        var viewScript = [];
        var createViewContent = function (dir, name, content) {
            var funcName = dir + '.' + name;
            var txt = ["View.extend('" + funcName + "', function() {"];
            txt.push("this.init = function(data) {");
            txt.push("var html = '';");
            txt.push(content);
            txt.push("return html;");
            txt.push("}");
            txt.push("});");
            return txt.join("");
        };

        var scriptList = [];
        this.getFileList(['view']);
        for (var i in this.scripts) {
            var nodes = this.scripts[i].split('/');
            if (nodes.length !== 3) {
                console.log('构建View对象失败,模板目录深度错误');
            } else {
                var nodeName = nodes[1];
                var views = nodes[2].split(".");
                var nodePath = nodeName + '.' + views[0];
                var file = Fs.readFileSync(this.config.devDir + '/' + this.scripts[i], 'utf8');
                if (file) {
                    var lines = file.split('\n');
                    var result = [];
                    for (var index in lines) {
                        var line = this.templateParse(lines[index]);
                        if (line) {
                            result.push(line);
                        }
                    }
                    viewScript.push(createViewContent(nodeName, views[0], result.join('')));
                }
            }
        }

        // 生成view.js
        var viewFile = distDir + '/scripts/view.js';
        Fs.writeFileSync(viewFile, viewScript.join(''), 'utf8');
        console.log('buildView succ');
    },

    /**
     * 构建开发调试
     */
    develop: function () {
        // 1. 获取配置
        var buildConfig = this.config.build;
        // 2. 构建JS
        this.getFileList(buildConfig.scripts);
        // 3. 构建HTML
        // 4. 生成index
        //this.buildIndex();
    },

    /**
     * 构建输出html
     */
    build: function (host, config) {
        console.log('build......');
        this.config = config;

        var fileExt = /^(gif|png|jpg|css|html|js|svg|ttf|eot|woff|woff2)$/ig;
        var sourceDir = this.config.devDir;
        var targetDir = this.config.build.distDir;
        // 检查目录目标是否存在
        if (!Fs.existsSync(targetDir)) {
            console.log('创建目录: ' + targetDir);
            Fs.mkdirSync(targetDir);
        }
        var distDir = 'temp';
        if (!Fs.existsSync(distDir)) {
            console.log('创建目录: ' + distDir);
            Fs.mkdirSync(distDir);
        } else {
            console.log('清空目录: ' + distDir);
            this.delDir(distDir);
        }

        var devDir = this.config.devDir;
        this.createVersion();
        // 1. 构建lib scripts
        this.buildLibScripts(devDir, distDir);
        // 2. 构建un scripts
        this.buildUnScripts(devDir, distDir);
        // 3. 构建view
        this.buildView2(devDir, distDir);
        // 4. 构建Style
        this.buildStyle(devDir, distDir);


        // 6. 构建首页
        this.buildIndex(distDir, host);

        // 清空目标文件件
        this.delDir(targetDir);
        // 5. 构建字体和图片
        this.buildStaticFile(devDir, targetDir);
        // 拷贝
        this.copyDir(distDir, targetDir, fileExt);

        this.buildTheme(devDir, targetDir);

        // 清空缓存文件夹
        this.delDir(distDir);

        //if(miniFile) {
        //    self.concatJs();
        //}

        //self.buildView(miniFile);
    },

    buildTheme: function (devDir, distDir) {
        var themeDir = this.config.themeDir;
        this.copyDir(Path.join(devDir,themeDir),Path.join(distDir,themeDir));
    },

    /**
     * 构建lib scripts
     * @param devDir
     * @param distDir
     */
    buildLibScripts: function (devDir, distDir) {
        console.log('创建lib scripts...');
        // libScripts
        var commonDir = this.config.build.commonDir;
        var path = devDir + '/' + commonDir + '/';
        var libScripts = this.config.build.libScripts;
        var scriptList = [];
        var scriptCodeList = [];
        for (var i in libScripts) {
            var file = Fs.readFileSync(path + libScripts[i], 'utf8');
            scriptCodeList.push(file);
            scriptList.push(path + libScripts[i]);
        }
        // 执行压缩
        var result = uglify.minify(scriptList);

        var scriptsDir = distDir + '/scripts';
        if (!Fs.existsSync(scriptsDir)) {
            console.log('创建目录: ' + scriptsDir);
            Fs.mkdirSync(scriptsDir);
        }
        var scriptFile = scriptsDir + '/app.js';
        Fs.writeFileSync(scriptFile, result['code'], 'utf8');
        //Fs.writeFileSync(scriptFile, scriptCodeList.join(""), 'utf8');
        console.log('创建lib scripts success: ' + scriptFile);
    },

    /**
     * 构建un scripts
     * @param devDir
     * @param distDir
     */
    buildUnScripts: function (devDir, distDir) {
        console.log('创建un scripts...');
        var targetDirList = this.config.build.scripts;
        var coreDir = this.config.build.coreDir;
        var coreScriptList = this.config.build.coreScripts;
        var scriptList = [];
        for (var i in coreScriptList) {
            scriptList.push(devDir + '/' + coreDir + '/' + coreScriptList[i]);
        }

        function scanDir(targetDir) {
            var paths = Fs.readdirSync(targetDir);
            if (paths) {
                var itemList = [];
                paths.forEach(function (path) {
                    var targetPath = targetDir + '/' + path;
                    var stat = Fs.lstatSync(targetPath);
                    if (stat.isFile()) {
                        // 如果是文件，将文件路径加入
                        scriptList.push(targetPath);
                    } else if (stat.isDirectory()) {
                        //scanDir(targetPath);
                        itemList.push(targetPath);
                    }
                });

                for (var j in itemList) {
                    scanDir(itemList[j]);
                }
            }
        }

        for (var i in targetDirList) {
            scanDir(devDir + '/' + targetDirList[i]);
        }
        // 执行压缩
        var result = uglify.minify(scriptList);
        var scriptsDir = distDir + '/scripts';
        var scriptFile = scriptsDir + '/un.js';
        Fs.writeFileSync(scriptFile, result['code'], 'utf8');
        console.log('创建un scripts success: ' + scriptFile);
    },

    /**
     * 构建样式
     * @param devDir
     * @param distDir
     */
    buildStyle: function (devDir, distDir) {
        console.log('创建style...');
        var styleDir = this.config.build.styleDir;
        var styleList = this.config.build.styleList;
        var compnentStyleList = this.config.build.componentStyleList;
        var staticDir = distDir + '/static';
        var styleOutDir = staticDir + '/style';
        var componentStyleOutDir = styleOutDir + '/shop-component';
        // 检查目录
        if (!Fs.existsSync(staticDir)) {
            console.log('创建目录: ' + staticDir);
            Fs.mkdirSync(staticDir);
        }
        if (!Fs.existsSync(styleOutDir)) {
            console.log('创建目录: ' + styleOutDir);
            Fs.mkdirSync(styleOutDir);
        }
        if (!Fs.existsSync(componentStyleOutDir)) {
            console.log('创建目录: ' + componentStyleOutDir);
            Fs.mkdirSync(componentStyleOutDir);
        }

        // 执行压缩
        var half = parseInt(styleList.length / 2);
        console.log(half);
        var styleCodeList = [];
        var styleCodeList2 = [];
        //var styleFileList = [];
        var index = 0;
        for (var i in styleList) {
            var path = devDir + '/' + styleDir + '/' + styleList[i];
            var origCode = Fs.readFileSync(path, 'utf8');
            if (index <= half) {
                styleCodeList.push(origCode);
            } else {
                styleCodeList2.push(origCode);
            }
            index++;
            //styleFileList.push(path);
        }

        // 组件样式
        var componentStyleCodeList = [];
        for (var i in compnentStyleList) {
            var path = devDir + '/' + styleDir + '/' + compnentStyleList[i];
            var origCode = Fs.readFileSync(path, 'utf8');
            componentStyleCodeList.push(origCode);
        }

        // 复制需复制的样式
        var copyStyleList = this.config.build.copyStyle;
        for (var i in copyStyleList) {
            var fileCode = Fs.readFileSync(devDir + '/' + styleDir + '/' + copyStyleList[i], 'utf8');
            var copyToFile = styleOutDir + '/' + copyStyleList[i];
            Fs.writeFileSync(copyToFile, fileCode, 'utf8');
        }

        var scriptFile = styleOutDir + '/app.css';
        Fs.writeFileSync(scriptFile, styleCodeList.join(""), 'utf8');
        console.log('创建style success: ' + scriptFile);
        var scriptFile2 = styleOutDir + '/app2.css';
        Fs.writeFileSync(scriptFile2, styleCodeList2.join(""), 'utf8');
        console.log('创建style success: ' + scriptFile2);
        var scriptFileComponent = componentStyleOutDir + '/component.css';
        Fs.writeFileSync(scriptFileComponent, componentStyleCodeList.join(""), 'utf8');
        console.log('创建style success: ' + scriptFileComponent);
    },

    /**
     * 构建静态文件，字体和图片
     * @param devDir
     * @param distDir
     */
    buildStaticFile: function (devDir, distDir) {
        console.log('复制字体和图片...');
        var staticOutDir = distDir + '/static';
        var staticDir = this.config.build.staticDir;
        var fontDir = this.config.build.fontDir;
        var imagesDir = this.config.build.imagesDir;
        // 检查目录
        if (!Fs.existsSync(staticOutDir)) {
            console.log('创建目录: ' + staticOutDir);
            Fs.mkdirSync(staticOutDir);
        }
        var fontOutDir = staticOutDir + '/' + fontDir;
        if (!Fs.existsSync(fontOutDir)) {
            console.log('创建目录: ' + fontOutDir);
            Fs.mkdirSync(fontOutDir);
        }
        var imagesOutDir = staticOutDir + '/' + imagesDir;
        if (!Fs.existsSync(imagesOutDir)) {
            console.log('创建目录: ' + imagesOutDir);
            Fs.mkdirSync(imagesOutDir);
        }

        // 复制文件
        fontDir = devDir + '/' + staticDir + '/' + fontDir;
        console.log(fontDir);
        this.copyDir(fontDir, fontOutDir);
        imagesDir = devDir + '/' + staticDir + '/' + imagesDir;
        this.copyDir(imagesDir, imagesOutDir);
        console.log('复制字体和图片 success...');

        // 拷贝theme
        var styleOutDir = staticOutDir + '/style';
        if (!Fs.existsSync(styleOutDir)) {
            console.log('创建目录: ' + styleOutDir);
            Fs.mkdirSync(styleOutDir);
        }
        var themeOutDir = styleOutDir + '/theme';
        var themeDir = devDir + '/' + this.config.build.themeDir;
        if (!Fs.existsSync(themeOutDir)) {
            console.log('创建目录: ' + themeOutDir);
            Fs.mkdirSync(themeOutDir);
        }
        this.copyDir(themeDir, themeOutDir);
    },

    /**
     * 构建首页
     */
    buildIndex: function (distDir, host) {
        console.log('构建首页...');
        var self = this;
        var createData = function (fileName) {
            var file = Fs.readFileSync(self.config.devDir + '/' + fileName, 'utf8');
            // 替换scripts
            var scriptPathList = [
                'scripts/app.js',
                'scripts/un.js',
                'scripts/view.js'
            ];
            var scriptList = [];
            for (var i in scriptPathList) {
                var src = scriptPathList[i];
                scriptList.push('<script type="text/javascript" src="' + src + '?' + self.version + '"></script>\n');
            }
            file = file.replace('{{ scripts }}', scriptList.join(""));

            // 替换Style
            var stylePathList = [
                'static/style/app.css',
                'static/style/app2.css',
                'static/style/shop-component/component.css'
            ];
            var styleList = [];
            for (var i in stylePathList) {
                var href = stylePathList[i];
                styleList.push('<link rel="stylesheet" href="' + href + '?' + self.version + '" />\n');
            }
            file = file.replace('{{ styles }}', styleList.join(""));

            // 替换版本
            file = file.replace('{{ version }}', self.version);
            // 替换host
            file = file.replace('{{ apiHost }}', host);

            // 生成index.html
            var indexFile = distDir + '/' + fileName;
            Fs.writeFileSync(indexFile, file, 'utf8');
        };

        createData('index.html');

        // 复制login.html和register.html
        //var fileList = [
        //    'login.html',
        //    'register.html'
        //];
        //for (var i in fileList) {
        //    var fileCode = Fs.readFileSync(self.config.devDir + '/' + fileList[i], 'utf8');
        //    var copyToFile = distDir + '/' + fileList[i];
        //    Fs.writeFileSync(copyToFile, fileCode, 'utf8');
        //}
        console.log('构建首页 success...');
    },

    /**
     * 获取目录下所有文件列表
     * @param dirList 目标目录
     */
    getFileList: function (dirList) {

        var self = this;
        for (var i in dirList) {
            var dirPath = this.config.devDir + '/' + dirList[i];
            var paths = Fs.readdirSync(dirPath);
            if (paths) {
                paths.forEach(function (path) {
                    var filePath = dirList[i] + '/' + path;
                    var stat = Fs.lstatSync(self.config.devDir + '/' + filePath);
                    if (stat.isFile()) {
                        // 如果是文件
                        self.scripts.push(filePath);
                    } else {
                        // 是目录
                        self.getFileList([dirList[i] + '/' + path]);
                    }
                });
            }
        }
    },


    /**
     * 合并js
     */
    concatJs: function () {

        console.log('concatJs...');

        var self = this;
        var scriptContent = '';
        var executeConcat = function (sourcePath) {
            var paths = Fs.readdirSync(sourcePath);

            paths.forEach(function (path) {

                var itemPath = sourcePath + '/' + path;
                var stat = Fs.lstatSync(itemPath);
                if (stat.isDirectory()) {
                    console.log('********itemPath*********' + itemPath);
                    if (/(component|controller|model)/g.test(itemPath)) {
                        executeConcat(itemPath);
                    }
                } else if (stat.isFile()) {

                    console.log('读取文件: ' + itemPath);
                    if (/.js/g.test(itemPath)) {
                        var file = Fs.readFileSync(itemPath, 'utf8');

                        if (file) {
                            scriptContent = file + scriptContent;
                        }
                    }
                }
            });
        };

        var toSource = self.config.output.base.target;

        executeConcat(toSource);

        // 合并文件
        var scriptFile = toSource + '/lib/lib.js';
        Fs.writeFileSync(scriptFile, scriptContent, 'utf8');
    },

    /**
     * 生成版本
     */
    createVersion: function () {

        var randNum = Math.floor(Math.random() * 100000 + 10000);
        this.version = 'v' + this.config.version + '.' + randNum;

        // 读取首页模板
        //var sourcePath = sourceDir + '/index.html';
        //var indexTemplate = Fs.readFileSync(sourcePath, 'utf8');
        //indexTemplate = indexTemplate.replace(/{{ version }}/g, this.version);

        //// 非压缩版本
        //if(!miniFile) {
        //    indexTemplate = indexTemplate.replace(/<script type="text\/javascript" src="lib\/lib.*<\/script>/, '');
        //}

        //Fs.writeFileSync(targetDir + '/index.html', indexTemplate, 'utf8');
    },

    /**
     * 解析模板
     * @param line 行代码
     */
    templateParse: function (line) {

        if (!line || line === '') {
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
                        var currentValueArr = currentValue.split('='),
                            key = currentValueArr[0].trim(),
                            value = currentValueArr[1].replace(/\\?\"/g, '');
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
    },

    /**
     * 构建view对象
     * @param node 子对象
     * @param scriptText 脚本文本
     */
    createViewObject: function (node, scriptText) {

        var txt = ['WmJs.View.' + node + '= function(data){'];
        txt.push(scriptText);
        txt.push('return html;');
        txt.push('}');

        //console.log(txt.join(''));
        return txt.join('');
    }
};

module.exports = Builder;
