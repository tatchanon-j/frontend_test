/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data

srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on java script

	//Declare url servicce
	self.service_setting_list = 'thaiwater30/backoffice/tool/setting_list'; //service setting list
	self.service_display_setting_json = 'thaiwater30/backoffice/tool/display_setting_json'; //service code json for setting

	//Get data from service to generate option on filter setting list.
	apiService.SendRequest('GET', self.service_setting_list, {}, self.genFilterService);

	//Event filter setting change.
	$('#filter_setting').on('change', self.changeDataSetting);

	//Event click button save.
	$('#btn-save').on('click', self.saveDisplaySetting);

	// add custom validation json
	window.Parsley.addValidator('json', {
		validateString: function(value) {
			try {
				return JSON.parse(value);
			} catch (e) {
				return false;
			}
		},
		messages: {
			en: srvData.translator["msg_err_json_format"],
			fr: srvData.translator["msg_err_json_format"]
		}
	});

	//Event click on button edit.
	$('.btn-edit').on('click',function(){
		$('.grp-btn').show();
		$('.btn-edit').hide();
		$('#display_setting').removeAttr('disabled','false');
	})

	//Event click on button cancel.
	$('#btn-cancel').on('click',self.closeEdit)
}


/**
* Generate option on filter setting list
*
* @param {st} st list data to setting
*/
srvData.genFilterService = function(st){
	var filter_setting = document.getElementById('filter_setting'); //element filter setting
	var data_service = apiService.getFieldValue(st,'data'); //data list setting
	var i = 0; //condition loop

	if(data_service == null){return }

	for(i; i<data_service.length; i++){
		var gen_option = document.createElement('option'); //create element option
		var txt_option = data_service[i]['name']; //option name
		var val_option = data_service[i]['code']; //option value

		gen_option.text = txt_option
		gen_option.value = val_option
		filter_setting.add(gen_option)
	}
	srvData.displaySetting()
}


/**
* Event change filter setting list
*
*/
srvData.changeDataSetting = function(){
	srvData.closeEdit();
	srvData.displaySetting();
}


/**
* Display data setting
*
*/
srvData.displaySetting = function(){

	var data_setting = $('#filter_setting').val(); //list setting
	var param = {
		code : data_setting
	}

	apiService.SendRequest('GET', srvData.service_display_setting_json, param, function(js){
		var data_display = JH.GetJsonValue(js,'data')
		$('#display_setting').val(data_display)
	});
}


/**
* Save data setting
*
*/
srvData.saveDisplaySetting = function(){
	var self = srvData; //initial data
	var st = $('#display_setting').val(); //code json for setting
	var data_code = $('#filter_setting').val(); //list setting
	var frm = $('#display-form'); //element form setting

	$('#display-form').parsley().validate();
	if (! $('#display-form').parsley().isValid() ){
		return false;
	}

	//var j_st = JSON.parse(st);

	var param = {
		code : data_code,
		value : st
	}
	console.log("Param OLD:",param);
	apiService.SendRequest('PUT', self.service_display_setting_json, param, function(data, status, jqxhr){
		if(status == 'success'){
			bootbox.alert({
				message: self.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			})
			$('p.err-json').remove()
			srvData.closeEdit()

		}else{
			bootbox.alert({
				message: self.translator['msg_save_unsuc'],
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				}
			})
		}
	})
}


/**
* Check fotmat json data
*
* @param {josn} st json data for settig
*/
srvData.isJson = function(st) {
	var data_code = $('#filter_setting').val(); //list setting

	$('p.err-json').remove();

	try {
		return JSON.parse(st);
	} catch (e) {
		//text data type  then do not validate json
		if(data_code!='thaiwater30.service.CreateYearlyPartitionCron' && data_code!='server.model.dataimport.GenerateDataImportDailyReportEventCron'){
			$('#display_setting').parsley().addError("msg_err_json_format", {message: srvData.translator["msg_err_json_format"], updateClass: true});
		}
	}
	return false;
}


/**
* Close edit settig
*
*/
srvData.closeEdit = function(){
	srvData.displaySetting();
	$('p.err-json').remove();
	$('.grp-btn').hide();
	$('.btn-edit').show();
	$('#display_setting').attr('disabled','true');
	$('#display-form').parsley().reset();
}
