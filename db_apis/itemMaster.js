
const database = require('../services/database');
const logger = require('../logger/logger');
const oracledb = require('oracledb');
const config = require('../config/queries');

async function getItems(items) {
	try {
    		logger.info('calling getItems db apis');
		const query = config.queries.itemMaster;

		const bind = {
		          items: { dir: oracledb.BIND_IN, val: items, type: oracledb.STRING },
		        }
		const result = await database.getQuery(query, bind);
		return result != undefined ? result.rows == null ? "" : result.rows : "";
	    }
	catch (err) {
	      logger.error('Exception occured in getItems dbapi');
              throw err;
	}
}
module.exports.getItems = getItems;
