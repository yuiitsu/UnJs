/**
 * 配置文件
 * 
 * 不用修改此文件，请用项目的配置文件覆盖它的值
 */

var Config = {
    
    // 控制器相关
    'controller_dir': 'controller',

    // 模板相关
    'template_dir': 'html',

    // 静态配置
    'static': {
        'type': 'single', // 静态类型，只有single和default，single为single page模式，default为nodejs模式
        'baseDir': '/html/',
        'controller': 'controller', // 当type为single时有效
        'lib': 'lib', // 当type为single时有效
        'images': 'images', // 当type为single时有效
        'css': 'css', // 当type为single时有效
        'loadScript': [
            'unjs',
            'jquery.min'
        ]
    },

    // 404
    '404': ''
}

module.exports = Config;
