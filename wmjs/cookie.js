/**
 * cookie
 */

var Cookie = {

    /**
     * 写cookie
     */
    set: function(unjs, key, val, opt) {

        var pairs = [];
        for (var i in key) {
            pairs.push(key[i] + '=' + val[i]);
        }
        opt = opt || {};
        if(opt.maxAge) 　pairs.push('Max-Age=' + opt.maxAge);
        if(opt.domin) 　pairs.push('Domin=' + opt.domin);
        if(opt.path) 　pairs.push('Path=' + opt.path);
        if(opt.expires) 　pairs.push('Expires=' + opt.expires.toUTCString());
        if(opt.httpOnly) 　pairs.push('HttpOnly');
        if(opt.secure) 　pairs.push('Secure');
    
        unjs.response.setHeader('Set-Cookie', pairs.join(';'));
    },

    /**
     * 读cookie
     */
    get: function(unjs, key) {

        var cookie = unjs.request.headers.cookie;
        if (cookie == undefined) {
        
            return null;
        }

        var cookies ={};
        if (!cookie) {
            return cookies;
        }

        var list = cookie.split(';');
        for( var i=0;i<list.length;i++){
            var pair = list[i].split('=');
            cookies[pair[0].trim()] = pair[1];
        }
    
        return cookies[key];
    }
};

module.exports = Cookie;
