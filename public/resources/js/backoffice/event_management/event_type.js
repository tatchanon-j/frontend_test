var evt = {}; //Initial data
var jid = '#dlgEditEventtype'; // front from id on modal.

/**
* Initial page load.
*
* @param {json} translator Text for label and message on java script
*/
evt.init = function(translator) {
	evt.translator = translator; //Text for label and message on java script

	evt.service_event_load = 'thaiwater30/backoffice/event_management/event_load'; //url for call service event load to get data option
	evt.service_event	=	'thaiwater30/backoffice/event_management/event'; //url for call service event

	evt.metadataTableId = 'tbl-eventtype'; //datatable id
	ctrl = $('#' + evt.metadataTableId);
	evt.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + evt.translator['page_name_event_type'] ,
			action : evt.editEventtype
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : evt.renderColumCode,
		},  {
			data : evt.renderColumEventype,
		}, {
			data : evt.renderColumColor,
		}, {
			data : evt.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : evt.dataTableRowCallback
	})

	// generate order number on data table.
	evt.dataTable.on('order.dt search.dt', function() {
		evt.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	// seting dropdown multiselect
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
		})
	})

	// generate element input Category according amount language on web
	$(function(){
		evt = evt;
		if(typeof lang === undefined || lang == null){return false}
		for (var i = 0; i<lang.length; i++){
			var id = lang[i];
			var upName = id.toUpperCase();

			if(id == "th"){
				$("#dlgEditEventtype-form > .color").before('  <div class="form-group col-md-12 th  eventtype"> <label for="dlgEditEventtype-'+id+'" class="control-label col-sm-3"><span class="color-red">*</span>'+evt.translator['page_name_event_type']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditEventtype-'+id+'" class="form-control" style="width: 100%;" type="text" name="eventtype-'+id+'" data-parsley-required data-parsley-error-message="'+evt.translator['msg_err_require']+'"  data-key="'+id+'"/> </div> </div>');
			}
			else{
				$("#dlgEditEventtype-form > .color").before('  <div class="form-group  col-md-12 eventtype"> <label for="dlgEditEventtype-'+id+'" class="control-label col-sm-3">'+evt.translator['page_name_event_type']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditEventtype-'+id+'" class="form-control" style="width: 100%;" type="text" name="eventtype-'+id+'" data-key="'+id+'"/> </div> </div>');
			}
		}
		$('[data-toggle="tooltip"]').tooltip();
	})

	//event on click buttons.
	ctrl.on('click', 'i.btn-edit', evt.editEventtype);
	ctrl.on('click', 'i.btn-delete', evt.deleteEventtype);
	$( "#btn_preview" ).click(function() {
		btnPreviewClick();
	});
	$('#dlgEditEventtype-save-btn').on('click',evt.saveEventtype);

	// display data table.
	apiService.SendRequest('GET', evt.service_event_load,{},evt.displayDataTables);
}

/**
* Put data to rows on data table.
*
* @param {json} event_load data to put on data table.
*/
evt.displayDataTables = function(event_load){
	evt.dataTable.clear();
	if ( JH.GetJsonValue(event_load , "result") != "OK"){ return false; }
	evt.event_load = event_load;
	evt.dataTable.rows.add( JH.GetJsonValue(event_load , "data") );
	evt.dataTable.draw();
}

/**
* push data into column code on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evt.renderColumCode = function(row, type, set, meta){
	return JH.GetJsonValue(row,'code');
}

/**
* push data into column event type on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evt.renderColumEventype = function(row, type, set, meta){
	return JH.GetJsonLangValue(row,'description');
}

/**
* push data into column event type on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evt.renderColumColor = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'color');
}

/**
* disaplay button tool on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evt.renderToolButtons = function(row, type, set, meta) {
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" data-id="'+row.id+'" title="' + evt.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete" data-row="'+meta.row+'"  data-id="'+row.id+'" title="'
	+ evt.translator['btn_delete'] + '"></i>';

	return s;
}


/**
* Set background color on column color.
*
* @param {json} row Row element that has just been created.
* @param {json} data Raw data source (array or object) for this row.
* @param {json} index The index of the row in DataTables' internal storage.
*/
evt.dataTableRowCallback = function(row, data, index) {
	var td = $('td', row).eq(3) //property of row
	if(data.color){
		td.css({'background-color':'#'+data.color});
	} else{
		td.css({'background-color':''});
	}
}

/**
* Diaply modal for add new data.
*/
evt.addEventtype = function(){
	evt.showEditEvent();
}

/**
* Diaply modal for edit data.
*/
evt.editEventtype = function(){
	var row = $(this).attr('data-row');
	evt.showEditEvent(row);
}

/**
* disaplay modal for add or edit data.
*
* @param {json} row The index cell on data table.
*/
evt.showEditEvent = function(row){
	var frm = $(jid + '-form'); //element form
	$(jid + '-form')[0].reset();
	$(jid + '-color').css({'background-color':'#FFF'});
	frm.parsley().reset()
	$('ul.parsley-errors-list').remove();

	if(row == undefined){
		$(jid + '-title').text(evt.translator['add_event_type']);
		$(jid + '-id').val('');
	}
	else{
		$(jid + '-title').text(evt.translator['edit_event_type']);
		$(jid + '-id').val(evt.event_load['data'][row]['id']);
		$(jid + '-code').val(evt.event_load['data'][row]['code']);
		$(jid + '-color').val(evt.event_load['data'][row]['color']);


		//Set background color for field color.
		var bg_color = evt.event_load['data'][row]['color'];
		if(bg_color){
			bg_color = '#' + bg_color;
			$(jid + '-color').css({'background-color':bg_color});
		}else{
			$(jid + '-color').css({'background-color':''});
		}


		$(jid + '-form > .eventtype > div').children('input').each(function(){
			var typelang = $(this).attr('data-key');
			$(jid + '-' + typelang).val(evt.event_load['data'][row]['description'][typelang])
		});

	}

	//display modal.
	$('#dlgEditEventtype').modal({
		backdrop : 'static'
	});
}

/**
* Save data in form.
*
*/
evt.saveEventtype = function(){
	var param = {}; //parameter for send to web service
	var data_event = {}; // event type datat
	var frm = $(jid + '-form'); //element form

	//Vaidate form required field not null.
	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		return false;
	}

	var color = $(jid + '-color').val();

	param['code'] = $(jid + '-code').val();
	$(jid + '-form > .eventtype > div').children('input').each(function(){
		var typelang = $(this).attr('data-key');
		data_event[typelang] = $(jid + '-' + typelang).val();
	})

	param['description'] = data_event;

	var method = 'POST'; //service method
	var id  = $(jid + '-id').val(); //event type id

	if(id !== ""){
		method = 'PUT'
		param['id'] = id
	}


	param['code'] = $(jid + '-code').val();
	param['color'] = $(jid + '-color').val();
	param['description']= data_event;


	apiService.SendRequest(method, evt.service_event, param, function(data, status, jqxhr){
		//reload data table.
		apiService.SendRequest('GET', evt.service_event_load,{}, evt.displayDataTables);

		//alert after press on button save.
		bootbox.alert({
			message: evt.translator['msg_save_suc'],
			buttons: {
				ok: {
					label: evt.translator['btn_close']
				}
			}
		});
		return true;
	},
	function(jqXHR, textStatus, errorThrown){
		//validate duplicate code.
		if(jqXHR.status == 422){
			bootbox.dialog({
				message : '<PRE>' + evt.translator['msg_duplicate_eventcode'] + '</PRE>',
				title : evt.translator['msg_title_error'],
				buttons : {
					danger : {
						label : apiService.transMessage(evt.translator['btn_close']),
						className : 'btn-danger',
						callback : function() {
						}
					}
				}
			});
		}else{
			apiService.cbServiceAjaxError(evt.service_event, jqXHR, textStatus, errorThrown);
		}
	})

	$(jid).modal('hide');
}

/**
* Delete data in data table.
*
*/
evt.deleteEventtype = function(){
	var param = {}; //Parameter to send to web service
	var row = $(this).attr('data-row'); //row number
	var id = $(this).attr('data-id'); //event type id
	var data_des = evt.event_load['data'][row]; //event type data
	var des = JH.GetJsonLangValue(data_des,'description'); //event type name
	var s = evt.translator['msg_delete_con'].replace('%s',des); //message confirm delete


	param['id'] = id;

	//alert delete confirm.
	bootbox.confirm({
		message:s,
		reorder: true,
		buttons:{
			confirm:{
				label: '<i class="fa fa-check"></i> ' +  evt.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  evt.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				apiService.SendRequest('DELETE', evt.service_event, param, function(data, status, jqxhr){
					//reload data table.
					apiService.SendRequest('GET', evt.service_event_load, {}, evt.displayDataTables)

					//alert delete result.
					if (data["result"] == "NO"){
						bootbox.alert({
							message: evt.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: evt.translator['btn_close']
								}
							}
						});
						return false;
					}
					bootbox.alert({
						message: evt.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: evt.translator['btn_close']
							}
						}
					});
				} , function(err){
				});
				return true
			}
		}
	});

}
