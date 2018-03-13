/**
 * Created by onlyfu on 2017/5/23.
 */

Controller.extend('edit_show_sku', function() {

    this.bind = {
    };

    this.init = function(data) {
        if (data.hasOwnProperty('sku_properties_list') && data['sku_properties_list'].length > 0 ) {
            var sku_data = [];
            var list = [];
            var html = '';
            for (var i in data['sku_properties_list']) {
                var skuName = data['sku_properties_list'][i]['name'];
                var skuValue = data['sku_properties_list'][i]['value'];
                html += this.getView('goods.sku_add_line_new', data['sku_properties_list'][i]);
                sku_data.push({
                    'sku_name': skuName,
                    'value': skuValue
                });
            }
            $('#wm-goods-form-sku-line-button').before(html);
            for (var i in data['sku_data_list']) {
                var sku_list = [],
                    length = data['sku_data_list'][i]['properties'].length;
                for(var j=0;j<length;j++){
                    sku_list.push(data['sku_data_list'][i]['properties'][j]['value']['name']);
                }
                list.push({
                    'skuList': sku_list,
                    'stock': data['sku_data_list'][i]['stock'],
                    'price': data['sku_data_list'][i]['price'] / 100,
                    'barcode': data['sku_data_list'][i]['bar_code'],
                    'image': data['sku_data_list'][i]['image'],
                    'key': wc.getAttr(data, 'sku_data_list.' + i + '.image_data.0.key', ''),
                    'sku_id': data['sku_data_list'][i]['sku_id'],
                    'sales': data['sku_data_list'][i]['sales']
                });
            }
            $('#wm-goods-form-sku-set-box').html(this.getView('goods.sku_set_table', {'sku_data': sku_data, 'list': list})).show();
            this.setPs('disabled');
            this.buildSkuTable(list);
            this.listenSkuSet();
        } else {
            $('#bar_code').val(data['sku_data_list'][0]['bar_code']);
        }
    };
}, 'goods_create');
