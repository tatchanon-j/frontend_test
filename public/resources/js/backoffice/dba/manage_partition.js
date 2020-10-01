var srvData = {}; //initial data


/**
* prepare data.
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service_partition_table = 'thaiwater30/backoffice/dba/partition_table'; //service partition table
	self.service_partition_history = 'thaiwater30/backoffice/dba/partition_history'; //service partition history
	self.service_partition = 'thaiwater30/backoffice/dba/partition'; //service partition

	/* setting event sub type table*/
	// self.metadataTableId = 'tbl-event-subtype'; //table id event subtype
	// ctrl = $('#' + self.metadataTableId) //get table element
	// self.dataTable = ctrl.DataTable({
	// 	dom : 'frlBtip',
	// 	buttons : [ {
	// 		text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> '+ self.translator["page_name_event_subtype"] ,
	// 		action : srvData.editEventSubtype
	// 	} ],
	// 	language : g_dataTablesTranslator,
	// 	columns : [ {
	// 		defaultContent : '',
	// 		orderable : false,
	// 		searchable : false,
	// 	}, {
	// 		data : '',
	// 	}, {
	// 		data : '',
	// 	}, {
	// 		data : '',
	// 	},  {
	// 		data : '',
	// 	}, {
	// 		data : '',
	// 		orderable : false,
	// 		searchable : false,
	// 	} ],
	// 	order : [ [ 1, 'asc' ] ]
	// })


	/* setting history table*/
	self.metadataTableId = 'tbl-history'; //ID table history
	ctrl = $('#' + self.metadataTableId); //table history element
	self.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			data : self.renderColumnDate
		},{
			data : self.renderColumnMonth
		}, {
			data : self.renderColumnRemark
		}, {
			data : self.renderColumnUser
		}],
		order : [ [ 0, 'desc' ] ],
	})

	/* Event button edit data o datatable */
	//ctrl.on('click', 'i.btn-edit', self.editEventSubtype)
	/* Event button edit data o datatable */
	//ctrl.on('click', 'i.btn-delete', self.deleteEventSubtype)

	$('#btn_display').on('click',self.onClickDisplay);
	$('#btn_create').on('click',self.onClickCreate);
	$('#btn_delete').on('click',self.onClickDelete);


	$('.select-search').select2(); //Add search box on select element

	/* Get data from service to add on datatable */
	apiService.SendRequest('GET', self.service_partition_table,{}, self.genFilterTable);

	self.genFilterYears()
}


/**
* generate option into filter table
*
* @param {json} tb data table
*
*/
srvData.genFilterTable = function(tb){
	var filter_table = document.getElementById('filter_table'); //filter table element
	var data_table = apiService.getFieldValue(tb,'data'); //data table

	if(data_table == null){return }

	for(var i=0; i<data_table.length; i++){
		var gen_option = document.createElement('option'); //create option element
		var txt_option = data_table[i]; //option name
		var val_option = data_table[i]; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_table.add(gen_option);
	}
}


/**
* generate option into filter years
*
*/
srvData.genFilterYears = function(){
	$('#filter_years').datepicker( {
		format: "yyyy",
		startView: 2,
		minViewMode: 2,
		maxViewMode: 2
	});
	$('#filter_years').datepicker('setDate', new Date());
	$('#filter_years').datepicker('update');
}


/**
* generate data rows on data table
*
*/
srvData.onClickDisplay = function(){
	var self = srvData //initial data
	var param = {} //prepare parameter
	var frm_table = $('#filter_table').val() //table name
	var frm_years = $('#filter_years').val() //year

	/* validate filter data is  null */
	if(frm_table == '' || frm_years == ''){
		bootbox.alert({
			message: self.translator['msg_err_require_filter'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		});
		return false
	}

	param = {
		table_name : frm_table,
		year : frm_years
	}

	apiService.SendRequest('GET', self.service_partition_history, param, function(hs){
		self.dataTable.clear()
		if( JH.GetJsonValue(hs , "result") != "OK"){ return false; }
		self.dataTable.rows.add( JH.GetJsonValue(hs , "data") );
		self.dataTable.draw()
	})
}


/**
* create partition
*
*/
srvData.onClickCreate = function(){
	var self = srvData; //initial data
	var param = {}; //prepare parameters
	var frm_table = $('#filter_table').val(); //table name
	var frm_years = $('#filter_years').val(); //year

	/* validate filter data is  null */
	if(frm_table == '' || frm_years == ''){
		bootbox.alert(self.translator['msg_err_require_filter']);
		return false
	}

	param = {
		table_name : $('#filter_table').val(),
		year : $('#filter_years').val()
	}

	apiService.SendRequest('POST', self.service_partition, param, function(data, status, jqxhr){
		if(status !== 'success'){
			bootbox.alert({
				message: self.translator['msg_create_partition_unsuc'],
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			});
			return false
		}
		self.onClickDisplay()
		bootbox.alert({
			message: self.translator['msg_create_partition_suc'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		});

		return true
	});
}


/**
* delete partition
*/
srvData.onClickDelete = function(){
	var self = srvData; //initial data
	var param = {}; //prepare parameter
	var frm_table = $('#filter_table').val(); //table name
	var frm_years = $('#filter_years').val(); //year
	var msg = self.translator['msg_con_delete_partition'].replace('%s', frm_table);  //message table name to delete
	var s = msg+ '"' + frm_years + '"'; //message confirm delete partition

	/* validate filter data is  null */
	if(frm_table == '' || frm_years == ''){
		bootbox.alert(self.translator['msg_err_require_filter'])
		return false
	}

	param = {
		table_name : $('#filter_table').val(),
		year : $('#filter_years').val()
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
				apiService.SendRequest("DELETE", self.service_partition, param, function(data, status, jqxhr){
					if(status !== 'success'){
						bootbox.alert({
							message: self.translator['msg_delte_partition_unsuc'],
							buttons: {
								ok: {
									label: self.translator['btn_close']
								}
							}
						});
						return false
					}

					self.onClickDisplay()
					bootbox.alert({
						message: self.translator['msg_delte_partition_suc'],
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
* put the data into columns date
*
* @param {json} row data on row
*
* @return {text} date time
*/
srvData.renderColumnDate = function(row){
	return JH.GetJsonValue(row,'dba_datetime')
}

/**
* put the data into columns month
*
* @param {json} row data on row
*
* @return {text} month
*/
srvData.renderColumnMonth = function(row){
	return JH.GetJsonValue(row,'month')
}

/**
* put the data into columns remark
*
* @param {json} row data on row
*
* @return {text} remark
*/
srvData.renderColumnRemark = function(row){
	return JH.GetJsonValue(row,'dba_remark')
}

/**
* put the data into columns usere
*
* @param {json} row data on row
*
* @return {text} user
*/
srvData.renderColumnUser = function(row){
	return JH.GetJsonValue(row,'user.FullName')
}
