/**
 * 首页子控制器 - 示例
 */

Controller.extend('ex', function() {

    this.bind = {
        //'#avatar>.wm_avatar_mask_text click': 'listenTouchStart',
        '#test click': 'listenClick'
    };

    this.init = function(params) {
        this.output('public.avatar', {
            'img': 'http://imgcache8.wemartimg.cn/68bca7c3-849a-4453-3225-bcb2ce47406b_400'
        }, '#test');
    };

    this.listenTouchStart = function() {
        alert('listenTouchStart');
    };

    this.listenClick = function() {
        alert('listenClick');
    };

}, 'index');