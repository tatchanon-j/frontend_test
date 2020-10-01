/**
*
*   Main JS application file for sub-category page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvData = {}; //initial data

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {

	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service = 'thaiwater30/backoffice/metadata/subcategory'; //service sub-category
	self.serviceCategory = 'thaiwater30/backoffice/metadata/category'; //service category

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

	self.groupTableId = 'tbl-subcat'; //Get ElementID dataTable
	ctrl = $('#' + self.groupTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + srvData.translator['btn_add_subcat'],
			action : srvData.editSubCategory
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : srvData.renderColumSubcat,
		}, {
			data : srvData.renderColumCategory,
		}, {
			data : renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})

	/* Genalate order number on datatable */
	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	/* Get data from service to add on datatable */
	apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables);
	/* Get data from service to generate category drodown select  */
	apiService.SendRequest('GET', self.serviceCategory, {}, srvData.gen_fill_category);

	/* Event button edit data on datatable */
	ctrl.on('click', '.btn-edit', srvData.editSubCategory);
	/* Event button edit data on datatable */
	ctrl.on('click', '.btn-delete', self.deleteSubCategory);

	/* Event button display */
	$('#btn_preview').on('click' , srvData.btnPreviewClick);

	/* Generate element input Subcategory according language on web */
	$(document).ready(function(){
		var self = srvData; //initial data

		if(typeof lang === undefined || lang == null){return false}

		for (var i = 0; i<lang.length; i++){
			var languages = lang[i]; //short name of language
			var upName = languages.toUpperCase(); //uppercase of language name

			if(languages == "th"){
				$("#dlgEditSubCategory-form").append('<div class="form-group row col-sm-12"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditSubCategory-name"><span class="color-red">*</span>'+translator['label_subcat']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditSubCategory-'+languages+'" type="text" class="form-control" name="ministry" data-key="'+languages+'" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"/> </div> </div>');
			}else{
				$("#dlgEditSubCategory-form").append('<div class="form-group row col-sm-12"> <label class=""col-form-label text-sm-right col-sm-3" for="dlgEditSubCategory-name">'+translator['label_subcat']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditSubCategory-'+languages+'" type="text" class="form-control" name="ministry" data-key="'+languages+'"/> </div> </div>');
			}
		}

	})

	/**
	* Event button save new  or edited department.
	*
	* @param {json} e
	*
	*/
	$('#btn-save').on('click', function(e) {
		if (srvData.saveEditSubCategory('#dlgEditSubCategory')) {
			$('#dlgEditSubCategory').modal('hide')
		}
	});

}



/**
* get data to put on data table
*
*/
srvData.btnPreviewClick = function(){
/* 	var category = $('#data-filters-filter_category').val(); //category id
	var param = {}; //parameter to get sub-category data

 */


/* 	if(!category){
		bootbox.alert({
			message: srvData.translator['msg_err_require_filter'],
			buttons : {
				ok : {
					label: srvData.translator['btn_close']
				}
			}
		})
	} */

/* 	if ( category ){
		console.log("CATE",category)
		param["category"] = category.map(Number);
	} */
	//apiService.SendRequest('GET', srvData.service, param, srvData.previewDataTables);

// set directly set param

	var param = {
		category: $('#data-filters-filter_category').val()
	};
	apiService.SendRequest('GET', srvData.service, param, srvData.previewDataTables)
}

/**
* put data into sub-category column
*
* @param {json} row sub-cateegory data
*
* @return {string} sub-category name
*/
srvData.renderColumSubcat = function(row){
	return JH.GetJsonLangValue(row,'subcategory_name',true)
}

/**
* put data into category column
*
* @param {json} row sub-cateegory data
*
* @return {string} category name
*/
srvData.renderColumCategory = function(row){
	return JH.GetJsonLangValue(row,'category_name',true)
}

/**
* Push data on row data table
*
* @param {json} data The data from service
*
*/
srvData.previewDataTables = function (data){
	var a = []; //sub-category data
	var self = srvData; //initial data
	var data = apiService.getFieldValue(data,'data'); //initial sub-category data

	if ( data == null ) {
		return
	}


	obj_data = data
	for(var i = 0; i<data.length; i++){
		a.push(data[i]);

	}

	self.dataTable.clear();
	self.dataTable.rows.add(a);
	self.dataTable.draw();
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
	+ self.translator['btn_delete'] + '"></i>'; //elemet butons to display on table

	return s
}


/**
* Generate option list on  dropdown selecte category
*
* @param {json} category Dcategory data
*
*/
srvData.gen_fill_category = function(category){
	if (JH.GetJsonValue(category, "result") != "OK"){ return false; }

	var data = JH.GetJsonValue(category, "data"); //category data

	JH.Sort(data, "category_name."+JH.GetLang(), false, function(str){
		return str.toLowerCase();
	});

	srvData.gen_fill("filter_category",data);

	var data_fil = srvData.gen_fill("data-filters-filter_category",data); //element category filter

	$(data_fil).multiselect({includeSelectAllOption:true});
	$(data_fil).multiselect('rebuild');
	$(data_fil).multiselect('selectAll',false);
	$(data_fil).multiselect('updateButtonText');
}


/**
* Generate option on dropdown selecte
*
* @param {json} category Data from service
*
*/
srvData.gen_fill = function(id , source){
	var fil = document.getElementById(id); //id filter

	//Add text and value for element option on filter.
	if(typeof source === undefined || source == null){return false}
	for (var i = 0; i < source.length; i++){
		var option = document.createElement("option");
		var txt_option = JH.GetJsonLangValue(source[i],'category_name',true);
		var	val_option = source[i]["id"];

		option.text = txt_option;
		option.value = val_option;
		fil.add(option);
	}
	return fil;
}
/**
* Get row id on datable to edit.
*
* @param {json} e
*
*/
srvData.editSubCategory = function() {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	srvData.showEditSubCategory(row);

}

/**
* Display modal for Add or Edit data.
*
* @param {json} row
*
*/
srvData.showEditSubCategory = function(row){
	var self = srvData; //initial data
	var jid = '#dlgEditSubCategory'; //prefix id onelent in form
	var frm = $(jid + '-form'); //elent of form
	var data = {}; //sub-category data to put in form
	frm.parsley().reset();
	$('ul.parsley-errors-list').remove();

	if (row === undefined) {
		$(jid + '-id').val('');
		$(jid + '-title').text(srvData.translator['title_add_subcat']);

		$("#dlgEditSubCategory-form > .form-group > div ").children("input").each(function(){
			var frm_lang = $(this).attr('data-key');

			data[frm_lang] = '';
		});
	} else {

		$(jid + '-title').text(srvData.translator['title_edit_subcat'])

		data = obj_data[row]["subcategory_name"];
		$('#filter_category').val(obj_data[row]["category_id"]);

		$(jid + '-id').val(obj_data[row]["id"]);
		$(jid + '-title').attr(jid + '-title')
	}

	$("#dlgEditSubCategory-form > .form-group >  div ").children("input").each(function(){
		var frm_lang  = $(this).attr('data-key'); //language name
		var text = "" ; //data ton put in form

		if ( data[frm_lang] != "undefined"){
			text = data[frm_lang];
		}
		$(jid + '-'+frm_lang).val(text)

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
srvData.deleteSubCategory = function(){
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	var jid = '#dlgEditSubCategory'; //prefix id of element inn from
	var id = obj_data[row]['id']; //id sub-category
	var srv	=	self.service; //service sub-category
	
	srv +=	'/'+ id

	
	subcat_name = JH.GetJsonLangValue(obj_data[row],'subcategory_name',true)


	//Alert confirm to delete
	var s = self.translator['msg_delete_con'].replace('%s',subcat_name);
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
					srvData.btnPreviewClick()
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
srvData.saveEditSubCategory = function(jid) {
	var self = srvData; //initial data
	var param = {}; // parameter to save data
	var data = {}; //sub-category data
	var frm = $(jid + '-form'); //element form

	//Chek form TH not null
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	// Set value of data to save
	$("#dlgEditSubCategory-form > .form-group >  div ").children("input").each(function(){
		var frm_lang = $(this).attr('data-key'); //language name of form to in put data

		data[frm_lang] = $(jid + '-'+ frm_lang).val();

	});

	// if save as Add new
	var id = $(jid + '-id').val(); //sub-category data
	var method = "POST"; //method
	var srv	= self.service; //service

	// Seting format data for send to service by seting format according define on service
	param['subcategory_name'] = data;
	param['id'] = "";
	param['category_id'] = $('#filter_category').val();

	// If savs as Update or edit
	if(id !== ''  ){
		method	=	"PUT";
		srv +=	'/'+ id;
		param['id'] = id;
	}


	//Request Service to Add or Edit data.
	apiService.SendRequest(method, srv, param, function(data, status, jqxhr){
		srvData.btnPreviewClick();
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
