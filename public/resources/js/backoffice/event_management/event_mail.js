var srvData = {}; //initial data
var jid = '#dlgEventmail'; //Prefix id of element in form

/**
* Initial page load.
*
* @param {json} translator Text for use on page.
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on javascript
	self.service_email_template = "thaiwater30/backoffice/event_management/email_template"; //service email_template

	apiService.SendRequest('GET', self.service_email_template, {}, self.displayDataTable);

	//*data table setting
	self.metadataTableId = 'tbl-eventmail'; //element id of data table
	ctrl = $('#' + self.metadataTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + self.translator['event_mail_page_name'] ,
			action : srvData.editEventMailtemplate
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : srvData.renderColumName,
		},{
			data : srvData.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ]
	})


	// genelate order number on data table.
	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	// Event button edit data o datatable.
	ctrl.on('click', 'i.btn-edit', self.editEventMailtemplate);
	ctrl.on('click', 'i.btn-delete', self.deleteEventMailtemplate);
	$(jid+'-save-btn').on('click', self.saveEventMailtemplate);

}

/**
* Put data to rows on data table.
*
* @param {json} mt the data to generate rows on data table.
*/
srvData.displayDataTable = function(mt){
	// srvData.data_mailtemplate = mt['data']
	srvData.dataTable.clear();
	if( JH.GetJsonValue(mt , "result") != "OK"){ return false; }
	srvData.dataTable.rows.add( JH.GetJsonValue(mt , "data") );
	srvData.dataTable.draw();
}

/**
* put data on codition colu,n.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The name data for display on name column.
*/
srvData.renderColumName = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'name');
}

/**
* Create icon for edit and delete data on datatable.
*
* @param {json} row The data on data table
* @param {json} type
* @param {json} set
* @param {json} meta Colum and row id
*
*@return {json} The element HTML of buttons.
*/
srvData.renderToolButtons = function(row, type, set, meta) {
	var self = srvData;
	var s = '<i class="btn btn-edit" data-key="'+ row.id +'" title="' + self.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete" name="'+row.name+'" data-key="'+ row.id +'" title="'
	+ self.translator['btn_delete'] + '"></i>';

	return s;
}

/**
* Get id data for edit.
*
*/
srvData.editEventMailtemplate = function(){
	var key = $(this).attr('data-key'); //Email template id
	srvData.showEditMailtemplate(key);
}

/**
* Display modal add or edit data.
*
* @param {text} key The id for identify on service url to get
*                   the dataset to display on edit form.
*/
srvData.showEditMailtemplate = function(key){
	var frm = $(jid + '-form'); //Element form
	var srv = "thaiwater30/backoffice/event_management/email_template"; //service email template

	frm.parsley().reset();
	$('.parsley-errors-list').remove();

	if(key == undefined){
		$(jid + '-title').text(srvData.translator['add_event_mail']);
		$(jid + '-id').val('');
		$(jid + '-form')[0].reset();

	}else{
		$(jid + '-title').text(srvData.translator['edit_event_mail']);
		srv+='/'+key;
		apiService.SendRequest('GET', srv, {}, function(mail){
			$(jid + '-id').val(mail['data']['id']);
			$(jid + '-name').val(mail['data']['name']);
			$(jid + '-subject').val(mail['data']['message_subject']['th']);
			$(jid + '-body').val(mail['data']['message_body']['th']);
		});
	}

	$('#dlgEventmail').modal({
		backdrop : 'static'
	});
}

/**
* Save data in form.
*
*/
srvData.saveEventMailtemplate = function(){
	var self= srvData; //initial data
	var param = {}; //Parameter to send to web service
	var json_subject = {}; //subject email data
	var json_body = {}; //body email data
	var frm = $(jid + '-form'); //element form
	var evtpye = self.eventtype; //event type

	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		return false;
	}

	var subject = $(jid + '-subject').val(); //Subject email
	var body = $(jid + '-body').val(); //Body email

	json_subject = {
		th : subject
	}

	json_body = {
		th : body
	}

	param = {
		name : $(jid + '-name').val(),
		message_subject : json_subject,
		message_body : json_body
	}

	var id = $(jid + '-id').val(); //event mail id
	var method = 'POST'; //service method
	if(id !== ''){
		method = 'PUT';
		param['id'] = parseInt(id);
	}

	apiService.SendRequest(method, self.service_email_template, param, function(data, status, jqxhr){
		apiService.SendRequest('GET', self.service_email_template,{}, self.displayDataTable)
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

/**
* delete data in data table.
*
*/
srvData.deleteEventMailtemplate = function(){
	var self = srvData;
	var key = $(this).attr('data-key'); //event mail template id
	var name = $(this).attr('name'); //event mail template name

	var s = self.translator['msg_delete_con'].replace('%s',name); //message confirm delete
	var param = {
		id : parseInt(key)
	}

	bootbox.confirm({
		message:s,
		reorder: true,
		buttons:{
			confirm:{
				label: '<i class="fa fa-check"></i> ' +  self.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  self.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				apiService.SendRequest('DELETE', self.service_email_template, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', self.service_email_template, {}, srvData.displayDataTable)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: self.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: self.translator['btn_close']
								}
							}
						})
						return false
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
	});
}
