/**
 *  Verify Pattern Length Component
 */
Component.extend('verification.length', function() {

    var self = this;

    this.bind = {};

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function(params) {
        var target = params.target,
            value = $.trim(target.val()),
            valueType = target.attr('valuetype'),
            dataType = target.attr('data-type'),
            attrValue = params.attrValue,
            verifyTipsType = params.verifyTipsType,
            name = target.attr('name');

        try {
            attrValue = JSON.parse(attrValue.replace(/\'/g, '"'));
        } catch (e) {
            console.error(e);
            return false;
        }

        var minLength = attrValue[0],
            maxLength = attrValue[1];

        if (minLength ==='' && maxLength === '') {
            return false;
        }

        //
        var message = ['', '', '', '', ''],
            failed = false;
        valueType = valueType ? valueType : 'text';
        dataType = dataType ? dataType: 'text';
        if (self.hasOwnProperty(dataType)) {
            self[dataType](minLength, maxLength, value, valueType, message, failed);
        }

        var m = message.join("");
        if (m.length > 0) {
            target.addClass('error');
            params.verifyResult = false;
        } else {
            target.removeClass('error');
            params.verifyResult = true;
        }

        // 显示提示
        self.callComponent({name: 'verification.' + verifyTipsType}, {
            target: target,
            message: m,
            name: name
        });
    };

    this.text = function(minLength, maxLength, value, valueType, message, failed) {
        //
        minLength = parseInt(minLength);
        maxLength = parseInt(maxLength);
        if (minLength > 0) {
            if (valueType === 'text') {
                value = value ? value : '';
                if (value.length < minLength) {
                    message[0] = '长度须>=';
                    message[1] = minLength;
                    failed = true;
                }
            } else if (valueType === 'number') {
                value = value ? value : 0;
                if (parseFloat(value) < minLength) {
                    message[0] = '须>=';
                    message[1] = minLength;
                    failed = true;
                }
            }
        }
        //
        if (maxLength > 0) {
            if (valueType === 'text') {
                value = value ? value : '';
                if (value.length > maxLength) {
                    message[0] = '长度须<=';
                    message[3] = maxLength;
                    failed = true;
                }
            } else if (valueType === 'number') {
                value = value ? value : 0;
                if (parseFloat(value) > maxLength) {
                    message[0] = '须<=';
                    message[3] = maxLength;
                    failed = true;
                }
            }
        }

        if (minLength > 0 && maxLength > 0 && failed) {
            if (valueType === 'text') {
                message[0] = '长度须在';
            } else {
                message[0] = '须在';
            }
            message[1] = minLength;
            message[2] = '-';
            message[3] = maxLength;
            message[4] = '之间'
        }
    };

    this.date = function(minLength, maxLength, value, valueType, message, failed) {
        var date = value ? new Date(value) : '',
            from = minLength ? new Date(minLength) : '',
            to = maxLength ? new Date(maxLength) : '';

        if (from) {
            if (!date || date < from) {
                message[0] = '不能小于';
                message[2] = minLength;
                failed = true;
            }
        }

        if (to) {
            if (!date || date > to) {
                message[0] = '不能大于';
                message[3] = maxLength;
                failed = true;
            }
        }

        if (minLength !== '' && maxLength !== '' && failed) {
            message[0] = '须在';
            message[1] = minLength;
            message[2] = '到';
            message[3] = maxLength;
            message[4] = '之间'
        }
    };
});