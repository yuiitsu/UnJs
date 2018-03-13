/**
 * Created by onlyfu on 2017/5/24.
 */

Model.extend('index', function () {

    this.default = {
        shop_dash: {
            pay_order_count: '',
            apply_order_count: ''
        },
        ui: {
            startDate: wc.getDate(30),
            endDate: wc.getDate(1)
        },
        conversionRate: {
            orderCount: '',
            uv: ''
        },
        conversionRateLine: {
            series: [],
            orderCount: [],
            uv: []
        },
        today: {
            uv: '',
            pv: '',
            orderCount: '',
            money: '',
            goodsCount: '',
            rate: ''
        },
        yesterday: {
            uv: '',
            pv: '',
            orderCount: '',
            money: '',
            goodsCount: '',
            rate: ''
        }
    };


    this.apiAppend({
        'count': '/api/v1/order/count/admin/query',
        'statisticApi': '/api/events/report?token=' + st.token + '&project=' + st.project
    });

    this.getOrderCount = function () {
        var self = this;
        this._get({
            'url': this.api.count,
            'loading': true
        }, function (resp) {
            if (resp && resp.code === 0 && resp.data) {
                self.set('shop_dash', resp.data)
            } else {
                self.show('查询店铺概览信息失败', 'danger');
            }
        }, function () {
            self.show('查询店铺概览信息失败，请稍后再试', 'danger');
        });
    };

    this.conversionRate = function () {
        var self = this,
            shop_id = wc.getShopId();
        this.query(this.getApiJSON({
            "measures": [
                {
                    "event_name": "b2c_page_view",
                    "aggregator": "unique"//UV
                },
                {
                    // PV/UV: pageView
                    "event_name": "b2c_order_pay",
                    // unique为UV，general为PV
                    "aggregator": "general"
                }
            ],
            "rollup_date": true,
            "filter": {
                "relation": "and",
                "conditions": [
                    {
                        "field": "event.b2c_page_view.shop_id",
                        "function": "equal",
                        "params": [
                            // 商户ID
                            shop_id
                        ]
                    },
                    {
                        "field": "event.b2c_order_pay.shop_id",
                        "function": "equal",
                        "params": [
                            // 商户ID
                            shop_id
                        ]
                    }
                ]
            }
        }), function (resp) {
            var uv = parseFloat(resp.rows[0] ? resp.rows[0]['values'][0][0] : 0),
                count = parseFloat(resp.rows[0] ? resp.rows[0]['values'][0][1] : 0);
            self.set('conversionRate', {
                orderCount: count,
                uv: uv
            });
        });//付款订单数

        this.query(this.getApiJSON({
            "measures": [
                {
                    "event_name": "b2c_page_view",
                    "aggregator": "unique"//UV
                },
                {
                    "event_name": "b2c_order_pay",
                    "aggregator": "general"//PV
                }
            ],
            "filter": {
                "relation": "and",
                "conditions": [
                    {
                        "field": "event.b2c_page_view.shop_id",
                        "function": "equal",
                        "params": [
                            // 商户ID
                            shop_id
                        ]
                    },
                    {
                        "field": "event.b2c_order_pay.shop_id",
                        "function": "equal",
                        "params": [
                            // 商户ID
                            shop_id
                        ]
                    }
                ]
            }
        }), function (resp) {
            var series = [],
                orderCount = [],
                uv = [];
            for (var i = 0; i < resp.series.length; i++) {
                var data = resp.rows[0]['values'][i];
                series.push(resp.series[i]);
                uv.push(data[0]);
                orderCount.push(data[1]);
            }
            self.set('conversionRateLine', {
                series: series,
                uv: uv,
                orderCount: orderCount
            })
        });//一段时间付款订单数

    };

    this.getTodayData = function () {
        var today = wc.getDate(0,'YYYY-MM-DD'),
            yesterday = wc.getDate(1,'YYYY-MM-DD');
        this.getSingleDay(today, 'today');
        this.getSingleDay(yesterday, 'yesterday');
    };

    this.getSingleDay = function (time, modelName) {
        var self = this,
            start_date = time+' 00:00:00',
            endDate = time+' 23:59:59',
            shop_id = wc.getShopId();
        this.query({
            apiJSON: {
                startDate: time,
                endDate: time,
                dataType: 'pv,uv'
            },
            need_para:true,
            api: '/api/statistics/statistics/traffic/visitcount'
        }, function (resp) {
            if(resp.returnValue === 0){
                var data = resp.data;
                var modelData = self.get(modelName);
                modelData.uv = data.uv;
                modelData.pv = data.pv;
            }

        });
        this.query({
            apiJSON: {
                start_date: start_date,
                end_date: endDate,
                data_type: '_pay_count '
            },
            api: '/api/v1/order/statistics/query'
        }, function (resp) {
            if(resp.code === 0){
                var data = resp.data;
                var modelData = self.get(modelName);
                modelData.orderCount = data.count;
            }

        });//付款订单数
        this.query({
            apiJSON: {
                start_date: start_date,
                end_date: endDate,
                data_type: '_pay_amount '
            },
            api: '/api/v1/order/statistics/query'
        }, function (resp) {
            if(resp.code === 0){
                var data = resp.data;
                var modelData = self.get(modelName);
                modelData.money = data.count;
            }

        });//付款金额
        this.query({
            apiJSON: {
                start_date: start_date,
                end_date: endDate,
                data_type: '_pay_buy_vol '
            },
            api: '/api/v1/order/statistics/query'
        }, function (resp) {
            if(resp.code === 0){
                var data = resp.data;
                var modelData = self.get(modelName);
                modelData.goodsCount = data.count;
            }

        });//付款商品件数
    };

    this.query = function (data, callback) {
        var para = data.need_para ? {para: JSON.stringify(data.apiJSON)}:data.apiJSON;
        $.ajax({
            url: data.api,
            data: para,
            abort: true,
            contentType: 'application/json',
            type: 'get',
            success: function (resp) {
                wc.isFunction(callback) && callback(resp);
            }
        });
    };


    this.show = function (msg, type) {
        this.callComponent({
            name: 'common.top_notifications',
            data: {
                'type': type || 'info',
                'msg': msg
            }
        }, 'show');
    }
});
