/**
 *  Verify Pattern Equal Component
 */
Component.extend('verification.equal', function() {

    var self = this;

    this.bind = {};

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function(params) {
        var target = params.target,
            form = params.form,
            attrValue = params.attrValue,
            verifyTipsType = params.verifyTipsType,
            result = true,
            equalTo = form.find('[name='+ attrValue +']').eq(0),
            equalToName = equalTo.attr('data-name');

        if (equalTo.length > 0) {
            var message = '';
            if ($.trim(target.val()) !== $.trim(equalTo.val())) {
                result = false;
                message = '需和'+ equalToName +'值一至';
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