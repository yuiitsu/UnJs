/**
 * 首页控制器
 */

var Index = function(wmjs){

    var fileList = [];

    /**
     * 获取目录下所有文件列表
     * @param dirList 目标目录
     */
    var getFileList = function(dirList) {

        for (var i in dirList) {
            var dirPath = wmjs.config.devDir + '/' + dirList[i];
            var paths = wmjs.fs.readdirSync(dirPath);
            if (paths) {
                var itemList = [];
                paths.forEach(function(path) {
                    var filePath = dirList[i] + '/' + path;
                    var stat = wmjs.fs.lstatSync(wmjs.config.devDir + '/' + filePath);
                    if (stat.isFile()) {
                        // 如果是文件
                        fileList.push(filePath);
                    } else {
                        // 是目录
                        //getFileList([dirList[i] + '/' + path]);
                        itemList.push([dirList[i] + '/' + path]);
                    }

                });
                for (var j in itemList) {
                    getFileList(itemList[j]);
                }
            }
        }
    };

    /**
     * 构建View
     * @param fileList
     */
    var buildView = function(fileList) {

        var createViewContent = function(dir, name, content) {
            var funcName = dir + '.' + name;
            var txt = ["View.extend('"+ funcName +"', function() {"];
            txt.push("this.init = function(data) {");
            txt.push("var html = '';");
            txt.push(content);
            txt.push("return html;");
            txt.push("}");
            txt.push("});");
            // 生成文件
            var tempDir = wmjs.config.devDir + '/temp/';
            if (!wmjs.fs.existsSync(tempDir)) {
                wmjs.fs.mkdirSync(tempDir);
            }
            tempDir = tempDir + dir;
            if (!wmjs.fs.existsSync(tempDir)) {
                wmjs.fs.mkdirSync(tempDir);
            }
            var viewFile = tempDir + '/' + name + '.js';
            wmjs.fs.writeFileSync(viewFile, txt.join(''), 'utf8');
        };

        var scriptList = [];

        for (var i in fileList) {
            var nodes = fileList[i].split('/');
            if (nodes.length !== 3) {
                console.log('构建View对象失败,模板目录深度错误');
            } else {
                var nodeName = nodes[1];
                var views = nodes[2].split(".");
                var nodePath = nodeName + '.' + views[0];
                var file = wmjs.fs.readFileSync(wmjs.config.devDir + '/' + fileList[i], 'utf8');
                if (file) {
                    var lines = file.split('\n');
                    var result = [];
                    for (var index in lines) {
                        var line = wmjs.templateParse(lines[index]);
                        if (line) {
                            result.push(line);
                        }
                    }
                    createViewContent(nodeName, views[0], result.join(''));
                    scriptList.push('temp/' + nodeName + '/'+ views[0] +'.js');
                }
            }
        }

        return scriptList;
    };

    // 构建scripts
    var scriptList = [];
    for (var i in wmjs.config.build.coreScripts) {
        var src = 'core/' + wmjs.config.build.coreScripts[i];
        scriptList.push('<script type="text/javascript" src="'+ src +'"></script>\n');
    }
    for (var i in wmjs.config.build.libScripts) {
        var src = 'common/' + wmjs.config.build.libScripts[i];
        scriptList.push('<script type="text/javascript" src="'+ src +'"></script>\n');
    }
    getFileList(wmjs.config.build.scripts);
    for (var i in fileList) {
        scriptList.push('<script type="text/javascript" src="'+ fileList[i] +'"></script>\n');
    }

    // 构建html
    fileList = [];
    getFileList(['view']);
    // 编译模板
    var viewScriptList = buildView(fileList);
    for (var i in viewScriptList) {
        scriptList.push('<script type="text/javascript" src="'+ viewScriptList[i] +'"></script>\n');
    }

    // 构建Style
    var styleList = [];
    for (var i in wmjs.config.build.styleList) {
        var href = wmjs.config.build.styleDir + '/' + wmjs.config.build.styleList[i];
        styleList.push('<link rel="stylesheet" href="'+ href +'" />\n');
    }
    for (var i in wmjs.config.build.componentStyleList) {
        var href = wmjs.config.build.styleDir + '/' + wmjs.config.build.componentStyleList[i];
        styleList.push('<link rel="stylesheet" href="'+ href +'" />\n');
    }

    var shopConfig = JSON.parse(wmjs.fs.readFileSync(wmjs.config.configFile).toString());

    wmjs.display('index', {
        'title': '',
        'apiHost': wmjs.apiHost,
        'scripts': scriptList.join(""),
        'styles': styleList.join(""),
        'version': wmjs.config.version,
        'st': JSON.stringify(shopConfig['st'])
    });
};

module.exports = Index;
