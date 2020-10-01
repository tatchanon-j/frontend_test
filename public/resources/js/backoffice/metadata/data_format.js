/**
*
*   Main JS application file for data format page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var dfm = {}; //initial data
var json_df; //initial data format
var jid = '#dlgEditDataformat'; //prefix id of element on form

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
dfm.init = function(translator) {
	dfm.translator  = translator; //Text for label and message on java script
	dfm.service     = 'thaiwater30/backoffice/metadata/dataformat'; //service data format
	dfm.service_method_list = 'thaiwater30/backoffice/metadata/select_option_dataformat'; //service option list data format
	dfm.json_df; //initial data format
	dfm.groupTableId = 'tbl-Dataformat';
	ctrl = $('#' + dfm.groupTableId);
	dfm.dataTable = ctrl.DataTable({
		dom        : 'frlBtip',
		buttons    : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + dfm.translator['btn_add_dataformat'],
			action : dfm.editDataformat
		} ],
		language   : g_dataTablesTranslator,
		columns    : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},{
			data : dfm.renderColumDataformat,
		},{
			data :  dfm.renderColumMethod,
		},{
			data : dfm.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : dfm.dataTableRowCallback
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', dfm.editDataformat)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', dfm.deleteDataformat)

	$('#btn_display').on('click', dfm.previewDataTables)


	dfm.dataTable.on('order.dt search.dt', function() {
		dfm.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	/* eting general for dropdown multiselect */
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : dfm.translator['select_all'],
			allSelectedText : dfm.translator['all_selected'],
			nonSelectedText : dfm.translator['none_selected'],
			filterPlaceholder: dfm.translator['search']
		})
	})

	// apiService.SendRequest('GET', dfm.service, {}, dfm.previewDataTables)
	apiService.SendRequest('GET', dfm.service_method_list, {}, dfm.genOption)
}



/**
* generate option
*
* @param {json} rs data to generate option
*
*/
dfm.genOption = function(rs){
	dfm.genFilterMethod(rs);
	dfm.genInputMethod(rs);
}



/**
* generate opion into filtter method
*
* @param {json} rs method data to generate option
*
*/
dfm.genFilterMethod = function(rs){
	var filter_method = document.getElementById('filter_method'); //element filter method
	var method = JH.GetJsonValue(rs, 'data'); //json data format

	JH.Sort(method,"text",false , function(str){
		return str.toLowerCase();
	})

	if(typeof method === undefined || method == null){return false}

	for(var i=0; i<method.length; i++){
		var option = document.createElement('option'); //create option
		var txt = method[i]['text']; //option name
		var val = method[i]['value']; //option value

		option.text = txt;
		option.value = val;
		filter_method.add(option);
	}
	$(filter_method).multiselect({includeSelectAllOption:true});
	$(filter_method).multiselect('rebuild');
	$(filter_method).multiselect('selectAll',false);
	$(filter_method).multiselect('updateButtonText');

	dfm.previewDataTables()
}



/**
* generate opion into filtter method on modal
*
* @param {json} rs method data to generate option
*
*/
dfm.genInputMethod = function(rs){
	var dlgEditDataformat_method = document.getElementById('dlgEditDataformat-method'); //element input method
	var method = JH.GetJsonValue(rs, 'data'); //json data format

	JH.Sort(method,"text",false , function(str){
		return str.toLowerCase();
	})

	if(typeof method === undefined || method == null){return false}

	for(var i=0; i<method.length; i++){
		var option = document.createElement('option'); //create option
		var txt = method[i]['text']; //option name
		var val = method[i]['value']; //option value

		option.text = txt;
		option.value = val;
		dlgEditDataformat_method.add(option);
	}
}


/**
* generate data rows on data table
*
*/
dfm.previewDataTables = function(){
	var method = $('#filter_method').val(); //element filter method

	if(!method){
		bootbox.alert({
			message : dfm.translator['msg_err_require_filter'],
			buttons: {
				ok : {
					label : dfm.translator['btn_close']
				}
			}
		})
		return false
	}

	var p_method = $('#filter_method').val().join(); //method id
	var array = JSON.parse("[" + p_method + "]"); //array method id

	dfm.param_method =  {
		metadata_method_id : array
	}

	apiService.SendRequest('GET', dfm.service, dfm.param_method, function(rs){
		dfm.dataTable.clear();
		if (JH.GetJsonValue(rs, "result") == "OK"){
			dfm.json_df = rs['data'];
			dfm.dataTable.rows.add(JH.GetJsonValue(rs,"data"));
		}
		dfm.dataTable.draw();
	})

}


/**
* put data into column fomat
*
* @param {json} row  data format
*
* @return {string} data format
*/
dfm.renderColumDataformat = function(row){
	return JH.GetJsonLangValue(row, 'dataformat_name',true)
}



/**
* put data into column method
*
* @param {json} row  method name
*
* @return {string} method name
*/
dfm.renderColumMethod = function(row){
	return JH.GetJsonValue(row, 'metadata_method_name')
}


/**
* generate button on table
*
* @param {json} row  data format
* @param {json} type
* @param {json} set
* @param {json} meta
*
* @return {string}
*/
dfm.renderToolButtons = function(row, type, set, meta) {
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + dfm.translator['btn_edit']
	+ '"></i>'
	+ '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
	+ dfm.translator['btn_delete'] + '"></i>'

	return s
}



/**
* Add or Edit data format name
*
*/
dfm.editDataformat = function() {
	var row = $(this).attr('data-row'); //row number
	dfm.showEditDataformat(row)

}



/**
* Display modal Add or Edit data format name
*
* @param {json} row  data format
*/
dfm.showEditDataformat = function(row){
	var data = {}; //initial data
	var frm = $(jid + '-form'); //elemnt form

	frm[0].reset();
	frm.parsley().reset()
	$('ul.parsley-errors-list').remove()

	if (row === undefined) {
		$(jid + '-id').val('');
		$(jid + '-title').text(dfm.translator['title_add_dataformat'])
	} else {
		var format_name = dfm.json_df[row]["dataformat_name"];
		$(jid + '-title').text(dfm.translator['title_edit_dataformat'])
		$(jid + '-id').val(dfm.json_df[row]["id"])
		$(jid + '-method').val(dfm.json_df[row]['metadata_method_id'])
		$(jid + '-data-format-th').val(JH.GetJsonValue(format_name, 'th'))
		$(jid + '-data-format-en').val(JH.GetJsonValue(format_name, 'en'))
		$(jid + '-data-format-jp').val(JH.GetJsonValue(format_name, 'jp'))
	}

	$(jid).modal({
		backdrop : 'static'
	})
}



/**
* Delete data format
*
*/
dfm.deleteDataformat	=	function() {
	var row = $(this).attr('data-row'); //row number
	var srv	=	dfm.service; //service
	var id = $(jid + '-id').val(); //id data format
	var dataformat_name = dfm.json_df[row]; //data format name

	$(jid + '-id').val(dfm.json_df[row]["id"]);

	dataformat_name = JH.GetJsonLangValue(dataformat_name, 'dataformat_name', true);

	srv +=	'/'+ id;

	var s = dfm.translator['msg_delete_con'].replace('%s',dataformat_name); //message confirm delete

	bootbox.confirm({
		message: s,
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' +  dfm.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  dfm.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function (result) {
			if(result){
				apiService.SendRequest("DELETE", srv, {}, function(data, status, jqxhr){
					apiService.SendRequest('GET', dfm.service, dfm.param_method, dfm.previewDataTables)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: dfm.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: dfm.translator['btn_close']
								}
							}
						})
						return false;
					}
					bootbox.alert({
						message: dfm.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: dfm.translator['btn_close']
							}
						}
					})
				})
				return true
			}
		}
	});
}



/**
* Save data format
*
*/
$(jid + '-save-btn').on('click', function(e) {
	if (dfm.saveDataformat('#dlgEditDataformat')) {
		$(jid).modal('hide')
	}
});



/**
* Save From Add or Edit data format
*
* @param {json} jid  data format
*/
dfm.saveDataformat = function(jid) {
	var param = {}; //initila parameter
	var data = {}; // initial data
	var method =	"POST"; //method
	var frm = $(jid + '-form'); //element form
	var id = $('#dlgEditDataformat-id').val(); //id data format
	var srv = 'thaiwater30/backoffice/metadata/dataformat'; //service data format

	//Chek form TH not null
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	param_insert = {
		metadata_method_id : parseInt($('#dlgEditDataformat-method').val()),
		dataformat_name : {
			th : $('#dlgEditDataformat-data-format-th').val(),
			en : $('#dlgEditDataformat-data-format-en').val(),
			jp : $('#dlgEditDataformat-data-format-jp').val(),
		}
	}

	if(id !== ''){
		method =	"PUT"
		srv+=	'/'+ id
	}

	apiService.SendRequest(method, srv, param_insert, function(data, status, jqxhr){
		apiService.SendRequest('GET', dfm.service, dfm.param_method, dfm.previewDataTables)
		bootbox.alert({
			message: dfm.translator['msg_save_suc'],
			buttons: {
				ok: {
					label: dfm.translator['btn_close']
				}
			}
		})
	})
	return true

	$(jid).modal('hide')
}
