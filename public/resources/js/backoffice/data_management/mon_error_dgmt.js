/**
*
*   Main JS application file for monitor error data management page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {};
var jid = '#dlgDetailError';

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	srvData.translator = translator; //Text for label and message on java script
	srvData.service_event_tracking_invalid_data = '/thaiwater30/backoffice/data_management/event_tracking_invalid_data'; //service event tracking invalid data
	srvData.service_event_tracking_option_list = '/thaiwater30/backoffice/data_management/event_tracking_option_list'; //service event tracking option list

	apiService.SendRequest('GET', srvData.service_event_tracking_option_list, {}, function(rs){
		srvData.genFilterAgency(rs);
		srvData.onClickDisplay(rs);
	})


	srvData.tableId = 'tbl-mon-error-dgmt'; //monitor error table id
	ctrl = $('#' + srvData.tableId)
	srvData.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		language : g_dataTablesTranslator,
		buttons :[{
			text : '<i class="fa fa-floppy-o" aria-hidden="true"></i> '+ srvData.translator['btn_data_mstake_detail'],
			action : srvData.dlgDetailError
		}],
		columns : [ {
			data : srvData.renderColumnCheckbox,
			orderable : false,
			searchable : false,
		},
		{
			data :  srvData.renderColumnEvent_date,
		},{
			data :  srvData.renderColumnAgency_name,
		},
		{
			data :  srvData.renderColumnEvent_message,
		},{
			data :  srvData.renderColumnSend_error_at,
		},{
			data : srvData.renderColumnSovle_event_at,
		} ],
		order : [ [ 2, 'desc' ] ],
		rowCallback : ''
	})

	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : srvData.translator['select_all'],
			allSelectedText : srvData.translator['all_selected'],
			nonSelectedText : srvData.translator['none_selected'],
			filterPlaceholder: srvData.translator['search']
		})
	})


	$('#btn-disPlay').on('click', srvData.onClickDisplay)
	$('#btn_save').on('click', srvData.saveMon_error_data)

	$('#filter_startdate,#filter_enddate').datetimepicker({
		// disabledDates: true,
		format: 'YYYY-MM-DD HH:mm',
		icons: {
			time: 'fa fa-clock-o',
			date: 'fa fa-calendar',
			up: 'fa fa-chevron-up',
			down: 'fa fa-chevron-down',
			previous: 'fa fa-chevron-left',
			next: 'fa fa-chevron-right',
			today: 'fa fa-check',
			clear: 'fa fa-trash',
			close: 'fa fa-times'
		}
	});

	var currentdate = new Date();
	var datetime = 	currentdate.getFullYear() + "-"
	+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
	+ ("0" + currentdate.getDate()).slice(-2) + " "

	var st_date = datetime + '00:00';
	var en_date = datetime + '23:59';
	$('#filter_startdate').val(st_date);
	$('#filter_enddate').val(en_date);

}

/**
* display minitor error on table
*
* @param {json} row The data for the whole row
*/
srvData.onClickDisplay = function(){
	var self = srvData; //initial data
	var agency = $('#filter_agency').val(); //ageney id
	var startDate = $('#filter_startdate').val(); //start date
	var endDate = $('#filter_enddate').val(); //end date

	if(!startDate || !endDate || !agency) {
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

	var date_range = parseInt($('#date_range').val()); //date range
	startDate = new Date(startDate)
	var stDate = startDate.setDate( startDate.getDate()); // start date
	maxDate = startDate.setDate( startDate.getDate() + 30 );
	endDate = new Date(endDate)
	endDate = endDate.setDate( endDate.getDate());


	if(stDate > endDate){

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

	if(endDate > maxDate){
		bootbox.alert({
			message: self.translator['msg_err_date_over_range'].replace('%s',30),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}

	var param = {
		date_start : $('#filter_startdate').val(),
		date_end : $('#filter_enddate').val(),
		agency : ($('#filter_agency').val().join()).split(',').map(function(item) {
			return parseInt(item);
		})
	}


	apiService.SendRequest('GET', srvData.service_event_tracking_invalid_data, param, function(dt){

		srvData.dataTable.clear()
		if( JH.GetJsonValue(dt , "result") != "OK"){ return false; }
		srvData.obj_data = dt;
		srvData.dataTable.rows.add( JH.GetJsonValue(dt , "data") );
		srvData.dataTable.draw()

	})
}


/**
* diplay form to add detail error
*
*/
srvData.dlgDetailError = function(){
	var checked_box = $('input:checkbox[name="selected[]"]:checked').map(function(){
		return this.value;
	}).get().join(); //monitor error id

	if(!checked_box){
		bootbox.alert({
			message: srvData.translator['msg_unselected_data'],
			buttons: {
				ok: {
					label: srvData.translator['btn_close']
				}
			}
		})

		return false
	}

	var count = $('input:checkbox[name="selected[]"]:checked').length; //amount selected check box


	if(count > 1){
		$(jid + '-detail').val('');
	}else{
		var row = $('input:checkbox[name="selected[]"]:checked').attr('data-row');
		var data = srvData.obj_data['data'][row]['solve_event']
		$(jid + '-detail').val(data);
	}


	var frm = $(jid + '-form')
	frm.parsley().reset()

	$(jid).modal({
		backdrop : 'static',
	})
}


/**
* Save data
*
*/
srvData.saveMon_error_data = function(){
	var frm = $(jid + '-form'); //element form
	frm.parsley().validate()

	if(!frm.parsley().isValid()){
		return false
	}

	var evt_id_string = $('input:checkbox[name="selected[]"]:checked').map(function(){
		return this.value;
	}).get().join(); //event id

	var evt_id_arr = evt_id_string.split(',').map(function(item) {
		return parseInt(item);
	}); //array event id

	var param = {
		event_log_id : evt_id_arr,
		event_message : $('#dlgDetailError-detail').val()
	}

	apiService.SendRequest('PUT', srvData.service_event_tracking_invalid_data, param, function(data){

		if(data.result !== "OK"){
			return false
		}

		bootbox.alert({
			message: srvData.translator['msg_save_suc'],
			buttons: {
				ok: {
					label: srvData.translator['btn_close']
				}
			}
		})

		srvData.onClickDisplay()
	});

	$('#dlgDetailError').modal('hide')
}


/**
* create option into agency filter
*
* @param {json} dt agency data
*/
srvData.genFilterAgency = function(dt){
	var option_filter = document.getElementById('filter_agency'); //ageneycelement
	var data_agency = apiService.getFieldValue(dt,'data.agency'); //initial agency data

	if ( data_agency == null ) {
		return
	}

	if(typeof data_agency === undefined || data_agency == null){return false}

	for(var i=0; i<data_agency.length; i++){
		var ag =  data_agency[i]['text']; //agency data
		var gen_option = document.createElement('option'); //create option
		var txt_option = JH.GetJsonLangValue(data_agency[i],'text',true); //option name
		var val_option = data_agency[i]['value']; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		option_filter.add(gen_option);
	}
	$(option_filter).multiselect({includeSelectAllOption:true});
	$(option_filter).multiselect('rebuild');
	$(option_filter).multiselect('selectAll',false);
	$(option_filter).multiselect('updateButtonText');
}

/**
* create check boxon column check box
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnCheckbox = function(row, type, set, meta){
	var id = row['event_log_id'];
	return '<td><input class="checkbox" type="checkbox" name="selected[]" id="'+id+'" value="'+id+'" data-row="'+meta.row+'"></td>'
}

/**
* put data into column event code
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_code = function(row){
	return JH.GetJsonValue(row,'event_code')
}

/**
* put data into column event date
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_date = function(row){
	return  JH.GetJsonValue(row,'event_date')
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
* put data into column event message
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_message = function(row){
	return JH.GetJsonValue(row,'event_message')
}

/**
* put data into column send error at
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnSend_error_at = function(row){
	var date =  JH.GetJsonValue(row,'send_error_at')

	return date.substring(0,11);
}

/**
* put data into column solve event at
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnSovle_event_at = function(row){
	return JH.GetJsonValue(row,'solve_event_at')
}


/**
* checkbox selected all
*
*/
$('#tbl-mon-error-dgmt').on('change' , '#select_all' , function(){
	var checked = $(this).is(':checked'); //checked select box
	$('.checkbox').each(function(){
		$(this).prop('checked' , checked);
	});
});
