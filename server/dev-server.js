import {APP_DEV_SERVER_PORT, WEBPACK_SERVER_PORT} from './config.js';
import {createProxyServer} from 'http-proxy';
import {createServer} from 'http';
import express from 'express';
import {resolve} from 'path';
import sendHtml from './send-html.js';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import webpackDevConfig from './webpack-dev.config.js';

const proxyServer = createProxyServer({
    changeOrigin: true,
    target: `http://localhost:${WEBPACK_SERVER_PORT}`,
    ws: true
});

proxyServer.on('error', function () {});

const webpackServer = new WebpackDevServer(webpack(webpackDevConfig), {
    publicPath: '/scripts/',
    stats: {colors: true}
});

webpackServer.listen(WEBPACK_SERVER_PORT, 'localhost', function () {
    console.log(`Webpack server is running on port ${WEBPACK_SERVER_PORT}.`);
});

const app = express();

app.all('/scripts/*', proxyServer.web.bind(proxyServer));
app.all('/socket.io/*', proxyServer.web.bind(proxyServer));

app.use(express.static(resolve(__dirname, '../public/')));

app.get('/', sendHtml);

const appServer = createServer(app);

appServer.on('upgrade', proxyServer.ws.bind(proxyServer));

appServer.listen(APP_DEV_SERVER_PORT, function () {
    console.log(`Application server is running on port ${APP_DEV_SERVER_PORT}.`);
});
