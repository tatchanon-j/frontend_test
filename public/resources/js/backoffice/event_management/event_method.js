var evtm = {}; //Initial data
var jid = '#dlgEditEventmethod'; //Prefix elemet id in form


/**
* Initial of page
*
*@param {json} translator Text for label and message on java script.
*/
evtm.init = function(translator) {
	evtm.translator = translator ;//Text for label and message on java script

	evtm.service_sink_method = 'thaiwater30/backoffice/event_management/sink_method'; //service sink method
	evtm.service_event_log = 'thaiwater30/backoffice/event_management/lt_sink_method'; //service lt_sink_method
	evtm.service_mail_server = 'thaiwater30/backoffice/event_management/email_server'; //service email server
	evtm.service_add_edit = 'thaiwater30/backoffice/event_management/sink_method_system_setting'; //service sink_method_system_setting

	//Get data to create option on sink method filter.
	apiService.SendRequest('GET', evtm.service_sink_method,{}, function(rs){
		evtm.genFilter_sink_method(rs);
	})
	//Get data to create option on event log field.
	apiService.SendRequest('GET', evtm.service_event_log,{}, evtm.genInputEvent_log);
	//Get data to create option on mail server field.
	apiService.SendRequest('GET', evtm.service_mail_server,{}, evtm.genInputMail_server);


	// setting datatable
	evtm.metadataTableId = 'tbl-event-method';
	ctrl = $('#' + evtm.metadataTableId);
	evtm.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + evtm.translator['btn_add_event_method'] ,
			action : evtm.editEventtype
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : evtm.renderColumEventMethod,
		}, {
			data : evtm.renderColumDesc,
		},{
			data : evtm.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ]
	})

	// genalate order number on datatable
	evtm.dataTable.on('order.dt search.dt', function() {
		evtm.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	//event on click buttons.
	ctrl.on('click', 'i.btn-edit', evtm.editEventtype);
	ctrl.on('click', 'i.btn-delete', evtm.deleteEventMethod);
	$('#btn_preview').on('click',evtm.btn_displayClick);
	$('#dlgEditEventmethod-save-btn').on('click',evtm.saveEventMethod);


	/* eting general for dropdown multiselect */
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : evtm.translator['select_all'],
			allSelectedText : evtm.translator['all_selected'],
			nonSelectedText : evtm.translator['none_selected'],
			filterPlaceholder: evtm.translator['search']
		})
	})
}

/**
* Get data to display on data table.
*
*/
evtm.btn_displayClick = function(){
	var param = {}; //parameter to send to web service
	var filter_ = $('#filter_event_method').val();

	//Validate filter event method must not null.
	if(!filter_){
		bootbox.alert({
			message: evtm.translator['msg_err_require_filter'],
			buttons: {
				ok: {
					label: evtm.translator['btn_close']
				}
			}
		})
	}

	param['event_log_sink_method_type_id'] = $('#filter_event_method').val().join();
	apiService.SendRequest('GET', evtm.service_sink_method, param, evtm.displayDatatable);
}

/**
* put the data to generate rows on data table.
*
*@param {json} data the raw data to push on data table.
*/
evtm.displayDatatable = function(data){
	evtm.dataTable.clear();
	if ( JH.GetJsonValue(data , "result") != "OK"){ return false; }
	evtm.obj_data = data['data'];
	evtm.dataTable.rows.add( JH.GetJsonValue(data , "data") );
	evtm.dataTable.draw();
}

/**
* push data into column event method on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evtm.renderColumEventMethod = function(row, type, set, meta){
	return  JH.GetJsonValue(row.event_log_sink_method_type, 'description');
}

/**
* push data into column description on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evtm.renderColumDesc = function(row, type, set, meta){
	return  JH.GetJsonValue(row, 'description');
}

/**
* disaplay button tool on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evtm.renderToolButtons = function(row, type, set, meta) {
	var row = meta.row; //row number
	var id  = evtm.obj_data[row]['id']; //event method id

	//Dont't delete data is id 1 or 3.
	if(id == '1' || id == '3'){
		var s = '<i class="btn btn-edit" data-row="'+ meta.row +'" title="' + evtm.translator['btn_edit']
		+ '"></i>';
	}else{
		var s = '<i class="btn btn-edit" data-row="'+ meta.row +'" title="' + evtm.translator['btn_edit']
		+ '"></i>' + '<i class="btn btn-delete"  data-row="'+ meta.row +'" title="'
		+ evtm.translator['btn_delete'] + '"></i>';
	}

	return s;
}

/**
* Create option for mail server field.
*
* @param {json} data The data for crearte option.
*/
evtm.genInputMail_server = function(data){
	var filter_sink_method_type = document.getElementById('dlgEditEventmethod-mail-server'); //element mail server
	var data = data['data']; // mail server data

	JH.Sort(data, "config_name", false, function(str){
		return str.toLowerCase();
	})

	if(typeof data === undefined || data == null){return false}
	for(var i=0; i < data.length; i++){
		var gen_option = document.createElement('option'); //creater element option
		var txt_option = data[i]['config_name']; //mailserver name
		var val_option = data[i]['config_name']; //mail server id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_sink_method_type.add(gen_option);
	}

}

/**
* Create option for event log field.
*
* @param {json} data The data for crearte option.
*/
evtm.genInputEvent_log = function(data){
	var event_log = document.getElementById('dlgEditEventmethod-event-log');
	var data = data['data']; //event log data

	JH.Sort(data, 'description', false, function(str){
		return str.toLowerCase();
	})

	if(typeof data === undefined || data == null){return false}
	for(var i=0; i < data.length; i++){
		var gen_option = document.createElement('option');
		var txt_option = data[i]['description'];
		var val_option = data[i]['id'];

		gen_option.text = txt_option;
		gen_option.value = val_option;
		event_log.add(gen_option);
	}
}

/**
* Create option for sink method field.
*
* @param {json} data The data for crearte option.
*/
evtm.genFilter_sink_method = function(data){
	var filter_event_method = document.getElementById('filter_event_method'); //element event method
	var data = data['data']; //event method data

	JH.Sort(data, "event_log_sink_method_type", false, function(str){
		return str.description.toLowerCase();
	})

	if(typeof data === undefined || data == null){return false}

	for(i=0; i < data.length; i++){
		var gen_option = document.createElement('option');
		var txt_option = data[i]['event_log_sink_method_type']['description'];
		var val_option = data[i]['event_log_sink_method_type']['id'];

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_event_method.add(gen_option);
	}

	$(filter_event_method).multiselect({includeSelectAllOption:true});
	$(filter_event_method).multiselect('rebuild');
	$(filter_event_method).multiselect('selectAll',false);
	$(filter_event_method).multiselect('updateButtonText');

	// diaplay data on data table.
	evtm.btn_displayClick();
}

/**
* Get index cell on data table.
*
*/
evtm.editEventtype = function(){
	var row = $(this).attr('data-row'); //row number
	$('#err-msg-json').remove();
	evtm.showEditEventmethod(row);
}

/**
* disaplay modal for add or edit data.
*
* @param {json} row The index cell on data table.
*/
evtm.showEditEventmethod = function(row){

	//reset validate form
	var frm = $(jid + '-form'); //element form
	frm.parsley().reset();
	$('ul.parsley-errors-list').remove();

	if(row == undefined){
		$(jid + '-title').text(evtm.translator['add_event_method']);
		document.getElementById('dlgEditEventmethod-form').reset();
		$(jid + '-id').val('');
		$(jid + '-parameter').val('{}');
	}else {
		$(jid + '-title').text(evtm.translator['edit_event_method']);
		$(jid + '-id').val(evtm.obj_data[row]['id']);
		$(jid + '-mail-server').val(evtm.obj_data[row]['config_name']);
		$(jid + '-event-log').val(evtm.obj_data[row]['event_log_sink_method_type']['id']);
		$(jid + '-desc').val(evtm.obj_data[row]['description']);

		var j = evtm.obj_data[row]['sink_params'];
		var convert_js = JSON.stringify(j);
		$(jid + '-parameter').val(convert_js);
	}

	$('#dlgEditEventmethod').modal({
		backdop : 'static'
	});
}

/**
* delete data from data table.
*
* @param {json} row The index cell on data table.
*/
evtm.deleteEventMethod = function(row){
	var row = $(this).attr('data-row'); //row number
	var param = {}; //parameter to send to web service
	var sink_method_type = evtm.obj_data[row]['event_log_sink_method_type']['description'];
	var id = evtm.obj_data[row]['id'];
	param['id'] = id.toString();

	var s = evtm.translator['msg_delete_con'].replace('%s',sink_method_type);
	bootbox.confirm({
		message: s,
		reorder:true,
		buttons:{
			confirm:{
				label:'<i class="fa fa-check"></i> ' +  evtm.translator['btn_confirm'],
				className:'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  evtm.translator['btn_cancel'],
				className:'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				apiService.SendRequest("DELETE", evtm.service_sink_method, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', evtm.service_sink_method, {}, evtm.displayDatatable)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: evtm.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: evtm.translator['btn_close']
								}
							}
						});
						return false;
					}
					bootbox.alert({
						message: evtm.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: evtm.translator['btn_close']
							}
						}
					});
				});
				return true;
			}
		}
	});
}

/**
* save data in from.
*
*/
evtm.saveEventMethod = function(){
	var param = {}; //parameter to send to web serevice
	var method = "POST"; //web service method
	var id = $(jid + '-id').val(); //event method id
	var frm = $(jid + '-form'); //elemetn form

	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		return false;
	}

	param = {
		event_log_sink_method_type_id:$(jid + '-event-log').val(),
		config_name: $(jid + '-mail-server').val(),
		description: $(jid + '-desc').val()
	}

	if(id){
		method = 'PUT'
		param['id'] = $(jid + '-id').val()
	}

	// Request Service to Add or Edit data.
	apiService.SendRequest(method, evtm.service_add_edit, param, function(data, status, jqxhr){
		if(status == 'success'){
			apiService.SendRequest('GET', evtm.service_sink_method,{}, evtm.displayDatatable)
			bootbox.alert({
				message: evtm.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: evtm.translator['btn_close']
					}
				}
			});
		}else{
			bootbox.alert({
				message: evtm.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: evtm.translator['btn_close']
					}
				}
			});
		}
	});

	$('#dlgEditEventmethod').modal('hide');
}

/**
* save data in from.
*
*@param {string} str The data to validate format json.
*/
evtm.isJson = function(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		$('#div-param-sink').append('<p id="err-msg-json" class="color-red">ข้อมูลพารามิเตอร์ไม่ได้อยู่ในรูปแบบ Json </p>');
		return false;
	}
	return true;
}
