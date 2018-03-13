/**
 * Created by onlyfu on 2017/5/11.
 */

Model.extend('goods_create', function() {
    var self = this;

	this.default = {
	    maxImage: 5,
        imageNum: 0,
	    btnDisabled: false,
        btnLoading: false,
        group_id_list: [],
        tag: [],
        goods_data: {},
        times :{
	        '#js-wm-goods-form-category':1
        }
    };

    this.apiAppend({
        'goodsCreate': '/api/v1/goods/edit/create',
        'goodsUpdate': '/api/v1/goods/edit/update',
        'goodsDetail': '/api/v1/goods/edit/query',
        'tagsQuery': '/api/v1/goods/tags/query'
    });

    this.create = function(data, callback, errCallback) {
        this._post({
			'url': this.api.goodsCreate,
            'data': data,
			'loading': true
		}, callback, errCallback,{go:true,show_notification:false});
    };

    this.query = function(data, callback, errCallback) {
        this._get({
            url: this.api.goodsDetail,
            data: data,
            'loading': true
        }, callback, errCallback);
    };

    this.modify = function(data, callback, errCallback) {
        this._post({
            url: this.api.goodsUpdate,
            data: data,
            'loading': true
        }, callback, errCallback,{go:true,show_notification:false});
    };

    this.getTags = function (id, success, error) {
        success = success || $.noop;
        error = error || $.noop;
        if (!id) {
            return false;
        }
        this._get({
            url: this.api.tagsQuery,
            data: {goods_id: id}
        }, function (res) {
            if (res.code === 0 && res.data) {
                var list = res.data.map(function (item) { return item.tag; });
                self.set('tag', list);
                success();
            } else {
                error();
            }
        }, function () {
            error();
        });
    };
});
