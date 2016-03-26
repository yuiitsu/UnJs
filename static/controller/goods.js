/**
 * 商品控制器
 */

var goods = function(unjs) {

    this.index = function() {
    
        var _html = '<p>商品控制器</p>';

        unjs.display(_html);
    };

    return this;
}

Module.goods = goods;
