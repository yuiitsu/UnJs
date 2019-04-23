/**
 *  Linkage Select Component
 */
Component.extend('linkage_select', function() {
    //
    var self = this;
    /**
     * 事件绑定，被调用时自动执行
     */
    this.bind =  {
        initDataSource: function(params) {
            var id = params.id,
                parent = $('#component-linkage-select-' + id),
                target = parent.find('select').eq(0),
                dataSource = target.attr('datasource');

            if (dataSource && dataSource.indexOf('{api}') === 0) {
                var api = dataSource.replace('{api}', '');
                self.queryData(api, dataSource, function(data) {
                    self.renderComponent('linkage_select.options', data).appendTo(target);
                });
            }
        },
        change: function(params) {
            var id = params.id,
                parent = $('#component-linkage-select-' + id);
            // $('.component-input').find('input').val('Input');
            parent.off('change').on('change', 'select', function() {
                // 请求数据，如果有，创建一个选择框
                var _this = $(this),
                    input = parent.find('input'),
                    inputValueType = input.attr('valueType'),
                    inputTextType = input.attr('textType'),
                    selectedOption = _this.find('option:selected'),
                    optionDataSource = selectedOption.attr('datasource'),
                    optionText = selectedOption.text(),
                    value = _this.val();

                if (optionDataSource && optionDataSource.indexOf('{api}') === 0) {
                    var api = optionDataSource.replace('{api}', '');
                    self.queryData(api, optionDataSource, function(data) {
                        if (data.length > 0) {
                            self.renderComponent('linkage_select.select', {list: data}).appendTo(parent);
                        }
                    });
                }

                //
                if (inputValueType && inputValueType === 'combination') {
                    input.val(input.val() + value);
                } else {
                    input.val(value);
                }
                if (inputTextType && inputTextType === 'combination') {
                    input.attr('text', input.attr('text') + optionText);
                } else {
                    input.attr('text', optionText);
                }
                //
                var thisIndex = _this.parent().index(),
                    nextIndex = thisIndex + 1;
                //
                parent.find('select').each(function() {
                    if (thisIndex < $(this).parent().index()) {
                        $(this).parent().remove();
                    }
                });
            });
        }
    };

    this.queryData = function(url, dataSource, callback) {
        self._ajax({
            url: url,
            type: 'GET',
            success: function(response) {
                if (response.state === 0) {
                    var data = response.data,
                        dataLen = data.length,
                        list = [],
                        dataSourceList = dataSource.split('&'),
                        dataSourceListLen = dataSourceList.length,
                        apiUrlItem = [];


                    for (var i = 0; i < dataSourceListLen; i++) {
                        if (dataSourceList[i].indexOf('parentId') === -1) {
                            apiUrlItem.push(dataSourceList[i])
                        }
                    }

                    for (var i = 0; i < dataLen; i++) {
                        list.push({
                            'text': data[i]['name'],
                            'dataSource': apiUrlItem.join("&") + '&parentId=' + data[i]['id'],
                            'value': data[i]['code']
                        })
                    }
                    callback(list);
                } else {
                    console.log(response);
                }
            },
            error: function() {
                console.log('ajax error');
            },
            complete: function() {}
        });
    };

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function() {
    };
});