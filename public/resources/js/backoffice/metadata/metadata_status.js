/**
*
*   Main JS application file for metadata status page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/



var mts = {};
var jid = '#dlg';
var ini_meta;

//prepare data.
mts.init = function(translator) {

	mts.translator = translator
	mts.service = 'thaiwater30/backoffice/metadata/metadata_status'

	mts.tableID = 'tbl-metadata_status'
	ctrl = $('#' + mts.tableID)
	mts.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> '+ mts.translator['btn_add_metadata_status'],
			action : mts.editMetadataStatus
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},{
			data :  mts.renderColumMetadataStatusTH,
		},{
			data :  mts.renderColumMetadataStatusEN,
		},{
			data :  mts.renderColumMetadataStatusJP,
		},{
			data : mts.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ]
	})

	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-edit', mts.editMetadataStatus)
	/* Event button edit data o datatable */
	ctrl.on('click', '.btn-delete', mts.deleteMetadataStatus)


	mts.dataTable.on('order.dt search.dt', function() {
		mts.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	apiService.SendRequest('GET', mts.service, {}, mts.previewDataTables)
}

//generate data rows on data table.
mts.previewDataTables = function(ms){
	mts.ini_meta = ms;
	mts.dataTable.clear()
	if( JH.GetJsonValue(ms , "result") != "OK"){ return false; }
	mts.dataTable.rows.add( JH.GetJsonValue(ms , "data") );
	mts.dataTable.draw()
}

//put the data into data table.
mts.renderColumMetadataStatusTH = function(row){
	return JH.GetJsonLangValue(row.metadata_status_name, 'th')
}
mts.renderColumMetadataStatusEN = function(row){
	return JH.GetJsonLangValue(row.metadata_status_name, 'en')
}
mts.renderColumMetadataStatusJP = function(row){
	return JH.GetJsonLangValue(row.metadata_status_name, 'jp')
}

/* Add or Edit Department name*/
mts.editMetadataStatus = function() {
	var row = $(this).attr('data-row');
	mts.showEditMetadataStatus(row)
}

/* Dis play modal Add or Edit Department name*/
mts.showEditMetadataStatus = function(row){
	var jid = '#dlg'
	var frm = $(jid + '-form')
	frm.parsley().reset()
	$('ul.parsley-errors-list').remove()

	if (row === undefined) {
		$(jid + '-title').text(mts.translator['add_metadata_status'])
		$('#dlg-form')[0].reset();
		$(jid + '-id').val('');
	} else {
		var id = mts.ini_meta['data'][row]['metadata_status_id']
		$(jid + '-title').text(mts.translator['edit_metadata_status'])
		$(jid + '-id').val(id);
		$(jid + '-input-th').val(mts.ini_meta['data'][row]['metadata_status_name']['th'])
		$(jid + '-input-en').val(mts.ini_meta['data'][row]['metadata_status_name']['en'])
		$(jid + '-input-jp').val(mts.ini_meta['data'][row]['metadata_status_name']['jp'])
	}

	$(jid).modal({
		backdrop : 'static'
	})
}

/*  Delete Department */
mts.deleteMetadataStatus	=	function() {
	var row = $(this).attr('data-row');
	$(jid + '-id').val(mts.ini_meta["data"][row]["metadata_status_id"])
	var id = $(jid + '-id').val()
	var srv	=	mts.service
	var st_name = mts.ini_meta['data'][row]
	var param = {
		id:id
	}
	st_name = JH.GetJsonLangValue(st_name, 'metadata_status_name',true)

	var s = mts.translator['msg_delete_con'].replace('%s',st_name)
	bootbox.confirm({
		message: s,
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' +  mts.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  mts.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function (result) {
			if(result){
				apiService.SendRequest("DELETE", srv, param, function(data, status, jqxhr){
					apiService.SendRequest('GET', mts.service, {}, mts.previewDataTables)
					if (data["result"] == "NO"){
						bootbox.alert({
							message: mts.translator['msg_delete_unsuc'],
							buttons: {
								ok: {
									label: mts.translator['btn_close']
								}
							}
						})
						return false;
					}
					bootbox.alert({
						message: mts.translator['msg_delete_suc'],
						buttons: {
							ok: {
								label: mts.translator['btn_close']
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
	if (mts.saveMetadataStatus(jid)) {
		$(jid).modal('hide')
	}
});

/*  Save From Add or Edit Department */
mts.saveMetadataStatus = function(jid) {
	var param = {};
	var frm = $(jid + '-form')

	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	var id = $(jid + '-id').val();
	var method = "POST"
	var srv	=	mts.service

	param['metadata_status_name'] = {
		th: $(jid + '-input-th').val(),
		en: $(jid + '-input-en').val(),
		jp: $(jid + '-input-jp').val()
	};

	if(id !== ''  ){
		method	=	"PUT"
		param['id'] = id;
	}

	apiService.SendRequest(method, srv, param, function(data, status, jqxhr){
		apiService.SendRequest('GET', mts.service, {}, mts.previewDataTables)
		bootbox.alert({
			message: mts.translator['msg_save_suc'],
			buttons: {
				ok: {
					label: mts.translator['btn_close']
				}
			}
		})
	})
	return true
}

/* Create icon for edit and delete data on datatable. */
mts.renderToolButtons = function(row, type, set, meta) {
	if(row.id == 1){
		s = '';
	}else{
		var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + mts.translator['btn_edit']
		+ '"></i>' + '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
		+ mts.translator['btn_delete'] + '"></i>'
	}

	return s
}
