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
            targetOuterHeight = target.outerHeight();
        console.log(targetLeft, targetTop, targetOuterHeight);
        //
        $('body').append(this.vc('tooltip.view', {
            content: 'Content'
        }));
        //
        $('.component-tooltip').css({left: targetLeft, top: targetTop + targetOuterHeight});
    };
});