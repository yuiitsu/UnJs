/**
 *  Tooltip Component
 */
Component.extend('tooltip', function() {

    let self = this;

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
        $('body').append(self.getView('component.tooltip.view', {
            content: content
        }));
        //
        $('.component-tooltip').css({left: targetLeft, top: targetTop + targetOuterHeight + 8});
    };
});