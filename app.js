
/**
 * UnJs
 * 
 * author: onlyfu
 * update: 2015-08-24
 */

// UnJs
var Server = require('./unjs/unjs');

// Config
var Config = require('./conf/config');

// route
var Route = require('./conf/route');

Server.run(Config, Route);

