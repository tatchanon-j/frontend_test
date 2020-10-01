/**
*
*   Main JS application file for frequency page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvData = {}; //initial data
var init_frequency; //

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {

	var self = srvData; //initial data //initila data
	self.translator = translator; //Text for label and message on java script
	self.service = 'thaiwater30/backoffice/metadata/frequencyunit'; //service frequency
	self.cannotDelete = ['1','2','3']; //frequencyunit id do not delete

	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
		})
	})

	params = {
		table : "m_canal_station",
		key : "canal_station_oldcode",
	}

	self.groupTableId = 'tbl-frequncy' //Get ElementID dataTable
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + self.translator['btn_add_frequency'],
			action : self.addFreequncy
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},

		{
			data :  srvData.renderColumfrequncy,
		},

		{
			data : renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ ],
		rowCallback : self.dataTableRowCallback
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', self.addFreequncy)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', self.deleteFreequncy)


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
* Display table
*
* @param {json} data frequency data
*
*/
srvData.previewDataTables = function(data){
	var a = []; //frequency data to put on table
	var self = srvData; //initial data
	init_frequency = data;
	var data = apiService.getFieldValue(data,'data'); //initial frequency data

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
* put data on column frequency
*
* @param {json} frequncy frequency data each row on table
*
* @return {string} frequncy
*/
srvData.renderColumfrequncy = function(frequncy){
	if(frequncy["frequencyunit_name"]["th"]){
		return frequncy["frequencyunit_name"]["th"]
	}
	return ''
}




/**
* Add or Edit Department name
*
*/
srvData.addFreequncy = function() {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	srvData.showEditFreequncy(row);

}



/**
* Display modal Add or Edit Freequncy name
*
* @param {json} row row number
*
*/
srvData.showEditFreequncy = function(row){
	var self = srvData; //initial data
	var jid = '#dlgEditFrequncy'; //prefix id
	var data = {}; //initial frequncy data
	var frm = $(jid + '-form'); //element form

	frm.parsley().reset();
	$('ul.parsley-errors-list').remove();

	if (row === undefined) {
		$(jid + '-id').val('');
		$(jid + '-title').text(srvData.translator['title_add_frequency'])
		$('#dlgEditFrequncy-th').val('')
		$('#dlgEditFrequncy-convert').val('');
	} else {
		var id = init_frequency["data"][row]["id"]; //frequncy id

		$(jid + '-title').text(srvData.translator['title_edit_frequency']);
		data = init_frequency["data"][row]["frequencyunit_name"];
		$(jid + '-id').val(id);
		$('#dlgEditFrequncy-th').val(data["th"])
		$('#dlgEditFrequncy-convert').val(init_frequency["data"][row]["convert_minute"]);

		if ( typeof self.cannotDelete[id] === "undefined" ){
			$('#dlgEditFrequncy-convert').prop('disable', false);
		}else{
			$('#dlgEditFrequncy-convert').prop('disable', true);
		}
	}

	$(jid).modal({
		backdrop : 'static'
	})
}



/**
* Event button save new  or edited department
*
*/
$('#dlgEditFrequncy-save-btn').on('click', function(e) {
	if (srvData.saveFrequncy('#dlgEditFrequncy')) {
		$('#dlgEditFrequncy').modal('hide')
	}
});



/**
* delete data
*
*/
srvData.deleteFreequncy	=	function(e) {
	var row = $(this).attr('data-row'); //row number
	var self = srvData; //initial data
	var jid = '#dlgEditFrequncy'; //prefix id
	var param = {}; //initial parameter
	var data = {};
	var id = init_frequency["data"][row]["id"]; //id frequency
	var srv	=	self.service; //

	srv +=	'/'+ id
	var frequncy_name = init_frequency["data"][row]["frequencyunit_name"]["th"]

	//Alert confirm to delete
	var s = self.translator['msg_delete_con'].replace('%s',frequncy_name)
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
* save data
*
* @param {string} jid prefix id
*/
srvData.saveFrequncy =function(jid) {
	var self = srvData; //initial data
	var param = {}; //initial parameter
	var data = {}; // initial frequency
	var frm = $(jid + '-form'); //element form

	//Chek form TH not null
	frm.parsley().validate()
	if(!frm.parsley().isValid()){
		return false
	}

	data["th"] = $('#dlgEditFrequncy-th').val();

	var id = $(jid + '-id').val(); //id frequency
	var method = "POST"; //method
	var success_msg	=	srvData.translator['msg_save_suc']; //message save success
	var srv	=	self.service; //serice

	param['frequencyunit_name'] = data;
	param['id'] = "";
	param['convert_minute'] = $('#dlgEditFrequncy-convert').val();

	//console.log("ID : ",id);

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
* Create icon for edit and delete data on datatable.
*
* @param {row} the data each row on table
* @param {type}
* @param {set}
* @param {meta}
*
* @return element button
*/
var renderToolButtons = function(row, type, set, meta) {
	var self = srvData; //initial data
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="'+ self.translator['btn_edit'] +'"></i>'; //just edit button
	var id = JH.GetJsonValue(row, "id"); //id frequency
	if(typeof self.cannotDelete[id] === 'undefined') {
		s += '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'+ self.translator['btn_delete'] + '"></i>';
	}
	return s
}
