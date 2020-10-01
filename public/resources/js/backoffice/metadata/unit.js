/**
*
*   Main JS application file for unit page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvData = {}; //initial daat
var jid = '#dlgEditUnit'; //prefix id of element in form
var init_unit; //initial unit data


/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {

	var self = srvData; //initial data
	self.translator = translator
	self.service = 'thaiwater30/backoffice/metadata/dataunit'


	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
		})
	})

	// var lang = web_lang;
	// console.log("lang:",lang);
	self.groupTableId = 'tbl-unit'
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + srvData.translator['btn_add_unit'],
			action : self.editUnit
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  srvData.renderColumUnitTH,
		},
		{
			data :  srvData.renderColumUnitEN,
		},
		{
			data :  srvData.renderColumUnitJP,
		},
		{
			data : renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', self.editUnit)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', self.deleteUnit)


	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();


	$(document).ready(function(){

		$("select[multiple] option").prop("selected", "selected");
		if(typeof lang === undefined || lang == null){return false}
		for (var i = 0; i<lang.length; i++){
			var id = lang[i];
			var upName = id.toUpperCase();
			// console.log(upName);
			if(id == "th"){
				$("#dlgEditUnit-form").append('<div class="form-group row"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditUnit-name"><span class="color-red">*</span>'+srvData.translator['label_unit']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditUnit-'+id+'" type="text" class="form-control" name="department" data-key="'+id+'" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"/> </div> </div>');
			}
			else {
				$("#dlgEditUnit-form").append('<div class="form-group row"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditUnit-name">'+srvData.translator['label_unit']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditUnit-'+id+'" type="text" class="form-control" name="department" data-key="'+id+'"/> </div> </div>');
			}
			$("#input-reponse").hide();
		}
		$(jid+"-th").keydown(function(){
			$('#input-reponse').hide();
		});
	})

	apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
}

/**
* put data in to table
*
* @param {json} data unit data
*
*/
srvData.previewDataTables = function(data){
	var a = []; //unit data to put into table
	var self = srvData; //initial data
	var data = apiService.getFieldValue(data,'data'); //initial unit data

	if ( data == null ) {
		return
	}

	init_unit = data;

	for(var i = 0; i<data.length; i++){
		a.push(data[i]);
	}

	self.dataTable.clear();
	self.dataTable.rows.add(a);
	self.dataTable.draw();
}



/**
* put data into column unit Thai
*
* @param {json} row  unit data
*
*/
srvData.renderColumUnitTH = function(row){
	return JH.GetJsonValue(row,'dataunit_name.th')
}



/**
* put data into column unit English
*
* @param {json} row  unit data
*
*/
srvData.renderColumUnitEN = function(row){
	return JH.GetJsonValue(row,'dataunit_name.en')
}



/**
* put data into column unit Japan
*
* @param {json} row  unit data
*
*/
srvData.renderColumUnitJP = function(row){
	return JH.GetJsonValue(row,'dataunit_name.jp')
}




/**
* display form edit data
*
*/
srvData.editUnit = function() {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	srvData.showEditUnit(row);
}



/**
* Edit data
*
* @param {json} row  unit data
*
*/
srvData.showEditUnit = function(row){
	var self = srvData; //initial data
	var jid = '#dlgEditUnit'; //prefix id of element in form
	var data = {}; //unit data

	$("#input-reponse").hide();
	var frm = $(jid + '-form'); //element form

	frm.parsley().reset()
	$('ul.parsley-errors-list').remove()


	if (row === undefined) {
		$(jid + '-id').val('');
		$(jid + '-title').text(srvData.translator['title_add_unit'])
		$(jid + '-form > .form-group > div ').children("input").each(function(){
			var attr = $(this).data(); //attribute of element input in  form
			var typeLang 	= attr["key"]; //langauges name

			data[typeLang] = '';
		});

	} else {
		$(jid + '-title').text(srvData.translator['title_edit_unit'])
		data = init_unit[row]["dataunit_name"];
		$(jid + '-id').val(init_unit[row]["id"]);
	}

	$(jid + "-form > .form-group > div ").children("input").each(function(){
		var id = $(this).data(); //attribute of element input in  form
		var typeLang 	= id["key"]; //langauges name
		var text = "" ; // data to put in input form

		if ( data[typeLang] != "undefined"){
			text = data[typeLang];
			$(jid + "-"+typeLang).val(text);
		}
	});
	$(jid).modal({
		backdrop : 'static'
	})
}



/**
* delete data
*
*/
srvData.deleteUnit	=	function(e) {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data

	$(jid + '-id').val(init_unit[row]["id"])
	var id = $(jid + '-id').val(); //id unit data
	var srv	=	self.service; //service
	var dataunit_name = init_unit[row]["dataunit_name"]["th"]; //unit name Thai

	srv +=	'/'+ id

	var s = self.translator['msg_delete_con'].replace('%s',dataunit_name); //message confirm delete

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
					apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
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



/*  Event button save new  or edited department */
$(jid +'-save-btn').on('click', function(e) {
	if (srvData.saveUnit(jid)) {
		$(jid).modal('hide');
	}
});



/**
* delete data
*
* @param {string} jid prefix id  of element in form
*/
srvData.saveUnit = function(jid) {
	var self = srvData; //initial data
	var param = {}; //parameter to save data
	var data = {}; //unot data to save
	var typeLang; //langauges name
	var frm = $(jid + '-form'); //element form

	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	$(jid +"-form > .form-group > div ").children("input").each(function(){
		var attr = $(this).data(); //attribute of element
		var typeLang 	= attr["key"]; //langauges name

		data[typeLang] = $(jid + '-'+ typeLang).val();
	});

	var id = $(jid + '-id').val(); //id unit data
	var method = "POST"; //method
	var success_msg	=	srvData.translator['msg_save_suc']; //message save success
	var srv	=	self.service; //service

	param['dataunit_name'] = data;
	param['id'] = "";


	if(id !== ''  ){
		method	=	"PUT"
		srv +=	'/'+ id
		success_msg	=	srvData.translator['msg_save_suc']
		param['id'] = id;
	}

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

/**
* create button on table
*
* @param {josn} row rwow number
* @param {josn} type
* @param {josn} set
* @param {josn} meta meta of table
*/
var renderToolButtons = function(row, type, set, meta) {
	var self = srvData; //initial data
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + self.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
	+ self.translator['btn_delete'] + '"></i>'; //element of buttons

	return s
}
