/**
 * 系统管理
 */
Controller.extend('sys', function () {

    var self = this;
    //
    this.bind = {
    };

    /**
     * 系统维护
     */
    this.maintain = function() {
        this.output('maintain');
    };

    this._event = {
    };
});