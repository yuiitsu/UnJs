/**
 * Login
 * 登录
 */
Controller.extend('login', function () {

    var self = this;
    //
    this.bind = {
        '#js-login click': '_login'
    };

    this.index = function() {
        this.output('view', {}, $('#app'));
    };

    this._login = function(e) {
        // this.jump('index', 'index', {});
        if (this.callComponent({name: 'verification'})) {
            this._post({
                url: '/api/v1/user/auth/login',
                data: {
                    userName: $.trim($('#js-login-username').val()),
                    passWord: $.trim($('#js-login-password').val())
                },
                loading: this.$(e)
            }, function(res) {
                if (res.state === 0) {
                    localStorage.setItem('userId', res.data.userId);
                    localStorage.setItem('token', res.data.token);
                    self.jump('index', 'index', {});
                }
            });
        }
    }
});