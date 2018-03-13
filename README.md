# UnJS
## 版本
v3.0.0
## 新增功能
- 更改核心结构，让其变得更清晰合理
- 增加子控制器和model，减少单个文件的代码量
- 增加数据对象存储，方便使用
- 运行时，不再使用动态加载JS文件，采用整合方式，让JS执行变得顺畅
- 开发时，不再使用watch方式监听文件变化，使用直接加载读取的方式，让调试不用等待

## 目录结构

 root

     - dev(开发目录)
         - component(组件)
             - dialog
                 alert.js
         - controller(控制器)
             - index (模块)
                 - sub(子控制器)
                 - model (数据)
                     modelname.js (数据类)
                 index.js
         - core (核心文件)
             base.js (父类)
             core.js (核心文件)
         - common (公共文件，自定义父类和三方库文件)
             custombase.js (自定义父类)
             common.js (公共方法文件)
         - view (视图)
             - index
                 index.html
             - goods
                 detail.html
         - static (静态文件)
             - font (字体)
             - images (图片)
         - style (样式文件)
             common.css
         - temp (调试时缓存文件输出目录)
         index.html (首页模板)
     - dist(编译输出目录)
     - wmjs(node服务)
     config.js (配置文件)
     app.js (运行入口文件)

## 运行

    - node app.js -h dev/uat/prod -p 端口号


访问‘http://localhost:3000?’ + 参数