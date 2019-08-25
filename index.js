const startServer = require('./src/server');
const { httpPort, httpsPort } = require('./config');

startServer(httpPort, httpsPort);