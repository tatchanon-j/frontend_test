var evts = {}; //Initail data
var jid = '#dlgEditEventsubtype'; //prefix id of element in form

/**
* Initial page load.
*
* @param {json} translator Text for label and message on java script.
*/
evts.init = function(translator) {
	evts.translator = translator //Text for label and message on java script
	evts.service_subevent_load = 'thaiwater30/backoffice/event_management/subevent_load'; //url for call service subevent to gen option list
	evts.service_subevent = 'thaiwater30/backoffice/event_management/subevent'; //url for call service sub-event

	// setting data table.
	evts.metadataTableId = 'tbl-event-subtype';
	ctrl = $('#' + evts.metadataTableId);
	evts.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> '+ evts.translator["page_name_event_subtype"],
			action : evts.editEventSubtype
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : evts.renderColumEventype,
		}, {
			data : evts.renderColumEvensubtype,
		}, {
			data : evts.renderColumEventypeGroup,
		},  {
			data : evts.renderColumStatus,
		}, {
			data : evts.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ]
	})

	// genalate order number on datatable
	evts.dataTable.on('order.dt search.dt', function() {
		evts.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	// generate element input according amount language on web.
	$(function(){
		if(typeof lang === undefined || lang == null){return false}
		for(var i=0; i<lang.length; i++){
			var id = lang[i];
			var upName = id.toUpperCase();
			if(lang[i] == 'th'){
				$('#dlgEditEventsubtype-form > .group-subtype').before('<div class="form-group row lang"> <label for="dlgEditEventsubtype-name" class="form-control-label text-sm-right col-sm-3"><span class="color-red">*</span>'+evts.translator["page_name_event_subtype"]+' ('+upName+')</label> <div class="col-sm-9 lang"> <input id="dlgEditEventsubtype-'+id+'" class="form-control" data-key="'+id+'" type="text" name="'+id+'SubtypeName" data-parsley-required data-parsley-error-message="'+evts.translator['msg_err_require']+'"> </div> </div>');
			}
			else{
				$('#dlgEditEventsubtype-form > .group-subtype').before('<div class="form-group row lang"> <label for="dlgEditEventsubtype-name" class="form-control-label text-sm-right  col-sm-3">'+evts.translator["page_name_event_subtype"]+' ('+upName+')</label> <div class="col-sm-9 lang"> <input id="dlgEditEventsubtype-'+id+'" class="form-control" data-key="'+id+'" type="text" name="'+id+'SubtypeName"> </div> </div>');
			}
		}
	})

	//event on click buttons.
	ctrl.on('click', 'i.btn-edit', evts.editEventSubtype);
	ctrl.on('click', 'i.btn-delete', evts.deleteEventSubtype);
	$('#btn_preview').on('click',evts.btnDisplayClick);
	$('#dlgEditEventsubtype-save-btn').on('click',evts.saveEventSubtype);

	/* eting general for dropdown multiselect */
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : evts.translator['select_all'],
			allSelectedText : evts.translator['all_selected'],
			nonSelectedText : evts.translator['none_selected'],
			filterPlaceholder: evts.translator['search']
		})
	})

	/* Get data from service to add on datatable */
	apiService.SendRequest('GET', evts.service_subevent,{}, evts.previewDataTables);
	apiService.GetCachedRequest(evts.service_subevent_load,{}, function(rs){
		console.log("OK");
		evts.genFilterEventType(rs);
		evts.genInputEventtype(rs);
		evts.genInputGroupEvent(rs);
	});
}

/**
* Generate option for event type dropdown list.
*
* @param {json} data The data of event type.
*/
evts.genFilterEventType = function(data){
	var filter_eventtype = document.getElementById('filter_evttype'); //element filter event type
	var i; //loop condition


	//sort option.
	var event_type = apiService.getFieldValue(data,'data.event')
	if ( event_type == null ) {
		return
	}


	JH.Sort(event_type,"description",false , function(str){
		if(str['th']){
			return str['th'].toLowerCase();
		}else if(str['en']){
			return str['en'].toLowerCase();
		}else {
			return str['jp'].toLowerCase();
		}
	})

	for(i=0; i < event_type.length; i++){
		var gen_option = document.createElement('option');
		var txt_option_th = event_type[i]['description']['th'];
		var txt_option_en = event_type[i]['description']['en'];
		var txt_option_jp = event_type[i]['description']['jp'];

		if(txt_option_th){
			txt_option = event_type[i]['description']['th'];
		}else if(txt_option_en){
			txt_option = event_type[i]['description']['en'];
		}else if(txt_option_jp){
			var txt_option = event_type[i]['description']['jp'];
		}else{
			text_option = evts.translator['noname'];
		}

		var val_option = event_type[i]['id']

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_eventtype.add(gen_option);
	}

	$(filter_eventtype).multiselect({includeSelectAllOption:true});
	$(filter_eventtype).multiselect('rebuild');
	$(filter_eventtype).multiselect('selectAll',false);
	$(filter_eventtype).multiselect('updateButtonText');
}

/**
* Generate option for event type dropdown list on modal.
*
* @param {json} data The data of event type.
*/
evts.genInputEventtype = function(data){
	var input_eventtype = document.getElementById('dlgEditEventsubtype-eventtype');
	var i; //condition loop

	//sort optin.
	var event_type = apiService.getFieldValue(data,'data.event')
	if ( event_type == null ) {
		return
	}
	JH.Sort(event_type,"description",false , function(str){

		if(str['th']){
			return str['th'].toLowerCase();
		}else if(str['en']){
			return str['en'].toLowerCase();
		}else {
			return str['jp'].toLowerCase();
		}
	})

	for(i=0; i < event_type.length; i++){
		var gen_option = document.createElement('option'); //create element option
		var txt_option_th = event_type[i]['description']['th']; //event type name th
		var txt_option_en = event_type[i]['description']['en']; //event type name en
		var txt_option_jp = event_type[i]['description']['jp']; //event type name jp

		if(txt_option_th){
			txt_option = event_type[i]['description']['th'];
		}else if(txt_option_en){
			txt_option = event_type[i]['description']['en'];
		}else if(txt_option_jp){
			var txt_option = event_type[i]['description']['jp'];
		}else{
			text_option = evts.translator["no_name"];
		}

		var val_option = event_type[i]['id']; //event type id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		input_eventtype.add(gen_option);
	}

}

/**
* Generate option for group event dropdown list on modal.
*
* @param {json} data The data of group event.
*/
evts.genInputGroupEvent = function(data){
	var input_grpEventSubtype = document.getElementById('dlgEditEventsubtype-grpEventSubtype'); //element group event subtype
	var i; //condition loop
	var subtype_category = apiService.getFieldValue(data,'data.subtype_category'); //data sub type category

	if ( subtype_category == null ) {
		return
	}
	JH.Sort(subtype_category,"name",false , function(str){
		return str.toLowerCase();
	})

	for(i = 0; i < subtype_category.length; i++){
		var gen_option = document.createElement('option');
		var txt_option = subtype_category[i]['name'];
		var val_option = subtype_category[i]['id'];

		gen_option.text = txt_option;
		gen_option.value = val_option;
		input_grpEventSubtype.add(gen_option);
	}

	$(input_grpEventSubtype).multiselect({includeSelectAllOption:true});
	$(input_grpEventSubtype).multiselect('rebuild');
	$(input_grpEventSubtype).multiselect('selectAll');
	$(input_grpEventSubtype).multiselect('updateButtonText');
}

/**
* Event on click display datatable.
*
* @param {json} data The data of group event.
*/
evts.btnDisplayClick = function(){
	var param = {}; //parameter to send to web service
	var get_eventtype = $('#filter_evttype').val(); //event type id

	//Validate filter must not null.
	if(!get_eventtype){
		bootbox.alert({
			message: evts.translator['msg_err_event_is_null'],
			buttons: {
				ok: {
					label: evts.translator['btn_close']
				}
			}
		})

	}

	param['event_log_category_id'] = $('#filter_evttype').val().join();
	apiService.SendRequest('GET',evts.service_subevent, param, evts.previewDataTables);
}


/**
* put data on data table.
*
* @param {json} data data to put on data table.
*/
evts.previewDataTables = function(data){
	evts.dataTable.clear();
	if ( JH.GetJsonValue(data , "result") != "OK"){ return false; }
	evts.obj_data = data; //event sub type data
	evts.dataTable.rows.add( JH.GetJsonValue(data , "data") );
	evts.dataTable.draw();
}

/**
* put data into column event type on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evts.renderColumEventype = function(row, type, set, meta){
	return JH.GetLangValue(row.event_log_category.description,'event_type');
}

/**
* put data into column event subtype on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evts.renderColumEvensubtype = function(row, type, set, meta){
	return JH.GetLangValue(row.description,'subevent_type');
}

/**
* put data into column event group on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evts.renderColumEventypeGroup = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'subtype_category');
}

/**
* put data into column event status on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evts.renderColumStatus = function(row, type, set, meta){
	var status = JH.GetJsonValue(row, 'is_autoclose');
	if(status == true || status == false){
		if(status == true){
			status = evts.translator['auto_close'];
		}else{
			status = evts.translator['admin_close'];
		}
		return status;
	}else{
		return status;
	}
}

/**
* disaplay button tool on data table.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*/
evts.renderToolButtons = function(row, type, set, meta) {
	var s = '<i class="btn btn-edit" data-row="'+ meta.row +'" title="' + evts.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete"  data-row="'+ meta.row +'" title="'
	+ evts.translator['btn_delete'] + '"></i>';

	return s;
}

/**
* Get index cell on data table to edit.
*/
evts.editEventSubtype = function(){
	var row = $(this).attr('data-row'); //row number
	evts.showEditEventsubtype(row);
}

/**
* display modal for add or edit data on data table.
*
*@param {string} row The index cell on data table to edit.
*/
evts.showEditEventsubtype = function(row){
	var frm = $(jid + '-form'); //element form
	var data_subevent = evts.obj_data['data'][row]; //event subtype data
	frm.parsley().reset();
	$('ul.parsley-errors-list').remove();

	if(row == undefined){
		$(jid + '-title').text(evts.translator['title_add_event_subtype'])
		$(jid + '-id').val('');
		$(jid + "-form")[0].reset();

		//Update optin list on dropdown group subtype after reset form.
		$(jid + '-grpEventSubtype').multiselect('rebuild');
		$(jid + '-grpEventSubtype').multiselect('updateButtonText');
	}else{
		$(jid + '-title').text(evts.translator['title_edit_event_subtype'])
		$(jid + '-id').val(data_subevent['id']);
		$(jid + '-eventtype').val(data_subevent['event_log_category']['id']);
		$(jid + '-code').val(data_subevent['code']);
		$(jid + '-support').val(data_subevent['troubleshoot']);

		/* Display status event sub type */
		if(data_subevent['is_autoclose'] == true){
			$( 'input[name="eventStatus"][value="' + data_subevent['is_autoclose'] + '"]').prop('checked', true);
		}
		$( 'input[name="eventStatus"][value="' + data_subevent['is_autoclose'] + '"]').prop('checked', true);


		$('input[name="eventStatus"]:checked').val(data_subevent['is_autoclose']);

		$("#dlgEditEventsubtype-form > .form-group >  div.lang").children("input").each(function(){
			var frm_lang = $(this).attr('data-key');
			var text = "" ;
			if ( data_subevent['description'][frm_lang] != "undefined"){
				text = data_subevent['description'][frm_lang];
			}

			$(jid + '-'+frm_lang).val(text);

		});

		//put data into option list group event subtype.
		var val_grpevent = data_subevent['subtype_category'].split(',');

		//Update optin list on dropdown group subtype after put data on option.
		$(jid + '-grpEventSubtype').val(val_grpevent);
		$(jid + '-grpEventSubtype').multiselect('rebuild').multiselect('updateButtonText');
	}

	$('#dlgEditEventsubtype').modal({
		backdrop : 'static'
	});
}

/**
* display modal for add or edit data on data table.
*
*@param {string} row The index cell on data table to delete.
*/
evts.deleteEventSubtype = function(row){
	var row = $(this).attr('data-row'); //row number
	var id = $(jid + '-id').val(); //event sub type id
	var param = {}; //parameter to send to web service
	var event_type;
	var id = evts.obj_data['data'][row]['id'];
	var desc = evts.obj_data['data'][row]['description'];

	event_type = JH.GetLangValue(desc); //event sub type name

	param['id'] = id.toString();

	var s = evts.translator['msg_delete_con'].replace('%s',event_type); //message confirm delete
	
	bootbox.confirm({
		message: s,
		reorder:true,
		buttons:{
			confirm:{
				label:'<i class="fa fa-check"></i> ' +  evts.translator['btn_confirm'],
				className:'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  evts.translator['btn_cancel'],
				className:'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				apiService.SendRequest("DELETE", evts.service_subevent, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', evts.service_subevent, {}, evts.previewDataTables)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: evts.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: evts.translator['btn_close']
								}
							}
						});
						return false;
					}
					bootbox.alert({
						message: evts.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: evts.translator['btn_close']
							}
						}
					});
				})
				return true;
			}
		}
	})
}

/**
* save data in form.
*
*/
evts.saveEventSubtype = function(){
	var data = {}; //event subtype to save
	var param = {}; //parameter to send to web service
	var method = 'POST'; //web seervice method
	var frm = $(jid+ '-form'); //element form
	var id = $(jid + '-id').val(); //event sub type id

	//Validate field request must not null.
	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		return false;
	}

	$("#dlgEditEventsubtype-form > .form-group >  div.lang").children("input").each(function(){
		var frm_lang = $(this).attr('data-key'); //langauge of even sub-type

		data[frm_lang] = $(jid + '-'+ frm_lang).val();

	});

	//prepare parameter for send service.
	param['code'] = $(jid + '-code').val();
	param['description'] = data;
	param['subtype_category'] = $(jid + '-grpEventSubtype').val().join();
	param['troubleshoot'] = $(jid + '-support').val();
	param['event_log_category_id'] = $(jid + '-eventtype').val();

	var status = ($('input[name="eventStatus"]:checked').val() === "true");
	param['is_autoclose'] = status;

	if(id){
		method = 'PUT';
		param['id'] = id;
	}

	//Request Service to Add or Edit data.
	apiService.SendRequest(method, evts.service_subevent, param, function(data, status, jqxhr){
		if(status == 'success'){
			apiService.SendRequest('GET', evts.service_subevent,{}, evts.previewDataTables)
			bootbox.alert({
				message: evts.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: evts.translator['btn_close']
					}
				}
			});
		}else{
			bootbox.alert({
				message: evts.translator['msg_save_unsuc'],
				buttons: {
					ok: {
						label: evts.translator['btn_close']
					}
				}
			});
		}
	},
	function(jqXHR, textStatus, errorThrown){
		//validate duplicate code.
		if(jqXHR.responseText){
			var responseText = jqXHR.responseText;
			if(responseText.search("duplicate")){
				bootbox.dialog({
					message : '<PRE>' + evts.translator['msg_duplicate_eventcode'] + '</PRE>',
					title : evts.translator['msg_title_error'],
					buttons : {
						danger : {
							label : apiService.transMessage(evts.translator['btn_close']),
							className : 'btn-danger',
							callback : function() {
							}
						}
					}
				});
			}
		}else{
			apiService.cbServiceAjaxError(evts.service_subevent, jqXHR, textStatus, errorThrown);
		}
	})

	$('#dlgEditEventsubtype').modal('hide');
}
