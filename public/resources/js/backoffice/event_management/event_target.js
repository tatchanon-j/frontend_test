var srvData = {};//Initial data
var jid ="#dlgEditEventtarget"; //prefix id of element in form

/**
* Initial page load.
*
* @param {json} translator Text for label and message on java script
*/
srvData.init = function(translator) {
	var self = srvData //Initial page load
	self.translator = translator //Text for label and message on java script
	self.service_sink_target = 'thaiwater30/backoffice/event_management/sink_target'; //url for call service sink target
	self.service_sink_target_option = 'thaiwater30/backoffice/event_management/sink_target_option'; //url for call service sink target to generate option

	/* Display datatable */
	self.metadataTableId = 'tbl-eventtarget'; //datatable id
	ctrl = $('#' + self.metadataTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + srvData.translator['btn_event_target'] ,
			action : srvData.editEventTarget
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : self.renderColumCondition,
		}, {
			data : self.renderColumEventMethod,
		}, {
			data : self.renderColumPermissionGroup,
		},{
			data : self.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
	})


	/**
	* Genalate order number on datatable
	*
	*/
	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	/**
	* Event button save new  or edited department.
	*
	* @param {json} e
	*
	*/
	$('#dlgEditEventtarget-save-btn').on('click',self.saveEventtarget);

	/* Event on click preview button */
	$( "#btn_preview" ).click(function() {
		self.btnPreviewClick();
	});

	/* eting general for dropdown multiselect */
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : self.translator['selected_all'],
			allSelectedText : self.translator['selected_all'],
			nonSelectedText : self.translator['msg_filter_required'],
			filterPlaceholder: self.translator['search']
		})
	})

	$('.select-search').select2();

	/* Event button edit data o datatable */
	ctrl.on('click', 'i.btn-edit', self.editEventTarget);
	/* Event button edit data o datatable */
	ctrl.on('click', 'i.btn-delete', self.deleteEventTarget);

	/* Get the data to add on datatable */
	apiService.SendRequest('GET', self.service_sink_target,{}, self.disPlayTable);
	/* Get the data to generate option. */
	apiService.SendRequest('GET', self.service_sink_target_option, {}, function(rs){
		srvData.genOptionCondition(rs);
		srvData.genOptionMethod(rs);
		srvData.genOPtionPermissionGroup(rs);
		srvData.genOPtionPermissionGroupSingle(rs);
	})
}

/**
* put the data to generate rows on data table.
*
*@param {json} target the data to put and generate rows on data table.
*/
srvData.disPlayTable = function(target){
	srvData.dataTable.clear();
	if( JH.GetJsonValue(target , "result") != "OK"){ return false; }
	srvData.dataTable.rows.add( JH.GetJsonValue(target , "data") );
	srvData.dataTable.draw();
}

/**
* put data on the condition column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The data for display on the condition column.
*/
srvData.renderColumCondition = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'condition_name');
}

/**
* put data on the method column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The data for display on the method column.
*/
srvData.renderColumEventMethod = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'method_name');
}

/**
* put data on the users group column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The data for display on the users group column.
*/
srvData.renderColumPermissionGroup = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'group_name');
}

/**
* put data on the column edit and delete.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {element} The html element.
*/
srvData.renderToolButtons = function(row, type, set, meta) {
	var self = srvData
	var s = '<i class="btn btn-edit" data-key="'+ row.id +'" title="' + self.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete"  data-key="'+ row.id +'" name="'+row.condition_name+'" title="'
	+ self.translator['btn_delete'] + '"></i>';

	return s;
}

/**
* Get The data id of data to edit
* and reset form and validate form.
*
*/
srvData.editEventTarget = function(){
	var self = srvData; //Initail page load
	var key = $(this).attr('data-key'); //event targrt id
	var frm = $(jid + '-form'); //element form

	$(jid + '-form')[0].reset(); //reset form.

	/* reset validate in form. */
	frm.parsley().reset();
	$('.parsley-errors-list').remove();

	self.showEditEventtarget(key);
}


/**
* Display modal to add or edit data.
*
*@param {row} key The data id of data.
*/
srvData.showEditEventtarget = function(key){
	var self = srvData; //Initial page load
	var srv = self.service_sink_target + '/' + key; //url for service event target
	if(key === undefined){
		$(jid + '-title').text(self.translator['add_event_target']);
		$(jid + '-id').val('');

		$('.pergroup-multi').removeAttr('hidden');
		$(jid + '-pergroup').attr('required','true').attr('data-parsley-error-message',srvData.translator['msg_err_data_null']);
		$('.pergroup-single').attr('hidden', 'true');
		$(jid+ '-pergroup-single').removeAttr('required');

		$(jid + '-pergroup').multiselect('rebuild');
		$(jid + '-pergroup').multiselect('updateButtonText');

	}else{

		$('.pergroup-multi').attr('hidden','true');
		$(jid + '-pergroup-single').attr('required','true').attr('data-parsley-error-message',srvData.translator['msg_err_data_null']);
		$('.pergroup-single').removeAttr('hidden', 'true');
		$(jid+ '-pergroup').removeAttr('required');

		$(jid + '-title').text(self.translator['edit_event_target']);
		apiService.SendRequest('GET', srv, {}, function(op){
			$(jid + '-id').val(key);
			$(jid + '-condition').val(op['data']['condition_id']);
			$(jid + '-method').val(op['data']['method_id']);
			$(jid + '-pergroup-single').val(op['data']['group_id']).trigger('change');
		})
	}

	$('#dlgEditEventtarget').modal({
		backdrop : 'static',
	});
}


/**
* Generate option list condition.
*
*@param {row} op The data to generate option list.
*/
srvData.genOptionCondition = function(op){

	var genOptionCondition = document.getElementById('dlgEditEventtarget-condition'); //element condition
	var i; //loop condition
	var condition = op['data']['condition_list']; //condition data

	if(typeof condition === undefined || condition == null){return false}
	//Sort the data order by alphabet on dropdown list.
	JH.Sort(condition,"text",false , function(str){
		return str.toLowerCase();
	})
	for(i = 0; i < condition.length; i++){
		var gen_option = document.createElement('option');
		var txt_option = condition[i]['text']; //condition name
		var val_option = condition[i]['value']; //condition id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		genOptionCondition.add(gen_option);
	}
}

/**
* Generate option list method.
*
*@param {row} op The data to generate option list.
*/
srvData.genOptionMethod = function(op){
	var genOptionMethod = document.getElementById('dlgEditEventtarget-method'); //element method
	var i; //loop condition

	//Sort the data order by alphabet on dropdown list.
	var method_list = apiService.getFieldValue(op,'data.method_list') //data method list
	if ( method_list == null ) {
		return
	}
	JH.Sort(method_list,"text",false , function(str){
		return str.toLowerCase();
	})

	for(i = 0; i < method_list.length; i++){
		var gen_option = document.createElement('option');
		var txt_option = method_list[i]['text']; //method name
		var val_option = method_list[i]['value']; //method id

		gen_option.text = txt_option;
		gen_option.value = val_option;
		genOptionMethod.add(gen_option);
	}

}

/**
* Generate option list permission group on edit data form.
*
*@param {row} op The data to generate option list.
*/
srvData.genOPtionPermissionGroup = function(op){
	var genOptionPerGroup = document.getElementById('dlgEditEventtarget-pergroup'); //element user group
	var i;
	//var permission_group_list = op['data']['permission_group_list'];
	var permission_group_list = apiService.getFieldValue(op,'data.permission_group_list'); //data user group
	if ( permission_group_list == null ) {
		return
	}
	//Sort the data order by alphabet on dropdown list.
	JH.Sort(permission_group_list,"text",false , function(str){
		str = str.trim();
		return str.toLowerCase();
	})

	for(i = 0; i < permission_group_list.length; i++){
		var gen_option = document.createElement('option');
		var txt_option = permission_group_list[i]['text'];
		var val_option = permission_group_list[i]['value'];

		gen_option.text = txt_option;
		gen_option.value = val_option;
		genOptionPerGroup.add(gen_option);
	}

	//Setting  multi select dropdown after generate option list.
	$(genOptionPerGroup).multiselect({includeSelectAllOption: true });
	$(genOptionPerGroup).multiselect('rebuild');
	$(genOptionPerGroup).multiselect('selectAll',true);
	$(genOptionPerGroup).multiselect('updateButtonText');

}

/**
* Generate option list permission group on add data form.
*
*@param {row} op The data to generate option list.
*/
srvData.genOPtionPermissionGroupSingle = function(op){
	var genOptionPerGroup = document.getElementById('dlgEditEventtarget-pergroup-single'); //element user group
	var i; //loop condition
	var permission_group_list = apiService.getFieldValue(op,'data.permission_group_list'); //yser group data
	if ( permission_group_list == null ) {
		return
	}
	//Sort the data order by alphabet on dropdown list.
	JH.Sort(permission_group_list,"text",false , function(str){
		str = str.trim();
		return str.toLowerCase();
	})

	for(i = 0; i < permission_group_list.length; i++){
		var gen_option = document.createElement('option');
		var txt_option = permission_group_list[i]['text'];
		var val_option = permission_group_list[i]['value'];

		gen_option.text = txt_option;
		gen_option.value = val_option;
		genOptionPerGroup.add(gen_option);
	}

}

/**
* Delete data on data table.
*
*/
srvData.deleteEventTarget = function(){
	self = srvData; //Initial page load
	var name_con = $(this).attr('name'); //event target name
	var tar_id = parseInt($(this).attr('data-key')); //event target id
	var s = self.translator['msg_delete_con'].replace('%s',name_con); //message confirm delete

	var param = {
		id : tar_id
	}

	bootbox.confirm({
		message: s,
		reorder:true,
		buttons:{
			confirm:{
				label:'<i class="fa fa-check"></i> ' +  self.translator['btn_confirm'],
				className:'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  self.translator['btn_cancel'],
				className:'btn-danger'
			}
		},
		callback:function(result){
			if(result){
				apiService.SendRequest("DELETE", self.service_sink_target, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', self.service_sink_target, {}, srvData.disPlayTable)
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
				return true;
			}
		}
	})
}

/**
* Save data in form.
*
*/
srvData.saveEventtarget = function(){
	var self = srvData; //initial page load
	var param = {}; //parameter save data
	var method = 'POST'; //service method
	var id = parseInt($(jid + '-id').val()); //event target id
	var frm = $(jid + '-form'); //element form

	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		return false;
	}

	param = {
		condition_id : parseInt($(jid + '-condition').val()),
		method_id : parseInt($(jid + '-method').val()),
		lang : 'th'
	}


	if(id){
		method = 'PUT'
		param['id'] = id;
		param['group_id'] = parseInt($(jid + '-pergroup-single').val());
	}else{
		var pergroup = $(jid + '-pergroup').val().join()
		pergroup = JSON.parse("[" + pergroup + "]");
		param['group_id'] = pergroup;
	}

	apiService.SendRequest(method, self.service_sink_target, param, function(data, status, jqxhr){
		apiService.SendRequest('GET', self.service_sink_target, {}, self.disPlayTable)
		bootbox.alert({
			message: self.translator['msg_save_suc'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		});

		return true;
	});

	$(jid).modal('hide');
}
