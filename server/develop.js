/**
 * 开发模式下，加载文件
 * @author onlyfu
 */
const Path = require('path');

const Develop = function(UnJs) {

    let self = this;
    //
    this.scriptFileList = [];
    this.styleFileList = [];
    this.htmlFileList = [];
    this.staticFileList = [];

    /**
     * 获取文件列表
     * 递归文件夹，找到所有文件为止
     * @param target string/object，string为目标文件夹，object为目标对象,object[key] = []，key为目标文件夹，list为顺序文件
     */
    this.getFileList = function(target) {
        let self = this;
        // check target data type
        let targetType = Object.prototype.toString.call(target),
            targetPath = '',
            fileList = [],
            paths = null;
        switch (targetType) {
            case '[object String]':
                targetPath += target + '/';
                break;
            case '[object Object]':
                let key = Object.keys(target)[0];
                targetPath += key + '/';
                fileList = target[key];
                break;
        }

        try {
            paths = UnJs.fs.readdirSync(targetPath);
        } catch (e) {
            console.error(e);
            return false;
        }
        if (!paths) {
            // error
            console.log('read targetPath failed...', targetPath);
            return false;
        }

        // 遍历文件夹下所有项目，检查类型，如果是文件夹递归，如果是文件，根据后缀名归类
        let itemList = [];
        paths.forEach(function(path) {
            let filePath = targetPath + path,
                stat = UnJs.fs.lstatSync(filePath);

            if (stat.isFile()) {
                // 文件
                let extName = Path.extname(filePath).slice(1),
                    item = {
                        path: filePath,
                        fileName: path
                    };
                switch (extName) {
                    case 'js':
                        self.scriptFileList.push(item);
                        break;
                    case 'css':
                        self.styleFileList.push(item);
                        break;
                    case 'html':
                        self.htmlFileList.push(item);
                        break;
                }
            } else {
                // 目录
                itemList.push(filePath);
            }
        });

        // 递归目录
        for (let i in itemList) {
            this.getFileList(itemList[i]);
        }
    };

    /**
     * 创建View JS的内容
     * @param nodes 文件所在文件夹层级list
     * @param content 解析后的内容
     */
    this.createViewContent = function(nodes, content) {
        //
        let txt = ["View.extend('"+ nodes.join('.') +"', function() {"];
        txt.push("this.init = function(data) {");
        txt.push("var html = '';");
        txt.push(content);
        txt.push("return html;");
        txt.push("}");
        txt.push("});");

        // 生成文件
        let tempDir = UnJs.config.devDir + '/temp/';
        if (!UnJs.fs.existsSync(tempDir)) {
            UnJs.fs.mkdirSync(tempDir);
        }

        // 取出最后一个节点，做为文件名
        let fileName = nodes.pop();

        // 检查文件夹
        nodes.forEach(function(node) {
            tempDir += node + '/';
            if (!UnJs.fs.existsSync(tempDir)) {
                UnJs.fs.mkdirSync(tempDir);
            }
        });

        let viewFile = tempDir + '/'+ fileName +'.js';
        UnJs.fs.writeFileSync(viewFile, txt.join(''), 'utf8');
    };

    /**
     * 构建View JS
     * 将HTML文件转换成JS文件，内容转为View对象
     * @param fileList
     * @returns {Array}
     */
    this.buildView = function(fileList) {
        let tempDir = UnJs.config.devDir + '/temp/';
        // 删除temp
        UnJs.delDir(tempDir);
        //
        let scriptList = [];
        fileList.forEach(function(file) {
            let filePath = file.path,
                nodes = filePath.split('/');

            // 移除第一个元素
            nodes.shift();
            // 移除最后一个元素，并获取文件名
            let fileFullName = nodes.pop();
            let fileNames = fileFullName.split('.');
            fileNames.pop();
            let fileName = fileNames.join('.');
            nodes.push(fileName);
            //
            let fileData = UnJs.fs.readFileSync(filePath, 'utf8');
            if (fileData) {
                let lines = fileData.split('\n'),
                    result = [];

                lines.forEach(function(line) {
                    let lineTemplateData = UnJs.templateParse(line);
                    if (lineTemplateData) {
                        result.push(lineTemplateData);
                    }
                });

                self.createViewContent(nodes, result.join(''));
                scriptList.push(tempDir + nodes.join('/') + '/'+ fileName +'.js');
            }
        });

        return scriptList;
    };

    /**
     * Run
     */
    this.run = function() {

        //
        let buildList = UnJs.config.build,
            buildListLen = buildList.length;

        for (let i = 0; i < buildListLen; i++) {
            this.getFileList(UnJs.config.devDir + '/' + buildList[i]);
        }

        // return data
        let returnData = {
            scriptFileList: [],
            styleFileList: []
        };
        // 处理script file
        let scriptFileListLen = this.scriptFileList.length;
        for (let i = 0; i < scriptFileListLen; i++) {
            let item = '<script type="text/javascript" src="/'+ this.scriptFileList[i]['path'] +'"></script>\n';
            returnData.scriptFileList.push(item);
        }
        // 处理style file
        let styleFileListLen = this.styleFileList.length;
        for (let i = 0; i < styleFileListLen; i++) {
            let item = '<link rel="stylesheet" href="/'+ this.styleFileList[i]['path'] +'" />\n';
            returnData.styleFileList.push(item);
        }

        // 处理html file
        if (this.htmlFileList) {
            let viewScriptList = this.buildView(this.htmlFileList);

            viewScriptList.forEach(function(viewScript) {
                let item = '<script type="text/javascript" src="/'+ viewScript +'"></script>\n';
                returnData.scriptFileList.push(item);
            });
        }

        return returnData;
    }
};

module.exports = Develop;
