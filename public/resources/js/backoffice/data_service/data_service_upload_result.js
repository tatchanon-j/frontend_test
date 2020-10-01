/**
*
*   srvDSUR Object for handler data service upload result page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvDSUR = {};

/**
*   Initial srvDSUR
*   @param {object} trans - translate object from laravel
*/
srvDSUR.init = function(trans){
	srvDSUR.translator = trans;
	srvDSUR.service = "thaiwater30/backoffice/data_service/upload_result";

	// Data table
	srvDSUR.table = $('#table').DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns: [{
			data: 'order_header_id'
		},{
			data: srvDSUR.renderLetterNo
		},{
			data: srvDSUR.renderAgencyName
		},{
			data: srvDSUR.renderUploadButton
		},{
			data: srvDSUR.renderViewButton
		}],
		order: [0 , 'desc']
	});

	$('#table').on('click' , '.btn-upload' , srvDSUR.showUploadModal);
	$('#modal-upload').on('shown.bs.modal', function(){
		$('#btn-upload').on('click' , srvDSUR.btnUploadClick);
	}).on('hide.bs.modal' , function(){ $('#btn-upload').off('click'); });

	// load data and render
	apiService.SendRequest("GET" , srvDSUR.service , {} , function(rs){
		if (rs.result == "OK"){
			srvDSUR.data = rs.data;
		}else{
			srvDSUR.data = [];
		}
		srvDSUR.renderTable();
	});
}

/**
*   render table
*/
srvDSUR.renderTable = function(){
	srvDSUR.table.clear();
	if (srvDSUR.data){
		srvDSUR.table.rows.add(srvDSUR.data);
	}
	srvDSUR.table.draw();
}

/**
*   render letterno
*   @param {object} row - The data for the whole row
*   @return {string} letterno
*/
srvDSUR.renderLetterNo = function(row){
	return JH.GetJsonValue(row, "detail_letterno");
}

/**
*   render agency name
*   @param {object} row - The data for the whole row
*   @return {string} agency name
*/
srvDSUR.renderAgencyName = function(row){
	return JH.GetJsonLangValue(row["agency"] , "agency_name",true);
}

/**
*   render upload button
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} upload button
*/
srvDSUR.renderUploadButton = function(row, type, set, meta){
	return '<i class="btn btn-upload" data-data="'+meta.row+'" data-head="'+row["order_header_id"]+'" data-agency="'+row["agency"]["id"]+'" aria-hidden="true"></i>';
}

/**
*   render view pdf button
*   @param {object} row - The data for the whole row
*   @return {string} view pdf button
*/
srvDSUR.renderViewButton = function(row){
	if (row["detail_letterpath"]){
		return '<a class="btn btn-view" href="' + PDF_URL + row["detail_letterpath"] + '" rel="nofollow noreferrer noopener" target="_blank"></a>';
	}
	return '';
}

/**
*   show upload modal
*/
srvDSUR.showUploadModal = function(){
	$('#form-upload-head').val($(this).attr('data-head'));
	$('#form-upload-agency').val($(this).attr('data-agency'));
	$('#form-upload-data').val($(this).attr('data-data'));
	$('#form-upload')[0].reset();
	$('#btn-upload').button('reset');
	$('#modal-upload').modal();
}

/**
*   Event on btn upload click
*	send PUT to service to upload file result
*/
srvDSUR.btnUploadClick = function(){
	var chooseFile = $('#input-file').val() ;
	if ( chooseFile.length == 0 ){
		bootbox.alert(srvDSUR.translator["plases_select_file"]);
		return false;
	}
	if ( chooseFile.substr(chooseFile.length - 4) != ".pdf" ){
		bootbox.alert(srvDSUR.translator["only_pdf"]);
		return false;
	}
	var form = document.getElementById('form-upload');
	var formData = new FormData(form);
	$('#btn-upload').button('loading');

	apiService.SendRequest("PUT" , srvDSUR.service , formData , function(rs){
		if (rs.result == "OK"){
			$('#modal-upload').modal('hide');
			bootbox.alert(srvDSUR.translator["upload_succes"]);
			srvDSUR.data[formData.get("data")]["detail_letterpath"] = rs.data;
			srvDSUR.renderTable();
		}
	} , null , true);
}
