/**
*
*   Main JS application file for check latest data page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data
var datetime; //date time
var date_range; // date range
var param = {}; // paremeter
var param_view = {}; //parameteer for view data


/**
* prepare data
*
* @param {json} translator Text for use on page
* @param {json} initVar initial filter data
*
*/
srvData.init = function(translator,initVar) {
	var self = srvData; //initial data
	var param = {}; //parameter
	self.initVar = initVar; //initial filter data
	self.translator = translator; //Text for label and message on javascript
	self.service_lastest_data_load = '/thaiwater30/backoffice/data_management/lastest_data_load'; //service lastest data load
	self.service_lastest_data = '/thaiwater30/backoffice/data_management/lastest_data'; //service lastest data
	self.service_station = 'thaiwater30/shared/station'; //service station

	apiService.SendRequest('GET', self.service_lastest_data_load ,{}, self.genFilter_datatype);

	self.tableId = 'tbl-check-latedata'; //table id
	ctrl = $('#' + self.tableId)
	srvData.DataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-trash" aria-hidden="true"></i> ' + srvData.translator['btn_delete'],
			action : srvData.btn_deleteData,
			className: 'btn-danger'
		} ],
		language : g_dataTablesTranslator,
	})

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

	$(".js-example-basic-single").select2();

	$('#group_enddate,#group_startdate,#div_preview').hide();
	$('#btn_preview').on('click',self.btnClickPreview)
	filter_datatype = $('#filter_data_type')
	filter_datatype.on('change' , srvData.changeFilterDatatype)

	$('#filter_startdate,#filter_enddate').datepicker({
		// disabledDates: true,
		format: 'yyyy-mm-dd'
	});

	self.genFilterDate()
	$('#filter_list').on('change',self.genFilterDate)

	var currentdate = new Date(); //current date
	datetime = 	currentdate.getFullYear() + "-"
	+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
	+ ("0" + currentdate.getDate()).slice(-2)

	$("#filter_startdate").attr('disabled', true);
	$("#filter_enddate").attr('disabled', true);
}


/**
* Display or hide filter date
*
*/
srvData.genFilterDate = function(){
	var self = srvData; //initial data
	var data_list = $('#filter_list').val(); //data list

	if(data_list == '7' || data_list == '3'){
		var self = srvData;
		$('#filter_enddate').datepicker('setDate',datetime)
		self.set_startDate(data_list)

		$('#group_enddate,#group_startdate').hide();
		$("#filter_startdate").attr('disabled', true);
		$("#filter_enddate").attr('disabled', true);

	}else if(!data_list){
		$('#group_enddate,#group_startdate').hide();
		$("#filter_startdate,#filter_enddate").val('');
		$("#filter_startdate").attr('disabled', true);
		$("#filter_enddate").attr('disabled', true);
	}else {
		$('#group_enddate,#group_startdate').show();
		$("#filter_startdate").attr('disabled', false);
		$("#filter_enddate").attr('disabled', false);
		$('#filter_startdate,#filter_enddate').datepicker('setDate',datetime)
	}
}


/**
* Seting default start date on filter start date
*
* @param {string} amt_date date
*
*/
srvData.set_startDate = function(amt_date){
	amt_date = parseInt(amt_date)
	$('#filter_startdate,#filter_enddate').datepicker({
		format: 'yyyy-mm-dd'
	});


	var currentdate = new Date(); //current date
	//Set next date from start date.
	currentdate.setDate(currentdate.getDate() - amt_date);

	newDatetime = 	currentdate.getFullYear() + "-"
	+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
	+ ("0" + currentdate.getDate()).slice(-2)

	$("#filter_startdate").datepicker('setDate',newDatetime);
}


/**
* Create option on filter data type
*
* @param {json} datatype datatype data
*
*/
srvData.genFilter_datatype = function(datatype){
	$('#date_range').val(datatype['data']['date_range']);

	var date_range = datatype['data']['date_range']; //date range
	var filter_datatype  = document.getElementById('filter_data_type'); //element datatype filter
	var data_table = apiService.getFieldValue(datatype,'data.data_type'); //table data

	if(data_table == null){return }

	/* sort option list by alphabet */
	JH.Sort(data_table,"name",false , function(str){
		return str.toLowerCase();
	})

	for(var i=0; i<data_table.length; i++){
		var gen_option = document.createElement('option'); //create option element
		var text_option = data_table[i]['name']; //option name
		var value_option = data_table[i]['data_type']; //option value

		gen_option.text = text_option;
		gen_option.value = value_option;
		filter_datatype.add(gen_option);
	}
	if (srvData.initVar["data_type"]){
		$(filter_datatype).val(srvData.initVar["data_type"]).trigger('change');
		srvData.initVar["data_type"] = false;
	}
}


/**
* When selected in filter Category
*
*/
srvData.changeFilterDatatype = function(){
	var stnParam = {}; //parameter station
	var data_type = $(this).val(); //datatype
	var self = srvData; //initial data

	$('#filter_depart_code > option').not('.op_default').remove();

	if(data_type !== 'default'){
		stnParam['data_type'] = data_type;
		$('#filter_depart_code').removeAttr('disabled');
		apiService.SendRequest('GET',self.service_station,stnParam,srvData.genFilterStation)
	}else {
		$('#filter_depart_code option').not('.op_default').remove();
		var filter_depart_code  = document.getElementById('filter_depart_code'); //element department code
		var gen_option = document.createElement('option'); //create option element

		$('#filter_depart_code').attr('disabled','true');

		gen_option.text = text_option;
		gen_option.value = value_option;
		filter_depart_code.add(gen_option);
	}
}


/**
* Create option on filter station
*
* @param {json} station station data
*
*/
srvData.genFilterStation = function(station){
	var filter_depart_code = document.getElementById('filter_depart_code'); //element department code filter
	var data_station = apiService.getFieldValue(station,'data'); //station data

	if(data_station == null){return }

	/* sort option list by alphabet */
	JH.Sort(data_station,"station_name",false , function(str){
		return JH.GetLangValue(str).toLowerCase();
		if(str['th']){
			return str['th'].toLowerCase();
		}else if(str['en']){
			return str['en'].toLowerCase();
		}else if(str['jp']){
			return str['jp'].toLowerCase();
		}else{
		}
	})

	for(var i=0; i<data_station.length; i++){
		var name = data_station[i]; //station data
		var text_name = JH.GetJsonLangValue(name, 'station_name',true); //station name
		var text_shortname = JH.GetJsonLangValue(name, 'agency_shortname',true); //station short name
		var text_oldcode = JH.GetJsonLangValue(name, 'station_oldcode',true); //station oldcode

		if(!text_name && !text_shortname && !text_oldcode){
			var text_option = srvData.translator['noname']; //no name
		}else{
			if(!text_name){
				var text_name = srvData.translator['noname']; //no name
			}

			if(!text_shortname){
				var text_shortname = srvData.translator['no_agency']; //short name
			}

			if(!text_oldcode){
				var text_oldcode = srvData.translator['noname']; //oldcode
			}

			var text_option = text_name + ' - '+ text_shortname + ' - ' + text_oldcode; //opiton name
			text_option = text_option.replace('*','')
			var gen_option = document.createElement('option'); //create option element
			var value_option = data_station[i]['id']; //option vlaue

			gen_option.text = text_option;
			gen_option.value = value_option;
			filter_depart_code.add(gen_option);
		}
	}
	if(srvData.initVar["station_id"]){
		$(filter_depart_code).val(srvData.initVar["station_id"]).trigger('change');
		$('#filter_list').val(1).trigger('change');
		$('#filter_startdate,#filter_enddate').val(srvData.initVar["date"]);
		srvData.initVar["station_id"] = false;
		srvData.initVar["date"] = false;
		srvData.btnClickPreview();
	}
}


/**
* Get the data fot put on table
*
*/
srvData.btnClickPreview = function(){
	var self = srvData; //initial data
	var frm_filter = $('#form_filter'); // element form filter
	var data_type = $('#filter_data_type').val(); //data type
	var list = $('#filter_list').val(); //list data
	var startDate = $('#filter_startdate').val(); //start date
	var endDate = $('#filter_enddate').val(); //end date


	frm_filter.parsley().validate();
	if(!frm_filter.parsley().isValid() || data_type == 'default'
	|| !list || !startDate || !endDate){
		bootbox.alert({
			message: self.translator['msg_err_require_filter'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		$('.parsley-errors-list').remove();
	}else{

		var date_range = parseInt($('#date_range').val()); //date range
		startDate = new Date(startDate)
		var stDate = startDate.setDate( startDate.getDate()); //start date
		maxDate = startDate.setDate( startDate.getDate() + date_range );
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
				message: self.translator['msg_err_date_over_range'].replace('%s',date_range),
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			})
			return false
		}


		param_view['data_type'] = $('#filter_data_type').val();
		param_view['station_id'] = $('#filter_depart_code').val();
		param_view['start_date'] = $('#filter_startdate').val();
		param_view['end_date'] = $('#filter_enddate').val();

		$('#div_loading').show()
		$('#div_preview').hide()
		apiService.SendRequest('GET', self.service_lastest_data,param_view, self.previewDataTables);
	}
}



/**
* Create table and put data
*
* @param {json} data lastest data
*
*/
srvData.previewDataTables = function(data){
	srvData.DataTable.clear()
	srvData.DataTable.draw()
	srvData.DataTable.destroy()
	$('#tbl-check-latest-data').empty()
	$('#div_loading').hide()
	$('#div_preview').show()


	var a = [];
	var td; //element <td>
	var self = srvData; //initial data
	var tb_data = apiService.getFieldValue(data,'data.header'); //column table data


	if(tb_data == null){return }

	thead = $('<thead></thead>');
	tbl_body = $('<tbody></tbody>');
	tbl_header = $('<tr></tr>');
	thead.append(tbl_header);

	var table = $('#tbl-check-latest-data'); //elment table check latest data

	table.append(thead);
	table.append(tbl_body);
	tbl_header.append('<th><input type="checkbox" name="select_all" id="select_all"><br/>'+srvData.translator["selected_all"]+'</th>');

	for(var i=0; i<tb_data.length; i++){
		var data_header = '<th>'+tb_data[i]+'</th>'; //add column data name
		var name_header = tb_data[i]; //column data

		if(name_header !== 'id'){
			tbl_header.append(data_header);
		}
	}

	var td_data = data['data']['data']; //table data

	for(j=0; j<td_data.length; j++){
		var tr = '<tr class="'+j+'"></tr>'; //element <tr>

		tbl_body.append(tr);
		var ckbox = '<td><input class="checkbox" type="checkbox" name="selected[]" id="'+td_data[j]['id']+'" value="'+td_data[j]['id']+'"></td>'; //create checkbox
		$('#tbl-check-latest-data > tbody > tr.'+j).append(ckbox);
		for(var i=0; i<tb_data.length; i++){
			var name_header = tb_data[i]; //column name
			var push_th = td_data[j][name_header]; //put column name

			if(push_th != null){
				td = '<td>'+td_data[j][name_header]+'</td>'
			}else{
				td = '<td></td>'
			}

			if(name_header !== 'id'){
				$('#tbl-check-latest-data > tbody > tr.'+j).append(td);
			}
		}
	}

	srvData.DataTable = table.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-trash" aria-hidden="true"></i> ลบข้อมูล',
			action : srvData.btn_deleteData,
			className: 'btn-danger'
		} ],
		language : g_dataTablesTranslator,
		columnDefs: [ { orderable: false, targets: [0] } ],
		order: [[ 1, 'asc' ]],
	})
}


/**
* Selected all data on table
*
*/
$('#tbl-check-latest-data').on('change' , '#select_all' , function(){
	var checked = $(this).is(':checked'); //selected checkbox

	$('.checkbox').each(function(){
		$(this).prop('checked' , checked);
	});
});


/**
* Delete Data according selected on checkbox
*
*/
srvData.btn_deleteData = function(){
	var self = srvData; //initial data
	var param_del = {}; //parameter for delete

	param_del['id'] = $('input:checkbox[name="selected[]"]:checked').map(function(){
		return this.value;
	}).get().join();

	if(!param_del['id']){
		bootbox.alert(srvData.translator['msg_select_delete']);
		return false
	}

	param_del['data_type'] = $('#filter_data_type').val();

	//Alert confirm to delete
	var s = srvData.translator['msg_delete_cons']; //message confirm delete
	bootbox.confirm({
		message: s,
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' + srvData.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' + srvData.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function (result) {
			if(result){
				apiService.SendRequest("DELETE", self.service_lastest_data, param_del, function(data, status, jqxhr){
					apiService.SendRequest('GET', self.service_lastest_data, param_view, srvData.previewDataTables)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: srvData.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: srvData.translator['btn_close']
								}
							}
						})
						return false;
					}
					bootbox.alert({
						message: srvData.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: srvData.translator['btn_close']
							}
						}
					})
				})
				return true
			}
		}
	});
}
