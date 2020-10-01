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
	srvData.translator = translator; //Text for label and message on java script

	//Declare url servicce
	srvData.service_setting_list = 'thaiwater30/backoffice/tool/setting_list'; //service setting list
	srvData.service_display_setting_json = 'thaiwater30/backoffice/tool/display_setting_json'; //service code json for setting
	srvData.service_dam_list = 'thaiwater30/iframe/dam';

	//Get data from service to generate option on filter setting list.
	apiService.SendRequest('GET', srvData.service_setting_list, {}, srvData.putDataTable);
	apiService.SendRequest('GET', srvData.service_dam_list, {}, srvData.renderDamlist);


	srvData.settingTableId = 'tbl-setting'; //table check image id
	ctrl = $('#' + srvData.settingTableId)
	srvData.dataTable = ctrl.DataTable({
		dom : 'frtlip',
		language : g_dataTablesTranslator,
		columns : [
			{
				defaultContent : '',
				orderable : false,
				searchable : false,
			},
			{
				data :  'name'
			},
			{
				data :  srvData.renderToolButtons
			}
		]
	})

	srvData.dataTable.on('order.dt search.dt', function() {
		srvData.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	//Event click button save.
	$('.btn-save').on('click', srvData.saveData);

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
	ctrl.on('click', 'i.btn-edit', srvData.getDataSetting);

	//Event click on button cancel.
	$('#btn-cancel').on('click',srvData.closeEdit)

	$('select[multiple=multiple]').each(function(i, e){
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllName: 'select-all-name',
			selectAllValue: 0,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : srvData.translator['selected_all'],
			allSelectedText : srvData.translator['all_selected'],
			nonSelectedText : srvData.translator['none_selected'],
			filterPlaceholder: srvData.translator['search']
		})
	});

}


srvData.putDataTable = function(rs){
	console.log("Setting list:",rs);
	srvData.dataTable.clear()
	if( JH.GetJsonValue(rs, 'result') != 'OK'){ return false;}
	srvData.dataTable.rows.add( JH.GetJsonValue(rs, 'data'));
	srvData.dataTable.draw();
}

/**
* Display data setting
*
*/
srvData.getDataSetting = function(){
	var data_row = srvData.dataTable.row( $(this).closest('tr') ).data();
	var setting_code = $(this).attr('name');
	var code_data = data_row.code;

	var param = {
		code : code_data
	}
	apiService.SendRequest('GET', srvData.service_display_setting_json, param, function(rs){
		srvData.DisplaySettingData(rs,code_data,setting_code)
	});
}


srvData.DisplaySettingData = function(rs,code_data,setting_code){
	var self = srvData;
	if(typeof rs === 'undefined' || rs == null || rs.result !== 'OK'){return false}

	var modal_id = '#';

	console.log("RS:",rs.data);
	self.data = JSON.parse(JH.GetJsonValue(rs,'data'));

	var self = srvData;
	var modal =$('.modal.fade.in'); ///moal is active

	console.log("Setting_code:",setting_code);

	/* Check to display which setting */
	if(setting_code.search("wave_setting") >=0 ){
		modal_id += 'wave_setting';
	}else if(setting_code.search("pre_rain_setting") >=0){
		modal_id += 'pre_rain_setting';
	}else if(setting_code.search("waterquality_setting") >=0){
		modal_id += 'waterquality_setting';
	}else if(setting_code.search("warning_setting") >=0){
		modal_id += 'warning_setting';
	}else if(setting_code.search("rain_setting") >=0){
		modal_id += 'rain_setting';
	}else if(setting_code.search("storm_setting") >=0){
		modal_id += 'storm_setting';
	}else if(setting_code.search("waterlevel_setting") >=0){
		modal_id += 'waterlevel_setting';
	}else if(setting_code.search("dam_scale_color") >=0){
		modal_id += 'dam_scale_color';
	}else if(setting_code.search("OnLoadDamGraph") >= 0){
		modal_id += 'OnLoadDamGraph';
	}else{
		bootbox.alert("Not found");
	}

	//Display modal
	$(modal_id).modal({
		backdrop : 'static'
	});

	console.log("Data:",self.data);

	var el_modal = $(modal_id); //modal activ

	el_modal.find('input[id="setting-code"]').val(setting_code);

	/* put data in form  */
	el_modal.find('input').each( function(){
		var $this =$(this);
		var data_key = $this.attr('data-key');
		if ( typeof data_key != 'undefined'){
			$this.val(JH.GetJsonValue(self.data,data_key));
			if ( $this.hasClass('jscolor') ){
				$this.css({'background-color':JH.GetJsonValue(self.data,data_key)})
			}

			// if( $this.hasClass('check_dam')){
			// 	$this.attr('checked',true);
			// }
		}

	})

	/* Add text label */
	el_modal.find('span').each(function(){
		var $this = $(this);
		var data_key = $this.attr('data-key');
		if( typeof data_key != 'undefined'){
			//Check label is translate
			if($this.attr('class') == 'trans'){
				$this.html(translate[JH.GetJsonValue(self.data, data_key)])
			}else{
				$this.text(JH.GetJsonValue(self.data, data_key))
			}
		}
	} )

	/* Add checked on dam list */

	var dam_ls = [];
	for(var i = 0; i < self.data.length; i++){
		var cur_dam_id = self.data[i].dam_id;

		i>1? _data = self.data[i-1] : _data = self.data[i]

		// console.log("cur_dam_id:",cur_dam_id)
		// console.log("_data.dam_id:",_data.dam_id)
		console.log("_data.dam_id:",_data.dam_id);

		if (i== 0 || cur_dam_id != _data.dam_id){
			console.log("OK")
			dam_ls[i/3] = cur_dam_id;
		}

	}

	$('#filters-dam').val(dam_ls);
	$('#filters-dam').multiselect('rebuild').multiselect('updateButtonText');
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


srvData.renderDamlist = function(rs){
	console.log("RSsss:",rs)
	var filter = document.getElementById('filters-dam')
	var dam_data = JH.GetJsonValue(rs.dam,'data')

	if ( dam_data == null ) {
		return
	}

	JH.Sort(dam_data,"dam_name",false , function(str){
		if(str['th']){
			return str['th'].toLowerCase();
		}else if(str['en']){
			return str['en'].toLowerCase();
		}else {
			return str['jp'].toLowerCase();
		}
	})

	for(var i=0; i < dam_data.length; i++){
			var op = document.createElement('option')
			//var txt = JH.GetLangValue(dam_data[i],'dam_name')
			var txt = dam_data[i].dam_name.th;
			var vl = JH.GetJsonValue(dam_data[i],'id')

			op.text = txt;
			op.value = vl;
			filter.add(op);
	}

	$(filter).multiselect({includeSelectAllOption:true});
	$(filter).multiselect('rebuild','selectAll','updateButtonText');
}

srvData.renderToolButtons = function(row, type, set, meta){
	var s = '<i class="btn btn-edit" name="'+row.code+'" title="' + srvData.translator['btn_edit']+'"></li>';
	return s;
}

srvData.saveData = function(){
	var self = srvData;
	var modal =$('.modal.fade.in');
	// console.log('modal:',modal)
	var data_code = modal.find('input[id="setting-code"]').val();

	var param = {
		code : data_code
	}

	if(data_code.search("OnLoadDamGraph") >= 0){
		var dam_graph = '';
		var dam_set = '';
		var _dam = $('#filters-dam').val().map(Number)

		console.log('_DAM:',_dam)

		// modal.find('input[type="checkbox"]').each( function(i){
		for(var i = 0; i < _dam.length; i++){
			for(var j=0; j<3; j++){
				var dam_st = '{ "dam_id": '+ _dam[i] +', "dam_data": "dam_storage", "dam_data_name": "ปริมาณน้ำในอ่าง" },';
				var dam_in = '{ "dam_id": '+ _dam[i] +', "dam_data": "dam_inflow", "dam_data_name": "ปริมาณน้ำไหลลงอ่าง" },';
				var dam_re = '{ "dam_id":'+ _dam[i] +', "dam_data": "dam_released", "dam_data_name": "ปริมาณน้ำกักเก็บ" }';

				i<(_dam.length-1)? dam_re+=',' :null
			}

			dam_set += dam_st+dam_in+dam_re;
			dam_graph = '['+dam_set+']'

		}
		console.log("XX:",dam_graph);
		// console.log("DD:",JSON.parse(dam_graph));

		param["value"] = dam_graph

	}else{
		modal.find('input').each( function(){
			var data_key = $(this).attr('data-key');
			if ( typeof data_key != "undefined" ){
				JH.SetJsonValue(self.data, data_key, $(this).val());
				param["value"] =  JSON.stringify(self.data)
			}
		})
	}

	 console.log("Param:",param);
	apiService.SendRequest('PUT', self.service_display_setting_json, param, function(data, status, jqxhr){
		if(status == 'success'){
			bootbox.alert({
				message: self.translator['msg_save_suc'],
				buttons: {
					ok: {
						label: self.translator['btn_close']
					}
				},
				callback: function(){
					location.reload();
				}
			})
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
