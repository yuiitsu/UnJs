/**
 * 显示商品二维码
 * Created by onlyfu on 2017/12/13.
 */
Controller.extend('show_qrcode', function () {

    var self = this;

    this.bind = {};

    this.init = function (e) {
        var $target = $(e.currentTarget),
            logo = localStorage.getItem('logo_url') + '?imageView2/2/w/30/h/30' || '',
            imgName = $target.parents('tr').find('.wm-grid-goods-pic-name>span').text(),
            link = $target.attr('data-link');
        var html = this.getView('component.copy',{text: link,childHtml:'复制链接',className:'wm-color-primary pointer'});
        var $container = this.callComponent({
            name: 'common.tips',
            data: {
                target: $target,
                content: '<div class="js-goods-qrcode" style="/*width: 120px;height:' +
                ' 120px;*/margin:10px;"></div><div class="wm-text-center wm-m-bottom-10"><a' +
                ' href="javascript:void(0)"  class="wm-color-primary">下载二维码</a>'+ html +'</div>'
            },
            method: 'show'
        });
        $container.find('.js-goods-qrcode').qrcode({
            width: 120,
            height: 120,
            // imgBgWidth: 390,
            // imgBgHeight: 380,
            // top: 158,
            text: link,
            background: "#ffffff",       //二维码的后景色
            // foreground: "#EB1622",
            // imgBackground: 'http://imgcache1.qiniudn.com/f6c54ded-c826-efab-b499-207f7ba9?imageView2/2/w/300/h/300',
            // src: logo,
            content: wc.cut_str(imgName, 16, true),
            load: function () {

            }
        });
        var canvas = $container.find('.js-goods-qrcode canvas')[0],
            top = parseInt($container.css('top').replace('px', '')),
            a = $container.find('a')[0];
        a.download = imgName + '.png';
        a.href = canvas.toDataURL('image/png');
        if (top + $container.height() > window.innerHeight) {
            $container.css('top', top + $target.height());
            $container.addClass('left-top');
        }
    };

}, 'goods');
