/**
 *  Tooltip Component
 */
Component.extend('tooltip', function() {

    let self = this,
        code = '';

    this.bind = {
        init: function(params) {
            //
            code = params['id'];
            //
            var target = params.target,
                targetPosition = target.offset(),
                targetLeft = targetPosition.left,
                targetTop = targetPosition.top,
                targetOuterWidth = target.outerWidth(),
                targetOuterHeight = target.outerHeight(),
                screenWidth = self.getScreen('clientWidth'),
                screenHeight = self.getScreen('clientHeight'),
                tooltip = $('#component-tooltip-' + code),
                arrow = tooltip.find('.component-tooltip-arrow'),
                tooltipOuterWidth = tooltip.outerWidth(),
                tooltipOuterHeight = tooltip.outerHeight(),
                tooltipLeft = targetLeft,
                tooltipTop = 0,
                arrowLeft = 0,
                arrowTop = 0;

            // 计算显示位置
            if (tooltipOuterWidth + targetLeft > screenWidth) {
                // 超出屏幕右侧
                tooltipLeft = targetLeft + targetOuterWidth - tooltipOuterWidth;
                //
                arrowLeft = targetLeft + targetOuterWidth / 2 - tooltipLeft - 6;
            }
            //
            $('.component-tooltip').css({
                left: tooltipLeft,
                top: targetTop + targetOuterHeight + 8
            });

            if (arrowLeft > 0) {
                arrow.css({
                    left: arrowLeft
                });
            }
        },
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
        // var target = params.target,
        //     targetPosition = target.offset(),
        //     targetLeft = targetPosition.left,
        //     targetTop = targetPosition.top,
        //     targetOuterHeight = target.outerHeight(),
        //     content = params.content ? params.content : '';
        // //
        // code = parseInt(Math.random() * 100000).toString();
        // $('body').append(self.getView('component.tooltip.view', {
        //     code: code,
        //     content: content
        // }));
        // //
        // $('.component-tooltip').css({left: targetLeft, top: targetTop + targetOuterHeight + 8});
    };
});