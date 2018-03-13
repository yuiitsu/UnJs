/**
 * WmJs
 * 
 * author: onlyfu
 * update: 2015-08-24
 */

// WmJs
var Server = require('./wmjs/server');

// Config
var Config = require('./config');

// route
var Route = require('./wmjs/route');

Server.run(Config, Route);