/**
 * Created by onlyfu on 2017/6/19.
 */

Controller.extend('fare_template_select', function() {

    this.bind = {
    };

    this.init = function(data) {
        var self = this;
        var logistics_template_model = this.callModel('logistics_template');
        logistics_template_model.query(function(res) {
            var html = self.getView('goods.fare_template_select', {'list': res.data, 'selected': data['selected'] > 0 ? data['selected'] : ''});
            $('#js-wm-fare-template-select').html(html);
        });
    };
}, 'goods_create');
