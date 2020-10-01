/**
*
*   srvShop Object for handler data_service page
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvShop = {};

/**
*   Initial srvShop
*   @param {object} trans - translate object from laravel
*/
srvShop.init = function(trans){
    srvShop.translator = trans;
    srvShop.cart = [];
    srvShop.service = "thaiwater30/data_service/data_service";
	srvShop.service_onload = "thaiwater30/data_service/onload";
	srvShop.test_load = "thaiwater30/backoffice/event_management/subevent_load"; //ทดสอบ
    srvShop.agency = [];
    srvShop.agency_obj = [];
    srvShop.hasProvince = false;
    srvShop.hasBasin = false;

    srvShop.item = {};
    srvShop.province = {};
    srvShop.basin = {};
    srvShop.table = $('#table');
    srvShop.dataTable = srvShop.table.DataTable({
        dom : 'frtlip',
        language : g_dataTablesTranslator,
        columns : [ {
            data : srvShop.renderMetadataserviceName,
        }, {
            data : srvShop.renderMetadataDescription,
        }, {
            data : srvShop.renderSubcategoryName,
        }, {
            data : srvShop.renderAgencyName,
        }, {
            data : srvShop.renderFrequency,
        },{
            data : srvShop.renderTableButton,
            orderable : false,
            searchable : false,
        } ],
        order: []
    });
    srvShop.cartTable = $('#cart-table');
    srvShop.dataCartTable = srvShop.cartTable.DataTable({
        dom : 'rtlip',
        language : g_dataTablesTranslator,
        columns : [ {
            data : srvShop.renderTableCount
        },{
            data : srvShop.renderMetadataserviceName,
        },{
            data : 'frequency_text',
        },{
            data : srvShop.renderAgencyName,
        },{
            data : srvShop.renderCartTableOutput,
        },{
            data : srvShop.renderCartFromDateToDate,
        },{
            data : srvShop.renderCartProvince,
        },{
            data : srvShop.renderCartBasin,
        },{
            data : srvShop.renderCartTableButton,
            orderable : false,
            searchable : false,
        } ],
        order: [],
        sort : false,
    });

    $('#form_basin , #form_province').multiselect({
        enableFiltering: true,
        includeSelectAllOption: true,
        maxHeight: 250,
    });

    // แก้บัค modal ซ้อน modal
    $(document).on('hidden.bs.modal', '.modal', function () {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
    });

    srvShop.table.on('click','i.btn.btn-data_service-cart' , srvShop.showChooseData);
    srvShop.table.on('click','i.btn.fa.fa-file-code-o' , srvShop.showJson);
    srvShop.cartTable.on('click','i.btn.btn-data_service-remove' , srvShop.removeCartItem);
    srvShop.cartTable.on('click','i.btn.btn-data_service-edit' , srvShop.editCartItem);
    $('#data_service-cart').on('click', srvShop.showCart);
    $('input[name="data_type[]"]').on('change' , srvShop.dataTypeChange);
    // radio service change
    $('#form').on('change' , 'input[name="service_id[]"]' , srvShop.formCdDvdChange);
    // radio provinc,basin change
    $('#form-group-pb').on('change' , 'input[name="control_pb[]"]' , srvShop.controlPbOnChange);
    // radio forexternal change
    $('#form-forexternal').on('change', srvShop.forexternalChange);

    $('#form_detail_fromdate').on('hide' , srvShop.dateStartHide);
    $('#form_detail_todate').on('hide' , srvShop.dateEndHide);
    // enable, disable btn save cart
    $('#modal-cart').on('hidden.bs.modal', function () {
        $('#modal-cart-save-btn').off('click');
    })
    .on('shown.bs.modal', function() {
        $('#modal-cart-save-btn').on('click' , srvShop.saveCart);
    });
    // enable, disable btn save item
    $('#modal-addcart').on('hidden.bs.modal', function () {
        $('#modal-save-btn').off('click');
    })
    .on('shown.bs.modal', function() {
        $('#modal-save-btn').on('click' , srvShop.animation);
    });

    $(".select2").select2({ closeOnSelect: false });
    $("#btn_display").on('click' , srvShop.btnDisplayClick );
	apiService.SendRequest('GET', srvShop.service_onload, {}, srvShop.handlerSrvTable);
    // apiService.SendRequest('GET', srvShop.test_load, {}, srvShop.test);
    
}

// render table row
/**
*   render count
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {int} row number
*/
srvShop.renderTableCount = function(row , type , set ,meta){
    return meta.row + 1;
}

/**
*   render metadata service name
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} metadata service name
*/
srvShop.renderMetadataserviceName = function(row, type, set, meta){
    return JH.GetJsonLangValue(row , "metadataservice_name",true);
}

/**
*   render metadata description
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} metadata description
*/
srvShop.renderMetadataDescription = function(row, type, set, meta){
    srvShop.item[row.id] = row;
    var value = JH.GetJsonValue(row , "agency.id");
    var text = JH.GetJsonLangValue(row , "agency.agency_name",true);
    if ($.inArray(value, srvShop.agency) == -1){
        srvShop.agency.push(value);
        srvShop.agency_obj.push({"value": value, "text": text});
    }
    return JH.GetJsonLangValue(row , "metadata_description",true);
}

/**
*   render subcategory name
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} subcategory name
*/
srvShop.renderSubcategoryName = function(row, type, set, meta){
    if (row["subcategory"]){
        return JH.GetJsonLangValue(row["subcategory"] , "subcategory_name",true);
    }
    return "";
}

/**
*   render category name
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} category name
*/
srvShop.renderAgencyName = function(row, type, set, meta){
    return JH.GetJsonLangValue(row , "agency.agency_name",true);
}

/**
*   render frequency
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} frequency
*/
srvShop.renderFrequency = function(row, type, set, meta){
    var fre = JH.GetJsonValue(row , "frequency");
    var text = "";
    for (var i = 0 ; i < fre.length ; i++){
        if ( i != 0 ) { text += " , "; }
        text += JH.GetJsonValue(fre[i] , "datafrequency");
    }
    return text;
}

/**
*   render button cart
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} button cart
*/
srvShop.renderTableButton = function(row, type, set, meta){
    var str = '<div class="form-inline"><i class="btn btn-data_service-cart m-1" aria-hidden="true" data-item="'+row.id+'"></i>' +
	'<i class="btn fa fa-file-code-o m-1" title="view json" aria-hidden="true" data-item="'+row.id+'"></i></div>';
    return str;
}

/**
*   render output type( service type )
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} output type
*/
srvShop.renderCartTableOutput = function(row, type, set, meta){
    return JH.GetJsonValue(row, "service_text");
}

/**
*   render province name
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} province name
*/
srvShop.renderCartProvince = function(row, type, set, meta){
    if ( jQuery.isEmptyObject( srvShop["province"] ) || jQuery.isEmptyObject( row["detail_province"] ) ) {return "";}
    var detail_province = row["detail_province"];
    var provinces = detail_province.split(",");
    var text = "";
    for (var i = 0 ; i < provinces.length ; i++){
        if (i != 0) { text += ","; }
        text += "<label>"+srvShop["province"][provinces[i]]+"</label>";
    }
    return text;
}

/**
*   render basin name
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} basin name
*/
srvShop.renderCartBasin = function(row, type, set, meta){
    if ( jQuery.isEmptyObject( srvShop["basin"] ) || jQuery.isEmptyObject( row["detail_basin"] ) ) {return "";}
    var detail_basin = row["detail_basin"];
    var basins = detail_basin.split(",");
    var text = "";
    for (var i = 0 ; i < basins.length ; i++){
        if (i != 0) { text += ","; }
        text += "<label>"+srvShop["basin"][basins[i]]+"</label>";
    }
    return text;
}

/**
*   render date range
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} date range
*/
srvShop.renderCartFromDateToDate = function(row, type, set, meta){
    toDate = JH.GetJsonValue(row, "detail_todate");
    formDate = JH.GetJsonValue(row, "detail_fromdate");
    if (toDate && formDate){
        return formDate + " - " + toDate;
    }
    return "";
}

/**
*   render delete button
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} delete button
*/
srvShop.renderCartTableButton = function(row, type, set, meta){
    var str = '<i class="btn btn-data_service-edit" title="'+srvShop.translator["edit_data"]+'" data-id="'+meta.row+'" aria-hidden="true" ></i>';
    str += '<i class="btn btn-data_service-remove" title="'+srvShop.translator["edit_data"]+'" data-id="'+meta.row+'" aria-hidden="true" ></i>';
    return str;
}

/**
*   event on datatype change
*/
srvShop.dataTypeChange = function(){
    if ( $(this).is(':checked') ){
        $('input[name="data_type[]"]').prop('checked', false).trigger('change');
        $(this).prop('checked', true);
    }
}

/**
*   event on cd_dvd change
*   endable , disabled parsley
*/
srvShop.formCdDvdChange = function(){
    if ( $(this).val() == 2 || $(this).val() == 3 ){
        $('#form_div_data_date').show();
        $('#form_detail_todate').attr('data-parsley-required','');
        $('#form_detail_fromdate').attr('data-parsley-required','');
    }else{
        $('#form_div_data_date').hide();
        $('#form_detail_todate').removeAttr('data-parsley-required');
        $('#form_detail_fromdate').removeAttr('data-parsley-required');
    }
}

/**
*   event on form_detail_fromdate hide
*   set startdate of form_detail_fromdate
*/
srvShop.dateStartHide = function(){
    var form_dateend = $('#form_detail_todate');
    if ($(this).val() == ""){
        form_dateend.datepicker('setStartDate', srvShop.showItem.time_start);
        return false;
    }
    form_dateend.datepicker('setStartDate', $(this).val());
    if (form_dateend.val() == '' || !(form_dateend.datepicker('getDate') >= $(this).datepicker('getDate')) ){
        form_dateend.datepicker('setDate' , $(this).val());
        form_dateend.datepicker('update');
        form_dateend.datepicker('show');
    }
}

/**
*   event on form_detail_fromdate hide
*   set enddate of form_detail_fromdate
*/
srvShop.dateEndHide = function(){
    var form_datestart = $('#form_detail_fromdate');
    if ($(this).val() == ""){
        return false;
    }
    form_datestart.datepicker('setEndDate', $(this).val());
    if (form_datestart.val() == ''){
        form_datestart.datepicker('show');
    }
}

/**
 * display json data of on modal
 *
 */
srvShop.showJson = function () {
    var item = srvShop.dataTable.row($(this).closest('tr')).data();
    var form = $('#formatDatajson-form'); //element form for display script is json format
    form.find('#formatDatajson-textarea').val(JSON.stringify(item, null, "\t"));
    $('#modal-format').modal({
        backdrop: 'static'
    })
}


/**
*   show choose data
*/
srvShop.showChooseData = function(){
    $('#form')[0].reset();
    $('#form_cddvd').trigger('change');

    var item = srvShop.dataTable.row($(this).closest('tr')).data();
    var id = JH.GetJsonValue(item, "id");
    srvShop.showItem = item;
    $('#form_metadata_id').val(id);
    $('#form_data_id').val("");
    $('#form_data_name').text(srvShop.renderMetadataserviceName(item));

    apiService.GetCachedRequest(srvShop.service , {id : parseInt(id)} , function(rs){
        if (rs.result == "OK"){
            $('#modal-addcart').modal();
            srvShop.handlerShowChooseData(rs);
        }

    });

    $('#form').find('*[data-parsley]').each(function(){
        $(this).parsley().reset();
    });
}

/**
*   handler on show choose data
*/
srvShop.handlerShowChooseData = function(rs){
    srvShop.showChooseData_genDate(rs.data[0]);
    srvShop.showChooseData_genFrequency(rs.data[0]);
    srvShop.showChooseData_genServiceMethod(rs.data[0]);
    srvShop.showChooseData_genProvince(rs.data[0]);
    srvShop.showChooseData_genBasin(rs.data[0]);
    srvShop.showChooseData_handlerPB();
}

/**
*   genarate วันที่เริ่มต้น - สิ้นสุด
*   @param {object} rs - result จาก service
*/
srvShop.showChooseData_genDate = function(rs){
    var fromdate = JH.GetJsonValue(rs,"fromdate");
    var todate = JH.GetJsonValue(rs,"todate");
    $('#form_detail_todate,#form_detail_fromdate').datepicker('destroy');
    if (fromdate != "" || todate != ""){
        $('#form_data_duration').text(srvShop.translator["detail_fromdate"] +" "+ fromdate + " "+ srvShop.translator["detail_todate"] + " "+ todate);
        // จำกัดวันที่เลือกได้
        $('#form_detail_todate').datepicker({
            startDate: fromdate,
            endDate: todate,
        });
        $('#form_detail_fromdate').datepicker({
            startDate: fromdate,
            endDate: todate,
        });
    }else{
        $('#form_data_duration').text("-");
        $('#form_detail_todate').datepicker({
            startDate: null,
            endDate: null,
        });
        $('#form_detail_fromdate').datepicker({
            startDate: null,
            endDate: null,
        });
    }
}

/**
*   genarate frequency
*   @param {object} rs - result จาก service
*/
srvShop.showChooseData_genFrequency = function(rs){
    var form_div_data_frequency = "";
    var freq = JH.GetJsonValue(rs , "frequency");
    for( var i = 0 ; i < freq.length; i++){
        var d = freq[i];
        form_div_data_frequency += '<div class="checkbox"><label style="width: max-content;"><input class="m-1" name="frequency[]"';
        if ( i == 0 ) { form_div_data_frequency += ' checked '; }// default check อันแรก
        form_div_data_frequency += ' type="checkbox" value="'+d.id+'" text="'+JH.GetJsonValue(d , "datafrequency")+'" data-parsley-multiple="frequency">'+
        JH.GetJsonValue(d , "datafrequency")+ '</label></div>';
    }
    $('#form_div_data_frequency').html(form_div_data_frequency);
}

/**
*   genarate servicemethod
*   @param {object} rs - result จาก service
*/
srvShop.showChooseData_genServiceMethod = function(rs){
    var form_div_data_service = "";
    var servicemethod = JH.GetJsonValue(rs,"servicemethod");
    for( var i = 0 ; i < servicemethod.length; i++){
        var d = servicemethod[i];
        form_div_data_service += '<div class="radio"><label style="width:max-content">'+
        '<input class="m-1" name="service_id[]" type="radio" value="'+d.id+'" text="'+JH.GetJsonLangValue(d , "servicemethod_name",true)+'" data-parsley-multiple="service_id">'+
        JH.GetJsonLangValue(d,"servicemethod_name",true)+ '</label></div>';
    }
    $('#form_div_data_service').html(form_div_data_service);
    $('#form_div_data_date').hide();
}

/**
*   genarate select province
*   @param {object} rs - result จาก service
*/
srvShop.showChooseData_genProvince = function(rs){
    var fg_province = $('#form-group-province');
    var f_province = $('#form_province');
    var lang = srvShop.translator["LANGUAGE"];
    var provin = JH.GetJsonValue(rs, "province");
    if ( !provin ){
        srvShop.hasProvince = false;
        fg_province.hide();
        f_province.removeAttr('data-parsley-required')
        return false;
    }
    f_province.empty();
    f_province.attr('data-parsley-required' , '');
    for (var i = 0 ; i < provin.length ; i++){
        var p = provin[i];
        f_province.append($('<option>', {value: p["province_code"],text: JH.GetJsonLangValue(p, "province_name", true) }));
        srvShop["province"][p["province_code"]] = JH.GetJsonLangValue(p, "province_name", true);
    }
    f_province.multiselect('rebuild');
    fg_province.show();
    srvShop.hasProvince = true;
}

/**
*   genarate select basin
*   @param {object} rs - result จาก service
*/
srvShop.showChooseData_genBasin = function(rs){
    var fg_basin = $('#form-group-basin');
    var f_basin = $('#form_basin');
    var lang = srvShop.translator["LANGUAGE"];
    var basin = JH.GetJsonValue(rs, "basin");
    if ( !basin ){
        srvShop.hasBasin = false;
        fg_basin.hide();
        f_basin.removeAttr('data-parsley-required');
        return false;
    }
    f_basin.empty();
    f_basin.attr('data-parsley-required' , '');
    for (var i = 0 ; i < basin.length ; i++){
        var b = basin[i];
        f_basin.append($('<option>', {value: b["basin_code"],text: JH.GetJsonLangValue(b, "basin_name", true) }));
        srvShop["basin"][b["basin_code"]] = JH.GetJsonLangValue(b, "basin_name", true);
    }
    f_basin.multiselect('rebuild');
    fg_basin.show();
    srvShop.hasBasin = true;
}

/**
*   handler province basin after genarate
*/
srvShop.showChooseData_handlerPB = function(){
    if ( srvShop.hasProvince && srvShop.hasBasin ){
        $('#form-group-pb').show();
        $('#form_pb').attr('data-parsley-required' , '');
        srvShop.controlPbOnChange();
    }else{
        $('#form-group-pb').hide();
    }
}

/**
*   event on control_pb change
*   show, hide select province or basin
*/
srvShop.controlPbOnChange = function(){
    $('#form-group-province').hide();
    $('#form_province').removeAttr('data-parsley-required');
    $('#form-group-basin').hide();
    $('#form_basin').removeAttr('data-parsley-required');
    var v = $('input[name="control_pb[]"]:checked').val();
    if (v == "p"){
        $('#form-group-province').show();
        $('#form_province').attr('data-parsley-required' , '');
    }else if (v == "b"){
        $('#form-group-basin').show();
        $('#form_basin').attr('data-parsley-required' , '');
    }
}

/**
*   event on forexternal change
*   show, hide select user
*/
srvShop.forexternalChange = function(){
    if ( $('#form-forexternal').is(':checked') ){
        $('#form-group-user').hide();
    }else{
        $('#form-group-user').show();
    }
}

/**
*   validate choose data and animation add to cart
*/
srvShop.animation = function(){
    // check parsley valid
    var valid = true;
    $('#form').find('*[data-parsley]').each(function(){
        $(this).parsley().validate();
        if (! $(this).parsley().isValid() ){
            valid = false;
        }
    });
    if (!valid){
        return false;
    }
    $('#modal-save-btn').button('loading');
    apiService.SendRequest("GET" , srvShop.service+"_check" , srvShop.genCurrentData() , function(rs){
        $('#modal-save-btn').button('reset');
        if ( JH.GetJsonValue(rs , "result") == "OK"){
            srvShop.add2Cart(); // save select item to cart
            var md = $('#modal-save-btn').closest('.modal');
            var cloneMd = md.clone(); // clone เอามาทำ animate
            md.removeClass('fade').modal('hide');
            $('body').append(cloneMd);
            var cmdOffset = cloneMd.find('.modal-dialog').offset();
            var data_serviceCart = $('#data_service-cart');
            var r = data_serviceCart.position().left * 0.87;
            var t = data_serviceCart.position().top + 18;
            var mc = cloneMd.find('.modal-content');
            var mcHeight = mc.height() , mcWidth = mc.width();
            mc.css({position: 'absolute' , height: mcHeight+"px" , width: cloneMd.find('.modal-dialog').width()+"px"});
            mc.animate({top:  t+"px" , left: r+"px" , width: 0 , height: 0} , 800 , function(){
                $(this).remove();
                cloneMd.remove();
                $('#label-data_service-cart').text(srvShop.cart.length);
                md.addClass('fade');
            });// animate
        } else {
            bootbox.alert( JH.GetJsonLangValue(rs , "data") );
        }
    }, function(jqXHR, textStatus, errorThrown) {
        apiService.cbServiceAjaxError(url, jqXHR, textStatus, errorThrown);
        $('#modal-save-btn').button('reset');
    });
}

/**
*   make choose data to object
*   @return object
*/
srvShop.genCurrentData = function(){
    var metadata_id = $('#form_metadata_id').val();
    var item = srvShop.item[metadata_id];
    $('#form_data_name').text(item.name);
    $('#form_data_frequency').text(item.frequency);
    var o = {
        metadata_id: parseInt( metadata_id ),
        service_id: parseInt( $('input[name="service_id[]"]:checked').val() ),
        service_text: $('input[name="service_id[]"]:checked').attr('text') ,

        detail_frequency: $('input[name="frequency[]"]:checked').map(function(){ return this.value; }).get().join(',') ,
        detail_todate: $('#form_detail_todate').val(),
        detail_fromdate: $('#form_detail_fromdate').val(),

        detail_province: $('#form_province').val() != null ? $('#form_province').val().toString() : "",
        detail_basin: $('#form_basin').val() != null ? $('#form_basin').val().toString() : "",
        detail_remark: $('#form_remark').val(),
        frequency_text: $('input[name="frequency[]"]:checked').map(function(){ return this.getAttribute('text'); }).get().join(',')
    };
    if ( o.service_id == 1 || o.service_id == 4){
        o.detail_todate = "";
        o.detail_fromdate = "";
    }
    var v = $('input[name="control_pb[]"]:checked').val();
    if (v == "p"){ o["detail_basin"] = ""; }
    else if (v == "b"){ o["detail_province"] = ""; }
    var o = $.extend({}, item, o);
    return o;
}

/**
*   add choose data to cart
*/
srvShop.add2Cart = function(){
    o = srvShop.genCurrentData();
    if ( $('#form_data_id').val() != ""){
        // มาจากการกด edit
        srvShop.cart[$('#form_data_id').val()] = o;
    }else{
        srvShop.cart.push(o);
    }

}

/**
*   event on btn display click
*/
srvShop.btnDisplayClick = function(){
    var agency_id = parseInt( $('#filter-agency').val() );
    apiService.SendRequest('GET', srvShop.service, {agency_id: agency_id}, srvShop.renderTable);
}

/**
*   handler service srvShop.service_onload
*   @param {object} rs - result from service
*/
srvShop.handlerSrvTable = function(rs){
    srvShop.renderFilterUser(JH.GetJsonValue(rs, "user"));
    srvShop.renderTable(JH.GetJsonValue(rs, "metadata"));
    srvShop.renderFilterAgency();
}

/**
*   genarate select user
*   @param {object} rs - result จาก service ในส่วนของ user
*/
srvShop.renderFilterUser = function(rs){
    var users = JH.GetJsonValue(rs, "data");
    JH.Sort(users, "full_name", false, function(str){
        return str.toLowerCase();
    });
    var filter = document.getElementById('form-user');
    for (var i = 0 ; i < users.length ; i++){
        var u = users[i];
        var option = document.createElement('option');
        var option_text = JH.GetJsonValue(u, "full_name");
        var option_val = JH.GetJsonValue(u, "id");
        option.text = option_text;
        option.value = option_val;
        filter.add(option);
    }
    $(filter).select2();
}

/**
*   render table
*   @param {object} rs - result จาก service ในส่วนของ data
*/
srvShop.renderTable = function(rs){
    srvShop.dataTable.clear()
    if (rs.result == "OK"){
        var data = JH.GetJsonValue(rs , "data");
        srvShop.dataTable.rows.add(data);
    }
    srvShop.dataTable.draw()
}

/**
*   generate select agency
*/
srvShop.renderFilterAgency = function(){
    var data = srvShop.agency_obj;
    var filter = $('#filter-agency');
    filter.empty();
    filter.append($('<option>', {value: 0, text: srvShop.translator["show_all"] } ));
    // เรียง agency ตาม ชื่อ
    JH.Sort(data, "text");
    for (var i = 0 ; i < data.length ; i ++){
        var d = data[i];
        filter.append($('<option>' , {value: d.value, text: d.text } ));
    }
}

/**
*   display cart
*/
srvShop.showCart = function(){
    srvShop.renderCartTable();
    $('#modal-cart').modal();
    $('#form-purpose').parsley().reset();
}

/**
*   render table in cart
*/
srvShop.renderCartTable = function(){
    srvShop.dataCartTable.clear();
    srvShop.dataCartTable.rows.add(srvShop.cart);
    srvShop.dataCartTable.draw();
}

/**
*   save cart
*/
srvShop.saveCart = function(){
    if (srvShop.cart.length == 0){
        bootbox.alert(srvShop.translator["no_data_request"]);
        return false;
    }

    $('#form-purpose').parsley().validate();
    if (! $('#form-purpose').parsley().isValid() ){
        return false;
    }

    var param = {
        order_purpose: $('#form-purpose').val(),
        order_forexternal: $('#form-forexternal').is(':checked'),
        order_quality: srvShop.cart.length,
        order_detail: srvShop.cart,
        user_id: 0,
    };

    // เช็คต้องเป็น cd/dvd เท่านั้น ถ้าเลือกเป็นสำหรับบุคคลภายนอก
    var _validOrder = [];
    if (param.order_forexternal){
        for (var i = 0 ; i < srvShop.cart.length ; i ++){
            var c = srvShop.cart[i];
            if (c.service_id != 3){
                _validOrder.push( i+1 );
            }
        }
        if ( _validOrder.length > 0){
            // เตือนว่ามีอันไหนบ้างที่ไม่เป็น cd dvd
            bootbox.alert(srvShop.translator["only_cd_dvd"] +"<br/>"+ srvShop.translator["sequence"] +" "+ _validOrder.toString());
            return false;
        }
    }else{
        param["user_id"] = parseInt( $('#form-user').val() );
    }
    console.info(param);
    $('#modal-cart-save-btn').button('loading');
    apiService.SendRequest("POST" , srvShop.service , param , function(rs){
        // reset cart, form
        $('#modal-cart-save-btn').button('reset');
        if (rs.result != "OK"){
            return false;
        }
        $('#form-cart')[0].reset();
        $('#form-forexternal').trigger('change');
        $('#modal-cart').modal('hide');
        bootbox.alert(srvShop.translator["send_request_success"]);
        srvShop.cart = [];
        $('#label-data_service-cart').text(srvShop.cart.length);
    }, function(jqXHR, textStatus, errorThrown) {
        apiService.cbServiceAjaxError(url, jqXHR, textStatus, errorThrown);
        $('#modal-cart-save-btn').button('reset');
    });
}

/**
*   remove item on cart
*/
srvShop.removeCartItem = function(){
    var id = $(this).attr('data-id');
    bootbox.confirm(srvShop.translator["remove_data_confirm"], function(result){
        if (result){
            srvShop.cart.splice(id, 1);
            $('#label-data_service-cart').text(srvShop.cart.length);
            srvShop.renderCartTable();
        }
    });
}
/**
*   show edit item on cart
*/
srvShop.editCartItem = function(){
    var data_id = $(this).attr('data-id');
    var o = srvShop.cart[data_id];
    var id = o.id;
    $('#form')[0].reset();
    $('#form_cddvd').trigger('change');

    srvShop.showItem = o;
    $('#form_metadata_id').val(id);
    $('#form_data_id').val(data_id);
    $('#form_data_name').text(srvShop.renderMetadataserviceName(o));

    apiService.GetCachedRequest(srvShop.service , {id : parseInt(id)} , function(rs){
        if (rs.result == "OK"){
            $('#modal-cart').modal('hide');
            $('#modal-addcart').modal();
            srvShop.handlerShowChooseData(rs);
            //  ใส่ data ที่เคยเลือกลงไปใน form
            $('#form_detail_todate').val(JH.GetJsonValue(o, "detail_todate"));
            $('#form_detail_fromdate').val(JH.GetJsonValue(o, "detail_fromdate"));
            $('input[name="frequency[]"][value='+JH.GetJsonValue(o, "detail_frequency")+']').prop('checked', true);
            $('input[name="service_id[]"][value='+JH.GetJsonValue(o, "service_id")+']').prop('checked', true).trigger('change');
            $('#form_remark').val(JH.GetJsonValue(o, "detail_remark"));
            if ( JH.GetJsonValue(o, "detail_province") != "" ){
                $('#form_province').multiselect('select', JH.GetJsonValue(o, "detail_province").split(","));
                $('input[name="control_pb[]"][value=p]').prop('checked', true).trigger('change');
            }
            if ( JH.GetJsonValue(o, "detail_basin") != "" ){
                $('#form_province').multiselect('select', JH.GetJsonValue(o, "detail_basin").split(","));
                $('input[name="control_pb[]"][value=b]').prop('checked', true).trigger('change');
            }

        }
    });

    $('#form').find('*[data-parsley]').each(function(){
        $(this).parsley().reset();
    });
}

