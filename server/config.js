/**
 * Server配置
 */
const Config = {
    'siteTitle': 'UnJs',
    'version': '4.0.0',
    // static
    'staticDir': 'static',

    'output': {
        'base': {
            'source': 'src',
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

    // 开发目录
    'devDir': 'src',

    // 指定编译相关配置
    // 如果值类型为String，按目录处理，如果类型为List，按文件顺序处理
    'build': [
        // 库文件夹，一般存在3方库文件，如果有顺序要求，使用list附值
        'lib',
        // 框架内核
        'core',
        // 通用模块，包括css和一些js
        'common',
        // 组件
        'component',
        // 功能模块
        'module',
        // 静态文件，fonts，通用的img
        'static'
    ],
    
    // 控制器相关
    'controller_dir': 'controller',

    // 模板相关
    'template_dir': 'src',

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
            'server',
            'jquery.min'
        ]
    },

    // 404
    '404': ''
};

module.exports = Config;
