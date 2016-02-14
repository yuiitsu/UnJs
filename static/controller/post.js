/**
 * 测试控制器
 */

var post = function(unjs) {

	this.index = function() {

		var _html = '<p>UnJsSp - 基于JQuery和HTML5的SinglePage框架, <a href="javascript:;" id="link_page">打开首页</a></p>';

		unjs.display(_html);

		// 监听
        $('#link_page').click(function() {

            unjs.loadControl('index', 'index');
        });
	};

	return this;
};

Module.post = post;
