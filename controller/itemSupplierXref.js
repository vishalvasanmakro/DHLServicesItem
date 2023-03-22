const itemSupXrefDB = require('../db_apis/itemSupplierXref');
const logger = require('../logger/logger');

async function getItemXrefData(item) {
try{
    const result = await itemSupXrefDB.getItemXref(item);
	let itemXref = [];
	if (result != undefined) {
  	  for (key in result) {
     			   let { SUPPLIERITEMBARCODE, ScanQnty, ITEMBARCODE } = result[key];
     				   itemXref.push({
       					     "SupplierItemBarcode": SUPPLIERITEMBARCODE == null ? "" : SUPPLIERITEMBARCODE,
       					     "ScanQnty": ScanQnty == null ? "" : ScanQnty.toString(),
        				    "ItemBarCode": ITEMBARCODE == null ? "" : ITEMBARCODE.toString()
      						  })
    					}
	 		if(itemXref.length === 0)
		            {
	                    itemXref.push({
		                        "SupplierItemBarcode":  "",
		                        "ScanQnty": "",
		                        "ItemBarCode": ""
		                    })
	                }
    	//logger.info('itemXref', itemXref);
    	return itemXref;
	}else
	{
		itemXref.push({
			                                        "SupplierItemBarcode":  "",
			                                        "ScanQnty": "",
			                                        "ItemBarCode": ""
			                                    });
		return itemXref;

	}

    }
catch (err) {
            logger.error('Exception in getItemXrefData');
            throw err;
        }
}
module.exports.getItemXrefData = getItemXrefData;
