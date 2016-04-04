/**
 * 公共方法
 */

var WmCommon = function() {

    var self = this;

    self.loadingButton = function() {

        // 对象
        var object = null;
        // 默认文本
        var txt = '';

        /**
         * 执行开始
         * @param o 对象
         * @param showTxt 显示文字
         */
        this.start = function(o, showTxt) {
            object = o;
            txt = o.text();

            // 更改对象状态为禁用
            object.addClass('wm_form_button_disable');
            object.attr('disabled', true);
            object.text(showTxt);
        };

        /**
         * 执行结束
         * @param showTxt 显示文字
         */
        this.end = function(showTxt) {
            object.removeClass('wm_form_button_disable');
            object.attr('disabled', false);
            object.text(showTxt ? showTxt : txt);
        }
    };

    /**
     * 构造API请求参数
     * @param data
     */
    self.buildPostData = function(data) {

        return {'para': JSON.stringify(data)};
    };

    /**
     * 发起POST请求
     * @params url string 请求地址
     * @params data array 发送数据
     * @params callback funciton 回调函数
     * @params dataType string 返回数据类型，默认为json
     */
    self.post = function(options, callback, errCallback) {

        var opt = {
            url: options.url,
            data: options.data,
            type: 'post',
            dataType: options.dataType ? options.dataType : 'json',
            loading: options.loading,
        };
        self.request(opt, callback, errCallback);
    };

    /**
     * 发起GET请求
     * @params url string 请求地址
     * @params data array 发送数据
     * @params callback funciton 回调函数
     * @params dataType string 返回数据类型，默认为json
     */
    self.get = function(options, callback, errCallback) {

        var opt = {
            url: options.url,
            data: options.data,
            type: 'get',
            dataType: options.dataType ? options.dataType : 'json',
            loading: options.loading
        };
        self.request(opt, callback, errCallback);
    };

    /**
     * 执行ajax请求
     * @params url string 请求地址
     * @params data array 发送数据
     * @params callback funciton 回调函数
     * @params type string 请求类型，post/get
     * @params dataType string 返回数据类型，默认为json
     */
    self.request = function(options, callback, errCallback) {

        self.loading.show();

        var ajaxTimer = $.ajax({
            "url": options.url,
            "type": options.type,
            "dataType": options.dataType,
            "timeout": 10000,
            "data": options.data,
            success: function(response) {
                self.loading.hide();
                // 请求成功，调用回函函数
                if($.isFunction(callback)){
                    callback(response);
                }
            },
            error: function() {
                self.loading.hide();
                ajaxTimer.abort();
                if ($.isFunction(errCallback)) {
                    errCallback();
                }
                console.log('ajax request error');
            },
            complate: function(XMLHttpRequest, status) {

                self.loading.hide();
                if (status == 'timeout') {
                    ajaxTimer.abort();
                    if ($isFunction(errCallback)) {
                        errCallback();
                    }
                    console.log('ajax request timeout');
                }
            }
        });
    };

    /**
     * 加载动画
     * @type {{show: WmCommon.loading.show}}
     */
    self.loading = {

        loadingName: 'wm_loading',

        show: function(txt) {

            var text = txt ? txt : '正在加载...';
            // 创建蒙板
            self.mask.show();

            if ($('#' + this.loadingName).length == 0) {
                var _html = '' +
                        '<div id="'+ this.loadingName +'">' +
                            text +
                        '</div>' +
                    '';
                $('body').append(_html);
            } else {
                $('#' + this.loadingName).show();
            }
        },
        hide: function() {
            self.mask.hide();
            $('#' + this.loadingName).hide();
        }
    };

    /**
     * 蒙板
     * @type {{maskName: string, show: WmCommon.mask.show, hide: WmCommon.mask.hide}}
     */
    self.mask = {

        maskName: 'wm_mask',

        show: function() {

            // 如果蒙板对象不存在,创建,存在显示
            if ($('#' + this.maskName).length == 0) {

                var _html = '<div id="'+ this.maskName +'"></div>';

                // 显示
                $('body').append(_html).css('overflow', 'hidden');
                // 获取屏幕高宽
                var clientWidth = self.clientSize('clientWidth');
                var clientHeight = self.clientSize('clientHeight');
                // 设置蒙板高宽
                $('#' + this.maskName).css({'width': clientWidth, 'height': clientHeight});
            } else {
                $('#' + this.maskName).show();
            }
        },

        hide: function() {
            $('#' + this.maskName).hide();
            $('body').css('overflow', 'visible');
        }
    };

    /**
     * 屏幕/文档/滚动宽高
     * @param type 类型
     */
    self.clientSize = function(type) {

        var result = [];
        result['scrollTop'] = window.self.document.documentElement.scrollTop ?
            window.self.document.documentElement.scrollTop: window.self.document.body.scrollTop;
        result['scrollHeight'] = window.self.document.documentElement.scrollHeight ?
            window.self.document.documentElement.scrollHeight: window.self.document.body.scrollHeight;
        result['clientHeight'] = window.self.document.documentElement.clientHeight ?
            window.self.document.documentElement.clientHeight: window.self.document.body.clientHeight;
        result['clientWidth'] = window.self.document.documentElement.clientWidth ?
            window.self.document.documentElement.clientWidth: window.self.document.body.clientWidth;

        return result[type];
    };

    /**
     * 数据验证
     * @param txt 内容
     * @param type 类型
     */
    self.validation = function(txt, type) {

        if (!txt || !type) {
            return false;
        }

        switch (type) {
            case 'mobile':
                var patt = /^((13[0-9])|(14[5|7])|(15[^4,\D])|(18[0-9])|(17[0,5-9]))\d{8}$/;
                return txt.match(patt);
                break;
        }
    };

    /**
     * 设置大小
     */
    self.sizeHtml = function() {
        var size = $(window).width() / 15;
        size = size > 50 ? 50 : size;
        $('html').css('font-size', size + 'px');
    };

    self.init = function() {

        self.sizeHtml();
        $(window).resize(function() {
            self.sizeHtml();
        });
    };
};

var wmCommon = new WmCommon();
wmCommon.init();