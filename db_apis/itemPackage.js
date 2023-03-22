const database =  require('../services/database');
const logger = require('../logger/logger');
const oracledb = require('oracledb');
const config = require('../config/queries');

async function getItemPackage(itemName,supplierField){
  try{
	      logger.info('calling getItemPackage apis');
	   
	      const query = config.queries.itemPackage;
	      
	      const bind = {
		            itemName: { dir: oracledb.BIND_IN, val: itemName, type: oracledb.STRING },
		            supplierField : { dir: oracledb.BIND_IN, val: supplierField, type: oracledb.STRING }
		          }

	      const result = await database.getQuery(query,bind);

	      return result != undefined ? result.rows == null ? "" : result.rows : "";
  }
  catch (err) {
    logger.error('Exception occured in getItemPackage dbapi');
    throw err;
  }
}

module.exports.getItemPackage = getItemPackage;
