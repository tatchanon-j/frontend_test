/**
*
*   Main JS application file for ignore data page.
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
srvData.init = function (translator) {

	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service_ignore_table = 'thaiwater30/backoffice/tool/ignore_table'; //service ignore table
	self.service_ignore_station = 'thaiwater30/backoffice/tool/ignore_station'; //service ignore station
	self.service_ignore_history = 'thaiwater30/backoffice/tool/ignore_history'; //service ignore history
	self.service_ignore = 'thaiwater30/backoffice/tool/ignore'; //service ignore
	self.service_ignore_rainfall_detail = 'thaiwater30/backoffice/tool/ignore_rainfall_detail'; //service ignore rainfall detail


	apiService.SendRequest('GET', self.service_ignore_table, {}, function (rs) {
		self.genFilterDatatype(rs);
		//self.genFiltergnorepurpose(rs);
		// self.genFilterDlgDatatype(rs);
	})

	apiService.SendRequest('GET', self.service_ignore_station, {}, function (rs) {
		self.genFilterStation(rs);
		//self.genFiltergnorepurpose(rs);
		// self.genFilterDlgDatatype(rs);
	})

	//setting table history.
	self.historyTable = 'tbl-history-ignore'
	ctrl_history = $('#' + self.historyTable)
	self.dataTable_his = ctrl_history.DataTable({
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: [{
			defaultContent: '',
			orderable: false,
			searchable: false,
		}, {
			data: self.renderHisColumnDateIgnore,
		},
		{
			data: self.renderHisColumnUser,
		},
		{
			data: self.renderHisColumnStationCode,
		},
		{
			data: self.renderHisColumnStation,
		},
		{
			data: self.renderHisColumnProvince,
		},
		{
			data: self.renderHisColumnAgency,
		},
		{
			data: self.renderHisColumnDateData,
		},
		{
			data: self.renderHisColumnValueData,
		},
		{
			data: self.renderHisColumnRemark,
		}],
		order: [[1, 'desc']],
		// rowCallback : self.dataTableRowCallback
	})

	self.dataTable_his.on('order.dt search.dt', function () {
		self.dataTable_his.column(0, {
			search: 'applied',
			order: 'applied'
		}).nodes().each(function (cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();
	/* setting default on filter date */


	// $('#startdate').datepicker({
	// 	"setDate" : new Date(),
	// });

	$('#filter_datestart,#filter_dateend,#ignore_filter_datestart,#unignore_filter_datestart,#filter_ignore_datestart').datetimepicker({
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
	var datetime = currentdate.getFullYear() + "-"
		+ ("0" + (currentdate.getMonth() + 1)).slice(-2) + "-"
		+ ("0" + currentdate.getDate()).slice(-2) + " "; //current date in format

	var st_date = datetime; + '00:00'; //begin time
	var en_date = datetime + '23:59'; //end time
	$('#filter_datestart').val(st_date);
	$('#filter_dateend').val(en_date);
	$('#ignore_filter_datestart').val(st_date);
	$('#unignore_filter_datestart').val(en_date);

	//setting table ignore.
	self.ignoreTable = 'dlgIgnore-tbl-ignore'
	ctrl_ignore = $('#' + self.ignoreTable)
	self.dataTable_ignore = ctrl_ignore.DataTable({
		responsive: true,
		columnDefs: [
			{ responsivePriority: 1, targets: 0 },
			{ responsivePriority: 2, targets: 1 },
			{ responsivePriority: 3, targets: 2 },
			{
				className: 'control',
				orderable: true,
				targets: 0
			}
		],
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: [{
			data: self.renderOldCode
		}, {
			data: function (row, type, val, meta) {
				return self.renderName(row, type, val, meta) + '<span class="visible-xs pull-right" >' + self.renderButtonIgnoreMobile(row, type, val, meta) + '</span>'
			}
		}, {
			data: self.renderProvince
		}, {
			data: self.renderAgency
		}, {
			data: self.renderValue
		}, {
			data: self.renderDate
		}, {
			data: function (row, type, val, meta) {
				return self.renderButtonIgnoreRainfallDetail(row, type, val, meta) + self.renderButtonIgnore(row, type, val, meta)
			}
		}],
		order: []
	})
	self.dataOption = {
		dam_daily: {
			date: 'dam_date', old_code: 'dam.dam_oldcode', name: 'dam.dam_name', province: 'geocode.province_name'
			, agency: 'agency.agency_shortname', value: 'dam_storage', id: 'dam.id'
		},
		dam_hourly: {
			date: 'dam_date', old_code: 'dam.dam_oldcode', name: 'dam.dam_name', province: 'geocode.province_name'
			, agency: 'agency.agency_shortname', value: 'dam_storage', id: 'dam.id'
		},
		rainfall_24h: {
			date: 'rainfall_datetime', old_code: 'station.tele_station_oldcode', name: 'station.tele_station_name'
			, province: 'geocode.province_name', agency: 'agency.agency_shortname', value: 'rain_24h', id: 'station.id'
		},
		tele_waterlevel: {
			date: 'waterlevel_datetime', old_code: 'station.tele_station_oldcode', name: 'station.tele_station_name'
			, province: 'geocode.province_name', agency: 'agency.agency_shortname', value: 'waterlevel_msl', id: 'station.id'
		},
		waterquality: {
			date: 'waterquality_datetime', old_code: 'waterquality_station.waterquality_station_oldcode', name: 'waterquality_station.waterquality_station_name'
			, province: 'waterquality_station.province_name', agency: 'waterquality_station.agency_shortname', value: 'waterquality_salinity', id: 'waterquality_station.id'
		},
	}


	//setting table unignore.
	self.unignoreTable = 'dlgIgnore-tbl-unignore'
	ctrl_unignore = $('#' + self.unignoreTable)
	self.dataTable_unignore = ctrl_unignore.DataTable({
		responsive: true,
		columnDefs: [
			{ responsivePriority: 1, targets: 0 },
			{ responsivePriority: 2, targets: 1 },
			{ responsivePriority: 3, targets: 2 },
			{ responsivePriority: 4, targets: 3 },
			{
				className: 'control',
				orderable: true,
				targets: 0
			}
		],
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: [{
			data: 'station_oldcode'
		}, {
			data: function (row, type, val, meta) {
				return self.renderStationName(row, type, val, meta) + '<span class="visible-xs pull-right" >' + self.renderButtonUnIgnoreMobile(row, type, val, meta) + '</span>'
			}
		}, {
			data: self.renderAgencyShortName
		}, {
			data: self.renderIgnoreValue
		}, {
			data: function (row, type, val, meta) {
				return self.renderButtonUnignoreRainfallDetail(row, type, val, meta) + self.renderButtonUnIgnore(row, type, val, meta)
			}
		}],
		order: [],
		rowCallback: self.dataTableRowCallback
	})

	//setting table ignore rainfall detail
	self.ignoreRainfallDetailTable = 'dlgIgnore-tbl-ignore-rainfall-detail'
	ctrl_ignoreRainfallDetailTable = $('#' + self.ignoreRainfallDetailTable)
	self.dataTable_ignoreRainfallDetailTable = ctrl_ignoreRainfallDetailTable.DataTable({
		responsive: true,
		columnDefs: [
			{ responsivePriority: 1, targets: 0 },
			{ responsivePriority: 2, targets: 1 },
			{ responsivePriority: 3, targets: 2 },
			{ responsivePriority: 4, targets: 3 },
			{
				className: 'control',
				orderable: true,
				targets: 0
			}
		],
		dom: 'frltip',
		language: g_dataTablesTranslator,
		columns: [
			{ data: 'rainfall10m' },
			{ data: 'rainfall15m' },
			{ data: 'rainfall1h' },
			{ data: 'rainfall3h' },
			{ data: 'rainfall6' },
			{ data: 'rainfall24h' },
			{ data: 'rainfall_date' }
		],
		order: [],
		rowCallback: self.dataTableRowCallback
	})




	$('#btn-display').on('click', function () {
		self.displayHistory();
		self.changeColumnNameValue();

	})
	$('#dlg-btn-display').on('click', function () {
		var dt = '';
		self.displayIgnoreSetting(dt);
		self.changeColumnNameValue();
	})
	$('#btn-setting-ignore').on('click', function () {
		self.btnIgnoreClick();
		self.changeColumnNameValue()
	})
	ctrl_ignore.on('click', 'i.btn-ignore', self.ignoreStation)
	ctrl_unignore.on('click', 'i.btn-unignore', self.unignoreStation)

	ctrl_ignore.on('click', 'i.btn-ignore-rainfall-detail', self.ignoreRainfallDetail)
	ctrl_unignore.on('click', 'i.btn-unignore-rainfall-detail', self.ignoreRainfallDetail)

	$('#btn-cancel').on('click', function () {
		$('.ignore-history').show();
		$('.ignore-setting').hide();
		$('#btn-display').show();
	})

	// $("#filter-datestart").datepicker(
	// 	'setDate', new Date()
	// )
	// $("#filter-dateend").datepicker(
	// 	'setDate', new Date()
	// )
	// $("#startdate").datepicker(
	// 	'setDate', new Date()
	// )

	//Add colspan for empty on data table.
	$('.dataTables_empty').attr('colspan', '6');

	$('#filter_datestart,#filter_dateend').datetimepicker({
		format: 'YYYY-MM-DD',
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
	var datetime = currentdate.getFullYear() + "-"
		+ ("0" + (currentdate.getMonth() + 1)).slice(-2) + "-"
		+ ("0" + currentdate.getDate()).slice(-2) + " "; //set format for date

	var st_date = datetime + '00:00'; //begin time
	var en_date = datetime + '23:59'; //end time

	$('#filter_datestart').val(st_date);
	$('#filter_dateend').val(en_date);
}

/**
* get and generate otion into filter station
*
* @param {json} rs data station data
*
*/
srvData.genFilterStation = function (rs) {
	var filter_data_station = document.getElementById('filter_station'); //element data type filter
	var data_station = rs.data; //data type data

	if (data_station.length == undefined) { return false }

	// JH.Sort(data_station, 'ID',false, function(str){
	// 	return str.toLowerCase();
	// })

	for (var i = 0; i < data_station.length; i++) {
		var gen_option = document.createElement('option'); //create option element
		var op_txt = JH.GetJsonLangValue(data_station[i], "Name", true); //data_station[i]['Name']; //option name
		var op_val = data_station[i]['ID']; //option value

		gen_option.text = op_txt;
		gen_option.value = op_val;
		filter_data_station.add(gen_option);
	}
}

var drow;

/**
* generate otion into filter datatype
*
* @param {json} rs data type data
*
*/
srvData.genFilterDatatype = function (rs) {
	var filter_data_type = document.getElementById('filter_datattype'); //element data type filter
	var data_type = rs.data; //data type data

	if (data_type.length == undefined) { return false }

	JH.Sort(data_type, 'data_type', false, function (str) {
		return str.toLowerCase();
	})

	for (var i = 0; i < data_type.length; i++) {
		var gen_option = document.createElement('option'); //create option element
		var op_txt = data_type[i]['name']; //option name
		var op_val = data_type[i]['data_type']; //option value

		gen_option.text = op_txt;
		gen_option.value = op_val;
		filter_data_type.add(gen_option);
	}
}



/**
* generate otion into filter datatype on ingonre view
*
* @param {json} rs data type data
*
*/
srvData.genFilterDlgDatatype = function (rs) {
	var filter_data_type = document.getElementById('dlgIgnore-filter-type'); //element data type filte on form ignore data
	var data_type = rs.data; //data type data

	if (data_type.length == undefined) { return false }

	JH.Sort(data_type, 'data_type', false, function (str) {
		return str.toLowerCase();
	})

	for (var i = 0; i < data_type.length; i++) {
		var gen_option = document.createElement('option'); //create element option
		var op_txt = data_type[i]['name']; //option name
		var op_val = data_type[i]['data_type']; //option value
		gen_option.text = op_txt;
		gen_option.value = op_val;
		filter_data_type.add(gen_option);
	}
}



/**
* get data to generate rows
*
*/
srvData.displayHistory = function () {
	var self = srvData; //initial data
	var param = {}; //parameter
	var filter_datattype = $('#filter_datattype').val(); // datta type

	if (!filter_datattype) {
		bootbox.alert({
			message: self.translator['msg_err_data_null'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})

		return false
	}

	var param = {
		table_name: $('#filter_datattype').val()
	}
	apiService.SendRequest('GET', self.service_ignore_history, param, self.previewDataTablesHistory)
}



/**
* generate data rows on history ignore table
*
* @param {json} rs history ignore data
*
*/
srvData.previewDataTablesHistory = function (rs) {
	srvData.changeColumnNameValue()
	srvData.dataTable_his.clear()
	if (JH.GetJsonValue(rs, "result") != "OK") { return false; }
	srvData.data_history = rs['data'];
	srvData.dataTable_his.rows.add(JH.GetJsonValue(rs, "data"));
	srvData.dataTable_his.draw()
}



/**
* display table ignore and unignore
*
*/
srvData.btnIgnoreClick = function () {
	var data_type = $('#filter_datattype').val(); //data type
	var data_station = $('#filter_station').val(); //data type
	var data_datestart = $('#filter_datestart').val(); //data type
	var data_dateend = $('#filter_dateend').val(); //data type
	srvData.displayIgnoreSetting(data_type, data_station, data_datestart, data_dateend);
}


/**
* get data to generate rows on table ignore and unignore
*
* @param {json} dt data type
*
*/
srvData.displayIgnoreSetting = function (dt, ds, dts, dte) {
	var self = srvData; //initial data
	var param = {}; //parameter

	if (dt && dt != 'reload') {
		$("#dlgIgnore-filter-type").val(dt);
	}

	//var dlg_type = $("#dlgIgnore-filter-type").val(); //data type on ignore setting

	$('#table_name').val(dt);
	if (!dt) {
		bootbox.alert({
			message: self.translator['msg_err_data_null'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}

	//Param reload table.
	// if(dt == 'reload'){
	// 	dlg_type = srvData.data_type;
	// }

	param = {
		table_name: dt,
		station_id: ds,
		date_start: dts,
		date_end: dte
	}

	srvData.data_type = dt;

	$('.ignore-history').hide();
	$('.ignore-setting').show();
	$('#btn-display').hide();
	apiService.SendRequest('GET', srvData.service_ignore, param, function (rs) {
		srvData.displayDataIgnore(rs);
		srvData.displayDataUnIgnore(rs);
		srvData.genMultiSelect(rs);
	})
}


/**
* generate data rows on table ignore
*
* @param {json} dt ignore data
*
*/
srvData.displayDataIgnore = function (rs) {
	srvData.dataTable_ignore.clear()
	if (JH.GetJsonValue(rs.data, "result") != "OK") { return false; }
	srvData.data_ignore = rs.data.data;
	srvData.dataTable_ignore.rows.add(JH.GetJsonValue(rs.data, "data"));
	srvData.dataTable_ignore.draw();
	srvData.toggleButtonRianfalDetail();
}



/**
* generate data rows on table unignore
*
* @param {json} dt unignore data
*
*/
srvData.displayDataUnIgnore = function (rs) {
	srvData.dataTable_unignore.clear()
	if (JH.GetJsonValue(rs.ignore_data, "result") != "OK") { return false; }
	srvData.data_unignore = rs.ignore_data.data;
	srvData.dataTable_unignore.rows.add(JH.GetJsonValue(rs.ignore_data, "data"));
	srvData.dataTable_unignore.draw();
	srvData.toggleButtonRianfalDetail();
}


/**
* ignore station
*
* @param {json} dt unignore data
*
*/
srvData.ignoreStation = function () {
	document.getElementById('ignoremodal-form').reset();
	var row = srvData.dataTable_ignore.row($(this).closest('tr')); //row number
	var data = row.data(); //data in row on table

	// insert station name to modal
	$('#ig_station').val(JH.GetJsonLangValue(data, "station.tele_station_name"));
	$('#ig_remark').val(JH.GetJsonLangValue(data, "remark"));

	var currentdate = new Date(); //current date
	var datetime = currentdate.getFullYear() + "-"
		+ ("0" + (currentdate.getMonth() + 1)).slice(-2) + "-"
		+ ("0" + currentdate.getDate()).slice(-2) + " " + currentdate.getHours() + ":" + currentdate.getMinutes(); //current date in format

	$('#filter_ignore_datestart').val(datetime);


	$('#ignore-btn').on('click', function () {
		//self.saveIgnoreModal(row)
		var v_table_name = JH.GetJsonValue(data, "station_type"); // station type
		var v_data_id = JH.GetJsonValue(data, "id"); //ignore data id
		var v_station_id = JH.GetJsonValue(data, JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".id")); //station id

		var param = {
			table_name: v_table_name,
			data_id: v_data_id.toString(),
			station_id: v_station_id.toString(),
			ignore_datetime: $('#filter_ignore_datestart').val(),
			ignore_cause: $('#ig_remark').val(),
			is_ignore: true
		}

		console.log(param)

		apiService.SendRequest('PATCH', srvData.service_ignore, param, function (rs) {
			console.log(rs)

			if (rs.result != 'OK') {
				bootbox.alert(srvData.translator['msg_err_no_ignore']);
				return false;
			}
			data["data_id"] = v_data_id;
			data["station_id"] = v_station_id;
			data["data_category"] = v_table_name;
			data["station_oldcode"] = srvData.renderOldCode(data);
			data["data_datetime"] = srvData.renderDate(data);
			data["station_name"] = JH.GetJsonValue(data, srvData.beforeRenderName());
			data["station_province"] = JH.GetJsonValue(data, srvData.beforeRenderProvince());
			data["agency_shortname"] = JH.GetJsonValue(data, srvData.beforeRenderAgency());
			row.remove();
			srvData.dataTable_unignore.row.add(data);
			srvData.dataTable_ignore.draw();

		});

		$('#ignoremodal').modal('hide');
	});
}

/**
* create option into filter agency
*
* @param {json} dt agency data
*/
srvData.genFiltergnorepurpose = function (dt) {
	// if(dt['data']['agency']){

	// 	var filter_name = 'agency'; //filter name
	// 	var dt_agency = dt['data']['agency']; //agency data

	// 	/* sort option list by alphabet */
	// 	JH.Sort(dt_agency, 'text', false, function(x){
	// 		return JH.GetLangValue(x).toLowerCase();
	// 	})

	// 	var select = srvData.createOption(dt,filter_name,dt_agency); //create option list
	// 	$(select).multiselect({includeSelectAllOption:true});
	// 	$(select).multiselect('rebuild');
	// 	$(select).multiselect('selectAll',false);
	// 	$(select).multiselect('updateButtonText');
	// }

	// if(dt['data']['event_type']){
	// 	var filter_name = 'event_type'; //filter name
	// 	var dt_agency = dt['data']['event_type']; //event type data
	// 	var select = srvData.createOption(dt,filter_name,dt_agency, true);
	// 	$(select).select2().triggerHandler('change');
	// }
}

/**
* cancel ignore staiton
*
*/
srvData.unignoreStation = function () {
	var row = srvData.dataTable_unignore.row($(this).closest('tr')); //row number
	var data = row.data(); // data row in table

	// insert station name to modal
	$('#unig_station').val(JH.GetJsonLangValue(data, "station_name"));
	$('#unig_remark').val(JH.GetJsonLangValue(data, "remark"));

	var currentdate = new Date(); //current date
	var datetime = currentdate.getFullYear() + "-"
		+ ("0" + (currentdate.getMonth() + 1)).slice(-2) + "-"
		+ ("0" + currentdate.getDate()).slice(-2) + " " + currentdate.getHours() + ":" + currentdate.getMinutes(); //current date in format

	$('#filter_unignore_datestart').val(JH.GetJsonValue(data, "ignore_datetime"));
	$('#filter_unignore_dateend').val(datetime);

	$('#unignore-btn').on('click', function () {
		//self.saveIgnoreModal(row)
		var v_table_name = JH.GetJsonValue(data, "data_category"); //table name
		var v_data_id = JH.GetJsonValue(data, "data_id"); //data ignore id
		var v_station_id = JH.GetJsonValue(data, "station_id"); // station id

		var param = {
			table_name: v_table_name,
			data_id: v_data_id.toString(),
			station_id: v_station_id.toString(),
			ignore_datetime: $('#filter_ignore_datestart').val(),
			ignore_cause: $('#ig_remark').val(),
			is_ignore: false
		}

		apiService.SendRequest('PATCH', srvData.service_ignore, param, function (rs) {

			console.log(rs)
			if (rs.result != 'OK') {
				bootbox.alert(srvData.translator['msg_err_no_unignore']);
				return false;
			}
			JH.SetJsonValue(data, srvData.beforeRenderName(), data["station_name"]);
			JH.SetJsonValue(data, srvData.beforeRenderDate(), data["data_datetime"]);
			JH.SetJsonValue(data, srvData.beforeRenderProvince(), data["station_province"]);
			JH.SetJsonValue(data, srvData.beforeRenderOldCode(), data["station_oldcode"]);
			JH.SetJsonValue(data, srvData.beforeRenderAgency(), data["agency_shortname"]);
			JH.SetJsonValue(data, JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".id"), data["station_id"]);
			JH.SetJsonValue(data, 'id', data["data_id"]);
			JH.SetJsonValue(data, 'station_type', data["data_category"]);
			row.remove();
			srvData.dataTable_ignore.row.add(data);
			srvData.dataTable_ignore.draw();
			srvData.dataTable_unignore.draw();
			srvData.toggleButtonRianfalDetail();
		});

		$('#unignoremodal').modal('hide');
	});
}

/**
* ignore railfall  detail
*
*/
srvData.ignoreRainfallDetail = function () {
	// self.ignoreTable = 'dlgIgnore-tbl-ignore'
	// ctrl_ignore = $('#' + self.ignoreTable)
	// self.dataTable_ignore = ctrl_ignore.DataTable({

	var click_by_table = $(this).attr("clicked");
	var data_row = $(this).data('row');
	if (click_by_table == 'ignore') {
		var row = srvData.dataTable_ignore.row(data_row); //row number
		var data = row.data(); // data row in table
		var v_station_id = JH.GetJsonValue(data.station, "id"); // station id
		var v_province_name = ' จังหวัด' + data.geocode.province_name.th;
		var v_tele_station_name = ' สถานี' + data.station.tele_station_name.th;
		var v_tele_station_oldcode = '(' + data.station.tele_station_oldcode + ')';
	} else if (click_by_table == 'unignore') {
		var row = srvData.dataTable_unignore.row(data_row); //row number
		var data = row.data(); // data row in table
		var v_station_id = data.station_id; // station id
		var v_province_name = ' จังหวัด' + data.station_province.th;
		var v_tele_station_name = ' สถานี' + data.station_name.th;
		var v_tele_station_oldcode = '(' + data.station_oldcode + ')';
	}

	var title_text = v_tele_station_oldcode + v_tele_station_name + v_province_name + ' - ปริมาณฝนย้อนหลัง 24 ชั่วโมง (มม.)';
	var start_date = moment().add(-1, 'days').format('YYYY-MM-DD');
	var end_date = moment().add(1, 'days').format('YYYY-MM-DD');

	var param = {
		station_id: v_station_id.toString(),
		start_date: start_date,
		end_date: end_date
	}

	apiService.SendRequest('GET', srvData.service_ignore_rainfall_detail, param, function (rs) {

		if (rs.result != 'OK') {
			bootbox.alert(srvData.translator['msg_err_no_unignore']);
			return false;
		}
		srvData.dataTable_ignoreRainfallDetailTable.clear();
		srvData.dataTable_ignoreRainfallDetailTable.rows.add(JH.GetJsonValue(rs.data, "data"));
		srvData.dataTable_ignoreRainfallDetailTable.draw();

		if ($(window).width() > 768) $('#dlgDisplay').find(".modal-dialog").css("width", "850");
		$('#dlgDisplay').find("#dlgDisplay-title").html(title_text);
		$('#dlgDisplay').modal('show');

	});
}

/**
* generate data rows on history ignore table
*
* @param {json} rs history ignore data
*
*/
srvData.previewDataTablesIgnoreRainfallDetail = function (rs) {
	srvData.changeColumnNameValue()
	srvData.dataTable_his.clear()
	if (JH.GetJsonValue(rs, "result") != "OK") { return false; }
	srvData.data_history = rs['data'];
	srvData.dataTable_his.rows.add(JH.GetJsonValue(rs, "data"));
	srvData.dataTable_his.draw()
}


/**
* put data into column date ignore
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnDateIgnore = function (row, type, set, meta) {
	return JH.GetJsonValue(row, 'ignore_datetime');
}


/**
* put data into column user
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnUser = function (row, type, set, meta) {
	return JH.GetJsonValue(row, 'user.FullName');
}


/**
* put data into column station code
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnStationCode = function (row, type, set, meta) {
	return JH.GetJsonValue(row, 'station_oldcode');
}


/**
* put data into column station name
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnStation = function (row, type, set, meta) {
	return JH.GetLangValue(row.station_name);
}


/**
* put data into column province
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnProvince = function (row, type, set, meta) {
	return JH.GetLangValue(row.station_province);
}


/**
* put data into column agency
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnAgency = function (row, type, set, meta) {
	return JH.GetLangValue(row.agency_shortname);
}


/**
* put data into column date of data
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnDateData = function (row, type, set, meta) {
	return JH.GetJsonValue(row, 'data_datetime');
}


/**
* put data into column value data
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnValueData = function (row, type, set, meta) {
	return JH.GetJsonValue(row, 'value');
}


/**
* put data into column remark
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderHisColumnRemark = function (row, type, set, meta) {
	return JH.GetJsonValue(row, 'remark');
}

/**
* get date data
*
* @param {json} row The data for the whole row
*
*/
srvData.beforeRenderDate = function () {
	return JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".date");
}


/**
* put data into column date
*
* @param {json} row The data for the whole row
*/
srvData.renderDate = function (row) {
	var field = srvData.beforeRenderDate();
	if (!field) { return ""; }
	return JH.GetJsonValue(row, field);
}



/**
* get old code station data
*
* @param {json} row The data for the whole row
*
*/
srvData.beforeRenderOldCode = function () {
	return JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".old_code");
}

/**
* put data into column old code station
*
* @param {json} row The data for the whole row
*/
srvData.renderOldCode = function (row) {
	var field = srvData.beforeRenderOldCode();
	if (!field) { return ""; }
	return JH.GetJsonValue(row, field);
}



/**
* get station name
*
* @param {json} row The data for the whole row
*
*/
srvData.beforeRenderName = function () {
	return JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".name");
}



/**
* put data into column station name
*
* @param {json} row The data for the whole row
*/
srvData.renderName = function (row) {
	var field = srvData.beforeRenderName();
	if (!field) { return ""; }
	return JH.GetJsonLangValue(row, field, true);
}


/**
* get province name
*
* @param {json} row The data for the whole row
*
*/
srvData.beforeRenderProvince = function () {
	return JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".province");
}



/**
* put data into column province
*
* @param {json} row The data for the whole row
*/
srvData.renderProvince = function (row) {
	var field = srvData.beforeRenderProvince(row);
	if (!field) { return ""; }
	return JH.GetJsonLangValue(row, field, true);
}



/**
* get agency name
*
* @param {json} row The data for the whole row
*
*/
srvData.beforeRenderAgency = function () {
	return JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".agency");
}



/**
* put data into column agency
*
* @param {json} row The data for the whole row
*/
srvData.renderAgency = function (row) {
	var field = srvData.beforeRenderAgency();
	if (!field) { return ""; }
	return JH.GetJsonLangValue(row, field, true);
}



/**
* put data into column value
*
* @param {json} row The data for the whole row
*/
srvData.renderValue = function (row) {
	var field = JH.GetJsonValue(srvData.dataOption, srvData.data_type + ".value"); //value data
	if (!field) { return ""; }
	return JH.GetJsonValue(row, field);
}



/**
* create button ignore on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderButtonIgnore = function (row, type, set, meta) {
	return '<i class="btn btn-ignore fa fa-bell-slash hidden-xs" style="color:red" data-row="' + meta.row + '" title="ซ่อนสถานี" data-toggle="modal" data-target="#ignoremodal"></i>'
}

/**
* create button ignore on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderButtonIgnoreMobile = function (row, type, set, meta) {
	// var station = JH.GetJsonValue(row, "station")
	// $('#ig_station').val(JH.GetJsonLangValue(station,"tele_station_name"));
	return '<i class="btn btn-ignore fa fa-bell-slash" style="color:red" data-row="' + meta.row + '" title="" data-toggle="modal" data-target="#ignoremodal"></i>'
}

/**
* create button ignore on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderButtonIgnoreRainfallDetail = function (row, type, set, meta) {
	return '<i class="btn btn-ignore-rainfall-detail fa fa-list" clicked="ignore" data-row="' + meta.row + '" title="คลิกดูข้อมูลฝน"></i>'
}

/**
* create button ignore on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderButtonUnignoreRainfallDetail = function (row, type, set, meta) {
	return '<i class="btn btn-unignore-rainfall-detail fa fa-list" clicked="unignore" data-row="' + meta.row + '" title="คลิกดูข้อมูลฝน"></i>'
}

/**
* put data into column station name
*
* @param {json} row The data for the whole row
*/
srvData.renderStationName = function (row) {
	return JH.GetJsonLangValue(row, "station_name", true);
}

/**
* put data into column agency short name
*
* @param {json} row The data for the whole row
*/
srvData.renderAgencyShortName = function (row) {
	return JH.GetJsonLangValue(row, "agency_shortname", true);
}

/**
* put data into column ignore list value
*
* @param {json} row The data for the whole row
*/
srvData.renderIgnoreValue = function (row) {
	return JH.GetJsonLangValue(row, "value", true);
}


/**
* create button unignore on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderButtonUnIgnore = function (row, type, set, meta) {
	return '<i class="btn btn-unignore fa fa-bell hidden-xs" data-row="' + meta.row + '" title="เปิดใช้งานสถานี" style="color: green" data-toggle="modal" data-target="#unignoremodal"></i>'
}


/**
* create button unignore on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
srvData.renderButtonUnIgnoreMobile = function (row, type, set, meta) {
	return '<i class="btn btn-unignore fa fa-bell visible-xs" data-row="' + meta.row + '" title="" style="color: green" data-toggle="modal" data-target="#unignoremodal"></i>'
}


/*
* Set column name of value according datatype or table.
*
*/
srvData.changeColumnNameValue = function () {
	var btn_ird = $('btn-ignore-rainfall-detail');
	var datatype = $('#filter_datattype').val(); //table name
	var column_tbl_dlg = $('#dlgIgnore-tbl-ignore thead tr th').eq(4); //Index column name of value in ignore table
	var column_tbl_his = $('#tbl-history-ignore thead tr th').eq(8); //Index column name of value in history ignore table
	var column_tbl_dlg_un = $('#dlgIgnore-tbl-unignore thead tr th').eq(3); //Index column name of value in ignore table

	btn_ird.css("display", "none"); // hide btn rainfall detial

	if (datatype == 'dam_daily' || datatype == 'dam_hourly') {
		column_tbl_dlg.text(srvData.translator['col_dam_storage']);
		column_tbl_his.text(srvData.translator['col_dam_storage']);
		column_tbl_dlg_un.text(srvData.translator['col_dam_storage']);
	} else if (datatype == 'rainfall_24h') {
		column_tbl_dlg.text(srvData.translator['col_rainfall_24h']);
		column_tbl_his.text(srvData.translator['col_rainfall_24h']);
		column_tbl_dlg_un.text(srvData.translator['col_rainfall_24h']);
		btn_ird.css("display", "block"); // hide btn rainfall detial
	} else if (datatype == 'tele_waterlevel') {
		column_tbl_dlg.text(srvData.translator['col_waterlevel_msl']);
		column_tbl_his.text(srvData.translator['col_waterlevel_msl']);
		column_tbl_dlg_un.text(srvData.translator['col_waterlevel_msl']);
	} else if (datatype == 'waterquality') {
		column_tbl_dlg.text(srvData.translator['col_salinity']);
		column_tbl_his.text(srvData.translator['col_salinity']);
		column_tbl_dlg_un.text(srvData.translator['col_salinity']);
	} else {
		column_tbl_dlg.text(srvData.translator['col_value']);
		column_tbl_his.text(srvData.translator['col_value']);
		column_tbl_dlg_un.text(srvData.translator['col_value']);
	}

}

/*
* Set button rainfall ignore detail
*
*/
srvData.toggleButtonRianfalDetail = function () {
	var btn_ird = $('.btn-ignore-rainfall-detail');
	var datatype = $('#filter_datattype').val(); //table name

	btn_ird.css("display", "none"); // hide btn rainfall detial

	if (datatype == 'rainfall_24h') {
		btn_ird.css("display", "inline"); // hide btn rainfall detial
	}

}

/**
* Generate option for description dropdown list.
*
* @param {json} data The data of description.
*/

srvData.genMultiSelect = function (data) {
	var filter_ig_description = document.getElementById('filter_ig_purpose'); //element filter event type
	var i; //loop condition


	//sort option.
	var description = apiService.getFieldValue(data, 'ignore_description.data')
	if (description == null) {
		return
	}

	for (i = 0; i < description.length; i++) {
		var gen_option = document.createElement('option');
		var val_option = description[i].description

		//gen_option.text = txt_option;
		gen_option.text = val_option;
		filter_ig_description.add(gen_option);
	}

	$(filter_ig_description).multiselect({ includeSelectAllOption: true });
	$(filter_ig_description).multiselect('rebuild');
	$(filter_ig_description).multiselect('selectAll', true);
	$(filter_ig_description).multiselect('updateButtonText');
}
