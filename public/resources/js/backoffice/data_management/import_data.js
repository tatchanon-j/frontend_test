/**
*
*   Main JS application file for import data page.
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
* @param {json} translator
*
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script

	self.service_impdata_option_list = 'thaiwater30/backoffice/data_management/impdata_option_list'; //service option list
	self.service = "dataimport/rdl/node0/ps"; //service dataimport
	self.service_history = "thaiwater30/backoffice/dataimport_config/history"; //service history script


	self.hisImpTableId = 'tbl-history-import'; //id of table management cache
	ctrl = $('#' + self.hisImpTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [
		{
			data :  self.renderColumnMetadata
		},
		{
			data :  self.renderColumnAgency
		},
		{
			data :  self.renderColumnBeginAt
		},
		{
			data :  self.renderColumnEndAt
		},
		{
			data :  self.renderColumnDulation
		},
		{
			data : self.renderColumnSatatus
		} ],
		order : [ [ 1, 'asc' ] ],
	})



	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : self.translator['select_all'],
			allSelectedText : self.translator['all_selected'],
			nonSelectedText : self.translator['none_selected'],
			filterPlaceholder: self.translator['search']
		})
	})

	apiService.SendRequest('GET', self.service_impdata_option_list, {}, self.genFilterAgency)
	apiService.GetCachedRequest(self.service_impdata_option_list, {}, self.genFilterMetadata)


	$(".select-search").select2();

	$('#filter_agency').on('change', srvData.onChangeFilteAgency)
	$('#filter_metadata').on('change', srvData.onChangeFilteMetadata)

	$('#btn_upload').on('click', srvData.uploadFiles)
	$('#btn_history').on('click', srvData.displayHistory)

}


/**
* Prepare data to get history
*
* @param {json} rs history data
*
*/
srvData.displayHistory = function(){
	var self = srvData
	var metadata = $('#filter_metadata').val();
	var param = {};
	if(!metadata){
		bootbox.alert({
			message:self.translator['msg_err_data_null'],
			buttons:{
				ok:{
					label:self.translator['btn_close']
				}
			}
		});
		return false
	}

	param ={
		agency_id: parseInt($('#filter_agency').val()),
		metadata_id: parseInt(metadata),
		process_status: [-1,0,1,2,3],
		// begin_at:'2000-01-01 00:00',
		// end_at:'2020-12-31 23:59'
	}

	console.log("Param:",param);
	apiService.SendRequest("GET" , self.service_history , param , self.putDataTable)
}



/**
* render data into table
*
* @param {json} rs history data
*
*/
srvData.putDataTable = function(rs){
	console.log("Result:",rs);
	var self = srvData;
  self.dataTable.clear();
  if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
  self.dataTable.rows.add( JH.GetJsonValue(rs , "data") );
  self.dataTable.draw();

}

/**
* create option into filter agency
*
* @param {json} ag agency data
*
*/
srvData.genFilterAgency = function(ag){
	var filter_agengy = document.getElementById('filter_agency'); //agency id
	var data_agency = apiService.getFieldValue(ag,'data'); //agency data

	if ( data_agency == null ) {
		return
	}

	/* sort option list by alphabet */
	JH.Sort(data_agency,"agency",false , function(str){
		return str.text.toLowerCase();
	})

	for(var i=0; i<data_agency.length; i++){
		if(data_agency[i]['agency']['value'] != 0){
			var gen_option = document.createElement('option'); //create option
			var txt_option = data_agency[i]['agency']['text']; //option name
			var val_option = data_agency[i]['agency']['value']; //option value

			gen_option.text = txt_option
			gen_option.value = val_option
			filter_agengy.add(gen_option)
		}
	}
}


/**
* update option on filter matadata
*
*/
srvData.onChangeFilteAgency = function(){
	var agency = $('#filter_agency').val(); //agency id
	apiService.GetCachedRequest(srvData.service_impdata_option_list, {}, srvData.genFilterMetadata)
	if(agency){
		$('#filter_metadata').removeAttr('disabled');
	}else{
		$('#filter_metadata').attr('disabled','true');
	}
}


/**
* updata data download command
*
*/
srvData.onChangeFilteMetadata = function(){
	var metadata_id = $('#filter_metadata option:selected').attr('data-name'); //metadata id
	if(metadata_id){
		$('.download_command').text(metadata_id);
	}else{
		$('.download_command').text(' - ');
	}


}


/**
* create option tinto filter metadata
*
* @param {json} mt
*
*/
srvData.genFilterMetadata = function(mt){
	srvData.obj_data = mt;
	$('#filter_metadata > option').not('.op_default').remove()

	var filter_metadata = document.getElementById('filter_metadata');
	var filter_agency_id = $('#filter_agency').val();

	var data_metadata = apiService.getFieldValue(mt,'data')
	if ( data_metadata == null ) {
		return
	}

	for(var i=0; i<data_metadata.length; i++){
		var agency_id = data_metadata[i]['agency']['value']; //agency id
		agency_id = agency_id.toString();

		if( agency_id == filter_agency_id){
			var meta = data_metadata[i]['metadata']; //metadata data

			/* sort option list by alphabet */
			JH.Sort(meta,"text",false , function(str){
				return str.toLowerCase();
			})

			for(var j=0; j<meta.length; j++){
				var gen_option = document.createElement('option'); //create opttion element
				var txt_option = meta[j]['text']; //option name
				var val_option = meta[j]['metadata_id']; //option value
				var download_command = meta[j]['download_command']; //download command

				gen_option.text = txt_option;
				gen_option.value = val_option;
				filter_metadata.add(gen_option)
				$('#filter_metadata option').last().attr('data-name', download_command)
			}
		}
	}

}


/**
* Upload file
*
*/
srvData.uploadFiles = function(){
	var self = srvData; //initial data
	var file_name = $('#input_file').val(); //file name
	var metadata_id = $('#filter_metadata').val(); //metadata id
	var srcipt; //cscript for upload file

	if( !metadata_id ){
		bootbox.alert({
			message: self.translator['msg_err_require_filter'],
			buttons : {
				ok : {
					label : self.translator['btn_close']
				}
			}
		})
		return false
	}

	apiService.GetCachedRequest(srvData.service_impdata_option_list, {}, function(sc){
		var filter_agency_id = $('#filter_agency').val(); //agency id
		var data_agency = apiService.getFieldValue(sc,'data'); //agency data

		if ( data_agency == null ) {
			return
		}

		for(var i=0; i<data_agency.length; i++){
			var agency_id = data_agency[i]['agency']['value']; //agency id

			agency_id = agency_id.toString();

			if( filter_agency_id  == agency_id){

				var meta = data_agency[i]['metadata']; //metadata data

				if(typeof meta === undefined || meta == null){return false}
				for(var j=0; j<meta.length; j++){

					var metadata = meta[j]['value']; //metadata
					metadata = metadata.toString();

					if(metadata == metadata_id){
						srcipt = meta[j]['download_script']
					}
				}
			}
		}
	})

	param = {
		download_id : metadata_id,
		download_script : srcipt
	}

	apiService.SendRequest('POST', srvData.service, param, srvData.uploadFiles_succ, srvData.uploadFiles_err);
}


/**
* result pload file successs
*
* @param {json} data
*
*/
srvData.uploadFiles_succ = function(data){
	if(data['result'] !== 'NO'){

		var msg = srvData.translator['msg_import_success']; //message upload success
		var raw_output = JH.GetJsonValue(data, "result.raw_output"); //raw output from service

		if ( raw_output[raw_output.length-2] == "No new data is available" ){
			msg = "No new data";
		}
		bootbox.alert({
			message: msg,
			buttons: {
				ok: {
					label: srvData.translator['btn_close']
				}
			}
		})
	}
}


/**
* result upload file fail
*
* @param {json} jqXHR
* @param {json} textStatus
* @param {json} errorThrown
*
*/
srvData.uploadFiles_err = function(jqXHR, textStatus, errorThrown){
	if ( JH.GetJsonValue(jqXHR, "status") == 500){
		var responseText = JH.GetJsonValue(jqXHR, "responseText").split("↵"); //responseText from service
		var responseText_last = responseText[responseText.length - 1]; //last response text

		if ( responseText_last.substring(0,6) == "STDOUT"){
			var jstring = responseText_last.substr(7); // substring
			var js = JSON.parse(jstring); //convert text into a JavaScript object
			var msg = ""; //message error
			var count = 0;
			for(var key in js) {
				if ( count != 0){ msg += "\r\n"; }
				msg += js[key];
				count++;
			}
			apiService.Alert(msg)
		}else{
			apiService.cbServiceAjaxError(url, jqXHR, textStatus, errorThrown)
		}
	}else{
		apiService.cbServiceAjaxError(url, jqXHR, textStatus, errorThrown)
	}
}

/**
* put data into column metadata
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderColumnMetadata = function(row){
	return JH.GetJsonLangValue(row,'metadataservice_name')
}
/**
* put data into column agency
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderColumnAgency = function(row){
	return JH.GetJsonLangValue(row,'agency_name')
}
/**
* put data into column begin date
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderColumnBeginAt = function(row){
	return JH.GetJsonValue(row,'download_begin_at')
}
/**
* put data into column End date
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderColumnEndAt = function(row){
	return JH.GetJsonValue(row,'download_end_at')
}
/**
* put data into column dulation
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderColumnDulation = function(row){
	return JH.GetJsonValue(row,'duration')
}
/**
* put data into column Status
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderColumnSatatus = function(row){
	return JH.GetJsonLangValue(row,'event_code')
}
