/**
*
*   Main JS application file for error data page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {
	availableDates: [],
	availableMonths: [],
	availableYears: []
} //initial data

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	var self = srvData
	self.translator = translator

	self.service_event_download_invalid_data = '/thaiwater30/backoffice/data_management/event_download_invalid_data'
	self.service_event_tracking_option_list = '/thaiwater30/backoffice/data_management/event_tracking_option_list'
	self.service_event_file_csv = 'thaiwater30/backoffice/data_management/event_file_csv'
	self.service_date = 'thaiwater30/backoffice/data_management/event_tracking_option_list_invalid_data'

	apiService.SendRequest('GET', self.service_date, {}, self.genFilterAgency)


	self.groupTableId = 'tbl-error-data'
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  srvData.renderColumnEvent_date
		},
		{
			data :  srvData.renderColumnAgency_name
		},
		{
			data :  srvData.renderColumnScript_name
		},
		{
			data : srvData.renderColumnCSV
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})

	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

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

	// Search in select
	$(".select-search").select2();


	$('#btn_preview').on('click',self.onClickDisplay)

	ctrl.on('click', '.btn-csv',self.downloadCSV)

	$('#filter_agency').on('change', srvData.filterAgencyChange);

}

/**
* Check there is date in data
*
* @param {string} date
*
*/
srvData.isAvailableDate = function(date) {
	var d = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2); //date
	if ($.inArray(d, srvData.availableDates) != -1) {
		return true;
	} else {
		return false;
	}
}

/**
* Check there is month in data
*
* @param {string} date
*
*/
srvData.isAvailableMonth = function(date) {
	var m = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2); //date
	if ($.inArray(m, srvData.availableMonths) != -1) {
		return true;
	} else {
		return false;
	}
}

/**
* Check there is year in data
*
* @param {string} date
*
*/
srvData.isAvailableYear = function(date) {
	var y = date.getFullYear().toString(); //year

	if ($.inArray(y, srvData.availableYears) != -1) {
		return true;
	} else {
		return false;
	}
}


/**
*Down load file CSV
*
*/
srvData.downloadCSV = function(e){
	var event_log_id = $(this).attr('data-key'); //event log id
	var url = apiService.BuildURL(srvData.service_event_file_csv); //url for download CSV
	url += '&event_log_id=' + event_log_id;
	if ( typeof(e) == "object" ) {
		e.preventDefault()
	}
	window.location.href = url
}


/**
* Render row on data table
*
*/
srvData.onClickDisplay = function(){
	var self = srvData; //initial data
	var agency = $('#filter_agency').val(); //agency id
	var filter_date = $('#filter_date').val(); //element date filter

	if(!agency || !filter_date){
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
		agency : $('#filter_agency').val(),
		date : $('#filter_date').val()
	}

	apiService.SendRequest('GET', self.service_event_download_invalid_data, param, function(dt){

		srvData.dataTable.clear()

		if ( JH.GetJsonValue(dt , "result") != "OK"){ return false; }
		srvData.dataTable.rows.add( JH.GetJsonValue(dt , "data") );
		srvData.dataTable.draw()

	})
}


/**
* Update filter date
*
*/
srvData.filterAgencyChange = function(){
	var row = $('#filter_agency option:selected').attr('data-row'); //row number
	srvData.genFilterDate(row)
}


/**
* create option into date filter
*
* @param {json} row
*
*/
srvData.genFilterDate = function(row){
	srvData.availableYears = [];
	srvData.availableMonths = [];
	srvData.availableDates = [];

	$('#filter_date option').not('.op_default').remove();
	var data = JH.GetJsonValue(srvData.data['data'], row+'.date'); //prepare date data
	if(typeof data === undefined || data == null){return false}
	for(var i=data.length-1; i>=0; i--){
		var ag =  data[i]['text']; //option name
		var val_option = data[i]; //option value

		srvData.availableYears.push(val_option.substring(0,4));
		srvData.availableMonths.push(val_option.substring(0,7));
		srvData.availableDates.push(val_option);
	}
	srvData.availableYears = [...new Set(srvData.availableYears)];
	srvData.availableMonths = [...new Set(srvData.availableMonths)];
	srvData.availableDates = [...new Set(srvData.availableDates)];

	if ( row ){ $('#filter_date').prop('disabled', false); }
	else { $('#filter_date').prop('disabled', true); }
	if ( !JH.Get("filter_date") ){
		filter_date = $('#filter_date').datepicker({
			format: 'yyyy-mm-dd',
			maxViewMode: 2,
			beforeShowDay: srvData.isAvailableDate,
			beforeShowMonth: srvData.isAvailableMonth,
			beforeShowYear: srvData.isAvailableYear
		});
		JH.Set("filter_date", filter_date);
	}
	$('#filter_date').val('').datepicker('update');
}



/**
* create option into agency filter
*
* @param {json} dt ageyc data
*
*/
srvData.genFilterAgency = function(dt){
	srvData.data = dt; //initial agency data
	var option_filter = document.getElementById('filter_agency'); //element agency filter
	var data_sort = JH.GetJsonValue(dt, 'data'); //agency data

	JH.Sort(data_sort, "text", false, function(str){
		return JH.GetLangValue(str).toLowerCase();
	})

	if(typeof data_sort === undefined || data_sort == null){return false}
	for(var i=0; i<data_sort.length; i++){
		var ag =  data_sort[i]; //agency data
		var gen_option = document.createElement('option'); //create option element
		var txt_option = JH.GetJsonLangValue(ag, 'text',true); //option name
		var val_option = ag['value']; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		option_filter.add(gen_option);
		$('#filter_agency > option').last().attr('data-row',i);
	}
}


/**
* put data into column event code
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_code = function(row){
	return JH.GetJsonValue(row,'event_code');
}

/**
* put data into column event date
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_date = function(row){
	return JH.GetJsonValue(row,'event_date');
}

/**
* put data into column agency name
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnAgency_name = function(row){
	return JH.GetJsonLangValue(row, 'agency_name',true)
}

/**
* put data into column script name
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnScript_name = function(row){
	return JH.GetJsonValue(row,'script_name');
}

/**
* create button doenload CSV file
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnCSV = function(row){
	if(row['filepath'] == true){
		return '<i class="fa fa-file-excel-o btn btn-csv color-green" title="ดาวน์โหลดไฟล์ CSV"'  +
		'data-key="'+row['event_log_id']+'" aria-hidden="true"></i>'
	}else {
		return ''
	}
}
