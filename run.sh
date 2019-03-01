#!/bin/sh

if [ "$1" = "stop" ] ; then
    #kill -QUIT `cat $DATA_VAR_DIR/gunicorn.pid`
    /apps/nodejs/bin/pm2 stop ./app.js

elif [ "$1" = "restart" ]; then
    #kill -HUP `cat $DATA_VAR_DIR/gunicorn.pid`
    /apps/nodejs/bin/pm2 restart ./app.js

elif [ "$1" = "start" ]; then
    # $BASE_DIR/sbin/nginx $OPTIONS
    /apps/nodejs/bin/pm2 start ./app.js -i 2

elif [ "$1" = "-b" ]; then
    /apps/nodejs/bin/node ./app.js -b

else
    echo "usage: $0 start|stop|restart|-b"
fi