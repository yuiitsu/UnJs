/**
 * 自定义配置
 */
var Config = {
    'version': '3.0.0', // 版本号
    'devDir': 'dev', // 开发目录
    'configFile': '/opt/wmb2c/shop.json', // 配置文件
    'build': {
        'scripts': [ // js文件
            'controller',
            'component'
        ],
        'coreDir': 'core', // 核文件目录
        'commonDir': 'common', // 库文件目录
        'staticDir': 'static', // 静态文件目录
        'styleDir': 'static/style', // 样式文件目录
        'componentStyleDir': 'static/style/component', // 组件样式文件目录
        'fontDir': 'fonts',
        'imagesDir': 'images',
        'viewDir': 'view',
        'tempDir': 'temp', // 调试缓存目录
        'libScripts': [
            'jquery-3.2.1.min.js'
        ],
        'styleList': [ // 有顺序
            'base/common.css'
        ],
        'componentStyleList': [
            'component.css'
        ],
        'copyStyle': [
        ],
        'coreScripts': [
            'core.js',
            'custombase.js',
            'component.js',
            'common.js'
        ],
        'distDir': 'dist',
        'jsFileName': 'app.js',
        'cssFileName': 'app.css',
        'viewFileName': 'view.js'
    },
    // 请求标记
    'requestFlag': [
        '/api/',
        '/statistics/'
    ],
    // api host
    'api': {
        'local': 'localhost:9000'
    }
};

module.exports = Config;
