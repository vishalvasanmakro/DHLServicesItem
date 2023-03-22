module.exports = {
	    queries: {
		            itemMaster: `SELECT
		            SUBSTR(im.item, 1,100)                                             "itemName",
		          ( select distinct  VARCHAR2_7 
                    from wh_cfa_ext wce,
                         item_loc il
                     where il.loc=wce.wh
                     and il.item=im2.item
                     and group_id=4500 and varchar2_7 is not null)       "BusinessUnit",
		          (SELECT DISTINCT SUBSTR(LOCAL_ITEM_DESC, 1, 65) FROM ITEM_LOC il WHERE  item = im2.item
				              and  exists (select 'x' from wh where wh=il.loc)  and il.loc in (select wh from wh_cfa_ext where group_id=4500 and varchar2_7 is not null )
				        )  "Description",
		          SUBSTR(im.ITEM_DESC_SECONDARY, 1 ,500)                              "LongDescription",
		          SUBSTR(im.item, 1, 50)                                             "ItemBarCode",
		          (
				            SELECT
				                substr(uv.uda_value_desc, 1, 25) buyer
				            FROM
				                uda_item_lov  uil,
				                uda_values    uv
				            WHERE
				                    uil.uda_id = uv.uda_id
				                AND uil.uda_value = uv.uda_value
				                AND uil.uda_id = 11
				                AND uil.item = im2.item
				        ) "ReferenceField1",
		          (
				            SELECT
				                nvl((
							                  SELECT
							                      1
							                  FROM
							                      daily_purge
							                  WHERE
							                      key_value = im2.item
							              ), 0) AS markfordeletion
				            FROM
				                dual
				        )             "MarkForDeletion"
		      FROM
		          item_master im,
		          (
				            SELECT
				                item
				            FROM
				                item_master
				            WHERE
				                item IN (:items)
				        ) im2
		      WHERE
		          im.item = im2.item`,

		            itemFacility: `SELECT DISTINCT
		          --cfa.varchar2_1 LOC,
				  nvl(cfa.varchar2_1,(select distinct physical_wh from wh where wh=item_loc.loc)) LOC,
		          NULL                                                                                                          "LPNPerTier",
		          NULL                                                                                                          "TierPerPallet",
		      --                  ITEM_LOC.LOC      "MiscAlpha1" ,
		          --cfa.varchar2_1                                                                                                "MiscAlpha1",
		          nvl(cfa.varchar2_1,(select distinct physical_wh from wh where wh=item_loc.loc))                                 "MiscAlpha1",
				  item_loc.primary_supp                                                                                         "MiscAlpha2",
		          ''                                                                                                            "MiscAlpha3",
		          (
				            SELECT
				                nvl((
							                  SELECT
							                      1
							                  FROM
							                      daily_purge
							                  WHERE
							                      key_value = :itemName
							              ), 0) AS markfordeletion
				            FROM
				                dual
				        )           "MarkForDeletion"
		      FROM
		          item_loc    item_loc,
		          (select * 
                    from wh_cfa_ext 
                    where group_id = 4500 
                      and varchar2_1 IS NOT NULL) cfa
		      WHERE
		              item = :itemName
		          AND loc_type = 'W'
		          AND item_loc.loc = cfa.wh (+)
				  AND loc in (select wh from wh_cfa_ext where group_id=4500 and varchar2_7 is not null)`,
		            itemPackage: `SELECT nvl(item_supp_country_dim.net_weight,1)  "Weight",
		        (SELECT   varchar2_1 from item_master_cfa_ext where group_id = 300 and item = :itemName) "Quantity",
		        nvl(item_supp_country_dim.length,1)  "UnitLength",
		        nvl(item_supp_country_dim.height,1)  "UnitHeight",
		        nvl(item_supp_country_dim.width,1) "UnitWidth",
		        1 "IsStandard"
		    FROM item_supp_country_dim, item_supp_country isc
		        where item_supp_country_dim.dim_object = 'CA' and item_supp_country_dim.item = :itemName and item_supp_country_dim.supplier = :supplierField 
		        AND item_supp_country_dim.item = isc.item and item_supp_country_dim.supplier = isc.supplier 
		        AND item_supp_country_dim.origin_country = isc.origin_country_id
		        AND isc.primary_country_ind = 'Y' `,

            itemSupplierXref: `Select DISTINCT A.item SupplierItemBarcode, 1 "ScanQnty", '' ItemBarCode From item_master A, item_master B where A.item_level > A.tran_level AND A.item_parent =:itemName`,

		    itemWmos: `SELECT 
		    	      (Select VARCHAR2_1 || ' ' || varchar2_9 From item_master_cfa_ext where item = :itemName and group_id = '300') "PkgType",
		    		      item_master.subclass "ProdSubGrp",
                      (select distinct decode((case 
                                        when (select uda_value from uda_item_lov uiv where uiv.uda_id = 41 and uiv.item = item_master.item) is NOT NULL then
                                             (select uda_value from uda_item_lov uiv where uiv.uda_id = 41 and uiv.item = item_master.item)
                                        when il.SELLING_UOM in (select UOM from uom_class where uom_class='MASS') then
                                             2
                                        when item_master.DEPOSIT_ITEM_TYPE in ('A','T') then
                                              3
                                        else
                                              0
                                         end ),2,'L','U') as art_tpe
                          from item_loc il
                          where il.item=item_master.item 
                            and il.loc in (select wh from wh_cfa_ext where group_id=4500 and varchar2_7 is not null)) "ProdLine",
		    		     -- 'U'   "ProdLine",
		    		      item_master.class  "SaleGrp",
		    		      '1'  "AvgDlyDmnd",
		    		      'E'   "ConsPrtyDateCode",
		    		      DECODE((SELECT UDA_ITEM_FF.UDA_TEXT FROM  UDA_ITEM_FF where uda_id = 5 and item = :itemName), NULL, '0', '1') "XpireDateReqd",
		    		      NULL "MerchType" ,
		    		     item_master.class "MerchGroup",
		    		      'H' "SplInstrCode1",
		    		      (Select VARCHAR2_4 From item_master_cfa_ext where item = :itemName and group_id = '300') "SplInstr1",
		    		      (Select B.uda_value || ' - ' || SUBSTR(B.uda_value_desc, 1, INSTR(B.uda_value_desc, '-') - 2) SplInstr2 From uda_item_lov A, uda_values B 
					      			              WHERE A.uda_id = 11 AND A.uda_id = B.uda_id AND A.uda_value = B.uda_value AND A.item = :itemName) "SplInstr2",
		    		      (SELECT UDA_ITEM_FF.UDA_TEXT FROM  UDA_ITEM_FF where uda_id = 5 and item = :itemName) "MinRecvToExpireDays"
		    	  FROM item_master where item = :itemName`
		        }
};
