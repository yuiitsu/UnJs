/**
 * Error Controller
 */
Controller.extend('error', function () {

    this.index = function(params) {
        this.display('core.error.view', params, $('body'));
    }
});
