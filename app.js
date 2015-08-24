/**
 * UnJs
 * 
 * author: onlyfu
 * update: 2015-08-24
 */

// UnJs
var UnJs = require('./unjs/unjs');

// Config
var Config = require('./conf/config');

// route
var Route = require('./conf/route');

var u = new UnJs();

u.setConfig(Config);
u.setRoute(Route);

u.run();

