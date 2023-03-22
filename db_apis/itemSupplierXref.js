const database = require('../services/database');
const logger = require('../logger/logger');
const oracledb = require('oracledb');
const config = require('../config/queries');

async function getItemXref(itemName) {
  try {
    //itemName.toString()
	logger.info('Calling getItemXrefDB');
	    const query = config.queries.itemSupplierXref;
	      
	      const bind = {
		            itemName: { dir: oracledb.BIND_IN, val: itemName, type: oracledb.STRING }
		          }

	      const result = await database.getQuery(query,bind);
	      //logger.info('Result getItemXref', result.rows);
	  return result != undefined ? result.rows == null ? "" : result.rows : "";

  }
  catch (err) {
    logger.error('Exception occured in getItemXref dbapis');
    throw err;
  }
}

module.exports.getItemXref = getItemXref;
