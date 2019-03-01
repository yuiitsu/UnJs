/**
 * Created by onlyfu on 2017/5/9.
 */

var Login = function(unjs){
    unjs.getTheme('login', '登录', function(result) {
        var _data = '';
        for (var i in result.data.theme) {
            if (i === 'setting_content') {
                _data = result.data.theme[i];
            }
        }
        //unjs.display('index', result.data._page);
        var data = result.data._page;
        data['title'] = '登录';
        data['_data'] = _data;
        unjs.display('index', data);
    });
};
module.exports = Login;
