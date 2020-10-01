/**
*
*   Main JS application file for report import by month page.
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
* @return text
*/
srvData.init = function (translator) {

	var self = srvData
	self.translator = translator
	self.service_overall_monthly = '/thaiwater30/backoffice/data_integration_report/overall'
	self.service_download_size = '/thaiwater30/backoffice/data_integration_report/download_size'
	self.multi_service_download_size = '/thaiwater30/backoffice/data_integration_report/multi_download_size'


	var d = new Date();
	var cur_year = d.getFullYear();
	cur_year = cur_year.toString()
	var cur_month = d.getMonth() + 1;
	cur_month = cur_month.toString()

	var param = {
		year: cur_year
	}

	apiService.SendRequest('GET', self.service_overall_monthly, param, srvData.ManegerData)


	self.reportEventTableId = 'tbl-reportImpartByMonth'
	ctrl = $('#' + self.reportEventTableId)
	self.dataTable = ctrl.DataTable({
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: [{
			data: srvData.renderColumnAgencyName,
		}, {
			data: srvData.renderColumnDownload_date,
		}, {
			data: srvData.renderColumnDownload_size
		}, {
			data: srvData.renderColumnNumber_of_file
		}, {
			data: srvData.renderColumnNumber_of_record
		}],

		"footerCallback": function (row, data, start, end, display) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function (i) {
				return numeral(i).value();
			};

			// Sum over this page, 3 is colum number begin at 0
			total_page_summary_total = api.column(1, { page: 'current' }).data().reduce(function (a, b) {
				return parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2);
			}, 0);
			total_page_number_of_file = api.column(2, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);
			total_page_number_of_record = api.column(3, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);

			// Sum over all pages
			total_download_size = api.column(1).data().reduce(function (a, b) {
				return parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2);
			}, 0);
			total_number_of_file = api.column(2).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);
			total_number_of_record = api.column(3).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);


			// Update footer
			$('#total_download_size').html(total_page_summary_total + "/" + total_download_size);
			$('#total_number_of_file').html(total_page_number_of_file.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + total_number_of_file.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$('#total_number_of_record').html(total_page_number_of_record.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + total_number_of_record.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

		},
		order: [[0, 'asc']],
		rowCallback: ''
	})

	self.tblsumall = 'tbl-sumAll'
	ctrl = $('#' + self.tblsumall)
	self.dataTable_sumall = ctrl.DataTable({
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: [{
			data: srvData.renderColumnDownload_size
		}, {
			data: srvData.renderColumnNumber_of_file
		}, {
			data: srvData.renderColumnNumber_of_record
		}],

		"footerCallback": function (row, data, start, end, display) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function (i) {
				return numeral(i).value();
			};

			// Sum over this page, 3 is colum number begin at 0
			total_page_summary_total = api.column(0, { page: 'current' }).data().reduce(function (a, b) {
				return parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2);
			}, 0);
			total_page_number_of_file = api.column(1, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);
			total_page_number_of_record = api.column(2, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);

			// Sum over all pages
			total_download_size = api.column(0).data().reduce(function (a, b) {
				return parseFloat(Math.round((intVal(a) + intVal(b)) * 100) / 100).toFixed(2);
			}, 0);
			total_number_of_file = api.column(1).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);
			total_number_of_record = api.column(2).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);


			// Update footer
			$('#total_download_size_all').html(total_page_summary_total + "/" + total_download_size);
			$('#total_number_of_file_all').html(total_page_number_of_file.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + total_number_of_file.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$('#total_number_of_record_all').html(total_page_number_of_record.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + total_number_of_record.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

		},
		order: [[0, 'asc']],
		rowCallback: ''
	})

	$('.select-search').select2()

	/* Event on click preview button */
	$("#btn_preview").on('click', self.onClickDisplay)
	// srvData.genFilterYear()
	srvData.genMultiYear()
	srvData.genFilterAgency()


	$('#filter_month').each(function (i, e) {
		$(e).multiselect({
			buttonWidth: '100%',
			maxHeight: 300,
			includeSelectAllOption: true,
			selectAllNumber: false,
			enableFiltering: false,
			selectAllText: self.translator['select_all'],
			allSelectedText: self.translator['all_selected'],
			nonSelectedText: self.translator['none_selected'],
			filterPlaceholder: self.translator['search']
		})
	})

	$('#filter_year').each(function (i, e) {
		$(e).multiselect({
			buttonWidth: '100%',
			maxHeight: 300,
			includeSelectAllOption: true,
			selectAllNumber: false,
			enableFiltering: false,
			selectAllText: self.translator['select_all'],
			allSelectedText: self.translator['all_selected'],
			nonSelectedText: self.translator['none_selected'],
			filterPlaceholder: self.translator['search']
		})
	})


	$('#filter_agency').each(function (i, e) {
		$(e).multiselect({
			buttonWidth: '100%',
			maxHeight: 300,
			includeSelectAllOption: true,
			selectAllNumber: false,
			enableFiltering: true,
			selectAllText: self.translator['select_all'],
			allSelectedText: self.translator['all_selected'],
			nonSelectedText: self.translator['none_selected'],
			filterPlaceholder: self.translator['search']
		})
	})

}

srvData.genMultiYear = function () {
	var day = new Date(); //curretn current date and time
	var year = day.getFullYear()
	var option_arr = []

	var filter_form = $("#filter_form").val()

	for (let i = 0; i < 10; i++) {
		option_str = '<option value="' + (year - i) + '">' + (year - i) + '</option>'
		option_arr.push(option_str)
	}
	var result = option_arr.join("");


	$("#filter_year").html(result);

	$("select[multiple] option").prop("selected", "selected");

}

srvData.ManegerData = function (rs) {
	srvData.genFilterAgency(rs)
}


/**
* generate option data on filter agency
*
* @param {json} ac agency data
*
*/
srvData.genFilterAgency = function (ac) {
	var filter_agency = document.getElementById('filter_agency'); //element filter agency
	var agency = apiService.getFieldValue(ac, 'data'); //agency data

	if (agency == null) {
		return
	}
	var r = [], n = {};
	for (var i = 0; i < agency.offline.length; i++) {
		var o = agency.offline[i];
		var checkIndex = typeof o == "object" ? JH.GetJsonValue(o, "agency.id") : o;
		if (!n[checkIndex]) {
			n[checkIndex] = true;
			r.push(o);
		}
	}

	for (var i = 0; i < agency.online.length; i++) {
		var o = agency.online[i];
		var checkIndex = typeof o == "object" ? JH.GetJsonValue(o, "agency.id") : o;
		if (!n[checkIndex]) {
			n[checkIndex] = true;
			r.push(o);
		}
	}

	JH.Sort(r, "agency.id");

	for (var i = 0; i < r.length; i++) {
		var a = r[i];
		var gen_option = document.createElement('option'); //create element option
		var txt_option = JH.GetJsonLangValue(a, 'agency.agency_name', true); //option name
		var val_option = JH.GetJsonValue(a, 'agency.id'); //option value

		gen_option.text = txt_option
		gen_option.value = val_option
		filter_agency.add(gen_option)
	}

	// $(filter_agency).val(["1","2","3"]);
	$("select[multiple] option").prop("selected", "selected");
	$(filter_agency).multiselect({ includeSelectAllOption: true });
	$(filter_agency).multiselect('rebuild');
	$(filter_agency).multiselect('updateButtonText');


	srvData.onClickDisplay()
}


/**
* generate option data on filter year
*
*/
srvData.genFilterYear = function () {
	$('#filter_year').datepicker({
		format: "yyyy",
		startView: 2,
		minViewMode: 2,
		maxViewMode: 2
	});
	var d = new Date();
	$('#filter_year').datepicker('setDate', d);
	$('#filter_year').datepicker('update');
}


/**
* get data from service to diplay
*
*/
srvData.onClickDisplay = function () {
	var fill_agency = $('#filter_agency').val();
	var fill_year = $('#filter_year').val(); //element filtere year		
	var fill_month = $('#filter_month').val()

	var filter_form = $("#filter_form").val()

	if (fill_agency.length == 0 || fill_month.length == 0 || fill_year.length == 0) {
		bootbox.alert(srvData.translator['msg_err_require_filter'])
		return false
	}

	if (filter_form == 2) {
		$("#form_filter_month").hide()
		$("#filter_agency").multiselect("enable");
		$("#filter_year").multiselect("enable");
		var param = {
			year: fill_year,
			agency_id: fill_agency
		}

		apiService.SendRequest('GET', srvData.service_download_size, param, srvData.disPlayDataImport);
	} else {
		$("#form_filter_month").show()
		$("#filter_agency").multiselect("disable");
		$("#filter_year").multiselect("disable");
		$("#filter_month").multiselect("disable");
		var param = {
			month: fill_month,
			year: fill_year,
			agency_id: fill_agency
		}

		apiService.SendRequest('GET', srvData.multi_service_download_size, param, srvData.disPlayDataImport);
	}


}


/**
* display data on page
*
* @param {json} ds data download size
*/
srvData.disPlayDataImport = function (ds) {
	var filter_form = $("#filter_form").val()
	temp_arr = []

	/* push data on table*/
	srvData.dataTable.clear()
	srvData.dataTable_sumall.clear()

	if (JH.GetJsonValue(ds, "result") != "OK") { return false; }

	if (filter_form == 2) {
		$('#tbl-1').hide();
		$('#tbl-2').show();
		$('#bar-graph').empty().show();
		srvData.genChart(ds, 'bar') //put data on graph.
		for (let i = 0; i < ds.data.length; i++) {
			for (let j = 0; j < ds.data[0].data_in_agency[0].length; j++) {
				var temp = {
					agency_name: ds.data[i].agency_name.th,
					download_date: "",
					download_size: "",
					number_of_file: "",
					number_of_record: "",
				}
				temp.download_date = ds.data[i].data_in_agency[0][j].download_date
				temp.download_size = ds.data[i].data_in_agency[0][j].download_size
				temp.number_of_file = ds.data[i].data_in_agency[0][j].number_of_file
				temp.number_of_record = ds.data[i].data_in_agency[0][j].number_of_record
				temp_arr.push(temp)
			}
		}
		srvData.dataTable.rows.add(temp_arr);
		srvData.dataTable.draw()

	} else {
		$('#bar-graph').empty().show();
		$('#tbl-1').show();
		$('#tbl-2').hide();
		srvData.genChart(ds, 'column') //put data on graph.
		srvData.dataTable_sumall.rows.add(JH.GetJsonValue(ds, "data"));
		srvData.dataTable_sumall.draw()
	}
}


/**
* push data on graph
*
* @param {json} or data download size to genearate chart
*/
srvData.genChart = function (or, typeChart) {
	var data_date = []; //date
	var data_series = []
	var total_year = []
	var filter_form = $("#filter_form").val()
	var data = apiService.getFieldValue(or, 'data'); //data download size

	if (data == null) {
		return
	}

	if (filter_form == 2) {
		for (let i = 0; i < data[0].data_in_agency[0].length; i++) {
			var _arr = []
			for (let j = 0; j < data.length; j++) {
				val = data[j].data_in_agency[0][i]
				val_year = JH.GetJsonValue(val, 'download_size')
				_arr.push(val_year)
			}
			total_year.push(_arr)
		}


		for (let i = 0; i < data[0].data_in_agency[0].length; i++) {
			temp = {
				name: data[0].data_in_agency[0][i].download_date,
				data: total_year[i]
			}
			data_series.push(temp)
		}


		for (let i = 0; i < data.length; i++) {
			val = data[i].agency_name.th
			data_date.push(val)
		}
	} else {
		var data_size = data[0]['download_size'];
		temp_2 = {
			name: srvData.translator['col_storage'],
			data: [data_size]
		}

		data_series.push(temp_2)
		data_date = [""]
	}


	Highcharts.chart('bar-graph', {
		chart: {
			type: typeChart
		},
		title: {
			text: ''
		},
		subtitle: {
			text: ''
		},
		xAxis: {
			categories: data_date,
			crosshair: true,
			title: {
				text: srvData.translator['date']
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: srvData.translator['col_storage']
			}
		},
		tooltip: {
			headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
			pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
				'<td style="padding:0"><b>{point.y:.1f} MB</b></td></tr>',
			footerFormat: '</table>',
			shared: true,
			useHTML: true
		},
		plotOptions: {
			column: {
				pointPadding: 0.4,
				borderWidth: 1,
				dataLabels: {
					enabled: true,
					rotation: 360,
					y: -10,
					crop: false
				}
			}
		},
		series: data_series
	});
}

/* push data on each column */
srvData.renderColumnAgencyName = function (row) {
	var date_txt = JH.GetJsonValue(row, 'agency_name'); //dowload date

	return date_txt
}



/* push data on each column */
srvData.renderColumnDownload_date = function (row) {
	var date_txt = JH.GetJsonValue(row, 'download_date'); //dowload date

	if (date_txt) {
		date_txt = date_txt.substr(0, 10)
	}

	return date_txt
}


/**
* put data into colmn download size
*
* @param {json} row data on row
*/
srvData.renderColumnDownload_size = function (row) {
	return parseFloat(JH.GetJsonValue(row, 'download_size')).toFixed(2)
}


/**
* put data into colmn number of file
*
* @param {json} row data on row
*/
srvData.renderColumnNumber_of_file = function (row) {
	var count_file = JH.GetJsonValue(row, 'number_of_file'); //number of file
	return srvData.numberWithCommas(count_file)
}


/**
* put data into colmn number of record
*
* @param {json} row data on row
*/
srvData.renderColumnNumber_of_record = function (row) {
	var count_record = JH.GetJsonValue(row, 'number_of_record'); //number of record
	return srvData.numberWithCommas(count_record)
}


/**
* setting format number with commas
*
* @param {json} row data on row
*/
srvData.numberWithCommas = function (nStr) {
	nStr += '';
	x = nStr.split('.'); //splait number
	var x1 = x[0]; //Integer number
	var x2 = x.length > 1 ? '.' + x[1] : ''; //Decimal number
	var rgx = /(\d+)(\d{3})/; //Divide the number of digits into digits.

	/* setting fomat with commas */
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
