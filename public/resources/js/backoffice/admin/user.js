/**
 * 
 * Main JS application file for users page. This file is control the options,
 * display data and Add or Edit data.
 * 
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * 
 */


var srvUser = {}; // initial data

/**
 * prepare data
 * 
 * @param {string}
 *            lang language name
 * @param {json}
 *            translator Text for use on page
 * @param {int}
 *            uid user id
 * 
 */
srvUser.init = function (lang,translator,uid) {
	var self = srvUser; // initial data
	self.lang = lang; // language name
	self.UserType = {"Local":2,"LDAP" : 3}; // data source of user
	self.translator = translator; // Text for label and message on javascript
	self.dlgEditUserID = "#dlgEditUser"; // dialog edit user form
	self.dlgSyncUserID = "#dlgSyncUser"; // dialog sysnc user from LDAP
	self.dateFormat = 'YYYY-MM-DD HH:mm'; // date format
	moment.locale(lang);

	var ctrl = $('#tbl-user'); // user table element

	ctrl.on('click', '.btn-edit', self.showEditUser)
	ctrl.on('click', '.btn-delete', self.deleteUser)
	ctrl.on('click', '.btn-undelete', self.undeleteUser)

	$(self.dlgEditUserID + '-save-btn').on('click', self.saveEditUser)
	$(self.dlgEditUserID + '-groups').on('change', self.onGroupsClick)

	$(self.dlgEditUserID + "-profile_image").on('change', self.updateImage)
 	$(self.dlgEditUserID + "-profile-upload-button").on('click', function() {
    	$(self.dlgEditUserID + "-profile_image").click();
    });

	self.defaultProfileImage = $(self.dlgEditUserID + '-profile-image-preview').attr('src')
	$(self.dlgEditUserID + '-profile-image-preview').on('error', function () {
		var ctrl = $(this); // preview image element

		if (ctrl.attr('src') != srvUser.defaultProfileImage) {
			ctrl.attr('src', srvUser.defaultProfileImage)
		}

	})

	$(self.dlgEditUserID + '-ministry').on('change' , self.changeFilterMinistry)
	$(self.dlgEditUserID + '-department').on('change' , self.changeFilterDepartment)

	self.initDataTable()
	self.initMultiSelect()
	self.initDatePicker()
	self.initLDAP()

	i = parseInt(uid, 10)
	if ( isNaN(i) ) {
		i = 0
	}
	self.initUserID=i

	apiService.SendRequest("GET","uac/users-groups-services-realms-agencies-departments",
		{ "lang": self.lang },
		self.loadUserList)

	srvUserRegister.init(lang,translator,self)
}


/**
 * multiselect setting
 * 
 */
srvUser.initMultiSelect = function () {
	var self = srvUser; // initial data

	self.lastFilterStatus = ["1", "2"]; // default status on filter
	var gfs = $('#user-filters-status'); // user filter status

	gfs.multiselect({
		includeSelectAllOption: true,
		selectAllText: self.translate('filter_status_all'),
		allSelectedText: self.translate('filter_status_all_selected'),
		nonSelectedText: self.translate('filter_status_none_selected'),
		selectAllNumber: false,
		onChange: self.onFilterStatusChange,
		onSelectAll: self.onFilterStatusChange
	})
	gfs.multiselect('select', self.lastFilterStatus)

	// Multiselect
	$(self.dlgEditUserID).find('select[multiple=multiple]').each(function (i, e) {
		$(e).multiselect({
			buttonWidth: '100%',
			maxHeight: 300,
			includeSelectAllOption: true,
			selectAllNumber: false,
			enableFiltering: true,
			selectableOptgroup: true,
			selectAllText: self.translate('select_all'),
			allSelectedText: self.translate('all_selected'),
			nonSelectedText: self.translate('none_selected'),
		})
	})
}


/**
 * users data table setting.
 * 
 */

srvUser.initDataTable = function () {
	var self = srvUser; // initial data
	var ctrl = $('#tbl-user'); // user table element

	self.userTableId = 'tbl-user'; // id of user table
	self.dataTable = ctrl.DataTable({
		dom: 'frlBtip',
		buttons: [{
			className: 'btn-new-user',
			text: self.translate('new_user'),
			action: function() {
				self.currentRow == null
				$('#dlgNewUser').modal({backdrop: 'static'})
			}
		},{
			className: 'btn-sync-ldap',
			text: self.translate('sync_ldap'),
			action: function() {
				apiService.SendRequest("GET","uac/ldapusers",{ "lang": self.lang },self.showSyncLDAP)
			}
		}],
		language: g_dataTablesTranslator,
		columns: [{
			defaultContent: '',
			orderable: false,
			searchable: false,
		}, {
			data: 'account',
		}, {
			data: 'full_name',
		}, {
			data: self.renderDepartmentName,					   
		},  {
			data: self.renderLoginAt,
			sType: 'moment'
		}, {
			data: self.renderUserStatus,
		}, {
			data: self.renderToolButtons,
			orderable: false,
			searchable: false,
		}],
		order: [[1, 'asc']],
		rowCallback : ''
	})

	$.fn.dataTableExt.oSort['moment-asc']  = function(x,y) {
		var xt = moment(x,self.dateFormat).unix()
		var yt = moment(y,self.dateFormat).unix()

		return ((xt < yt) ? -1 : ((xt > yt) ?  1 : 0));
	};

	$.fn.dataTableExt.oSort['moment-desc'] = function(x,y) {
		var xt = moment(x,self.dateFormat).unix()
		var yt = moment(y,self.dateFormat).unix()

			return ((xt < yt) ?  1 : ((xt > yt) ? -1 : 0));
	};

	$.fn.dataTable.ext.search.push(self.filterData)
	self.dataTable.on('order.dt search.dt', function () {
		self.dataTable.column(0, {
			search: 'applied',
			order: 'applied'
		}).nodes().each(function (cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();
}


/**
 * input date setting.
 * 
 */
srvUser.initDatePicker = function () {
	$(srvUser.dlgEditUserID + '-account_expired_at').datepicker({
		autoclose: true,
		dateFormat: 'yyyy-mm-dd'
	}).on('changeDate', function (selected) {
			var minDate = new Date(); // min date
			$(srvUser.dlgEditUserID + '-account_expired_at').datepicker('setStartDate', minDate);
	});
}


/**
 * user LDAP data table settig.
 * 
 */
srvUser.initLDAP = function() {
	var self = srvUser; // initial data
	var ctrl = $(self.dlgSyncUserID + '-tbl'); // LDAP table element

	self.dataTableLDAP = ctrl.DataTable({
		dom : 'frtlip',
		language : g_dataTablesTranslator,
		columns : [{
			defaultContent : '',
			className : 'select-checkbox',
			orderable : false,
			searchable : false,
		}, {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : 'account',
		}, {
			data : 'full_name',
		}],
		select : {
			style : 'multi',
			selector : 'tr'
		},
		order : [[2, 'asc']]
	})

	self.dataTableLDAP.on('order.dt search.dt', function() {
		if (self.dataTableLDAP === undefined || self.dataTableLDAP == null) {
			return;
		}
		self.dataTableLDAP.column(1, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	$(self.dlgSyncUserID + '-save-btn').on('click', function(e) {
		if (self.saveLDAPUser()) {
			$(jid).modal('hide')
		}
	});
}


/**
 * generate button on table.
 * 
 * @param {json}
 *            row The data for the whole row
 * @param {json}
 *            type The data type requested for the cell
 * @param {json}
 *            set Value to set if the type parameter is set. Otherwise,
 *            undefined.
 * @param {json}
 *            meta An object that contains additional information about the cell
 *            being requested.
 * 
 * @return {string} buton element
 * 
 */
srvUser.renderToolButtons = function (row, type, set, meta) {
	var self = srvUser; // initial data
	var s = '<i class="btn btn-edit" title="' + self.translate('edit_user')
			+ '"></i>'; // button element
	if (row.is_deleted) {
		s += '<i class="btn btn-undelete" title="'
				+ self.translate('undelete_user') + '"></i>'
	} else {
		s += '<i class="btn btn-delete" title="'
				+ self.translate('delete_user') + '"></i>'
	}

	return s
}


/**
 * get text to translate.
 * 
 * @param {string}
 *            msg text
 * 
 * @return {string} text
 */

srvUser.translate = function (msg) {
	var self = srvUser; // initial data

	if (typeof self.translator != "object" || self.translator == null) {
		return msg
	}

	var v = self.translator[msg];
	if ( v === undefined ) {
		return msg
	}
	return v
}


/**
 * put data into column on users table.
 * 
 * @param {json}
 *            row The data for the whole row
 * @param {json}
 *            type The data type requested for the cell
 * @param {json}
 *            set Value to set if the type parameter is set. Otherwise,
 *            undefined.
 * @param {json}
 *            meta An object that contains additional information about the cell
 *            being requested.
 * 
 * @return {string} text
 * 
 */

srvUser.renderUserStatus = function (row, type, set, meta) {
	var self = srvUser; // initial data
	if (row.is_deleted) {
		return self.translate('deleted')
	} else if (row.is_active) {
		return self.translate('active')
	} else {
		return self.translate('inactive')
	}
}


/**
 * render log in at data
 * 
 * @param {json}
 *            row The data for the whole row
 * @param {json}
 *            type The data type requested for the cell
 * @param {json}
 *            set Value to set if the type parameter is set. Otherwise,
 *            undefined.
 * @param {json}
 *            meta An object that contains additional information about the cell
 *            being requested.
 * 
 * @return {string} log in at
 * 
 */
srvUser.renderLoginAt = function (row, type, set, meta) {
	var self = srvUser; // initial data
	var v = moment(row.last_login_at)
	if (v.get('year') < 2000) {
		return self.translate('never_login')
	}

	// return v.locale(self.lang).format('LL HH:mm:ss')
	return v.format(self.dateFormat)
}


/**
 * put data into table and form.
 * 
 * @param {json}
 *            data user list data
 * 
 */
srvUser.loadUserList = function (data) {
	if (typeof data != "object" || typeof data.users != "object") {
		return
	}

	var self = srvUser; // initial data
	
	self.realmMap = {};
	$.each(data.realms, function (i, realm) {
		self.realmMap[realm.id] = realm
	})

	self.groupMap = {};

	var s = [];
	$.each(data.groups, function (j, grp) {
		self.groupMap[grp.id] = grp
		realm = self.realmMap[grp.permission_realm_id]
		grp.full_name = realm.name + ":" + grp.name
		if ( grp.category == "user" && grp.is_active && !grp.is_deleted ) {
				s.push({ "name": grp.full_name, "id": grp.id })
		}
	});

	var ctrl = $(srvUser.dlgEditUserID + '-groups'); // input group element

	self.addSortedListOption(ctrl,s)
	ctrl.multiselect('rebuild');

	var ctrl = $(srvUser.dlgEditUserID + '-groups'); // input group element
	ctrl.multiselect('rebuild');

	self.departmentMap = {}
	for ( var i = 0; i < data.departments.length; i++) {
		var m = data.departments[i]
		if ( m === undefined ) { continue }

		for (var j = 0; j < m.departments.length; j++) {
			var d = m.departments[j]
			if ( d === undefined ) { continue}
			self.departmentMap[d.id] = { 
					"id": d.id, 
					"ministry_id": m.id,
					"name": d.name,
					"ministry_name":m.name,
			}			
		}
	}
	
	self.agencyMap = {}
	for ( var i = 0; i < data.agencies.length; i++) {
		var a = data.agencies[i]
		if ( a === undefined ) {
			continue
		}
		self.agencyMap[a.id] = a
	}

	self.serviceMap = {}
	$.each(data.services, function (i, srv) {
		if ( srv.is_deleted ) {
			return
		}

		var l = srv.module_name; // module name

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
		self.serviceMap[srv.id] = srv
	});

	srvUserRegister.setMinistryList(data)

	// Copy ministry list box
	var fm = $('#dlgEditUser-ministry')
	fm.html($('#register-form-ministry').html())
	
	self.dataTable.clear();
	self.dataTable.rows.add(data.users);
	self.dataTable.draw();

	if ( self.initUserID > 0 ) {
		var row = null; // prepare row number
		var a = self.dataTable.rows().indexes(); // index data

		for ( i = 0; i < a.length; i++) {
			var r = self.dataTable.row(i);
			var d = r.data();
			if ( d != null && typeof(d) === "object" && d.hasOwnProperty('id') && d.id == self.initUserID ) {
				row = r
				break
			}
		}

		if ( row != null ) {
			var account = row.data().account
			self.dataTable.search(account).draw()

			self.showEditUser({
				target:row.node()
			})
		} else {
			bootbox.alert("Unknown user id [" + self.initUserID + "]")
		}
	}
}


/**
 * display modal and form to edit user data.
 * 
 * @param {json}
 *            e element
 * 
 */
srvUser.showEditUser = function (e) {
	var self = srvUser; // initial data
	self.currentRow = srvUser.dataTable.rows($(e.target).closest('tr')); // element
	var data = self.currentRow.data()[0]; // the data foe the whole row
	var jid = self.dlgEditUserID; // id of dialog edit user form

	$(jid + '-title').text(self.translate('edit_user')); // title dialog edit

	// Set data
	$(jid + '-id').val(data.id);
	$(jid + '-account').val(data.account);
	$(jid + '-full_name').val(data.full_name);

	self.setUserAgency(data)

	var ctrl = $(jid + '-groups'); // input group element
	ctrl.val(data.groups);
	ctrl.multiselect('refresh');

	ctrl = $(jid + '-profile-image-preview'); // image preview element
	if (ctrl.attr('src') != srvUser.defaultProfileImage) {
		ctrl.attr('src', srvUser.defaultProfileImage);
	}

	var d = new Date(); // current date

	// Add &v= to disable browser memory cache
	ctrl.attr('src', apiService.BuildURL('uac/profile_image/' + data.id) + "&v="+ d.getTime() )

	if (data.is_active) {
		$(jid + '-is_active-active').prop('checked', true)
	} else {
		$(jid + '-is_active-inactive').prop('checked', true)
	}

	var v = moment(data.account_verified_at); // account verified at
	var s = '';

	if (v.get('year') > 2000) {
		s = v.locale(self.lang).format('LL')
	}
	$(jid + '-account_verified_at').val(s)

	var v = moment(data.account_expired_at)
	if (v.get('year') > 2000) {
		s = v.locale(self.lang).format('YYYY-MM-DD')
	} else {
		s = ''
	}
	ctrl = $(jid + '-account_expired_at')
	ctrl.val(s)
	ctrl.datepicker('setDate',v.toDate())

	ctrl = $(jid + '-password_lifespan_days')
	if ( data.user_type_id == srvUser.UserType.LDAP ) {
		ctrl.attr('placeholder',self.translate('ldap_user_notapplicable'))
		ctrl.attr('readonly',true)
		ctrl.val('')

		$(jid + '-password_updated_at').val(self.translate('ldap_user_notapplicable'))
	} else {
		var v = moment(data.password_updated_at)
		if (v.get('year') > 2000) {
			s = v.locale(self.lang).format('LL')
		} else {
			s = ''
		}
		$(jid + '-password_updated_at').val(s)

		ctrl.attr('placeholder',self.translate('password_life_span_unlimit'))
		ctrl.attr('readonly',false)
		if (data.password_lifespan_days > 0) {
			s = data.password_lifespan_days
		} else {
			s = ''
		}
		ctrl.val(s)
	}

	ctrl = $(jid + '-services')
	srvUser.getUserServiceList(ctrl,data.groups,data.exclude_services)

	$(jid).modal({
		backdrop: 'static'
	})
}


/**
 * Update option list on field select service.
 * 
 * @param {json}
 *            e element
 * 
 */
srvUser.onGroupsClick = function (e) {
	var data = srvUser.currentRow.data()[0]; // the data for the whole row
	var ctrl = $(srvUser.dlgEditUserID + '-groups'); // dilog form edit
														// element
	var groups = []; // group data

	ctrl.find('option').each(function(){
		if ( this.selected ) {
			groups.push(this.value)
		}
	})

	ctrl = $(srvUser.dlgEditUserID + '-services')
	var exs = data.exclude_services; // exclude services
	ctrl.find('option').each(function(){
		if ( !this.selected ) {
			exs.push(this.value)
		}
	})

	srvUser.getUserServiceList(ctrl,groups,exs)
}

/**
 * Add source list option
 * 
 * @param {json}
 *            ctrl dropdown element
 * @param {json}
 *            opts option element
 * 
 */
srvUser.addSortedListOption = function(ctrl,opts) {
	opts.sort(function (a, b) {return a.name.localeCompare(b.name)})

	var h = ""; // option element
	$.each(opts,function(i,v) {
		h += '<option value="' + v.id + '"'
		if ( v.selected !== undefined && v.selected ) {
			h += " selected "
		}
		h += '>' + v.name + '</option>'
	})
	ctrl.html(h)
}

/**
 * get user service list
 * 
 * @param {json}
 *            ctrl
 * @param {json}
 *            gids
 * @param {json}
 *            excludesids
 * 
 */
srvUser.getUserServiceList = function (ctrl,gids,excludesids) {
	var findinfo = {
		"groups":{},
		"services":{},
		"findGroupServiceIDs":function(gid) {
			var self = this

			if ( self.groups[gid] !== undefined ){
				return
			}

			self.groups[gid] = true
			ginf = srvUser.groupMap[gid]
			if ( ginf === undefined || ginf == null ) {
				return
			}

			$.each(ginf.services,function(i,sid){
				self.services[sid] = true
			})

			$.each(ginf.subgroups,function(i,gid){
				self.findGroupServiceIDs(gid)
			})
		}
	}

	$.each(gids,function(i,gid){
		findinfo.findGroupServiceIDs(gid)
	})

	var exmap = {}
	$.each(excludesids,function(i,sid){
		exmap[sid] = true
	})

	var s = []; // option elemen
	$.each(findinfo.services,function(sid,v){
		var sinf = srvUser.serviceMap[sid]
		if ( sinf !== undefined ) {
			s.push({ "name": sinf.full_name, "id": sinf.id ,"selected": exmap[sid] === undefined})
		}
	})

	srvUser.addSortedListOption(ctrl,s)
	ctrl.multiselect('rebuild');
}


/**
 * delete user
 * 
 * @param {json}
 *            e element
 * 
 */
srvUser.deleteUser = function(e) {
	var self = srvUser; // initial data
	self.currentRow = self.dataTable.rows($(e.target).closest('tr'))
	var d = self.currentRow.data()[0]; // the data for the whole row
	var s = self.translate('delete_prompt').replace('%s', d.account); // message
																		// confirm
																		// delete

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
				var success_msg = self.translate('delete_success')
				apiService.SendRequest("DELETE","uac/user/" + d.id,null,
					function(data, status, jqxhr) {
							d.is_deleted = true
							self.updateDataTablesRow(d, status, jqxhr,success_msg)
						})
			}
		}
	})
}


/**
 * recover deleted user data.
 * 
 * @param {json}
 *            e element
 * 
 */
srvUser.undeleteUser = function(e) {
	var self = srvUser; // initial data
	self.currentRow = self.dataTable.rows($(e.target).closest('tr'))
	var d = self.currentRow.data()[0]; // the data for the whole row
	var s = self.translate('undelete_prompt').replace('%s', d.account); // message
																		// confirm
																		// recover
																		// data
																		// deleted

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
				var success_msg = self.translate('undelete_success').replace('%s', d.account)
				apiService.SendRequest("PUT", "uac/undelete_user/" + d.id, null,
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
 * save users data.
 * 
 * @param {json}
 *            e element
 * 
 */
srvUser.saveEditUser = function(e) {
	var self = srvUser; // initial data
	var jid = self.dlgEditUserID; // prefix id of element form edit user in
									// dialog

	var frm = $(jid + "-form"); // registerform element
	frm.parsley().validate();
	if (!frm.parsley().isValid()) {
		return false
	}

	var data = self.currentRow.data()[0]; // the data fow the whole row

	// Filterout some value from LDAP user
	if ( data.user_type_id == srvUser.UserType.LDAP ) {
		$(jid + '-password_lifespan_days').val(data.password_lifespan_days)
	}

	var exclude_services = []; // exclude services
	$(jid + '-services option').each(function(){
		if ( !this.selected ) {
			exclude_services.push(this.value)
		}
	})

	var frm = $(jid + '-form'); // form element
	frm.find('input[name="exclude_services[]"]').remove()

	var h = ""; // input element
	$.each(exclude_services,function (i,v) {
		h += '<input type="hidden" name="exclude_services[]" value="'  + v + '" />'
	})
	frm.append(h)

	apiService.SendRequest("PUT","uac/user/" + data.id,frm,
		function(newdata,status,jqxhr) {
			$(jid).modal('hide')
			self.updateDataTablesRow(newdata,status,jqxhr,self.translate('save_success'))
		},
		null,true)
}


/**
 * update profile image.
 * 
 * @param {json}
 *            e element
 * 
 */
srvUser.updateImage = function(e) {
	var input = e.target; // target data

	if (input.files && input.files[0]) {
		var reader = new FileReader(); // reader file

		reader.onload = function (e) {
			$(srvUser.dlgEditUserID + '-profile-image-preview').attr('src', e.target.result);
		}

		reader.readAsDataURL(input.files[0]);
	}
}


/**
 * display user LDAP.
 * 
 * @param {json}
 *            data user data from LDAP
 * 
 */
srvUser.showSyncLDAP = function(data) {
	var tbl = srvUser.dataTableLDAP; // user LDAP table element
	var new_users = []; // new user

	$.each(data.ldapusers,function(i,u){
		if ( u.user_id === "undefined" || u.user_id <= 0 ) {
			new_users.push(u)
		}
	})

	tbl.clear()
	tbl.rows.add(new_users)
	tbl.draw()

	$(srvUser.dlgSyncUserID).modal({
		backdrop: 'static'
	})
}


/**
 * save sync users LDAP.
 * 
 */
srvUser.saveLDAPUser = function() {
	var self = srvUser; // initial data
	var selected_user = []; // selected user

	srvUser.dataTableLDAP.rows({
		selected : true
	}).every(function(rowIdx, tableLoop, rowLoop) {
		var d = this.data()
		// Set default value for LDAP user
		d.is_active = true

		selected_user.push(d)
	})

	if (selected_user.length == 0) {
		$(srvUser.dataTableLDAP).modal('hide')
		return;
	}

	var params = {
		"ldapusers": selected_user
	}

	apiService.SendRequest("POST","uac/ldapusers" ,params,
		function(newdata) {
			$(srvUser.dlgSyncUserID).modal('hide')
			srvUser.addNewLDAPUsersData(newdata.ldapusers)
		},
		function(jqXHR, textStatus, errorThrown){
			apiService.cbServiceAjaxError(apiService.lastURL,jqXHR, textStatus, errorThrown)
			$(srvUser.dlgSyncUserID).modal('hide')
		}
	)
}

/**
 * add new user from LDAP
 * 
 * @param {json}
 *            users user list data
 * 
 */
srvUser.addNewLDAPUsersData = function (users) {
	var self = srvUser; // initial data
	var us = []; // user data
	var msg = "<DL>" + self.translate('ldap_user_dl'); // message add new user
														// LDAP success

	$.each(users,function(i,inf) {
		msg += "<DT>" + inf.user.account + "</DT><DD>"
		if ( inf.error === undefined || inf.error === "" ) {
			us.push(inf.user)
			msg += self.translate('ldap_user_successful')
		} else {
			msg += inf.error
		}
		msg +=  "</DD>"
	})
	msg += "</DL>"

	if ( us.length > 0 ) {
		srvUser.dataTable.rows.add(us).draw()
	}

	bootbox.alert(msg)
}


/**
 * display data on table according status filter change.
 * 
 */
srvUser.onFilterStatusChange = function() {
	var self = srvUser; // initial data
	var gfs = $('#user-filters-status'); // user filter status element
	var v = gfs.val(); // status
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
 * set default status
 * 
 * @param {json}
 *            settings
 * @param {json}
 *            cols
 * @param {json}
 *            dataIndex the index data
 * 
 * @return {boolean} staus checked
 * 
 */
srvUser.filterData = function(settings, cols, dataIndex) {
	var self = srvUser; // initial data
	var data = self.dataTable.rows(dataIndex).data()[0]

	if (settings.sTableId != self.userTableId) {
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
 * update data table.
 * 
 * @param {json}
 *            data user data
 * @param {string}
 *            status status of response data
 * @param {json}
 *            jqXHR the data of element
 * @param {string}
 *            success_msg success message response
 * 
 */
srvUser.updateDataTablesRow = function(data, textStatus, jqXHR, success_msg) {
	var self = srvUser; // initial data
	var found_row = false; // default found row

	if (self.currentRow == null ) {
		self.dataTable.row.add(data)
	} else {
		var olddata = self.currentRow.data()[0]; // the data for the whole
													// row

		// DataTable don't allow us to replace data object, we need to
		// set it field by field
		$.each(olddata,function(i,v){
			olddata[i] = data[i]
		})
		self.currentRow.invalidate();
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
 * hide modal add new user.
 * 
 */
srvUser.hideNewUserDlg = function() {
	$('#dlgNewUser').modal('hide')
}

srvUser.selectValOrFirst = function (ctrl,v) {
	ctrl.val(v)
	if ( ctrl.val() == null ) {
		opt = ctrl.find("option:first")
		ctrl.val(opt.val())
	}

	ctrl.trigger("change")
}

srvUser.setUserAgency = function(data) {
	var self = srvUser

	var ministry_id = 0
	var department_id = 0
	var agency_id = 0

	if (data.agency_id > 0) {
		var a = self.agencyMap[data.agency_id]

		if ( a !== undefined ) {
			ministry_id = a.ministry_id
			department_id = a.department_id
			agency_id = a.id
		}
	}

	if ( ministry_id == 0 ) {
		var m = self.departmentMap[data.department_id]
		if ( m !== undefined ) {
			ministry_id = m.ministry_id
			department_id = m.id
		}
	}

	self.selectValOrFirst($(self.dlgEditUserID + '-ministry'),ministry_id)
	self.selectValOrFirst($(self.dlgEditUserID + '-department'),department_id)
	self.selectValOrFirst($(self.dlgEditUserID + '-agency'),agency_id)
}

/**
 * update option on field select agency. s
 */
srvUser.changeFilterMinistry = function() {
	var self = srvUser
	var m = srvUserRegister.DepartmentList[this.value]; // ministry id

	var filter_agency = $(self.dlgEditUserID + '-department')

	filter_agency.html(m.departments_options)

	var opt =filter_agency.find("option:first"); // first option element
	if( opt.length > 0 ) {
		self.changeFilterDepartment.call(opt[0])
	}
}

/**
 * update option on field select agency. s
 */
srvUser.changeFilterDepartment = function() {
	var self = srvUser
	var m = srvUserRegister.AgencyOptions[this.value]; // ministry id
	var filter_agency = $(self.dlgEditUserID + '-agency')

	if ( m === undefined ) {
		m = '<option value="0">' + srvUserRegister.translate("unspecified") + '</option>';
	}

	filter_agency.html(m)
}

srvUser.renderDepartmentName = function(row, type, set, meta) {
	var self = srvUser
	var department_id = 0
	
	if ( row.agency_id > 0 ) {
		var a = self.agencyMap[row.agency_id]
		if ( a !== undefined ) {
			department_id = a.department_id
		}
	}
	
	if ( department_id == 0 && row.department_id > 0 ) {
		department_id = row.department_id
	}
		
	var m = self.departmentMap[department_id]
	if ( m !== undefined ) {
		return m.name
	}
		
	return self.translate('unspecified').replace(/^\-+|\-+$/gm,'');
}
