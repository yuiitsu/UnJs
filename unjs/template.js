/**
 * template.js
 * 模板处理
 * 
 * author: onlyfu
 * update: 2015-12-21
 */

 var Template = {
    /**
     * 开始解析
     * @param filePath string 模板文件
     * @param data object 输出数据
     * @param unjs object Unjs
     * @return String
     */
    parse: function(filePath, data, unjs) {
        var self = this;
        // 读取文件
        unjs.readFile(filePath, function(error, templateData) {
            if(error) {
                console.log('not found file: ' + filePath);
            }

            // 解析子模板
            self.subTemplate(templateData, data, unjs);
        });
    },

    /**
     * 解析子模板
     * @param templateData String 模板内容
     * @param data String 输出数据
     */
    subTemplate: function(templateData, data, unjs) {
        var self = this;
        var html = templateData;
        // 是否有子模板
        var hasSub = false;
        var subTemplateList = [];

        // 解析
        var patt = /\{\% include \'(.+)\' \%\}/ig;
        while (sub = patt.exec(templateData)) {
            var subs = sub;
            subTemplateList.push([subs[0], subs[1]]);
        }

        if (subTemplateList.length == 0) {
            unjs.end(html);
        } else {
            // 连续异步回调处理所有子模板
            unjs.asyncSeries(subTemplateList, function(item, callback) {
                unjs.readFile('./template/' + item[1], callback(item[0]));
            }, function(returns) {
                // 替换include文件内容
                for (var key in returns) {
                    html = html.replace(key, returns[key]);
                }

                // 处理循环
                html = self.loop(html, data);

                // 处理变量
                html = self.variable(html, data);

                unjs.end(html);
            });
        }
    },

    /**
     * 解析变量
     * @param html String 文件内容
     * @param data object 输出数据
     */
    variable: function(html, data) {
        if (data) {
            var item;
            var patt = /\{\{ (.+?) \}\}/ig;
            while (item = patt.exec(html)) {
                var vs = item[1].split('.');
                var vsLen = vs.length;
                var r = data[vs[0]];
                if (vsLen > 1) {
                    for (var i = 1; i < vsLen; i++) {
                        r = r[vs[i]];
                    }
                }
                html = html.replace(item[0], r);
            }
        }

        return html;
    },

    /**
     * 解析循环
     * @param html String 文件内容
     * @param data object 输出数据
     */
    loop: function(html, data) {
        var self = this;
        var _html = html;

        var exec = function(patt) {
            var inPatt = patt;
            var item;
            while (item = inPatt.exec(_html)) {
                var dataKey = item[1];
                var key = '';
                var variable = item[4];
                if (variable == undefined) {
                    variable = item[2];
                } else {
                    key = item[2];
                }
                var loopTemp = item[0];
                var temp = item[5];
                var loopTempList = [];
                if (data[dataKey] != undefined) {
                    var listLen = data[dataKey].length;
                    for (var i = 0; i < listLen; i++) {
                        var outData = {};
                        outData[variable] = data[dataKey][i];
                        var subHtml = self.variable(temp, outData);
                        loopTempList.push(subHtml);
                    }
                    var loopTempString = loopTempList.join('');
                    _html = _html.replace(loopTemp, loopTempString);
                }
            }

            var loop = /<\!-- loop/ig;
            if (loop.test(_html)) {
                exec(inPatt);
            }
        }

        if (data) {
            var patt = /<\!-- loop (.+?) (.+?)( (.*?))* -->(((?!loop)[\s\S])+?)<\!-- end -->/ig;
            exec(patt);
        }

        return _html;
    }
 }

 module.exports = Template;



