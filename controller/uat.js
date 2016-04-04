/**
 * uat
 */

var http = require('http');
var querystring = require('querystring');

var Uat = function(unjs){



    var request = function(url) {
        console.log(url);
        var reqParams = {
            hostname: 'uat.wemart.cn',
            //hostname: 'localhost',
            //port: 8080,
            //path: url + '?para=' + para,
            path: url,
            method: method,
            headers: {
                'user-agent':'unjs server'
            }
        };

        var body = '';
        var req = http.request(reqParams, function (response) {

            console.log(response.headers);
            response.on('data', function (d) {
                body += d;
            }).on('end', function () {

                console.log(body);
                unjs.end(body);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ${e.message}');
            unjs.end('request error');
        });

        //req.write(postData);
        req.end();
    };

    var url = unjs.request.url;
    var method = unjs.request.method;

    if (method == 'GET') {
        var para = unjs._get('para');
        request(url);
    }

    if (method == 'POST') {
        unjs._post(function (data) {

            request(url + '?para=' + data.para);
        });
    }
};

module.exports = Uat;