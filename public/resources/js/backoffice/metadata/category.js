/**
*
*   Main JS application file for category page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvData = {}; //initial data
var json_cat; //category data

/**
* prepare data
*
* @param {json} translator Text for use on page
*
* @return text
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service = 'thaiwater30/backoffice/metadata/category'; //Setting url of Service

	/* generate form input agency according languages on system */

	$(document).ready(function(){
		if(typeof lang === undefined || lang == null){return false}
		for (var i = 0; i<lang.length; i++){
			var cur_lange = lang[i]; //all langauge name on system
			var upName = cur_lange.toUpperCase(); //Upercase langauge name

			if(cur_lange == "th"){
			
				$("#dlgEditCactegory-form").append('<div class="form-group row col-sm-12"> <label for="dlgEditGroup-name" class="control-label col-sm-3"><span class="color-red"> *</span>'+srvData.translator['label_category']+' ('+upName+'):</label><div class="col-sm-9"> <input id="dlgEditCactegory-'+cur_lange+'" type="text" class="form-control" name="category" data-key="'+cur_lange+'" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"/></div></div>');
			}
			else{
				$("#dlgEditCactegory-form").append('<div class="form-group row col-sm-12"> <label for="dlgEditGroup-name" class="control-label col-sm-3">'+srvData.translator['label_category']+' ('+upName+'):</label><div class="col-sm-9">  <input id="dlgEditCactegory-'+cur_lange+'" type="text" class="form-control" name="category" data-key="'+cur_lange+'"/> </div></div>');
			}
		}
		$('[data-toggle="tooltip"]').tooltip();
	})

	/**
	* Event button save new  or edited department.
	*
	* @param {json} e
	*
	*/
	$('#btn-save').on('click', function(e) {
		if (srvData.saveCategory('#dlgEditCactegory')) {
			$('#dlgEditCactegory').modal('hide')
		}
	});


	/* seting general for dropdown multiselect */
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
		})
	})

	/* Get data from service to add on datatable */
	apiService.SendRequest('GET', self.service,{}, srvData.previewDataTables)

	/* Display datatable */
	self.metadataTableId = 'tbl-category'
	ctrl = $('#' + self.metadataTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> '+ srvData.translator['label_category'] ,
			action : srvData.addCategory
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : srvData.renderColumTH,
		}, {
			data : srvData.renderColumEN,
		}, {
			data : srvData.renderColumJP,
		}, {
			data : renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ ],
		rowCallback : self.dataTableRowCallback
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

	/* Event button edit data o datatable */
	ctrl.on('click', 'i.btn-edit', self.editCategory)
	/* Event button edit data o datatable */
	ctrl.on('click', 'i.btn-delete', self.deleteCategory)
}


/**
* Render data to display on colum Category Thai lanaguage
*
* @param {json} row Data to Add on datable
*
* @return {string} agency name Thai
*/
srvData.renderColumTH = function(row){
	return JH.GetJsonValue(row,"th");
}

/**
* Render data to display on colum Category English lanaguage
*
* @param {json} row Data to Add on datable
*
* @return {string} agency name English
*/
srvData.renderColumEN = function(row){
	return JH.GetJsonValue(row,"en");
}

/**
* Render data to display on colum Category Japan lanaguage
*
* @param {json} row Data to Add on datable
*
* @return {string} agency name Japan
*/
srvData.renderColumJP = function(row){
	return JH.GetJsonValue(row,"jp");
}


/**
* Push data on row data table
*
* @param {json} data The data from service
*
*/
srvData.previewDataTables = function(data){

	var self = srvData; //initial data
	json_cat = data;
	var a = []; //agency data to push on table
	var data = apiService.getFieldValue(data,'data'); //data agency
	if ( data == null ) {
		return
	}
	for (var i = 0; i<data.length; i++) {
		a.push(data[i]['category_name']);
	}

	self.dataTable.clear()
	self.dataTable.rows.add(a)
	self.dataTable.draw()
}

/**
* Create icon for edit and delete data on datatable.
*
* @param {json} row The data on data table
* @param {json} type
* @param {json} set
* @param {json} meta Colum and row id
*
*@return {json} s The button edit and delete on data table
*/
var renderToolButtons = function(row, type, set, meta) {
	var self = srvData; //initial data
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + self.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
	+ self.translator['btn_delete'] + '"></i>';

	return s
}

/**
* Add category.
*
* @param {json} e
* @param {json} dt
* @param {json} node
* @param {json} config
*
*/
srvData.addCategory = function(e, dt, node, config) {
	srvData.showEditCategory()
}

/**
* Get row id on datable to edit.
*
* @param {json} e
*
*/
srvData.editCategory = function(e) {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	self.showEditCategory(row);
}

/**
* Display modal for Add or Edit data.
*
* @param {json} row
*
*/
srvData.showEditCategory = function(row){
	var self = srvData; //initial data
	var jid = '#dlgEditCactegory'; //prefix id of element in form
	var frm = $(jid + '-form'); //element form
	var data = {}; //agency data
	frm.parsley().reset()
	$('ul.parsley-errors-list').remove()

	// Diaplay form Add or Edit
	if (row === undefined) {
		$(jid + '-id').val('');
		$(jid + '-title').text(srvData.translator['title_add_category']);
		data = {};

	} else {
		$(jid + '-title').text(srvData.translator['title_edit_category'])
		data = json_cat["data"][row]["category_name"];
		$(jid + '-id').val(json_cat["data"][row]["id"]);
		$(jid + '-title').attr(jid + '-title');
	}


	$("#dlgEditCactegory-form > .form-group >  div ").children("input").each(function(){
		var frm_lang  = $(this).attr('data-key');

		var text = "" ; //agency
		if ( data[frm_lang] != "undefined"){
			text = data[frm_lang];
		}

		$(jid + '-'+frm_lang).val(text);

	});

	$(jid).modal({
		backdrop : 'static'
	})
}

/**
* Delet category on data table.
*
* @param {json} e
*
*/
srvData.deleteCategory	=	function(e) {

	var self = srvData; //initial data
	var row = $(this).attr('data-row'); //row number
	var jid = '#dlgEditCactegory'; //prefix id of element on form
	var param = {}; //initial parameter
	var data = {};
	var id = json_cat["data"][row]["id"]; //agency id
	var srv	=	self.service

	srv +=	'/'+ id;
	var category_name = json_cat["data"][row]["category_name"]["th"] //category name
	//Alert confirm to delete
	var s = self.translator['msg_delete_con'].replace('%s',category_name) //message confirm delete

	bootbox.confirm({
		message: s,
		reorder: true,    // <== re-order buttons
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
				apiService.SendRequest("DELETE", srv, {}, function(data, status, jqxhr){
					apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: self.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: self.translator['btn_close']
								}
							}
						})
						return false;
					}
					bootbox.alert({
						message: self.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: self.translator['btn_close']
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
* Get value from form input and set data fomat for send to service for save data.
*
* @param {json} jid
*
*/
srvData.saveCategory = function(jid) {
	var self = srvData; //initial data
	var param = {}; //initial parameter
	var data = {}; //agency data
	var frm = $(jid + '-form'); //element form

	//Chek form TH not null
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	// Set value of data to save
	$("#dlgEditCactegory-form > .form-group >  div ").children("input").each(function(){
		var id = $(this).attr('id'); //agency id
		var lang = $(this).attr('data-key') // langauges

		data[lang] = $(jid + '-'+ lang).val()

	});

	// if  Add new
	var id = $(jid + '-id').val(); //agenyc id
	var method = "POST"; //method
	var srv	=	self.service; //service
	// Seting format data for send to service by seting format according define on service
	param['category_name'] = data;
	param['id'] = "";


	// If Update or edit
	if(id !== ''  ){
		method	=	"PUT"; //method
		srv +=	'/'+ id; //service for delete data
		success_msg	=	self.translator['msg_edit_suc']; //message success delete
		param['id'] = id;

	}

	//Request Service to Add or Edit data.
	apiService.SendRequest(method, srv, param, function(data, status, jqxhr){
		if(status == 'success'){
			apiService.SendRequest('GET', self.service,{}, srvData.previewDataTables)
			bootbox.alert({
				message: self.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			})
		}else{
			bootbox.alert({
				message: srvData.translator['msg_save_unsuccess'],
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			})
		}
	})
	return true
}
