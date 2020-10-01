var srvData = {}; //initial data
var jid = '#dlgSinkCondition'; //Prefix id of element in form

/**
* Initial page load.
*
* @param {json} translator Text for label and message on java script
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service_sink_condition = "thaiwater30/backoffice/event_management/sink_condition"; //url for call service sink_condition
	self.service_sink_condition_option = "thaiwater30/backoffice/event_management/sink_condition_option"; //url for call service sink_condition_option

	//Get the data to display on data taable.
	apiService.SendRequest('GET', self.service_sink_condition, {}, self.displayDataTable)
	//Get the data to generate option.
	apiService.SendRequest('GET', self.service_sink_condition_option, {}, function(rs){
		self.genOptionEventType(rs);
		// self.genOptionEventSubtype(rs);
		self.genOptionSinkTemplate(rs);
		srvData.ra_data = rs; //Data fo generate option
	})

	/* data table setting */
	self.metadataTableId = 'tbl-sink-condition'; //datatable id
	ctrl = $('#' + self.metadataTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + self.translator['btn_add_sink_condition'] ,
			action : srvData.editSinkCondition
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : srvData.renderColumName,
		}, {
			data : srvData.renderColumEventType,
		}, {
			data : srvData.renderColumEvetSubtype,
		}, {
			data : srvData.renderColumEventTemplate,
		},{
			data : srvData.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ]
	})


	/**
	* Genalate order number on data table.
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

	/* Event on page. */
	ctrl.on('click', 'i.btn-edit', self.editSinkCondition);
	ctrl.on('click', 'i.btn-delete', self.deleteSinkCondition);
	$(jid + '-eventType').on('change', self.onChangeFilteEvenType);
	$(jid+'-save-btn').on('click', self.saveSinkCondition);
}

/**
* Put data to rows on data table.
*
* @param {json} rs the data to generate rows on data table.
*/
srvData.displayDataTable = function(rs){
	srvData.dataTable.clear();
	if( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
	srvData.dataTable.rows.add( JH.GetJsonValue(rs , "data") );
	srvData.dataTable.draw();
}

/**
* put data on name column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The name data for display on name column.
*/
srvData.renderColumName = function(row){
	return JH.GetJsonValue(row, 'name');
}

/**
* put data on event type column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The name data for display on event type column.
*/
srvData.renderColumEventType = function(row){
	return JH.GetJsonLangValue(row,'event_log_type');
}

/**
* put data on event subtype column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The name data for display on event subtype column.
*/
srvData.renderColumEvetSubtype = function(row){
	return JH.GetJsonLangValue(row,'event_log_subtype');
}

/**
* put data on event log column.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The name data for display on template column.
*/
srvData.renderColumEventTemplate = function(row){
	return JH.GetJsonValue(row, 'event_log_sink_template');
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
	var self = srvData
	var s = '<i class="btn btn-edit" data-key="'+ row.id +'" title="' + self.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete" name="'+row.name+'" data-key="'+ row.id +'" title="'
	+ self.translator['btn_delete'] + '"></i>';

	return s;
}

/**
* Get id data for edit.
*
*/
srvData.editSinkCondition = function(){
	var key = $(this).attr('data-key') // id of data sink condition
	srvData.showEditSinkCondition(key);
}

/**
* Generate option list into event type dropdown.
*
* @param {json} et The event type data
*/
srvData.genOptionEventType = function(et){
	var option_eventtype = document.getElementById('dlgSinkCondition-eventType'); //element event type
	var event_log_type = apiService.getFieldValue(et,'data.event_log_type'); //event log type data
	if ( event_log_type == null ) {
		return
	}

	//Sort option list order by alphabet.
	JH.Sort(event_log_type,"event_log_type",false , function(str){
		if(str['text']['th']){
			return str['text']['th'].toLowerCase();
		}else if(str['text']['en']){
			return str['text']['en'].toLowerCase();
		}else{
			return str['text']['jp'].toLowerCase();
		}
	});

	for(var i=0; i<event_log_type.length; i++){
		var gen_option = document.createElement('option'); //create element option
		var elt = event_log_type[i]['event_log_type']; //data event log type
		var gen_txt = JH.GetLangValue(elt.text); //name event log type
		var gen_val = elt.value; //id event log type

		gen_option.text = gen_txt;
		gen_option.value = gen_val;
		option_eventtype.add(gen_option)
	}
}

/**
* Generate option list into sink template dropdown.
*
* @param {json} et The data on data table
*/
srvData.genOptionSinkTemplate = function(et){
	var option_sinkTemplate = document.getElementById('dlgSinkCondition-sinkTemplate'); //element condition sink template
	var event_log_sink_template = et['data']['event_log_sink_template']; //event log sink template data

	JH.Sort(event_log_sink_template,"text",false , function(str){
		return str.toLowerCase();
	});

	for(var i=0; i<event_log_sink_template.length; i++){
		var gen_option = document.createElement('option') //create element otion
		var gen_txt = JH.GetJsonValue(event_log_sink_template[i],"text"); //event log sink template name
		var gen_val = event_log_sink_template[i].value; //event log sink template id

		gen_option.text = gen_txt;
		gen_option.value = gen_val;
		option_sinkTemplate.add(gen_option);
	}
}

/**
* Genearate new option when data on filter event type change.
*
*/
srvData.onChangeFilteEvenType = function(){
	//remove old option list, but not default option list.
	$('#dlgSinkCondition-eventSubtype > option').not(".default").remove()
	srvData.genOptionEventSubtype(srvData.ra_data);
	// apiService.SendRequest(srvData.service_sink_condition_option, {}, srvData.genOptionEventSubtype)
}

/**
* Generate the new option list, which this new list must relate with the data to selected on event type dropdown.
*
* @param {json} mt The data to generate option list.
*/
srvData.genOptionEventSubtype = function(mt){
	var option_subeventtype = document.getElementById('dlgSinkCondition-eventSubtype'); //element condition event-subtype
	var op_eventtype = $(jid + '-eventType').val(); //event type id
	var event_log = mt['data']['event_log_type']; //event log type data
	if(op_eventtype != ''){
		$(jid+'-eventSubtype > otion').not('default').remove();
		$('#dlgSinkCondition-eventSubtype').removeAttr('disabled');

		for(var i=0; i<event_log.length; i++){
			var event_type = event_log[i]['event_log_type']['value'] //event log type value
			event_type = event_type.toString();

			if( event_type == op_eventtype){
				var subtype = event_log[i]['event_log_subtype'] //subtype data

				//Sort option list order by alphabet.
				JH.Sort(subtype,"text",false , function(str){
					if(str['th']){
						return  str['th'].toLowerCase();
					}else if(str['en']){
						return  str['en'].toLowerCase();
					}else if(str['jp']){
						return  str['jp'].toLowerCase();
					}else{
						return false;
					}
				});

				for(var j=0; j<subtype.length; j++){
					var gen_option = document.createElement('option'); //create element option
					var txt = subtype[j]; //subtype data
					var txt_option = JH.GetJsonLangValue(txt,'text'); //subtype name
					var val_option = subtype[j]['value']; //subtype id

					gen_option.text = txt_option;
					gen_option.value = val_option;
					option_subeventtype.add(gen_option);
				}
			}
		}
	}else{
		$(jid+'-eventSubtype > otion').not('default').remove();
		$('#dlgSinkCondition-eventSubtype').attr('disabled',true);
	}
}

/**
* Display modal add pr edit the data.
*
* @param {text} key The id for identify on service url to get
*                   the dataset to display on edit form.
*/
srvData.showEditSinkCondition = function(key){
	var frm = $(jid + '-form'); //element form
	var srv = "thaiwater30/backoffice/event_management/sink_condition/"; //url call service sink condition

	frm.parsley().reset();
	$('.parsley-errors-list').remove();

	if(key == undefined){
		$(jid + '-id').val('');
		$(jid + '-form')[0].reset();

	}else{
		$(jid + '-title').text(srvData.translator['title_edit_sinkcondition']);
		srv+=key;
		apiService.SendRequest('GET', srv, {}, function(dt){

			if(dt['data']['event_log_sink_template_id'] == 0){
				$(jid + '-sinkTemplate').val('');
			}else{
				$(jid + '-sinkTemplate').val(dt['data']['event_log_sink_template_id']);
			}
			if(dt['data']['post_start_interval']){
				var post_start_interval = dt['data']['post_start_interval']; // post start interval data
				var interval = post_start_interval.split(" "); //post start interval data without gap
				for(var i=1;i<6;i++){
					$(jid + '-sinkCron'+i).val(interval[i-1]);
				}
			}

			$(jid + '-id').val(dt['data']['id']);
			$(jid + '-name').val(dt['data']['name']);
			$(jid + '-eventType').val(dt['data']['event_log_type_id']).triggerHandler('change');
			$(jid + '-eventSubtype').val(dt['data']['event_log_subtype_id']);
		})
	}

	$(jid).modal({
		backdrop : 'static'
	});
}

/**
* Save the data in form.
*
*/
srvData.saveSinkCondition = function(){
	var self= srvData; //initial data
	var param = {}; //parameter to send to web service
	var frm = $(jid + '-form'); //element form
	var template = $(jid + '-eventType').val(); //event type id

	frm.parsley().validate()
	if(!frm.parsley().isValid()){
		return false
	}

	/* email_inteval */
	var email_inteval = $(jid + '-sinkCron1').val()
	+ ' '+ $(jid + '-sinkCron2').val()
	+ ' '+$(jid + '-sinkCron3').val()
	+ ' '+$(jid + '-sinkCron4').val()
	+ ' '+$(jid + '-sinkCron5').val()


	param = {
		name : $(jid + '-name').val(),
		event_log_type_id : parseInt($(jid + '-eventType').val()),
		event_log_subtype_id : parseInt($(jid + '-eventSubtype').val()),
		template_id : parseInt($(jid + '-sinkTemplate').val()),
		post_start_interval : email_inteval
	}

	var id = $(jid + '-id').val(); //sink condition id
	var method = 'POST'; //service method
	if(id !== ''){
		method = 'PUT'
		param['id'] = parseInt(id)
	}
	apiService.SendRequest(method, self.service_sink_condition, param, function(data, status, jqxhr){
		apiService.SendRequest('GET', self.service_sink_condition, {}, self.displayDataTable)
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
* Delete the data in data table.
*
*/
srvData.deleteSinkCondition = function(){
	var self = srvData //initial data
	var key = $(this).attr('data-key'); //dondition id
	var name = $(this).attr('name'); //condition name
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
				apiService.SendRequest('DELETE', self.service_sink_condition, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', self.service_sink_condition, {}, srvData.displayDataTable)
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
	});
}
