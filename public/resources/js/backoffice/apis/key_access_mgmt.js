var srvData = {}; //initial data
var dlg_id = '#dlgEditkeyaccessmgmt'; //id form input data
var obj_data; // Json data from service key_access
var param = {}; // Json parameter to send request service

/**
* prepare data.
*
* @param {json} translator Text for use on page
*
* @return text
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator	= translator //Text for label and message on java
	self.service_key_access = 'thaiwater30/backoffice/api/key_access'; //service key access
	self.service_regenerate_key = 'thaiwater30/backoffice/api/gen_key'; //service regenerate key access
	self.service_delete_key = 'thaiwater30/backoffice/api/del_key'; //service delete key access
	// self.service = 'dataimport/rdl/node0/agency'; //service agency
	self.service = 'thaiwater30/backoffice/api/agency'; //service agency

	/* Setting data table */
	self.keyTableId = 'tbl-key-access-mgmt'; //id table element
	ctrl = $('#' + self.keyTableId); //table element
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> Key Access',
			action : self.editKeyAccessmgmt
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  srvData.renderColumnAcount,
		},
		{
			data :  srvData.renderColumCallbackUrl,
		},
		{
			data :  srvData.renderColumRequestOrigin,
		},
		{
			data :  srvData.renderColumAgentType,
		},
    {
      data :  srvData.renderColumKeyAccess,
    },
		{
			data : srvData.renderToolButtonsRegenerate,
			orderable : false,
			searchable : false,
		},
		{
			data : srvData.renderToolButtons,
			orderable : false,
			searchable : false,
		}
   ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : ''
	})

	/* Generate order number */
	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	ctrl.on('click', '.btn-edit', self.editKeyAccessmgmt);
	ctrl.on('click', '.btn-delete', self.deleteKeyAccessmgmt);
	ctrl.on('click', '.btn-genkey',self.generateKeyAccess);
	ctrl.on('click', '.btn-deletekey',self.deleteKeyAccess);

	/*  Event button save new  or edited department */
	$('#dlgEditkeyaccessmgmt-save-btn').on('click', function(e) {
		if (self.saveKeyaccess(dlg_id)) {
			$(dlg_id).modal('hide')
		}
	});

	$(dlg_id+'-account').removeAttr('disabled');

	// Get data from service to push on data table.
	apiService.SendRequest('GET', self.service_key_access,{},srvData.previewDataTables);
	// Get data from service to generate option on agency type drop down list.
	apiService.GetCachedRequest(self.service_key_access,{},srvData.gen_inputAgentType);
	// Get data from service to generate option on permission realm drop down list.
	apiService.GetCachedRequest(self.service_key_access,{},srvData.gen_inputPermissiotnRealm);
}


/**
	* put data on data table
	*
	* @param {json} data Json data from service.
*/
srvData.previewDataTables = function(data){
	var a = []; //data to put on table
	var self = srvData; //initial data
	var key_access = apiService.getFieldValue(data,'data.key_access.data'); //data key access
	var data_key = apiService.getFieldValue(data,'data.key_access'); //key access
	obj_data = data; //get data apis

	if ( key_access == null || data_key == null ) {
			return
	}

	for(var i = 0; i<data.length; i++){
		a.push(key_access[i]);
	}

	self.dataTable.clear();
	if ( JH.GetJsonValue(data , "result") != "OK"){ return false; }
	self.dataTable.rows.add( JH.GetJsonValue(data_key, "data") );
	self.dataTable.draw();

}


/**
	* Generate new key access.
	*
*/
srvData.generateKeyAccess = function(){
	var self  = srvData; //initial data
	var row = $(this).attr('data-row'); //row number
	var key_access = obj_data['data']['key_access']['data'][row]['key_access']; //key access
	var s = self.translator['msg_gen_key_con'].replace('%s',key_access); //message confirm delete

	param['id'] = obj_data['data']['key_access']['data'][row]['id'];

	// Dialog box to comfirm generate key.
	bootbox.confirm({
		message: s,
    reorder: true,
		buttons: {
			confirm: {
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
				apiService.SendRequest('PUT',self.service_regenerate_key,param,function(data, status, jqxhr){
					if(data.data !== null){
						var json_data = data;
						apiService.SendRequest('POST', self.service, json_data, function(data, status, jqxhr){
							if(data.result !== "OK"){
								return false
							}
						});
					}

					apiService.SendRequest('GET', self.service_key_access, {}, srvData.previewDataTables)
					if (data["result"] == "NO"){
						bootbox.alert({
					    message: self.translator['msg_cannot_to_generate_key'],
					    buttons: {
					      ok: {
					        label: self.translator['btn_close']
					      }
					    }
					  });
						return false;
					}
					bootbox.alert({
						message: self.translator['msg_generate_key_success'],
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
	* Delete only key access on data table.
*/
srvData.deleteKeyAccess = function(){
	var self = srvData; //initial data
	var row = $(this).attr('data-row'); //row number
	var key_access = obj_data['data']['key_access']['data'][row]['key_access']; //key access
	var s = self.translator['msg_del_key_con'].replace('%s',key_access); //message confirm gennerate key access

	param['id'] = obj_data['data']['key_access']['data'][row]['id'];

	// Dialog box to confirm delete key access.
	bootbox.confirm({
		message: s,
    reorder: true,
		buttons: {
			confirm: {
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
				apiService.SendRequest("PUT", self.service_delete_key, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', self.service_key_access, {}, srvData.previewDataTables)
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
	* put data on colum callback url.
	*
	* @param {json} row_data Json data each row on data table
	*
	* @return {text} acount
*/
srvData.renderColumnAcount = function(row){
	return JH.GetJsonValue(row,'account')
}


/**
	* put data on colum callback url.
	*
	* @param {json} row_data Json data each row on data table
	*
	* @return {text} callback_url
*/
srvData.renderColumCallbackUrl = function(row_data){
	if(row_data["callback_url"]){
		return row_data["callback_url"]
	}
	return ''
}


/**
	* put data on colum request origin.
	*
	* @param {json} row_data Json data each row on data table.
	*
	* @return {text} request_origin
*/
srvData.renderColumRequestOrigin = function(row_data){
	if(row_data["request_origin"]){
		return row_data["request_origin"]
	}
	return ''
}

/**
	* put data on colum agent type.
	*
	* @param {json} row_data Json data each row on data table.
	*
	* @return {text} agent_type
*/
srvData.renderColumAgentType = function(row_data){
	if(row_data["agent_type"]['text']){
		return row_data["agent_type"]['text']
	}
	return ''
}

/**
	* put data on colum key access.
	*
	* @param {json} row_data Json data each row on data table.
	*
	* @return {text} key_access
*/
srvData.renderColumKeyAccess = function(row_data){
	if(row_data["key_access"]){
		return row_data["key_access"]
	}
	return ''
}

/**
	* Generate option for agent type drop down list.
	*
	* @param {json} agent_type Json data received form serevice key_access.
*/
srvData.gen_inputAgentType = function(agent_type){
	var input_agentype = document.getElementById('dlgEditkeyaccessmgmt-agent'); //agent type element
	var data = apiService.getFieldValue(agent_type,'data.agent.data'); //data agent

	if ( data == null ) {
			return
	}

	/* sort option list by alphabet */
	JH.Sort(data,"text",false , function(str){
			return str.toLowerCase();
	})

	for(var i=0; i<data.length; i++){
		var gen_option = document.createElement('option'); //create option element
		var text_option = data[i]['text']; //option name
		var value_option = data[i]['value']; //option value

		gen_option.text = text_option;
		gen_option.value = value_option;
		input_agentype.add(gen_option);
	}
}

/**
	* Generate option for permission realm drop down list.
	*
	* @param {json} perrealm Json data received form serevice key_access.
*/
srvData.gen_inputPermissiotnRealm = function(perrealm){
	var data = apiService.getFieldValue(perrealm,'data.realm.data'); //data realm
	var input_perrealm = document.getElementById('dlgEditkeyaccessmgmt-permission'); //permission element

	if ( data == null ) {
			return
	}

	/* sort option list by alphabet */
	JH.Sort(data,"text",false , function(str){
			return str.toLowerCase();
	})


	for(var i=0; i<data.length; i++){
		var gen_option = document.createElement('option'); //create option element
		var text_option = data[i]['text']; //option name
		var value_option = data[i]['value']; //option value

		gen_option.text = text_option;
		gen_option.value = value_option;
		input_perrealm.add(gen_option);
	}
}

/**
	* Edit data key access.
	*
*/
srvData.editKeyAccessmgmt = function() {
	var self = srvData //initial data
	var row = $(this).attr('data-row'); //row number
	$('.filled').remove();
	srvData.showEditKeyAccessmgmt(row)
}

/**
	* Display dialog box add or edit data key access.
	*
	* @param {json} row Row number on data table.
*/
srvData.showEditKeyAccessmgmt = function(row){
	var self = srvData //initial data
	var dlg_id = '#dlgEditkeyaccessmgmt' //id
	var frm = $(dlg_id + '-form'); //get element input form key access
	var frm_account = $(dlg_id + '-account'); //get element accound
	var frm_callurl = $(dlg_id + '-callbackurl'); // get element callbackurl
	var frm_requestorigin  = $(dlg_id + '-requestorigin'); // get element requestorigin
	var frm_agent = $(dlg_id + '-agent'); // get element agent
	var frm_permission = $(dlg_id + '-permission'); // get element permission
	var data_key = obj_data['data']['key_access']['data'][row]; //data key access
	$("#input-reponse").hide();

	frm.parsley().reset();

	if (row === undefined) {
		document.getElementById("dlgEditkeyaccessmgmt-form").reset();
		$(dlg_id + '-title').text(self.translator['msg_add_key_access']);
		$(dlg_id + '-id').val('');
		$(dlg_id+'-account').removeAttr('disabled');
	} else {
		$(dlg_id+'-account').attr('disabled',true);
		$(dlg_id + '-title').text(self.translator['msg_edit_key_access']);
		$('#key_access').val(data_key['key_access']);
		$(dlg_id + '-id').val(data_key['id']);
		$(dlg_id + '-account').val(data_key['account']);
		$(dlg_id + '-callbackurl').val(data_key['callback_url']);
		$(dlg_id + '-requestorigin').val(data_key['request_origin']);
		$(dlg_id + '-agent').val(data_key['agent_type']['value']);
		$(dlg_id + '-permission').val(data_key['permission_realm']['value']);
	}

	$(dlg_id).modal({
		backdrop : 'static'
	})
}

/**
	* Delete data key access.
	*
*/
srvData.deleteKeyAccessmgmt	=	function() {
	var self = srvData; //initial data
	var row = $(this).attr('data-row'); //row number
	var data = {}; //prepare data
	var data_key = obj_data['data']['key_access']['data'][row]; //prepare data key access

	$(dlg_id + '-id').val(data_key["id"])
	var id = parseInt($(dlg_id + '-id').val()); //get id of data key access
	param['id']=id;

	// Dialog box confrim to  delete
	var key_access = data_key['key_access']; //key access
	var s = self.translator['msg_delete_con'].replace('%s',key_access); //message confirm delete key access
	bootbox.confirm({
		message: s,
    reorder: true,
		buttons: {
			confirm: {
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
				apiService.SendRequest("DELETE", self.service_key_access, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', self.service_key_access, {}, srvData.previewDataTables)
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
	* Received data from form and send with service to insert on database.
	*
*/
srvData.saveKeyaccess = function() {
	var self = srvData //initial data
	var param = {}; //prepare parameter
	var frm = $(dlg_id + '-form'); //element form save data

	/* validate data is null */
	frm.parsley().validate();
	if (!frm.parsley().isValid()) {
		return false
	}

	var id = $(dlg_id + '-id').val(); //get id data key access
	var method = "POST" //method
	var success_msg	=	srvData.translator['msg_save_suc']; //message save success
	var srv	=	self.service_key_access //service url

	param['account'] = $(dlg_id + '-account').val();
	param['callback_url'] = $(dlg_id + '-callbackurl').val();
	param['request_origin'] = $(dlg_id + '-requestorigin').val();
	param['agent_type'] = parseInt($(dlg_id + '-agent').val());
	param['permission_realm'] = parseInt($(dlg_id + '-permission').val());

	if(id !== ''  ){
		param['id'] = parseInt(id);
		param['key_access'] = $('#key_access').val();
		method	=	"PUT"
		success_msg	=	srvData.translator['msg_save_suc'];
	}

  apiService.SendRequest(method, srv, param, function(data, status, jqxhr){
		if(data.data !== null){
			var json_data = data.data;
			apiService.SendRequest('POST', self.service, json_data, function(data, status, jqxhr){
				if(data.result !== "OK"){
					return false
				}
			});
		}
		apiService.SendRequest('GET', self.service_key_access, {}, srvData.previewDataTables)
		bootbox.alert(self.translator['msg_save_suc'])
	},
	function(jqXHR, textStatus, errorThrown){
		//validate duplicate code.
		if(jqXHR.responseText){
			var responseText = jqXHR.responseText;
			if(responseText.search("duplicate")){
				bootbox.dialog({
					message : '<PRE>' + self.translator['msg_duplicate_username'] + '</PRE>',
					title : self.translator['msg_title_error'],
					buttons : {
						danger : {
							label : apiService.transMessage(self.translator['btn_close']),
							className : 'btn-danger',
							callback : function() {
							}
						}
					}
				});
			}
		}else{
			apiService.cbServiceAjaxError(self.service_subevent, jqXHR, textStatus, errorThrown)
		}
	});
	return true
}

/**
	* Create icon for regenerate  key access.
	*
	* @param {json} row Json data each column on data table.
	* @param {json} type
	* @param {json} set
	* @param {json} meta row and column on data table
	*
	* @return {text}
*/
srvData.renderToolButtonsRegenerate = function(row, type, set, meta) {
	var s = '<i class="fa fa-refresh btn btn-genkey" data-row="'+meta.row+'" title="Regenerate key accesss"></i><i class="fa fa-minus-circle btn btn-deletekey" data-row="'+meta.row+'" title="Delete key accesss"></i>'
	return s
}

/**
	* Create icon for edit and delete data on datatable.
	*
	* @param {json} row Json data each column on data table.
	* @param {json} type
	* @param {json} set
	* @param {json} meta row and column on data table
	*
	* @return {text}
*/
srvData.renderToolButtons = function(row, type, set, meta) {
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + srvData.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
	+ srvData.translator['btn_delete'] + '"></i>'

	return s
}
