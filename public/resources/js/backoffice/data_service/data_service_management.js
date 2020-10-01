/**
*
*   srvDSM Object for handler data service management page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvDSM = {};

/**
*   Initial srvDSM
*   @param {object} trans - translate object from laravel
*/
srvDSM.init = function(trans){
    srvDSM.translator = trans;
    srvDSM.service = "thaiwater30/backoffice/data_service/management";
    srvDSM.serviceInit = srvDSM.service+"Init";
    srvDSM.array_agency_id = [];
    srvDSM.array_agency_obj = [];

    // Data table
    srvDSM.table = $('#table').DataTable({
        dom : 'frltip',
        language : g_dataTablesTranslator,
        columns: [{
            data: 'id'
        },{
            data: srvDSM.renderDateTime
        },{
            data: srvDSM.renderFullName
        },{
            data: srvDSM.renderUserAgency
        },{
            data: srvDSM.renderStatus
        },{
            data: srvDSM.renderToolButton
        }],
        order: []
    });
    // Data table
    srvDSM.tableInfo = $('#table-info').DataTable({
        dom : 'rtlip',
        language : g_dataTablesTranslator,
        columns: [{
            data: srvDSM.renderServiceName
        },{
            data: srvDSM.renderFrequency
        },{
            data: srvDSM.renderAgency
        },{
            data: srvDSM.renderServiceMethod
        },{
            data: srvDSM.renderDuration
        },{
            data: srvDSM.renderProvince
        },{
            data: srvDSM.renderResult
        }],
        order: []
    });
    $('#table').on('click' , '.btn.fa-info-circle' , srvDSM.showModalInfo)
    .on('click' , '.btn.btn-remove' , srvDSM.btnRemoveClick);
    $('#btn-display').on('click' , srvDSM.btnDisplayClick);
    $('#input-datestart, #input-dateend').datepicker('setDate', moment().format('YYYY-MM-DD'));
    srvDSM.initLoad();
}

/**
*   Initial load data from service and render data
*/
srvDSM.initLoad = function(){
    apiService.SendRequest("GET" ,srvDSM.serviceInit , {} , function(rs){
        
        srvDSM.order_status = rs.order_status;
        srvDSM.order_header = rs.order_header;
        srvDSM.renderInit();
    })
}

/**
*   Event on click btn-display
*   load data and render
*/
srvDSM.btnDisplayClick = function(){
    var param = {datestart: $('#input-datestart').val(), dateend: $('#input-dateend').val(),
    status_id: parseInt( $('#filter-status').val() ), agency_id: parseInt( $('#filter-agency').val() ) };
    apiService.SendRequest("GET", srvDSM.service , param , function(rs){
        srvDSM.order_header = rs.order_header;
        srvDSM.renderTable();
    });
}

/**
*   handler service load
*/
srvDSM.renderInit = function(){
    srvDSM.renderTable();
    srvDSM.renderFilterStatus();
    srvDSM.renderFilterAgency();
}

/**
*   render filter agency
*/
srvDSM.renderFilterAgency = function(){
    var array_agency_obj = srvDSM.array_agency_obj;
    var filter = $('#filter-agency');
    filter.empty();
    filter.append($('<option>', {value: 0, text: srvDSM.translator["show_all"] }));
    array_agency_obj.sort(function(a,b) {return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0);} );
    for (var i = 0 ; i < array_agency_obj.length ; i ++){
        var d = array_agency_obj[i];
        filter.append($('<option>' , {value: d.value, text: d.text } ));
    }
}

/**
*   render filter order_status
*/
srvDSM.renderFilterStatus = function(){
    var filter = $('#filter-status');
    filter.empty();
    filter.append($('<option>', {value: 0, text: srvDSM.translator["show_all"] }));
    if (srvDSM.order_status.result != "OK"){ return false; }
    var data = srvDSM.order_status.data;
    for (var k in data){
        var d = data[k];
        var value = JH.GetJsonValue(d , "id");
        var text = JH.GetJsonValue(d , "order_status");

        filter.append($('<option>', {value: value, text: text }));
    }
}

/**
*   render table
*/
srvDSM.renderTable = function(){
    srvDSM.table.clear();
    if (srvDSM.order_header.result == "OK" && srvDSM.order_header.data){
        srvDSM.table.rows.add(srvDSM.order_header.data);
    }
    srvDSM.table.draw();
}

/**
*   render order datetime
*   @param {object} row - The data for the whole row
*   @return {string} order datetime
*/
srvDSM.renderDateTime = function(row){
    return JH.GetJsonValue(row , 'order_datetime');
}

/**
*   render user fullname
*   @param {object} row - The data for the whole row
*   @return {string} user fullname
*/
srvDSM.renderFullName = function(row){
    return JH.GetJsonValue(row , 'user_fullname');
}

/**
*   render user agency name
*   @param {object} row - The data for the whole row
*   @return {string} user agency name
*/
srvDSM.renderUserAgency = function(row){
    var value = JH.GetJsonValue(row , "user_agency_id");
    var text = JH.GetJsonLangValue(row , "user_agency_name",true);
    if ( $.inArray(value, srvDSM.array_agency_id) == -1){
        srvDSM.array_agency_id.push(value);
        srvDSM.array_agency_obj.push({"value": value, "text": text});
    }
    return text;
}

/**
*   render order status
*   @param {object} row - The data for the whole row
*   @return {string} order status
*/
srvDSM.renderStatus = function(row){
    return JH.GetJsonValue(row["order_status"] , 'order_status');
}

/**
*   render tool button
*   @param {object} row - The data for the whole row
*   @return {string} tool button
*/
srvDSM.renderToolButton = function(row){
    var id = JH.GetJsonValue(row,"id");
    var status_id = JH.GetJsonValue(row["order_status"],"id");
    var btn_delete = '<i class="btn btn-remove color-red" data-id="'+id+'"></i>';
    if (status_id == 3 || status_id == 4){ btn_delete = ""; }
    return '<i class="btn fa fa-info-circle" data-id="'+id+'"></i>' + btn_delete;
}

/**
*   render table-info
*/
srvDSM.renderTableInfo = function(){
    srvDSM.tableInfo.clear();
    if (srvDSM.order_detail.result == "OK" && srvDSM.order_detail.data){
        srvDSM.tableInfo.rows.add(srvDSM.order_detail.data);
    }
    srvDSM.tableInfo.draw();
}

/**
*   render service name
*   @param {object} row - The data for the whole row
*   @return {string} service name
*/
srvDSM.renderServiceName = function(row){
    return JH.GetJsonLangValue(row["metadata"] , "metadataservice_name",true);
}

/**
*   render frequency
*   @param {object} row - The data for the whole row
*   @return {string} frequency
*/
srvDSM.renderFrequency = function(row){
    return JH.GetJsonValue(row , "detail_frequency");
}

/**
*   render agency name
*   @param {object} row - The data for the whole row
*   @return {string} agency name
*/
srvDSM.renderAgency = function(row){
    return JH.GetJsonLangValue(row["agency"], "agency_name",true);
}

/**
*   render service method
*   @param {object} row - The data for the whole row
*   @return {string} service method
*/
srvDSM.renderServiceMethod = function(row){
    return JH.GetJsonLangValue(row["service"], "servicemethod_name",true);
}

/**
*   render duration
*   @param {object} row - The data for the whole row
*   @return {string} duration
*/
srvDSM.renderDuration = function(row){
    var from_date = JH.GetJsonValue(row, "detail_fromdate");
    var to_date = JH.GetJsonValue(row, "detail_todate");
    if ( from_date == "" || to_date == "" ) { return "" ;}
    return srvDSM.translator["from_date"] + from_date + "<br>" + srvDSM.translator["to_date"] + to_date;
}

/**
*   render province name
*   @param {object} row - The data for the whole row
*   @return {string} province name
*/
srvDSM.renderProvince = function(row){
    var province = JH.GetJsonValue(row, "province");
    if (province == ""){ return "" ;}
    var text = "";
    for (var i = 0 ; i < province.length ; i++){
        if ( i != 0 ) { text += ","};
        text += "<label>"+ JH.GetJsonLangValue(province[i], "province_name",true) +"</label>";

    }
    return text;
}

/**
*   render result
*   @param {object} row - The data for the whole row
*   @return {string} result
*/
srvDSM.renderResult = function(row){
    var result = JH.GetJsonValue(row, "detail_source_result");
    if (result == "") { return "" ;}
    return srvDSM.translator["source_result_"+result];
}

/**
*   show modal info
*/
srvDSM.showModalInfo = function(){
    var param = {order_header_id: $(this).attr('data-id')};
    apiService.GetCachedRequest(srvDSM.service , param , function(rs){
        console.log(rs.order_detail)
        $('#info-purpose').text("จุดประสงค์ : " + rs.order_detail.data[0].order_purpose)
        srvDSM.display(rs.order_detail.data)
        srvDSM.order_detail = rs.order_detail;
        srvDSM.renderTableInfo();
        $('#modal-info').modal();
    });
}

srvDSM.display = function(rs){
    for(var i =0; i < rs.length; i++){
        console.log(rs[i].order_purpose)
    }
}

/**
*   Event btn remove click
*   send DELETE to service
*/
srvDSM.btnRemoveClick = function(){
    var order_header_id = parseInt( $(this).attr('data-id') );
    bootbox.confirm({
        message: srvDSM.translator["confirm_delete"],
        buttons: {
            confirm: {
                label: srvDSM.translator["btn_confirm"],
                className: 'btn-danger'
            },
            cancel: {
                label: srvDSM.translator["btn_cancel"],
                className: 'btn-default'
            }
        },
        callback: function (result) {
            if (result){
                var param = {order_header_id: order_header_id};
                apiService.SendRequest("DELETE" , srvDSM.service , param , function(rs){
                    if (rs.result == "OK"){
                        apiService.SendRequest("GET",srvDSM.service , {} , function(rs){
                            srvDSM.order_header = rs.order_header;
                            srvDSM.renderTable();
                        });
                        bootbox.alert(srvDSM.translator["msg_delete_suc"]);
                    }
                });
            }
        }
    });
}
