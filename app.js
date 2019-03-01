/**
 * UnJs
 * author: onlyfu
 * update: 2015-08-24
 */
const Server = require('./server/server'),
    Config = require('./config'),
    Route = require('./server/route');

Server.run(Config, Route);