/**
*
*   srvDSA Object for handler data service approve page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvDSA = {};

/**
*   Initial srvDSA
*   @param {object} trans - translate object from laravel
*/
srvDSA.init = function(trans){
    srvDSA.translator = trans;
    srvDSA.service = "thaiwater30/backoffice/data_service/approve";

    // Data table
    srvDSA.table = $('#table').DataTable({
        dom : 'frltip',
        language : g_dataTablesTranslator,
        columns: [{
            data: 'order_header_id'
        },{
            data: srvDSA.renderLetterNo
        },{
            data: srvDSA.renderCategoryName
        },{
            data: srvDSA.renderMinistryName
        },{
            data: srvDSA.renderAgencyName
        },{
            data: srvDSA.renderDataserviceName
        },{
            data: srvDSA.renderDuration
        },{
            data: srvDSA.renderRadioButton
        }]
    });

    $('#btn-display').on('click' , srvDSA.btnDisplayClick);
    $('#btn-save').on('click' , srvDSA.btnSaveClick);

    srvDSA.loadPage();
}

/**
*   load data from service and render data
*/
srvDSA.loadPage = function(){
    apiService.SendRequest("GET" , srvDSA.service , {} ,  function(rs){
        srvDSA.agency = {};
        srvDSA.letter = {};
        srvDSA.data = [];
        if (rs.result == "OK"){
            var data = rs.data;
            srvDSA.data = data;
            if ( !!data ){
                for (var i = 0 ; i < data.length ; i++){
                    var d = data[i];
                    var agency_id = JH.GetJsonValue(d["agency"] , "id");
                    if (agency_id != ""){
                        srvDSA.agency[agency_id] = d["agency"];
                    }

                    var letterno = JH.GetJsonValue(d , "detail_letterno");
                    if (letterno != ""){
                        srvDSA.letter[letterno] = letterno;
                    }
                }
            }
        }
        srvDSA.renderTable();
        srvDSA.renderFilter();
    });
}

/**
*   render table
*/
srvDSA.renderTable = function(){
    srvDSA.table.clear();
    if ( srvDSA.data ){
        srvDSA.table.rows.add(srvDSA.data);
    }
    srvDSA.table.draw();
}

/**
*   render letterno
*   @param {object} row - The data for the whole row
*   @return {string} detail letterno
*/
srvDSA.renderLetterNo = function(row){
    return JH.GetJsonValue(row , "detail_letterno");
}

/**
*   render department name
*   @param {object} row - The data for the whole row
*   @return {string} department name
*/
srvDSA.renderCategoryName = function(row){
    return JH.GetJsonLangValue(row["category"] , "category_name",true);
}

/**
*   render ministry name
*   @param {object} row - The data for the whole row
*   @return {string} ministry name
*/
srvDSA.renderMinistryName = function(row){
    return JH.GetJsonLangValue(row["ministry"] , "ministry_name",true);
}

/**
*   render agency name
*   @param {object} row - The data for the whole row
*   @return {string} agency name
*/
srvDSA.renderAgencyName = function(row){
    return JH.GetJsonLangValue(row["agency"] , "agency_name",true);
}

/**
*   render dataservice name
*   @param {object} row - The data for the whole row
*   @return {string} dataservice name
*/
srvDSA.renderDataserviceName = function(row){
    return JH.GetJsonLangValue(row["metadata"] , "metadataservice_name",true)
}

/**
*   render duration
*   @param {object} row - The data for the whole row
*   @return {string} duration
*/
srvDSA.renderDuration = function(row){
    var formdate = JH.GetJsonValue(row , "detail_fromdate");
    var todate = JH.GetJsonValue(row , "detail_todate");
    if (formdate == "" || todate == ""){
        return "";
    }
    return srvDSA.translator["from_date"] + " " +formdate + "<br/>" + srvDSA.translator["to_date"] + " " +todate;
}

/**
*   render radio button
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} radio button
*/
srvDSA.renderRadioButton = function(row, type, set, meta){
    return '<input type="hidden" name="order" value="'+ JH.GetJsonValue(row, "id") +'">'+
    '<div class="radio"><label><input name="radio'+meta.row+'" value="AP" type="radio" checked>'+ srvDSA.translator["approve"] +'</div></label>'+
    '<div class="radio"><label><input name="radio'+meta.row+'" value="DA" type="radio">'+ srvDSA.translator["not_approve"] +'</div></label>';
}

/**
*   render filter
*/
srvDSA.renderFilter = function(){
    srvDSA.renderFilterAgency();
    srvDSA.renderFilterLetter();
}

/**
*   render filter agency
*/
srvDSA.renderFilterAgency = function(){
    var filter = $('#filter-agency');
    filter.empty();
    filter.append($('<option>', {value: 0, text: srvDSA.translator["show_all"] }));
    var agency = srvDSA.agency;
    for (var k in agency){
        var a = agency[k];
        var value = JH.GetJsonValue(a , "id");
        var text = JH.GetJsonLangValue(a , "agency_name",true);

        filter.append($('<option>', {value: value, text: text }));
    }
}

/**
*   render filter letter
*/
srvDSA.renderFilterLetter = function(){
    var filter = $('#filter-letter');
    filter.empty();
    filter.append($('<option>', {value: 0, text: srvDSA.translator["show_all"] }));
    var letter = srvDSA.letter;
    for (var k in letter){
        filter.append($('<option>', {value: k, text: k }));
    }
}

/**
*   Event on click btn-display
*   load data and render
*/
srvDSA.btnDisplayClick = function(){
    param = {agency_id: $('#filter-agency').val() , detail_letterno: $('#filter-letter').val() };
    apiService.SendRequest("GET" , srvDSA.service , param , function(rs){
        if(rs.result == "OK"){
            srvDSA.data = rs.data;
            srvDSA.renderTable();
        }
    });
}

/**
*   Event on click btn-save
*   save result
*/
srvDSA.btnSaveClick = function(){
    var param = [];
    $('#table > tbody > tr').each(function(i , e){
        var $e = $(e);
        var id = parseInt( $e.find('input[name=order]').val() );
        var detail_source_result = $e.find('input[type="radio"]:checked').val();
        if ( isNaN(id) || typeof detail_source_result === "undefined"){
            Alert(srvDSA.translator["valid_msg"]);
            return false;
        }
        param.push({
            id: id,
            detail_source_result: detail_source_result,
        });
    });
    if (param.length > 0){
        apiService.SendRequest("PUT" , srvDSA.service , param , function(rs){
            if (rs.result == "OK"){
                bootbox.alert(srvDSA.translator["msg_save_suc"]);
                srvDSA.loadPage();
            }
        })
    }
}

/**
*   Alert message
*   @param {string} msg - message
*/
var Alert = function(msg){
    bootbox.dialog({
        message : msg,
        buttons : {
            danger : {
                label : apiService.transMessage('CLOSE'),
                className : 'btn-danger',
            }
        }
    });
}
