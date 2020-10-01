/**
*
*   Main JS application file for management systems page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvGroup = {}; //initial data

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvGroup.init = function(lang, translator) {
	var self = srvGroup; //initial data
	self.groupTableId = 'tbl-group';
	self.GroupNameSeperator = ":";
	self.lang = lang;
	self.translator = translator;

	self.initGroupDataTable()
	self.initMultiSelect()

	$('#dlgEditGroup-save-btn').on('click', self.saveGroup)

	apiService.SendRequest('GET', "uac/groups-services-realms", null, self.loadDataTable)
}


/**
* setting group data table.
*
*/
srvGroup.initGroupDataTable = function () {
	var self = srvGroup; //initial data

	ctrl = $('#' + self.groupTableId); //id of table
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + self.translate('add_group'),
			action : self.addGroup
		} ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},{
			data : 'full_name',
		},
		{
			data : 'full_description',
		}, {
			data: self.renderActive
		},{
			data : self.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 2, 'asc' ] ],
	})

	$.fn.dataTable.ext.search.push(self.filterData)

	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	ctrl.on('click', '.btn-edit', self.editGroup)
	ctrl.on('click', '.btn-delete', self.deleteGroup)
	ctrl.on('click', '.btn-undelete', self.unDeleteGroup)
}


/**
* setting field multiselect on page.
*
*/
srvGroup.initMultiSelect = function() {
	var self = srvGroup; //initial data

	self.lastFilterStatus = [ "1", "2"]; //default slected on filter display menu
	var gfs = $('#group-filters-status'); //group filter status element

	gfs.multiselect({
		includeSelectAllOption : true,
		selectAllText : self.translate('filter_status_all'),
		allSelectedText : self.translate('filter_status_all_selected'),
		nonSelectedText : self.translate('filter_status_none_selected'),
		selectAllNumber : false,
		onChange : self.onFilterStatusChange,
		onSelectAll : self.onFilterStatusChange
	})
	gfs.multiselect('select', self.lastFilterStatus)

	$('#group-filters-status,#dlgEditGroup-services').multiselect({
		buttonWidth : '100%',
		maxHeight : 300,
		includeSelectAllOption : true,
		selectAllNumber : false,
		enableFiltering: true,
		selectableOptgroup: true,
		selectAllText : self.translate('select_all'),
		allSelectedText : self.translate('all_selected'),
		nonSelectedText : self.translate('none_selected'),
	})
}


/**
* message to translate.
*
* @param {string} msg message for display
*
* @return {string} message for display
*/
srvGroup.translate = function (msg) {
	if (typeof srvGroup.translator != "object" || srvGroup.translator == null) {
		return msg
	}

	var v = srvGroup.translator[msg]
	if ( v === undefined ) {
		return msg
	}
	return v
}


/**
* put data into column on table.
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
* @return {string} message on filter
*/
srvGroup.renderActive = function(row, type, set, meta) {
	var self = srvGroup; //initial data
	if (row.is_deleted) {
		return self.translate('deleted')
	} else if (row.is_active) {
		return self.translate('active')
	} else {
		return self.translate('inactive')
	}
}


/**
* Add status on column status
*
* @param {json} row element
* @param {json} data the data for the whole row
* @param {json} index index of colunmn
*
*/
srvGroup.dataTableRowCallback = function(row, data, index) {
	var td = $('td', row).eq(3); //element

	if (data.is_deleted) {
		td.removeClass('group_active group_inactive')
		td.addClass('group_deleted')
	} else if (data.is_active) {
		td.removeClass('group_deleted group_inactive')
		td.addClass('group_active')
	} else {
		td.removeClass('group_deleted group_active')
		td.addClass('group_inactive')
	}
}


/**
* create button on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
* @return {string}
*/
srvGroup.renderToolButtons = function(row, type, set, meta) {
	var self = srvGroup; //initial data
	var s = '<i class="btn btn-edit" title="' + self.translate('edit_group')
			+ '"></i>'; //prepare element buttons
	if (row.is_deleted) {
		s += '<i class="btn btn-undelete" title="'
				+ self.translate('undelete_group') + '"></i>'
	} else {
		s += '<i class="btn btn-delete" title="'
				+ self.translate('delete_group') + '"></i>'
	}

	return s
}


/**
* selected check box
*
* @param {json} e eleemnt
*
*/
srvGroup.checkBoxTextClick = function(e) {
	var ctrl = $(e.target).prevAll('input[type=checkbox]'); //element check box
	ctrl.prop('checked', !ctrl.prop('checked'));
}


/**
* render data on table according filter status.
*
*/
srvGroup.onFilterStatusChange = function() {
	var self = srvGroup; //initial data
	var gfs = $('#group-filters-status'); //group filters status element
	var v = gfs.val(); //status

	if (v == null) {
		v = []
	}

	// When select all was click -- there will be 2 event -- change and
	// selectall
	// So check to prevent double update
	if (self.lastFilterStatus !== undefined
			&& self.lastFilterStatus.length == v.length) {
		for (var i = 0; i < v.length; i++) {
			if (self.lastFilterStatus[i] != v[i]) {
				break
			}
		}
		if (i == v.length) {
			return;
		}
	}
	self.lastFilterStatus = v
	self.dataTable.draw()
}


/**
* AAA
*
* @param {json} settings element data
* @param {array} cols
* @param {int} dataIndex
*
*/
srvGroup.filterData = function(settings, cols, dataIndex) {
	var self = srvGroup; //initial data
	var data = self.dataTable.rows(dataIndex).data()[0]; //element

	if (settings.sTableId != self.groupTableId) {
		return true
	}

	// Datatable use a global filterData callback, so we must check
	// that we currently work on group table
	if (self.ignoreStatusFilter || data === undefined
			|| data.is_active === undefined || data.is_deleted === undefined) {
		return true
	}

	for (var i = 0; i < self.lastFilterStatus.length; i++) {
		switch (parseInt(self.lastFilterStatus[i])) {
		case 1:
			if (data.is_active && !data.is_deleted) {
				return true
			}
			break;
		case 2:
			if (!data.is_active && !data.is_deleted) {
				return true
			}
			break;
		case 3:
			if (data.is_deleted) {
				return true
			}
			break;
		}
	}

	return false
}


/**
* put data into data table.
*
* @param {json} data menu data
* @param {string} status status of response data
* @param {json} jqXHR the data of element
* @param {string} success_msg message response
*
*/
srvGroup.loadDataTable = function(data, textStatus, jqXHR, success_msg) {
	var self = srvGroup; //initial data

	self.Realms = {}; //prepare realm
	var rs = []; //realm data

	$.each(data.realms, function (i, realm) {
		realm.srv_groups = []
		self.Realms[realm.id] = realm
		rs.push(realm)
	})
	rs.sort(function(a,b) { return a.name.localeCompare(b.name)})
	self.realm_select_options = ""
	$.each(rs,function(i,realm) {
		self.realm_select_options += '<option value="'  + realm.id + '">' + realm.name + '</option>'
	})

	self.Groups = {}

	// Make group hashmap
	var sep = self.GroupNameSeperator
	self.uiComponents = []
	$.each(data.groups, function (i, grp) {
		realm = self.Realms[grp.permission_realm_id]

		grp.full_name = realm.name + sep + grp.name
		grp.full_description = realm.description + sep + grp.description

		self.Groups[grp.id] = grp
		if ( grp.category == 'srv') {
			realm.srv_groups.push(grp)
			self.uiComponents.push(grp)
		}
	})
	self.uiComponents.sort(function(a,b){ return a.full_description.localeCompare(b.full_description)})

	self.dataTable.clear()
	self.dataTable.rows.add(self.uiComponents)
	self.dataTable.draw()

	var ss = []
	$.each(data.services, function (i, srv) {
		var l = srv.module_name

		if ( srv.module_description != '' ){
			l += ' (' + srv.module_description + ')'
		}
		if ( srv.name != '' ) {
			l += '/' + srv.name
			if (srv.description != "" ) {
				l += '(' + srv.description + ')'
			}
		}
		l += ' ' + srv.method_name
		l += ' (' + srv.version_name + ')'

		srv.full_name = l
		ss.push(srv)
	});

	ss.sort(function(a,b) { return a.full_name.localeCompare(b.full_name)})
	self.services_select_options = '<option value="0">No Service</option>';
	$.each(ss,function(i,srv) {
		self.services_select_options += '<option value="'  + srv.id + '">' + srv.full_name + '</option>'
	})
}


/**
* update data table.
*
* @param {json} data menu data
* @param {string} status status of response data
* @param {json} jqXHR the data of element
* @param {string} success_msg message response
*
*/
srvGroup.updateDataTablesRow = function(data, textStatus, jqXHR, success_msg) {
	var self = srvGroup; //initial data
	var sep = self.GroupNameSeperator; // separator
	var realm = self.Realms[data.permission_realm_id]; //permission realm id

	data.full_name = realm.name + sep + data.name
	data.full_description = realm.description + sep + data.description

	var found_row = false

	if (srvGroup.currentRow == null ) {
		self.dataTable.row.add(data)
	} else {
		var olddata = self.currentRow.data()[0]
		$.each(olddata,function(i,v){
			olddata[i] = data[i]
		})
		srvGroup.currentRow.invalidate();
	}

	self.dataTable.draw(true);
	bootbox.alert({
		message: success_msg.replace('%s', data.name),
		buttons: {
			ok: {
				label: self.translator['btn_close']
			}
		}
	})
}


/**
* add new menu data.
*
* @param {json} e
* @param {string} dt
* @param {json} node
* @param {json} config
*/
srvGroup.addGroup = function(e, dt, node, config) {
	srvGroup.currentRow = null
	srvGroup.showEditGroup()
}


/**
* get data from row to edit.
*
* @param {json} e element
*
*/
srvGroup.editGroup = function(e) {
	srvGroup.currentRow = srvGroup.dataTable.rows($(e.target).closest('tr')); //element data
	srvGroup.showEditGroup()
}


/**
* display data to edit menu.
*
*/
srvGroup.showEditGroup = function() {
	var self = srvGroup; //initial data
	var data = null; //prepare group data

	if ( self.currentRow != null) {
		data = self.currentRow.data()[0]
	}

	var jid = '#dlgEditGroup'; //prefix id

	self.currentGroup = data; //group data

	if (data === undefined || data == null) {
		$(jid + '-title').text(self.translate('add_group'))
		data = {
			id : '',
			realm : 0,
			category : 'srv',
			name : '',
			description : '',
			is_active : true,
			subgroups : []
		}
	} else {
		$(jid + '-title').text(self.translate('edit_group'))
	}

	$(jid + '-category').val(data.category);
	$(jid + '-name').val(data.name);
	$(jid + '-description').val(data.description);
	$(jid + '-permission_realm_id').html(self.realm_select_options);
	$(jid + '-permission_realm_id').val(data.permission_realm_id);

	if (data.is_active) {
		$(jid + '-is_active-active').prop('checked', true);
	} else {
		$(jid + '-is_active-inactive').prop('checked', true);
	}

	var frm = $(jid + '-form'); //form element
	var opt = {}; //data group

	if (g_parsleyOptions !== undefined) {
		opt = g_parsleyOptions
	}

	var ctrl = $(jid+'-services')
	ctrl.html(self.services_select_options)
	ctrl.val(data.services)
	ctrl.multiselect('rebuild')

	$(jid + '-services').parent().find('input').prop('name','_dummy')
	frm.parsley(opt).reset()

	$(jid).modal({
		backdrop : 'static'
	})
}


/**
* save menu data.
*
*/
srvGroup.saveGroup = function() {
	var self = srvGroup; //initial data
	var jid = '#dlgEditGroup'; //prefix id
	var frm = $(jid + '-form'); //form element

	$(jid + '-services').parent().find('input').prop('name','_dummy');

	frm.parsley().validate();

	if (!frm.parsley().isValid()) {
		return false
	}

	$(jid + '-services').parent().find('input').prop('name','');

	var gname = $(jid + '-name').val(); //group name
	var method; //method
	var id; // group id
	var success_msg; //message save success

	if ( self.currentGroup == null ) {
		method = "POST";
		id = "";
		success_msg = self.translate('msg_save_suc');
	} else {
		method = "PUT";
		id = "/" + self.currentGroup.id;
		success_msg = self.translate('msg_save_suc');
	}

	apiService.SendRequest(method, "uac/group" + id, frm,
		function(data, status, jqxhr) {
			$(jid).modal('hide')
			self.updateDataTablesRow(data, status, jqxhr,success_msg)
		},
		function(jqXHR, textStatus, errorThrown) {
			apiService.cbServiceAjaxError(apiService.lastURL,jqXHR, textStatus, errorThrown)
		}
	)
}

/**
* delete menu data.
*
* @param {json} e element
*
*/
srvGroup.deleteGroup = function(e) {
	var self = srvGroup; //initial data
	srvGroup.currentRow = srvGroup.dataTable.rows($(e.target).closest('tr')); //element
	var d = srvGroup.currentRow.data()[0]; //the data for the whole row

	if ( d.subgroups !== undefined && d.subgroups != null && d.subgroups.length > 0 )
	{
		bootbox.alert("Please delete all subcomponents of this UI component first")
		return
	}

	var s = self.translate('delete_prompt').replace('%s', d.name); //message confirm delete

	bootbox.confirm({
		message: s,
		reorder:true,
		buttons:{
			confirm:{
				label:'<i class="fa fa-check"></i> ' +  self.translator['btn_confirm'],
				className:'btn-success'
			},
			cancel:{
				label:'<i class="fa fa-times"></i> ' +  self.translator['btn_cancel'],
				className:'btn-danger'
			}
		},
		callback: function(result){
			if(result){
				var success_msg = self.translate('success_delete')
				apiService.SendRequest("DELETE", "uac/group/" + d.id, null,
					function(data, status, jqxhr) {
						d.is_deleted = true
						self.updateDataTablesRow(d, status, jqxhr,success_msg)
					})
			}
		}
	})
}


/**
* recover deleted menu data.
*
* @param {json} e element
*
*/
srvGroup.unDeleteGroup = function(e) {
	var self = srvGroup; //initial data
	srvGroup.currentRow = srvGroup.dataTable.rows($(e.target).closest('tr')); //element
	var d = srvGroup.currentRow.data()[0]; //the data for the whole row
	var s = self.translate('undelete_prompt').replace('%s', d.name); //message confirm recover deleted data


	bootbox.confirm({
		message: s,
		reorder:true,
		buttons:{
			confirm:{
				label:self.translator['btn_confirm'],
			},
			cancel:{
				label:self.translator['btn_cancel'],
			}
		},
		callback: function(result){
			if(result){
				var success_msg = self.translate('success_undelete'); //message recover success
				apiService.SendRequest("PUT", "uac/undelete_group/" + d.id, null,
						function(data, status, jqxhr) {
							d.is_deleted = false
							self.updateDataTablesRow(d, status, jqxhr,success_msg)
						}
				)
			}
		}
	})
}
