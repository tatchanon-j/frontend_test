var emes = {}; //Initial data
var jid = '#dlg'; //prfix id of element in form

/**
* Initial page load.
*
* @param {json} translator Text for use on page.
*/
emes.init = function(translator) {
	emes.translator = translator; //Text for label and message on java script
	emes.service = 'thaiwater30/backoffice/event_management/email_server'; //url of call service email server

	/* Data table setting */
	emes.dataTableId = 'tbl';
	ctrl = $('#' + emes.dataTableId);
	emes.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + emes.translator['btn_add_event_mgmt_email_sever'] ,
			action : emes.editMailServer
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : emes.renderColumName,
		},{
			data : emes.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ]
	})

	//Generate order nuumber on data table.
	emes.dataTable.on('order.dt search.dt', function() {
		emes.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	/* Event click button on page*/
	ctrl.on('click', 'i.btn-edit', emes.editMailServer);
	ctrl.on('click', 'i.btn-delete', emes.deleteMailServer);
	$(jid + '-save-btn').on('click',emes.saveMailServer);

	//Get the data to put on data table.
	apiService.SendRequest('GET', emes.service, {}, emes.displayDatatable);
}


/**
* put the data to generate rows on data table.

*
*@param {json} data the raw data to put and generate rows on data table.
*/
emes.displayDatatable = function(data){
	emes.dataTable.clear()
	if ( JH.GetJsonValue(data , "result") != "OK"){ return false; }
	emes.obj_data = JH.GetJsonValue(data , "data");
	emes.raw_data = JH.GetJsonValue(data , "data");
	emes.dataTable.rows.add( emes.obj_data );
	emes.dataTable.draw();
}

/**
* put data on column name.

*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
emes.renderColumName = function(row, type, set, meta){
	return  JH.GetJsonValue(row, 'config_name');
}


/**
* display edit button on coulmn edit .

*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
emes.renderToolButtons = function(row, type, set, meta) {
	var s = '<i class="btn btn-edit" data-row="'+ meta.row +'" title="'+ emes.translator['btn_edit']+'"></i>' //element buttons
	return s;
}

/**
* Get The row index for the requested cell.
*
*/
emes.editMailServer = function(){
	row = $(this).attr('data-row'); //row nummber
	$('#err-msg-json').remove();
	emes.showEditMailServer(row);
}

/**
* Display modal and form to add or edit data.
*
*@param {row} json The row index for the requested cell.
*/
emes.showEditMailServer = function(row){
	var frm = $(jid + '-form');

	frm[0].reset(); //reset form.

	/* reset validate in form. */
	frm.parsley().reset();
	$('ul.parsley-errors-list').remove();
	$(jid + '-param').css({'background-color':'#FFF','color':'#505357','border':'1px solid #ccc'});
	/* end reset validate in form. */

	/* Display form is add or edit form*/
	if(row == undefined){
		$(jid + '-title').text(emes.translator['add_event_mgmt_email_sever']);
		// $('#dlg-form')[0].reset();
		$(jid + '-id').val('');
		$(jid + '-parameter').val('{}');
		$(jid + '-name').attr('disabled',false);
	}else{
		/* clone the json data */
		var data = JSON.parse(JSON.stringify(emes.obj_data[row]));
		/* end clone the json data */

		$(jid + '-name').attr('disabled',true);
		$(jid + '-title').text(emes.translator['edit_event_mgmt_email_sever']);
		$(jid + '-id').val(emes.obj_data[row]['config_name']);
		$(jid + '-name').val(emes.raw_data[row]['config_name']);

		delete data.config_name //delete data element config_name before display on field input param.
		var param_data = JSON.stringify(data); //convert json to string for display on field input param.
		$(jid + '-param').val(param_data);
	}
	/* end display form is add or edit form*/

	$('#dlg').modal({
		backdop : 'static'
	});
}


/**
* Delete data on data table.
*
*/
emes.deleteMailServer = function(row){
	var row = $(this).attr('data-row'); //row nuber
	var param = {}; //parameter to send to web service
	var srv =  emes.service; //url for call service email server
	var name = emes.obj_data[row]['config_name'];

	srv+= '/' + name;
	var s = emes.translator['msg_delete_con'].replace('%s',name); //Message confirm delete
	bootbox.confirm({
		message: s,
		reorder:true,
		buttons:{
			confirm:{
				label:'<i class="fa fa-check"></i> ' +  emes.translator['btn_confirm'],
				className:'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  emes.translator['btn_cancel'],
				className:'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				apiService.SendRequest("DELETE", srv, {}, function(data, status, jqxhr){
					apiService.SendRequest('GET', emes.service, {}, emes.displayDatatable)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: emes.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: emes.translator['btn_close']
								}
							}
						});
						return false;
					}
					bootbox.alert({
						message: emes.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: emes.translator['btn_close']
							}
						}
					});
				})
				return true;
			}
		}
	});
}

/**
* Save data in form.
*
*/
emes.saveMailServer = function(){
	var param = {}; //parameter to send to web service
	var method = "POST"; //web service method
	var id = $(jid + '-id').val();
	var frm = $(jid + '-form')
	var srv = emes.service;

	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		return false;
	}

	var str = $(jid + '-param').val();
	emes.isJson(str);
	param = JSON.parse(str);

	if(id){
		method = 'PUT';
		srv += '/'+ id;
	}else{
		param['config_name'] = $(jid + '-name').val();
	}

	//Request Service to Add or Edit data.
	apiService.SendRequest(method, srv, param, function(data, status, jqxhr){
		if(data.result == 'OK'){
			apiService.SendRequest('GET', emes.service,{}, emes.displayDatatable)
			bootbox.alert({
				message: emes.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: emes.translator['btn_close']
					}
				}
			})
		}else{
			bootbox.alert({
				message: emes.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: emes.translator['btn_close']
					}
				}
			});
		}
	})

	$('#dlg').modal('hide');
}

/**
* Validate json format.
*
*@param {srt} string The data to validate format.
*/
emes.isJson = function(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		$('.div-param').append('<p id="err-msg-json" class="color-red">'+emes.translator['msg_error_not_json_format']+'</p>');
		$(jid + '-param').css({'background-color':'#F2DEDE','color':'#505357','border':'1px solid #EED3D7'});
		return false;
	}
	return true;
}
