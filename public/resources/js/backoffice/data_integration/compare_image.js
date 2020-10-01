var srvData = {}; //initial data
var el_id = '#dlgCompImage'; //Prefix id of element in form

/**
* Initial page load.
*
* @param {json} translator Text for use on page.
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator = translator; //Text for label and message on javascript
	self.service_summary_image = "thaiwater30/migration_log/summary_image";
	self.service_image_by_media = "thaiwater30/migration_log/image_by_media";

	apiService.SendRequest('GET', self.service_summary_image, {}, self.displayDataTable);

	//*data table setting
	self.metadataTableId = 'tbl-compare-image'; //element id of data table
	ctrl = $('#' + self.metadataTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons : [ {
			extend : 'excelHtml5',
			text : ' <i class="fa fa-file-excel-o color-green" aria-hidden="true"></i> Export excel',
		} ],
		"iDisplayLength": 50,
		language : g_dataTablesTranslator,
		columns : [
			{
				data : srvData.renderToolButtons,
				orderable : false,
				searchable : false,
			},
			{
				data : srvData.media_type_id,
			},{
				data : srvData.media_type_name,
			},{
				data : srvData.media_subtype_name,
			},{
				data : srvData.nhc_row_count,
			}, {
				data : srvData.nhc_file_count,
			}, {
				data : srvData.row_diff,
			},{
				data : srvData.last_migrate_date,
			},{
				data : srvData.last_update,
			}, {
				data : srvData.thaiwater30_convert_success,
			},{
				data : srvData.thaiwater30_convert_error,
			}, {
				data : srvData.thaiwater30_file_count,
			}
		],
		"footerCallback": function ( row, data, start, end, display ) {
			var api = this.api(), data;
			// Remove the formatting to get integer data for summation
			var intVal = function ( i ) {
				return numeral(i).value();
			};

			// Sum over all pages
			total_nhc_row_count_page = api.column( 4 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );
			total_nhc_file_count_page = api.column( 5 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			total_row_diff_page = api.column( 6 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			total_last_update_page = api.column( 8 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			total_thaiwater30_convert_success_page = api.column( 9 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );
			total_thaiwater30_convert_error_page = api.column( 10 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );
			total_thaiwater30_file_count_page = api.column( 11 ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			},0 );

			// Sum over this page, 3 is colum number begin at 0
			total_nhc_row_count_page_total = api.column( 4, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );
			total_nhc_file_count_page_total = api.column( 5, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );
			total_row_diff_page_total = api.column( 6, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );
			total_last_update_page_total = api.column( 8, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );
			total_thaiwater30_convert_success_page_total = api.column( 9, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );
			total_thaiwater30_convert_error_page_total = api.column( 10, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );
			total_thaiwater30_file_count_page = api.column( 11, { page: 'current'} ).data().reduce( function (a, b) {
				return intVal(a) + intVal(b);
			}, 0 );

			// Update footertotal_nhc_row_count_page
			$('#total_nhc_row_count').html(total_nhc_row_count_page_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_nhc_row_count_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$('#total_nhc_file_count').html(total_nhc_file_count_page_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_nhc_file_count_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$('#total_row_diff').html(total_row_diff_page_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_row_diff_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			// $('#total_last_update').html(total_last_update_page_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_last_update_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$('#total_thaiwater30_convert_success').html(total_thaiwater30_convert_success_page_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_thaiwater30_convert_success_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$('#total_thaiwater30_convert_error').html(total_thaiwater30_convert_error_page_total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_thaiwater30_convert_error_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
			$('#total_thaiwater30_file_count').html(total_thaiwater30_file_count_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"/"+total_thaiwater30_file_count_page.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		},
		order : [ [ 0, 'asc' ] ]
	})

	// Event button edit data o datatable.
	ctrl.on('click', 'i.btn-view', self.getImage_by_media);

	$('#btn-cancel').on('click', srvData.closeDetail);
	$('#btn_reprocess').on('click', srvData.Reprocess);
}

/**
* Put data to rows on data table.
*
* @param {json} si the data to generate rows on data table.
*/
srvData.displayDataTable = function(si){
	srvData.dataTable.clear();
	if( JH.GetJsonValue(si , "result") != "OK"){ return false; }
	$('.last_update').text(si.last_update);
	if ( JH.GetJsonValue(si, "bg_running") ){
		// bg_running == true แสดงว่ามี bg process กำลังทำงานอยู่ ให้ปิดการทำานของ #btn_reprocess
		$('#btn_reprocess').prop('disabled', true).off('click');
	}
	srvData.dataTable.rows.add( JH.GetJsonValue(si , "data") );
	srvData.dataTable.draw();
}

/**
* put data on codition colu,n.
*
* @param {json} row The data for the whole row.
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set.
* @param {json} meta The row and column index for the requested cell.
*
* @return {text} The name data for display on name column.
*/
srvData.media_type_id = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'media_type_id');
}

srvData.media_type_name = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'media_type_name');
}

srvData.media_subtype_name = function(row, type, set, meta){
	return JH.GetJsonValue(row, 'media_subtype_name');
}

srvData.nhc_row_count = function(row, type, set, meta){
	var nhc_row_count = JH.GetJsonValue(row, 'nhc_row_count');
	if(nhc_row_count){
		nhc_row_count = nhc_row_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return nhc_row_count
}

srvData.nhc_file_count = function(row, type, set, meta){
	var nhc_file_count = JH.GetJsonValue(row, 'nhc_file_count');
	if(nhc_file_count){
		nhc_file_count = nhc_file_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return nhc_file_count
}

srvData.row_diff = function(row, type, set, meta){
	var row_diff = JH.GetJsonValue(row, 'row_diff');
	if(row_diff){
		row_diff = row_diff.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return row_diff
}

srvData.last_migrate_date = function(row, type, set, meta){
	var date  = last_migrate_date = JH.GetJsonValue(row, 'last_migrate_date');

	return date.substring(0, 19);
}

srvData.last_update = function(row, type, set, meta){
	var date =  last_update = JH.GetJsonValue(row, 'last_update');
	return date.substring(0, 19);
}

srvData.thaiwater30_convert_success = function(row, type, set, meta){
	var thaiwater30_convert_success = JH.GetJsonValue(row, 'thaiwater30_convert_success');
	if(thaiwater30_convert_success){
		thaiwater30_convert_success = thaiwater30_convert_success.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return thaiwater30_convert_success
}

srvData.thaiwater30_convert_error = function(row, type, set, meta){
	var thaiwater30_convert_error = JH.GetJsonValue(row, 'thaiwater30_convert_error');
	if(thaiwater30_convert_error){
		thaiwater30_convert_error = thaiwater30_convert_error.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return thaiwater30_convert_error
}

srvData.thaiwater30_file_count = function(row, type, set, meta){
	var thaiwater30_file_count = JH.GetJsonValue(row, 'thaiwater30_file_count');
	if(thaiwater30_file_count){
		thaiwater30_file_count = thaiwater30_file_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	return thaiwater30_file_count
}

/**
* Create icon for edit and delete data on datatable.
*
* @param {json} row The data on data table
* @param {json} type
* @param {json} set
* @param {json} meta Colum and row id
*
*@return {json} The element HTML of buttons.
*/
srvData.renderToolButtons = function(row, type, set, meta) {
	var self = srvData;
	var s = '<i class="btn btn-view"></i>';

	return s;
}


srvData.getImage_by_media = function(){
	var row = srvData.dataTable.row( $(this).closest('tr') ).data();
	var param = {
		media_type_id: row.media_type_id
	}

	apiService.SendRequest('GET', srvData.service_image_by_media, param, srvData.displayDetail);
}


/**
* Display modal add or edit data.
*
* @param {text} url url image
*/
srvData.displayDetail = function(url){
	var nhc_image_url = url.data.nhc_image_url;
	var thaiwater30_image_url = url.data.thaiwater30_image_url;

	$('.div_detail_table').show();
	$('.div_main_table').hide();
	$('body').addClass('sidebar-collapse');

	srvData.pre_url = 'http://api2.thaiwater.net:9200/api/v1/thaiwater30/shared/image?image=' + url.data.thaiwater30_image_url;

	if(nhc_image_url && thaiwater30_image_url){
		console.log("1");
		$('.img-nhc').attr('src',url.data.nhc_image_url);
		$('.img-tw30').attr('src',srvData.pre_url);
		$('.no-image-nhc,.no-image-tw30').hide();
		$('.img-nhc,.img-tw30').show();
	}else if(nhc_image_url && !thaiwater30_image_url){
		$('.img-nhc').attr('src',url.data.nhc_image_url);
		$('.no-image-tw30').text('ไม่มีรูปภาพ');
		$('.no-image-nhc').hide();
		$('.no-image-tw30').show();
		$('.img-tw30').hide();
	}else if(!nhc_image_url && thaiwater30_image_url){
		$('.no-image-nhc').text('ไม่มีรูปภาพ');
		$('.img-tw30').attr('src',srvData.pre_url);
		$('.no-image-nhc').show();
		$('.no-image-tw30').hide();
		$('.img-nhc').hide();
	}else{
		$('.no-image-nhc,.no-image-tw30').text('ไม่มีรูปภาพ');
		$('.no-image-nhc').show();
		$('.no-image-tw30').show();
		$('.img-nhc').hide();
		$('.img-tw30').hide();
	}

}



srvData.closeDetail = function(){
	$('.div_detail_table').hide();
	$('.div_main_table').show();
	$('body').removeClass('sidebar-collapse');
	$('.img-tw30').removeAttr('src');
	$('.img-nhc').removeAttr('src');
	srvData.pre_url = ''
}

srvData.Reprocess = function(){
	apiService.SendRequest('PUT', srvData.service_summary_image, {}, function(rs){
		console.log("Result:",rs);
		if(typeof rs === 'undefined' || rs == null){
			bootbox.alert("Can't reprcess");
			return false
		}

		if(rs.result == 'OK'){
			$('#btn_reprocess').prop('disabled', true).off('click');
			bootbox.alert("Reprocess Success");
		}else{
			bootbox.alert("Reprocess Fail !!!");
		}
	});
}
