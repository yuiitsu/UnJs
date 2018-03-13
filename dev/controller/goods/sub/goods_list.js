/**
 * 显示商品列表
 * Created by onlyfu on 2017/12/13.
 */
Controller.extend('goods_list', function () {

    var self = this;

    this.bind = {};

    this.init = function () {

        var goods_list = this.model.get('goods_list');
        self.$grid = self.callComponent({name: 'common.grid'}, {
            $el: $('.wm-goods-grid'),
            className: 'stripe',
            checked: true,
            columns: [
                {name: '商品名称', size: 5.5},
                {name: '售价', size: 2, sort: true},
                {name: '库存', size: 2, sort: true},
                {name: '总销量', size: 2, sort: true},
                {name: '创建时间', size: 2.5},
                {name: '', size: 4, className: 'wm-page wm-text-right'}
            ],
            actions: [
                {name: '', className: 'js-multiple-show wm-color-normal'},
                {name: '上架已选商品', className: 'wm-color-primary', callback: self.multi_up},
                {name: '下架已选商品', className: 'wm-color-danger', callback: self.multi_down},
                {name: '编辑商品分组', className: 'wm-color-primary', callback: self.multi_group},
                {name: '下载商品二维码', className: 'wm-color-primary', callback: self.multi_down_QRCode}
                /*
                 {name: '删除已选商品', className: 'wm-color-danger', callback: self.multipleDelete}
                 */
            ],
            row: 'goods.list_item',
            multipleCallback: function (element) {
                self.$grid[0].find('.js-multiple-show').html('已选择' + element.length + '件商品')
            }
        });
        var search = this.get_search();
        self.$grid.renderRow({list: goods_list['list'],search:search});
        self.renderPage(goods_list['total_num']);
    };

    /**
     * 显示分页
     * @param total_num
     */
    this.renderPage = function (total_num) {
        var self = this;
        var page = self.callComponent({name: 'common.page'}, {
            $el: $('.wm-page'),
            totalNumber: total_num,
            pageIndex: self.model.get('search_data.page_index'),
            pageSize: self.model.get('search_data.page_size'),
            callback: function (index) {
                self.model.set('search_data', {
                    page_index: index
                }, true);
            }
        });
    };

    /**
     * 批量上架
     */
    this.multi_up = function () {
        self.on_shelf(function (close) {
            self.model.up(function (res) {
                self.notifications().success(res.msg);
                close();
            });
        });
    };

    /**
     * 批量下架
     */
    this.multi_down = function () {
        self.on_shelf(function (close) {
            self.model.down(function (res) {
                self.notifications().success(res.msg);
                close();
            });
        });
    };

    /**
     * 处理上下架
     * @param callback
     */
    this.on_shelf = function (callback) {
        var goods_id_list = [];
        $('.js-wm-grid-select:checked').each(function () {
            goods_id_list.push($(this).val());
        });
        if (goods_id_list.length > 0) {
            self.callComponent({
                name: 'common.confirm',
                data: {
                    msg: '确定要这样做吗？',
                    ok: function (close) {
                        self.model.set('goods_id_list', goods_id_list.join(','));
                        callback(close);
                    }
                }
            }, 'show');
        }
    };

    /**
     * 批量分组操作
     */
    this.multi_group = function () {
        var goods_id_list = [];
        $('.js-wm-grid-select:checked').each(function () {
            goods_id_list.push($(this).val());
        });
        self.callComponent({name: 'common.goods_group_dialog'}, {goods: goods_id_list});
    };

    /**
     * 批量下载二维码
     */
    this.multi_down_QRCode = function () {
        var $body = $('body'),
            QRCodeList = $('.wm-goods-grid').find('.js-goods-show-qrcode'),
            $container = null,
            logo = localStorage.getItem('logo_url') + '?imageView2/2/w/30/h/30' || '',
            zip = new JSZip(),
            checkNum = 0,
            LoadNum = 0,
            canvas = null;
        $body.append('<div class="absolute js-goods-QRCode-container" style="left:-1000px;top:-1000px;"></div>');
        $container = $('.js-goods-QRCode-container');
        QRCodeList.each(function (i, elem) {
            var link = null,
                $tr = $(this).parents('tr'),
                canvas = $('<div class="js-goods-QRCode"></div>').appendTo($container),
                isCheck = $tr.find('.wm-grid-select input[type=checkbox]').prop('checked'),
                imgName = $tr.find('.wm-grid-goods-pic-name>span').text();
            if (isCheck) {
                // checkNum++;
                canvas.qrcode({
                    width: 120,
                    height: 120,
                    imgBgWidth: 140,
                    imgBgHeight: 140,
                    // top: 158,
                    text: $(this).data('link'),
                    background: "#ffffff",       //二维码的后景色
                    // foreground: "#EB1622",
                    // imgBackground: 'http://imgcache1.qiniudn.com/f6c54ded-c826-efab-b499-207f7ba9?imageView2/2/w/300/h/300',
                    content: imgName,
                    // src: logo,
                    load: function () {

                    }
                });
                // LoadNum++;
                link = canvas.find('canvas')[0].toDataURL('image/png').replace("data:image/png;base64,", "");
                zip.file(imgName + '_' + parseInt(Math.random() * 10000) + ".png", link, {base64: true});

            }
        });
        zip.generateAsync({type: "blob"})
            .then(function (content) {
                // see FileSaver.js
                saveAs(content, '商品二维码' + Date.now() + '.zip');
            });
        $container.remove();
    };

}, 'goods');
