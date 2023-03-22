const database = require('../services/database');
const logger = require('../logger/logger');
const config = require('../config/queries');
const oracledb = require('oracledb');

async function getItemFacility(itemName) {
  try {
        logger.info('Calling getItemFacility dbapis');

	    const query = config.queries.itemFacility;

	    const bind = {
	     itemName: { dir: oracledb.BIND_IN, val: itemName, type: oracledb.STRING }
	     }
	     const result = await database.getQuery(query, bind);

	         // logger.info('Result',result.rows);
		return result != undefined ? result.rows == null ? "" : result.rows : "";
  }
  catch (err) {
    logger.error('Exception occured in getItemFacility dbapis');
    throw err;
  }
}

module.exports.getItemFacility = getItemFacility;
