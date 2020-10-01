/**
*
*   Main JS application file for service method page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data
var jid = '#dlgEditServiceMethod'; //prefix id
var init_sm; //inittial service method data

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {

	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script
	self.service = 'thaiwater30/backoffice/metadata/servicemethod'; //service service method

	self.groupTableId = 'tbl-servicemethod'; //id sevice method table
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + srvData.translator['btn_add_service_method'],
			action : self.editShopping
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  self.renderColumnServiceMethod,
		},
		{
			data : self.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ]
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', self.editShopping)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', self.deleteShopping)

	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
}



/**
* display data on table
*
* @param {json} data service method data
*
*/
srvData.previewDataTables = function(data){
	var self = srvData; //initial data
	init_sm = data;

	self.dataTable.clear()
	if( JH.GetJsonValue(data, 'result') != 'OK'){ return false;}
	self.dataTable.rows.add( JH.GetJsonValue(data, 'data'));
	self.dataTable.draw();
}


/**
* display form add or edit data
*
*/
srvData.editShopping = function() {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	srvData.showEditShopping(row);
}



/**
* Add or edit data
*
* @param {string} row row number
*
*/
srvData.showEditShopping = function(row){
	var self = srvData; //initial data
	var jid = '#dlgEditServiceMethod'; //prefix id of element in form
	var frm = $(jid + '-form'); //element form
	var data = {}; //service method data

	$("#input-reponse").hide();

	frm.parsley().reset()
	$('ul.parsley-errors-list').remove();

	if (row === undefined) {
		$(jid + '-id').val('');
		$(jid + "-th").val('');
		$(jid + '-title').text(srvData.translator['title_add_service_method']);

		$(jid + '-form > div ').children("input").each(function(){
			var attr 	= $(this).data(); //attribute of element
			var typeLang 	= attr["key"]; //language shortname
			data[typeLang] = '';
		});

	} else {
		$(jid + '-title').text(srvData.translator['title_edit_service_method'])
		data = init_sm["data"][row]["servicemethod_name"];
		$(jid + '-id').val(init_sm["data"][row]["id"]);
		$(jid + "-th").val(init_sm["data"][row]["servicemethod_name"]["th"])
	}

	$(jid).modal({
		backdrop : 'static'
	})
}




/**
* delete data
*
*/
srvData.deleteShopping	=	function(e) {
	var self = srvData; //initial data
	var row = self.dataTable.row( $(this).closest('tr') ); //row number
	var data = row.data(); //data in row
	var id = JH.GetJsonValue(data, "id"); //id service method
	var srv	=	self.service; //service
	var servicemethod_name = JH.GetJsonLangValue(data, "servicemethod_name",true); //service method name

	srv +=	'/'+ id

	var s = self.translator['msg_delete_con'].replace('%s',servicemethod_name); //message confirm delete
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
* Event on click of save data
*
*/
$(jid +'-save-btn').on('click', function(e) {
	if (srvData.saveShopping(jid)) {
		$(jid).modal('hide')
	}
});



/**
* save data
*
* @param {string} jid prefix id of element in form
*
*/
srvData.saveShopping = function(jid) {
	var self = srvData; //initial data
	var param = {}; //parameter
	var data = {}; //sevice method data
	var frm = $(jid + '-form'); //element form

	//Chek form TH not null
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}
	if(typeof lang === undefined || lang == null){return false}
	for(var i=0; i<lang.length; i++){
		type_lang = lang[i]
		data[type_lang] = $(jid + '-'+ type_lang).val()
	}

	var id = $(jid + '-id').val();
	var method = "POST"; //method
	var success_msg	=	srvData.translator['msg_save_suc']; //message save success
	var srv	=	self.service;  //service

	param['servicemethod_name'] = data;
	param['id'] = 0;


	if(id !== ''  ){
		method	=	"PUT"
		srv +=	'/'+ id
		success_msg	=	srvData.translator['msg_save_suc']
		param['id'] = parseInt( id );
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
* display buttons on table
*
* @param {json} row service method data
* @param {json} type
* @param {json} set
* @param {json} meta data of table
*
*/
srvData.renderToolButtons = function(row, type, set, meta) {
	var self = srvData; //initial data
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + self.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
	+ self.translator['btn_delete'] + '"></i>'; //element buttons on table

	return s
}



/**
* put data into column Service Method
*
* @param {json} row service method data
*
*/
srvData.renderColumnServiceMethod = function(row){
	return JH.GetJsonLangValue(row, 'servicemethod_name', true);
}
