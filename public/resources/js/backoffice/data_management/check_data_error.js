/**
*
*   Main JS application file for check data error page.
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
	var self = srvData; //initial data
	self.date_range = 30; // date range
	self.translator = translator; //Text for label and message on java script
	self.url_check_latest_data = _URL_; //url check latest data
	self.service_check_error_data_load = "/thaiwater30/backoffice/data_management/check_error_data_load"; //service check error data load
	self.service_check_error_data_agency = "/thaiwater30/backoffice/data_management/check_error_data_agency"; //check error data agency
	self.service_check_error_data = "/thaiwater30/backoffice/data_management/check_error_data"; //service error data

	apiService.SendRequest('GET', self.service_check_error_data_load, {}, self.genFilterDatatype);

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

	$('#div_preview').hide()
	$('#div_loading').hide()

	var date = new Date();
	var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	$('#filter_startdate,#filter_enddate').datepicker({
		// disabledDates: true,
		format: 'yyyy-mm-dd'
	});
	$('#filter_startdate,#filter_enddate').datepicker('setDate', today);

	$('#filter_datatype').on('change',self.filterDatatypeChange)
	$('#btn_display').on('click',self.displayData)
}


/**
* Create option on filter data type
*
* @param {json} dt data type data
*
*/
srvData.genFilterDatatype = function(dt){

	var filter_datatype = document.getElementById('filter_datatype'); //element datatype filter
	var data_type = dt['data']; //data type data
	var i; //condition loop

	/* sort option list by alphabet */
	JH.Sort(data_type,"name",false , function(str){
		return str.toLowerCase();
	})

	if(typeof dat_type === undefined || data_type == null){return false}

	for(i=0; i<data_type.length; i++){
		var js_val  = data_type[i]; //datatype
		var gen_option = document.createElement('option'); //create option element
		var txt_option = js_val['name']; //option name
		var station_column_name = js_val['station_column_name']; //station column name
		var station_table = js_val['station_table']; //station table

		gen_option.text = txt_option;
		gen_option.value = js_val['data_type'];
		filter_datatype.add(gen_option);

		$('#filter_datatype > option').last().attr('station-column-name',station_column_name)
		$('#filter_datatype > option').last().attr('station-table',station_table)
	}
}


/**
* Event filter data type change
*
*/
srvData.filterDatatypeChange =function(){
	var self = srvData; //initial data
	var param = {}; //parameter
	var data_type = $('#filter_datatype').val(); //data type
	var filter_agency = document.getElementById('filter_agency'); //element ageney filter

	if(!data_type){
		$('#filter_agency > option').remove();
		$(filter_agency).multiselect({includeSelectAllOption:true});
		$(filter_agency).multiselect('rebuild');
		$(filter_agency).multiselect('selectAll');
		$(filter_agency).multiselect('updateButtonText');
		$('.multiselect ').attr('disabled','true');
		return false
	}

	$('.multiselect').removeAttr('disabled');
	var val_station_table = $( "#filter_datatype option:selected" ).attr('station-table');
	var val_station_column_name = $( "#filter_datatype option:selected" ).attr('station-column-name');


	param = {
		data_type : $('#filter_datatype').val(),
		station_table : val_station_table,
		station_column_name : val_station_column_name,
	}

	apiService.SendRequest('GET', self.service_check_error_data_agency, param, self.genFilterAgency)
}


/**
* Create option on filter agency
*
* @param {json} translator Text for use on page
*
*/
srvData.genFilterAgency = function(ag){
	$('#filter_agency > option').remove();
	var filter_agency = document.getElementById('filter_agency'); //element agency filter
	var ag = ag['data']; // ageneyc data
	var i = 0; //condition loop

	if(ag){
		if(typeof ag === undefined || ag == null){return false}
		for(i; i<ag.length; i++){
			var gen_option = document.createElement('option'); //create option
			var txt_option = JH.GetJsonLangValue(ag[i],'agency_name'); //option name
			var val_option = ag[i]['id']; //option value

			gen_option.text = txt_option;
			gen_option.value = val_option;
			filter_agency.add(gen_option)
		}
	}

	$(filter_agency).multiselect({includeSelectAllOption:true});
	$(filter_agency).multiselect('rebuild');
	$(filter_agency).multiselect('selectAll');
	$(filter_agency).multiselect('updateButtonText');
}


/**
* Get the data to put on table
*
*/
srvData.displayData = function(){
	var self = srvData; //initial data
	var param = {}; //parameter

	var frm_datatype = $('#filter_datatype').val(); //data type
	var frm_agency = $('#filter_agency').val(); //agency id
	var frm_startdate = $('#filter_startdate').val(); //agency id
	var frm_enddate = $('#filter_enddate').val(); //agency id

	if(frm_datatype == '' || frm_agency == null || frm_startdate == "" || frm_enddate == ""){
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

	var sd = moment( frm_startdate );
	var ed = moment( frm_enddate );
	var datediff = ed.diff(sd, 'days');
	if ( datediff < 0 ){
		bootbox.alert({
			message: self.translator['msg_stdate_over_endate'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}
	if ( datediff > srvData.date_range ){
		bootbox.alert({
			message: self.translator['msg_err_date_over_range'].replace('%s', srvData.date_range),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}


	var val_station_table = $( "#filter_datatype option:selected" ).attr('station-table'); //get station-table
	var val_station_column_name = $( "#filter_datatype option:selected" ).attr('station-column-name'); //get station columname

	param = {
		data_type : $('#filter_datatype').val(),
		station_column_name : val_station_column_name,
		station_table : val_station_table,
		agency_id : $('#filter_agency').val().join(),
		start_date : frm_startdate,
		end_date : frm_enddate
	}
	JH.Set("data_type", param.data_type);

	apiService.SendRequest('GET', self.service_check_error_data, param, self.previewDataTables)
}


/**
* Generate row on table
*
* @param {json} dp data error to put on table
*
*/

srvData.previewDataTables = function(rs){
	srvData.table = $('#tbl-checkdata-error');
	var self = srvData;
	var raw_column_data = rs.data.column_name;
	var raw_row_data = rs.data.data;
	var column_name = [];
	var row_data = [];

	for (var i=0; i < raw_column_data.length; i++){
		var js_title = {title:raw_column_data[i]};
		column_name[i] = js_title;
	}

	for (var i = 0; i < raw_row_data.length; i++){
		var dataSet = [];
		for(var j = 0; j < raw_column_data.length; j++){
			var data_type
			var name
			var in_row

			JH.Get("data_type") == "waterlevel"? data_type = "tele_waterlevel" : data_type = JH.Get("data_type");
			var url = srvData.url_check_latest_data + "?data_type=" + data_type;
			url += "&station_id=" + JH.GetJsonValue(raw_row_data[i], "station_id");
			url += "&date=" + JH.GetJsonValue(raw_row_data[i], "datetime").substring(0, 10);
			var text = JH.GetJsonLangValue(raw_row_data[i], "station_oldcode", true);

			raw_column_data[j] == 'id'? name='station_id' : name=raw_column_data[j];
			in_row = raw_row_data[i][name];

			if(typeof in_row == 'object'){
				dataSet[j] = JH.GetJsonLangValue(raw_row_data[i], raw_column_data[j]);
			}else{
				if (typeof in_row == "undefined"){
					dataSet[j] = "";
				}else{
					if(raw_column_data[j] == 'station_oldcode'){
						dataSet[j] = '<a href="'+ url +'" ref="noopener" target="_blank">'+in_row+'</a>';
					}else{
						dataSet[j] = in_row;
					}
				}
			}
		}

		row_data[i] = dataSet;
	}

	$('#tbl-checkdata-error').empty();
	$('#div_loading').hide();
	$('#div_preview').show();

	//Table detail NHC
	if (srvData.ElementTableOld) {
		srvData.ElementTableOld.destroy();
		srvData.table.empty();
	}

	srvData.ElementTableOld = srvData.table.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		data : row_data,
		columns: column_name,
		order : [ [ 0, 'asc' ] ]
	})

}


/**
* put data into column remark
*
* @param {json} row The data for the whole row
*
*/
srvData.renderStationOldcodeColumn = function(row){
	var url = srvData.url_check_latest_data + "?data_type=" + JH.Get("data_type");
	url += "&station_id=" + JH.GetJsonValue(row, "station_id");
	url += "&date=" + JH.GetJsonValue(row, "datetime").substring(0, 10);
	var text = JH.GetJsonLangValue(row, "station_oldcode", true);
	var a = '<a href="'+ url +'" ref="noopener" target="_blank">'+text+'</a>';
	return a;
}


/**
* put data into column remark
*
* @param {json} row The data for the whole row
*
*/
srvData.renderStationNameColumn = function(row){
	var url = srvData.url_check_latest_data + "?data_type=" + JH.Get("data_type");

	url += "&station_id=" + JH.GetJsonValue(row, "station_id");
	url += "&date=" + JH.GetJsonValue(row, "datetime").substring(0, 10);

	var text = JH.GetJsonLangValue(row, "station_name", true);
	var a = '<a href="'+ url +'" ref="noopener" target="_blank">'+text+'</a>';

	return a;
}



/**
* Put the data into column
*
* @param {json} row The data for the whole row
* @param {json} a The data type requested for the cell
* @param {json} b Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} column An object that contains additional information about the cell being requested.
*
*/
srvData.renderColumn = function(row,a,b,column){
	if ( srvData.columnNames === undefined ) {
		srvData.columnNames = []; //column name

		var h = srvData.dataTable.columns().header(); //Get column name for get for get data in json

		if(typeof h === undefined || h == null){return false}

		for ( var i = 0; i < h.length; i ++) {
			srvData.columnNames.push(h[i].innerText)
		}
	}

	var col_name = srvData.columnNames[column.col]; //column name
	var data = JH.GetJsonValue(row, col_name); //column name data

	if ( typeof data !== "object" ) {
		return data
	}
	return JH.GetLangValue(data);
}
