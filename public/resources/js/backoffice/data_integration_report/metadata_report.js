/**
*
*   Main JS application file for metadata page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var md = {}; //initial data


/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
md.init = function(translator) {
	md.DATA = { category : {} };
	md.translator = translator; //Text for label and message on java script
	md.service_metadata = 'thaiwater30/backoffice/metadata/metadata'; //service metadata

	var btn_preview = $('#btn_preview'); //element button preview
	btn_preview.on('click',md.btnPreviewClick);
	apiService.SendRequest('GET', md.service_metadata+"_load", {}, md.handlerSeviceLoad);

	/*Create DataTable*/
	md.metadataTableId = 'tbl-metadata'; //id metadata table
	ctrl = $('#' + md.metadataTableId);
	md.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : renderColumnMetadata,
		}, {
			data : renderColumnCategory,
		}, {
			data : renderColumnSubCategory,
		}, {
			data : renderColumnAgency,
		}, {
			data : renderColumnMetadataStatus,
		}],
		order : [ [ 1, 'asc' ] ]
	});

	/* Genalate order number on datatable */
	md.dataTable.on('order.dt search.dt', function() {
		md.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	/* Event button edit data on datatable */
	ctrl.on('click', '.btn-edit', md.editMetadata)
	/* Event button delete data on datatable */
	ctrl.on('click', '.btn-delete', md.deleteMatadata)
	/* Event button view data on datatable */
	ctrl.on('click', '.openModal', md.viewMetadata)

	$('#form').on('click', '.remove-group-frequency' , md.removeGroupConvertfrequency);
	$('#form').on('click', '.add-group-frequency' , md.addGroupfrequency);

	$('#filter_category,#form-category').on('change' , md.categoryChange);
	$('#form-method').on('change' , md.methodChange);

	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllName: 'select-all-name',
			selectAllValue: 0,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : md.translator['select_all'],
			allSelectedText : md.translator['all_selected'],
			nonSelectedText : md.translator['none_selected'],
			filterPlaceholder: md.translator['search']
		})
	});

	language_frm = $('#language-form');
	language_frm.on('change' , function(){
		var language_frm = $('select[id=language-form]').val()
		if(language_frm == "th"){
			$('.metadata-th').show()
			$('.metadata-en').hide()
			$('.metadata-jp').hide()
		}else if(language_frm == "en"){
			$('.metadata-th').hide()
			$('.metadata-en').show()
			$('.metadata-jp').hide()
		}
		else{
			$('.metadata-th').hide()
			$('.metadata-en').hide()
			$('.metadata-jp').show()
		}
	});

	// Hide filter and datatable
	$('#form').hide()

	// button Cancel on click
	$('#form-close-btn').on('click', md.closeForm);
	// button save new  or edited department
	$('#form-save-btn').on('click', md.saveMetadata);
};


/**
* handler data from service
*
* @param {json} rs initial data
*
*/
md.handlerSeviceLoad = function(rs){
	console.log(rs)
	md.handlerAgency(JH.GetJsonValue(rs, "agency"));
	md.handlerHydro(JH.GetJsonValue(rs, "hydroinfo"));
	md.handlerCategory(JH.GetJsonValue(rs, "category"));
	md.handlerSubcategory(JH.GetJsonValue(rs, "subcategory"));
	md.handlerFrequencyUnit(JH.GetJsonValue(rs, "frequencyunit"));
	md.handlerDataformat(JH.GetJsonValue(rs, "dataformat"));
	md.handlerMetadataStatus(JH.GetJsonValue(rs, "metadata_status"))

	md.gen_input_servicemethod(JH.GetJsonValue(rs, "servicemethod"));
	md.gen_input_method(JH.GetJsonValue(rs, "metadata_method"));
	md.gen_input_status(JH.GetJsonValue(rs, "metadata_status"));
	md.gen_input_dataunit(JH.GetJsonValue(rs, "dataunit"));

	md.previewDataTables(JH.GetJsonValue(rs, "metadata"));
}


/**
* handler filter agency
*
* @param {json} rs initial agency data
*
*/
md.handlerAgency = function(rs){
	if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
	var data = JH.GetJsonValue(rs , "data"); //agency dat

	JH.Sort(data, "agency_name", false, JH.GetLangValue);

	var dlgEditMetadata = md.gen_filter_agency("form-agency",data); //element form agency

	$(dlgEditMetadata).select2();

	var filter = md.gen_filter_agency("filter_agency",data); //

	$(filter).multiselect({includeSelectAllOption: true });
	$(filter).multiselect('rebuild');
	$(filter).multiselect('selectAll',false);
	$(filter).multiselect('updateButtonText');
}

/**
* handler metadata status
*
* @param {json} rs initial metadata status
*
*/
md.handlerMetadataStatus = function(rs){
	if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
	var data = JH.GetJsonValue(rs , "data"); //agency dat

	JH.Sort(data, "metadata_status_name", false, JH.GetLangValue);

	var filter = md.gen_filter_metadatastatus("filter_metadatastatus",data); //

	$(filter).multiselect({includeSelectAllOption: true });
	$(filter).multiselect('rebuild');
	$(filter).multiselect('selectAll',false);
	$(filter).multiselect('updateButtonText');
}

/**
* handler filter hydro
*
* @param {json} rs initial hydroinfo data
*
*/
md.handlerHydro = function(rs){
	console.log(rs)
	if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
	var data = JH.GetJsonValue(rs , "data"); //hydroinfo data
	JH.Sort(data, "hydroinfo_number");
	var filter = md.gen_filter_hydro("filter_hydro",data); // element filter hydroinfo
	$(filter).multiselect('selectAll',false);
	$(filter).multiselect('updateButtonText');
	md.gen_filter_hydro("form-hydro",data);
}



/**
* handler filter frquency unit
*
* @param {json} rs initial frquency unit data
*
*/
md.handlerFrequencyUnit = function(rs){

	if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
	var data = apiService.getFieldValue(rs,'data'); //frquency unit data
	if ( data == null ) {
		return
	}

	//var data = JH.GetJsonValue(rs , "data");
	JH.Sort(data, "frequencyunit_name", false, JH.GetLangValue);
	JH.Set('FrequencyUnit' , data);
	for (var i = 0 ; i < data.length ; i++){

		var d = data[i]; //initail freauenc unit data
		var text = JH.GetJsonLangValue(d, "frequencyunit_name", true); //frequencyunit name
		var convert_minute = JH.GetJsonValue(d, "convert_minute"); //convert minutte data

		$('select[name=form-frequency_unit]').append( $('<option>', { value: text, text: text}) );
		$('#form-convertfrequency_unit').append($('<option>', { value: convert_minute, text: text}));
	}
}


/**
* handler filter category
*
* @param {json} rs initial category data
*
*/
md.handlerCategory = function(rs){
	if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
	var data = JH.GetJsonValue(rs , "data"); //category data
	JH.Sort(data, "category_name", false, JH.GetLangValue);
	var select = md.gen_filter_category("form-category",data, true); //element category in form
	$(select).trigger('change');
	var filter = md.gen_filter_category("filter_category",data); //elemet filter category
	$(filter).trigger('change');
}


/**
* handler filter subcategory
*
* @param {json} rs initial subcategory data
*
*/
md.handlerSubcategory = function(rs){
	JH.Set('subcategory' , JH.GetJsonValue(rs,"data"));
	var data = apiService.getFieldValue(rs,'data'); //sub-category data

	if ( data == null ) {
		return
	}

	JH.Sort(data, "subcategory_name", false, JH.GetLangValue);

	for (var i = 0 ; i < data.length ; i ++){

		var d = data[i]; //initail subcategory data
		var v = JH.GetJsonValue(d, "category_id"); //id category

		if ( typeof md["DATA"]["subcategory_" + v] == "undefined"){
			md["DATA"]["subcategory_" + v] = [];
		}
		md["DATA"]["subcategory_" + v].push(d);
	}

	var select = md.gen_filter_subcategory("filter_subcategory", []); //element filter sub-category

	$(select).multiselect('disable');
	var form = md.gen_filter_subcategory("form-subcategory", md["DATA"]["subcategory_1"]); //element form sub-category
	$(form).select2();
}


/**
* update option on filter subcategory
*
*/
md.categoryChange = function(){
	var id = $(this).attr('id'); //id element
	var target_id = id.replace('category', 'subcategory'); //replace id
	var val = $(this).val(); //id category
	var data = apiService.getFieldValue(md["DATA"],"subcategory_" + val);

	if ( data == null ) {
		return
	}

	var select = md.gen_filter_subcategory(target_id, data); //element filter sub-category

	if ( target_id.charAt(1) == 'i' ){
		$(select).multiselect({includeSelectAllOption: true });
		$(select).multiselect('rebuild');
		if ( val != "all" || data.length == 0 ){
			$(select).multiselect('selectAll',false);
			$(select).multiselect('updateButtonText');
		}else{
			$(select).multiselect('disable');
		}
	}else{
		$(select).select2();
	}
}



/**
* handler data dataformat in form
*
* @param {json} rs initial dataformat data
*
*/
md.handlerDataformat = function(rs){
	var data = apiService.getFieldValue(rs,"data"); //initial data format
	if ( data == null ) {
		return
	}
	JH.Sort(data, "dataformat_name", false, JH.GetLangValue);
	JH.Set('dataformat' , data);
	for (var i = 0 ; i < data.length ; i ++){
		var d = data[i];
		var v = JH.GetJsonValue(d, "metadata_method_id");
		if ( typeof md["DATA"]["dataformat_" + v] == "undefined"){
			md["DATA"]["dataformat_" + v] = [];
		}
		md["DATA"]["dataformat_" + v].push(d);
	}
}


/**
* Update option on select dataformat
*
*/
md.methodChange = function(){
	var val = $(this).val(); //id method
	var data = JH.GetJsonValue(md["DATA"], "dataformat_" + val); //id data format
	md.gen_input_dataformat(data);
}


/**
* Add group frequency
*
* @param {json} rs initial frequency data
*
*/
md.addGroupfrequency = function(data){
	if ( $('#form input[name="form-frequency"]').length >= 5) { return false; }
	var gC = $('#master-group-frequency').clone().removeAttr('id').removeAttr("hidden"); //add form input frquency data
	$('.group-frequency').append('<div class="clearfix"></div>').append(gC);
	if ( data ){
		var freq = JH.GetJsonValue(data, "datafrequency").split(" "); //split frequency data
		gC.find('input[name="form-frequency"]').val(freq[0]);
		gC.find('select[name="form-frequency_unit"]').val(freq[1]);
	}
}


/**
* remove group convert frequency
*
*/
md.removeGroupConvertfrequency = function(){
	$(this).closest('.delete-text').remove();
}


/**
* Genalate Filter Category.
*
* @param {json} category
*/
md.gen_filter_category = function(id,data, cache){
	var filter_category = document.getElementById(id); //element filter category

	//Add text and value for element option on filter.
	if(typeof data === undefined || data == null){return false}
	for (var i = 0; i< data.length; i++){
		var d = data[i]; //initial category data
		var option = document.createElement("option"); //create element option
		var txt_option = JH.GetJsonLangValue( d,"category_name",true); //oprion name
		var	val_option = JH.GetJsonValue( d,"id"); //option value

		if ( cache ){ md["DATA"]["category"][val_option] = d; }

		option.text = txt_option;
		option.value = val_option;
		filter_category.add(option);
	}
	//Display filter as multiselect
	$(filter_category).select2();
	return filter_category;
}



/**
* Genalate Filter Dataformat.
*
* @param {json} dataformat
*/
md.gen_input_dataformat = function(data){
	var filter_dataformat = document.getElementById("form-dataformat"); //element data format
	filter_dataformat.options.length = 0;
	if(typeof data === undefined || data == null){return false}
	for(i= 0; i< data.length; i++){
		var d = data[i]; //initial data format
		var option = document.createElement("option"); //create element option
		var txt_option = JH.GetJsonLangValue(d, "dataformat_name", true); //option name
		var	val_option = JH.GetJsonValue(d, "id"); //option value

		option.text = txt_option;
		option.value = val_option;
		filter_dataformat.add(option);
	}
}



/**
* Genalate Filter Subcategory.
*
* @param {json} subcategory
*/


md.gen_filter_subcategory = function(id , data){
	var filter_subcategory = document.getElementById(id); //element filter sub-category
	filter_subcategory.options.length = 0;
	//Add text and value for element option on filter.
	if(typeof data === undefined || data == null){return false}
	for (var i = 0; i< data.length; i++){
		var d = data[i]; //initial sub-category data
		var option = document.createElement("option"); //create element option
		var txt_option = JH.GetJsonLangValue(d , "subcategory_name", true); //option name
		var	val_option = JH.GetJsonValue(d,"id"); //option value
		var cat_id = JH.GetJsonValue(d,"category_id"); // id category

		option.text = txt_option;
		option.value = val_option;
		filter_subcategory.add(option);
	}
	return filter_subcategory;
}


/**
* Genalate input from for insert Aagency.
*
* @param {json} inputagency
*/
md.gen_filter_agency = function(id,data){
	input_agency = document.getElementById(id);
	if(typeof data === undefined || data == null){return false}
	for (var i = 0; i< data.length; i++){
		var d = data[i]; //initial agency data
		var option = document.createElement("option"); //create element option
		var txt_option = JH.GetJsonLangValue( d , "agency_name", true); //option name
		var	val_option = JH.GetJsonValue( d , "id"); //option value

		option.text = txt_option;
		option.value = val_option;
		input_agency.add(option);
	}
	return input_agency;
}

/**
* Genalate Filter Subcategory.
*
* @param {json} subcategory
*/


md.gen_filter_metadatastatus = function(id , data){
	var filter_metadatastatus = document.getElementById(id); //element filter sub-category
	filter_metadatastatus.options.length = 0;
	//Add text and value for element option on filter.
	if(typeof data === undefined || data == null){return false}
	for (var i = 0; i< data.length; i++){
		var d = data[i]; //initial sub-category data
		var option = document.createElement("option"); //create element option
		var txt_option = JH.GetJsonLangValue(d , "metadata_status_name", true); //option name
		var	val_option = JH.GetJsonValue(d,"id"); //option value
		var cat_id = JH.GetJsonValue(d,"metadata_status_id"); // id category

		option.text = txt_option;
		option.value = val_option;
		filter_metadatastatus.add(option);
	}
	return filter_metadatastatus;
}

/**
* Genalate input form insert Hydro.
*
* @param {string} id element id
* @param {json} data initial hydroninfo data
*/
md.gen_filter_hydro = function(id ,  data){
	var filter = document.getElementById(id); //element filter hudroinfo
	//Add text and value for element option on filter.
	if(typeof data === undefined || data == null){return false}
	for (var i = 0; i< data.length; i++){
		var d = data[i]; //hydroinfo data
		var option = document.createElement("option"); //create element option
		var txt_option = JH.GetJsonLangValue( d,"hydroinfo_name", true); //option name
		var	val_option = JH.GetJsonValue( d,"id"); //option value

		option.text = txt_option;
		option.value = val_option;
		filter.add(option);
	}
	$(filter).multiselect({includeSelectAllOption: true });
	$(filter).multiselect('rebuild');
	$(filter).multiselect('updateButtonText');
	return filter;
}


/**
* Generate input form insert data unit
*
* @param {json} dataunit intial dataunt data
*/
md.gen_input_dataunit = function(dataunit){
	var input_dataunit = document.getElementById("form-data_unit"); //elemnt input dataunit
	var data = apiService.getFieldValue(dataunit, "data"); //unit data

	if ( data == null ) {
		return
	}

	JH.Sort(data, "dataunit_name", false, JH.GetLangValue);
	for(var i=0; i< data.length; i++){
		var gen_option = document.createElement("option"); //create element option
		var text_option = JH.GetJsonLangValue(data[i], "dataunit_name", true); //option name
		var value_option = JH.GetJsonValue(data[i], "id"); //option value

		gen_option.text = text_option;
		gen_option.value = value_option;
		input_dataunit.add(gen_option);
	}
}


/**
* Generate input form insert data servicemethod
*
* @param {json} servicemethod intial servicemethod data
*/
md.gen_input_servicemethod = function(rs){
	var input_method = document.getElementById("form-service_method"); //element serevie method
	var data = apiService.getFieldValue(rs, "data"); //service method data

	if ( data == null ) {
		return
	}

	JH.Sort(data, "servicemethod_name", false, JH.GetLangValue);
	for(i=0; i< data.length; i++){
		var gen_option = document.createElement("option");
		var text_option = JH.GetJsonLangValue(data[i], "servicemethod_name", true);
		var value_option = JH.GetJsonValue(data[i], "id");

		gen_option.text = text_option;
		gen_option.value = value_option;
		input_method.add(gen_option);
	}
	$(input_method).multiselect({includeSelectAllOption:true});
	$(input_method).multiselect('rebuild');
	$(input_method).multiselect('updateButtonText');
}


/**
* Generate option list for method dropdown
*
* @param {json} servicemethod intial servicemethod data
*/
md.gen_input_method = function(rs){
	var select = document.getElementById("form-method"); //element select of method
	var data = apiService.getFieldValue(rs, "data"); //method data

	if ( data == null ) {
		return
	}

	JH.Sort(data, "metadata_method_name", false);
	for(i=0; i< data.length; i++){
		var gen_option = document.createElement("option"); //create element option
		var text_option = JH.GetJsonValue(data[i], "metadata_method_name"); //option name
		var value_option = JH.GetJsonValue(data[i], "id"); //option value

		gen_option.text = text_option;
		gen_option.value = value_option;
		select.add(gen_option);
	}
}


/**
* Generate option list for metadata status dropdown
*
* @param {json} servicemethod intial servicemethod data
*/
md.gen_input_status = function(rs){
	var select = document.getElementById("form-metadata_status"); //elment metadata status
	var data = apiService.getFieldValue(rs, "data"); //metadata status

	if ( data == null ) {
		return
	}

	JH.Sort(data, "metadata_status_name", false, JH.GetLangValue);
	for(i=0; i< data.length; i++){
		var gen_option = document.createElement("option"); //create element option
		var text_option = JH.GetJsonLangValue(data[i], "metadata_status_name", true); //option name
		var value_option = JH.GetJsonValue(data[i], "id"); //option value

		gen_option.text = text_option;
		gen_option.value = value_option;
		select.add(gen_option);
	}
}


/**
* Send value from filter and request to service when press preview button.
*/
md.btnPreviewClick = function(){
	var val_agency = {}; //id aegency
	var val_subcat = {}; //id subcate
	var isValid = true;
	param = {};

	val_agency = $('#filter_agency').val();
	is_agency = $('#filter_agency').closest('span').find('[name="select-all-name"]').is(':checked');
	val_hydro = $('#filter_hydro').val();
	is_hydro = $('#filter_hydro').closest('span').find('[name="select-all-name"]').is(':checked');
	val_subcat = $('#filter_subcategory').val();
	is_subcat = $('#filter_subcat').closest('span').find('[name="select-all-name"]').is(':checked');
	val_cat = $('#filter_category').val();
	val_metadatastatus = $('#filter_metadatastatus').val();
	is_metadatastatus = $('#filter_metadatastatus').closest('span').find('[name="select-all-name"]').is(':checked');

	param['agency_id'] = is_agency&&!val_agency ? [] : val_agency ? val_agency.map(Number) : [];
	param['hydroinfo_id'] = is_hydro&&!val_hydro ? [] : val_hydro ? val_hydro.map(Number) : [];
	param['subcategory_id'] = is_subcat&&!val_subcat ? [] : val_subcat ? val_subcat.map(Number) : [];
	param["category_id"] = val_cat == "all" ? '' : val_cat;
	param["metadatastatus_id"] = is_metadatastatus&&!val_metadatastatus ? [] : val_metadatastatus ? val_metadatastatus.map(Number) : [];
	apiService.SendRequest('GET', md.service_metadata + "_table", param, md.previewDataTables);
}


/**
* Push data from service on datable.
*
* @param {json} data
*/
md.previewDataTables = function(data){
	md.dataTable.clear()
	if(JH.GetJsonValue(data,"data")){
		md.dataTable.rows.add(JH.GetJsonValue(data,"data"));
	}
	md.dataTable.draw()
}


/**
* Eneble form
*
*/
md.enableForm = function(){
	$("#form input").prop('disabled', false);
	$("#form textarea").prop('disabled', false);
	$("#form select").prop('disabled', false);
	$('#form select[multiple=multiple] option').prop('disabled', false);
	$('#form select[multiple=multiple]').multiselect('rebuild');
	$('#form .icon-add').show();
	$('#form-save-btn').show();
}


/**
* Disbled form
*
*/
md.disableForm = function(){
	$("#form input").prop('disabled', true);
	$("#form textarea").prop('disabled', true);
	$("#form select:not(#language-form)").prop('disabled', true);
	$('#form select[multiple=multiple] option').prop('disabled', true);
	$('#form select[multiple=multiple]').multiselect('rebuild');
	$('#form-save-btn').hide();
	$('#form .icon-add').hide();
	$('#form .history_log').hide();
}


/**
* Open form
*
*/
md.openForm = function(data){
	$('.box-header h3').text(TRANS["add_metadata"]);

	$('#form').show()
	$('.data-filters').hide()
	$('#div_preview').hide()

	document.getElementById('form').reset();
	$('#form-id').val( '' );
	$('#form').parsley().reset();
	$('#form select').trigger('change');
	$('#form .metadata-th').show()
	$('#form .metadata-en').hide()
	$('#form .metadata-jp').hide()
	$('#form .history_log').hide();
	$('#form .delete-text').remove();
	$('#form .clearfix').remove();
	$('#history_detail').hide();
	$("#form-tblHistory tbody").empty()

	$('#form-hydro').val('').multiselect('rebuild').multiselect('updateButtonText');
	$('#form-service_method').val('').multiselect('rebuild').multiselect('updateButtonText');
	if ( data ){
		$('#form .history_log').show();
		$('#history_detail').show();
		var d = data[0];
		var arrHydro = []; //id hydroinfo
		//var hydroinfo = JH.GetJsonValue(d, "hydroinfo");
		var hydroinfo = apiService.getFieldValue(d, "hydroinfo")
		if(hydroinfo){
			for (var i = 0 ; i < hydroinfo.length ; i++){
				arrHydro.push( JH.GetJsonValue(hydroinfo[i], "id") );
			}
		}

		var frequency = apiService.getFieldValue(d, "frequency"); //frequency data
		var arrServicemethod = []; // initial Servicemethod data
		var servicemethod = apiService.getFieldValue(d, "servicemethod"); //servicemethod data

		if(servicemethod){
			for (var i = 0 ; i < servicemethod.length ; i++){
				arrServicemethod.push( JH.GetJsonValue(servicemethod[i], "id") );
			}
		}

		$('#form-id').val( JH.GetJsonValue(d , "metadata_id" ));
		$('#form-agency').val( JH.GetJsonValue(d , "agency_id" )).trigger('change');
		$('#form-category').val( JH.GetJsonValue(d, "category_id") ).trigger('change');
		$('#form-subcategory').val( JH.GetJsonValue(d, "subcategory_id") ).trigger("change");
		$('#form-hydro').val(arrHydro).multiselect("refresh");
		$('#form-agency_name').val( JH.GetJsonValue(d, "metadataagency_name.th") );
		$('#form-agency_name-en').val( JH.GetJsonValue(d, "metadataagency_name.en") );
		$('#form-agency_name-jp').val( JH.GetJsonValue(d, "metadataagency_name.jp") );
		$('#form-service_name').val( JH.GetJsonValue(d, "metadataservice_name.th") );
		$('#form-service_name-en').val( JH.GetJsonValue(d, "metadataservice_name.en") );
		$('#form-service_name-jp').val( JH.GetJsonValue(d, "metadataservice_name.jp") );

		$('#form-description').val( JH.GetJsonValue(d, "metadata_description.th") );
		$('#form-description-en').val( JH.GetJsonValue(d, "metadata_description.en") );
		$('#form-description-jp').val( JH.GetJsonValue(d, "metadata_description.jp") );

		$('#form-agency_store_date').val( JH.GetJsonValue(d, "metadata_agencystoredate") );
		$('#form-start_data_date').val( JH.GetJsonValue(d, "metadata_startdatadate") );
		$('#form-metadata_receive_date').val( JH.GetJsonValue(d, "metadata_receive_date") );

		$('#form-contact').val( JH.GetJsonValue(d, "metadata_contact") );

		$('#form-tag').val( JH.GetJsonValue(d, "metadata_tag.th") );
		$('#form-tag-en').val( JH.GetJsonValue(d, "metadata_tag.en") );
		$('#form-tag-jp').val( JH.GetJsonValue(d, "metadata_tag.jp") );

		$('#form input:radio[name=connection_format]').val([ JH.GetJsonValue(d,"connection_format")]);

		$('#form-channel').val( JH.GetJsonValue(d, "metadata_channel") );

		$('#form-data_unit').val( JH.GetJsonValue(d, "dataunit_id") );
		if(frequency){
			for (var i = 0 ; i < frequency.length ; i++){
				if (i != 0){ md.addGroupfrequency(frequency[i]); }
				else {
					var freq = JH.GetJsonValue(frequency[0], "datafrequency").split(" "); //frequency data
					$('#form-frequency').val(freq[0]);
					$('#form-frequency_unit').val(freq[1]);
				}
			}
		}
		$('#form-metadata_status').val( JH.GetJsonValue(d, "metadata_status_id") );
		$('#form-method').val( JH.GetJsonValue(d, "metadata_method_id") ).trigger('change');
		$('#form-dataformat').val( JH.GetJsonValue(d, "dataformat_id") );
		var mcf = JH.GetJsonValue(d, "metadata_convertfrequency").split(" "); //metadata convert frequency data
		$('#form-convertfrequency').val( mcf[0] );
		$('#form-convertfrequency_unit option').filter(function () { return $(this).html() == mcf[1]; }).prop('selected', true);

		$('#form-service_method').val(arrServicemethod).multiselect("refresh");

		$('#form-update_plan').val( JH.GetJsonValue(d, "metadata_update_plan") );
		$('#form-law').val( JH.GetJsonValue(d,"metadata_laws") );
		$('#form-remark').val( JH.GetJsonValue(d,"metadata_remark") );

		var history = apiService.getFieldValue(d, "history"); //history to edit metadata

		if(history){
			for (var i = 0 ; i < history.length ; i++){
				var h = history[i];
				var tr = "<tr>";
				tr += "<td>" + JH.GetJsonValue(h, "history_datetime")+ "</td>";
				tr += "<td>" + JH.GetJsonValue(h, "created_by")+ "</td>";
				tr += "<td>" + JH.GetJsonValue(h, "history_description")+ "</td>";
				tr += "</tr>";
				$('#form-tblHistory').append(tr);
			}
		}
	}
}


/**
* Close form
*
*/
md.closeForm = function(){
	$('.box-header h3').text(TRANS["metadata"]);

	$('#form').hide()
	$('.data-filters').show()
	$('#div_preview').show()
}


/**
* Event on click Add data.
*
*/
md.addMetadata = function(){
	md.openForm();
	md.enableForm();
}


/**
* Just Display metadata detail
*
*/
md.viewMetadata = function(){
	md.showMetadata(md.dataTable.row( $(this).closest('tr') ).data() , false);
}


/**
* Edit metadata data
*
*/
md.editMetadata = function() {
	md.showMetadata(md.dataTable.row( $(this).closest('tr') ).data() , true);
}


/**
* show metadata data to edit
*
* @param {string} row row number
* @param {boolean} isEdit ckeck edit or add
*/
md.showMetadata = function(row , isEdit){
	var param = { metadata_id: JH.GetJsonValue(row, "metadata_id") }; //parameter to get metadata

	apiService.SendRequest('GET', md.service_metadata, param, function(rs){
		md.openForm(JH.GetJsonValue(rs, "data"));
		if ( isEdit ) { md.enableForm(); }
		else { md.disableForm(); }
	});
}


/**
* Display confirm and delete data on table.
*
* @param {json} e
*/
md.deleteMatadata = function(e) {
	var data = md.dataTable.row( $(this).closest('tr') ).data(); // metadata data from display on table
	var param = { metadata_id : JH.GetJsonValue(data, "metadata_id") }; //parameter to delete metadata
	var metadta = JH.GetJsonLangValue(data, 'metadataservice_name',true); // metadata name
	var msg = md.translator['msg_delete_con'].replace('%s',metadta); // messageg to confirm selete metadata

	bootbox.confirm({
		message: msg,
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' +  md.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  md.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function (result) {
			if(result){
				apiService.SendRequest("DELETE", md.service_metadata, param, function(data, status, jqxhr){
					bootbox.alert({
						message: md.translator["msg_delete_suc"],
						buttons: {
							ok: {
								label: md.translator['btn_close']
							}
						}
					})
					md.closeForm();
					md.btnPreviewClick();
				})
				return true
			}
		}
	});
}


/**
* Get value from form Add or Edit and assign on vaiable to send to
* service for insert or update data..
*
*/
md.saveMetadata = function(){
	$('#form').parsley().validate();

	if ( !$('#form').parsley().isValid() ){
		return false;
	}

	var metadata_convertfrequency_limit = 1440, metadata_convertfrequency_minute = 1; //metadata convertfrequency limit
	var method = "POST"; // method
	var success_msg = md.translator['msg_save_suc']; //message save success
	var id = $('#form-id').val(); //id metadata
	var arrFrequency = []; //frequency data

	$('#form input[name=form-frequency]').each(function(i,e){
		arrFrequency.push(
			$(e).val() + " " + $('#form select[name=form-frequency_unit]').eq(i).val()
		);
	})
	/* Set value for variable param */
	var connection_format = $('input[name=connection_format]:checked').val();
	var metadata_convertfrequency = $('#form-convertfrequency').val() * $('#form-convertfrequency_unit').val()
	if ( connection_format == "Online" && metadata_convertfrequency > metadata_convertfrequency_limit){
		bootbox.alert({
			message: TRANS["msg_convertfrequency_limit"],
			buttons: {
				ok: {
					label: md.translator['btn_close']
				}
			}
		})
		return false;
	}
	var param = {
		agency_id: parseInt( $('#form-agency').val() ),
		subcategory_id: parseInt( $('#form-subcategory').val() ),
		hydroinfo: $('#form-hydro').val().map(Number),
		metadataagency_name: {
			th: $('#form-agency_name').val(),
			en: $('#form-agency_name-en').val(),
			jp: $('#form-agency_name-jp').val(),
		},
		metadataservice_name: {
			th: $('#form-service_name').val(),
			en: $('#form-service_name-en').val(),
			jp: $('#form-service_name-jp').val(),
		},
		metadata_description: {
			th: $('#form-description').val(),
			en: $('#form-description-en').val(),
			jp: $('#form-description-jp').val(),
		},
		metadata_agencystoredate: $('#form-agency_store_date').val(),
		metadata_startdatadate: $('#form-start_data_date').val(),
		metadata_receive_date: $('#form-metadata_receive_date').val(),

		metadata_contact: $('#form-contact').val(),
		metadata_tag: {
			th: $('#form-tag').val(),
			en: $('#form-tag-en').val(),
			jp: $('#form-tag-jp').val(),
		},
		connection_format: connection_format,
		dataunit_id: parseInt( $('#form-data_unit').val() ),
		frequency: arrFrequency,
		metadata_status_id: parseInt( $('#form-metadata_status').val() ),
		dataformat_id: parseInt( $('#form-dataformat').val() ),
		metadata_convertfrequency: $('#form-convertfrequency').val() + " " + $('#form-convertfrequency_unit option:selected').text(),
		import_count: connection_format == "Online" ?
		metadata_convertfrequency_limit / ( parseFloat($('#form-convertfrequency_unit').val()) * parseFloat($('#form-convertfrequency').val()) ) :
		metadata_convertfrequency_minute,
		servicemethod: $('#form-service_method').val() ? $('#form-service_method').val().map(Number) : [],
		metadata_update_plan: $('#form-update_plan').val() ? parseInt( $('#form-update_plan').val() ) : 0,
		metadata_laws: $('#form-law').val(),
		metadata_remark: $('#form-remark').val(),
		history_description: $('#form-history').val()
	};
	if (id != ""){
		method ="PUT";
		param["metadata_id"] = id;
		success_msg = md.translator['msg_edit_suc'];
	}

	/* Sending data to service*/
	apiService.SendRequest(method , md.service_metadata , param , function(rs){
		console.log("RS:",rs);
		if(rs.result == 'OK'){
			bootbox.alert({
				message: success_msg,
				buttons: {
					ok: {
						label: md.translator['btn_close']
					}
				}
			})
		}else{
				var unsuccess_msg = md.translator['msg_edit_unsuc'];
				bootbox.alert({
					message: unsuccess_msg,
					buttons: {
						ok: {
							label: md.translator['btn_close']
						}
					}
				})
		}

		md.closeForm();
		md.btnPreviewClick();
	});
	return true
}


/**
* Get value from form Add or Edit and assign on vaiable to send to
* service for insert or update data..
*
* @param {int} time time
*/
var convertTime = function(time){
	var FrequencyUnit = JH.Get("FrequencyUnit_sort"); //initial Frequency Unit data

	if ( !FrequencyUnit ) {
		FrequencyUnit = JH.Get("FrequencyUnit").slice();
		JH.Sort(FrequencyUnit, "convert_minute", true);
		JH.Set("FrequencyUnit_sort", FrequencyUnit);
	}
	var o = {};
	if(typeof FrequencyUnit === undefined || FrequencyUnit == null){return false}
	for (var i = 0 ; i < FrequencyUnit.length ; i ++){
		var d = FrequencyUnit[i]; //Frequency Unit data
		var convert_minute = JH.GetJsonValue(d, "convert_minute"); //convert minute

		if ( time % convert_minute == 0){
			o = { time: (time/convert_minute), unit:d };
			return o;
		}
	}
	return o;
}



/**
* Render data to push on colum Metadata
*
* @param {string} row data on each table
* @return {string} text
*/
var renderColumnMetadata = function(row) {
	var text = JH.GetJsonLangValue(row, "metadataservice_name",true); //metadataservice name

	if (text){
		text = '<a class="openModal" href="javascript:void(0)" >' + text + '</a>';
	}
	return text;
}



/**
* Render data to push on colum Category
*
* @param {string} row data on each table
* @return {string} text
*/
var renderColumnCategory = function(row) {
	return JH.GetJsonLangValue(row , "subcategory.category.category_name",true);
}



/**
* Render data to push on colum SubCategory
*
* @param {string} row data on each table
* @return {string} text
*/
var renderColumnSubCategory = function(row) {
	return JH.GetJsonLangValue(row , "subcategory.subcategory_name",true);
}



/**
* Render data to push on colum Department
*
* @param {string} row data on each table
* @return {string} text
*/
var renderColumnAgency = function(row) {
	return JH.GetJsonLangValue(row, "agency.agency_name",true);
}



/**
* Render data to push on colum metadata status
*
* @param {string} row
* @return {string} text
*/
var renderColumnMetadataStatus = function(row){
	return JH.GetJsonLangValue(row, "metadata_status",true);
}
