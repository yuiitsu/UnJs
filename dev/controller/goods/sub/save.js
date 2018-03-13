/**
 * Created by onlyfu on 2017/5/23.
 */

Controller.extend('save', function() {

    var self = this;

    this.bind = {
        //'#avatar>.wm_avatar_mask_text click': 'listenTouchStart',
        //'#test click': 'listenClick'
    };

    this.init = function(params) {
        var goods_origin_data = this.model.get('goods_data');
        // 检查表单
        var formResult = this.callComponent({name: 'common.verify', method: 'verify'});
        // 检查图片
        var pictureResult = this.checkImage();
        if (!(formResult && pictureResult)) {
            var $error = $('.error').first(),
                top_container_height = $('.wm-top-container').height(),
                offset = $error.offset() || {},
                scroll_top = offset.top-top_container_height-30;
            $('#wm-main').animate({
                scrollTop:scroll_top
            },300);
            self.callComponent({
                name: 'common.top_notifications',
                data: { msg: '请先完善商品信息', type: 'danger' }
            }, 'show');
            return false;
        }

        var goods_type = $("input[name='goods_type']:checked").val() || '';
        var goods_name = $.trim($('#goods_name').val());
        var isPre = $("input[name='pre_buy_time']:checked").val();
        //var pre_buy_time = isPre == 1 ? 0 : moment($.trim($('.pre-buy-time input').val())).format('YYYY-MM-DD HH:mm:ss');
        var stock = $.trim($('#stock').val());
        var price = $.trim($('#min_price').val());
        var bar_code = $.trim($('#bar_code').val());
        var skuDataList = this.buildSku(stock, price, bar_code,!this.goods_id);
        var images = this.buildImages();
        var detail = encodeURIComponent(this.editor.txt.html());
        var shareTxt = $.trim($('#js-wm-goods-form-share-txt').val());
        var group_id_list = [];
        var categoryId = $('#js-wm-goods-form-category').attr('data-key');
        var logisticsTemplateId = $('#js-wm-logistics-template').attr('data-key');
        $('input.js-wm-goods-form-group:checked').each(function() {
            group_id_list.push($(this).val());
        });
        // 标签
        var goodsTags = $.makeArray($('.wm-goods-tag-item')).map(function (item) {
            return item.getAttribute('data-value');
        });
        // 品牌
        var brandId = $('#js-wm-goods-brand-select').find('input').attr('data-key') || '';

        var goods_data = {
            'goods_id': this.goods_id,
            'goods_type': goods_type,
            'goods_name': goods_name,
            'sku_json': JSON.stringify(skuDataList),
            'images_json': images,
            'price': price * 100,
            'stock': stock ? (goods_origin_data['stock'] && !this.params['copy'] ? stock - Number(goods_origin_data['stock']) : stock) : 0,
            //'pre_buy_time': pre_buy_time,
            'detail': detail,
            'group_id_json': JSON.stringify(group_id_list),
            'share_text': shareTxt,
            'category_id': categoryId,
            'shipping_template_id': logisticsTemplateId,
            'tags_json': JSON.stringify(goodsTags),
            'brand_id': brandId
        };

        self.model.set('btnLoading', true);
        if (this.goods_id) {
            this.model.modify(goods_data, function(res) {
                self.model.set('btnLoading', false);
                var type = res.code === 0 ? 'success' : 'danger';
                self.callComponent({
                    name: 'common.top_notifications',
                    data: { msg: res.msg || '保存失败', type: type }
                }, 'show');
                // 创建成功，跳转到 list
                if (res.code === 0) {
                    self.jumpToList();
                }
            });
        } else {
            this.model.create(goods_data, function (res) {
                self.model.set('btnLoading', false);
                var type = res.code === 0 ? 'success' : 'danger';
                var msg = res.code === 0 ? '保存成功' : res.msg || '保存失败';
                self.callComponent({
                    name: 'common.top_notifications',
                    data: { msg: msg, type: type }
                }, 'show');
                // 创建成功，跳转到 list
                if (res.code === 0) {
                    self.jumpToList();
                }
            }, function () {
                self.model.set('btnLoading', false);
                self.callComponent({
                    name: 'common.top_notifications',
                    data: { msg: '请求失败，请重试', type: 'danger' }
                }, 'show');
            });
        }
    };
}, 'goods_create');
