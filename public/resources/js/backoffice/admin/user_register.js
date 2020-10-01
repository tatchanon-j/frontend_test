/**
 * 
 * Main JS application file for user register. This file is control the options
 * and user register and display data.
 * 
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * 
 */


var srvUserRegister = {}

/**
 * prepare data
 * 
 * @param {string}
 *            lang language name
 * @param {json}
 *            translator Text for use on page
 * @param {json}
 *            datatable
 * 
 */
srvUserRegister.init = function(lang,translator,datatable) {
	var self = srvUserRegister; // initial data

	self.lang = lang; // language name
	self.translator = translator; // Text for label and message on javascript

	$('#register-form-btn_register').on('click', self.saveRegister);
	$('#register-form-ministry').on('change' , self.changeFilterMinistry)
	$('#register-form-department').on('change' , self.changeFilterDepartment)
	$("#register-form-profile_image").on('change', self.updateImage)
 	$("#register-form-profile-upload-button").on('click', function() {
    	$("#register-form-profile_image").click();
    });

	self.DefaultProfileImage = $('#register-form-profile-image-preview').attr('src');
	self.dataTable = datatable;
}


/**
 * translate text
 * 
 * @param {string}
 *            msg text
 * 
 * @return {string} text
 */
srvUserRegister.translate = function (msg) {
	var self = srvUserRegister; // initial data
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
 * put option into field select ministry.
 * 
 * @param {json}
 *            data ministry data
 * 
 */
srvUserRegister.setMinistryList = function (data) {
	if ( typeof data != "object" || typeof data.departments === "undefined") {
		return
	}
	
	// Due to change/request from user , now agency must be under
	// ministry/department
	// but we don't want to change the API code too much , so the return value
	// from
	// the server is a mix bag.
	// For ministry/department (in data.departments) , all were already grouped
	// by the service
	// For agency (in data.agencies) ... we need to group them ourself
	
	var agencies = {} 
	for ( var i = 0; i < data.agencies.length; i++) {
		var a =  data.agencies[i]
		if ( a === undefined ) {
			continue
		}
			
		if ( agencies[a.department_id] === undefined ) {
			agencies[a.department_id] = []
		}
		
		agencies[a.department_id].push(a)
	}
	
	srvUserRegister.AgencyOptions = {}
	$.each(agencies, function(i,a){
		a.sort(function(a,b) { return a.name.localeCompare(b.name)})
		
		var d = '<option value="0">' + srvUserRegister.translate("unspecified") + '</option>'; 
		$.each(a,function(i,b) {
			d += '<option value="' + b.id + '">' + b.name + '</option>'
		})
		srvUserRegister.AgencyOptions[i] = d		
	})
		
	srvUserRegister.DepartmentList = {}
	var filter_ministry = $('#register-form-ministry'); // dropdown ministry
														// element
		
	data.departments.sort(function(a,b) { return a.name.localeCompare(b.name)})

	var m = ""; // ministry option
	$.each(data.departments,function (i,a) {
		srvUserRegister.DepartmentList[a.id] = a
		m += '<option value="' + a.id + '">' + a.name + '</option>'
		a.departments.sort(function(a,b) { return a.name.localeCompare(b.name)})

		var d = ""; // departments options
		$.each(a.departments,function(i,b) {
			d += '<option value="' + b.id + '">' + b.name + '</option>'
		})
		a.departments_options = d
	})
	filter_ministry.html(m)
			
	var opt =filter_ministry.find("option:first"); // first option element
	if( opt.length > 0 ) {
		srvUserRegister.changeFilterMinistry.call(opt[0])
	}
}


/**
 * update option on field select agency. s
 */
srvUserRegister.changeFilterMinistry = function() {
	var m = srvUserRegister.DepartmentList[this.value]; // ministry id
	var filter_agency = $('#register-form-department'); 

	filter_agency.html(m.departments_options)
	
	var opt =filter_agency.find("option:first"); // first option element
	if( opt.length > 0 ) {
		srvUserRegister.changeFilterDepartment.call(opt[0])
	}
}

/**
 * update option on field select agency. s
 */
srvUserRegister.changeFilterDepartment = function() {
	var m = srvUserRegister.AgencyOptions[this.value]; // ministry id
	var filter_agency = $('#register-form-agency'); // agency element
	
	if ( m === undefined ) {
		m = '<option value="0">' + srvUserRegister.translate("unspecified") + '</option>';
	}

	filter_agency.html(m)
}


/**
 * save new user data.
 * 
 */
srvUserRegister.saveRegister = function() {
	var self = srvUserRegister; // initial data
	var frm = $('#register-form'); // registerform element

	frm.parsley().validate();
	if (!frm.parsley().isValid()) {
		return false
	}

	apiService.SendRequest("POST","uac/user", frm,
		function(data, status, jqxhr) {
			var msg = self.translate('msg_save_suc'); // message save success
			frm.trigger('reset')
			$('#register-form-profile-image-preview').attr('src',srvUserRegister.DefaultProfileImage)
			frm.parsley().reset()
			grecaptcha.reset()

			if ( self.dataTable !== undefined ) {
				self.dataTable.hideNewUserDlg()
				self.dataTable.updateDataTablesRow(data, status, jqxhr,msg)
			}
		},
		function(jqXHR, textStatus, errorThrown){
			apiService.cbServiceAjaxError(apiService.lastURL,jqXHR, textStatus, errorThrown)
			grecaptcha.reset()
		},
		true)

	return true
}


/**
 * update profile imgae.
 * 
 * @param {json}
 *            e element
 * 
 */
srvUserRegister.updateImage = function(e) {
	var input = e.target; // target data

	if (input.files && input.files[0]) {
		var reader = new FileReader(); // reader file

		reader.onload = function (e) {
			$('#register-form-profile-image-preview').attr('src', e.target.result);
		}

		reader.readAsDataURL(input.files[0]);
	}
}
