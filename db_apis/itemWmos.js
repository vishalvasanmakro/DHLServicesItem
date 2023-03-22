const database =  require('../services/database');
const logger = require('../logger/logger');
const oracledb = require('oracledb');
const config = require('../config/queries');

async function getItemWmos(itemName){
  try{
	logger.info('calling getItemWmos db apis');
	      const query = config.queries.itemWmos;

	      const bind = {
		            itemName: { dir: oracledb.BIND_IN, val: itemName, type: oracledb.STRING }
		          }

	      const result = await database.getQuery(query, bind);

	      console.log('Result getItemWmos',result.rows);
	      return result != undefined ? result.rows == null ? "" : result.rows : "";

  }
  catch (err) {
    logger.error(`Exception occured in getItemWmos dbapis: ${err}`);
    throw err;
  }
}

module.exports.getItemWmos = getItemWmos;
