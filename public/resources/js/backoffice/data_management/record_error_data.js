/**
*
*   Main JS application file for record error data page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvData = {}; //initial data
var jid = '#dlgRecordError'; //prefix id of element in form

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	srvData.translator = translator; //Text for label and message on java script
	srvData.service_event_send_invalid_data = '/thaiwater30/backoffice/data_management/event_send_invalid_data'; //service event send invalid data
	srvData.service_event_tracking_option_list = '/thaiwater30/backoffice/data_management/event_tracking_option_list'; //service event tracking log list

	apiService.SendRequest('GET', srvData.service_event_tracking_option_list, {}, function(rs){
		srvData.genFilterAgency(rs);
		srvData.onClickDisplay(rs);
	})


	srvData.tableId = 'tbl-record-err-data'; //record error data table id
	ctrl = $('#' + srvData.tableId)
	srvData.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		language : g_dataTablesTranslator,
		buttons : [{
			text : "<i class='fa fa-floppy-o' aria-hidden='true'></i> " + srvData.translator['btn_mistake_send_data'],
			action :srvData.dlgRecordError,
		}],
		columns : [
			{
				data :  srvData.renderColumnCheckbox,
				orderable : false,
				searchable : false,
			},
			{
				data :  srvData.renderColumnEvent_date,
			},
			{
				data :  srvData.renderColumnScript_name,
			},
			{
				data :  srvData.renderColumnAgency_name,
			},
			{
				data : srvData.renderColumnEvent_message,
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
		$('#btn_save').on('click', srvData.saveRecord_error_data)

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
		$("#dlg-date").datepicker({
			autoclose: true,
			dateFormat: 'yyyy-mm-dd'
		})

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
* get the data to generate data rows on data table
*
*/
srvData.onClickDisplay = function(){
		var self = srvData; //initial data
		var agency = $('#filter_agency').val(); //agency id
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

		var date_range = parseInt($('#date_range').val());
		startDate = new Date(startDate)
		// console.log("startDate.getDate():",startDate.getDate())
		var stDate = startDate.setDate( startDate.getDate());
		// console.log("startDate:",startDate);

		maxDate = startDate.setDate( startDate.getDate() + 30 );
		// console.log("maxDate:",maxDate);

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
			$('#filter_enddate').val('');
			return false
		}

		var param = {
			date_start : $('#filter_startdate').val(),
			date_end : $('#filter_enddate').val(),
			agency : ($('#filter_agency').val().join()).split(',').map(function(item) {
				return parseInt(item);
			})
		}


		apiService.SendRequest('GET', srvData.service_event_send_invalid_data, param, function(dt){

			srvData.dataTable.clear()
			if ( JH.GetJsonValue(dt , "result") != "OK"){ return false; }
			srvData.dataTable.rows.add( JH.GetJsonValue(dt , "data") );
			srvData.dataTable.draw()

		})

	}

/**
* display form insert recode error data
*
*/
srvData.dlgRecordError = function(){
	var checked_box = $('input:checkbox[name="selected[]"]:checked').map(function(){
		return this.value;
	}).get().join(); //record error id

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

	var frm = $(jid + '-form'); //elmenet form
	frm.parsley().reset()

	$(jid).modal({
		backdrop : 'static',
	})
	$("#dlg-date").datepicker('setDate', new Date());
	$("#dlg-date").datepicker('update');
}

/**
* create option into agency filter
*
* @param {json} dt agency data
*/
srvData.genFilterAgency = function(dt){
		var option_filter = document.getElementById('filter_agency'); //element agency filter
		var data_agency = apiService.getFieldValue(dt,'data.agency'); //agency data

		if ( data_agency == null ) {
			return
		}

		for(var i=0; i<data_agency.length; i++){
			var ag =  data_agency[i]['text']; //agency data
			var gen_option = document.createElement('option'); //create option element
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
* create check box
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnCheckbox = function(row){
		var id = row['event_log_id']
		return '<td><input class="checkbox" type="checkbox" name="selected[]" id="'+id+'" value="'+id+'"></td>'
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
		return JH.GetJsonValue(row,'event_date')
	}

/**
* put data into column script name
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnScript_name = function(row){
		return JH.GetJsonValue(row,'script_name')
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

//Checkbox Selected All
$('#tbl-record-err-data').on('change' , '#select_all' , function(){
		var checked = $(this).is(':checked');
		$('.checkbox').each(function(){
			$(this).prop('checked' , checked);
		});
	});

/**
* save record error data
*
*/
srvData.saveRecord_error_data = function(){
	var frm = $(jid + '-form'); //element form
	frm.parsley().validate();

	if(!frm.parsley().isValid()){
		$('.parsley-errors-list').css({'display':'none'});
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
		event_date : $('#dlg-date').val()
	} //parameter

	apiService.SendRequest('PUT', srvData.service_event_send_invalid_data, param, function(data){

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
		$('input:checkbox[name="selected[]"]:checked').each(function(){
			srvData.dataTable.row($(this).closest('tr')).remove().draw();
		});
	});

	$('#dlgRecordError').modal('hide')
}
