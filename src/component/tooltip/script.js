/**
 *  Tooltip Component
 */
Component.extend('tooltip', function() {

    let self = this,
        code = '';

    this.bind = {
        close: function() {
            $('body').on('click', function(e) {
                var target = $('#component-tooltip-' + code);
                if (e.target !== target && target.has(e.target).length === 0) {
                    target.remove();
                }
            });
        }
    };

    /**
     * 初始化
     */
    this.init = function(params) {
        var target = params.target,
            targetPosition = target.offset(),
            targetLeft = targetPosition.left,
            targetTop = targetPosition.top,
            targetOuterHeight = target.outerHeight(),
            content = params.content ? params.content : '';
        //
        code = parseInt(Math.random() * 100000);
        $('body').append(self.getView('component.tooltip.view', {
            code: code,
            content: content
        }));
        //
        $('.component-tooltip').css({left: targetLeft, top: targetTop + targetOuterHeight + 8});
    };
});