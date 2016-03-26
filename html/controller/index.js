/**
 * 测试控制器
 */

var index = function(unjs) {

	this.index = function() {
	
		var _html = '<p>UnJsSp - 基于HTML5的SinglePage框架, <a href="javascript:;" id="link_page">打开另一个页面</a></p><p><a href="javascript:;" id="link_goods">打开商品控制器</a></p>';

		unjs.display(_html);

		// 监听
        $('#link_page').click(function() {

            unjs.loadControl('post', 'index');
        });

        $('#link_goods').click(function() {
            unjs.loadControl('goods', 'index');
        });
	};

	return this;
};

Module.index = index;
