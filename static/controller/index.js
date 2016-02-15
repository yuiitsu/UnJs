/**
 * 测试控制器
 */

var index = function(unjs) {

	this.index = function() {
	
		var _html = '<p>UnJsSp - 基于HTML5的SinglePage框架, <a href="javascript:;" id="link_page">打开另一个页面</a></p>';

		unjs.display(_html);

		// 监听
        $('#link_page').click(function() {

            unjs.loadControl('post', 'index');
        });
	};

	return this;
};

Module.index = index;
