/**
 * 首页控制器
 */
Controller.extend('index', function () {

    this.bind = {};

    this.index = function () {

        var self = this;
        // 模板输出
        this.output('index.index', {
            text: 'Hello World.'
        });
    };
});







