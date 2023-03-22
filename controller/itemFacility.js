const itemFacilityDB = require('../db_apis/itemFacility');
const logger = require('../logger/logger');

async function getItemFacilityData(item) {
	try{
	const result = await itemFacilityDB.getItemFacility(item);
	let itemFacility = [];
	if (result != undefined) {
		for (key in result) {
			let {LOC, LPNPerTier, TierPerPallet, MiscAlpha1, MiscAlpha2, MiscAlpha3, MarkForDeletion} = result[key];
			itemFacility.push({
				"FacilityName": LOC == null ? "" : LOC.toString(),
				"LPNPerTier": LPNPerTier == null ? "1" : LPNPerTier.toString(),
				"TierPerPallet": TierPerPallet == null ? "1" : TierPerPallet.toString(),
				"MiscAlpha1": MiscAlpha1 == null ? "" : MiscAlpha1.toString(),
				"MiscAlpha2": MiscAlpha2 == null ? "" : MiscAlpha2.toString(),
				"MiscAlpha3": MiscAlpha3 == null ? "" : MiscAlpha3.toString(),
				"MarkForDeletion": MarkForDeletion == null ? "" : MarkForDeletion.toString()
			})
		}
					if (itemFacility.length === 0) {
							//			console.log("Empty itemFacility");
										itemFacility.push({
																"FacilityName": "",
																"LPNPerTier": "",
																"TierPerPallet": "",
																"MiscAlpha1": "",
																"MiscAlpha2": "",
																"MiscAlpha3": "",
																"MarkForDeletion": ""
															})


									}
		return itemFacility;
	}
	else {
		itemFacility.push({
	        	            "FacilityName": "",
		                    "LPNPerTier": "",
	                            "TierPerPallet": "",
	                            "MiscAlpha1": "",
	                            "MiscAlpha2": "",
	                            "MiscAlpha3": "",
	                	    "MarkForDeletion": ""
	                         })

		return itemFacility;
	}
}
catch(err){
	logger.error('Exception in getItemFacility');
	throw err
}
}

module.exports.getItemFacilityData = getItemFacilityData;
