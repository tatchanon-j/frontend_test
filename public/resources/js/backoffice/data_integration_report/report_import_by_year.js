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
var box; // value to display layout 1 or layout 2
var d = new Date(); //curretn current date and time
var cur_year = d.getFullYear(); // current year
cur_year = cur_year.toString(); //convert year to string
var cur_month = d.getMonth() + 1; //current month
cur_month = cur_month.toString(); //convert month to string
var default_multi_year = [cur_year, cur_year - 1, cur_year - 2];// value default fot filter multi year


/**
* prepare data
*
* @param {json} translator Text for use on page
*
* @return text
*/
srvData.init = function (translator) {
	var self = srvData; //initial data
	self.translator = translator; //ext for use on page
	self.service_overall_overall = '/thaiwater30/backoffice/data_integration_report/overall';
	self.service_overall_multiple = '/thaiwater30/backoffice/data_integration_report/overall_multiple';
	self.service_compare_yearly = '/thaiwater30/backoffice/data_integration_report/compare_yearly';

	//default parameter for get data to display default view.
	var param = {
		year: cur_year
	}

	var param2 = {
		year_arr: $('#filter_multi_overall').val()
	}

	apiService.SendRequest('GET', self.service_overall_multiple, param2, function (rs) {
		// srvData.prePareData();
		srvData.onClickBox();
	});

	apiService.SendRequest('GET', self.service_overall_overall, param, function (rs) {
		// srvData.prePareData();
		srvData.genFilterAgency(rs);
	});


	/* check event for get value form format compare */
	srvData.genDataTable()
	srvData.genDataTable_multi_year()

	/* event on change filter multi select year */
	$('#filter_multi_year').multiselect({
		onChange: self.maximumSelecteYear,
		buttonWidth: '100%',
		maxHeight: 300,
		selectAllNumber: false,
		// enableFiltering: true,
		allSelectedText: self.translator['all_selected'],
		nonSelectedText: self.translator['none_selected'],
		filterPlaceholder: self.translator['search']
	});


	$('#filter_multi_overall').multiselect({
		onChange: self.maximumSelecteYear_Overall,
		buttonWidth: '100%',
		maxHeight: 300,
		selectAllNumber: false,
		// enableFiltering: true,
		allSelectedText: self.translator['all_selected'],
		nonSelectedText: self.translator['none_selected'],
		filterPlaceholder: self.translator['search']
	});

	/* default first view on page*/
	$('.overall_monthly').show()
	$('.compare_yearly').hide()
	$('.tbl-compare').hide()

	/* event on click display button */
	$('.group').on('click', srvData.onClickBox)

	/* Event on click preview button */
	$("#btn_preview").on('click', srvData.onClickBox)

	self.genFilterYear() // generate filter year.
	self.genFilterMultiYear() // generate filter multi year.
	self.genFilterMultiYear_Overall() // generate filter multi year overall.

}

srvData.genDataTable = function () {
	var col_all

	temp = [{
		defaultContent: '',
		orderable: false,
		searchable: false,
	}, {
		data: srvData.renderColumnAgency,
	}, {
		data: srvData.renderColumnAgencyShortName,
	}, {
		data: srvData.renderColumnNumber_of_file,
	}, {
		data: srvData.renderColumnNumber_of_record,
	}, {
		data: srvData.renderColumnDownload_count_percent,
		orderable: false,
		searchable: false,
	}]
	col_all = temp

	srvData.archiveTableId = 'tbl-overall-monthly'
	ctrl = $('#' + srvData.archiveTableId)
	srvData.dataTableArchive = ctrl.DataTable({
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: col_all,
		//calculate data to push on summay column.
		"footerCallback": function (row, data, start, end, display) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function (i) {
				// return typeof i === 'string' ? i.replace(/[\$,]/g, '')*1 : typeof i === 'number' ?	i : 0;
				return numeral(i).value();
			};

			// Summary column data per 1 page,
			total_page_number_of_file = api.column(3, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b)
			}, 0);
			total_page_number_of_record = api.column(4, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);

			// Summary data colum all page
			total_number_of_file = api.column(3).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);
			total_number_of_record = api.column(4).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);

			// push data summary on footer table.
			$('#total_number_of_file').html(srvData.numberWithCommas(total_page_number_of_file) + "/" + srvData.numberWithCommas(total_number_of_file));
			$('#total_number_of_record').html(srvData.numberWithCommas(total_page_number_of_record) + "/" + srvData.numberWithCommas(total_number_of_record));

		},
		order: [[1, 'asc']],
		rowCallback: self.dataTableRowCallback
	})

	//generate number order on table.
	srvData.dataTableArchive.on('order.dt search.dt', function () {
		srvData.dataTableArchive.column(0, {
			search: 'applied',
			order: 'applied'
		}).nodes().each(function (cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();
}


srvData.genDataTable_multi_year = function () {
	var col_all

	temp = [{
		defaultContent: '',
		orderable: false,
		searchable: false,
	}, {
		data: srvData.renderColumnAgency,
	}, {
		data: srvData.renderColumnAgencyShortName,
	}, {
		data: srvData.renderColumnYear_multi,
	}, {
		data: srvData.renderColumnNumber_of_file,
	}, {
		data: srvData.renderColumnNumber_of_record,
	}, {
		data: srvData.renderColumnDownload_count_percent,
		orderable: false,
		searchable: false,
	}]
	col_all = temp


	srvData.TableId = 'tbl-overall-year'
	ctrl = $('#' + srvData.TableId)
	srvData.dataTableMultiYear = ctrl.DataTable({
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: col_all,
		//calculate data to push on summay column.
		"footerCallback": function (row, data, start, end, display) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function (i) {
				// return typeof i === 'string' ? i.replace(/[\$,]/g, '')*1 : typeof i === 'number' ?	i : 0;
				return numeral(i).value();
			};

			// Summary column data per 1 page,
			total_page_number_of_file = api.column(4, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b)
			}, 0);
			total_page_number_of_record = api.column(5, { page: 'current' }).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);

			// Summary data colum all page
			total_number_of_file = api.column(4).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);
			total_number_of_record = api.column(5).data().reduce(function (a, b) {
				return intVal(a) + intVal(b);
			}, 0);

			// push data summary on footer table.
			$('#total_number_of_file_multi_year').html(srvData.numberWithCommas(total_page_number_of_file) + "/" + srvData.numberWithCommas(total_number_of_file));
			$('#total_number_of_record_multi_year').html(srvData.numberWithCommas(total_page_number_of_record) + "/" + srvData.numberWithCommas(total_number_of_record));

		},
		order: [[1, 'asc']],
		rowCallback: self.dataTableRowCallback
	})


	//generate number order on table.
	srvData.dataTableMultiYear.on('order.dt search.dt', function () {
		order_number = 0
		srvData.dataTableMultiYear.column(0, {
			search: 'applied',
			order: 'applied'
		}).nodes().each(function (cell, i) {
			if ((i + 1) % 3 == 0 || (i + 2) % 3 == 0) {
				cell.innerHTML = "";
			} else {
				order_number += 1
				cell.innerHTML = order_number;
			}
		});
		srvData.dataTableMultiYear.column(1, {
			search: 'applied',
			order: 'applied'
		}).nodes().each(function (cell, i) {
			if ((i + 1) % 3 == 0 || (i + 2) % 3 == 0) {
				cell.innerHTML = "";
			}
		});
		srvData.dataTableMultiYear.column(2, {
			search: 'applied',
			order: 'applied'
		}).nodes().each(function (cell, i) {
			if ((i + 1) % 3 == 0 || (i + 2) % 3 == 0) {
				cell.innerHTML = "";
			}
		});
	}).draw();
}


/**
* seting maximum selected on filter year
*
* @param {json} option
* @param {json} checked
*
*/
srvData.maximumSelecteYear = function (option, checked) {
	var selectedOptions = $('#filter_multi_year option:selected'); //year selected

	if (typeof selectedOptions === undefined || selectedOptions == null) { return false }

	if (selectedOptions.length >= 3) {
		// Disable all other checkboxes.
		var nonSelectedOptions = $('#filter_multi_year option').filter(function () {
			return !$(this).is(':selected');
		});

		nonSelectedOptions.each(function () {
			var input = $('input[value="' + $(this).val() + '"]');
			input.prop('disabled', true);
			input.parent('li').addClass('disabled');
		});
	}
	else {
		// Enable all checkboxes.
		$('#filter_multi_year option').each(function () {
			var input = $('input[value="' + $(this).val() + '"]');
			input.prop('disabled', false);
			input.parent('li').addClass('disabled');
		});
	}
}

/**
* seting maximum selected on filter year
*
* @param {json} option
* @param {json} checked
*
*/
srvData.maximumSelecteYear_Overall = function (option, checked) {
	var selectedOptions = $('#filter_multi_overall option:selected'); //year selected

	if (typeof selectedOptions === undefined || selectedOptions == null) { return false }

	if (selectedOptions.length >= 3) {
		// Disable all other checkboxes.
		var nonSelectedOptions = $('#filter_multi_overall option').filter(function () {
			return !$(this).is(':selected');
		});

		nonSelectedOptions.each(function () {
			var input = $('input[value="' + $(this).val() + '"]');
			input.prop('disabled', true);
			input.parent('li').addClass('disabled');
		});
	}
	else {
		// Enable all checkboxes.
		$('#filter_multi_overall option').each(function () {
			var input = $('input[value="' + $(this).val() + '"]');
			input.prop('disabled', false);
			input.parent('li').addClass('disabled');
		});
	}
}


/**
* event onclick display box 1 or box 2
*
*/
srvData.onClickBox = function () {
	var btn_display = $(this).attr('data-name'); // buttons to select display data
	var filter_multi_year = document.getElementById('filter_multi_year'); //year
	var filter_multi_overall = document.getElementById('filter_multi_overall'); //year

	if (btn_display == undefined) {
		$('.grp-active').removeClass('grp-active');
		$(this).addClass('grp-active').find('input').prop('checked', true);
	}

	box = $('input[name="box"]:checked').val();

	$(filter_multi_year).multiselect({ includeSelectAllOption: true });
	$(filter_multi_year).multiselect('rebuild');
	$(filter_multi_year).multiselect('updateButtonText');

	
	$(filter_multi_overall).multiselect({ includeSelectAllOption: true });
	$(filter_multi_overall).multiselect('rebuild');
	$(filter_multi_overall).multiselect('updateButtonText');

	srvData.prePareData() // prepare data for display on page
	srvData.maximumSelecteYear() //set default maximum selected on filter year.
	srvData.maximumSelecteYear_Overall() //set default maximum selected on filter year overall.

}




/**
* preparing data
*
*/
srvData.prePareData = function () {
	// clear data on table compare yearly.
	$('#tbl-compare-yearly > tbody > tr').remove();
	$('#bar-graph').empty().show();
	//box 2 is compare yearly view, box 1 is coverall view
	if (box == '2') {

		/* check selected on filter is not null. */
		var mul_year = $('#filter_multi_year').val(); // year

		if (mul_year == null) {
			bootbox.alert(srvData.translator['msg_err_require_filter']);
			return false
		}

		//setting parameter for box 2
		var param = {
			year: $('#filter_multi_year').val().join(),
			agency_id: $('#filter_agency').val()
		}

		//get data from service to display on box 2.
		apiService.SendRequest('GET', srvData.service_compare_yearly, param, srvData.displayDataCompare)

		//setting display on box 2
		$('.overall_monthly').hide(); // hide filter for overal monthly view.
		$('.compare_yearly').show(); //display filter for compare yearly view.
		$('.tbl-overall').hide();
		$('.tbl-overall-2').hide();
		$('.tbl-compare').show();
		$('#bar-graph-offline').empty().hide();

		// set default filter multiselect year on compare.
		$('#filter_multi_overall').val($('#filter_multi_year').val());

	} else {
		/* check selected on filter is not null. */
		var mul_year = $('#filter_year').val(); //year

		var multi_overall = $('#filter_multi_overall').val(); //year

		if (mul_year == '' || multi_overall.length <= 0 ) {
			bootbox.alert(srvData.translator['msg_err_require_filter']);
			return false
		}

		filter_form = $('#filter_form').val()
		if (filter_form == '1') {
			$('#filter_yaer2').show()
			$('#filter_year').hide()
			$('#month_overall').hide()

			var multi_year_overall = $('#filter_multi_overall').val()
			multi_year_overall.sort(function (a, b) { return a - b });

			srvData.param = {
				year_arr: multi_year_overall,
				connection_format: $('#filter_connection').val()
			}

			apiService.SendRequest('GET', srvData.service_overall_multiple, srvData.param, srvData.displayDataOverall);

		}

		if (filter_form == '2') {
			$('#filter_yaer2').hide()
			$('#filter_year').show()
			$('#month_overall').show()

			srvData.param = {
				year: $('#filter_year').val(),
				month: $('#filter_month').val(),
				connection_format: $('#filter_connection').val()
			}

			apiService.SendRequest('GET', srvData.service_overall_overall, srvData.param, srvData.displayDataOverall);

		}

		if (filter_form == '3') {
			$('#filter_yaer2').show()
			$('#filter_year').hide()
			$('#month_overall').show()

			var multi_yaer_overall = $('#filter_multi_overall').val()
			multi_yaer_overall.sort(function (a, b) { return a - b });

			srvData.param = {
				year_arr: multi_yaer_overall,
				month: $('#filter_month').val(),
				connection_format: $('#filter_connection').val()
			}

			apiService.SendRequest('GET', srvData.service_overall_multiple, srvData.param, srvData.displayDataOverall);
		}

		//setting display on overall view.
		$('.overall_monthly').show();
		$('.compare_yearly').hide();
		$('.tbl-compare').hide();
		$('.tbl-overall').show();
		$('.tbl-overall-2').show();
		$('#bar-graph-offline').empty().hide();

		// set default filter multiselect year on compare.
		$('#filter_multi_year').val($('#filter_multi_overall').val());

	}
}


/**
* Show comparative data for each month.
*
*/
srvData.displayDataOverall = function (or) {
	filter_form = $('#filter_form').val()

	//push data on table overall.
	srvData.dataTableArchive.clear()
	srvData.dataTableMultiYear.clear()
	if (JH.GetJsonValue(or, "result") != "OK") { return false; }

	if (srvData.param.connection_format == "") {
		if (filter_form == 1) {
			$('#bar-graph-offline').empty().show();
			$('.tbl-overall').hide();
			$('.tbl-overall-2').hide();
			var online_data = []
			var offline_data = []
			for (let i = 0; i < or.data.length; i++) {
				if (i % 2 == 0) {
					str = i.toString()
					online_data.push(JH.GetJsonValue(or, "data." + str))
				} else {
					str = i.toString()
					offline_data.push(JH.GetJsonValue(or, "data." + str))
				}
			}
			srvData.genChart({ result: "OK", data: online_data }); //generate data on chart.
			srvData.genChartOffline({ result: "OK", data: offline_data }); //generate data on chart.
		}

		if (filter_form == 2) {
			$('#bar-graph-offline').empty().show();
			$('.tbl-overall').hide();
			$('.tbl-overall-2').hide();
			srvData.genChart({ result: "OK", data: JH.GetJsonValue(or, "data.online") }); //generate data on chart.
			srvData.genChartOffline({ result: "OK", data: JH.GetJsonValue(or, "data.offline") }); //generate data on chart.
		}

		if (filter_form == 3) {
			$('#bar-graph-offline').empty().show();
			$('.tbl-overall').hide();
			$('.tbl-overall-2').hide();
			var online_data = []
			var offline_data = []
			for (let i = 0; i < or.data.length; i++) {
				if (i % 2 == 0) {
					str = i.toString()
					online_data.push(JH.GetJsonValue(or, "data." + str))
				} else {
					str = i.toString()
					offline_data.push(JH.GetJsonValue(or, "data." + str))
				}
			}
			srvData.genChart({ result: "OK", data: online_data }); //generate data on chart.
			srvData.genChartOffline({ result: "OK", data: offline_data }); //generate data on chart.
		}

	} else {
		if (srvData.param.connection_format == "online") {
			if (filter_form == 1) {
				$('#bar-graph-offline').empty().hide();
				$('#bar-graph').empty().show();
				$('.tbl-overall').hide();
				$('.tbl-overall-2').show();
				var online_data = []
				for (let i = 0; i < or.data.length; i++) {
					if (i % 2 == 0) {
						str = i.toString()
						online_data.push(JH.GetJsonValue(or, "data." + str))
					}
				}
				srvData.genChart({ result: "OK", data: online_data }); //generate data on chart.
				for (let i = 0; i < online_data.length; i++) {
					srvData.dataTableMultiYear.rows.add(online_data[i]["data_overall"][0]);
				}
			}

			if (filter_form == 2) {
				$('#bar-graph-offline').empty().hide();
				$('#bar-graph').empty().show();
				$('.tbl-overall').show();
				$('.tbl-overall-2').hide();
				srvData.genChart({ result: "OK", data: JH.GetJsonValue(or, "data.online") }); //generate data on chart.
				srvData.dataTableArchive.column(5).visible(true);
				srvData.dataTableArchive.rows.add(JH.GetJsonValue(or, "data." + srvData.param.connection_format));
			}

			if (filter_form == 3) {
				$('#bar-graph-offline').empty().hide();
				$('#bar-graph').empty().show();
				$('.tbl-overall').hide();
				$('.tbl-overall-2').show();
				var online_data = []
				for (let i = 0; i < or.data.length; i++) {
					if (i % 2 == 0) {
						str = i.toString()
						online_data.push(JH.GetJsonValue(or, "data." + str))
					}
				}
				srvData.genChart({ result: "OK", data: online_data }); //generate data on chart.
				for (let i = 0; i < online_data.length; i++) {
					srvData.dataTableMultiYear.rows.add(online_data[i]["data_overall"][0]);
				}
			}

		} else {
			if (filter_form == 1) {
				$('#bar-graph-offline').empty().show();
				$('#bar-graph').empty().hide();
				$('.tbl-overall').hide();
				$('.tbl-overall-2').show();
				var offline_data = []
				for (let i = 0; i < or.data.length; i++) {
					if (i % 2 == 0) {
						//do not !!
					} else {
						str = i.toString()
						offline_data.push(JH.GetJsonValue(or, "data." + str))
					}
				}
				srvData.genChartOffline({ result: "OK", data: offline_data }); //generate data on chart.
				for (let i = 0; i < offline_data.length; i++) {
					srvData.dataTableMultiYear.rows.add(offline_data[i]["data_overall"][0]);
				}
			}

			if (filter_form == 2) {
				$('#bar-graph-offline').empty().show();
				$('#bar-graph').empty().hide();
				$('.tbl-overall').show();
				$('.tbl-overall-2').hide();
				srvData.genChartOffline({ result: "OK", data: JH.GetJsonValue(or, "data.offline") }); //generate data on chart.
				srvData.dataTableArchive.column(5).visible(false);
				srvData.dataTableArchive.rows.add(JH.GetJsonValue(or, "data." + srvData.param.connection_format));
			}

			if (filter_form == 3) {
				$('#bar-graph-offline').empty().show();
				$('#bar-graph').empty().hide();
				$('.tbl-overall').hide();
				$('.tbl-overall-2').show();
				var offline_data = []
				for (let i = 0; i < or.data.length; i++) {
					if (i % 2 == 0) {
						//do not !!
					} else {
						str = i.toString()
						offline_data.push(JH.GetJsonValue(or, "data." + str))
					}
				}
				srvData.genChartOffline({ result: "OK", data: offline_data }); //generate data on chart.
				for (let i = 0; i < offline_data.length; i++) {
					srvData.dataTableMultiYear.rows.add(offline_data[i]["data_overall"][0]);
				}
			}
		}
	}


	srvData.dataTableArchive.draw()
	srvData.dataTableMultiYear.draw()
}



/**
* set disaply data on overal compare yearly
*
*/
srvData.displayDataCompare = function (cp) {
	var cp_data = apiService.getFieldValue(cp, 'data'); //data compare

	if (cp_data == null) {
		return
	}

	for (var i = cp_data.length - 1; i >= 0; i--) {

		var year = cp_data[i]['year']; //year

		for (var j = 0; j < 3; j++) {
			var sum = 0;
			var loop_count = 0;

			//generate element <tr> on table.
			$('#tbl-compare-yearly > tbody').append('<tr class="' + i + j + '"></tr>');

			//count loop is <tr> include <td> year.
			if (j == 0) {
				var loop_count = 15;
			}

			//generate data each row of table
			for (var k = 0; k < 13; k++) {
				if (j == 0) {
					var data = cp_data[i]['number_of_file'][k]; //number of file
				} else if (j == 1) {
					var data = cp_data[i]['number_of_record'][k]; // number of record
				} else {
					var data = cp_data[i]['download_count_percent'][k]; // download count percent
				}

				data = parseFloat(data);

				/* sum data of each row data */
				if (k !== 12) {
					sum = sum + data;
				}

				var percent = srvData.numberWithCommas(data.toFixed(2)); //set format of percent number


				//Insert column data on body table.
				if (k == 0 && loop_count == 15) {
					//Insert rown year only first rown and title name data.
					$('#tbl-compare-yearly > tbody > tr.' + i + j).append('<td class="txt-middle" rowspan="3">' + year + '</td><td>' + srvData.translator['number_file_import'] + '</td><td>' + srvData.numberWithCommas(data) + '</td>');
				} else {
					//Insert title data name.
					if (j == 1 && k == 0) {
						$('#tbl-compare-yearly > tbody > tr.' + i + j).append('<td style="text-align:left;">' + srvData.translator['number_data_import'] + '</td>');
					} if (j == 2 && k == 0) {
						$('#tbl-compare-yearly > tbody > tr.' + i + j).append('<td style="text-align:left;">' + srvData.translator['ratio_import_data'] + '</td>');
					}

					// insert data to table
					if (k == 12) {
						//insert data on sumn column.
						if (j == 2) {
							$('#tbl-compare-yearly > tbody > tr.' + i + j).append('<td class="sum_column">' + '' + '</td>');
						} else {
							$('#tbl-compare-yearly > tbody > tr.' + i + j).append('<td class="sum_column">' + srvData.numberWithCommas(sum) + '</td>');
						}
					} else if (j == 2) {
						//insert data on each month column.
						$('#tbl-compare-yearly > tbody > tr.' + i + j).append('<td style="text-align:right;">' + percent + '</td>');
					} else {
						$('#tbl-compare-yearly > tbody > tr.' + i + j).append('<td style="text-align:right;">' + srvData.numberWithCommas(data) + '</td>');
					}
				}
			}
		}
	}
	/* generate chart */
	srvData.genChart(cp)
}


/**
* generate data in filter year on overal monthly view
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
* genarate data in filter agency on overal monthly view
*
*/
srvData.genFilterAgency = function (ac) {
	var filter_agency = document.getElementById('filter_agency'); //elemtn filter agency
	var tempAgency = [];
	// เก็บ agency ทั้งหมดลง tempAgency
	var ac_data = apiService.getFieldValue(ac, 'data.online'); // agemcy data
	for (var i = 0; i < ac_data.length; i++) {
		tempAgency.push({ txt_option: JH.GetJsonLangValue(ac_data[i], 'agency.agency_name', true), val_option: ac_data[i]['agency']['id'] });
	}

	ac_data = apiService.getFieldValue(ac, 'data.offline'); // agemcy data
	for (var i = 0; i < ac_data.length; i++) {
		tempAgency.push({ txt_option: JH.GetJsonLangValue(ac_data[i], 'agency.agency_name', true), val_option: ac_data[i]['agency']['id'] });
	}
	// ตัด agency ที่ซ้ำออก
	agency = JH.UniqueArray(tempAgency, "val_option");
	// เรียงตาม ชื่อ 
	JH.Sort(agency, "txt_option");

	for (var i = 0; i < agency.length; i++) {
		var gen_option = document.createElement('option'); // create option element
		var txt_option = JH.GetJsonValue(agency[i], 'txt_option'); // option name
		var val_option = JH.GetJsonValue(agency[i], 'val_option'); // option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_agency.add(gen_option)
	}
}


/**
* generate data in filter multi year on compare yearly view
*
*/
srvData.genFilterMultiYear = function () {
	var d = new Date(); //date and time
	var filter_multi_year = document.getElementById('filter_multi_year'); //element filter year

	for (var i = 0; i <= 10; i++) {
		var gen_option = document.createElement('option'); //create option element
		var txt_option = cur_year - i; //option name
		var val_option = cur_year - i; // option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_multi_year.add(gen_option)
	}

	$('#filter_multi_year').val(default_multi_year); //set default selected on filter milti yearly.
	$(filter_multi_year).multiselect({ includeSelectAllOption: true });
	$(filter_multi_year).multiselect('rebuild');
	$(filter_multi_year).multiselect('updateButtonText');

}

/**
* generate data in filter multi year on compare yearly view
*
*/
srvData.genFilterMultiYear_Overall = function () {
	var d = new Date(); //date and time
	var filter_multi_overall = document.getElementById('filter_multi_overall'); //element filter year

	for (var i = 0; i <= 10; i++) {
		var gen_option = document.createElement('option'); //create option element
		var txt_option = cur_year - i; //option name
		var val_option = cur_year - i; // option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_multi_overall.add(gen_option)
	}

	$('#filter_multi_overall').val(default_multi_year); //set default selected on filter milti yearly.
	$(filter_multi_overall).multiselect({ includeSelectAllOption: true });
	$(filter_multi_overall).multiselect('rebuild');
	$(filter_multi_overall).multiselect('updateButtonText');

}



/**
* generate data to push on chart
*
* @param {json} dt
*/
srvData.genChart = function (dt) {
	var box = $('input[name="box"]:checked').val(); //select box 1 or 2
	var data_cat = []; //category data of X axis on overral monthly
	var download_count_percent = []; //the data for generate graph

	/* generate data to put chart on overall monthly view (box = 1)	or compare yearly view. */
	if (box == '1') {
		filter_form = $('#filter_form').val()
		if (filter_form == '1') {
			var xTitle = srvData.translator['agency']; // X axis title of overall monthly
			var yTitle = srvData.translator['col_import_percent']; // Y axis title of overall monthly
			var data_series = [];
			var data_cat = [];
			var len_name = dt.data.length
			var len_data = dt['data'][0]['data_overall'][0]['length']

			for (let i = 0; i < len_data; i++) {
				var short_name = dt['data'][0]['data_overall'][0][i]['agency']['agency_shortname']['en']
				if (short_name) {
					data_cat.push(short_name);
				}
			}

			for (let i = 0; i < len_name; i++) {
				var isdata = []
				for (let j = 0; j < len_data; j++) {
					isdata.push(parseFloat((dt['data'][i]['data_overall'][0][j]['download_count_percent']).toFixed(2)))
				}
				var tmp = {
					name: dt.data[i].year,
					data: isdata
				}
				data_series.push(tmp)
			}
		}

		if (filter_form == '2') {

			var xTitle = srvData.translator['agency']; // X axis title of overall monthly
			var yTitle = srvData.translator['col_import_percent']; // Y axis title of overall monthly

			for (i = 0; i < dt['data'].length; i++) {
				//var agency_shortname = ' ';
				var short_name = dt['data'][i]['agency']['agency_shortname']['en']; //agenct sshort name
				var count_percent = dt['data'][i]['download_count_percent']; // download count percent

				if (short_name) {
					data_cat.push(short_name);
				}

				download_count_percent.push(parseFloat(count_percent.toFixed(2)));
			}

			var data_series = [{
				name: srvData.translator['col_import_percent'],
				data: download_count_percent
			}]; //data to generate graph on overall monthly
		}

		if (filter_form == '3') {
			var month = $('#filter_month').val() - 1
			var arr_month = [
				srvData.translator['jan'],
				srvData.translator['feb'],
				srvData.translator['mar'],
				srvData.translator['apr'],
				srvData.translator['may'],
				srvData.translator['june'],
				srvData.translator['july'],
				srvData.translator['aug'],
				srvData.translator['sept'],
				srvData.translator['oct'],
				srvData.translator['nov'],
				srvData.translator['dec'],
			];
			var xTitle = srvData.translator['agency']; // X axis title of overall monthly
			var yTitle = srvData.translator['col_import_percent']; // Y axis title of overall monthly
			var data_series = [];
			var data_cat = [];
			var len_name = dt.data.length
			var len_data = dt['data'][0]['data_overall'][0]['length']

			for (let i = 0; i < len_data; i++) {
				var short_name = dt['data'][0]['data_overall'][0][i]['agency']['agency_shortname']['en']
				if (short_name) {
					data_cat.push(short_name);
				}
			}

			for (let i = 0; i < len_name; i++) {
				var isdata = []
				for (let j = 0; j < len_data; j++) {
					isdata.push(parseFloat((dt['data'][i]['data_overall'][0][j]['download_count_percent']).toFixed(2)))
				}
				var tmp = {
					name: " (" + arr_month[month] + ") " + dt.data[i].year,
					data: isdata
				}
				data_series.push(tmp)
			}
		}

	}
	else {
		var xTitle = srvData.translator['month']; // X axis title of overall yearly
		var yTitle = srvData.translator['col_import_percent']; // Y axis title of overall yearly
		var data_series = []  //data to generate graph on overall yearly
		var data_cat = [
			srvData.translator['jan'],
			srvData.translator['feb'],
			srvData.translator['mar'],
			srvData.translator['apr'],
			srvData.translator['may'],
			srvData.translator['june'],
			srvData.translator['july'],
			srvData.translator['aug'],
			srvData.translator['sept'],
			srvData.translator['oct'],
			srvData.translator['nov'],
			srvData.translator['dec'],
		]; //category data of X axis on overral yearly

		for (var i = 0; i < dt['data'].length; i++) {
			var data_year = dt['data'][i]['year']; //year
			var data_percent = dt['data'][i]['download_count_percent']; //download count percent

			for (var j = 0; j < data_percent.length; j++) {
				data_percent[j] = parseFloat(data_percent[j].toFixed(2));
			}

			data_series[i] = {
				name: data_year,
				data: data_percent
			}
		}
	}

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
			categories: data_cat,
			crosshair: true,
			title: {
				text: xTitle
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: yTitle
			}
		},
		tooltip: {
			headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
			pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
				'<td style="padding:0"><b>{point.y:.2f} %</b></td></tr>',
			footerFormat: '</table>',
			shared: true,
			useHTML: true
		},
		plotOptions: {
			column: {
				pointPadding: 0.1,
				borderWidth: 0,
				dataLabels: {
					enabled: true,
					rotation: 270,
					y: 0,
					crop: false,
				}
			}
		},
		series: data_series
	});
}
/**
* generate data to push on chart offline
*
* @param {json} dt
*/
srvData.genChartOffline = function (dt) {
	var box = $('input[name="box"]:checked').val(); //select box 1 or 2
	var data_cat = []; //category data of X axis on overral monthly
	var download_count = []; //the data for generate graph

	filter_form = $('#filter_form').val()
	if (filter_form == '1') {
		var xTitle = srvData.translator['agency']; // X axis title of overall monthly
		var yTitle = srvData.translator['number_file_import']; // Y axis title of overall monthly
		var data_series = [];
		var data_cat = [];
		var len_name = dt.data.length
		var len_data = dt['data'][0]['data_overall'][0]['length']

		for (let i = 0; i < len_data; i++) {
			var short_name = dt['data'][0]['data_overall'][0][i]['agency']['agency_shortname']['en']
			if (short_name) {
				data_cat.push(short_name);
			}
		}

		for (let i = 0; i < len_name; i++) {
			var isdata = []
			for (let j = 0; j < len_data; j++) {
				isdata.push(parseFloat(dt['data'][i]['data_overall'][0][j]['download_count']))
			}
			var tmp = {
				name: dt.data[i].year,
				data: isdata
			}
			data_series.push(tmp)
		}
	}

	if (filter_form == '2') {
		/* generate data to put chart on overall monthly view (box = 1)	or compare yearly view. */
		var xTitle = srvData.translator['agency']; // X axis title of overall monthly
		var yTitle = srvData.translator['number_file_import']; // Y axis title of overall monthly

		for (i = 0; i < dt['data'].length; i++) {
			//var agency_shortname = ' ';
			var short_name = dt['data'][i]['agency']['agency_shortname']['en']; //agenct sshort name
			var count_percent = dt['data'][i]['download_count']; // download count percent

			if (short_name) {
				data_cat.push(short_name);
			}

			download_count.push(parseFloat(count_percent));
		}

		var data_series = [{
			name: srvData.translator['number_file_import'],
			data: download_count
		}]; //data to generate graph on overall monthly
	}

	if (filter_form == '3') {
		var month = $('#filter_month').val() - 1
		var arr_month = [
			srvData.translator['jan'],
			srvData.translator['feb'],
			srvData.translator['mar'],
			srvData.translator['apr'],
			srvData.translator['may'],
			srvData.translator['june'],
			srvData.translator['july'],
			srvData.translator['aug'],
			srvData.translator['sept'],
			srvData.translator['oct'],
			srvData.translator['nov'],
			srvData.translator['dec'],
		];
		var xTitle = srvData.translator['agency']; // X axis title of overall monthly
		var yTitle = srvData.translator['number_file_import']; // Y axis title of overall monthly
		var data_series = [];
		var data_cat = [];
		var len_name = dt.data.length
		var len_data = dt['data'][0]['data_overall'][0]['length']

		for (let i = 0; i < len_data; i++) {
			var short_name = dt['data'][0]['data_overall'][0][i]['agency']['agency_shortname']['en']
			if (short_name) {
				data_cat.push(short_name);
			}
		}

		for (let i = 0; i < len_name; i++) {
			var isdata = []
			for (let j = 0; j < len_data; j++) {
				isdata.push(parseFloat(dt['data'][i]['data_overall'][0][j]['download_count']))
			}
			var tmp = {
				name: " (" + arr_month[month] + ") " + dt.data[i].year,
				data: isdata
			}
			data_series.push(tmp)
		}
	}

	Highcharts.chart('bar-graph-offline', {
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
			categories: data_cat,
			crosshair: true,
			title: {
				text: xTitle
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: yTitle
			}
		},
		tooltip: {
			headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
			pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
				'<td style="padding:0"><b>{point.y}</b></td></tr>',
			footerFormat: '</table>',
			shared: true,
			useHTML: true
		},
		plotOptions: {
			column: {
				pointPadding: 0.1,
				borderWidth: 0,
				dataLabels: {
					enabled: true,
					rotation: 270,
					y: 0,
					crop: false,
				}
			}
		},
		series: data_series
	});
}


/**
* Put data in coulmn agency
*
* @param {json} row data of each row
*
* @return {text} agency name
*/
srvData.renderColumnAgency = function (row) {
	return JH.GetJsonLangValue(row, 'agency.agency_name', true)
}


/**
* Put data in coulmn agency short name
*
* @param {json} row data of each row
*
* @return {text} agency short name
*/
srvData.renderColumnAgencyShortName = function (row) {
	return JH.GetJsonLangValue(row, 'agency.agency_shortname', true)
}


/**
* Put data in coulmn number of file
*
* @param {json} row data of each row
*
* @return {text} number of file
*/
srvData.renderColumnNumber_of_file = function (row) {
	return srvData.numberWithCommas(JH.GetJsonValue(row, 'number_of_file'))
}


/**
* Put data in coulmn year of data
*
* @param {json} row data of each row
*
* @return {text} number of file
*/
srvData.renderColumnYear_multi = function (row) {
	// year = $("#filter_year").val()
	return JH.GetJsonLangValue(row, 'agency.year', true)
}

/**
* Put data in coulmn year of data
*
* @param {json} row data of each row
*
* @return {text} number of file
*/
srvData.renderColumnYear = function (row) {
	return $("#filter_year").val()
}

/**
* Put data in coulmn number of record
*
* @param {json} row data of each row
*
* @return {text} number of record
*/
srvData.renderColumnNumber_of_record = function (row) {
	return srvData.numberWithCommas(JH.GetJsonValue(row, 'number_of_record'))
}


/**
* Put data in coulmn download cont percent
*
* @param {json} row data of each row
*
* @return {text} download cont percent
*/
srvData.renderColumnDownload_count_percent = function (row) {
	return parseFloat(JH.GetJsonValue(row, 'download_count_percent')).toFixed(2)
}

// Format number with commas
srvData.numberWithCommas = function (nStr) {
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

