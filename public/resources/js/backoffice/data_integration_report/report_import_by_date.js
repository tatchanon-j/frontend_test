/**
*
*   Main JS application file for report import by year page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvData = {}; //initial data
var param = {}; //initial parameter

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator //Text for label and message on java script
	self.service_download_percent_load = '/thaiwater30/backoffice/data_integration_report/download_percent_load'; //service download percent load
	self.service_download_percent = '/thaiwater30/backoffice/data_integration_report/download_percent'; //service download percent
	self.service_download_percent_detail = '/thaiwater30/backoffice/data_integration_report/download_percent_detail'; //service percent detail

	//master table
	self.reportImportTableId = 'tbl-report-import'; // id report import table
	ctrl = $('#' + self.reportImportTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},{
			data : srvData.renderColumnAgency
		},{
			data : srvData.renderColumnAgencyShortname
		},{
			data : srvData.renderColumnExpected
		},{
			data : srvData.renderColumnDownload_count
		},{
			data : srvData.renderColumnPercent
		}],

		"footerCallback": function ( row, data, start, end, display ) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function ( i ) {
				return numeral(i).value();
			};

			// Sum over this page, 3 is colum number begin at 0
			total_page_expected = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );
			total_page_download_count = api.column( 4 ,{ page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );


			// Sum over all pages
			total_expected = api.column( 3 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );
			total_download_count = api.column( 4 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			// Update footer
			$('#total_expected').html(srvData.numberWithCommas(total_page_expected)+"/"+srvData.numberWithCommas(total_expected));
			$('#total_download_count').html(srvData.numberWithCommas(total_page_download_count)+"/"+srvData.numberWithCommas(total_download_count));

		},
		order : [ [ 1, 'asc' ] ],
		rowCallback : ''
	})

	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();


	ctrl.on('click', '.agecy_name', srvData.pushDataDetailTable);

	/* setting default on filter date */
	$("#filter_startdate").datepicker(
		'setDate', new Date()
	)
	$("#filter_enddate").datepicker(
		'setDate', new Date()
	)

		param = {
			start_date : $('#filter_startdate').val(),
			end_date : $('#filter_startdate').val()
		}

	apiService.SendRequest('GET', self.service_download_percent_load, param, self.genFilterDate);
	srvData.settingTableDetail();

	/* Event on click preview button */
	$('#btn_display').on('click', self.onClickDisplay)
	self.onClickDisplay()
}


/**
* Set start and End Date filter
*
* @param {json} rg date range
*
*/
srvData.genFilterDate = function(rg){
	$('#date_range').val(rg.data.date_range)
	var today = new Date(); //get current date
	var dd = today.getDate(); //date
	var mm = today.getMonth()+1; //month
	var yyyy = today.getFullYear(); //year

	/* Add prefix day number such as 01,02,03 */
	if(dd<10){
	    dd='0'+dd;
	}

	/* Add prefix month number such as 01,02,03 */
	if(mm<10){
	    mm='0'+mm;
	}

	var curren_date = yyyy+'-'+mm+'-'+dd; //curren date

	$("#filter_startdate").datepicker('setDate', curren_date);
	$("#filter_enddate").datepicker('setDate', curren_date);

}



/**
* Display data accrossding filter search
*
*
*/
srvData.onClickDisplay = function(){
	var self = srvData; //initial data
	var s = self.translator['msg_import_per_day']; //message on coulmn Estimated data import
	var title_co3 = s.replace('%c',srvData.getDiffDate()); //Estimated data import column name
	var startDate = $('#filter_startdate').datepicker( "getDate" ); //start date
	var endDate = $('#filter_enddate').datepicker( "getDate" ); //end date

	$('.column-3').text(title_co3);

	if(!startDate || !endDate) {
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
	var stDate = startDate.setDate( startDate.getDate()); //start date
	maxDate = startDate.setDate( startDate.getDate() + date_range );

	var endDate = $('#filter_enddate').datepicker( "getDate" ); //end date
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
			message: self.translator['msg_err_date_over_range'].replace('%s',date_range),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}

	var param = {
		start_date : $('#filter_startdate').val(),
		end_date : $('#filter_enddate').val(),
		connection_format:$('#filter_connection').val()
	}

	apiService.SendRequest('GET', srvData.service_download_percent, param, function(data){
			srvData.genChart(data);
			srvData.pushDataMasterTable(data);
	})
}



/**
* push data on chart
*
* @param {json} gc data to generate chart
*
*/
srvData.genChart = function(gc){

	var	data_agency = []; //data agency
	var download_count = []; //data download count
	var download_count_expected = []; //data download count expected
	var data = apiService.getFieldValue(gc,'data'); //data of percent download to generate chart

	if(data == null){
		return
	}

	for(i = 0; i < data.length; i++) {
		var agency_name = data[i]['agency']['agency_shortname']['en'];
		var down_count = data[i]['download_count'];
		var down_count_expected = data[i]['download_count_expected'];

		data_agency.push(agency_name);
		download_count.push(down_count);
		download_count_expected.push(down_count_expected);
	}

		Highcharts.setOptions({
			lang: {
				thousandsSep: ','
			}
		});

    Highcharts.chart('bar-graph', {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: data_agency,
            crosshair: true,
						title: {
							text: srvData.translator['agency']
						}
        },
        yAxis: {
            min: 0,
            title: {
                text: srvData.translator['import_data_number']
            }
        },
        tooltip: {
			 		valueSuffix: srvData.translator['amount'],
        },
        plotOptions: {
            column: {
							pointPadding: 0.1,
							borderWidth: 0,
							dataLabels: {
								 enabled: true,
								 rotation: 270,
								 y: -10,
								 crop: false
							 }
            }
        },
        series: [
					{
						name: srvData.translator['approximately']+srvData.getDiffDate()+srvData.translator['day'],
            data: download_count_expected
					},{
            name: srvData.translator['imported'],
            data: download_count
					}]
    });
}



/**
* put data on table master
*
* @param {json} mt data report import by date
*
*/
srvData.pushDataMasterTable = function(mt){
	srvData.dataTable.clear();
	if ( JH.GetJsonValue(mt , "result") != "OK"){ return false; }
	srvData.dataTable.rows.add( JH.GetJsonValue(mt , "data") );
	srvData.dataTable.draw()
}


/**
* put data on column on master table
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnAgency = function(row){
	var agen_name =  JH.GetJsonLangValue(row, 'agency.agency_name',true) //agency name
	return '<a class="btn agecy_name" name="'+agen_name+'" data-key="'+row.agency.id+'" >'+agen_name+'</a>'
}


/**
* put data into column agency short name
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnAgencyShortname = function(row){
	var ag_name = row['agency']['agency_shortname']; //agency short name
	if(ag_name.th){return JH.GetJsonValue(row,'agency.agency_shortname.th')}
	if(ag_name.en){return JH.GetJsonValue(row,'agency.agency_shortname.en')}
	if(ag_name.jp){return JH.GetJsonValue(row,'agency.agency_shortname.jp')}
	else{
		return ''
	}
}


/**
* put data into column expected
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnExpected = function(row){
	var expected = JH.GetJsonValue(row, 'download_count_expected'); //download count expected
	return srvData.numberWithCommas(expected)
}


/**
* put data into column download count
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnDownload_count = function(row){
	var count =  JH.GetJsonValue(row, 'download_count'); //download count
	return srvData.numberWithCommas(count)
}


/**
* put data into column percent
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnPercent = function(row){
	var percent = parseFloat(JH.GetJsonValue(row, 'download_count_percent')).toFixed(2); //download count percent is 2 digit
	return '<div class="progress"> <div class="progress-bar" role="progressbar" style="width: '+percent+'%;" aria-valuenow="'+percent+'" aria-valuemin="0" aria-valuemax="100">'+percent+'%</div></div>'
}


/**
* push data to table detail
*
*/
srvData.pushDataDetailTable = function(){
		var id = $(this).attr('data-key'); //id of percent download
		var agency_name = $(this).attr('name'); //agency name
		var title_name = $('#dlg-title').text(); //modal title

		title_name = title_name.replace('%s',agency_name);
		$('#dlg-title').text(title_name);
		param['agency_id'] = id;

		apiService.SendRequest('GET', srvData.service_download_percent_detail, param, function(ds){
			srvData.dataTableDetail.clear();
			if ( JH.GetJsonValue(ds , "result") != "OK"){ return false; }
			srvData.dataTableDetail.rows.add( JH.GetJsonValue(ds , "data") );
			srvData.dataTableDetail.draw()
		})

		$('#dlg-tabledetail').modal({
			backdrop : 'static'
		})
}


/**
* Setting data summary
*
*/
srvData.settingTableDetail = function(){
		var self = srvData; //initial data
		self.tableDetail = 'dlg-tblDetail'; //table id of report import by date
		ctrlSub = $('#' + self.tableDetail);
		self.dataTableDetail = ctrlSub.DataTable({
			dom : 'frltip',
			language : g_dataTablesTranslator,
			columns : [ {
				defaultContent : '',
				orderable : false,
				searchable : false,
			},
			{
				data :  srvData.renderColumnMetadata
			},
			{
				data :  srvData.renderColumnDownload_count_expected
			},
			{
				data :  srvData.renderColumnDownload_count
			},
			{
				data :  srvData.renderColumnDownload_count_percent
			},
			{
				data :  srvData.renderColumnDownload_lastest_date
			}],

			"footerCallback": function ( row, data, start, end, display ) {
				var api = this.api(), data;
				// Remove the formatting to get integer data for summation
				var intVal = function ( i ) {
					return typeof i === 'string' ? i.replace(/[\$,]/g, '')*1 : typeof i === 'number' ?	i : 0;
				};

				// summary per page.
				total_expected = api.column( 2 ).data().reduce( function (a, b) {
					return intVal(a) + intVal(b);
				},0 );
				total_count = api.column( 3 ).data().reduce( function (a, b) {
					return intVal(a) + intVal(b);
				},0 );


				// summary all page, 2 and 3 is column number by start at 0.
				total_page_expected = api.column( 2, { page: 'current'} ).data().reduce( function (a, b) {
					return intVal(a) + intVal(b);
				}, 0 );
				total_page_count = api.column( 3, { page: 'current'} ).data().reduce( function (a, b) {
					return intVal(a) + intVal(b);
				}, 0 );

				// push data on footer.
				$('#dlg_total_expected').html(total_page_expected.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_expected.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
				$('#dlg_total_download_count').html(total_page_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

			},
			order : [ [ 1, 'asc' ] ],
			rowCallback : ''
		})


		self.dataTableDetail.on('order.dt search.dt', function() {
			self.dataTableDetail.column(0, {
				search : 'applied',
				order : 'applied'
			}).nodes().each(function(cell, i) {
				cell.innerHTML = i + 1;
			});
		}).draw();
}


/**
* push data to each column on table detail
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnMetadata = function(row){
	return JH.GetJsonLangValue(row, 'metadata.metadataagency_name');
}


/**
* put data on column download count expected
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnDownload_count_expected = function(row){
	var expected = JH.GetJsonValue(row, 'download_count_expected');
	return srvData.numberWithCommas(expected)
}


/**
* put data on column download count
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnDownload_count = function(row){
	var download_count = JH.GetJsonValue(row, 'download_count');
	return srvData.numberWithCommas(download_count)
}


/**
* put data on column download count percent
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnDownload_count_percent = function(row){
	var download_count_percent = JH.GetJsonValue(row, 'download_count_percent');
	return parseFloat(srvData.numberWithCommas(download_count_percent)).toFixed(2)
}


/**
* put data on column download lasted date
*
* @param {json} row row number
*
* @return text
*/
srvData.renderColumnDownload_lastest_date = function(row){
	return JH.GetJsonValue(row, 'download_lastest_date')
}


/**
* setting format number with commas
*
* @param {string} nStr number
*
* @return text
*/
srvData.numberWithCommas = function(nStr) {
		nStr += '';
    var x = nStr.split('.'); //splait number
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
* get difference date between start date and end date
*
*
* @return text
*/
srvData.getDiffDate = function(){
	var start_date = $('#filter_startdate').val(); //start date
	var end_date = $('#filter_enddate').val(); //end date
	var date1 = new Date(start_date); //convert start date to date type
	var date2 = new Date(end_date); //convert end date to date type
	var timeDiff = Math.abs(date2.getTime() - date1.getTime()); //defference time
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); //convert to amount day

	return diffDays+1
}
