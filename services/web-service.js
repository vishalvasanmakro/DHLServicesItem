const express = require('express');
const http = require('http');
const serverConfig = require('../config/web-server');
const database = require('./database');
const logger = require('../logger/logger');
const itemRouter = require('../routes/v1/inbound/itemMaster');
let httpServer;

function initialize(){
    try{
    const app = express();
    httpServer = http.createServer(app);

    app.use('/DHLServices-item/',itemRouter);

    app.get('/', async (req, res) => {
        
        res.send('Hello !!');
   
      });


	       app.get('/TestAPI', async (req, res) => {

        res.send('7000 Connected :) !!');

      });

      httpServer.listen(serverConfig.port, () => logger.info(`Listening on port ${serverConfig.port}!`));
    }
    catch(err){
      logger.error('Exception while initializing the server');
      throw err;
    }
}
module.exports.initialize = initialize;


//close the server
async function close() {
     await httpServer.close();
     logger.info('httpServer closed')
     process.exit(1);
}
  
  module.exports.close = close;
