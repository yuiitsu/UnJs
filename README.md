# UnJs
## 版本
v4.0.0

## 目录结构

 root

     - dev(开发目录)
         - common
            custombase.js
            global.css
         - component(组件)
             - input
                index.html
                script.js
                style.css
         - core(核心文件)
             _core.js
             component.js
         - lib (三方库)
             jquery.min.js
         - module (模块)
            - index
                script.js
                style.css
                view.html
         - static (静态文件)
             - font (字体)
             - images (图片)
         - temp (调试时缓存文件输出目录)
         index.html (首页模板)
     - dist(编译输出目录)
     - server(node服务)
     config.js (配置文件)
     app.js (运行入口文件)

## 运行

    - node app.js -h dev/uat/prod -p 端口号


访问‘http://localhost:3000?’ + 参数