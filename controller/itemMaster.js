const itemMasterDB = require('../db_apis/itemMaster');
const itmFacltyCtrl = require('../controller/itemFacility');
const itmPackCtrl = require('../controller/itemPackage');
const itmSuppXrefCtrl = require('../controller/itemSupplierXref');
const itmWmosCtrl = require('../controller/itemWmos');
const closeServer = require('../index');
const logger = require('../logger/logger');
const fetch = require('node-fetch');
const base64= require('base-64');
const fsPromises = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const serverConfig = require('../config/web-server');
const FormData = require('form-data');
const dateFormat = require('dateformat');
const timestamp = dateFormat(new Date(), "yyyy-mm-dd, h:MM:ss TT");

// main controller handles the queryparams and stores the generated data to either to file or calls logging api

async function get(req, res) {
	try {
		logger.info('ItemMaster get called');
		
		const items= req.query.items;
	        let statusCode = req.query.status;
		//let isTest = "no"; 
		let isTest = req.query.test == null ? '' : req.query.test.toString().toLowerCase().trim();
	        if(statusCode === undefined || statusCode === 'insert' || statusCode ===''){
	              statusCode = 'create';
	         }
	        logger.info(`Params:${items}, status:${statusCode}`);

		const data = await getData(items);

		if (data.length !== 0){
		//replacing the input string with _
		let name = items.replace(/,/g,'_');
		logger.info(`file name:${name}`);

		// using random identifier for each items
		const uuid = uuidv4()+`-item-[${items}]`;
		logger.info(`UUID generated: ${uuid}`);
		const header = {
			"StatusCode": statusCode,
			"Batch_ID": "",
			"Batch_Size": "",
			"Reference_ID": uuid
		}
		const result = {
			Header: header,
			data: data
		}
//		logger.info('Data to DHL',{result});
		//writing the final result to local file
//		await fsPromises.writeFile(`/home/admin/json_outputs/item_${name}_Result.txt`, JSON.stringify(result));
		//calls logging API
		await logMessage(JSON.stringify(result), items,uuid);

			if(isTest === 'yes'){
				res.json(result);
			}else{

			const resData = await sendData(result);
		//logs the response returned by fetch 
			if(resData !== undefined){
				await logResponse(resData,items,uuid);

				res.status(200).send(JSON.stringify(resData));
				//await logResponse(resData,items,uuid);

			}else{
				logger.info('No data returnd');
			}
			}
			//res.status(200).send(JSON.stringify(resData));
		}
		else{
		
			 response = {
				    "success": false,
				    "timestamp": timestamp,
				    "Message": "No data fetched from database",
				    "error": 'no data'
				    }
			        logger.info('No data returned');
			        res.status(204).send(JSON.stringify(response));

		}
	}
		catch (err) {
			response = {
				     "success": false,
				     "timestamp": timestamp,
				     "Message": "Exception Occured",
				     "error": `${err}`
				   }
				logger.error('Exception in itemMaster controller', err);
				res.status(500).send(JSON.stringify(response));
			//		await closeServer.serverShutdown(err);
			}


}

//sending data to DHL

async function sendData(data,items,uuid){

	let response = '';
	 await fetch('http://10.81.224.134:5555/invoke/RouterOperations/receiveJSONDocument?originId=Host&origCompany=Makro&originFormat=JSON&msgType=item&jsonFormat=stream', {
	
//	await fetch('https://10.81.224.134:7777/invoke/RouterOperations/receiveJSONDocument?originId=Host&origCompany=Makro&originFormat=JSON&msgType=item&jsonFormat=stream', {
								method: 'post',
		                                                body:    JSON.stringify(data),
		                                                headers: { 'Content-Type': 'application/json',
										                                                                                                                             'Authorization': 'Basic '+ base64.encode('Makro:Makro@2021'),  },
		                                                 })
	                                                .then(res => res.json())
	                                                .then(json => {logger.info(`json from dhl:{json}`);
		                                        console.log('msg tran_id',(json.TranLogId));
		                                       // logResponse(json,items,uuid);
		                                        console.log('@@@@');
							response = json;
		                                        //res.send(json)
							})
	                                                .catch(err => logger.error('posting to dhl error',err));


	return response;
}


//calls the logging API to store the json data which is sent to DHL
async function logMessage(data,items,uuid){
	logger.info('logMessage!');
	let apiResponse = '';
	let form = new FormData();
	let status = '';
	form.append('source_system','ItemSource');
	form.append('application' ,'DHLItem');
	form.append('function_name' ,'ItemMaster');
	form.append('method' ,'POST');
	form.append('url', 'http://10.81.224.134:5555/invoke/RouterOperations/receiveJSONDocument?originId=Host&origCompany=Makro&originFormat=JSON&msgType=item&jsonFormat=stream');
	form.append('request_header' ,'Content-Type: application/json');
	form.append('request_payload' ,data);
	form.append('req_id' , `${uuid}`);
	form.append('business_id' , `${items}`); 
	form.append('port' , `${serverConfig.port}`);
	form.append('node' ,'1');
	form.append('machine' ,'dhlwmos');
	//	http://10.82.241.114:7203/MakroWMOSLogging/v1/log/insert
	await fetch('http://localhost:9000/DHLServices-Logging/v1/insert',{
	                                                     method: 'post',
	                                                        body: form
	                                                        //headers: { 'Content-Type': 'application/x-www-form-urlencoded'  
	
	                                                })
	                                                .then(res => res.json())
	                                                .then(json => {
						//		logger.info('api res',{json});
						//		logger.info('success',json.success);
								status = json.success;
								apiResponse= json;})
	                                                .catch(err => console.log('error logging msg',err));


	logger.info('Logger API response',{apiResponse});
	logger.info('resstatus',{status});
	if(status){
	logger.info('log inserted to logging api');
	}else
	{
		logger.info('log not inerted correctly');
	}


}


//logging the response returned by the fetch

async function logResponse(data,item,uuid){
        logger.info('logResponseMessage!');
	logger.info('item',item , 'uuid', uuid , 'tran_id',data.TranLogId, 's_code',data.RESULT_CODE);

		let msg = JSON.stringify(data);
		let s_code = data.RESULT_CODE === '25' ? 'S' : 'F' ; 
		let apiResponse = '';
	        let form = new FormData();
	        let status = '';
		let res_code = data.RESULT_CODE_DESC == null ? '' : data.RESULT_CODE_DESC;
		let b_id = item + '-' + data.TranLogId;
		logger.info(s_code);
	       // form.append('method' ,'POST');
	     //   form.append('url', 'http://10.81.224.134:5555/invoke/RouterOperations/receiveJSONDocument?originId=Host&origCompany=Makro&originFormat=JSON&msgType=item&jsonFormat=stream');
	        form.append('response_header' ,'Content-Type: application/json');
	        form.append('response_message' ,res_code);
	        form.append('req_id' , `${uuid}`);
		form.append('status', s_code);
		form.append('error_message', res_code);
		form.append('response_payload', `${msg}`);
//	        form.append('business_id' , b_id);
//	        form.append('port' , `${serverConfig.port}`);
//	        form.append('node' ,'1');
//	        form.append('machine' ,'10.81.224.134');


	await fetch('http://localhost:9000/DHLServices-Logging/v1/update',{
		                                                             	method: 'post',
										body:form
										})
                                                       .then(res => res.json())
                                                       .then(json => {logger.info('Log inserted:',json.success);
                                                       status = json.success;
                                                       apiResponse= json;})
                                                       .catch(err => logger.error(err));


	logger.info('Logger API response',{apiResponse});
	       
	       
	        if(status){
			        		logger.info('response log inserted to logging api');
			        	   }else{
				      		logger.info('response log not inerted correctly');
				      		}	
}

//calls the itemXref, facility, package and itemWmos function
async function getData(items) {
	try {
		const itemResult = await itemMasterDB.getItems(items);
		

		let data = [];
		if (itemResult != "") {
			for (key in itemResult) {
				let { itemName, BusinessUnit, Description, LongDescription, UnitWeight, UnitVolume, UnitHeight, UnitWidth, UnitLength, SoldOnline, SoldInStores, AvailableForPickupInStore, AvailableForShipToStore, ItemImageFilename, ItemURLPath, ItemBarCode, ReferenceField1, ReferenceField2, ReferenceField6, ReferenceField7, ReferenceField8, ReferenceField9, ReferenceField10, MarkForDeletion } = itemResult[key];
				let item = itemResult[key].itemName;
				const itemXrefResult = await itmSuppXrefCtrl.getItemXrefData(item);
				const itemFacility = await itmFacltyCtrl.getItemFacilityData(item);
				//console.log('itemFacility-->',!itemFacility.length)
				let supplierField="";
				if(!itemFacility.length){
					supplierField =""
				}else
				{
					if (itemFacility[key] !== undefined ) {

					supplierField = itemFacility[key].MiscAlpha2 == "" ? "" : itemFacility[key].MiscAlpha2 == null ? "" :  itemFacility[key].MiscAlpha2}	
					else {
                                        supplierField = "";
                                
					}
                                }     	
				const itemPackage = await itmPackCtrl.getItemPackageData(item,supplierField);
				const itemWmosResult = await itmWmosCtrl.getItemWmosData(item);
				data.push({
					"itemName": itemName == null ? "" : itemName.toString(),
					"BusinessUnit": BusinessUnit == null ? "" : BusinessUnit.toString(),
					"Description": Description == null ? "" : Description.toString(),
					"LongDescription": LongDescription == null ? "" : LongDescription.toString(),
					"UnitWeight": UnitWeight == null ? "1" : UnitWeight.toString(),
					"UnitVolume": UnitVolume == null ? "1" : UnitVolume.toString(),
					"UnitHeight": UnitHeight == null ? "1" : UnitHeight.toString(),
					"UnitWidth": UnitWidth == null ? "1" : UnitWidth.toString(),
					"UnitLength": UnitLength == null ? "1" : UnitLength.toString(),
					"SoldOnline": SoldOnline == null ? "" : SoldOnline.toString(),
					"SoldInStores": SoldInStores == null ? "" : itemResult.SoldInStore.toString(),
					"AvailableForPickupInStore": AvailableForPickupInStore == null ? "" : AvailableForPickupInStore.toString(),
					"AvailableForShipToStore": AvailableForShipToStore == null ? "" : AvailableForShipToStore.toString(),
					"ItemImageFilename": ItemImageFilename == null ? "" : ItemImageFilename.toString(),
					"ItemURLPath": ItemURLPath == null ? "" : ItemURLPath.substring(0,255).toString(),
					"ItemBarCode": ItemBarCode == null ? "" : ItemBarCode.toString(),
					"ReferenceField1": ReferenceField1 == null ? "" : ReferenceField1.substring(0,25).toString(),
					"ReferenceField2": ReferenceField2 == null ? "" : ReferenceField2.substring(0,25).toString(),
					"ReferenceField6": ReferenceField6 == null ? "" : ReferenceField6.substring(0,25).toString(),
					"ReferenceField7": ReferenceField7 == null ? "" : ReferenceField7.substring(0,25).toString(),
					"ReferenceField8": ReferenceField8 == null ? "" : ReferenceField8.substring(0,25).toString(),
					"ReferenceField9": ReferenceField9 == null ? "" : ReferenceField9.substring(0,25).toString(),
					"ReferenceField10": ReferenceField10 == null ? "" : ReferenceField10.substring(0,25).toString(),
					"MarkForDeletion": MarkForDeletion == null ? "" : MarkForDeletion.toString(),
					"ItemSupplierXref": itemXrefResult,
					"ItemFacilityWMS": itemFacility,
					"ItemPackage": itemPackage,
					"ItemWmos": itemWmosResult
				})
			}
			//logger.info('data-->',data);
			return data;
		}
		else {
			return "";
		}
	}
	catch (err) {
		logger.error('Exception in getData');
		throw err;
	}
}

module.exports = { get };

