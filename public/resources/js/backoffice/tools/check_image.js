/**
*
*   Main JS application file for chaeck image page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = { cache: {} } //initial data
var date_range; //date range


/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function (translator) {
	var self = srvData;  //initial data
	self.translator = translator; //Text for label and message on java script
	self.service_lastest_image_load = '/thaiwater30/backoffice/tool/lastest_image_load'; //service lastest image load
	self.service_lastest_image = '/thaiwater30/backoffice/tool/lastest_image'; //service lastest image
	self.service_image_type = '/thaiwater30/backoffice/tool/image_type'; //service image type

	self.groupTableId = 'tbl-checkmeta'; //table check image id
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom: 'frtlip',
		language: g_dataTablesTranslator,
		columns: [{
			defaultContent: '',
			orderable: false,
			searchable: false,
		},
		{
			data: self.renderColumDate,
		},
		{
			data: self.renderColumDesc,
		},
		{
			data: self.renderColumFileName,
		},
		{
			data: self.renderColumDateSrcFile
		}],
		order: [[1, 'asc']],
		rowCallback: self.dataTableRowCallback
	})

	self.dataTable.on('order.dt search.dt', function () {
		self.dataTable.column(0, {
			search: 'applied',
			order: 'applied'
		}).nodes().each(function (cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	$('select[multiple=multiple]').each(function (i, e) {
		$(e).multiselect({
			buttonWidth: '100%',
			maxHeight: 300,
			includeSelectAllOption: true,
			selectAllNumber: false,
			enableFiltering: true,
		})
	})


	ctrl.on('click', '.btn-display', self.displayImg);
	$('#btn_preview').on('click', self.btnClickPreview);
	$('#filter_agency').on('change', self.changeFilter_agency);

	// Get data from service to generate option filter agency
	apiService.SendRequest('GET', self.service_lastest_image_load, {}, self.genFilter_agency);

	/* setting default on filter date */
	$("#filter_startdate").datepicker(
		'setDate', new Date()
	)
	$("#filter_enddate").datepicker(
		'setDate', new Date()
	)

	$('#filter_imagetype').val('default').attr('disabled', true);
}



/**
*Generate option for filter agency
*
*@param {json} data Json from service lastest_image_load
*/
srvData.genFilter_agency = function (data) {
	date_range = data['data']['date_range'];
	var filter_agency = document.getElementById('filter_agency'); //element filter agency
	var data_agency = apiService.getFieldValue(data, 'data.agency'); //ageny data
	var i = 0; //condition loop

	if (data_agency == null) { return }

	for (i; i < data_agency.length; i++) {
		var gen_option = document.createElement('option'); //create option element
		var agency_th = JH.GetJsonLangValue(data_agency[i], 'agency_name', true); // agency name

		if (agency_th) {
			var txt_option = agency_th; //option name
		} else {
			txt_option = srvData.translator['noname']
		}
		var val_option = data_agency[i]['id']; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_agency.add(gen_option);
	}
}

/**
*Generate new option for filter image type which relate with selected on filter agency.
*
*/
srvData.changeFilter_agency = function () {
	var self = srvData;  //initial data
	var param = {}; //parameter
	var data_source = $('#filter_agency').val(); //data source

	if (data_source == 'default') {
		$('#filter_imagetype').val('default').attr('disabled', true);
	} else {
		$('#filter_imagetype').attr('disabled', false);
		param['agency_id'] = data_source;
		apiService.SendRequest('GET', self.service_image_type, param, self.genfilter_Imagetype);
	}
}

/**
*Generate option for filter image type
*
*@param {json} image_type Json data from service image_type
*/
srvData.genfilter_Imagetype = function (image_type) {
	$('#filter_imagetype option').not('.default').remove();
	var self = srvData;  //initial data
	var filter_imagetype = document.getElementById('filter_imagetype'); //element imagetype filter
	var data_img = apiService.getFieldValue(image_type, 'data'); //data image
	var i = 0; //condition loop

	if (data_img == null) { return }

	for (i; i < data_img.length; i++) {
		var gen_option = document.createElement('option'); //create option element
		var media_type_subtype_name = data_img[i]['media_type_subtype_name']; //type image

		if (media_type_subtype_name) {
			var txt_option = media_type_subtype_name; //option name
		} else {
			txt_option = srvData.translator['noname']
		}

		var val_option = data_img[i]['id']; //option value

		gen_option.text = txt_option;
		gen_option.value = val_option;
		filter_imagetype.add(gen_option);
	}

}

/**
*Get data from filter to send service for display data table.
*
*/
srvData.btnClickPreview = function () {
	var self = srvData;  //initial data
	var param = {}; //parametter
	var source_data = $('#filter_agency').val(); //source data
	var img_type = $('#filter_imagetype').val(); //image type
	var startDate = $('#filter_startdate').datepicker("getDate"); //start date
	var endDate = $('#filter_enddate').datepicker("getDate"); //end date

	if (!startDate || !endDate || source_data == 'default' || img_type == 'default') {
		bootbox.alert({
			message: self.translator['msg_err_require_filter'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})

		return false
	}

	//var date_range = parseInt($('#date_range').val());
	var stDate = startDate.setDate(startDate.getDate()); //start date
	maxDate = startDate.setDate(startDate.getDate() + self.date_range);

	var endDate = $('#filter_enddate').datepicker("getDate"); //end date
	endDate = endDate.setDate(endDate.getDate());

	if (stDate > endDate) {

		bootbox.alert({
			message: self.translator['msg_stdate_over_endate'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})

		return false
	}

	if (endDate > maxDate) {
		bootbox.alert({
			message: self.translator['msg_err_date_over_range'].replace('%s', date_range),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		return false
	}

	param['agency_id'] = $('#filter_agency').val();
	param['media_type_id'] = $('#filter_imagetype').val();
	param['start_date'] = $('#filter_startdate').val();
	param['end_date'] = $('#filter_enddate').val();

	apiService.SendRequest('GET', self.service_lastest_image, param, self.previewDataTables);
}

/**
*Push data on data table.
*
*@param {json} data Json data from service lastest_image
*/
srvData.previewDataTables = function (data) {
	var a = []; //image data
	var self = srvData;  //initial data
	var data_table = apiService.getFieldValue(data, 'data'); //initial image data

	if (data_table == null) { return }

	for (var i = 0; i < data_table.length; i++) {
		a.push(data_table[i]);
	}

	self.dataTable.clear();
	self.dataTable.rows.add(a);
	self.dataTable.draw();

}

/**
*Add attribute "src" on element img for display image on dialog box display image.
*
*/
srvData.displayImg = function () {
	var self = srvData;  //initial data
	var id = $(this).attr('data-row'); //image data id

	$('#dlgDisplay-title').text(srvData['cache'][id]['filename']);

	var src_img = srvData['cache'][id]['image_id']; //image id

	$(".modal-body > img").attr("src", IMAGE_URL + src_img);
}

/**
*Push data on colum date.
*
*@param {json} datetime Json data from data table.
*/
srvData.renderColumDate = function (datetime) {
	var pushData = ''; //prepare date data

	if (datetime['media_datetime']) {
		pushData = datetime['media_datetime'];
	}

	return pushData
}

/**
*Push data on colum description.
*
*@param {json} desc Json data from data table.
*/
srvData.renderColumDesc = function (desc) {
	var pushData = ''; //prepare media description data

	if (desc['media_desc']) {
		pushData = desc['media_desc'];
	}

	return pushData
}

/**
*Push data on colum file name.
*
*@param {json} file Json data from data table.
*/
srvData.renderColumFileName = function (file) {
	var pushData = ''; //prepare file name data

	if (file['filename']) {
		pushData = file['filename'];
	}

	return pushData
}

/**
*Push data on colum date source file.
*
*@param {json} datetime Json data from data table.
*@param {json} set row number on data table.
*/
srvData.renderColumDateSrcFile = function (datetime, set) {
	var id = datetime.id; //image data id
	srvData["cache"][id] = datetime;
	var pushData = srvData.translator['data_not_found']; //prepare render buton view image
	if (datetime['file_status'] == true) {
		pushData = '<a href="#" class="btn-display" title="แสดงรูปภาพ" data-row="' + id + '" data-toggle="modal" data-target="#dlgDisplay" ><i class="fa fa-file-image-o" aria-hidden="true"></i> พบข้อมูล</a>'
	}

	return pushData
}
