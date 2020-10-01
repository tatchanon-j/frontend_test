var est = {}; //initial data
var jid = '#dlg'; //Prefix id of element in form

/**
* Initial page load.
*
* @param {json} translator Text for label and message on java script
*/
est.init = function(translator) {
	est.translator = translator; //Text for label and message on java script
	//URL of service
	est.service = 'thaiwater30/backoffice/event_management/lt_sink_method'; //url call service lt_sink_method

	/* Setting datatable */
	est.metadataTableId = 'tbl-event_log_sink_method_type';
	ctrl = $('#' + est.metadataTableId);
	est.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + est.translator['btn_add_event_event_log_sink_method_type'] ,
			action : est.editEventLog
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			data : 'id'
		}, {
			data : est.renderColumName,
		},{
			data : est.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 0, 'asc' ] ]
	})

	//event click buttons on page.
	ctrl.on('click', 'i.btn-edit', est.editEventLog);
	// ctrl.on('click', 'i.btn-delete', est.deleteEventLog)
	$(jid+'-save-btn').on('click', est.saveEventLog);

	//Get data to push on data table.
	apiService.SendRequest('GET', est.service, {}, est.displayDatatable);
}

/**
* put the data to generate rows on data table.
*
*@param {json} mt the data to put and generate rows on data table.
*/
est.displayDatatable = function(mt){
	est.dataTable.clear();
	if( JH.GetJsonValue(mt , "result") != "OK"){ return false; }
	est.obj_data = mt; //Data to generate on table
	est.dataTable.rows.add( JH.GetJsonValue(est.obj_data , "data") )
	est.dataTable.draw();
}

/**
* put data on column name.

*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
est.renderColumName = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'description');
}

/**
* display buttons edit on column edit.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
*@return {text} Element of buttons edit and delete on table.
*/
est.renderToolButtons = function(row, type, set, meta) {
	var s = '<i class="btn btn-edit" data-row="'+ meta.row +'" title="' + est.translator['btn_edit']
	+ '"></i>';

	return s;
}


/**
* Get The row index for the requested cell.
*
*/
est.editEventLog = function(){
	var row = $(this).attr('data-row') //row number
	est.showEditEventLog(row);
}

/**
* Display modal and form to add or edit data.
*
*@param {row} json The row index for the requested cell.
*/
est.showEditEventLog = function(row){
	var frm = $(jid + '-form'); //element form
	$(jid + '-form')[0].reset();
	frm.parsley().reset();
	$('.parsley-errors-list').remove();

	if(row == undefined){
		$(jid + '-title').text(est.translator['add_event_event_log_sink_method_type']);
		$(jid + '-id').val('');

	}else{
		$(jid + '-title').text(est.translator['edit_event_event_log_sink_method_type']);
		$(jid + '-id').val(est.obj_data['data'][row]['id']);
		$(jid + '-name').val(est.obj_data['data'][row]['description']);
	}

	$('#dlg').modal({
		backdrop : 'static'
	});
}

/**
* Save data in form.
*
*/
est.saveEventLog = function(){
	var param = {}; //parameter to sent to web service
	var frm = $(jid + '-form') ;//element form

	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		return false;
	}

	param = {
		description : $(jid + '-name').val()
	}

	var id = $(jid + '-id').val(); // event log id
	var method = 'POST'; //method 'POST'
	if(id !== ''){
		method = 'PUT'; //method 'PUT'
		param['id'] = parseInt(id);
	}

	apiService.SendRequest(method, est.service, param, function(data, status, jqxhr){
		apiService.SendRequest('GET', est.service,{}, est.displayDatatable)
		if(data.result == 'NO'){
			bootbox.alert({
				message: est.translator['msg_save_unsuc'],
				buttons: {
					ok: {
						label: est.translator['btn_close']
					}
				}
			});
			return false;
		}
		bootbox.alert({
			message: est.translator['msg_save_suc'],
			buttons: {
				ok: {
					label: est.translator['btn_close']
				}
			}
		});
		return true;
	})
	$(jid).modal('hide');
}

/**
* Delete data on data table.
*
*/
est.deleteEventLog = function(){
	var key = $(this).attr('data-key'); //event log id
	var name = $(this).attr('name'); // event log name

	var s = est.translator['msg_delete_con'].replace('%s',name); //message delte confirm
	var param = {
		id : parseInt(key)
	}

	bootbox.confirm({
		message:s,
		reorder: true,
		buttons:{
			confirm:{
				label: '<i class="fa fa-check"></i> ' +  est.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  est.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				apiService.SendRequest('DELETE', est.service, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', est.service, {}, est.displayDatatable)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: est.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: est.translator['btn_close']
								}
							}
						})
						return false;
					}
					bootbox.alert({
						message: est.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: est.translator['btn_close']
							}
						}
					});
				});
				return true;
			}
		}
	});
}
