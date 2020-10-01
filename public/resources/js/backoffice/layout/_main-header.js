
$('#btn-editprofile').on('click',function(){

	var frm = $('#dlgEditProfile-form')
	$('.parsley-errors-list').remove();
	$('.old-pass > p').remove();
	$('.new-pass > p').remove();
	$('.renew-pass > p').remove();
	frm.parsley().reset()
	document.getElementById('dlgEditProfile-form').reset();
})

/**
 *To prepare DOM element like input text box  , button , image profile for update user info form
 *
*/
$(function(){
	var dlgid = '#dlgEditProfile'
	$('[data-toggle="tooltip"]').tooltip();
	$(dlgid + '-btn-save').on('click', function(e) {
		$('.old-pass > p').remove();
		$('.new-pass > p').remove();
		$('.renew-pass > p').remove();
		saveUserProfile(dlgid)
	})

	var readURL = function(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function (e) {
				$(dlgid + "-profile_image-preview").attr('src', e.target.result);
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

	$(dlgid + "-profile_image").on('change', function(){
		readURL(this);
	})

	var ctrl =  $(dlgid + "-profile_image-preview")
	ctrl.on('click', function() {
			$(dlgid + "-profile_image").click();
	})

	ctrl.on('error',function() {
		if (g_defaulProfileImage === undefined ) {
			return
		}
		var src  = $(dlgid + "-profile_image-preview").attr('src')
		if ( src !=  g_defaulProfileImage ) {
			$(dlgid + "-profile_image-preview").attr('src',g_defaulProfileImage)
		}
	})
})

/**
 *To varify input data and display error message before update  user info
 *
 *@param {text} dlgid prefix id of element
*/
function saveUserProfile(dlgid) {
	var frm = $(dlgid + '-form')
	var frm_name = $(dlgid + '-full_name')

	frm_name.parsley().validate()
	if (!frm_name.parsley().isValid()) {
		return false
	}

	var npw = $(dlgid + '-newpassword')
	var newpass = $(dlgid + '-newpassword').val()
	var opw = $(dlgid + '-password')
	var confirmpass = $(dlgid + '-newpassword2')

	if(opw.val() != "" && confirmpass.val() != ''){

		if(newpass == ''){
			$('.new-pass').append("<p class='color-red'>กรุณาระบุข้อมูล</p>");
			return false
		}
		if(confirmpass.val() == ''){
			$('.renew-pass').attr("<p class='color-red'>กรุณาระบุข้อมูล</p>");
			return false
		}

		if ( !frm.parsley().validate({group: 'chpasswd', force: true}) ) {
			return false
		}
	}

	if (npw.val() != "") {
		if ( opw.val() == "" )  {
			$('.old-pass').append("<p class='color-red'>กรุณาระบุข้อมูล</p>");
			opw.focus()
			return false
		}

		if(newpass){
			// $('#dlgEditProfile-password').removeAttr('data-parsley-required','true');
			$(dlgid + '-password').attr('data-parsley-required','true');
		}


		if ( typeof g_LoginPublicKey != "undefined" ) {
			var encrypt = new JSEncrypt()
			encrypt.setPublicKey(g_LoginPublicKey)

			opw.val(encrypt.encrypt(opw.val()))
			npw.val(encrypt.encrypt(npw.val()))
		}
	}


	apiService.SendRequest("PUT","auth/profile",frm,
		function(data) {
			if ( g_reloadAccountInfo !== undefined ) {
				// window.location.href = g_reloadAccountInfo
			}
			clearPassword(dlgid)
		},
		function(jqXHR, textStatus, errorThrown){
			clearPassword(dlgid)
			$('.old-pass').append("<p class='color-red'>รหัสผ่านไม่ถูกต้อง</p>");
		},
		true
	)
}

/**
 *To reset password and varify image profile size
 *
 *@param {text} dlgid prefix id of element
*/
function clearPassword(dlgid) {
	$(dlgid + '-password').val('')
	$(dlgid + '-newpassword').val('')
	$(dlgid + '-newpassword2').val('')
	$(dlgid + '-form').parsley().reset()
}

// window.Parsley.addValidator('maxFileSize', {
//
//   validateString: function(_value, maxSize, parsleyInstance) {
//     if (!window.FormData) {
//       alert('เบราเซอร์ของคุณไม่รองรับการทำงานนี้ กรุณาอัพเกรดเบราเซอร์!');
//       return true;
//     }
//     var files = parsleyInstance.$element[0].files;
//     return files.length != 1  || files[0].size <= maxSize * 1024;
//   },
//   requirementType: 'integer',
//   messages: {
//     en: 'ไฟล์มีขนาดใหญ่เกิน %s Kb',
//   }
// });

// Disable form change password from user LDap
// $(function(){
// 	if(user_ldap.user_type_id == '3'){
// 		$('.grp-pass').hide();
// 	}else{
// 		$('.grp-pass').show();
// 	}
// })
