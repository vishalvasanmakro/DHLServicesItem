const itemPackageDB = require('../db_apis/itemPackage');


async function getItemPackageData(item, MiscAlpha2) {
	const result = await itemPackageDB.getItemPackage(item, MiscAlpha2);
	let itemPackage = [];
	if (result != undefined) {
		for (key in result) {
			let { Weight, Quantity, UnitLength, UnitHeight, UnitWidth, IsStandard } = result[key];
			itemPackage.push({
				"Weight": Weight == null ? "" : Weight.toString(),
				"Quantity": Quantity == null ? "" : Quantity.toString(),
				"UnitVolume": "1",
				"UnitLength": UnitLength == null ? "" : UnitLength.toString(),
				"UnitHeight": UnitHeight == null ? "" : UnitHeight.toString(),
				"UnitWidth": UnitWidth == null ? "" : UnitWidth.toString(),
				"IsStandard": IsStandard == null ? "" : IsStandard.toString()
			})
		}
		if(itemPackage.length === 0){
						console.log('no data returned');
						itemPackage.push({
										"Weight": "1",
											"Quantity": "1",
											"UnitVolume": "1",
											"UnitLength": "1",
											"UnitHeight": "1",
											"UnitWidth": "1",
											"IsStandard": "1"
										})
					}
		return itemPackage;
	}
	else {
		itemPackage.push({
			                                                                                "Weight": "1",
			                                                                                        "Quantity": "1",
			                                                                                        "UnitVolume": "1",
			                                                                                        "UnitLength": "1",
			                                                                                        "UnitHeight": "1",
			                                                                                        "UnitWidth": "1",
			                                                                                        "IsStandard": "1"
			                                                                                })

		return itemPackage;
	}
}
module.exports.getItemPackageData = getItemPackageData;
