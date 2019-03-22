/**
 *  Verify Pattern Required Component
 */
Component.extend('verification.required', function() {

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
            result = true;

        if (attrValue === '1') {
            //
            var message = '必须填写';
            if (target.attr('type') === 'radio' || target.attr('type') === 'checkbox') {
                if ($('input[name='+ name +']:checked').val() === undefined) {
                    //
                    target.addClass('error');
                    result = false;
                } else {
                    target.removeClass('error');
                    message = '';
                }
            } else {
                var value = $.trim(target.val());
                if (value === '') {
                    // 验证未通过
                    target.addClass('error');
                    result = false;
                } else {
                    target.removeClass('error');
                    message = '';
                }

            }
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