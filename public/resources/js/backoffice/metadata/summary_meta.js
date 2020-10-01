/**
*
*   Main JS application file for summay meta page.
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
	self.service_summary_load = 'thaiwater30/backoffice/metadata/summary_load'; //service summary load
	self.service_summary = 'thaiwater30/backoffice/metadata/summary'; // service summary
	self.service_summary_by_agency = 'thaiwater30/backoffice/metadata/summary_by_agency'; //serevice summary by agency
	self.service_summary_by_category = 'thaiwater30/backoffice/metadata/summary_by_category'; //service summary by category
	self.service_summary_detail = 'thaiwater30/backoffice/metadata/summary_detail'; //service summary detail

	self.summaryTableId = 'tbl-summary-meta'; //id element summary table
	ctrl = $('#' + self.summaryTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  self.renderColumAgencyname,
		},
		{
			data :  self.renderColumAgencyShortname,
		},
		{
			data :  self.renderColumSummaryTotal,
		},
		{
			data :  self.renderColumSummaryImport,
		},
		{
			data :  self.renderColumDetail,
			orderable : false,
			searchable : false,
		}],
		"footerCallback": function ( row, data, start, end, display ) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function ( i ) {
				return numeral(i).value();
			};

			// total_summary_total over all pages
			total_summary_total = api.column( 3 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			total_summary_import = api.column( 4 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );


			// total_page over this page, 3 is colum number begin at 0
			total_page_summary_total = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );

			total_page_summary_import = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );

			total_page_summary_total = parseFloat(total_page_summary_total);
			total_summary_total = parseFloat(total_summary_total);

			total_page_summary_import = parseFloat(total_page_summary_import);
			total_summary_import = parseFloat(total_summary_import);

			// Update footer
			$('#total_summary_total').html(numeral(total_page_summary_total).format('0,0')+"/"+numeral(total_summary_total).format('0,0'));
			$('#total_summary_import').html(numeral(total_page_summary_import).format('0,0')+"/"+numeral(total_summary_import).format('0,0'));

		},

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

	// Setting datable datadetail on panel default.
	self.settingDataTableSummaryDetail()
	//Diaplay and hide filter agency or category
	$('#div_filter_agency').show();
	$('#div_filter_category').hide();
	//Display filter according selected on filter display.
	$('#dlgSummayMeta_filter_display').on('change',self.changeFilterMeta_display);
	//Setting selected on filter agency
	ctrl.on('click', 'a.disp_summary',self.setdefaultFilterAgency);

	//Click on button preview
	$('#dlgSummayMeta-btnPreview').on('click',self.displaySummaryDetail);


	apiService.SendRequest('GET', self.service_summary, {}, self.genHighChart);
	apiService.SendRequest('GET', self.service_summary, {}, self.previewMasterDataTables);
	apiService.GetCachedRequest(self.service_summary, {}, self.genFilterAgency);
	apiService.SendRequest('GET', self.service_summary_load, {}, self.genFilterCategory)


}



/**
* Generate Highchart
*
* @param {json} data summay data
*
*/
srvData.genHighChart = function(data){
	var self = srvData; //initial data
	var	data_agency = []; //ageny data
	var data_summary_import = []; // summary import data
	var data_summary_total = []; // summary total data
	var data = apiService.getFieldValue(data,'data'); //summay data

	if (typeof data === undefined || data == null) {
		return false
	}

	for(i = 0; i < data.length; i++) {
		//var agency_shortname = ' ';
		var short_name = data[i]['agency']['agency_shortname']['en']; //agency short name

		if(short_name){
			data_agency.push(short_name);
		}
		data_summary_import.push(data[i]['summary_import']);
		data_summary_total.push(data[i]['summary_total']);
	}

	Highcharts.chart('container-highchart', {
		chart: {
			type: 'column'
		},
		title: {
			text: srvData.translator['label_summay_meta']
		},
		subtitle: {
			text: srvData.translator['label_display_all_agent']
		},
		xAxis: {
			categories: data_agency,
			title:{
				text: srvData.translator['agency']
			},
			crosshair: true
		},
		yAxis: {
			min: 0,
			title: {
				text: srvData.translator['label_amount_metadata']
			}
		},
		tooltip: {
			headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
			pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
			'<td style="padding:0"><b>{point.y:.0f} '+srvData.translator['list']+'</b></td></tr>',
			footerFormat: '</table>',
			shared: true,
			useHTML: true
		},
		plotOptions: {
			column: {
				pointPadding: 0,
				borderWidth: 0,
				dataLabels: {
					enabled: true,
					rotation: 270,
					y: -10,
					crop: false
				}
			}
		},
		series: [{
			name: srvData.translator['label_all_metadata'],
			data: data_summary_total

		}, {
			name: srvData.translator['label_summary_metadata'],
			data:	data_summary_import

		}]
	});
}


/**
* put data into table
*
* @param {json} data summar data
*
*/
srvData.previewMasterDataTables = function(data){
	var a = []; //summay data to put into table
	var self = srvData; //initial data
	var data = apiService.getFieldValue(data,'data'); //initial summary data

	if ( data == null ) {
		return
	}
	for(var i = 0; i<data.length; i++){
		a.push(data[i]);
	}

	self.dataTable.clear();
	self.dataTable.rows.add(a);
	self.dataTable.draw();
}



/**
* put data into column agency
*
* @param {json} row summary data
*
*/
srvData.renderColumAgencyname = function(row){
	var self = srvData; //initial data
	var pushAgencyname = ''; //initial data of agency name
	var agency_name = JH.GetJsonLangValue(row,'agency.agency_name',true); //agency name

	if(agency_name){
		pushAgencyname = agency_name;
	}
	return pushAgencyname
}


/**
* put data into column agency short name
*
* @param {json} row summary data
*
*/
srvData.renderColumAgencyShortname = function(row){
	var self = srvData; //initial data
	var pushAgencyShortname = ''; //initial data of short name
	var agency_shortname = JH.GetJsonLangValue(row,'agency.agency_shortname',true); //agency short name

	if(agency_shortname){
		pushAgencyShortname = agency_shortname;
	}
	return pushAgencyShortname
}


/**
* put data into column summary total
*
* @param {json} row summary data
*
*/
srvData.renderColumSummaryTotal = function(row){
	var pushSummaryTotal = ''; //initial data of summay total
	var summary_total = row['summary_total']; //summay total

	/* Add commas in number */
	if(summary_total){
		pushSummaryTotal = summary_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return pushSummaryTotal
}


/**
* put data into column summay import
*
* @param {json} row summary data
*
*/
srvData.renderColumSummaryImport = function(row){
	var pushSummaryImport = '-'; //initial data of summay import
	var summary_import = row['summary_import']; //summay import

	if(summary_import){
		pushSummaryImport = summary_import.toLocaleString();
	}
	return pushSummaryImport
}


/**
* create button for view summary detail
*
* @param {json} row summary data
*
*/
srvData.renderColumDetail = function(row){
	var self = srvData; //initial data
	var pushSummaryImport = ''; //initial data of summary import
	var summary_import = row['summary_import']; //summary import

	if(summary_import){
		pushSummaryImport = '<a class="disp_summary" data-id = "'+row.agency.id+'" href="#" data-toggle="modal" data-target="#dlgSummayMeta"><i class="fa fa-columns" aria-hidden="true"></i></a>';
	}
	return pushSummaryImport
}




/**
* generate option into filter agency
*
* @param {json} data agency data
*
*/
srvData.genFilterAgency = function(data){
	var self = srvData; //initial data
	var dlgSummayMeta_filter_agency = document.getElementById('dlgSummayMeta_filter_agency'); //element filter agency
	var data = apiService.getFieldValue(data,'data'); //agency data

	if ( data == null ) {
		return
	}

	for(var i = 0; i < data.length; i++){
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonLangValue(data[i],'agency.agency_name',true); //option name
		var val_option = data[i]['agency']['id']; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		dlgSummayMeta_filter_agency.add(gen_option);
	}
	$(dlgSummayMeta_filter_agency).select2();
}



/**
* generate option into filter category
*
* @param {json} data category data
*
*/
srvData.genFilterCategory = function(data){
	var self = srvData; //initial data
	var dlgSummayMeta_filter_category = document.getElementById('dlgSummayMeta_filter_category'); //element filter category
	var data = apiService.getFieldValue(data,'data.category'); //category data

	if ( data == null ) {
		return
	}

	for(var i = 0; i < data.length; i++){
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonLangValue(data[i],'category_name',true); //option name
		var val_option = data[i]['id']; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		dlgSummayMeta_filter_category.add(gen_option);
	}
	$(dlgSummayMeta_filter_category).select2();
}



/**
* hide or display filter according selected on filter display
*
*/
srvData.changeFilterMeta_display = function(){
	var self = srvData; //initial data
	var type_display = $('#dlgSummayMeta_filter_display').val(); //type display data of summary detail

	if(type_display == '0'){
		$('#div_filter_agency').show();
		$('#div_filter_category').hide();
	}else{
		$('#div_filter_agency').hide();
		$('#div_filter_category').show();
		$('#dlgSummayMeta_filter_agency option.op_default').attr('selected',true);
	}
}



/**
* Display data summary detail
*
*/
srvData.displaySummaryDetail = function(){
	var self = srvData; //initial data
	var param = {}; //parameter
	var type_display = $('#dlgSummayMeta_filter_display').val(); //type display
	var val_agency = $('#dlgSummayMeta_filter_agency').val(); //ageny id
	var val_category = $('#dlgSummayMeta_filter_category').val(); //ategory id

	if(!type_display || (type_display == 0 && !val_agency) || (type_display == 1 && !val_category)){
		bootbox.alert({
			message : self.translator['msg_err_require_filter'],
			buttons : {
				ok : {
					label : self.translator['btn_close']
				}
			}
		})
		return false
	}

	if(type_display == '0'){
		param['agency_id'] = val_agency;
		apiService.SendRequest('GET', self.service_summary_by_agency, param, self.genPanelHeaderSummaryDetail);
	}else{
		param['category_id'] = $('#dlgSummayMeta_filter_category').val();
		apiService.SendRequest('GET', self.service_summary_by_category, param, self.genPanelHeaderSummaryDetail);
	}
}




/**
* Setting value default of filter agency
* according to selected at colum detail on table summary meta
*
*/
srvData.setdefaultFilterAgency = function(){
	var self = srvData; //initial data
	var param = {}; //parameter
	var agency_id  = $(this).attr('data-id'); //agency id

	// Set default filter display as summary meta by agency
	$('#dlgSummayMeta_filter_display').val(0).trigger('change');

	//Display agency selected on filter agency
	$('#dlgSummayMeta_filter_agency').val(agency_id).trigger('change');

	param['agency_id'] = $('#dlgSummayMeta_filter_agency').val();
	apiService.SendRequest('GET', self.service_summary_by_agency, param, self.genPanelHeaderSummaryDetail);

}




/**
* Create panel to display data summary detail
*
* @param {json} data summary meta by agency
*
*/
srvData.genPanelHeaderSummaryDetail = function(data){
	var self = srvData; //initial data
	var param = {}; //parameter
	var type_display = $('#dlgSummayMeta_filter_display').val(); //type to display
	var i; //loop count
	var data = apiService.getFieldValue(data,'data'); //summary meta by agency

	if ( data == null ) {
		return
	}

	// Check data to display detail is not null
	if(data){
		$('#data-notfound').hide();
		$('#accordion').show();
		$('div.panel').remove();

		// Check filter display is summarymeta according agency
		if(type_display == '0'){
			// Show Agency Name
			for(i = 0; i < data.length; i++){
				var cat_name = JH.GetJsonLangValue(data[i],'subcategory.category.category_name',true);
				var cat_id= data[i]['subcategory']['category']['id'];
				var count_metadata = data[i]['count_metadata'];

				/* Create panel to display table detail  create table
				detail for the first padel or panel default */
				if(i == '0'){
					$('#accordion').append('<div id="tab-summary-'+i+'" class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title"> <a id="panel-title-'+i+'" class="panel-title-text" data-row="'+i+'" data-id="'+cat_id+'" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+i+'">'+cat_name+' ( '+count_metadata +' '+ srvData.translator['label_list']+' )</a> </h4> </div> <div id="collapse-'+i+'" class="panel-collapse collapse in" style="padding:2%"><div class="table-responsive"> <table id="dlg-tbl-summary-detail" class="display summarydetail-datatables" width="100%"> <thead> <tr> <th>'+srvData.translator["col_order"]+'</th> <th>'+srvData.translator["col_metadata"]+
					'</th> <th>'+srvData.translator["col_record_number"]+
					'</th><th>'+srvData.translator['col_latest_date']+
					'</th> </tr> </thead> <tfoot> <tr> <td colspan="2"><b>'+srvData.translator['col_total']+
					'</b></td> <td> <b><span style="float:right;" id ="total_summary_detail"></span></b> </td> <td> <b><span style="text-align:left;"></span></b> </td> </tr> </tfoot> <tbody> </tbody> </table> </div> </div> </div>');
				}else{
					$('#accordion').append('<div id="tab-summary-'+i+'" class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title"> <a id="panel-title-'+i+'" class="panel-title-text" data-row="'+i+'" data-id="'+cat_id+'" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+i+'">'+cat_name+' ( '+count_metadata +' '+ srvData.translator['label_list']+' )</a> </h4> </div> <div id="collapse-'+i+'" class="panel-collapse collapse" style="padding:2%"> </div> </div>');
				}
			}

			// Setting parameter for send request data from service
			param['agency_id'] = $('#dlgSummayMeta_filter_agency').val();
			param['category_id'] = data[0]['subcategory']['category']['id'].toString()
		}

		// Check filter display is summarymeta according agency
		else{
			// Show Category Name
			for(i = 0; i < data.length; i++){
				// var agency_name = data[i]['agency']['agency_name']['th']
				var agency_name = JH.GetJsonLangValue(data[i],'agency.agency_name',true); //agency name
				var agency_id = data[i]['agency']['id']; //agency id
				var count_metadata_agency = data[i]['count_metadata']; //count metadatas

				if(i == '0'){
					$('#accordion').append('<div id="tab-summary-'+i+'" class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title"> <a id="panel-title-'+i+'" class="panel-title-text" data-row="'+i+'" data-id="'+agency_id+'" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+i+'">'+agency_name+' ( '+count_metadata_agency +' '+ srvData.translator["label_list"]+' )</a> </h4> </div> <div id="collapse-'+i+'" class="panel-collapse collapse in" style="padding:2%">'+
					'<div class="table-responsive"> <table id="dlg-tbl-summary-detail" class="display summarydetail-datatables" width="100%"> <thead> <tr> <th>' +srvData.translator["col_order"]+'</th> <th>'+srvData.translator["col_metadata"]+'</th> <th>'+srvData.translator["col_record_number"]+'</th> <th>' +srvData.translator["col_latest_date"]+'</th> </tr> </thead> <tfoot> <tr> <td colspan="2"><b>'+srvData.translator["col_total"]+'</b></td> <td> <b><span style="float:right;"'+
					'id ="total_summary_detail"></span></b> </td> <td> <b><span style="text-align:left;"></span></b> </td> </tr> </tfoot> <tbody> </tbody> </table> </div> </div> </div>');
				}else{
					$('#accordion').append('<div id="tab-summary-'+i+'" class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title"> <a id="panel-title-'+i+'" class="panel-title-text" data-row="'+i+'" data-id="'+agency_id+'" data-toggle="collapse" data-parent="#accordion" href="#collapse-'+i+'">'+agency_name+' ( '+count_metadata_agency +' '+srvData.translator['label_list']+' )</a> </h4> </div> <div id="collapse-'+i+'" class="panel-collapse collapse" style="padding:2%"> </div> </div>');
				}
			}

			// Setting parameter for send request data from service
			param['agency_id'] = data[0]['agency']['id']
			param['category_id'] = $('#dlgSummayMeta_filter_category').val();

		}//End else

		// Push data on table detail for panel default
		apiService.SendRequest('GET', self.service_summary_detail,param, self.pushDataOntable)
		self.settingDataTableSummaryDetail()

		// Display data detail for orther panel or when click on panel.
		$('.panel-title-text').on('click',self.displayDataPanel)


	}else{
		// Display message 'ไม่พบข้อมูล',When query data is null,
		$('#data-notfound').show()
		$('#accordion').hide()
	}
}


/**
* Create table detail and push data detail to display on panel
*
*/
srvData.displayDataPanel = function(){
	var self = srvData; //initial data
	var param = {}; //parametter
	var row = $(this).attr('data-row'); //row number
	var id = $(this).attr('data-id'); //agency id or category id wich according type display
	var type_display = $('#dlgSummayMeta_filter_display').val(); //type display

	// Generate table detail
	self.genTableSummayDetail(row)

	// Get data from service to display on table detail
	if(type_display == '0'){
		param['category_id'] = id;
		param['agency_id'] = $('#dlgSummayMeta_filter_agency').val();
	}else{
		param['category_id'] = $('#dlgSummayMeta_filter_category').val();
		param['agency_id'] = id;
	}
	// Push data on table detail
	apiService.SendRequest('GET', self.service_summary_detail,param, self.pushDataOntable);
}



//Create table detail on panel
srvData.genTableSummayDetail = function(id){
	var self = srvData; //initial data

	// Remove old table detail in tabs closed
	$('.panel-collapse > div.table-responsive').remove();
	$('#collapse-'+id+' p').remove();

	//Generate table detail in tabs opening.
	$('#collapse-' + id).append('<div class="table-responsive"> <table id="dlg-tbl-summary-detail" class="display summarydetail-datatables" width="100%"> <thead> <tr> <th>'+srvData.translator['col_order']+'</th> <th>'+srvData.translator['col_metadata']+'</th> <th>'+srvData.translator['col_record_number']+'</th> <th>'+srvData.translator['col_latest_date']+'</th> </tr> </thead> <tfoot> <tr> <td colspan="2"><b>'+srvData.translator['col_total']+'</b></td> <td> <b><span style="float:right;"id ="total_summary_detail"></span></b> </td> <td> <b><span style="text-align:left;"></span></b> </td> </tr> </tfoot> <tbody> </tbody> </table> </div>');
	self.settingDataTableSummaryDetail();

}

//Setting data detail
srvData.settingDataTableSummaryDetail = function(){
	var self = srvData; //initial data

	self.summaryTableDetailID = 'dlg-tbl-summary-detail'; //table id of summary detail
	ctrlSub = $('#' + self.summaryTableDetailID);
	self.dataTableSub = ctrlSub.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  self.renderColumServicename,
		},
		{
			data :  self.renderColumtotal_import_record
		},
		{
			data :  self.renderColumnlast_import_date,
		}],
		"footerCallback": function ( row, data, start, end, display ) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function ( i ) {
				return typeof i === 'string' ? i.replace(/[\$,]/g, '')*1 : typeof i === 'number' ?	i : 0;
			};

			// total_summary_detail over all pages
			total_summary_detail = api.column( 2 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			// total_page over this page, Number 3 is colum number,begin at 0
			total_page_summary_total = api.column( 2, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );

			total_page_summary_total = parseFloat(total_page_summary_total);
			total_summary_detail = parseFloat(total_summary_detail);

			// Update footer
			$('#total_summary_detail').html(numeral(total_page_summary_total).format('0,0')+"/"+numeral(total_summary_detail).format('0,0'));
		},
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})
	self.dataTableSub.on('order.dt search.dt', function() {
		self.dataTableSub.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();
}




/**
* put data into table detail
*
* @param {json} data summary meta data detail
*
*/
srvData.pushDataOntable = function(data){
	var self = srvData; //initial data
	var type_display = $('#dlgSummayMeta_filter_display').val(); //type to display summary meta detail

	self.dataTableSub.clear();
	if ( JH.GetJsonValue(data , "result") != "OK"){ return false; }
	self.dataTableSub.rows.add( JH.GetJsonValue(data , "data") );
	self.dataTableSub.draw();
}



/**
* put data into column total import record
*
* @param {json} row summary meta data detail
*
*/
srvData.renderColumtotal_import_record = function(row){
	console.log("Total",row)
	var self = srvData; //initial data
	var total_import_record = ''; //total import record

	total_import_record = JH.GetJsonValue(row, 'total_import_record');


	if(total_import_record){
		total_import_record = total_import_record.toLocaleString();
	}

	return total_import_record
}


/**
* put data into column Servicename
*
* @param {json} row summary meta data detail
*
*/
srvData.renderColumServicename = function(row){
	console.log("Service",row)
	return JH.GetJsonValue(row, 'metadataservice_name.th')
}


/**
* put data into column last import date
*
* @param {json} row summary meta data detail
*
*/
srvData.renderColumnlast_import_date = function(row){
	console.log("Last Date",row)
	return JH.GetJsonValue(row, 'last_import_date')
}
