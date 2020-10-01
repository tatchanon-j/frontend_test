/**
*
*   Main JS application file for hydroinfo page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvData = {}; //initial data
var jid = '#dlgEditHydroinfo'; //prefix id
var init_hydroinfo; //initial hydroinfo data



/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {

	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service = 'thaiwater30/backoffice/metadata/hydroinfo'; //service hydroinfo
	self.service_agency = 'thaiwater30/backoffice/metadata/agency'; //service agency

	self.groupTableId = 'tbl-hydro'; //id hydoinfo table
	ctrl = $('#' + self.groupTableId)
	self.dataTable 		= ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + srvData.translator['btn_add_hydro'],
			action : self.editHydroinfo
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			data : 'hydroinfo_number'
		},
		{
			data :  srvData.renderColumHydroinfo,
		},
		{
			data :  srvData.renderColumAgency,
		},

		{
			data : renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 0, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', self.editHydroinfo)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', self.deleteHydroinfo)

	$(document).ready(function(){
		$("select[multiple] option").prop("selected", "selected");
		if(typeof lang === undefined || lang == null){return false}
		$("#dlgEditHydroinfo-form").append('<div class="form-group form-row"> <label class="control-label col-sm-4 m-auto text-right"for="dlgEditHydroinfo-number"><span class="color-red">*</span>'+translator['label_number']+':</label> <div class="col-sm-8"> <input id="dlgEditHydroinfo-number" type="number" min="0" class="form-control" name="hydroinfo_number" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"/> </div> </div>');
		for (var i = 0; i<lang.length; i++){
			var id = lang[i];
			var upName = id.toUpperCase();
			if(id=="th"){
				$("#dlgEditHydroinfo-form").append('<div class="form-group form-row"> <label class="control-label col-sm-4 m-auto text-right"for="dlgEditHydroinfo-name"><span class="color-red">*</span>'+translator['label_hydroinfo']+' ('+upName+'):</label> <div class="col-sm-8"> <input id="dlgEditHydroinfo-'+id+'" type="text" class="form-control" name="department" data-key="'+id+'" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"/> </div> </div>');
			}
			else {
				$("#dlgEditHydroinfo-form").append('<div class="form-group form-row"> <label class="control-label col-sm-4 m-auto text-right"for="dlgEditHydroinfo-name">'+translator['label_hydroinfo']+' ('+upName+'):</label> <div class="col-sm-8"> <input id="dlgEditHydroinfo-'+id+'" type="text" class="form-control" name="department" data-key="'+id+'"/> </div> </div>');
			}
		}
		$("#dlgEditHydroinfo-form").append('<div class="form-group form-row"> <label class="control-label col-sm-4 m-auto text-right" for="dlgEditHydroinfo-name"><span class="color-red">*</span>'+srvData.translator['lavel_agency']+':</label> <div class="col-sm-8"> <select id="dlgEditHydroinfo-multiselected" type="text" class="form-control" name="department" data-key="selected" data-key="selected" multiple="multiple" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"> </select> </div> </div>');
		$(jid+"-th").keydown(function(){
			$('#input-reponse').hide();
		});

		$('select[multiple=multiple]').each(function(i, e) {
			$(e).multiselect({
				buttonWidth : '100%',
				maxHeight : 300,
				includeSelectAllOption : true,
				selectAllNumber : false,
				enableFiltering: true,
				selectAllText : self.translator['selected_all'],
				allSelectedText : self.translator['selected_all'],
				nonSelectedText : self.translator['none_selected'],
				filterPlaceholder: self.translator['search']
			})
		})
	})


	apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
	apiService.GetCachedRequest(self.service_agency, {}, srvData.gen_filter_agency)
}



/**
* Genalate Filter Agency
*
* @param {json} agency initial data of agency
*
*/
srvData.gen_filter_agency = function(agency){
	var self = srvData; //initial data
	var filter_agency = document.getElementById("dlgEditHydroinfo-multiselected"); //element filter agency

	//Add text and value for element option on filter.
	var agency = apiService.getFieldValue(agency,'data'); //agency data

	if ( agency == null ) {
		return
	}

	for (var i = 0; i<agency.length; i++){

		if(agency[i]["agency_name"] !== null){
			var option 	= document.createElement("option"); //create option
			var txt_option 	= JH.GetJsonLangValue(agency[i],'agency_name',true); //option name
			var	val_option 	= agency[i]["id"]; //option value

			option.text 		= txt_option;
			option.value 		= val_option;
			filter_agency.add(option);
		}
	}

	//Display filter as multiselect
	$(filter_agency).multiselect({includeSelectAllOption: true });
	$(filter_agency).multiselect('rebuild');
	$(filter_agency).multiselect('selectAll',true);
	$(filter_agency).multiselect('updateButtonText');
}



/**
* generate data rows on data table
*
* @param {json} agency initial data of agency
*
*/
srvData.previewDataTables = function(data){
	console.log("Reload");
	var a = []; //hydroinfo data to put on talbe
	var self = srvData; //initial data
	var data = apiService.getFieldValue(data,'data'); //hydroinfo data

	init_hydroinfo = data;

	if ( data == null ) {
		return
	}
	for(var i = 0; i<data.length; i++){

		a.push(data[i]);
	}


	self.dataTable.clear()
	self.dataTable.rows.add(a)
	self.dataTable.draw()
}



/**
* put data into column hydroinfo
*
* @param {json} row The data of each row on table
*
* @return {string} hydroinfo name
*/
srvData.renderColumHydroinfo = function(row){
	return JH.GetJsonLangValue(row,'hydroinfo_name',true)
}


/**
* put data into column agency
*
* @param {json} row The data of each row on table
*
* @return {string} agency name
*/
srvData.renderColumAgency = function(row){
	var agency = ''; //initial agency name
	var ag = JH.GetJsonValue(row,'agency'); //agency data

	if ( !ag ){return false;}

	for (var i = 0 ; i < ag.length ; i++){
		if ( agency != ''){
			agency += ', ';
		}
		agency += '<span>' + JH.GetJsonLangValue(ag[i], "agency_name") + '</span>';
	}
	return agency;
}



/**
* Add or Edit Department name
*
*/
srvData.editHydroinfo = function() {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	srvData.showEditHydroinfo(row)
}



/**
* Display modal Add or Edit hydroinfo
*
* @param {json} row row number
*
*/
srvData.showEditHydroinfo = function(row){
	var data = {}; //initial hydroinfo data
	var self = srvData; //initial data
	var jid = '#dlgEditHydroinfo'; //prefix id
	var frm = $(jid + '-form'); //element form

	$("#input-reponse").hide();
	document.getElementById('dlgEditHydroinfo-form').reset();

	frm.parsley().reset()
	$('ul.parsley-errors-list').remove()

	if (row === undefined) {
		$(jid + '-id').val('');
		$(jid + '-title').text(srvData.translator['title_add_hydroinfo'])
		$(jid +'-multiselected').val('');
		$(jid +'-multiselected').multiselect('rebuild').multiselect('updateButtonText');
		$(jid+"-form > .form-group > div").children("input").each(function(){

			var att = $(this).data(); //attrbute of element input
			var typeLang = att["key"]; //langauges name

			data[typeLang] = '';

		});

	} else {
		$(jid + '-title').text(srvData.translator['title_edit_hydroinfo'])
		$(jid +'-number').val(init_hydroinfo[row]["hydroinfo_number"]);

		var ag = JH.GetJsonValue( init_hydroinfo[row], "agency"); //agency data
		var arrAg = []; //multi agency name

		for ( i = 0 ; i < ag.length; i++){
			arrAg.push(ag[i].id);
		}
		$(jid +'-multiselected').val(arrAg);
		$(jid +'-multiselected').multiselect('rebuild').multiselect('updateButtonText');

		data = init_hydroinfo[row]["hydroinfo_name"];
		$(jid + '-id').val(init_hydroinfo[row]["id"])
	}

	$(jid+"-form > .form-group > div").children("input").each(function(){
		var att = $(this).data(); //attrbute of element input
		var typeLang = att["key"]; //langauges name
		var text = "" ; //hydroinfo data

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
* deletete data
*
*/
srvData.deleteHydroinfo	=	function(e) {

	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	var jid = '#dlgEditHydroinfo'; //prefix id
	var srv	=	self.service; //service

	$(jid + '-id').val(init_hydroinfo[row]["id"])

	var id = $(jid + '-id').val(); //id hydroinfo
	var param = {
		id : parseInt( id )
	};

	var s = self.translator['msg_delete_con'].replace('%s',init_hydroinfo[row]["hydroinfo_name"]["th"]); //message save success
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
				apiService.SendRequest("DELETE", srv, param, function(data, status, jqxhr){
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
* Event button save new  or edited department
*
*/
$('#dlgEditHydroinfo-save-btn').on('click', function(e) {
	if (srvData.saveHydroinfo('#dlgEditHydroinfo')) {
		$('#dlgEditHydroinfo').modal('hide')
	}
});



/**
* save data
*
* @param {string} jid prefix id
*
*/
srvData.saveHydroinfo = function(jid) {
	var self = srvData; //initial data
	var param = {}; //initial parameter
	var data = {}; //initial hydroninfo
	var typeLang; //langauges name
	var hydro_selected = {}; //id hydroinfo
	var frm = $(jid + '-form'); //element form

	//Chek form TH not null
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	hydro_selected	= $('#dlgEditHydroinfo-multiselected').val()
	var str_hydro	= hydro_selected.join(",");

	data = {
		th:$(jid + '-th').val(),
		en:$(jid + '-en').val(),
		jp:$(jid + '-jp').val()
	}

	var id = $(jid + '-id').val(); //id hydroinfo
	var method = "POST"; // method
	var success_msg	=	srvData.translator['msg_save_suc']; //message save success
	var srv	=	self.service; //service

	param['agency_id'] = str_hydro;
	param['hydroinfo_name'] = data;
	param['hydroinfo_number'] = parseInt( $(jid + '-number').val() );


	if(id !== ''  ){
		method	=	"PUT";
		srv	+=	'?id='+ id;
		success_msg	=	srvData.translator['msg_save_suc'];
		param['id'] = parseInt(id);

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
* Create icon for edit and delete data on datatable
*
* @param {json} row The data of each row on table
* @param {json}
* @param {json}
* @param {json}
*
* @return buttons
*/
var renderToolButtons = function(row, type, set, meta) {
	var self = srvData; //initial data
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + self.translator['btn_edit']
	+ '"></i>'
	+ '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
	+ self.translator['btn_delete'] + '"></i>'; //elment buttons on table

	return s
}
