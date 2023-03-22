const oracledb = require('oracledb');
//replace the libdir to point local instaclient downloaded in ur machine
//oracledb.initOracleClient({ libDir: 'D:\\instantclient_19_11' })
const webServer = require('./services/web-service');
const database = require('./services/database');
const serverConfig = require('./config/web-server');
const logger = require('./logger/logger');
const dbinitpath = require('./oracleinitpath');
dbinitpath.oracleinitpath();
//check whether port is passed or not. Program won't execute if port is not passed
try {
  if (serverConfig.port != undefined) {
    startup();
  }
  else {
    throw 'Port is not Configured!!';
  }
}
catch (err) {
  logger.error(`Exception in startup ${err}`);
}


async function startup() {
  logger.info('Starting application');

  //code to initialize database
  try {
    logger.info('Initializing database');
    await database.initDB();
  }
  catch (err) {
    logger.error('Database init error!', err);
    process.exit(1);
  }
  //code to initialize webserver
  try {
    logger.info('Initializing web server module');

    await webServer.initialize();
  } catch (err) {
    logger.error('ERROR:', err);
    process.exit(1);
  }
}

//DB and httpserver shutdown in case of exception and exit
async function serverShutdown(err) {

  try {
    logger.info('Closing DB!');
    await database.closeDB();
  }
  catch (err) {
    logger.error('Error closing DB!!', err);
    process.exit(1);
  }

  try {
    logger.info('Closing web server!');
    await webServer.close();
  }
  catch (err) {
    logger.error('Error stoping the server!!', err);
    process.exit(1);
  };
}
module.exports.serverShutdown = serverShutdown;

//close the server when ctrl+c or other signal received
process
  .once('SIGTERM', () => {
    logger.info('Received sigterm');
    serverShutdown();
  });
process.once('SIGINT', () => {
  logger.info('Received SIGINT');
  serverShutdown()
});
process.once('uncaughtException', err => {
  logger.info('uncaughtException',err);
  serverShutdown(err);
})
