/**
*
*   mas Object for handler monitor api service page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var mas = {};

/**
*   Initial mas
*   @param {object} translator - translate object from laravel
*/
mas.init = function(translator){
	mas.service = "thaiwater30/backoffice/api/monitor_api_service";
	mas.translator = translator;
	mas.users = [];
	// #tbl to DataTable
	mas.dataTable = $('#tbl').DataTable({
		dom : 'frlBtip',
		buttons : [ {
			extend : 'excelHtml5',
			text : ' <i class="fa fa-file-excel-o color-green" aria-hidden="true"></i> excel',
		} ],
		language : g_dataTablesTranslator,
		columns: [
			{ data: mas.renderColumnOrder },
			{ data: mas.renderColumnUser },
			{ data: mas.renderColumnUserAgency },
			{ data: mas.renderColumnMetadataName },
			{ data: mas.renderColumnAgency },
			{ data: mas.renderColumnCountReq, type: 'num' ,render: { sort: mas.renderColumnCountLog} },
			{ data: mas.renderColumnAccessTime, type: 'num' ,render: { sort: mas.renderColumnCountLog} },
			{ data: mas.renderColumnServicemethod },
			{ data: mas.renderColumnDuration },
			// { data: mas.renderColumnProvinceBasin },
			{ data: mas.renderColumnEid },
			{ data: mas.renderColumnStatus },
			{ data: mas.renderColumnButton,
				orderable : false,
				searchable : false,
			}
		],
		order: [ 0, 'desc']
	});

	// #tbl-log to DataTable
	mas.dataTableLog = $('#tbl-log').DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns: [
			{
				defaultContent : '',
				orderable : false,
				searchable : false,
			},
			{ data: 'access_time' },
			{ data: 'client_ip' },
			{ data: mas.renderAccessDuration },
			{ data: mas.renderReply },
		],
		order: [ [ 1 , 'desc' ]]
	});
	// Generate order number
	mas.dataTableLog.on('order.dt search.dt', function() {
		mas.dataTableLog.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	// init event on tbl
	$('#tbl').on('click', 'i.btn.fa-refresh', mas.btnRefreshClick)
	.on('click', 'i.btn.fa-list-alt', mas.btnLogClick)
	.on('click', 'i.btn.fa-window-close', mas.btnDisableClick)
	.on('click', 'i.btn.fa-check-square', mas.btnEnableClick);
	// init event btn-display
	$('#btn-display').on('click', mas.btnDisplayClick);
	$('#filter-datestart, #filter-dateend').datepicker('setDate', moment().format('YYYY-MM-DD'));
	// call service
	apiService.SendRequest("GET", this.service+"_onload", {}, mas.handlerService);
}

/**
*   handler service onload
*	render table, agency, user
*	@param {object} rs - result from service
*/
mas.handlerService = function(rs){
	mas.renderTable(JH.GetJsonValue(rs, "order_detail"));
	mas.renderAgency(JH.GetJsonValue(rs, "agency"));
	mas.renderUser();
}

/**
*   render filter agency
*	@param {object} rs - result from service
*/
mas.renderAgency = function(rs){
	if (JH.GetJsonValue(rs, "result") != "OK") { return false; }
	var data = apiService.getFieldValue(rs, "data");
	if(data == null){return }
	JH.Sort(data, "agency_name", false, function(str){
		return JH.GetLangValue(str).toLowerCase();
	});
	var select = document.getElementById('filter-agency');
	for (var i = 0; i < data.length; i++){
		var d = data[i];
		select.add(new Option(JH.GetJsonLangValue(d, "agency_name", true), JH.GetJsonValue(d, "id")));
	}
	$(select).select2();
}

/**
*   render filter agency
*
*/
mas.renderUser = function(){
	if (typeof mas.users == "undefined"){ return false; }
	var data = JH.UniqueArray(mas.users, "id");

	JH.Sort(data,"name",false , function(str){
			return str.toLowerCase();
	})
	delete mas.users;

	var select = document.getElementById('filter-user');
	if(typeof data === undefined || data == null){return }
	for (var i = 0; i < data.length; i++){
		var d = data[i];
		select.add(new Option(JH.GetJsonValue(d, "name"), JH.GetJsonValue(d, "id")));
	}
	$(select).select2();
}

/**
*   render table
*	@param {object} rs - result from service
*/
mas.renderTable = function(rs){
	mas.dataTable.clear();
	if ( JH.GetJsonValue(rs, "result") == "OK" ){
		var data = JH.GetJsonValue(rs, "data");
		if ( data ) {
			JH.Sort(data, "id", true);
			mas.dataTable.rows.add(data);
		}
	}
	mas.dataTable.draw();
}

/**
*   render order detail id
*   @param {object} row - The data for the whole row
*   @return {string} order detail id
*/
mas.renderColumnOrder = function(row){
	var order_code = JH.GetJsonValue(row, "id") ;
	return order_code;
}

/**
*   render user fullname
*	สร้างและเก็บ user object ไว้ใน mas.users เพื่อนำไปสร้าง filter user
*   @param {object} row - The data for the whole row
*   @return {string} user fullname
*/
mas.renderColumnUser = function(row){
	var user = {
		id: JH.GetJsonValue(row, "user_id"),
		name: JH.GetJsonValue(row, "user_fullname")
	};
	if (typeof mas.users != "undefined"){
		mas.users.push(user);
	}
	return user.name;
}

/**
*   render user agency fullname
*   @param {object} row - The data for the whole row
*   @return {string} user agency fullname
*/
mas.renderColumnUserAgency = function(row){
	return JH.GetJsonLangValue(row, 'user_agency_name');
}

/**
*   render metadada service name
*   @param {object} row - The data for the whole row
*   @return {string} metadada service name
*/
mas.renderColumnMetadataName = function(row){
	return JH.GetJsonLangValue(row, "metadata.metadataservice_name", true);
}

/**
*   render agency name
*   @param {object} row - The data for the whole row
*   @return {string} agency name
*/
mas.renderColumnAgency = function(row){
	return JH.GetJsonLangValue(row, "agency.agency_name", true);
}

/**
*   render request count , latest access time
*   @param {object} row - The data for the whole row
*   @return {string} request count , latest access time
*/
// mas.renderColumnCountReq = function(row){
// 	var text = JH.GetJsonValue_Int(row, "count_log");
// 	console.log(text)
// 	var latest_access_time = JH.GetJsonValue(row, "latest_access_time");
// 	if (latest_access_time){
// 		text += "<br/>" + latest_access_time;
// 	}
// 	return text;
// }

mas.renderColumnCountReq = function(row){
	var text = JH.GetJsonValue_Int(row, "count_log");
	var latest_access_time = JH.GetJsonValue(row, "latest_access_time");
	if (latest_access_time){
		text = text;
	}
	return text;
}


/**
*   render request count , latest access time
*   @param {object} row - The data for the whole row
*   @return {string} request count , latest access time
*/
mas.renderColumnAccessTime = function(row){
	var latest_access_time = JH.GetJsonValue(row, "latest_access_time");
	if (latest_access_time){
		text = latest_access_time;
	}
	return text;
}

/**
*   render service method name
*   @param {object} row - The data for the whole row
*   @return {string} service method name
*/
mas.renderColumnServicemethod = function(row){
	return JH.GetJsonLangValue(row, "service.servicemethod_name", true);
}

/**
*   render service method name
*   @param {object} row - The data for the whole row
*   @return {string} service method name
*/
mas.renderColumnDuration = function(row){
	var from_date = JH.GetJsonValue(row, "detail_fromdate");
	var to_date = JH.GetJsonValue(row, "detail_todate");
	if ( from_date == "" || to_date == "" ) { return "" ;}
	return from_date + "\r\n" + TRANS["to_date"] + "\r\n" + to_date;
}

/**
*   render province, basin name
*   @param {object} row - The data for the whole row
*   @return {string} province, basin name
*/
mas.renderColumnProvinceBasin = function(row){
	var text = "";
	var province = JH.GetJsonValue(row, "province");
	if (province != ""){ text += "<u>" + TRANS["province"] + "</u> : " ;}
	for (var i = 0 ; i < province.length ; i++){
		if ( i != 0 ) { text += ", "};
		text += JH.GetJsonLangValue(province[i], "province_name", true);

	}
	var basin = JH.GetJsonValue(row, "basin");
	if (basin != ""){
		if (text != ""){ text += "\r\n"; }
		text += "<u>" + TRANS["basin"] + "</u> : " ;
	}
	if(typeof basin === undefined || basin == null){return }
	for (var i = 0 ; i < basin.length ; i++){
		if ( i != 0 ) { text += ", "};
		text += JH.GetJsonLangValue(basin[i], "province_name");

	}
	return text;
}

/**
*   render e id
*   @param {object} row - The data for the whole row
*   @return {string} e id
*/
mas.renderColumnEid = function(row){
	return JH.GetJsonValue(row, "e_id");
}

/**
*   render status
*   @param {object} row - The data for the whole row
*   @return {string} status
*/
mas.renderColumnStatus = function(row){
	return TRANS["status_" + JH.GetJsonValue(row, "is_enabled")];
}

/**
*   render button
*   @param {object} row - The data for the whole row
*   @return {string} button
*/
mas.renderColumnButton = function(row){
	var btn_enable = '<i class="fa fa-check-square btn color-green" title="'+ TRANS["enable"] +'"></i>'
	, btn_disable = ''
	, btn_view = ''
	, btn_log = '<i class="fa fa-list-alt btn" title="'+ TRANS["view_log"] +'"></i>'
	, btn_refresh = '';
	if ( JH.GetJsonValue(row, "is_enabled") ){
		btn_view = '<a class="fa fa-eye btn" href=\"'+ JH.GetJsonValue(row, "service_url") +'\"' +
		'title="'+ TRANS["view"] +'" target="_blank"></a>';
		btn_disable = '<i class="btn fa fa-window-close color-red" title="'+ TRANS["disable"] +'"></i>';
		btn_enable = '';
		btn_refresh = '<i class="fa fa-refresh btn" title="'+ TRANS["regen"] +'"></i>';
	}

	return btn_view + btn_log + btn_refresh + btn_enable + btn_disable;
}

/**
*   render count log
*   @param {object} row - The data for the whole row
*   @return {int} count_log
*/
mas.renderColumnCountLog = function(data, type, full, meta){
	return JH.GetJsonValue_Int(full, "count_log");
}

// render tbl-log each column
/**
*   render access duration
*   @param {object} row - The data for the whole row
*   @return {string} access duration
*/
mas.renderAccessDuration = function(row){
	var time = JH.GetJsonValue(row, 'access_duration');
	time /=(1000000000);
	return time.toFixed(2);
}

/**
*   render reply code, reply reason
*   @param {object} row - The data for the whole row
*   @return {string} reply code, reply reason
*/
mas.renderReply = function(row){
	return "("+JH.GetJsonValue(row, 'reply_code')+") " + JH.GetJsonValue(row, 'reply_reason');
}

/**
*   event btn refresh on click
*	confirm regenerate key
*/
mas.btnRefreshClick = function(){
	var row = mas.dataTable.row( $(this).closest('tr') );
	bootbox.confirm({
		message: TRANS["regen"] + " ?",
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' +  mas.translator['btn_confirm'],
				className: 'btn-primary'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  mas.translator['btn_cancel'],
				className: 'btn-default'
			}
		},
		callback: function(result){
			if ( result ){ mas.regenerateKey(row); }
		}
	});
}

/**
*   send patch to service
*   @param {object} row - The data for the whole row
*/
mas.regenerateKey = function(row){
	var data = row.data();
	var param = { id: JH.GetJsonValue(data, "id"), field: "e_id" };
	apiService.SendRequest("PATCH", mas.service, param, function(rs){
		if( JH.GetJsonValue(rs, "result") != "OK"){ return false; }
		var d = JH.GetJsonValue(rs, "data");
		data["service_url"] = data["service_url"].replace(data["e_id"], d);
		data["e_id"] = d;
		row.data(data);
	});
}

/**
*   event btn log on click
*/
mas.btnLogClick = function(){
	var cp = mas.currentParam;
	var data = mas.dataTable.row( $(this).closest('tr') ).data();
	var param = { 
		id: JH.GetJsonValue(data, "id"),  
	};
	if ( cp ){
		param.datestart = cp.datestart;
		param.dateend= cp.dateend;
	}
	apiService.SendRequest("GET", mas.service, param, function(rs){
		if( JH.GetJsonValue(rs, "result") != "OK"){ return false; }
		mas.displayTableLog(JH.GetJsonValue(rs, "data"));
	});
}

/**
*   display table request log
*   @param {object} dara - result from service
*/
mas.displayTableLog = function(data){
	mas.dataTableLog.clear();
	mas.dataTableLog.rows.add(data);
	mas.dataTableLog.draw();
	$('#modal-log').modal();
}

/**
*   event btn display on click
*	load and render data
*/
mas.btnDisplayClick = function(){
	var param = {
		datestart: $('#filter-datestart').val(),
		dateend: $('#filter-dateend').val(),
		user_id: parseInt( $('#filter-user').val() ),
		agency_id: parseInt( $('#filter-agency').val() ),
		user_agency_id: parseInt( $('#filter-user_agency').val() ),
	};
	mas.currentParam = param;
	apiService.SendRequest("GET", mas.service, param, mas.renderTable);
}

/**
*   event btn disable on click
*	confirm disable
*/
mas.btnDisableClick = function(){
	var row = mas.dataTable.row( $(this).closest('tr') );
	bootbox.confirm({
		message: TRANS["disable"] + " ?",
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' +  mas.translator['btn_confirm'],
				className: 'btn-primary'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  mas.translator['btn_cancel'],
				className: 'btn-default'
			}
		},
		callback: function(result){
			if ( result ){ mas.disableApiService(row); }
		}
	});
}

/**
*	disable api service
*   send patch to service
*   @param {object} row - The data for the whole row
*/
mas.disableApiService = function(row){
	var data = row.data();
	var param = { id: JH.GetJsonValue(data, "id") };
	apiService.SendRequest("DELETE", mas.service, param, function(rs){
		if( JH.GetJsonValue(rs, "result") != "OK"){ return false; }
		data["is_enabled"] = false;
		row.data(data);
	});
}

/**
*   event btn enable on click
*	confirm enable
*/
mas.btnEnableClick = function(){
	var row = mas.dataTable.row( $(this).closest('tr') );
	bootbox.confirm({
		message: TRANS["enable"] + " ?",
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' +  mas.translator['btn_confirm'],
				className: 'btn-primary'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  mas.translator['btn_cancel'],
				className: 'btn-default'
			}
		},
		callback: function(result){
			if ( result ){ mas.enableApiService(row); }
		}
	});
}

/**
*	enable api service
*   send patch to service
*   @param {object} row - The data for the whole row
*/
mas.enableApiService = function(row){
	var data = row.data();
	var param = { id: JH.GetJsonValue(data, "id"), field: "is_enabled" };
	apiService.SendRequest("PATCH", mas.service, param, function(rs){
		if( JH.GetJsonValue(rs, "result") != "OK"){ return false; }
		data["is_enabled"] = true;
		row.data(data);
	});
}
