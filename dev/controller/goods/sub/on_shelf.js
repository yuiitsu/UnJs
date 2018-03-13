/**
 * 商品上下架
 * Created by onlyfu on 2017/12/13.
 */
Controller.extend('on_shelf', function() {

    var self = this;

    this.bind = {};

    this.init = function (e) {
        var o = self.$(e);
        var goods_id = o.attr('data-id');
        var onShelf = o.attr('data-on-shelf');
        self.callComponent({
            name: 'common.confirm',
            data: {
                msg: '确定要该商品'+(onShelf === '1' ? '下架':'上架')+'吗？',
                ok: function (close) {

                    if (goods_id) {
                        self.model.onShelf({
                            is_on:onShelf === '1' ? 0:1,
                            goods_id: goods_id
                        }, function (res) {
                            var type = 'danger';
                            if (res.code === 0) {
                                type = 'success';
                                // if(self.model.get('search_data.is_on_shelf') !== ''){
                                    self.model.get_list();
                                // }
                            }
                            close();
                            self.callComponent({
                                name: 'common.top_notifications',
                                data: {
                                    msg: res.msg,
                                    type: type
                                }
                            }, 'show');
                        });
                    }
                }
            }
        }, 'show');
    };

}, 'goods');
