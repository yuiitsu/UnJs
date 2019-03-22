/**
 * Main Page
 */
Controller.extend('index', function () {

    this.bind = {
        'button click': '_event'
    };

    this.index = function() {
        this.output('view');
    };

    this._event = function(e) {
        this.$(e).attr('disabled', true);
        this.renderComponent('basic.spinner.view').to(this.$(e));
        this.renderComponent('toast.view', {title: 'Title', body: 'Body'}).appendTo($('body'));
        this.renderComponent('modal.view').appendTo($('body'));
    };
});
