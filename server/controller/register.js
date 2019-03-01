/**
 * Created by onlyfu on 2017/5/9.
 */

var Register = function(unjs){
    unjs.getTheme('register', '注册', function(result) {
        var _data = '';
        for (var i in result.data.theme) {
            if (i === 'setting_content') {
                _data = result.data.theme[i];
            }
        }
        //unjs.display('index', result.data._page);
        var data = result.data._page;
        data['title'] = '注册';
        data['_data'] = _data;
        unjs.display('index', data);
    });
};
module.exports = Register;
