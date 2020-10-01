/**
*
*   Main JS application file for ministry page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data
var init_ministry; //inittail ministry data

//prepare data.
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service = 'thaiwater30/backoffice/metadata/ministry'; //serevice ministry

	/* Genalate DataTable*/
	self.groupTableId = 'tbl-ministry';
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> '+ srvData.translator['btn_add_ministry'],
			action : self.editMinistry
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
			data : srvData.renderColumShortname,
		},{
			data : renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', self.editMinistry)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', self.delleteMinistry)


	$('#btn-save').on('click', function(e) {
		if (srvData.saveMinistry('#dlgEditMinistry')) {
			$('#dlgEditMinistry').modal('hide')
		}
	});

	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();



	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
		})
	})

	/* Generate element input Ministry according language on web */
	$(document).ready(function(){
		if(typeof lang === undefined || lang == null){return false}
		for (var i = 0; i<lang.length; i++){
			var langauges = lang[i]; //langauges shortname
			var upName = langauges.toUpperCase(); //langauges shortname upercase

			if(langauges == "th"){
				$("#dlgEditMinistry-form").append('<div class="form-group row ministry_name"> <label class="col-form-label text-sm-right col-sm-3"for="dlgEditMinistry-name"><span class="color-red"> *</span>'+translator['label_ministry']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditMinistry-'+langauges+'" type="text" class="form-control" name="ministry" data-key="th" data-parsley-required data-parsley-error-message="'+self.translator['msg_err_require']+'"/> </div> </div> <div class="form-group row short_name"> <label class="col-form-label text-sm-right col-sm-3"for="dlgEditMinistry-name">'+srvData.translator['short_name']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditMinistry-short_name_'+langauges+'" class="form-control" type="text" name="shotname" data-key="'+langauges+'" ></input> </div> </div>');
			}else {
				$("#dlgEditMinistry-form").append('<div class="form-group row ministry_name"> <label class="col-form-label text-sm-right col-sm-3"for="dlgEditMinistry-name">'+translator['label_ministry']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditMinistry-'+langauges+'" type="text" class="form-control" name="ministry" data-key="'+langauges+'"/> </div> </div> <div class="form-group row short_name"> <label class="col-form-label text-sm-right col-sm-3"for="dlgEditMinistry-name">'+srvData.translator['short_name']+' ('+upName+'):</label> <div class="col-sm-9"> <input id="dlgEditMinistry-short_name_'+langauges+'" class="form-control" type="text" name="shotname" data-key="'+langauges+'" ></input></div></div>');
			}
		}
	})


	/* Get data from service to add on datatable */
	apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
}

/**
* Render data to display on colum Ministry Thai lanaguage
*
* @param {json} row Data to Add on datable
*
* @return {json} row["th"]
* @return ''
*/
srvData.renderColumTH = function(row){

	if(row["ministry_name"]["th"]){
		return row["ministry_name"]["th"]
	}
	return ''
}

/**
* Render data to display on colum Ministry English lanaguage
*
* @param {json} row Data to Add on datable
*
* @return {json} row["en"]
* @return ''
*/
srvData.renderColumEN = function(row){

	if(row["ministry_name"]["en"]){
		return row["ministry_name"]["en"]
	}
	return ''

}

/**
* Render data to display on colum Ministry Japan lanaguage
*
* @param {json} row Data to Add on datable
*
* @return {json} row["jp"]
* @return ''
*/
srvData.renderColumJP = function(row){

	if(row["ministry_name"]["jp"]){
		return row["ministry_name"]["jp"]
	}
	return ''
}

/**
* Render data to display on colum Shortname
*
* @param {json} row Data to Add on datable
*
* @return {json} row["short_name"]
* @return ''
*/
srvData.renderColumShortname = function(row){
	if(row["ministry_shortname"]["th"]){
		return row["ministry_shortname"]["th"]
	}
	return ''
}

/**
* Push data on row data table
*
* @param {json} data The data from service
*
*/
srvData.previewDataTables = function(data){

	if(data["result"] != "OK"){
		return false
	}

	var self = srvData; //initial data
	init_ministry = data;

	self.dataTable.clear()
	self.dataTable.rows.add(data["data"])
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
* @param {json} e
*
*/
srvData.editMinistry = function() {

	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	srvData.showEditMinistry(row)
}

/**
* Display modal for Add or Edit data.
*
* @param {json} row
*
*/
srvData.showEditMinistry = function(row){
	var self = srvData; //initial data
	var jid = '#dlgEditMinistry'; //
	var data = {}; //
	var frm = $(jid + '-form'); //

	frm.parsley().reset()
	$('ul.parsley-errors-list').remove()

	if (row === undefined) {

		$(jid + '-id').val('');
		$(jid + '-title').text(srvData.translator['add_ministry'])
		$(jid + '-form')[0].reset();
	}
	else {
		$(jid + '-title').text(srvData.translator['edit_ministry'])
		data = init_ministry["data"][row];

		$(jid + '-id').val(init_ministry["data"][row]["id"]);
		$(jid + '-title').attr(jid + '-title');
		$(jid + '-short_name').val(init_ministry["data"][row]["ministry_shortname"]["th"]);
		$('#code').val(init_ministry["data"][row]["ministry_code"]);

		$(jid + "-form > div.ministry_name > div").children("input").each(function(){
			var frm_lang = $(this).attr('data-key'); //langauge shortname
			var text = "" ; //ministry name multi language

			if ( data["ministry_name"][frm_lang] != "undefined" ){
				text = data["ministry_name"][frm_lang];
			}

			$(jid + '-'+frm_lang).val(text)

		});

		$(jid + "-form > div.short_name > div").children("input").each(function(){
			var frm_lang = $(this).attr('data-key'); //lanaguage shortname
			var text = "" ; //ministry shortname multi language

			if ( data["ministry_shortname"][frm_lang] != "undefined" ){
				text = data["ministry_shortname"][frm_lang];
			}

			$(jid + '-short_name_'+frm_lang).val(text)

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
srvData.delleteMinistry = function(e){

	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	var jid = '#dlgEditMinistry'; //prefis id
	var param = {}; //parameter
	var data = {};

	$(jid + '-id').val(init_ministry["data"][row]["id"]);

	var id = $(jid + '-id').val(); //id ministry
	var srv	=	self.service; //service ministry
	srv +=	'/'+ id;
	var ministry = init_ministry["data"][row]["ministry_name"]["th"]; //ministry thai name

	var s = self.translator['msg_delete_con'].replace('%s',ministry)
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
srvData.saveMinistry = function(jid) {
	var self = srvData; //initial data
	var param = {}; //initial parameter
	var data = {}; //ministry name
	var shortname = {}; //ministry short name
	var frm = $(jid + '-form'); //elemenform save ministry

	//Chek form TH not null
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	// Set value of data to save
	$(jid + '-form > div.ministry_name > div').children("input").each(function(){

		var frm_lang = $(this).attr('data-key'); //langauge shortname

		data[frm_lang] = $(jid + '-'+frm_lang).val();
	})

	$(jid + '-form > div.short_name > div').children('input').each(function(){
		var frm_lang = $(this).attr('data-key');
		shortname[frm_lang] = $(jid + '-short_name_' + frm_lang).val();
	})

	// if save as Add new
	var id = $(jid + '-id').val(); //id ministry
	var method = "POST"; //method
	var srv	=	self.service; //service ministry

	param['ministry_name'] = data;
	param['id'] = "";
	param['ministry_shortname'] = shortname;
	param['ministry_code'] = $('#code').val();

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
