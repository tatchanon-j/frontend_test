/**
*
*   Main JS application file for check metadata page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	var self = srvData; //initila data
	self.translator = translator; //Text for label and message on java script
	self.service_check_metadata_load = "/thaiwater30/backoffice/data_management/check_metadata_load"; //service check metadata load
	self.service_check_metadata_agency = "/thaiwater30/backoffice/data_management/check_metadata_agency"; //service check metadata ageney
	self.service_check_metadata = "/thaiwater30/backoffice/data_management/check_metadata"; //service check metadata

	apiService.SendRequest('GET', self.service_check_metadata_load, {}, self.genFilterTable)

	self.checkTable = 'tbl-checkmetadata'; //check metadata table id
	table = $('#' + self.checkTable);
	self.dataTable = table.DataTable({
		dom : 'frltip',
		columns : [{
			data :	''
		}],
		language : g_dataTablesTranslator
	})


	$('#btn_preview').on('click',self.btnDisplay);
	$('#btn_print').on('click',self.btnPrintClick);

	$('#filter_table').on('change', function(){
		var table = $('#filter_table').val(); //table name
		apiService.SendRequest('GET', self.service_check_metadata_load, {}, self.genFilterMetadata);
		self.genFilterAgency();
		if(table){
			$('#filter_datametada').removeAttr('disabled');
			$('#filter_agency').removeAttr('disabled');
		}else{
			$('#filter_datametada').attr('disabled','true');
			$('#filter_agency').attr('disabled','true');
		}
	})

	$('#div_preview').hide();
	$('#div_loading').hide();
}


/**
* Create option into filter table
*
* @param {json} table
*
*/
srvData.genFilterTable = function(table){
	var filter_table = document.getElementById('filter_table'); //element table filter
	var data_table = table['data']; //table data
	var i; //condition loop
	var tb = table['data']; //table dat

	/* sort option list by alphabet */
	JH.Sort(tb,"table_name",false , function(str){
		return str.toLowerCase();
	})

	if(typeof data_table === undefined || data_table == null){return false}


	for(i=0; i<data_table.length; i++){
		var gen_option = document.createElement('option'); //create option
		var txt_option = data_table[i]['table_description']; //option name
		var val_option = data_table[i]['id']; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_table.add(gen_option)
	}
	$(filter_table).select2();
	srvData.genFilterMetadata(table)
}


/**
* Create option into filter metadata
*
* @param {json} table
*
*/
srvData.genFilterMetadata = function(table){
	var self = srvData; //initial data
	var filter_datametada = document.getElementById('filter_datametada'); //element dtaa metadata filter
	var i; //condition loop
	var filter_table = $('#filter_table').val(); //table name
	var data_table = apiService.getFieldValue(table,'data'); //table data

	if(data_table == null){return }

	$('#filter_datametada > option').not(".intro").remove();

	for(i=0; i<data_table.length; i++){
		var columns = data_table[i]['columns']; //column data
		if(filter_table == data_table[i]['id']){
			if(typeof columns === undefined || columns == null){return false}
			for(var j=0; j<columns.length; j++){
				var gen_option = document.createElement('option'); //create option element
				var txt_option = columns[j]; //option name
				var val_option = columns[j]; //option value

				gen_option.text = txt_option;
				gen_option.value = val_option;
				filter_datametada.add(gen_option);
			}
		}
	}
}


/**
* Create option into filter agency
*
*/
srvData.genFilterAgency = function(){
	var self = srvData; //inital data
	var filter_table = $('#filter_table').val(); //table name
	var param = {
		table_name : filter_table
	};

	$('#filter_agency > option').not('.intro').remove();

	if(filter_table != ''){
		apiService.SendRequest('GET', self.service_check_metadata_agency, param, function(agc){
			var filter_agency = document.getElementById('filter_agency'); //element agenecy filter
			var i; //condition loop
			var data_agency = apiService.getFieldValue(agc,'data'); //agency data

			if(data_agency == null){return }

			JH.Sort(data_agency,"agency_name",false , function(str){
				if(str.th){
					return str.th.toLowerCase();
				}else if(str.en){
					return str.en.toLowerCase();
				}else{
					return str.jp.toLowerCase();
				}
			})

			for(i=0; i<data_agency.length; i++){
				var ag = data_agency[i]; //ageney id
				var gen_option = document.createElement('option'); //create option
				var txt_option = JH.GetJsonLangValue(ag,'agency_name',true); //option name
				var val_option = ag['id']; //option value

				gen_option.text = txt_option;
				gen_option.value = val_option;
				filter_agency.add(gen_option)
			}

		})
	}
}


/**
* Get data to generate table
*
*/
srvData.btnDisplay = function(){
	var self = srvData; //initial data
	var filter_table = $('#filter_table').val(); // table name
	var filter_datametada = $('#filter_datametada').val(); //datameta data id
	var filter_agency = $('#filter_agency').val(); //ageney id

	if(filter_table =='' || filter_datametada == '' || filter_agency == ''){
		bootbox.alert({
			message: self.translator['msg_err_require_filter'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}

	var param = {
		table_name : $('#filter_table').val(),
		column_name : $('#filter_datametada').val(),
		agency_id : $('#filter_agency').val()
	}

	$('#div_loading').show();
	$('#div_preview').hide();
	apiService.SendRequest('GET', self.service_check_metadata, param, self.displaTable);
}


/**
* Generate table
*
* @param {json} dp
*
*/
srvData.displaTable = function(dp){
	var table = $('#tbl-checkmetadata');
	var a = [];
	var td; //element table data
	var self = srvData; //initial data

	srvData.dataTable.clear();
	srvData.dataTable.draw();
	srvData.dataTable.destroy();

	$('#tbl-checkmetadata').empty();
	$('#div_loading').hide();
	$('#div_preview').show();

	thead = $('<thead></thead>');
	tbl_body = $('<tbody></tbody>');
	tbl_column_name = $('<tr></tr>');
	thead.append(tbl_column_name);
	table.append(thead);
	table.append(tbl_body);

	//Generate column name
	if(typeof dp === 'undefined' || dp == null){return false}

	for(var i=0; i<dp['data']['column_name'].length; i++){
		var col_name = dp['data']['column_name'][i]; //column name
		if(col_name !== 'id'){
			var data_column_name = '<th>'+col_name+'</th>'; //column name
		}else{
			var data_column_name = '<th>'+srvData.translator["col_order"]+'</th>'; //column order name
		}
		var name_column_name = col_name;
		tbl_column_name.append(data_column_name);
	}

	//Genarate data in table
	for(j=0; j<dp['data']['data'].length; j++){
		var tr = '<tr class="'+j+'"></tr>'; //element tr
		tbl_body.append(tr);
		for(var i=0; i<dp['data']['column_name'].length; i++){
			var name_column_name = dp['data']['column_name'][i]; //column name data
			var data_td = dp['data']['data'][j][name_column_name]; //column name data
			console.log("data_td:",data_td);

			if (typeof data_td == 'undefined' || data_td == null){
				td = '<td> </td>'
			}else{
				if(name_column_name == 'id'){
					var col_order = j+1; //data column order
					td = '<td>'+col_order+'</td>';
				}else{
					if(JH.GetJsonValue(data_td,'th')){
						td = '<td>'+JH.GetJsonValue(data_td,'th')+'</td>';
					}else if(JH.GetJsonValue(data_td,'en')){
						td = '<td>'+JH.GetJsonValue(data_td,'en')+'</td>';
					}else if(JH.GetJsonValue(data_td,'jp')){
						td = '<td>'+JH.GetJsonValue(data_td,'jp')+'</td>';
					}else if(typeof data_td === 'object'){
						td = '<td> </td>';
					}else{
						if(data_td == 0){
							data_td = '';
						}
						//lat long 2 digit
						if(name_column_name == 'lat' || name_column_name == 'long'){
							var data_td = srvData.numberWithCommas(data_td); //data to put in table
							if(data_td){
								data_td = parseFloat(data_td).toFixed(2);
							}
							td = '<td>'+data_td+'</td>';
						}else{
							td = '<td>'+data_td+'</td>';
						}
					}
				}
			}
			$('#tbl-checkmetadata > tbody > tr.'+j).append(td);
		}
	}

	self.dataTable = table.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			extend : 'excelHtml5',
			text : ' <i class="fa fa-file-excel-o color-green" aria-hidden="true"></i> excel',
		} ],
		language : g_dataTablesTranslator,
		order : [ [ 0, 'asc' ] ]
	})
}


/**
* setting format number with commas
*
* @param {string} nStr number
*
*/
srvData.numberWithCommas = function(nStr) {
	nStr += ''; //number
	var x = nStr.split('.'); ////splait number
	var x1 = x[0]; //Integer number
	var x2 = x.length > 1 ? '.' + x[1] : ''; //Decimal number
	var rgx = /(\d+)(\d{3})/; //Divide the number of digits into digits.

	/* setting fomat with commas */
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

/**
*   Event btn print click
*   open print page
*/
srvData.btnPrintClick = function(){
    // var param = "data_table="+ filter_table+
    //     "&data_metadata="+ filter_datametada+
    //     "&data_agency="+ filter_agency;
		var param = "data_table=table_name";

  		window.open(_URL_ + "?" + param , '_blank');
}
