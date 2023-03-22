const oracledb = require('oracledb');
const dbConf = require('../config/database');
const logger = require('../logger/logger');
const connIdentifiers = require('../config/connectionId');

async function init(){
    const connPool = await oracledb.createPool(dbConf.hrPool);
   // logger.info('connection pool created')
	logger.info('connPool',connPool)
let conn;
	    logger.info("asdasd");
	    logger.info(dbConf.hrPool.poolAlias);
	    conn = await oracledb.getConnection(dbConf.hrPool.poolAlias);
	    conn.clientId = 'rajesh';
	        conn.clientInfo = 'clientInfo';
	        conn.module = 'dhlservice';
	        conn.action ='itemaction';
	        await conn.execute("select 1 from dual",[],[]);
	 logger.info('connPool1',connPool)
	    logger.info('connection pool created')

}

module.exports.initDB= init;

async function close(){
  await oracledb.getPool(dbConf.hrPool.poolAlias).close();
	logger.info('conn pool closed');
}

module.exports.closeDB = close;

async function getQuery(statement, binds = [], opts = {}) {
      let conn;
      try {
        conn = await oracledb.getConnection(dbConf.hrPool.poolAlias);
	//connection ids
	conn.clientId = connIdentifiers['clientId'];
        conn.clientInfo = connIdentifiers['clientInfo'];
        conn.module = connIdentifiers['module'];
	conn.action = connIdentifiers['action'];
	
        opts.outFormat = oracledb.OBJECT;
        opts.autoCommit = false;
	      logger.info('query to be executed %s', statement);
        const result = await conn.execute(statement, binds, opts);
        logger.info('query result',{result})
        return result;
      } catch (err) {
	      logger.error("err",err);
        throw err
      } finally {
        if (conn) { // closing connection after execute
          try {
            logger.info('Closing connection!');
            await conn.close();
          } catch (err) {
            logger.error(err);
          }
        }
      }
  }
  
  module.exports.getQuery = getQuery;
