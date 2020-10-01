/**
*
*   Main JS application file for user setting page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvSetting = {}; //initial data

/**
* prepare data
*
* @param {string} lang language name
* @param {json} translator Text for use on page
*
*/
srvSetting.init = function(lang,translator) {
	var self = srvSetting; //initial data
	self.translator = translator; //Text for label and message on javascript
	self.lang = lang; //language name
	self.CtrlIDPrefix = '#user-setting'; //prefix user setting element

	//Multiselect
	$(self.CtrlIDPrefix + '-new_usergroup_id').multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
	})

	$(self.CtrlIDPrefix + '-btn_save').on('click',function(e){
		self.saveUserSetting()
	})

	apiService.SendRequest("GET","uac/setting-groups-realms",
		{ "lang": self.lang },
		self.loadSetting)
}


/**
* message for trnslate
*
* @param {json} msg text
*
* @return {string} text after translate
*/
srvSetting.translate = function (msg) {
	var self = srvSetting; //initial data
	if (typeof self.translator != "object" || self.translator == null) {
		return msg
	}

	var v = self.translator[msg]
	if ( v === undefined ) {
		return msg
	}
	return v
}


/**
* get gate to set on form
*
* @param {json} data
*
*/
srvSetting.loadSetting = function (data) {
	var self = srvSetting; //initial data
	var realms = {}; //realm data

	$.each(data.realms, function (i, realm) {
		realms[realm.id] = realm
	})

	var s = []; //setting data

	$.each(data.groups, function (i, grp) {
		if ( grp.category != "user" || !grp.is_active || grp.is_deleted ) {
			return
		}
		r = realms[grp.permission_realm_id]
		grp.full_name = r.name + ":" + grp.name
		s.push({ "name": grp.full_name, "id": grp.id })
	})

	var defgid = data.setting.new_usergroup_id; //new usergroup id

	s.sort(function (a, b) {return a.name.localeCompare(b.name)});

	var h = ""; //option element

	$.each(s,function(i,v) {
		h += '<option value="' + v.id + '"'
		if ( v.id == defgid ) {
			h += " selected "
		}
		h += '>' + v.name + '</option>'
	})

	var ctrl = $(self.CtrlIDPrefix + '-new_usergroup_id')
	ctrl.html('<option value="0">None</option>' + h)
	ctrl.multiselect('rebuild');

	$(self.CtrlIDPrefix + '-password_lifespan_days').val(data.setting.password_lifespan_days)
	$(self.CtrlIDPrefix + '-account_lifespan_days').val(data.setting.account_lifespan_days)
	$(self.CtrlIDPrefix + '-badattemp_user_captcha').val(data.setting.badattemp_user_captcha)
}


/**
* save data setting.
*
*/
srvSetting.saveUserSetting = function(){
	var self = srvSetting; //initial data
	var frm = $(self.CtrlIDPrefix +'-form'); //setting form element

	// Add code to turn off parsley warning on new_usergroup_id
	var ctrl = $(self.CtrlIDPrefix +'-new_usergroup_id').parent(); //option element
	ctrl.find('input').prop('name','_dummy')

	frm.parsley().validate()
	if(!frm.parsley().isValid()){
		return false
	}

	ctrl.find('input').prop('name','')

	apiService.SendRequest("PUT","uac/setting" ,frm,
		function(newdata) {
			frm.parsley().reset()
			bootbox.alert({
				message: self.translate('save_success'),
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			})
		})
}
