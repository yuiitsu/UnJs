/**
 * Created by onlyfu on 2017/5/11.
 */

Controller.extend('goods_create', function () {

    var self = this;

    this.bind = {
        '.js-goods-save click': 'save',
        '#save_on_shelf click': 'save_on_shelf',
        '#wm-goods-form-sku-button>a click': 'add_sku',
        '.wm-goods-form-item-actions click': 'showContent',
        '.wm-goods-form-images-box .js-wm-goods-form-images click.delete_': 'imageDelete',
        '.js-edit-tag keydown': 'editTag',
        '#js-wm-panel-body-stock-other .js-remove-tag click.removeTag_': 'removeTag',
        '.wm-category-open-edit .js-modify click.add_group_': 'addGroup',
        '.wm-category-open-edit .js-hide click.hide_group_': 'hideGroup',
        'input[name=pre_buy_time] click': 'preTimeType',
        '.wm-goods-form-box input change.4_': 'hasChange',
        '.wm-goods-form-box input input.1_': 'hasChange',
        '.wm-goods-form-box textarea input.2_': 'hasChange',
        '.wm-goods-form-box [contenteditable] input.3_': 'hasChange'
    };

    this.sku_data = [];
    this.sku_len = 0;
    this.goods_id = '';
    this.sku_dict_data = {};
    this.sku_data_db = [];
    this.params = {};

    /**
     * 创建商品表单界面
     */
    this.index = function (params) {
        var self = this;
        this.sku_data = [];
        this.sku_len = 0;
        this.goods_id = '';
        this.sku_dict_data = {};
        this.sku_data_db = [];
        this.change = false;
        // 检查参数
        this.params = this.getParams();
        var goods_id = this.params['goods_id'];
        var copy = this.params['copy'];
        if (!goods_id) {
            this.setGoodsId('');
            this.pageInit({});
        } else {
            this.model.query({
                id: goods_id,
                edit: true
            }, function (res) {
                if (res.code === 0) {
                    self.model.set('goods_data', res.data);
                    self.setGoodsId(goods_id);
                    self.sku_data_db = res.data.sku_data_list;
                    if (res.data.hasOwnProperty('sku_data_list')) {
                        var skuData = res.data.sku_data_list;
                        if (skuData) {
                            for (var i in skuData) {
                                var skuId = skuData[i]['sku_id'];
                                var stock = parseInt(skuData[i]['stock']);
                                if (!self.sku_dict_data.hasOwnProperty(skuId)) {
                                    self.sku_dict_data[skuId] = stock;
                                }
                            }
                        }
                    }
                }

                self.pageInit(res.data, function () {
                    // 处理 sku
                    self.callSub('edit_show_sku', res.data);
                });
            });
        }
    };

    this.pageInit = function (data, callback) {
        var self = this;
        if (data.sku_data_list) {
            var total_stock = 0;
            for (var i in data.sku_data_list) {
                var sku_data = data.sku_data_list[i];
                total_stock += sku_data['stock'];
            }
            data['stock'] = total_stock;
        }

        if (this.params['copy'] === 'true') {
            data['goods_name'] = data['goods_name'] + ' 副本';
        }

        this.output('goods.edit', wc.assign(data, {
            picCallback: this.imageAdd,
            model: this.model,
            search: this.params.search ? decodeURIComponent(this.params.search) : '',
            preBuyTime: {
                singleDatePicker: true,
                timePicker: true,
                minDate: moment(),
                locale: {format: 'YYYY-MM-DD HH:mm'}
            }
        }));
        this.listenSkuSet();
        this.bindWatch();
        // 设置商品图片数量
        this.model.set('imageNum', wc.getAttr(data, 'images.length', 0));
        // 获取商品分组
        if (data['group_id_list']) {
            this.model.set('group_id_list', data['group_id_list']);
        }
        this.getGroup();
        // 加载分类
        this.getCategory(data['category'] ? data['category']['id'] : '');
        // 加载品牌
        // this.getBrand(data['brand']['id']);
        // 加载物流模板
        this.callSub('fare_template_select', {'selected': data['shipping_template_id']});
        // this.renderTags(data['tag_list']);
        this.model.set('tag', data['tag_list']);
        // 初始化编辑器
        this.editorInit(data['detail'] ? data['detail'] : '');
        // 获取 tags
        // this.model.getTags(data.goods_id || '');
        $('#goods_name').focus();

        if ($.isFunction(callback)) {
            callback(data);
        }
    };

    this.bindWatch = function () {
        // 当 imageNum 大于等于 maxImage时，隐藏添加图片功能
        this.watch(this.model, 'default.imageNum', this.imageChange);
        this.watch(this.model, 'default.tag', this.renderTags);
    };

    /**
     * 获取商品分组
     */
    this.getGroup = function () {
        var self = this;
        self.callComponent({name: 'common.goods_group'}, {
            callback: function (data) {
                var html = self.getView('goods.edit_group', {
                    'list': data.list,
                    'bind': {
                        model: self.model,
                        value: 'default.group_id_list'
                    }
                });
                $('.wm-goods-form-group-box').html(html);
            }
        });
    };

    this.getCategory = function (selectCategoryId) {
        var self = this;
        self.callComponent({name: 'common.goods_category'}, {
            $el: $('#js-wm-goods-category-select'),
            key: selectCategoryId || '',
            defaultTxt: '选择分类'
        });
    };

    this.renderTags = function (tags) {
        // this.output('goods.goods_target', {list: tags}, $('.wm-goods-tag-list'));
        var view = this.getView('goods.goods_target', {list: tags});
        $('.wm-goods-tag-list').html(view);
    };

    /**
     * 编辑器初始化
     */
    this.editorInit = function (data) {
        var E = window.wangEditor;
        this.editor = new E('#wm-goods-editor');
        this.editor.customConfig.uploadImgShowBase64 = true;
        this.editor.customConfig.menus = [
            'head',  // 标题
            'bold',  // 粗体
            'italic',  // 斜体
            'underline',  // 下划线
            'strikeThrough',  // 删除线
            'foreColor',  // 文字颜色
            'backColor',  // 背景颜色
            'link',  // 插入链接
            'list',  // 列表
            'justify',  // 对齐方式
            'quote',  // 引用
            'image',  // 插入图片
            'table',  // 表格
            'undo',  // 撤销
            'redo'  // 重复
        ];
        this.editor.create();
        this.editor.txt.html(data);
    };

    /**
     * 保存操作
     * @param e
     */
    this.save = function (e) {
        this.callComponent({name: 'common.verify', method: 'verify'});
        this.callSub('save', {
            e: e
        });
    };

    /**
     * 保存并上架
     * @param e
     */
    this.save_on_shelf = function (e) {
        this.callComponent({name: 'common.verify', method: 'verify'});
        this.callSub('save', {
            e: e,
            on_shelf: true
        });
    };

    this.images = function (e) {
        var self = this;
        this.callComponent({
            name: 'common.pic_upload',
            data: {
                'multiple': true,
                'confirm': function (key, type, host) {
                    self.$(e).parent().before(self.getView('goods.edit_images_list', {
                        'key': key,
                        'type': type,
                        'host': host,
                        'url': host + '/' + key
                    }));
                }
            }
        }, 'show');
    };

    /**
     * 构建图片数据
     * @returns {string}
     */
    this.buildImages = function () {
        var imagesKeyList = [];
        $('.wm-images-key').each(function () {
            imagesKeyList.push($(this).val());
        });
        var imagesTypeList = [];
        $('.wm-images-type').each(function () {
            imagesTypeList.push($(this).val());
        });

        var imagesLen = imagesKeyList.length;
        var imagesDataList = [];
        for (var i = 0; i < imagesLen; i++) {
            imagesDataList.push({
                'key': imagesKeyList[i],
                'type': imagesTypeList[i]
            });
        }

        return imagesDataList.length === 0 ? '' : JSON.stringify(imagesDataList);
    };

    /**
     * 构建SKU数据
     * @param stock
     * @param price
     * @param bar_code
     * @returns {Array}
     */
    this.buildSku = function (stock, price, bar_code, is_new) {
        var self = this;
        // 价格
        var skuPriceList = [];
        $('.wm-goods-form-price').each(function () {
            skuPriceList.push($.trim($(this).val()));
        });
        // 库存
        var skuStockList = [];
        $('.wm-goods-form-stock').each(function () {
            skuStockList.push($.trim($(this).val()));
        });
        var barcodeList = [];
        $('.wm-goods-form-barcode').each(function () {
            barcodeList.push($.trim($(this).val()));
        });
        var imageList = [];
        $('.wm-goods-form-image').each(function () {
            imageList.push($.trim($(this).find('img').attr('data-key')) || '');
        });
        // sku_id
        var skuIdList = [];
        $('.wm-goods-form-input-sku-id').each(function () {
            skuIdList.push($(this).val());
        });
        var skuDataList = [];
        var index = 0;
        var skuNameData = {};
        var skuValueData = {};
        $('.js-wm-goods-form-sku-line').each(function () {
            var skuNameList = [];
            $(this).find('.wm-goods-form-input-sku-name').each(function () {
                skuNameList.push($(this).val());
            });
            var skuValueList = [];
            $(this).find('.wm-goods-form-input-sku-value').each(function () {
                skuValueList.push($(this).val());
            });

            var skuNameLen = skuNameList.length;
            var skuData = {
                'properties': []
            };
            for (var i = 0; i < skuNameLen; i++) {
                var skuName = skuNameList[i];
                var skuValue = skuValueList[i];
                var skuNameKey = 'cn' + i + skuName;
                var skuValueKey = 'cv' + i + skuValue;
                if (!skuNameData.hasOwnProperty(skuNameKey)) {
                    skuNameData[skuNameKey] = 'cn' + index + i;
                }
                if (!skuValueData.hasOwnProperty(skuValueKey)) {
                    skuValueData[skuValueKey] = 'cv' + index + i;
                }
                var skuItemData = {
                    'id': skuNameData[skuNameKey],
                    'name': skuName,
                    'value': {
                        'id': skuValueData[skuValueKey],
                        'name': skuValue
                    }
                };
                skuData['properties'].push(skuItemData);
            }
            skuData['price'] = skuPriceList[index] * 100;
            skuData['origin_price'] = skuPriceList[index] * 100;
            var stock = parseInt(skuStockList[index]);
            if (skuIdList[index] && !is_new) {
                stock = stock !== self.sku_dict_data[skuIdList[index]] ? Number(stock) - Number(self.sku_dict_data[skuIdList[index]]) : 0;
            }
            skuData['stock'] = stock;
            if (!is_new) {
                skuData['sku_id'] = skuIdList[index];
            }
            skuData['bar_code'] = barcodeList[index];
            if (imageList[index]) {
                skuData['image'] = [{type: 1, key: imageList[index]}];
            }
            skuDataList.push(skuData);
            index++;
        });
        if (skuDataList.length === 0) {
            var sku_id = '';
            try {
                sku_id = is_new ? '' : this.sku_data_db[0]['sku_id'];
            } catch (e) {
            }
            if (self.sku_dict_data[sku_id]) {
                stock = stock !== self.sku_dict_data[sku_id] ? Number(stock) - Number(self.sku_dict_data[sku_id]) : 0;
            } else {
                stock = Number(stock);
            }
            skuDataList.push({
                stock: stock,
                price: price * 100,
                sku_id: sku_id,
                bar_code: bar_code,
                properties: []
            });
        }
        return skuDataList;
    };

    /**
     * 添加SKU
     * @param e
     */
    this.add_sku = function (e) {
        var self = this;
        var skuLen = $('.wm-goods-form-sku-line').length - 1;
        self.check_sku_add_line_show(skuLen, 2);
        var html = this.getView('goods.sku_add_line_new', {'index': skuLen});
        this.$(e).parent().parent().before(html);
        // this.listenSkuSet();
    };

    /**
     * 设置
     * @param status
     */
    this.setPs = function (status) {
        if (status === 'disabled') {
            $('#price').attr('disabled', 'disabled');
            $('#stock').attr('disabled', 'disabled');
            $('#bar_code').attr('disabled', 'disabled');
        } else {
            $('#price').attr('disabled', false);
            $('#stock').attr('disabled', false);
            $('#bar_code').attr('disabled', false);
        }
    };

    this.check_sku_add_line_show = function (sku_len, num) {
        if (sku_len >= num) {
            $('#wm-goods-form-sku-line-button').hide();
        } else {
            $('#wm-goods-form-sku-line-button').show();
        }
    };

    this.reset_sku_data = function () {
        var self = this;
        self.sku_data = {};
        $('.wm-goods-form-sku-line').each(function () {
            var index = $(this).index();
            $(this).find('.wm-goods-form-sku-name').each(function () {
                var sku_name = $.trim($(this).val());
                self.sku_data[index] = {
                    sku_name: sku_name,
                    value: []
                }
            });
            $(this).find('.wm-goods-form-sku-value-item').each(function () {
                var value = $.trim($(this).find('.js-goods-form-sku-value-text').text());
                if (value) {
                    self.sku_data[index]['value'].push(value);
                }
            });
        });
        self.init_sku_table();
    };

    this.init_sku_table = function () {
        // 构建sku数据
        var sku_value_list = [];
        if (this.sku_data[0]) {
            var data = this.sku_data[0];
            for (var i in data['value']) {
                var sku_item = data['value'][i];
                if (this.sku_data[1] && this.sku_data[1].hasOwnProperty('value') && this.sku_data[1]['value'].length > 0) {
                    var data2 = this.sku_data[1];
                    for (var j in data2['value']) {
                        var sku_item2 = sku_item + ',' + data2['value'][j];
                        if (this.sku_data[2] && this.sku_data[2].hasOwnProperty('value') && this.sku_data[2]['value'].length > 0) {
                            var data3 = this.sku_data[2];
                            for (var n in data3['value']) {
                                var sku_item3 = sku_item2 + ',' + data3['value'][n];
                                sku_value_list.push({'skuList': sku_item3.split(',')});
                            }
                        } else {
                            sku_value_list.push({'skuList': sku_item2.split(',')});
                        }
                    }
                } else {
                    sku_value_list.push({'skuList': sku_item.split(',')});
                }
            }
        }

        var html = this.getView('goods.sku_set_table', {'list': sku_value_list, 'sku_data': this.sku_data});
        if (sku_value_list.length) {
            //单sku
            $('#min_price').prop('disabled', 'disabled');
        } else {
            $('#min_price').prop('disabled', false);
        }
        $('#wm-goods-form-sku-set-box').html(html);
        this.buildSkuTable(sku_value_list);
        // 监听库存/价格的变化，合计输出到总库存/总价格上
        // this.listenSkuSet();
    };

    this.buildSkuTable = function (sku_value_list) {
        if (sku_value_list.length > 0) {
            var row_len = sku_value_list[0]['skuList'].length;
            for (var i = 0; i < row_len - 1; i++) {
                var j = 1, n = 0;
                var value = '';
                var left_list = [];
                var left = {};
                var item_sku_object = $('.wm-goods-form-item-sku-' + i);
                var line_len = item_sku_object.length;
                item_sku_object.each(function () {
                    var v = $(this).text();
                    if (v == value) {
                        if (!left['id']) {
                            left['id'] = (n - 1) + '' + i;
                        }
                        j++;
                        if (n + 1 == line_len) {
                            left['rowspan'] = j;
                            left_list.push(left);
                        }
                    } else if (value != '') {
                        left['rowspan'] = j;
                        left_list.push(left);
                        left = {};
                        j = 1;
                    }
                    value = v;
                    n++;
                });
                for (var n  in left_list) {
                    var left = left_list[n];
                    item_sku_object = $('#wm-goods-form-item-sku-' + left['id']);
                    var index = parseInt(item_sku_object.attr('data-i'));
                    item_sku_object.attr('rowspan', left['rowspan']);
                    for (var m = index + 1; m < index + left['rowspan']; m++) {
                        $('#wm-goods-form-item-sku-' + m + i).remove();
                    }

                }
            }
        }
    };

    this.listenSkuSet = function () {
        var $sku_box = $('#wm-goods-form-sku-box'),
            $sku_set_box = $('#wm-goods-form-sku-set-box');
        $sku_box.off('change.sku_name').on('change.sku_name', '.wm-goods-form-sku-name', function (e) {
            var $this = $(e.target),
                $parent = $this.closest('.wm-goods-form-sku-line'),
                index = $parent.find('.wm-goods-form-sku-line').index($parent),
                sku_name = $.trim($this.val());
            if (sku_name) {
                for (var i = 0; i < self.sku_data.length; i++) {
                    if (i !== index && self.sku_data[i].sku_name === sku_name) {
                        // 该规格名已存在
                        return false;
                    }
                }
                var hasValue = false;
                $parent.find('.wm-goods-form-sku-value-item input').each(function () {
                    if ($.trim($(this).val()) !== '') {
                        hasValue = true;
                        return false;
                    }
                });
                if (hasValue) {
                    $('#wm-goods-form-sku-set-box').show();
                }
                self.reset_sku_data();
            }
        });
        $sku_box.off('click.focus_value').on('click.focus_value', '.wm-goods-form-sku-value-box', function (e) {
            var $target = $(e.currentTarget),
                $input = $target.find('.js-goods-form-sku-value');
            $input.focus();
        });

        $sku_box.off('keyup.add_value').on('keyup.add_value', '.js-goods-form-sku-value', function (e) {
            if (e.keyCode === 13) {
                var $target = $(e.target),
                    value = $target.val().trim(),
                    $parent = $target.closest('.js-goods-form-sku-value-add-input-container');
                if(value !== ''){
                    $parent.before(self.getView('goods.sku_value', value));
                    $target.val('');
                    $('#wm-goods-form-sku-set-box').show();
                    self.setPs('disabled');
                    self.reset_sku_data();
                }
            }
        });

        $sku_box.off('input.sku_value').on('input.sku_value', '.wm-goods-form-sku-value-item input', function (e) {
            var $this = $(e.target),
                $parent = $this.closest('.wm-goods-form-sku-value-box'),
                $line_parent = $this.closest('.wm-goods-form-sku-line'),
                sku_value = $.trim($this.val()),
                $input_list = $parent.find('input[name="wm-input-little"]').not(this),
                has_same = false;
            $input_list.each(function () {
                if (this.value.trim() === sku_value) {
                    has_same = true;
                    return false;
                }
            });
            if (sku_value && !has_same) {
                var sku_name = $.trim($line_parent.find('.wm-goods-form-sku-name > input').val());
                if (sku_name) {
                    $('#wm-goods-form-sku-set-box').show();
                    self.setPs('disabled');
                    self.reset_sku_data();
                }
            }
        });

        $sku_box.off('click.close').on('click.close', '.wm-goods-form-sku-line-close', function (e) {
            var $target = $(e.target),
                $line_parent = $target.closest('.wm-goods-form-sku-line'),
                skuLen = 0;
            $line_parent.remove();
            skuLen = $('.wm-goods-form-sku-line').length - 1;
            if (skuLen === 0) {
                $('#wm-goods-form-sku-set-box').hide();
                self.setPs('show');
            }
            self.check_sku_add_line_show(skuLen, 3);
            self.reset_sku_data();
        });

        $sku_box.off('click.delete').on('click.delete', '.js-delete-sku-value', function (e) {
            var $sku = $(e.target).closest('.wm-goods-form-sku-value-item');
            $sku.remove();
            self.reset_sku_data();
        });

        // 监听库存/价格的变化，合计输出到总库存/总价格上
        $sku_set_box.off('change.stock').on('change.stock', '.wm-goods-form-stock', function (e) {
            autoFillStock($(e.currentTarget));
            var total_stock = 0;
            $('.wm-goods-form-stock').each(function () {
                var this_stock = parseInt($.trim($(this).val()));
                total_stock += this_stock >= 0 ? this_stock : 0;
            });
            $('#stock').val(total_stock);
        });

        $sku_set_box.off('change.price').on('change.price', '.wm-goods-form-price', function (e) {
            autoFillPrice($(e.currentTarget));
            var min_price = 0;
            $('.wm-goods-form-price').each(function () {
                var this_price = parseFloat($.trim($(this).val()));
                this_price = this_price ? this_price : 0;
                if (min_price === 0) {
                    min_price = this_price;
                } else {
                    if (this_price < min_price && this_price > 0) {
                        min_price = this_price;
                    }
                }
            });
            $('#min_price').val(min_price);
        });


        // 自动填充价格
        var autoFillPrice = function ($el) {
            var value = $el.val();
            // 第一个输入框并且输入内容没有错误
            if (Number($el.attr('data-index')) === 0 && !$el.hasClass('error')) {
                $('.wm-goods-form-price').each(function (i, item) {
                    if (i !== 0 && $(item).val() === '') {
                        $(item).val(value).trigger('change');
                    }
                });
            }

        };

        // 自动填充库存
        var autoFillStock = function ($el) {
            var value = $el.val();
            // 第一个输入框并且输入内容没有错误
            if (Number($el.attr('data-index')) === 0 && !$el.hasClass('error')) {
                $('.wm-goods-form-stock').each(function (i, item) {
                    if (i !== 0 && $(item).val() === '') {
                        $(item).val(value).trigger('change');
                    }
                });
            }
        };


    };

    this.imageAdd = function (list) {
        for (var i in list) {
            list[i]['url'] = list[i]['host'] + '/' + list[i]['key']
        }
        // increase picture num
        var imageNum = self.model.get('imageNum');
        var maxImage = self.model.get('maxImage');
        if (imageNum + list.length > maxImage) {
            list = list.slice(0, (maxImage - imageNum));
        }
        self.model.set('imageNum', self.model.get('imageNum') + list.length);
        $('#js-wm-goods-form-image-button').before(self.getView('goods.edit_images_list', list));

    };

    // 处理图片数量变化
    this.imageChange = function (value) {
        var maxImage = self.model.get('maxImage');
        var $error = $('#js-wm-panel-body-images').find('.error-container');
        if (Number(value) >= maxImage) {
            $('#js-wm-goods-form-image-button').hide();
        } else {
            $('#js-wm-goods-form-image-button').show();
            $('.wm-goods-form-images-box li:last-child').removeClass('error');
            $error.html('');
        }
    };

    // 删除商品图片
    this.imageDelete = function (e) {
        this.callComponent({
            name: 'common.confirm',
            data: {
                msg: '确定要删除这张图片吗？',
                ok: function (close) {
                    self.$(e).remove();
                    // decrease imageNum
                    self.model.set('imageNum', self.model.get('imageNum') - 1);
                    close();
                }
            }
        }, 'show');
    };

    // 检查图片是否为空
    this.checkImage = function () {
        var imageNum = self.model.get('imageNum');
        var result = (Number(imageNum) !== 0);
        var $error = $('#js-wm-panel-body-images').find('.error-container');
        if (!result) {
            $('.wm-goods-form-images-box li:last-child').addClass('error');
            $error.html('必填');
        }
        return result;
    };

    // 跳转到商品列表
    this.jumpToList = function () {
        this.route({a: 'goods'});
    };


    // 编辑 tag
    this.editTag = function (e) {
        var keyCode = e.keyCode;
        var $target = $(e.currentTarget);
        if (keyCode === 13) {
            var value = $.trim($target.val());
            var tag = this.model.get('tag') || [];
            tag = tag.slice();
            if (value && tag.indexOf(value) === -1) {
                tag.push(value);
                this.model.set('tag', tag);
                // this.output('goods.goods_target', {list: tag}, $('.wm-goods-tag-list'));
            }
            // clear input
            $target.val('');
        }
    };

    // 删除 tag
    this.removeTag = function (e) {
        var $target = $(e.currentTarget).closest('.wm-goods-tag-item');
        var value = $target.attr('data-value');
        var tag = this.model.get('tag');
        if (tag.indexOf(value) !== -1) {
            tag.splice(tag.indexOf(value), 1);
            $target.remove();
        }
    };

    // 添加分组
    this.addGroup = function (e) {
        var $target = $(e.currentTarget);
        var $container = $(e.currentTarget).closest('.wm-tip-container');
        var result = this.callComponent({name: 'common.verify', method: 'verify'}, {$el: $container});
        if (result) {
            var groupModel = this.callModel('group');
            $target.attr('disabled', true).btn().loading(true);
            groupModel.create({
                name: $('.wm-group-name input').val().trim(),
                description: $('.wm-group-description textarea').val().trim()
            }, function (res) {
                var noticeType = 'danger';
                if (res.code === 0) {
                    noticeType = 'success';
                    self.getGroup();
                    $('.wm-group-name input').val('');
                    $('.wm-group-description textarea').val('');
                    self.hideGroup(e);
                }
                self.callComponent({
                    name: 'common.top_notifications',
                    data: {'type': noticeType, 'msg': res.msg}
                }, 'show');
                $target.removeAttr('disabled').btn().loading(false);
            }, function () {
                $target.removeAttr('disabled').btn().loading(false);
            })
        }
    };

    // 隐藏添加分组
    this.hideGroup = function (e) {
        var $target = $(e.target);
        $target.parents('.js-tip-container').addClass('hidden').find('.error').removeClass('error').nextAll('.error-container').text('');
    };

    this.preTimeType = function (e) {
        var $target = $(e.currentTarget);
        var type = Number($target.val());
        if (type === 2) {
            $('.pre-buy-time input').removeAttr('disabled');
        } else {
            $('.pre-buy-time input').attr('disabled', true);
        }
    };

    /**
     * 设置goods_id
     */
    this.setGoodsId = function (goodsId) {
        var copy = this.params['copy'];
        this.goods_id = copy === 'true' ? '' : goodsId;
    };

    this.hasChange = function (e) {
        var $target = $(e.target),
            times = this.model.get('times'),
            selectors = wc.keys(times) || [];
        for (var i = 0; i < selectors.length; i++) {
            var $input = $(selectors[i]);
            if ($target.is($input)) {
                times[selectors[i]]--;
                if (!times[selectors[i]]) {
                    delete times[selectors[i]]
                }
                return;
            }
        }
        this.change = true;
    };

    this.destroy_sync = function (params, next) {
        if (this.change) {
            this.callComponent({
                name: 'common.confirm',
                data: {
                    msg: '当前页面还没有编辑完成，离开将会丢失未保存的内容，您确定要离开吗？',
                    ok: function (close) {
                        close();
                        next();
                    }
                }
            }, 'show');
        } else {
            next();
        }
    };
});
