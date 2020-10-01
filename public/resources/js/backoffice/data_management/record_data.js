/**
*
*   Main JS application file for record data page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data
var jid = '#dlgSaveEdit'; //prefix id



/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	srvData.translator = translator; //Text for label and message on java script
	srvData.service_event_tracking_solve = '/thaiwater30/backoffice/data_management/event_tracking_solve'; //service event tracking solve
	srvData.service_event_tracking_option_list = 'thaiwater30/backoffice/data_management/event_tracking_option_list/solve_data'; //service solve dataS
	apiService.SendRequest('GET', srvData.service_event_tracking_option_list, {}, function(rs){
		srvData.genFilterAgency(rs);
		srvData.btnClickDisplay(rs);
	})


	srvData.recoredDataTableId = 'tbl-record-data'; //record data table id
	ctrl = $('#' + srvData.recoredDataTableId);
	srvData.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		language : g_dataTablesTranslator,
		buttons : [{
			text : '<i class="fa fa-floppy-o" aria-hidden="true"></i> ' + srvData.translator['btn_edit_event'],
			action : srvData.dlgRecord_data
		}],
		columns : [
			{
				data :  srvData.renderColumnCheckbox,
				orderable : false,
				searchable : false
			},{
				data :  srvData.renderColumnEvent_date,
			},{
				data :  srvData.renderColumnAgency_name,
			},{
				data :  srvData.renderColumnEvent_type,
			},{
				data :  srvData.renderColumnEvent_subtype,
			},{
				data :  srvData.renderColumnMetadata,
			},{
				data : srvData.renderColumnEvent_message,
			}
		],
		order : [ [ 1, 'desc' ] ],
		rowCallback : '',
	});

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


	$('#btn_preview').on('click',srvData.btnClickDisplay);
	$('#btn_save').on('click', srvData.saveRecode_Data);

	$('#filter_startdate,#filter_enddate').datetimepicker({
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

	var currentdate = new Date(); //current date
	var datetime = 	currentdate.getFullYear() + "-"
	+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
	+ ("0" + currentdate.getDate()).slice(-2) + " "; //current date in format

	var st_date = datetime + '00:00'; //begin time
	var en_date = datetime + '23:59'; //end time
	$('#filter_startdate').val(st_date);
	$('#filter_enddate').val(en_date);

	$('#filter_eventype').on('change', srvData.eventTypeChange);
}


/**
* Update option on filter event subtype
*
*/
srvData.eventTypeChange = function(){
	var eventType = $(this).val(); //event type id
	var source = JH.Get('event_sub_type_' + eventType); //event sub-type data
	var select = srvData.createOption(null, "event_sub_type", source, true); //element option

	$(select).select2();
	if (eventType == "all"){
		$(select).prop('disabled',true);
	}else{
		$(select).prop('disabled',false);
	}
}


/**
* get the data to create option
*
* @param {json} agency data
*/
srvData.genFilterAgency = function(dt){
	if(dt['data']['agency']){
		var filter_name = 'agency'; //filter name
		var dt_agency = dt['data']['agency']; //agency data
		var select = srvData.createOption(dt,filter_name,dt_agency); //element option

		$(select).multiselect({includeSelectAllOption:true});
		$(select).multiselect('rebuild');
		$(select).multiselect('selectAll',false);
		$(select).multiselect('updateButtonText');
	}

	if(dt['data']['event_type']){
		var filter_name = 'event_type'; //filter name
		var event_type = dt['data']['event_type']; //event type
		var select = srvData.createOption(dt,filter_name,event_type, true); //element option

		$(select).select2().triggerHandler('change');
	}
}


/**
* cretate option into filter
*
* @param {json} dt the data from service
* @param {string} name filter name
* @param {json} data data to generate option
* @param {boolean} addSelectAll selected all
*/
srvData.createOption = function(dt,name,data, addSelectAll){
	var option_filter; //element filter
	var addCache = false; //add cache

	if(name == 'agency'){
		option_filter = document.getElementById('filter_agency');
	}else if(name == 'event_type'){
		option_filter = document.getElementById('filter_eventype');
		addCache = "event_sub_type";
	}else{
		option_filter = document.getElementById('filter_event_sub_type');
	}

	if (addSelectAll){
		option_filter.options.length = 0;
		var gen_option = document.createElement('option'); //create element option
		gen_option.text = TRANS["msg_display_all"];
		gen_option.value = "all";
		option_filter.add(gen_option);
	}

	if(data){
		JH.Sort(data,"text",false , function(str){
			if(str.th){
				return str.th.toLowerCase();
			}else if(str.en){
				return str.en.toLowerCase();
			}else if(str.jp){
				return str.jp.toLowerCase();
			}else{
				return ''
			}
		})
	}

	if(typeof data === undefined || data == null){return false}
	for(var i=0; i<data.length; i++){
		var d = data[i]; //prepare data to create option list
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonLangValue(d,"text",true); //option name

		if(name == 'event_sub_type' || name == 'agency'){
			var txt_option = JH.GetJsonLangValue(d,"text",true); //opiton name for event sub-type and agency
		}else{
			var txt_option = JH.GetJsonValue(d,"text"); //option name for event type
		}

		txt_option = $.trim(txt_option)
		var val_option = JH.GetJsonValue(d,'value'); //option value

		if (addCache){
			JH.Set(addCache+"_"+val_option, JH.GetJsonValue(d, addCache));
		}

		gen_option.text = txt_option;
		gen_option.value = val_option;
		option_filter.add(gen_option);
	}
	return option_filter;
}



/**
* generate data row on data table
*
*/
srvData.btnClickDisplay = function(){
	var self = srvData; //initial data
	var agency = $('#filter_agency').val(); //agency id
	var eventype =$('#filter_eventype').val(); //event type id
	var subtype = $('#filter_event_sub_type').val(); //event sub-type id
	var startDate = $('#filter_startdate').val(); //start date
	var endDate = $('#filter_enddate').val(); //end date

	if(!startDate || !endDate || !agency || !eventype || !subtype) {
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
	var stDate = startDate.setDate( startDate.getDate()); //start date

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
		$('#filter_enddate').val('');
		return false
	}

	var param = {
		date_start : $('#filter_startdate').val(),
		date_end : $('#filter_enddate').val(),
		agency : ($('#filter_agency').val().join()).split(',').map(function(item) {
			return parseInt(item);
		}),
		event_type : $('#filter_eventype').val() == "all" ? [] : [ parseInt($('#filter_eventype').val()) ],
		event_sub_type : $('#filter_event_sub_type').val() == "all" ? [] : [ parseInt($('#filter_event_sub_type').val()) ],
		sovle_event : false
	}

	var sovle_event = false;


	apiService.SendRequest('GET', srvData.service_event_tracking_solve, param, function(dt){

		srvData.dataTable.clear()

		if ( JH.GetJsonValue(dt , "result") != "OK"){ return false; }
		srvData.dataTable.rows.add( JH.GetJsonValue(dt , "data") );
		srvData.dataTable.draw()

	})
}


/**
* display form to input editing events
*
*/
srvData.dlgRecord_data = function(){

	$('#dlgSaveEdit-edit-procedure').val('');
	var checked_box = $('input:checkbox[name="selected[]"]:checked').map(function(){
		return this.value;
	}).get().join();
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

	var frm = $(jid + '-form')
	frm.parsley().reset()

	$(jid).modal({
		backdrop : 'static',
	})
}


/**
* save editing events
*
*/
srvData.saveRecode_Data = function(){

	var evt_id_string = $('input:checkbox[name="selected[]"]:checked').map(function(){
		return this.value;
	}).get().join(); //event id

	var evt_id_arr = evt_id_string.split(',').map(function(item) {
		return parseInt(item);
	}); //array event id

	var param = {
		event_log_id : evt_id_arr,
		event_message : $('#dlgSaveEdit-edit-procedure').val()
	}

	var frm = $(jid + '-form')
	frm.parsley().validate()

	if(!frm.parsley().isValid()){
		return false
	}

	apiService.SendRequest('PUT', srvData.service_event_tracking_solve, param, function(data){

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

	$('#dlgSaveEdit').modal('hide')
}

/**
* create check in row
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnCheckbox = function(row){
	var id = row['event_log_id']; //event log id
	return '<td><input class="checkbox" type="checkbox" name="selected[]" id="'+id+'" value="'+id+'"></td>'
}

/**
* put data into column metadata
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnMetadata = function(row){
	var meta_data = row.metadataservice_name; //initial metadata service
	var name = ''; //
	if(meta_data){
		for(var i=0; i<meta_data.length; i++){
			var text = meta_data[i]; //metadata service data
			if(text){
				var jData= jQuery.parseJSON(text); //metadata service name
				if(i == meta_data.length-1){
					name+= JH.GetLangValue(jData)
				}else{
					name+= JH.GetLangValue(jData) + ','
				}
			}
		}
		return name;
	}else{
		return '';
	}
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
* put data into column agency name
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnAgency_name = function(row){
	return JH.GetJsonLangValue(row,'agency_name',true)
}

/**
* put data into column event type
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_type = function(row){
	return JH.GetJsonValue(row, 'event_code');
}

/**
* put data into column event sub-type
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_subtype = function(row){
	return JH.GetJsonLangValue(row,'event_sub_type',true)
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
* Checkbox Selected All
*
*/
$('#tbl-record-data').on('change' , '#select_all' , function(){
	var checked = $(this).is(':checked');
	$('.checkbox').each(function(){
		$(this).prop('checked' , checked);
	});
});
