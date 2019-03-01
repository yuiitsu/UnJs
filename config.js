/**
 * 自定义配置
 */
const Config = {
    'siteTitle': 'UnJs',
    'version': '3.0.0', // 版本号
    'devDir': 'dev', // 开发目录
    'configFile': '/apps/conf/wmb2c/shop.json', // 配置文件
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
    // 请求标记
    'requestFlag': [
        '/api/',
        '/statistics/'
    ]
};

module.exports = Config;
