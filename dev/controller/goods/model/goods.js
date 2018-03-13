/**
 * Created by onlyfu on 2017/5/10.
 */

Model.extend('goods', function() {

    var self = this;

    this.default = {
        goods_id_list: '',
        goods_list: [],
        search_data: {
            goods_name: '',
            category_id: '',
            brand_id: '',
            group_id: '',
            is_on_shelf: '',
            page_index: 1,
            page_size: 15
        }
    };

    this.apiAppend({
        'goods_list': '/api/v1/goods/list/admin/query',
        'on_shelf': '/api/v1/goods/on_shelf/update'
    });

    /**
     * 获取商品列表
     */
    this.get_list = function() {
        this._get({
			'url': this.api.goods_list,
			'data': this.get('search_data'),
			'loading': true
		}, function(res) {
            self.set('goods_list', res.data, true);
        });
    };

    this.onShelf = function(data, callback, errCallback) {
        this._post({
            url: this.api.on_shelf,
            data: data,
            loading: true
        }, callback, errCallback);
    };

    /**
     * 上架
     * @param callback
     */
    this.up = function(callback) {
        this.on_shelf('up', callback);
    };

    /**
     * 下架
     * @param callback
     */
    this.down = function(callback) {
        this.on_shelf('down', callback);
    };

    /**
     * 处理上下架
     * @param type
     * @param callback
     */
    this.on_shelf = function(type, callback) {
        this._post({
            url: this.api.on_shelf,
            data: {
                is_on: type === 'up'? 1 : 0,
                goods_id: this.get('goods_id_list')
            },
            loading: true
        }, function(res) {
            callback(res);
            self.set('search_data', {}, true);
        });
    };
});
