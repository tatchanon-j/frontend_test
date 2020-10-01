var evt = {}; //Initial data
var jid = '#dlgEditBlacklist'; // front from id on modal.

evt.init = function(translator) {
	evt.translator = translator; //Text for label and message on java script

	evt.service_event_load = 'thaiwater30/backoffice/event_management/event_load'; //url for call service event load to get data option
	evt.service_event	=	'thaiwater30/backoffice/event_management/event'; //url for call service event

	evt.blacklisttableId = 'tbl-blacklist'; //datatable id
	ctrl = $('#' + evt.blacklisttableId);
	evt.dataTable = ctrl.DataTable({
		dom : 'frl<"activebtn">Btip',
		buttons : [ {
			text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> เพิ่ม',
			action : evt.editBlacklist
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : evt.renderColumCode,
		},  {
			data : evt.renderColumEventype,
		}, {
			data : evt.renderColumColor,
		}, {
			data : evt.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : evt.dataTableRowCallback,
		initComplete: function(){
            $("div.activebtn").html('<input class="bt-toggle" type="checkbox" data-toggle="toggle" data-onstyle="primary" data-offstyle="danger">');
		 },
		 fnDrawCallback : function(){
			 $(".bt-toggle").bootstrapToggle({
				 on : "Active",
				off : "Inactive"
			 })
		 }
	})

	// generate order number on data table.
	evt.dataTable.on('order.dt search.dt', function() {
		evt.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	//event on click buttons.
	ctrl.on('click', 'i.btn-edit', evt.editBlacklist);
	ctrl.on('click', 'i.btn-delete', evt.deleteBlacklist);

	// display data table.
	apiService.SendRequest('GET', evt.service_event_load,{},evt.displayDataTables);
}

/**
* Put data to rows on data table.
*
* @param {json} event_load data to put on data table.
*/
evt.displayDataTables = function(event_load){
	evt.dataTable.clear();
	if ( JH.GetJsonValue(event_load , "result") != "OK"){ return false; }
	evt.event_load = event_load;
	evt.dataTable.rows.add( JH.GetJsonValue(event_load , "data") );
	evt.dataTable.draw();
}


evt.renderColumCode = function(row, type, set, meta){
	//return JH.GetJsonValue(row,'code');
	return 'localhost';
}


evt.renderColumEventype = function(row, type, set, meta){
	//return JH.GetJsonLangValue(row,'description');
	return '26/06/2563';
}


evt.renderColumColor = function(row, type, set, meta){
	//return JH.GetJsonValue(row, 'color');
	return 'remark......................................................................';
}


evt.renderToolButtons = function(row, type, set, meta) {
	var s = '<i class="btn btn-edit" data-row="'+meta.row+'" data-id="'+row.id+'" title="' + evt.translator['btn_edit']
	+ '"></i>' + '<i class="btn btn-delete" data-row="'+meta.row+'"  data-id="'+row.id+'" title="'
	+ evt.translator['btn_delete'] + '"></i>';

	return s;
}


/**
* Diaply modal for add new data.
*/
evt.addBlacklist = function(){
	evt.showEditEvent();
}

/**
* Diaply modal for edit data.
*/
evt.editBlacklist = function(){
	var row = $(this).attr('data-row');
	evt.showEditEvent(row);
}

/**
* disaplay modal for add or edit data.
*
* @param {json} row The index cell on data table.
*/
evt.showEditEvent = function(row){

	//display modal.
	$('#dlgEditBlacklist').modal({
		backdrop : 'static'
	});
}

evt.saveBlacklist = function(){
	$(jid).modal('hide');
}

evt.deleteBlacklist = function(){
	var param = {}; //Parameter to send to web service
	var row = $(this).attr('data-row'); //row number
	var s = row


	param['id'] = row;

	//alert delete confirm.
	bootbox.confirm({
		message:s,
		reorder: true,
		buttons:{
			confirm:{
				label: '<i class="fa fa-check"></i> ' +  evt.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  evt.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				apiService.SendRequest('DELETE', evt.service_event, param, function(data, status, jqxhr){
					//alert delete result.
					if (data["result"] == "NO"){
						bootbox.alert({
							message: evt.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: evt.translator['btn_close']
								}
							}
						});
						return false;
					}
					bootbox.alert({
						message: evt.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: evt.translator['btn_close']
							}
						}
					});
				} , function(err){
				});
				return true
			}
		}
	});

}
