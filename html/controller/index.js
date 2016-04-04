/**
 * 测试控制器
 */

var index = function(unjs) {

	this.index = function() {
        // 加载view
        unjs.display(View.index.index());

		// 加载组件
        $('#open_dialog').click(function() {

            unjs.importComponent('dialog', 'confirm', null, {
                msg: '一个提示'
            }, {});
        });

        $('#link_goods').click(function() {
            unjs.loadControl('goods', 'index');
        });
	};

	return this;
};

Module.index = index;
