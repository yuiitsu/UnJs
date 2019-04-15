/**
 *  Verification Component
 */
Component.extend('verification', function() {

    var self = this;

    this.bind = {};

    /**
     * 不指定方法，默认执行方法
     */
    this.init = function(params) {
        var parent = params && params.form ? params.form : $('#js-verify-form'),
            verifyTipsType = parent.attr('verify-tips-type'),
            result = [];

        verifyTipsType = verifyTipsType ? verifyTipsType : 'afterElement';
        parent.find('.js-form-control').each(function() {
            var _this = $(this);
            $.each(this.attributes, function() {
                if (this.specified) {
                    var componentName = 'verification.' + this.name;
                    if (self.component.hasOwnProperty(componentName)) {
                        var r = self.callComponent({name: componentName}, {
                            target: _this,
                            attrValue: this.value,
                            verifyTipsType: verifyTipsType,
                            verifyResult: params,
                            form: parent
                        });
                        result.push(r);
                        if (!r) {
                            return false;
                        }
                    }
                }
            });
        });

        var resultLen = result.length;
        if (resultLen === 0) {
            return true;
        } else {
            for (var i = 0; i < resultLen; i++) {
                if (!result[i]) {
                    return false;
                }
            }
        }
        return true;
    };
});