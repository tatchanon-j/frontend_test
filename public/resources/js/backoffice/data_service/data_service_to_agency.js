/**
*
*   srvDSTA Object for handler data service to agency page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvDSTA = {};

/**
*   Initial srvDSTA
*   @param {object} translator - translate object from laravel
*/
srvDSTA.init = function(translator){

	srvDSTA.translator = translator;
	srvDSTA.service = "thaiwater30/backoffice/data_service/to_agency";
	srvDSTA.agency = {};
	srvDSTA.order = {}; // cache order from service
	srvDSTA.orderComplete = {}; // cache order ตาม order header id

	// Data table
	srvDSTA.table = $('#table').DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns: [{
			data: 'id'
		},{
			data: 'order_datetime'
		},{
			data: srvDSTA.renderPrintBtn
		},{
			data: srvDSTA.renderInfoBtn
		}],
		order: [0 , 'desc']
	});
	srvDSTA.tableInfo = $('#table-info').DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns: [{
			data: srvDSTA.renderAgencyName
		},{
			data: srvDSTA.renderDataserviceName
		},{
			data: srvDSTA.renderDateRange
		},{
			data: srvDSTA.renderProvinceName
		},{
			data: srvDSTA.renderStatus
		}]
	});
	//	load data
	apiService.SendRequest('GET' , srvDSTA.service , {} , srvDSTA.handlerTable);
	//	set default date
	$('#form-date').datepicker('setDate', moment().format('YYYY-MM-DD'));
	//	event
	$('#table').on('click' , 'i.fa-info-circle' , srvDSTA.infoClick)
	.on('click' , 'i.fa-print' , srvDSTA.printClick);

	$('#modal-print').on('hidden.bs.modal' , function(){
		$('#btn-print').off('click');
	});
	$('#btn_display').on('click' , srvDSTA.btnDisplayClick);
}

/**
*   handler service
*   @param {object} rs - result from service
*/
srvDSTA.handlerTable = function(rs){
	console.log(rs);
	if (rs.result && rs.result == "OK"){
		srvDSTA.table.clear();

		if ( rs.data != null ){
			srvDSTA.table.rows.add(rs.data);
		}
		srvDSTA.table.draw();
	}
}

/**
*   render button print
*   @param {object} row - The data for the whole row
*   @return {string} button print
*/
srvDSTA.renderPrintBtn = function(row){
	return '<i class="btn fa fa-print" aria-hidden="true" data-item="'+row.id+'"></i>';
}

/**
*   render button info
*   @param {object} row - The data for the whole row
*   @return {string} button info
*/
srvDSTA.renderInfoBtn = function(row){
	return '<i class="btn fa fa-info-circle" aria-hidden="true" data-item="'+row.id+'"></i>';
}

/**
*   Event on button info click
*	show modal info
*/
srvDSTA.infoClick = function(){
	srvDSTA.showModal($(this).attr('data-item') , 'info');
}

/**
*   Event on button print click
*	show modal info
*/
srvDSTA.printClick = function(){
	srvDSTA.showModal($(this).attr('data-item') , 'print');
}

/**
*   Event on button display click
*	load data and render
*/
srvDSTA.btnDisplayClick =  function(){
	var param = { date: $('#form-date').val() };
	apiService.SendRequest('GET' , srvDSTA.service , param , srvDSTA.handlerTable);
}

/**
*   show modal
*	@param {string} id - order header id
*	@param {string} action - model you need to show "info", "print"
*/
srvDSTA.showModal = function( id , action ){
	if ( JH.GetJsonValue(srvDSTA.order, id) ){
		switch (action) {
			case "info":
			srvDSTA.showModalInfo(id);
			break;
			case "print":
			srvDSTA.showModalPrint(id);
			break;
		}
		return false;
	}
	apiService.SendRequest("GET" , srvDSTA.service , {order_header_id: id} , function(rs){
		if (rs.result && rs.result == "OK"){
			srvDSTA.order[id] = rs.data;
			srvDSTA.showModal( id , action);
		}
	});
}

/**
*   show modal info
*	@param {string} id - order header id
*/
srvDSTA.showModalInfo = function(id){
	$('#modal-info').modal();
	srvDSTA.groupOrder(id);
	srvDSTA.tableInfo.clear();

	var oc = srvDSTA.orderComplete[id];

	for(var k in oc) {
		var ock = oc[k];
		for (var i = 0 ; i < ock.length; i++){
			srvDSTA.tableInfo.row.add(ock[i]);
		}
	}

	srvDSTA.tableInfo.draw();

}

/**
*   show modal print
*	@param {string} id - order header id
*/
srvDSTA.showModalPrint = function(id){
	srvDSTA.groupOrder(id);

	var oc = srvDSTA.orderComplete[id];
	var str = "";
	for(var k in oc) {
		var ock = oc[k][0];
		var letterdate = ock["detail_letterdate"] ? moment(ock["detail_letterdate"]).format("YYYY-MM-DD") : "";
		var letterno = JH.GetJsonValue(ock, "detail_letterno");
		str += srvDSTA.renderPrintForm(k, letterdate, letterno);
	}
	$('#form-print').attr('data-id' , id).html(str);
	$('#modal-print').modal();
	$('#btn-print').on('click' , srvDSTA.btnPrintClick);
}

/**
*   group order by agency id
*	@param {string} id - order header id
*/
srvDSTA.groupOrder = function(id){
	var lang = JH.GetLang();
	if ( !srvDSTA.orderComplete[id] ){
		var agency = srvDSTA.agency;
		var oc = srvDSTA.orderComplete[id] = {};
		var orders = srvDSTA.order[id];
		for( var i = 0 ; i < orders.length; i++){
			var order = orders[i];
			if ( oc[ order["agency"]["id"] ] ){
				oc[ order["agency"]["id"] ].push( order );
			}else{
				oc[ order["agency"]["id"] ] = [ order ];
			}
			if ( !agency[ order["agency"]["id"] ] ){ agency[ order["agency"]["id"] ] = JH.GetJsonLangValue(order["agency"], "agency_name") ; }
		}
	}
}
// #table-info
/**
*   render agency name
*   @param {object} row - The data for the whole row
*   @return {string} agency name
*/
srvDSTA.renderAgencyName = function(row){
	return JH.GetJsonLangValue(row.agency , 'agency_name');
}

/**
*   render service name
*   @param {object} row - The data for the whole row
*   @return {string} service name
*/
srvDSTA.renderDataserviceName = function(row){
	return JH.GetJsonLangValue(row.metadata , 'metadataservice_name');
}

/**
*   render date range
*   @param {object} row - The data for the whole row
*   @return {string} date range
*/
srvDSTA.renderDateRange = function(row){
	var from_date = JH.GetJsonValue(row , "detail_fromdate");
	var to_date = JH.GetJsonValue(row , "detail_todate");
	if (from_date == "" || to_date == ""){ return ""; }
	return srvDSTA.translator["from_date"] + " " +from_date + "<br/>" + srvDSTA.translator["to_date"] + " " +to_date;
}

/**
*   render province name
*   @param {object} row - The data for the whole row
*   @return {string} province name
*/
srvDSTA.renderProvinceName = function(row){
	if ( !row["province"] ) { return "" ;}
	var str = ""
	for (var i = 0 ; i < row["province"].length ; i++){
		var p = row["province"][i];
		str += JH.GetJsonLangValue(p , "province_name");
		if (i != row["province"].length - 1 ){
			str += ",";
		}
	}
	return str;
}

/**
*   render order status
*   @param {object} row - The data for the whole row
*   @return {string} order status
*/
srvDSTA.renderStatus = function(row){
	return JH.GetJsonValue(row["order_detail_status"] , 'detail_status');
}

/**
*   render print form
*   @param {string} agency_id - agency id
*   @param {string} letterdate - วันที่เอกสารคำขอข้อมูล
*   @param {string} letterno - เลขที่เอกสารคำขอข้อมูล
*   @return {string} print form
*/
srvDSTA.renderPrintForm = function(agency_id, letterdate, letterno){
	var agency_name = srvDSTA.agency[agency_id];
	var trans = srvDSTA.translator;
	var str = ''+
	'<div class="form-group">' +
	'<label class="control-label col-sm-4">'+ trans["agency"] + ' : </label>' +
	'<div class="col-sm-4">' +
	'<label class="control-label" style="text-align: left;">'+ agency_name +'</label>' +
	'</div>' +
	'</div>' +
	'<div class="form-group">' +
	'<label class="control-label col-sm-4">'+ trans["order_print_date"] + ' : </label>' +
	'<div class="col-sm-4">' +
	'<input name="date[]" class="form-control" type="text" '+
	'data-provide="datepicker" data-date-format="yyyy-mm-dd" data-parsley data-parsley-required data-parsley-required-message="'+ trans["required_order_print_date"] +'" value="'+letterdate+'">' +
	'</div>' +
	'</div>' +
	'<div class="form-group">' +
	'<label class="control-label col-sm-4">'+ trans["order_print_letterno"] + ' : </label> '+
	'<div class="col-sm-4">' +
	'<input name="letterno[]" class="form-control" type="text" data-parsley data-parsley-required data-parsley-required-message="'+ trans["required_order_print_letterno"] +'" value="'+letterno+'">' +
	'</div>' +
	'</div>' +
	'<div class="form-group"><input type="hidden" name="agency[]" value="'+agency_id+'" /></div>';
	return str;
}

/**
*   Event btn print click
*   send PUT to update letterDate, letterNo
*/
srvDSTA.btnPrintClick = function(){
	var valid = true;
	$('#form-print').find('*[data-parsley]').each(function(){
		$(this).parsley().validate();
		if (! $(this).parsley().isValid() ){
			valid = false;
		}
	});
	if (!valid){
		return false;
	}

	var date = [];
	var letterno = [];
	var agency = [];

	$('#form-print  input[name="date[]"]').each(function(){
		date.push($(this).val());
	});
	$('#form-print  input[name="letterno[]"]').each(function(){
		letterno.push($(this).val());
	});
	$('#form-print  input[name="agency[]"]').each(function(){
		agency.push( parseInt( $(this).val() ) );
	});

	var param = {
		order_header_id: parseInt( $('#form-print').attr('data-id') ),
		date: date,
		letterno: letterno,
		agency: agency,
	};
	apiService.SendRequest("PUT" , srvDSTA.service , param , function(rs){
		if (rs.result == "OK"){
			$('#modal-print').modal('hide');
			window.open(_URL_ + "/" + param["order_header_id"] , '_blank');
			srvDSTA.cacheLetter(param);
		}
	});
}

/**
*   update orderComplete
*	@param {object} param - param ที่อัพเดท
*/
srvDSTA.cacheLetter = function(param){
	var oc = srvDSTA.orderComplete[param.order_header_id];
	var agency = param.agency
	, letterno = param.letterno
	, date = param.date;
	var dLen = agency.length;
	for (var i = 0 ; i < dLen ; i++){
		var curAgency = agency[i];
		var occA = oc[curAgency];
		var occALen = occA.length;
		for (var j = 0 ; j < occALen ; j++){
			occA[j]["detail_letterno"] = letterno[i];
			occA[j]["detail_letterdate"] = date[i];
		}
	}
}
