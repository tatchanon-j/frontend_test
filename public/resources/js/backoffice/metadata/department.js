/**
*
*   Main JS application file for department page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data
var json_department; //initial data department

srvData.init = function(translator) {

	var self = srvData; //initial data
	self.translator = translator; // Text for label and message on java script
	self.service = 'thaiwater30/backoffice/metadata/department'; //service department
	self.service_ministry = 'thaiwater30/backoffice/metadata/ministry'; //service meinstry


	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : self.translator['select_all'],
			allSelectedText : self.translator['all_selected'],
			nonSelectedText : self.translator['none_selected'],
			filterPlaceholder: self.translator['search']
		})
	})


	/**
	* Event button save new  or edited department.
	*
	* @param {json} e
	*
	*/
	$('#dlgEditDepartment-save-btn').on('click', function(e) {
		if (srvData.saveDepartment('#dlgEditDepartment')) {
			$('#dlgEditDepartment').modal('hide')
		}
	});


	/* Display datatable */
	self.groupTableId = 'tbl-department'; //id table ministry
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> '+TRANS["add_title"],
			action : self.editDepartment
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data :  srvData.renderColumDepartment,
		}, {
			data :  srvData.renderColumMinistry,
		}, {
			data : renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', self.editDepartment)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', self.deleteDepartment)

	/* Event button btn_preview */
	$('#btn_preview').on('click' , self.btnPreviewClick);
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

	/* Generate element input Department according language on web */
	$(document).ready(function(){
		if(typeof lang === undefined || lang == null){return false}
		for (var i = 0; i<lang.length; i++){
			var id = lang[i];
			var upName = id.toUpperCase();

			if(id == "th"){
				$("#dlgEditDepartment-form").append('<div class="form-group row department_name"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditGroup-name"><span class="color-red">*</span>'+TRANS['label_name']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditDepartment-'+id+'" type="text" class="form-control" name="department" data-key="'+id+'" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"/> </div> </div> <div class="form-group row short_name"> <label class="col-form-label text-sm-right col-sm-3"for="dlgEditDepartment-name">'+TRANS['col_shortname']+'('+upName+'):</label> <div class="col-sm-4"> <input id="dlgEditDepartment-short_name_'+id+'" class="form-control" type="text" name="shotname" data-key="'+id+'" ></input> </div> </div>');
			}else{
				$("#dlgEditDepartment-form").append('<div class="form-group row department_name"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditGroup-name">'+TRANS['label_name']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditDepartment-'+id+'" type="text" class="form-control" name="department" data-key="'+id+'"/> </div> </div> <div class="form-group row short_name"> <label class="col-form-label text-sm-right col-sm-3"for="dlgEditDepartment-name">'+TRANS['col_shortname']+'('+upName+'):</label> <div class="col-sm-4"> <input id="dlgEditDepartment-short_name_'+id+'" class="form-control" type="text" name="shotname" data-key="'+id+'" ></input> </div> </div>');
			}
		}
	})

	/* Get data from service to add on datatable */
	apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
	/* Get data from service to generate dropdown select ministry */
	apiService.SendRequest('GET', self.service_ministry, {}, srvData.gen_fill_ministry)
}


/**
* display data department
*
*/
srvData.btnPreviewClick = function(){
	var ministry = $('#filter_ministry').val();  //ministtry id
	var param = {}; //initial parameter

	if(!ministry){
		bootbox.alert({
			message: srvData.translator['msg_err_require_filter'],
			buttons : {
				ok : {
					label: srvData.translator['btn_close']
				}
			}
		})
	}

	if ( ministry ){
		param["ministry"] = ministry.map(Number);
	}

	apiService.SendRequest('GET', srvData.service, param, srvData.previewDataTables)
}

/**
* Render data to display on colum Category Thai lanaguage
*
* @param {json} row data each row
*
* @return {json} department name
*/
srvData.renderColumDepartment = function(row){
	return JH.GetJsonLangValue(row,'department_name',true)
}

/**
* Render data to display on colum Category English lanaguage
*
* @param {json} row data each row
*
* @return {json} ministry name
*/
srvData.renderColumMinistry = function(row){
	return JH.GetJsonLangValue(row,'ministry_name',true)
}


/**
* Generate dropdown selecte of ministry
*
* @param {json} ministry Data from service
*
*/
srvData.gen_fill_ministry = function(ministry){
	if (JH.GetJsonValue(ministry, "result") != "OK"){ return false; }

	var data = JH.GetJsonValue(ministry, "data"); //ministry data

	JH.Sort(data, "ministry_name."+JH.GetLang(), false, function(str){
		return str.toLowerCase();
	});

	var input_minis = srvData.gen_fill("input_ministry" , data); //ministry data

	$(input_minis).select2();
	var data_fil = srvData.gen_fill("filter_ministry" , data);
	$(data_fil).multiselect({includeSelectAllOption:true});
	$(data_fil).multiselect('rebuild');
	$(data_fil).multiselect('selectAll',false);
	$(data_fil).multiselect('updateButtonText');
}

/**
* Generate option list
*
* @param {json} ministry Data from service
*
*/
srvData.gen_fill = function(id , source){
	var select = document.getElementById(id); // element select

	if(typeof source === undefined || source == null){return false}

	for (var i = 0; i < source.length; i++){
		var option = document.createElement("option"); //create option
		var txt_option = JH.GetJsonLangValue(source[i],'ministry_name',true); //option name
		var	val_option = source[i]["id"]; //option value

		option.text = txt_option;
		option.value = val_option;
		select.add(option);
	}
	return select;
}



/**
* Push data on row data table
*
* @param {json} data The data from service
*
*/
srvData.previewDataTables = function(data){
	var a = []; //initial data to put on table
	var self = srvData; //inotila data
	json_department = data;
	var data = apiService.getFieldValue(data,'data'); //data to put on table

	if ( data == null ) {
		return
	}
	if(typeof lang === undefined || lang == null){return false}
	for(var i = 0; i<data.length; i++){
		a.push(data[i]);
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
	+ self.translator['btn_delete'] + '"></i>'

	return s
}

/**
* Get row id on datable to edit.
*
*/
srvData.editDepartment = function() {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	srvData.showEditDepartment(row);

}

/**
* Display modal for Add or Edit data.
*
* @param {json} row Row id of data on datatable
*
*/
srvData.showEditDepartment = function(row){
	var self = srvData; //initial data
	var jid = '#dlgEditDepartment'; //prefix id
	var frm = $(jid + '-form'); //element form

	frm.parsley().reset()
	$('ul.parsley-errors-list').remove()

	// Diaplay form Add or Edit
	if (row === undefined) {
		var data = {}; //initial data deparrtrment

		$(jid + '-id').val('');
		$(jid + '-title').text(TRANS['add_title'])
		$('#department_code').val('')

		$("#dlgEditDepartment-form > div.department_name > div").children("input").each(function(){
			var frm_lang = $(this).attr('data-key'); //language
			$(jid + '-'+frm_lang).val('')
		});

		$("#dlgEditDepartment-form > div.short_name > div").children("input").each(function(){
			var frm_lang = $(this).attr('data-key'); //language
			$('#dlgEditDepartment-short_name_'+frm_lang).val('')
		});

	} else {
		$(jid + '-title').text(TRANS['edit_title'])
		data = json_department["data"][row];
		$('#input_ministry').val(json_department["data"][row]["ministry_id"]).triggerHandler('change');
		$('#department_code').val(json_department["data"][row]['department_code']);
		$(jid + '-id').val(json_department["data"][row]["id"]);
		$(jid + '-title').attr(jid + '-title')

		$("#dlgEditDepartment-form > div.department_name > div").children("input").each(function(){
			var frm_lang = $(this).attr('data-key'); //language
			var text = "" ; //department

			if ( data["department_name"][frm_lang] != "undefined"){
				text = data["department_name"][frm_lang];
			}
			$(jid + '-'+frm_lang).val(text)

		});

		$("#dlgEditDepartment-form > div.short_name > div").children("input").each(function(){
			var frm_lang = $(this).attr('data-key'); //language
			short_name = {}
			var text = "" ; //department short name
			if ( data["department_shortname"][frm_lang] != "undefined"){
				text = data["department_shortname"][frm_lang];
			}

			$('#dlgEditDepartment-short_name_'+frm_lang).val(text)

		});
	}


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
srvData.deleteDepartment = function(e) {
	var self = srvData //prepare data
	var row = $(this).attr('data-row'); //row number
	var jid = '#dlgEditDepartment' //prefix id
	var dep = json_department["data"][row]; //department data

	$(jid + '-id').val(dep.id);
	var id = 	$(jid + '-id').val() //department id
	var srv	=	self.service //url service

	srv +=	'/'+ id

	var department = JH.GetJsonLangValue(dep,'department_name',true) //department name

	//Alert confirm to delete
	var s = self.translator['msg_delete_con'].replace('%s',department)
	bootbox.confirm({
		message: s,
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
					// apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
					srvData.btnPreviewClick();
					if (data["result"] == "NO"){
						bootbox.alert({
							message: self.translator['msg_delete_unsuc_relate'],
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
srvData.saveDepartment = function(jid) {
	var self = srvData; //initial data
	var param = {}; //initial parameter
	var short_name = {}; //initail short name
	var data = {}; //department name
	var frm = $(jid + '-form'); //element form

	//Chek form TH not null
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	$(jid + "-form > div.department_name > div").children("input").each(function(){

		var frm_lang = $(this).attr('data-key'); //language of department name
		data[frm_lang] = $(jid + '-'+ frm_lang).val()
	});

	$(jid + "-form > div.short_name > div").children("input").each(function(){
		var frm_lang_sht = $(this).attr('data-key'); //language of shortname
		short_name[frm_lang_sht] = $(jid + '-short_name_'+ frm_lang_sht).val()
	});

	// if save as Add new
	var id = $(jid + '-id').val(); //id department
	var method = "POST"; //method
	var srv	=	self.service; //service
	param['department_code'] = $('#department_code').val();
	param['department_name'] = data;
	param['id'] = "";
	param['ministry_id'] = $('#input_ministry').val();
	param['department_shortname'] = short_name;

	// If savs as Update or edit
	if(id !== ''  ){
		method	=	"PUT"
		srv +=	'/'+ id
		param['id'] = id;

	}

	//Request Service to Add or Edit data.
	apiService.SendRequest(method, srv, param, function(data, status, jqxhr){
		apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
		bootbox.alert({
			message: self.translator['msg_save_suc'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
	})
	return true
}
