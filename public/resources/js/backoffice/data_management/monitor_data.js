/**
*
*   Main JS application file for monitor data page.
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
	self.translator = translator; //Text for label and message on java script

	self.service_event_tracking = '/thaiwater30/backoffice/data_management/event_tracking'; //service event tracking
	self.service_event_tracking_option_list = '/thaiwater30/backoffice/data_management/event_tracking_option_list'; //service event tracking option list
	self.service_event_file_csv = 'thaiwater30/backoffice/data_management/event_file_csv'; //service event file csv

	apiService.SendRequest('GET', self.service_event_tracking_option_list, {}, function(rs){
		self.genFilterAgency(rs);
		self.btnClickDisplay();
	})

	self.groupTableId = 'tbl-monitor-data';
	ctrl = $('#' + self.groupTableId);
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
		},{
			data :  srvData.renderColumnAgency_name
		},{
			data :  srvData.renderColumnEvent_type
		},{
			data :  srvData.renderColumnEvent_subtype
		},{
			data :  srvData.renderColumnMetadata
		},{
			data :  srvData.renderColumnEvent_message
		},{
			data :  srvData.renderColumnSatatus
		},{
			data :  srvData.renderColumnSolve_event_at
		},{
			data : self.renderButtonCSV
		}	],
		order : [ [ 1, 'desc' ] ],
		rowCallback : '',
	});

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

	var currentdate = new Date(); //current dateand time
	var datetime = 	currentdate.getFullYear() + "-"
	+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
	+ ("0" + currentdate.getDate()).slice(-2) + " "; //set format for date

	var st_date = datetime + '00:00'; //begin time
	var en_date = datetime + '23:59'; //end time

	$('#filter_startdate').val(st_date);
	$('#filter_enddate').val(en_date);
	$('#btn_display').on('click',self.btnClickDisplay);
	ctrl.on('click', '.btn-csv',self.downloadCSV);
	$('#filter_eventype').on('change', srvData.eventTypeChange);
};


/**
* Update option on filter event type
*
*/
srvData.eventTypeChange = function(){
	var val = $(this).val();
	var source = JH.Get('event_sub_type_' + val);
	var select = srvData.createOption(null, "event_sub_type", source, true);

	/* add box search in dropdown */
	$(select).select2();

	if (val == "all"){
		$(select).prop('disabled',true);
	}else{
		$(select).prop('disabled',false);
	}
}


/**
* download file csv
*
*/
srvData.downloadCSV = function(e){
	var event_log_id = $(this).attr('data-key'); //event log id
	var url = apiService.BuildURL(srvData.service_event_file_csv); //url to download csv file

	url += '&event_log_id=' + event_log_id;

	if ( typeof(e) == "object" ) {
		e.preventDefault()
	}
	window.location.href = url;
}


/**
* Get the data to render row on data table
*
*/
srvData.btnClickDisplay = function(){
	var self = srvData; //initial data
	var agency = $('#filter_agency').val(); //agency id
	var eventype =$('#filter_eventype').val(); //ecent type id
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

	var date_range = parseInt($('#date_range').val());  //date range
	startDate = new Date(startDate);
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

	}

	var sovle_event = $('#no-edited:checked').val()

	if(sovle_event){
		param['solve_event'] = true
	}else{
		param['solve_event'] = false
	}


	apiService.SendRequest('GET', self.service_event_tracking, param, function(dt){
		srvData.dataTable.clear()
		if ( JH.GetJsonValue(dt , "result") != "OK"){ return false; }
		srvData.dataTable.rows.add( JH.GetJsonValue(dt , "data") );
		srvData.dataTable.draw()

	})
}


/**
* create option into filter agency
*
* @param {json} dt agency data
*/
srvData.genFilterAgency = function(dt){
	if(dt['data']['agency']){

		var filter_name = 'agency'; //filter name
		var dt_agency = dt['data']['agency']; //agency data

		/* sort option list by alphabet */
		JH.Sort(dt_agency, 'text', false, function(x){
			return JH.GetLangValue(x).toLowerCase();
		})

		var select = srvData.createOption(dt,filter_name,dt_agency); //create option list
		$(select).multiselect({includeSelectAllOption:true});
		$(select).multiselect('rebuild');
		$(select).multiselect('selectAll',false);
		$(select).multiselect('updateButtonText');
	}

	if(dt['data']['event_type']){
		var filter_name = 'event_type'; //filter name
		var dt_agency = dt['data']['event_type']; //event type data
		var select = srvData.createOption(dt,filter_name,dt_agency, true);
		$(select).select2().triggerHandler('change');
	}
}


/**
* create on filter
*
* @param {json} dt initial data from service event tracking option list
* @param {json} name filter name
* @param {json} data data to generate option
* @param {json} addSelectAll selected all
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
		var gen_option = document.createElement('option'); //creat element option
		gen_option.text = TRANS["msg_display_all"];
		gen_option.value = "all";
		option_filter.add(gen_option);
	}

	if(typeof data === undefined || data == null){return false}

	for(var i=0; i < data.length; i++){
		var d = data[i]; //prepare data to create option list
		var gen_option = document.createElement('option'); //create element option

		if(name == 'event_sub_type' || name == 'agency'){
			var txt_option = JH.GetJsonLangValue(d,"text",true); //option list for event sub type or agecy dropdown
		}else{
			var txt_option = JH.GetJsonValue(d,"text"); //option list for event sub-type dropdown
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
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnMetadata = function(row){
	var meta_data = row.metadataservice_name; //metadata service data
	var name = ''; //prepare metadata servie name

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
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_date = function(row){
	return JH.GetJsonValue(row, 'event_date')
}

/**
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnAgency_name = function(row){
	return JH.GetJsonLangValue(row,'agency_name',true)
}

/**
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_type = function(row){
	return JH.GetJsonValue(row, 'event_code');
}

/**
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_subtype = function(row){
	return JH.GetJsonLangValue(row,'event_sub_type',true)
}

/**
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnEvent_message = function(row){
	return JH.GetJsonValue(row, 'event_message')
}

/**
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnSatatus = function(row){
	var status = JH.GetJsonValue(row, 'status_notify')
	if(status == 'Yes'){
		return srvData.translator['notification_to_mail'];
	}else if(status == 'No'){
		return srvData.translator['not_notification'];
	}else{
		return '';
	}
}

/**
* put data into column
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnSolve_event_at = function(row){
	return JH.GetJsonValue(row, 'solve_event_at')
}

/**
* create download file CSV
*
* @param {json} row The data for the whole row
*/
srvData.renderButtonCSV = function(row){
	if(row['filepath'] == true){
		return '<i class="fa fa-file-excel-o btn btn-csv color-green" title="'+srvData.translator['download_csv']+'"'  +
		'data-key="'+row['event_log_id']+'" aria-hidden="true"></i>'
	}else {
		return ''
	}
}
