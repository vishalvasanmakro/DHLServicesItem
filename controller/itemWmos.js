const logger = require('../logger/logger');
const itemWomsDB = require('../db_apis/itemWmos');


async function getItemWmosData(item) {
	try{
    const result = await itemWomsDB.getItemWmos(item);

    let itemWmos = [];
    if (result != undefined) {
        for (key in result) {
            let { PkgType, ProdSubGrp, ProdLine, SaleGrp, AvgDlyDmnd, ConsPrtyDateCode, XpireDateReqd, MerchType, MerchGroup, SplInstrCode1, oc, SplInstr1, SplInstr2, MinRecvToExpireDays } = result[key];
            itemWmos.push({

                "PkgType": PkgType == null ? "" : PkgType.toString(),
                "ProdSubGrp": ProdSubGrp == null ? "" : ProdSubGrp.toString(),
                "ProdLine": ProdLine == null ? "" : ProdLine.toString(),
                "SaleGrp": SaleGrp == null ? "" : SaleGrp.toString(),
                "AvgDlyDmnd": AvgDlyDmnd == null ? "" : AvgDlyDmnd.toString(),
                "ConsPrtyDateCode": ConsPrtyDateCode == null ? "" : ConsPrtyDateCode.toString(),
                "XpireDateReqd": XpireDateReqd == null ? "" : XpireDateReqd.toString(),
                "MerchType": MerchType == null ? "" : MerchType.toString(),
                "MerchGroup": MerchGroup == null ? "" : MerchGroup.toString(),
                "SplInstrCode1": SplInstrCode1 == null ? "" : SplInstrCode1.toString(),
                "SplInstr1": SplInstr1 == null ? "" : SplInstr1.substr(0, 10).toString(),
                "SplInstr2": SplInstr2 == null ? "" : SplInstr2.substr(0, 10).toString(),
                "MinRecvToExpireDays": MinRecvToExpireDays == null ? "" : MinRecvToExpireDays.toString()
            })
        }
	            if(itemWmos.length === 0){
			                itemWmos.push({

						                "PkgType": "",
						                "ProdSubGrp": "",
						                "ProdLine": "",
						                "SaleGrp": "",
						                "AvgDlyDmnd": "",
						                "ConsPrtyDateCode": "",
						                "XpireDateReqd": "",
						                "MerchType": "",
						                "MerchGroup":"",
						                "SplInstrCode1": "",
						                "SplInstr1":"",
						                "SplInstr2": "",
						                "MinRecvToExpireDays": ""
						            })
			            }
        return itemWmos
    } else {
		itemWmos.push({

			                                                                "PkgType": "",
			                                                                "ProdSubGrp": "",
			                                                                "ProdLine": "",
			                                                                "SaleGrp": "",
			                                                                "AvgDlyDmnd": "",
			                                                                "ConsPrtyDateCode": "",
			                                                                "XpireDateReqd": "",
			                                                                "MerchType": "",
			                                                                "MerchGroup":"",
			                                                                "SplInstrCode1": "",
			                                                                "SplInstr1":"",
			                                                                "SplInstr2": "",
			                                                                "MinRecvToExpireDays": ""
			                                                            })

        return itemWmos;
    }
}
catch(err){
	logger.error("Exception in getItemWmosData");
	throw err;
	}
}
module.exports.getItemWmosData = getItemWmosData;
