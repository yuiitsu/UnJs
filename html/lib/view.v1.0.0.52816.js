View.dialog = {};View.dialog.confirm= function(data){var html = "";html += '<div id=\'wm_dialog\' class=\'wm_dialog\'>';html += '<div id=\'wm_mask\'></div>';html += '<div id=\'wm_dialog_confirm\' class=\'wm_dialog_box wm_dialog_confirm\'>';html += '<div class=\'wm_dialog_msg\'>'+data['msg']+'</div>';html += '<div class=\'wm_dialog_button_line\'>';html += '<button id=\'wm_dialog_button_confirm\' class=\'wm_dialog_button_confirm\'>确定</button>';html += '<button id=\'wm_dialog_button_cancel\' class=\'wm_dialog_button_confirm wm_fr\'>取消</button>';html += '</div>';html += '</div>';html += '</div>';return html;};View.index = {};View.index.index= function(data){var html = "";html += '<div class=\'un_body\'>';html += '<h1>UnJs 一个Single Page开发框架</h1>';html += '';html += '<h2>特点</h2>';html += '<ul>';html += '<li><strong>1. 轻封装</strong> 简单易用</li>';html += '<li><strong>2. 基于NodeJs的构建服务</strong> 自动模板解释，合并，压缩</li>';html += '<li><strong>3. 跨域调试</strong> 可根据API情况自定义测试AJAX请求服务</li>';html += '<li><strong>4. 组件模块</strong> UI功能组件化，方便重用与维护</li>';html += '<li><strong>5. 动态加载</strong> 减少基础文件大小，按需加载文件</li>';html += '</ul>';html += '';html += '<h2>组件示例</h2>';html += '<p>';html += '<a href=\'javascript:;\' id=\'open_dialog\'>打开确认对话框</a>';html += '</p>';html += '<h2>下载</h2>';html += '<p><a href=\'https://github.com/onlyfu/UnJs\' target=\'_blank\'>https://github.com/onlyfu/UnJs</a></p>';html += '<h2>启动</h2>';html += '<pre>';html += '// 默认端口3000<br/>';html += 'node app.js<br/>';html += '// 指定端口启动<br/>';html += 'node app.js -p 3100<br/>';html += '// 指定请求服务,uat为控制器名，见根目录下controller目录<br/>';html += 'node app.js -h uat<br/>';html += '// 启动同时编译<br/>';html += 'node app.js -b true<br/>';html += '</pre>';html += '<h2>使用</h2>';html += '<h4>1. 控制器（controller）</h4>';html += '<pre>';html += 'var index = function(unjs) {<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;this.index = function() {<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var data = {\'msg\': \'Hi UnJs\'};<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 加载view<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;unjs.display(View.index.index(data));<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;};<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;return this;<br/>';html += '};<br/>';html += 'Module.index = index;<br/>';html += '</pre>';html += '<h4>2. 视图（View）</h4>';html += '<pre>';html += '// 变量<br/>';html += '&lt;div&gt;&#123;&#123; data[\'msg\'] &#125;&#125;&lt;/div&gt;<br/>';html += '// 条件<br/>';html += '&#123;&#123; if data[\'name\'] == \'UnJs\' &#125;&#125;<br/>';html += '&lt;p&gt;Hello UnJs&lt;/p&gt;<br/>';html += '&#123;&#123; else if data[\'name\'] == \'girl\' &#125;&#125;<br/>';html += '&lt;p&gt;口水&lt;/p&gt;<br/>';html += '&#123;&#123; else &#125;&#125;<br/>';html += '&lt;p&gt;什么都是&lt;/p&gt;<br/>';html += '&#123;&#123; end &#125;&#125;<br/>';html += '// 循环<br/>';html += '&#123;&#123; loop var i in data[\'list\'] &#125;&#125;<br/>';html += '&lt;p&gt;&#123;&#123; data[\'list\'][i] &#125;&#125;&lt;/p&gt;<br/>';html += '&#123;&#123; end &#125;&#125;<br/>';html += '</pre>';html += '<h4>3. 组件</h4>';html += '<pre>';html += '// 定义组件<br/>';html += 'var confirm = function(unjs, object, data) {<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;this.init = function(callback) {<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var _html = View.dialog.confirm(data);<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$(\'body\').append(_html).css(\'overflow\', \'hidden\');<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;};<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;return this;<br/>';html += '};<br/>';html += 'Component.confirm = confirm;<br/>';html += '// 组件视图，同2<br/>';html += '// 调用组件<br/>';html += 'unjs.importComponent(\'dialog\', \'confirm\', null, {<br/>';html += '&nbsp;&nbsp;&nbsp;&nbsp;msg: \'一个提示\'<br/>';html += '}, {});<br/>';html += '</pre>';html += '</div>';return html;};