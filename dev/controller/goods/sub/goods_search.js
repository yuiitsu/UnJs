/**
 * 商品搜索
 * Created by onlyfu on 2017/5/23.
 */
Controller.extend('goods_search', function() {

    var self = this;

    this.bind = {};

    this.init = function (params) {

        this.model.get_list();
    };

}, 'goods');
