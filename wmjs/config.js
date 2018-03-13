// 配置

var Config = {
    'version': '3.0.0',
    // static
    'static_dir': '/dev/',

    'output': {
        'base': {
            'source': 'dev',
            'target': 'mobile'
        },
        'lib': 'lib',
        'view': 'view'
    },
    // api host
    'api': {
        'dev': 'localhost',
        'uat': 'uat.wemart.cn',
        'prod': 'www.wemart.cn',
        'port': '9000'
    },

    'devDir': 'dev',

    'build': {
        'htmlFile': 'build.html',
        'scripts': [
            'controller',
            'component',
            'model'
        ],
        'static': 'static',
        'libScripts': [
            'jquery.min.js',
            'base.js',
            'core.js'
        ],
        'style': 'style',
        'styleList': [
            'common.css',
            'custorm1.css'
        ]
    },
    
    // 控制器相关
    'controller_dir': 'controller',

    // 模板相关
    'template_dir': 'dev',

    // 静态配置
    'static': {
        'type': 'single', // 静态类型，只有single和default，single为single page模式，default为nodejs模式
        'baseDir': 'dev/',
        'controller': 'controller', // 当type为single时有效
        'lib': 'lib', // 当type为single时有效
        'component': 'component', // 组件,当type为single时有效
        'images': 'static/images', // 当type为single时有效
        'style': 'style', // 当type为single时有效
        'font': 'static/font', // 当type为single时有效
        'model':'model',
        'temp': 'temp',
        'loadScript': [
            'wmjs',
            'jquery.min'
        ]
    },

    // 404
    '404': ''
}

module.exports = Config;
