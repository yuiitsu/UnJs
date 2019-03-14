/**
 *
 * @type {module:http}
 */
const Http = require('http');
const Fs = require('fs');

const UnJs = require('./unjs');
const Builder = require('./builder');


const Server = {
    // 版本
    version: 'dev',
    // scripts
    scripts: [],
    // html
    html: [],
    // style
    style: [],
    viewFileList: [],

    /**
     * 启动服务
     */
    server: function (port, config, route, params) {
        let lisPort = !port ? 3001 : port;

        Http.createServer(function (req, res) {
            let u = new UnJs();
            u.setConfig(config);
            u.setRoute(route);
            u.setApiHost(params['apiHost']);
            u.setRequest(req);
            u.setResponse(res);
            u.setDevelop(params['develop']);
            u.setTemplateDir(params['templateDir']);
            u.route();

        }).listen(lisPort);

        console.log('HTTP server is listening at port %s', lisPort);
    },

    /**
     * 运行
     */
    run: function (paraConfig, route) {

        let argv = process.argv,
            argvLen = argv.length;

        if (argvLen < 2) {
            console.error('create server failed, params error');
            return false;
        }

        let port = 3000,
            buildType = false,
            buildHost = '',
            apiHost = '',
            develop = false,
            secDomain = false;

        for (let i = 0; i < argvLen; i++) {
            switch (argv[i]) {
                case '-p':
                    port = argv[i + 1];
                    break;
                case '-b':
                    buildType = true;
                    buildHost = argv[i + 1];
                    break;
                case '-h':
                    apiHost = argv[i + 1];
                    break;
                case '-v':
                    this.version = argv[i + 1];
                    break;
                case '-d':
                    develop = true;
                    break;
                case '-sd':
                    secDomain = true;
                    break;
            }
        }

        // // 获取配置文件
        // try {
        //     let shopConfig = JSON.parse(Fs.readFileSync(paraConfig.configFile).toString());
        //     apiHost = shopConfig['host'];
        // } catch (e) {
        //     console.log(e);
        // }

        if (buildType) {
            Builder.build(buildHost, paraConfig);
        } else {
            apiHost = !apiHost ? 'localhost:9000' : apiHost;
            this.server(port, paraConfig, route, {
                // 'apiHost': apiHost,
                'develop': develop,
                'templateDir': develop ? paraConfig['devDir'] : paraConfig['build']['distDir']
            });
        }
    }
};

module.exports = Server;
