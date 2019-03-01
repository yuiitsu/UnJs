/**
 * 首页控制器
 */

var Index = function(unjs){

    // unjs.getThemePage('shelf', function(result) {
    //     var data = result.data._page;
    //     try {
    //         data['_data'] = result.data.theme.comp_list;
    //     } catch (e) {
    //         data['_data'] = null;
    //     }
    //     unjs.display('index', data);
    // });
    unjs.display('index', {});
};

module.exports = Index;
