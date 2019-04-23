/**
 *  Verify Pattern Required Level Component
 */
Component.extend('verification.requiredlevel', function() {

    var self = this;

    this.bind = {};

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function(params) {
        var target = params.target,
            attrValue = params.attrValue,
            verifyTipsType = params.verifyTipsType,
            name = target.attr('name'),
            parent = $(target.attr('parent')),
            result = true;

        if (attrValue) {
            //
            var message = '必须填写',
                selects = parent.find('select'),
                itemLen = selects.length,
                hasValueLevel = 0;

            //
            selects.each(function() {
                if ($(this).val()) {
                    hasValueLevel++;
                }
            });

            if (attrValue === 'last') {
                if (hasValueLevel !== itemLen) {
                    selects.addClass('error');
                    result = false;
                } else {
                    selects.removeClass('error');
                    message = '';
                }
            } else {
                if (parseInt(attrValue) > hasValueLevel && itemLen > hasValueLevel) {
                    selects.addClass('error');
                    result = false;
                } else {
                    selects.removeClass('error');
                    message = '';
                }
            }
            //
            // if (target.attr('type') === 'radio' || target.attr('type') === 'checkbox') {
            //     if ($('input[name='+ name +']:checked').val() === undefined) {
            //         //
            //         target.addClass('error');
            //         result = false;
            //     } else {
            //         target.removeClass('error');
            //         message = '';
            //     }
            // } else {
            //     var value = $.trim(target.val());
            //     if (value === '') {
            //         // 验证未通过
            //         target.addClass('error');
            //         result = false;
            //     } else {
            //         target.removeClass('error');
            //         message = '';
            //     }

            // }
            // 显示提示
            self.callComponent({name: 'verification.' + verifyTipsType}, {
                target: target,
                message: message,
                name: name
            });
        }

        return result;
    };
});