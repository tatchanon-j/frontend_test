var srvData = {}; //initial data
var param = {}; //parameter for call service.
var datetime; //default date

/**
* prepare data.
*
* @param {json} translator Text for use on page.
*
* @return text
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator //Text for label and message on java script
	self.service_datatype = 'thaiwater30/backoffice/dba/delete_data_load'; //service datatype
	self.service_station = 'thaiwater30/shared/station'; //service station
	self.service_delete_data = 'thaiwater30/backoffice/dba/delete_data'; //service delete data

	// Genalate Data table
	self.metadataTableId = 'tbl-deletedata'; //datatable id
	ctrl = $('#' + self.metadataTableId) //select element data table
	srvData.DataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-trash" aria-hidden="true"></i> ' + self.translator['btn_delete_data'],
			action : srvData.btn_deleteData,
			className: 'btn-danger'
		} ],
		language : g_dataTablesTranslator,
	})

	//setting element multiple
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
		});
	});

	$('.frm-search').select2(); //search box on select element
	$('#div_preview').hide(); //hide data table
	$('#div_loading').hide(); //hide icon loading

	//setting format date on filter
	$('#filter_startdate,#filter_enddate').datepicker({
		format: 'yyyy-mm-dd'
	});

	//get current date in format
	var currentdate = new Date(); //current date.
	datetime = 	currentdate.getFullYear() + "-"
	+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
	+ ("0" + currentdate.getDate()).slice(-2);

	//set default date on filter
	$('#filter_startdate,#filter_enddate').datepicker('setDate', datetime);

	btn_preview = $('#btn_preview');
	btn_preview.on('click', self.clickPreview);

	filter_datatype = $('#filter_datatype');
	filter_datatype.on('change' , srvData.changeFilterDatatype);

	apiService.SendRequest('GET',self.service_datatype,{name:"data_type"},srvData.genFilterDatatype);
}


/**
* create option into filter datattype.
*
* @param {json} datatype data type.
*
*/
srvData.genFilterDatatype = function(datatype){
	var filter_datatype  = document.getElementById('filter_datatype'); //element filter datatype
	var data_type = apiService.getFieldValue(datatype,'data.data_type'); //datattype

	if(data_type == null){return }

	//sort data option by alphabet
	JH.Sort(data_type, "name", false, function(str){
		return str.toLowerCase();
	})

	for(var i=0; i<data_type.length; i++){
		var gen_option = document.createElement('option'); //create option element
		var text_option = data_type[i]['name']; //option name
		var value_option = data_type[i]['data_type']; //option value

		gen_option.text = text_option;
		gen_option.value = value_option;
		filter_datatype.add(gen_option);
	}
}


/**
* Create new option on station filter to relate with data type filter
*
*
*/
srvData.changeFilterDatatype = function(){
	var self = srvData; //initial data
	var stnParam = {} //parameter for get data station
	var data_type = $('#filter_datatype').val() //datatype filter element
	$('#filter_code_station > option').not('.op_default').remove(); //remove option on station filter

	stnParam['data_type'] = $(this).val();

	if(data_type){
		$('#filter_code_station').removeAttr('disabled')
	}else{
		$('#filter_code_station').attr('disabled','true')
		return false
	}
	apiService.SendRequest('GET',self.service_station,stnParam,srvData.genFilterStation)
}


/**
* create option into filter station
*
* @param {json} station data station
*
*/
srvData.genFilterStation = function(station){
	var filter_code_station = document.getElementById('filter_code_station'); //element station filter
	var data_station = apiService.getFieldValue(station,'data'); //data station

	if(data_station == null){return }

	for(var i=0; i< data_station.length; i++){
		var name = data_station[i] //data station
		var text_name = JH.GetJsonLangValue(name, 'station_name',true); //station name
		var text_shortname = JH.GetJsonLangValue(name, 'agency_shortname',true); //agency shortname
		var text_oldcode = JH.GetJsonLangValue(name, 'station_oldcode',true); //oldcode

		//format setting of option name contain name-agency-oldcode
		if(!text_name && !text_shortname && !text_oldcode){
			var text_option = srvData.translator['noname'];
		}else{
			if(!text_name){
				var text_name = srvData.translator['noname'];
			}
			if(!text_shortname){
				var text_shortname = srvData.translator['no_agency'];
			}
			if(!text_oldcode){
				var text_oldcode = srvData.translator['noname'];
			}
			var text_option = text_name + ' - '+ text_shortname + ' - ' + text_oldcode; //option name
			text_option = text_option.replace('*','') //remove * from data
		}

		var gen_option = document.createElement('option'); //create option element
		var value_option = data_station[i]['id'] //value option

		gen_option.text = text_option;
		gen_option.value = value_option;
		filter_code_station.add(gen_option);
	}
}


/**
* Event on click button preview
*
*
*/
srvData.clickPreview = function(){
	var self = srvData; //initial data
	var frm = $('#filter-form'); //filter data
	var datatype = $('#filter_datatype').val(); //datatype
	var code_depart = $('#filter_code_station').val(); //station
	var start_date = $('#filter_startdate').val(); //start date
	var end_date = $('#filter_enddate').val(); //end date

	/* validate form is not null */
	frm.parsley().validate()
	if(!frm.parsley().isValid()){
		$('#filter-form ul.parsley-errors-list').remove()
		bootbox.alert({
			message : self.translator['msg_err_require_filter'],
			buttons : {
				ok : {
					label : self.translator['btn_close']
				}
			}
		});
		return false
	}

	var date_range = parseInt($('#date_range').val()); //date range
	var startDate = new Date(start_date); //get start date
	var stDate = startDate.setDate( startDate.getDate()); //convert start date to number
	maxDate = startDate.setDate( startDate.getDate() + 30 ); //Max range date from startdate
	var endDate = new Date(end_date); //get end date
	endDate = endDate.setDate( endDate.getDate()); //convert end dte to number

	/* validate startdate over than end date */
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

	/* validate end date over than max range date */
	if(endDate > maxDate){
		bootbox.alert({
			message: self.translator['msg_err_date_over_range'].replace('%s',30),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}

	param['data_type'] = $('#filter_datatype').val();
	param['station_id'] = $('#filter_code_station').val();
	param['start_date'] = $('#filter_startdate').val();
	param['end_date'] = $('#filter_enddate').val();

	$('#div_loading').show()
	$('#div_preview').hide()
	apiService.SendRequest('GET',self.service_delete_data,param,srvData.previewDataTables);
}


/**
* generate data rows on data table
*
* @param {json} data data to display on data table
*
*/
srvData.previewDataTables = function(data){
	var self = srvData; //initial data
	var td; //prepare data
	var arr_header = apiService.getFieldValue(data,'data.header'); //column name data

	/* prepare data table */
	srvData.DataTable.clear();
	srvData.DataTable.draw();
	srvData.DataTable.destroy();


	$('#tbl-deletedata').empty();
	$('#div_loading').hide();
	$('#div_preview').show();

	var thead = $('<thead></thead>'); //header table element
	var tbl_body = $('<tbody></tbody>'); //boday table element
	var tbl_header = $('<tr></tr>'); //row header table
	thead.append(tbl_header);

	var table = $('#tbl-deletedata'); //data table element
	table.append(thead);
	table.append(tbl_body);
	tbl_header.append('<th><input type="checkbox" name="select_all" id="select_all"> '+ srvData.translator['col_selectedall']+'</th>');

	if(arr_header == null){return }

	/* generate column data table */
	for(var i=0; i<arr_header.length; i++){
		var data_header = '<th>'+arr_header[i]+'</th>'
		var name_header = arr_header[i];

		if(name_header !== 'id'){
			tbl_header.append(data_header);
		}
	}

	/* generate row data and put data to data table */
	for(j=0; j<data['data']['data'].length; j++){
		var tr = '<tr class="'+j+'"></tr>'; //row element
		var data_tbody = data['data']['data'][j]; //data to put on data table

		tbl_body.append(tr);
		var ckbox = '<td><input class="checkbox" type="checkbox" name="selected[]" id="'+data_tbody['id']+'" value="'+data_tbody['id']+'"></td>'; // create check box element
		$('#tbl-deletedata > tbody > tr.'+j).append(ckbox); //add check box

		//put data to data table
		for(var i=0; i<arr_header.length; i++){
			var name_header = arr_header[i]; //column name
			td = '<td>'+JH.GetJsonValue(data_tbody, name_header)+'</td>'; //get data to put on table

			/* put data on cell */
			if(name_header !== 'id'){
				$('#tbl-deletedata > tbody > tr.'+j).append(td);
			}
		}

	}

	//Setting data table
	srvData.DataTable = table.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-trash" aria-hidden="true"></i> ' + self.translator['btn_delete_data'],
			action : srvData.btn_deleteData,
			className: 'btn-danger'
		} ],
		language : g_dataTablesTranslator,
	})
}


/**
* Delete Data according selected on checkbox
*
*
*/
srvData.btn_deleteData = function(){
	var self = srvData //initial data
	var param_del = {} //prepare parameter to delete data

	param_del['id'] = $('input:checkbox[name="selected[]"]:checked').map(function(){
		return this.value;
	}).get().join();

	/* validate without selected data to delete */
	if(!param_del['id']){
		bootbox.alert({
			message: self.translator['msg_select_delete'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		});

		return false
	}

	param_del['data_type'] = $('#filter_datatype').val();

	var s = self.translator['msg_delete_cons']; //message confirm delete

	/* alert confirm delete */
	bootbox.confirm({
		message : s,
		reorder: true,
		buttons:{
			confirm:{
				label: '<i class="fa fa-check"></i> ' +  self.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  self.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function (result) {
			if(result){
				apiService.SendRequest('DELETE',self.service_delete_data , param_del, function(data, status, jqxhr){
					apiService.SendRequest('GET',self.service_delete_data, param, srvData.previewDataTables)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: self.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: self.translator['btn_close']
								}
							}
						});
						return false;
					}
					bootbox.alert({
						message: self.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: self.translator['btn_close']
							}
						}
					});
				});
				return true
			}
		}
	});
}


/**
* check box selected all
*
*
*/
$('#tbl-deletedata').on('change' , '#select_all' , function(){
	var checked = $(this).is(':checked');
	$('.checkbox').each(function(){
		$(this).prop('checked' , checked);
	});
});
