/**
*
*   Main JS application file for group page.
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
srvGroup.init = function(lang,translator) {
	var self = srvGroup; //initial dat
	self.translator = translator; //Text for label and message on javascript
	self.groupTableId = 'tbl-group'; //id of table group
	self.nameSeperator = ':'; //separator

	self.initGroupDataTable();
	self.initViewUserDataTable();
	self.initMultiSelect();

	$('#dlgEditGroup-permission_realm_id').on('change',self.onChangeDlgEditGroupPermissionRealmID);
	$('#dlgEditGroup-save-btn').on('click', self.saveGroup);

	apiService.SendRequest('GET', "uac/groups-realms", null, self.loadDataTable);

	// seting dropdown multiselect
	$('#dlgEditGroup-subgroups').each(function(i, e) {
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
}


/**
* setting group data table
*
*/
srvGroup.initGroupDataTable = function () {
	var self = srvGroup; //initial data
	ctrl = $('#' + self.groupTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + srvGroup.translator['group_users'],
			action : self.addGroup
		},'excel' ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : 'full_name',
		}, {
			data : 'full_description',
		}, {
			data : 'ui_color',
			searchable : false,
		}, {
			data : self.renderActive,
			searchable : false,
		}, {
			data : self.renderToolButtons,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
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
	ctrl.on('click', '.btn-users', self.viewUsers)
	ctrl.on('click', '.btn-delete', self.deleteGroup)
	ctrl.on('click', '.btn-undelete', self.unDeleteGroup)
}


/**
* setting user tables in group.
*
*/
srvGroup.initViewUserDataTable = function() {
	var self = srvGroup; //initial data
	var jid = '#dlgViewUsers'; //prefix id of elemet in form
	ctrl = $(jid + '-tbl');

	self.dataTableViewUser = ctrl.DataTable({
		dom : 'frtlip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : 'account',
		}, {
			data : 'full_name',
		}, {
			data : self.renderUserActive,
			searchable : false,
		} ],
		order : [ [ 2, 'asc' ] ],
		rowCallback : self.dataTableViewUsersRowCallback
	})

	self.dataTableViewUser.on(
		'order.dt search.dt',
		function() {
			if (self.dataTableViewUser === undefined
				|| self.dataTableViewUser == null) {
					return;
				}
				self.dataTableViewUser.column(0, {
					search : 'applied',
					order : 'applied'
				}).nodes().each(function(cell, i) {
					cell.innerHTML = i + 1;
				});
	})
}


/**
* setting field multiselect.
*
*/
srvGroup.initMultiSelect = function() {
	var self = srvGroup; //initial data
	self.lastFilterStatus = [ "1", "2" ];
	var gfs = $('#group-filters-status'); //group filter eleemnt

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
* translate message in filter display.
*
* @param {string} msg message on filter display
*
* @return {string} message on filter display
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
* render message to display on column statun on table group.
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
* @return {string} option name
*/
srvGroup.renderActive = function(row, type, set, meta) {
	var self = srvGroup
	if (row.is_deleted) {
		return self.translate('deleted')
	} else if (row.is_active) {
		return self.translate('active')
	} else {
		return self.translate('inactive')
	}
}


/**
* setting background color for column color on group table.
*
* @param {json} row The data for the whole row
* @param {json} data The data type requested for the cell
* @param {json} index Value to set if the type parameter is set. Otherwise, undefined.
*/
srvGroup.dataTableRowCallback = function(row, data, index) {
	var td = $('td', row).eq(3); //column color element

	if(data.ui_color){
		td.css({'background-color':'#'+data.ui_color})
	} else{
		td.css({'background-color':''})
	}
}


/**
* gnerate buttons into table.
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
* @return {string} button element
*
*/
srvGroup.renderToolButtons = function(row, type, set, meta) {
	var self = srvGroup; //initial data
	var s = '<i class="btn btn-edit" title="' + self.translate('edit_group')
	+ '"></i>' + '<i class="btn btn-users" title="'
	+ self.translate('view_users') + '"></i>'; //initial button element
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
* update status on display data to edit.
*
* @param {json} e data of element
*
*/
srvGroup.checkBoxTextClick = function(e) {
	var ctrl = $(e.target).prevAll('input[type=checkbox]'); //element check box
	ctrl.prop('checked', !ctrl.prop('checked'))
}


/**
* get data filter.
*
*/
srvGroup.onFilterStatusChange = function() {
	var self = srvGroup; //initial data
	var gfs = $('#group-filters-status'); //group filter status element
	var v = gfs.val(); //status data
	if (v == null) {
		v = []
	};

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
* Check filter status to display data
*
* @param {json} translator Text for use on page
*
* @return {boolean} status
*/
srvGroup.filterData = function(settings, cols, dataIndex) {
	var self = srvGroup; //initial data
	var data = self.dataTable.rows(dataIndex).data()[0]; //the data for the whole row

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
* put data into table.
*
* @param {json} data realm data
* @param {json} textStatus
* @param {json} jqXHR
* @param {json} success_msg
*
*/
srvGroup.loadDataTable = function(data, textStatus, jqXHR, success_msg) {
	var self = srvGroup; //initial data

	// Extract all user group
	var ugroups = []; //prepare group data

	// Make group map and user group list
	self.Realms = {}
	var rs = []; //prepare realm data
	$.each(data.realms, function (i, realm) {
		realm.srv_groups = []
		self.Realms[realm.id] = realm
		if ( realm.is_deleted ) {
			return
		}
		rs.push(realm)
	});
	rs.sort(function(a,b) { return a.name.localeCompare(b.name)})
	self.realm_select_options = ""
	$.each(rs,function(i,realm) {
		self.realm_select_options += '<option value="'  + realm.id + '">' + realm.name + '</option>'
	})

	self.Groups = {}

	$.each(data.groups, function (i, grp) {
		self.Groups[grp.id] = grp

		srvGroup.adjustGroupData(grp)
		if ( grp.category == "user" ) {
			ugroups.push(grp)
		}
		if ( grp.category == "srv" ) {
			var realm = self.Realms[grp.permission_realm_id]
			if ( realm !== undefined ) {
				realm.srv_groups.push(grp)
			}
		}
	});

	self.dataTable.clear()
	self.dataTable.rows.add(ugroups)
	self.dataTable.draw()

	// Build menu list  group list
	var menus = []
	$.each(self.Realms, function (i, realm) {
		realm.ui_menus =  []
		$.each(realm.srv_groups, function (j, grp) {
			realm.ui_menus.push(grp)
		})

		realm.ui_menus.sort(function(a,b){ return a.full_name.localeCompare(b.full_name)})
		realm.ui_menus_select_options = ''
		$.each(realm.ui_menus,function(i,m){
			realm.ui_menus_select_options += '<option value="' + m.id + '">' + m.full_name + '</option>'
		})
	})
}


/**
* adjust data before to put into column in table.
*
* @param {json} grp group data
*
*/
srvGroup.adjustGroupData = function(grp) {
	var self = srvGroup; //initial data

	// Not a group data ?
	if ( grp.permission_realm_id === undefined ) {
		return
	}

	var realm = self.Realms[grp.permission_realm_id]; //realm

	if ( realm === undefined ) {
		realm = {"name":"","description":""}
	}

	grp.full_name = realm.name + self.nameSeperator + grp.name
	grp.full_description = realm.description + self.nameSeperator + grp.description
}


/**
* update data.
*
* @param {json} data group data
* @param {json} textStatus
* @param {json} jqXHR
* @param {json} success_msg
*
*/
srvGroup.updateDataTablesRow = function(data, textStatus, jqXHR, success_msg) {
	var self = srvGroup; //initial data
	var found_row = false;

	srvGroup.adjustGroupData(data)

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
* add new data.
*
* @param {json} e
* @param {json} dt
* @param {json} node
* @param {json} config
*
*/
srvGroup.addGroup = function(e, dt, node, config) {
	srvGroup.currentRow = null
	srvGroup.showEditGroup()
}


/**
* edit data.
*
* @param {json} e data of element
*
*/
srvGroup.editGroup = function(e) {
	srvGroup.currentRow = srvGroup.dataTable.rows($(e.target).closest('tr')); //the data for the whole row
	srvGroup.showEditGroup()
}


/**
* render message to display on user table.
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
* @return {string} status
*/
srvGroup.renderUserActive = function(row, type, set, meta) {
	var self = srvGroup; //initial data

	if (row.is_active) {
		return self.translate('active')
	} else {
		return self.translate('inactive')
	}
}

/**
* prepare data
*
* @param {json} row The data for the whole row
* @param {json} data the data of group for whole row
* @param {int} index index of data in table
*
*/
srvGroup.dataTableViewUsersRowCallback = function(row, data, index) {
	var td = $('td', row).eq(3); //column status element
	if (data.is_active) {
		td.removeClass('user_inactive')
		td.addClass('user_active')
	} else {
		td.removeClass('user_active')
		td.addClass('user_inactive')
	}
}


/**
* display modal group.
*
* @param {json} data group data
* @param {string} status status of response data
* @param {json} jqXHR the data of element
* @param {string} group_name group name
*
*/
srvGroup.showGroupUsers = function(data, status, jqXHR, group_name) {
	var self = srvGroup; //initial data
	var jid = '#dlgViewUsers'; //prefix id ofelement in form
	ctrl = $(jid + '-tbl');

	$(jid + '-groupname').html(group_name)

	self.dataTableViewUser.clear()
	if (data !== undefined && data != null) {
		self.dataTableViewUser.rows.add(data)
	}
	self.dataTableViewUser.draw()

	$(jid).modal({
		backdrop : 'static'
	})
}


/**
* display modal user in group.
*
* @param {json} e element
*
*/
srvGroup.viewUsers = function(e) {
	var self = srvGroup; //initial data
	var data = self.dataTable.rows($(e.target).closest('tr')).data()[0]; //the dat for whole row
	var gid = data.id; // group id
	var gname = data.name; //group name

	apiService.SendRequest('GET', 'uac/group_users/' + gid, null, function(data,
		status, jqXHR) {
			self.showGroupUsers(data.group_users, status, jqXHR, gname)
	})
}


/**
* display modal to edit data
*
*/
srvGroup.showEditGroup = function() {
	var self = srvGroup; //initial daat
	var data = null; //prepare group data
	if ( self.currentRow != null) {
		data = self.currentRow.data()[0]
	}

	var jid = '#dlgEditGroup'; //prefix id of element in form edit

	self.currentGroup = data; //the group data
	var frm = $(jid + '-form'); //form edit element
	if(frm.length > 0 ){
		frm[0].reset()
	}

	if (data === undefined || data == null) {
		$(jid + '-title').text(self.translate('add_group'))
		data = {
			id : '',
			realm : self.realm,
			category : 'user',
			name : '',
			description : '',
			is_active : true,
			subgroups : [],
			ui_color : ''
		}
	} else {
		$(jid + '-title').text(self.translate('edit_group'))
	}

	$(jid + '-category').val(data.category)
	$(jid + '-name').val(data.name)
	$(jid + '-description').val(data.description)
	$(jid + '-permission_realm_id').html(self.realm_select_options)
	$(jid + '-permission_realm_id').val(data.permission_realm_id)
	$(jid + '-ui_color').val(data.ui_color)

	var bg_color = data.ui_color; //code color

	if(bg_color){
		bg_color = '#' + bg_color;
		$(jid + '-ui_color').css({'background-color':bg_color});
	}else{
		$(jid + '-ui_color').css({'background-color':''});
	}

	self.onChangeDlgEditGroupPermissionRealmID(null)

	if (data.is_active) {
		$(jid + '-is_active-active').prop('checked', true);
	} else {
		$(jid + '-is_active-inactive').prop('checked', true);
	}

	var opt = {};
	if (g_parsleyOptions !== undefined) {
		opt = g_parsleyOptions
	}

	$(jid + '-subgroups').parent().find('input').prop('name','_dummy')
	frm.parsley(opt).reset()

	$(jid).modal({
		backdrop : 'static'
	})
}


/**
* save data group.
*
*/
srvGroup.saveGroup = function() {
	var self = srvGroup; //initial data
	var jid = '#dlgEditGroup'; //prefix id of elementin form save group
	var frm = $(jid + '-form'); //element form save group

	$(jid + '-subgroups').parent().find('input').prop('name','_dummy');
	frm.parsley().validate()
	if (!frm.parsley().isValid()) {
		return false
	}

	$(jid + '-subgroups').parent().find('input').prop('name','');

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
* delete data gropu.
*
* @param {json} e element
*
*/
srvGroup.deleteGroup = function(e) {
	var self = srvGroup; //initial data
	srvGroup.currentRow = srvGroup.dataTable.rows($(e.target).closest('tr')); //data of element
	var d = srvGroup.currentRow.data()[0]; //the data for the whole row
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
				var success_msg = self.translate('msg_delete_suc')
				apiService.SendRequest("DELETE", "uac/group/" + d.id, null,function(data, status, jqxhr) {
					d.is_deleted = true
					self.updateDataTablesRow(d, status, jqxhr,success_msg)
				})
			}
		}
	})
}


/**
* recover deleted group.
*
* @param {json} e element
*
*/
srvGroup.unDeleteGroup = function(e) {
	var self = srvGroup; //initial data
	srvGroup.currentRow = srvGroup.dataTable.rows($(e.target).closest('tr')); //element
	var d = srvGroup.currentRow.data()[0]; //the data for the whole row
	var s = self.translate('undelete_prompt').replace('%s', d.name); //message confirm recover deleted

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
				var success_msg = self.translate('success_undelete')
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


/**
* update field select menu according field realm selected.
*
* @param {json} e element
*
*/
srvGroup.onChangeDlgEditGroupPermissionRealmID = function(e) {
	var self = srvGroup; //initial data
	var jid = '#dlgEditGroup'; //prefix id of element in form

	var realm_id = $(jid + '-permission_realm_id').val(); //realm id

	//menu
	var ctrl = $(jid + '-subgroups'); //element sub-groups
	var realm = srvGroup.Realms[realm_id]; //realm id

	if ( realm !== undefined ) {
		ctrl.html(realm.ui_menus_select_options)
	} else {
		ctrl.html('')
	}

	if (self.currentGroup != null) {
		ctrl.val(self.currentGroup.subgroups)
	}
	ctrl.multiselect('rebuild')
}
