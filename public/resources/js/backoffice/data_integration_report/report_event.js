/**
*
*   Main JS application file for report event page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvData = {}; //initial data
var date_range; //date range
var jid = "#dlg-reportEvent-"; //prefix id element in form

/**
* Prepare data for page.
*
* @param {json} translator Text label.
* @param {json} initVar
*/
srvData.init = function(translator,initVar) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.initVar = initVar; //parameter initial
	self.fromInitVar = false;
	moment.locale('th');

	self.service_eventload = '/thaiwater30/backoffice/data_integration_report/event_load'; // ur; call service event_load
	self.service_event_log_category_summary = '/thaiwater30/backoffice/data_integration_report/event_log_category_summary';// ur; call service event_log_category_summary
	self.service_event_code_summary = '/thaiwater30/backoffice/data_integration_report/event_code_summary';// ur; call service event_code_summary
	self.service_event_code_list = '/thaiwater30/backoffice/data_integration_report/event_code_list';// ur; call service event_code_list
	self.service_event_detail = '/thaiwater30/backoffice/data_integration_report/event_detail';// ur; call service event_detail

	//Setiing data table detail on modal.
	self.summaryTableDetail = 'dlg-reportEvent-tbl-reportEvent'; //datable id
	dlg_ctrl = $('#' + self.summaryTableDetail); //element datatable
	self.dlg_dataTable = dlg_ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [
			{
				data :  self.renderEvent_log_date
			},
			{
				data :  self.renderAgency,
			},
			{
				data :  self.renderMetadataName,
			},
			{
				data :  self.renderEventCategory,
			},
			{
				data :  self.renderEventCode,
			},
			{
				data :  self.renderDescription,
			},
			{
				data :  self.renderDurationTime,
			}
		],
		order : [ [ 1, 'desc' ] ],
		rowCallback : ''
	})

	$('#div_loading').hide();

	/* Event on click preview button */
	$('#btn_display').on('click',self.onClickPreview);

	$('#dlg-btn-display').on('click', self.displaySummaryDetail);

	/* Seting general for dropdown multiselect */
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


	$("#st_date").datepicker('setDate', new Date());
	$("#en_date").datepicker('setDate', new Date());
	$('#dlg-reportEvent-event').on('change', srvData.eventChange);

	srvData.filter_startdate = $('#st_date').val();
	srvData.filter_enddate = $('#en_date').val();

	var param = {
		start_date :  $('#st_date').val(),
		end_date : $('#en_date').val()
	}

	// Get the data to generate filter.
	apiService.SendRequest('GET', self.service_eventload, param, function(data){
		$('#date_range').val(data.data.date_range);
		self.genFilterAgency(data);
		self.setDefaultFilterDate(data);
		self.gendlgFilterAgency(data);
		self.gendlgFilterEvent(data);
		self.genPieChart(data);
		self.runQueryString();
	});
}

/**
* Setting defaule for date filter.
*
*/
srvData.runQueryString = function(){
	if ( JH.GetJsonValue( srvData.initVar, "event_code_id" ) ){
		$("#filter_startdate").datepicker('setDate', moment(srvData.initVar["start_date"]).format('YYYY-MM-DD'));
		$("#filter_enddate").datepicker('setDate', moment(srvData.initVar["end_date"]).format('YYYY-MM-DD'));
		srvData.fromInitVar = true;
		srvData.onClickPreview();
	}
}

/**
* filter Event change
*
*/
srvData.eventChange = function(){
	var event_id = $('#dlg-reportEvent-event').val(); //event id
	$('#dlg-reportEvent-subevent > option').not('.op_default').remove();
	if(event_id){
		apiService.SendRequest('GET', srvData.service_event_code_list,{event_log_category_id:event_id}, srvData.genFilterEventCode);
	}
}

/**
* Generate option list into agency dropdown.
*
* @param {json} agency_data The agency data.
*/
srvData.genFilterAgency = function(agency_data){
	var self = srvData; //initial data
	var filter_agency = document.getElementById('filter_agency'); //element filter agency
	var arr_agency = apiService.getFieldValue(agency_data,'data.agency_list') //agency data

	if ( arr_agency == null ) {
		return
	}

	for(var i=0; i<arr_agency.length; i++){
		var agency_data = arr_agency[i]; //agency data
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonLangValue(agency_data,'agency_name',true); //agency name
		var val_option = JH.GetJsonValue(agency_data, 'id'); //agency id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_agency.add(gen_option);
	}
	$(filter_agency).multiselect({includeSelectAllOption:true});
	$(filter_agency).multiselect('rebuild');
	$(filter_agency).multiselect('selectAll',false);
	$(filter_agency).multiselect('updateButtonText');
}

/**
* Generate option list into agency dropdown on modal.
*
* @param {json} agency_data The agency data.
*/
srvData.gendlgFilterAgency = function(agency_data){
	var self = srvData; //initial data
	var dlg_reportEvent_agency = document.getElementById('dlg-reportEvent-agency'); //element agency
	var arr_agency = agency_data['data']['agency_list']; //agency data
	var arr_agency = apiService.getFieldValue(agency_data,'data.agency_list'); //agency id

	if ( arr_agency == null ) {
		return
	}

	for(var i=0; i<arr_agency.length; i++){
		var agency_data = arr_agency[i]; //ageny data
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonLangValue(agency_data , 'agency_name',true); //agency name
		var val_option = JH.GetJsonValue(agency_data, 'id'); //agenyc id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		dlg_reportEvent_agency.add(gen_option);
	}
	$(dlg_reportEvent_agency).multiselect({includeSelectAllOption:true});
	$(dlg_reportEvent_agency).multiselect('rebuild');
	$(dlg_reportEvent_agency).multiselect('selectAll',false);
	$(dlg_reportEvent_agency).multiselect('updateButtonText');
}

/**
* Generate option list into event dropdown on modal.
*
* @param {json} event_data The devent type data.
*/
srvData.gendlgFilterEvent = function(event_data){
	var self = srvData; //initial data
	var dlg_reportEvent_event = document.getElementById('dlg-reportEvent-event'); //element event repotr on modal
	var arr_event = apiService.getFieldValue(event_data,'data.event_log_category_list')//event data list
	if ( arr_event == null ) {
		return
	}

	for(var i=0; i<arr_event.length; i++){
		var event_data = arr_event[i]; //event data
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonValue(event_data , 'code'); // event name
		var val_option = JH.GetJsonValue(event_data, 'id'); // event id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		dlg_reportEvent_event.add(gen_option);
	}
}

/**
* Generate option list into event code dropdown.
*
* @param {json} event_data The devent type data.
*/
srvData.genFilterEventCode = function(event_code){
	$('#dlg-reportEvent-subevent > option').not('.op_default').remove();
	var self = srvData; //initial data
	var filter_subevent = document.getElementById('dlg-reportEvent-subevent'); //element subevent on modal
	var data = apiService.getFieldValue(event_code,'data'); // sub-event data list

	if ( data == null ) {
		return
	}

	for(var i=0; i<data.length; i++){
		var sub_event = data[i]; // sub-event data
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonLangValue(sub_event , 'description',true); //sub-event name
		var val_option = JH.GetJsonValue(sub_event, 'id'); //sub-event id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_subevent.add(gen_option);
	}
}

/**
* Prepare data to get data form service to dislay.
*
*/
srvData.onClickPreview = function(){
	var self = srvData; //initial data
	var val_start_date = $('#filter_startdate').val(); //start date
	var val_end_date	= $('#filter_enddate').val(); //end date
	var agency_id	= $('#filter_agency').val(); // agency

	if(!val_start_date || !val_end_date || !agency_id){
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

	srvData.filter_startdate = val_start_date; //start date
	srvData.filter_enddate = val_end_date; //end date
	var startDate = $('#filter_startdate').datepicker( "getDate" ); // start date in format datepicker
	var endDate = $('#filter_enddate').datepicker( "getDate" ); // end date in format datepicker
	var date_range = parseInt($('#date_range').val()); //date range
	var stDate = startDate.setDate( startDate.getDate()); //convert date to integer

	maxDate = startDate.setDate( startDate.getDate() + date_range );
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

		return false;
	}
	if(endDate > maxDate){
		bootbox.alert({
			message: self.translator['msg_err_date_over_range'].replace('%s',date_range),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		$('#filter_enddate').val('');
		return false
	}

	var val_agency_id = $('#filter_agency').val().join(); //merge multiple agency
	param = {
		agency_id : val_agency_id,
		start_date : val_start_date,
		end_date : val_end_date
	}

	// Get the data to display is pie graph and tabs on page.
	apiService.SendRequest('GET', self.service_event_log_category_summary, param, self.genPieChart);
}

/**
* Create data event report table.
*
* @param {json} data the data to generate pie chart and tabs.
*/
srvData.genPieChart = function(data){
	var self = srvData; //initial data
	var defaultPanel = -1;
	var d = [];
	var name = Array(); //name in chart
	var value = Array(); //value in chart
	var dataArrayFinal = Array(); //the data to generate pie chart.
	var data_chart = apiService.getFieldValue(data,'data.event_log_category_summary'); //data to generate chart
	var data_header = apiService.getFieldValue(data,'data.event_log_category_summary_by_agency'); //name on tabpane

	if ( data_chart == null || data_header == null) {
		return
	}

	// Check data to display summary is not null
	if(data_header.length > 0){
		$('#data-notfound').hide();
		$('#accordion').show();
		$('div.panel').remove();

		var category_id =  data_header[0]['event_log_category'][0]['id'].toString(); //category id

		// Create tabs pane.
		for(var i = 0; i < data_header.length; i++){
			var title = data_header[i]; //title name list
			var cat_id = data_header[i]['event_log_category'][0]['id']; //category id
			var agen_id = data_header[i]['agency']['id']; //agency id
			var title_name = ''; //title name on tabpane


			if ( (srvData.initVar["agency_id"] == agen_id) && srvData.fromInitVar && defaultPanel == -1){
				defaultPanel = i;
			}

			//Add comma on name tabs?
			var event_log_category = apiService.getFieldValue(title,'event_log_category'); //event log category

			if ( event_log_category == null) {
				return
			}

			for(var j=0; j<event_log_category.length; j++){
				if ( j != 0){
					title_name += ", ";
				}
				title_name += event_log_category[j]['code'] +' ('+ event_log_category[j]['summary_event']+')';
			}

			//Create tabs.
			$('#accordion').append('<div id="tab-summary-'+i+'" class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title"> <a id="panel-title-'+i+'" class="panel-title-text" data-on="true" data-row="'+i+'" data-id="'+cat_id+'" data-agency="'+agen_id+'" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+i+'">'+title.agency.agency_shortname.en+' : '+title_name+'</a> </h4> </div> <div id="collapse-'+i
			+'" class="panel-collapse collapse" style="padding:2%"> </div> </div>');
		}

		/* Onclick to taps */
		$('.panel-title-text').on('click',function(){
			// Generate data table when click open tab.
			var self = srvData; //initial data
			var row = $(this).attr('data-row'); // row number
			var id = $(this).attr('data-id'); // event report id

			srvData.agency_id = $(this).attr('data-agency'); //agency id

			self.genDataTableEvent(row); // Generate table in tabs.

			var param = {
				start_date :  srvData.filter_startdate,
				end_date : srvData.filter_enddate,
				agency_id : $(this).attr('data-agency')
			}

			// Get the data to put data table on tabs.
			apiService.SendRequest('GET', self.service_event_code_summary, param, self.putDataTableEvent)
		})

		if ( defaultPanel >= 0 ){
			$('div#tab-summary-'+defaultPanel + ' .panel-title-text').trigger('click');
		}

	}else{
		// Display message 'not found data',When query data is null.
		$('#data-notfound').show()
		$('#accordion').hide()
	}

	/* create Pie chart */
	for(i=0;i<data_chart.length;i++) {

		var sum_event = data_chart[i]['summary_event']
		sum_event = parseInt(sum_event);

		name[i] = data_chart[i].code +':'+ sum_event.toLocaleString(); // name data on chart.
		value[i] = data_chart[i].summary_event; // data on chart.
		var temp = new Array(name[i],value[i]);
		dataArrayFinal[i] = temp;
	}

	//hight chart setting.
	Highcharts.chart('container-highchart', {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		title: {
			text: srvData.translator['title_chart']
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.2f} %',
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
					}
				}
			}
		},
		series: [{
			name: srvData.translator['title_percent'],
			colorByPoint: true,
			data: dataArrayFinal
		}]
	});
}

/**
* Create data event report table on tabs.
*
*/
srvData.genDataTableEvent = function(id){
	var self = srvData; //initail data

	/* Remove old  event report table on tabs is closed */
	$('.panel-collapse > div.table-responsive').remove();
	$('#collapse-'+id+' p').remove();

	//Generate new event report table on tabs is opening.
	$('#collapse-' + id).append('<div class="table-responsive"> <table id="tbl-reportEvent" class="display admin-datatables" width="100%"> <thead><tr>  <th>'
	+srvData.translator['col_order']+'</th>  <th>'
	+srvData.translator['col_event']+'</th> <th>'
	+srvData.translator['col_subevent']+'</th> <th>'
	+srvData.translator['col_amount']+'</th> <th>'
	+srvData.translator['col_detail']+'</th> </tr> </thead> <tfoot>  <tr> <td colspan="3"><b>'
	+srvData.translator['col_total']+'</b></td> <td> <b><span style="float:right;"'+'id ="total_summary_total"></span></b> </td> <td> <b><span style="text-align:left;">'
	+srvData.translator['col_page_allpage']+'</span></b> </td> </tr>  </tfoot> <tbody> </tbody> </table> </div>');

	/* setting table */
	self.settingDataTableEvent();

}

/**
* event report table setting.
*
*/
srvData.settingDataTableEvent = function(){
	var self = srvData; //initial data
	self.summaryTableDetailID = 'tbl-reportEvent'; //event report table id
	ctrlSub = $('#' + self.summaryTableDetailID);
	self.dataTableSummary = ctrlSub.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  srvData.renderColumnEvent,
		},
		{
			data :  srvData.renderColumnEvent_code,
		},
		{
			data :  srvData.renderColumnSummary_event,
		},
		{
			data :  srvData.renderColumnButtontools,
		}],

		"footerCallback": function ( row, data, start, end, display ) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function ( i ) {
				return numeral(i).value();
			};

			// Sum over all pages
			total_summary_total = api.column( 3 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			// Sum over this page, 3 is colum number begin at 0
			total_page_summary_total = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );

			// Update footer
			$('#total_summary_total').html(total_page_summary_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_summary_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

		},
		order : [ [ 1, 'asc' ] ]
	})


	/**
	* Genalate order number on data table.
	*
	*/
	self.dataTableSummary.on('order.dt search.dt', function() {
		self.dataTableSummary.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	// Event click buton on page.
	ctrlSub.on('click','.dlg-report-event', self.displaySummaryDetail);
}

/**
* Put data to rows on data table.
*
* @param {json} data the data to generate rows on data table.
*/
srvData.putDataTableEvent = function(data){
	var self = srvData; //initial data
	var a = []; //data to put on event report table
	var data_event = apiService.getFieldValue(data,'data'); //data event

	if ( data_event == null) {
		return
	}

	for(var i = 0; i<data_event.length; i++){
		a.push(data_event[i]);
	}

	self.dataTableSummary.clear();
	self.dataTableSummary.rows.add(a);
	self.dataTableSummary.draw();

	if ( srvData.fromInitVar ){
		srvData.displaySummaryDetail(srvData.initVar);
	}
}

/**
* Put the data into event coulmn.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The data to display on event coulmn.
*/
srvData.renderColumnEvent = function(row, type, set, meta){
	return JH.GetJsonValue(row,"event_log_category.code");
}

/**
* Put the data into subevent coulmn.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The data to display on subevent coulmn.
*/
srvData.renderColumnEvent_code = function(row, type, set, meta){
	return JH.GetJsonLangValue(row,'description',true);
}

/**
* Create icon diaplay summary detail on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The text elemet HTML.
*/
srvData.renderColumnSummary_event = function(row, type, set, meta){
	var event_sum =  JH.GetJsonValue(row,"summary_event"); //amount event
	// Add comma in number
	return event_sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
* Create icon diaplay summary detail on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The text elemet HTML.
*/
srvData.renderColumnButtontools = function(row, type, set, meta){
	if(row['event_log_category']){
		return '<a class="dlg-report-event" data-agency="'+srvData.agency_id+'" data-id = "'+row.id+'" data-eventcode="'+row.id+'" data-event="'+row.event_log_category.id+'" href="#" data-toggle="modal" data-target="#dlg-reportEvent"><i class="fa fa-columns" aria-hidden="true"></i></a>';
	}
	return ''
}

/**
* display modal summaty detail.
*
* @param {json} data the data to set default filter on modal.
*/
srvData.displaySummaryDetail = function(data){
	var self = srvData; //initial data
	var event_code = $(this).attr('data-eventcode'); //event code
	var event_id = $(this).attr('data-event'); //event id
	var agency_id = $(this).attr('data-agency'); //agency id

	if ( srvData.fromInitVar ){
		event_code = data["event_code_id"];
		event_id = data["event_log_category_id"];
		agency_id = data["agency_id"];
	}

	//Display summary detail from icon click or display click.
	if(event_code){
		param = {
			agency_id : agency_id,
			start_date : srvData.filter_startdate,
			end_date : srvData.filter_enddate,
			event_log_category_id : event_id,
			event_code_id : event_code
		}

		//Get the data to generate option event.
		apiService.SendRequest('GET', self.service_event_code_list,{event_log_category_id:event_id}, function(data){
			self.genFilterEventCode(data)
			$('#dlg-reportEvent-subevent').val(event_code);
		})

		$('#dlg-reportEvent-startdate').datepicker('setDate', srvData.filter_startdate);
		$('#dlg-reportEvent-enddate').datepicker('setDate', srvData.filter_enddate);
		$('#dlg-reportEvent-agency').val(agency_id);
		$('#dlg-reportEvent-agency').multiselect('rebuild').multiselect('updateButtonText');
		$('#dlg-reportEvent-event').val(event_id);

	}else{
		var val_start_date = $('#dlg-reportEvent-startdate').val(); //start date
		var val_end_date = $('#dlg-reportEvent-enddate').val(); //end date
		var val_agency = $('#dlg-reportEvent-agency').val(); //agency id
		var val_event = $('#dlg-reportEvent-event').val(); //event id
		var val_subevent = $('#dlg-reportEvent-subevent').val(); //sub-event id

		if(!val_start_date || !val_end_date || !val_agency || !val_event || !val_subevent){
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

		var startDate = $('#dlg-reportEvent-startdate').datepicker( "getDate" ); //start dater in format date picker
		var endDate = $('#dlg-reportEvent-enddate').datepicker( "getDate" ); //end dater in format date picker
		var date_range = parseInt($('#date_range').val()); //date range
		var stDate = startDate.setDate( startDate.getDate()); //start date as number

		//Validate filter.
		maxDate = startDate.setDate( startDate.getDate() + date_range ); //max date as number
		endDate = endDate.setDate( endDate.getDate()); //end date as number

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
				message: self.translator['msg_err_date_over_range'].replace('%s',date_range),
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			})
			$('#filter_enddate').val('');
			return false
		}

		param = {
			agency_id : $('#dlg-reportEvent-agency').val().join(),
			start_date : $('#dlg-reportEvent-startdate').val(),
			end_date : $('#dlg-reportEvent-enddate').val(),
			event_log_category_id : $('#dlg-reportEvent-event').val(),
			event_code_id : $('#dlg-reportEvent-subevent').val()
		}
	}

	$('#div_loading').show();

	//Get the data to put on data table summary.
	apiService.SendRequest('GET', self.service_event_detail, param, self.pushDataSummaryDetail);
}

/**
* Put data to rows on data table.
*
* @param {json} rs the data to generate rows on data table.
*/
srvData.pushDataSummaryDetail = function(data){
	var self = srvData; //initial data
	var a = [] //data to put on report event detail table
	var data = apiService.getFieldValue(data,'data')

	$('#div_loading').hide();

	if ( data == null) {
		return
	}

	for(var i=0; i<data.length; i++){
		a.push(data[i]);
	}

	self.dlg_dataTable.clear();
	self.dlg_dataTable.rows.add(a);
	self.dlg_dataTable.draw();

	if ( srvData.fromInitVar ){
		srvData.fromInitVar = false;
		$('#dlg-reportEvent').modal();
	}
}

/**
* put data on date column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The date data for display on date column.
*/
srvData.renderEvent_log_date = function(row, type, set, meta){
	return JH.GetJsonValue(row,'event_log_date');
}

/**
* put data on agency column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The date data for display on agency column.
*/
srvData.renderAgency = function(row, type, set, meta){
	return JH.GetJsonLangValue(row,'agency.agency_name',true);
}

/**
* put data on metadata column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The date data for display on metadata column.
*/
srvData.renderMetadataName = function(row, type, set, meta){
	return JH.GetJsonLangValue(row, "metadata.metadataservice_name" , true);
}

/**
* put data on event column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The date data for display on event column.
*/
srvData.renderEventCategory = function(row, type, set, meta){
	return JH.GetJsonValue(row,'event_code.event_log_category.code');
}

/**
* put data on subevent column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The date data for display on subevent column.
*/
srvData.renderEventCode = function(row, type, set, meta){
	return JH.GetJsonLangValue(row,'event_code.description');
}

/**
* put data on message event column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The date data for display on message event column.
*/
srvData.renderDescription = function(row, type, set, meta){
	return JH.GetJsonValue(row,'event_log_message');
}

/**
* put data on duration time column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The date data for display on duration time column.
*/
srvData.renderDurationTime = function(row, type, set, meta){
	var time = JH.GetJsonValue(row,'event_log_duration_time')
	var seconds = parseFloat((time/1000000000)).toFixed(2);
	return seconds + srvData.translator['seconds'];
}


/**
* Setting default date is current date on filter date.
*
* @param {text} range The date range for filter date.
*
*/
srvData.setDefaultFilterDate = function(range){
	var today = new Date(); //current date
	var dd = today.getDate(); //current day
	var mm = today.getMonth()+1; //current month
	var yyyy = today.getFullYear(); //current year

	/* Add prefix day number such as 01,02,03 */
	if(dd<10){
		dd='0'+dd;
	}

	/* Add prefix month number such as 01,02,03 */
	if(mm<10){
		mm='0'+mm;
	}

	var curren_date = yyyy+'-'+mm+'-'+dd; //current date
	var end_date = curren_date; //end date
	var date_range = range['data']['date_range']; //date range

	$("#filter_startdate").datepicker('setDate', curren_date);
	$("#filter_enddate").datepicker('setDate', end_date);
	$("#filter_enddate").datepicker({
		autoclose: true,
		dateFormat: 'yyyy-mm-dd'
	})

	$("#dlg-reportEvent-startdate").datepicker('setDate', curren_date);
	$("#dlg-reportEvent-enddate").datepicker('setDate', end_date);

};
