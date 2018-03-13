/**
 * 商品管理，商品搜索
 * Created by onlyfu on 2017/5/9.
 * Update by Yuiitsu on 2017/12/13.
 */

Controller.extend('goods', function () {

    var self = this;

    this.bind = {
        '#wm-search-goods-name keydown': 'search_key_down',
        '.js-goods-add click':'create_goods',
        '.wm-goods-grid .wm-goods-edit click.edit_': 'edit',
        '.wm-goods-grid .js-goods-show-qrcode click.showQRCode_': 'show_qrcode',
        '.wm-goods-grid .wm-goods-on-shelf click.onShelf_': 'on_shelf',
        '#js-wm-select-all click': 'selectAll'
    };

    this.index = function () {
        // 监听数据
        var model_data = this.model.get();
        this.watch(model_data, 'search_data', 'goods_search');
        this.watch(model_data, 'goods_list', 'goods_list');

        this.init();
    };

    /**
     *  解析参数，加载数据
     */
    this.init = function() {
        // 参数
        var params = this.getParams();
        var goods_name = params['goods_name'] ? params['goods_name'] : '';
        var category_id = params['category_id'] ? params['category_id'] : '';
        var brand_id = params['brand_id'] ? params['brand_id'] : '';
        var group_id = params['group_id'] ? params['group_id'] : '';
        var on_shelf = params['on_shelf'] ? params['on_shelf'] : '';
        var page_index = params['page_index'] ? params['page_index'] :1;

        self.output('goods.index', {
            'goodsName': decodeURI(goods_name),
            'is_on_shelf': on_shelf,
            'callback': function (res) {
                self.model.set('search_data', {
                    is_on_shelf: res,
                    page_index: 1
                }, true);
            },
            'brand_select': function(d) {
                self.select_event('brand_id', d);
            },
            'category_select': function(d) {
                self.select_event('category_id', d);
            },
            'group_select': function(d) {
                self.select_event('group_id', d);
            },
            'searchData': self.model.get('search_data')
        });

        this.model.set('search_data', {
            goods_name: goods_name,
            category_id: category_id,
            brand_id: brand_id,
            group_id: group_id,
            is_on_shelf: on_shelf,
            page_index:page_index
        }, true);

        this.show_category(category_id);
    };

    /**
     *  显示分类下拉列表
     *  @param category_id 分类ID
     */
    this.show_category = function (category_id) {
        // 加载商品分组
        this.callComponent({name: 'common.goods_category'}, {
            $el: $('#js-wm-goods-category-select'),
            key: category_id || '',
            select: function (d) {
                self.model.set('search_data', {
                    category_id: d
                }, true);
            }
        });
    };

    /**
     * 选择事件
     * @param type
     * @param id
     */
    this.select_event = function (type, id) {
        var data = {};
        data[type] = id;
        self.model.set('search_data', data, true);
    };

    /**
     * 回车搜索
     * @param e
     */
    this.search_key_down = function (e) {
        if (e.keyCode === 13) {
            this.model.set('search_data', {
                goods_name: encodeURIComponent($.trim($('#wm-search-goods-name').val())),
                page_index: 1
            }, true);
        }
    };

    this.create_goods = function () {
        var search = this.get_search();
        this.route({
            a:'goods_create',
            m:'index',
            search:encodeURIComponent(search)
        });
    };

    this.get_search = function () {
        var params = this.model.get('search_data'),
            search = wc.params_to_link(params);
        return search;
    };

});
