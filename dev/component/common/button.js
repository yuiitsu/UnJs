/**
 * button 组件
 */
Component.extend('common.button', function () {

    var self = this;

    this.init = function (params, data) {
        setTimeout(function () {
            self._init(params, data);
        });
    };

    this._init = function (params, data) {
        var $el = $(wc.formatStr('button[data-_id={0}]', data.random));
        var bind = data.bind;

        if (!$el.length || bind === undefined) {
            return false;
        }
        this.watchLoading($el, bind);
        this.watchDisabled($el, bind);
    };

    this.watchLoading = function ($el, bind) {
        if (!$el.length || bind === undefined) {
            return false;
        }
        var model = bind.model;
        var name = bind.loading;

        if ( model === undefined || name === undefined) {
            return false;
        }

        var status = wc.getAttr(model, name, false);
        self.loading($el, status);
        Model.watch(model, name, function (value) {
            self.loading($el, value);
        });
    };

    this.watchDisabled = function ($el, bind) {
        if (!$el.length || bind === undefined) {
            return false;
        }
        var model = bind.model;
        var name = bind.disabled;

        if (model === undefined || name === undefined) {
            return false;
        }
        var status = wc.getAttr(model, name, false);
        this.disabled($el, status);
        Model.watch(model, name, function (value) {
            self.disabled($el, value);
        });
    };

    this.loading = function ($el, status) {
        var loadingText = $el.attr('data-loading');
        var text = $el.attr('data-save');
        if (status) {
            $el.attr('data-save', $el.html());
            $el.html(loadingText);
            self.disabled($el, true);
        } else {
            $el.html(text);
            self.disabled($el, false);
        }
    };

    this.disabled = function ($el, status) {
        if (status) {
            $el.attr('disabled', true);
        } else {
            $el.removeAttr('disabled');
        }
    };
});
