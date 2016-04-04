<h1>UnJs 一个Single Page开发框架</h1>

<h2>特点</h2>
<ul>
	<li><strong>1. 轻封装</strong> 简单易用</li>
	<li><strong>2. 基于NodeJs的构建服务</strong> 自动模板解释，合并，压缩</li>
	<li><strong>3. 跨域调试</strong> 可根据API情况自定义测试AJAX请求服务</li>
	<li><strong>4. 组件模块</strong> UI功能组件化，方便重用与维护</li>
	<li><strong>5. 动态加载</strong> 减少基础文件大小，按需加载文件</li>
</ul>

<h2>组件示例</h2>
<p>
	<a href='javascript:;' id='open_dialog'>打开确认对话框</a>
</p>
<h2>下载</h2>
<p><a href='https://github.com/onlyfu/UnJs' target='_blank'>https://github.com/onlyfu/UnJs</a></p>
<h2>启动</h2>
<pre>
// 默认端口3000<br/>
node app.js<br/>
// 指定端口启动<br/>
node app.js -p 3100<br/>
// 指定请求服务,uat为控制器名，见根目录下controller目录<br/>
node app.js -h uat<br/>
// 启动同时编译<br/>
node app.js -b true<br/>
</pre>
<h2>使用</h2>
<h4>1. 控制器（controller）</h4>
<pre>
var index = function(unjs) {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;this.index = function() {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var data = {'msg': 'Hi UnJs'};<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// 加载view<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;unjs.display(View.index.index(data));<br/>
&nbsp;&nbsp;&nbsp;&nbsp;};<br/>
&nbsp;&nbsp;&nbsp;&nbsp;return this;<br/>
};<br/>
Module.index = index;<br/>
</pre>
<h4>2. 视图（View）</h4>
<pre>
// 变量<br/>
&lt;div&gt;&#123;&#123; data['msg'] &#125;&#125;&lt;/div&gt;<br/>
// 条件<br/>
&#123;&#123; if data['name'] == 'UnJs' &#125;&#125;<br/>
&lt;p&gt;Hello UnJs&lt;/p&gt;<br/>
&#123;&#123; else if data['name'] == 'girl' &#125;&#125;<br/>
&lt;p&gt;口水&lt;/p&gt;<br/>
&#123;&#123; else &#125;&#125;<br/>
&lt;p&gt;什么都是&lt;/p&gt;<br/>
&#123;&#123; end &#125;&#125;<br/>
// 循环<br/>
&#123;&#123; loop var i in data['list'] &#125;&#125;<br/>
&lt;p&gt;&#123;&#123; data['list'][i] &#125;&#125;&lt;/p&gt;<br/>
&#123;&#123; end &#125;&#125;<br/>
</pre>
<h4>3. 组件</h4>
<pre>
// 定义组件<br/>
var confirm = function(unjs, object, data) {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;this.init = function(callback) {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;var _html = View.dialog.confirm(data);<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$('body').append(_html).css('overflow', 'hidden');<br/>
&nbsp;&nbsp;&nbsp;&nbsp;};<br/>
&nbsp;&nbsp;&nbsp;&nbsp;return this;<br/>
};<br/>
Component.confirm = confirm;<br/>
// 组件视图，同2<br/>
// 调用组件<br/>
unjs.importComponent('dialog', 'confirm', null, {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;msg: '一个提示'<br/>
}, {});<br/>
</pre>
