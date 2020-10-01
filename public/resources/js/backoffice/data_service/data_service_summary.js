/**
*
*   srvDSS Object for handler data service summary page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvDSS = {};

/**
*   Initial srvDSS
*   @param {object} trans - translate object from laravel
*/
srvDSS.init = function(trans){
    srvDSS.translator = trans;
    srvDSS.service = "thaiwater30/backoffice/data_service/summary";
    srvDSS.serviceInit = srvDSS.service + "Init";
    srvDSS.serviceExpiredate = "thaiwater30/backoffice/data_service/update_expire_date";
    srvDSS.order = {};
    srvDSS.user = [];
    srvDSS.user_obj = [];
    // Data table
    srvDSS.table = $('#table').DataTable({
        dom : 'frlBtip',
        buttons : [ {
            extend : 'excelHtml5',
            text : ' <i class="fa fa-file-excel-o color-green" aria-hidden="true"></i> excel',
        } ],
        "columnDefs": [
            {"className": "dt-body-center", "targets": 9}
          ],
        language : g_dataTablesTranslator,
        columns : [{
            data : srvDSS.renderOrderHearderId
        },{
            data : srvDSS.renderOrderDetailId
        },{
            data : srvDSS.renderDataserviceName
        },{
            data : srvDSS.renderUserName
        },{
            data : srvDSS.renderAgency
        },{
            data : srvDSS.renderServiceType
        },{
            data : srvDSS.renderOrderDate
        },{
            data : srvDSS.renderOrderResultDate
        },{
            data : srvDSS.renderOrderStatus
        },{
            data : srvDSS.renderExpireDate //chang- วันหมดอายุ
        }],
        order : [ ]
    });

    $('#btn-display').on('click' , srvDSS.btnDisplayClick);
    $('#btn-print').on('click' , srvDSS.btnPrintClick);
    //chang- add=================
    //button update expire date
    $('#modal-cart-save-btn').on('click',srvDSS.btnSaveExpiredate);
    //button open modal for set expiredate
    srvDSS.table.on('click','button',function(){
        var data = srvDSS.table.row($(this).parents('tr')).data();
        $('#hidden-input-expiredate').val(data.id);
        $("#modal-cart").modal();
    });
    //=======================

    //chang- add input-expiredate ======
    $('#input-datestart, #input-dateend, #input-expiredate').datepicker('setDate', moment().format('YYYY-MM-DD'));
    //==================================

    // load and render
    apiService.SendRequest("GET", srvDSS.serviceInit , {} , function(rs){
        srvDSS.order = rs.order;
        srvDSS.agency = rs.agency;
        srvDSS.renderTable();
        srvDSS.renderFilterUser();
        srvDSS.renderFilterAgency();
    });
}

/**
*   render filter agency
*/
srvDSS.renderFilterAgency = function(){
    var filter = $('#input-agency');
    filter.empty();
    filter.append($('<option>', {value: 0, text: srvDSS.translator["show_all"] } ));
    if (srvDSS.agency.result == "OK" && srvDSS.agency.data){
        var data = srvDSS.agency.data;
        for(var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var value = JH.GetJsonValue(d , "id");
            var text = JH.GetJsonLangValue(d , "agency_name",true);
            filter.append($('<option>' , {value: value, text: text } ));
        }
    }
}

/**
*   render filter user
*/
srvDSS.renderFilterUser = function(){
    var data = srvDSS.user_obj;
    var filter = $('#input-user');
    filter.empty();
    filter.append($('<option>', {value: 0, text: srvDSS.translator["show_all"] } ));
    data.sort(function(a,b) {return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0);} );
    for (var i = 0 ; i < data.length ; i ++){
        var d = data[i];
        filter.append($('<option>' , {value: d.value, text: d.text } ));
    }
}

/**
*   render table
*/
srvDSS.renderTable = function(){
    srvDSS.table.clear();
    if (srvDSS.order.result == "OK" && srvDSS.order.data){
        srvDSS.table.rows.add(srvDSS.order.data);
    }
    srvDSS.table.draw();
}

/**
*   render order header id
*   @param {object} row - The data for the whole row
*   @return {string} order header id
*/
srvDSS.renderOrderHearderId = function(row){
    return JH.GetJsonValue(row,"order_header_id");
}
/**
*   render order detail id
*   @param {object} row - The data for the whole row
*   @return {string} order header id
*/
srvDSS.renderOrderDetailId = function(row){
    return JH.GetJsonValue(row,"id");
}

/**
*   render service name
*   @param {object} row - The data for the whole row
*   @return {string} service name
*/
srvDSS.renderDataserviceName = function(row){
    return JH.GetJsonLangValue(row["metadata"],"metadataservice_name",true);
}

/**
*   render user fullname
*   @param {object} row - The data for the whole row
*   @return {string} user fullname
*/
srvDSS.renderUserName = function(row){
    var value = JH.GetJsonValue(row , "user_id");
    var text = JH.GetJsonValue(row , "user_fullname");
    if ($.inArray(value, srvDSS.user) == -1){
        srvDSS.user.push(value);
        srvDSS.user_obj.push({"value": value, "text": text});
    }
    return text;
}

/**
*   render agency name
*   @param {object} row - The data for the whole row
*   @return {string} agency name
*/
srvDSS.renderAgency = function(row){
    return JH.GetJsonLangValue(row,"user_agency_name",true);
}

/**
*   render service method name
*   @param {object} row - The data for the whole row
*   @return {string} service method name
*/
srvDSS.renderServiceType = function(row){
    return JH.GetJsonLangValue(row["service"],"servicemethod_name",true);
}

/**
*   render order header datetime
*   @param {object} row - The data for the whole row
*   @return {string} order header datetime
*/
srvDSS.renderOrderDate = function(row){
    return JH.GetJsonValue(row,"order_header_order_datetime");
}

/**
*   render send result date
*   @param {object} row - The data for the whole row
*   @return {string} send result date
*/
srvDSS.renderOrderResultDate = function(row){
    var date = JH.GetJsonValue(row,"detail_source_result_date");
    if (date == "") { return date; }
    return date.split("T")[0];
}

/**
*   render result
*   @param {object} row - The data for the whole row
*   @return {string} result
*/
srvDSS.renderOrderStatus = function(row){
    var status = JH.GetJsonValue(row,"detail_source_result");
    if (status == ""){ return ""; }
    return JH.GetJsonValue(srvDSS.translator, "source_result_" + status);
}

//chang-
/**
 * render expiration date
 * @param {object} row - The data for the whole row
 * @return {string} result
 */
srvDSS.renderExpireDate = function(row){
    var date = JH.GetJsonValue(row,"order_expire_date");
    var button = window.document.createElement('button');
    button.setAttribute("class","btn default")
    button.id = "order_expire_button";
    if (date == "") { button.innerHTML = `<i class="fa fa-clock-o"></i>`; }
    else {button.innerHTML=date.split("T")[0];}
    return button.outerHTML;
}

/**
*   Event btn display click
*   load data and render
*/
srvDSS.btnDisplayClick = function(){
    var param = {
        datestart: $('#input-datestart').val(),
        dateend: $('#input-dateend').val(),
        user_id: parseInt($('#input-user').val()),
        agency_id: parseInt($('#input-agency').val())
    };
    apiService.GetCachedRequest(srvDSS.service, param , function(rs){
        srvDSS.order = rs;
        srvDSS.renderTable();
    });
}

/**
*   Event btn print click
*   open print page
*/
srvDSS.btnPrintClick = function(){
    var param = "datestart="+ $('#input-datestart').val()+
        "&dateend="+ $('#input-dateend').val()+
        "&user_id="+ parseInt($('#input-user').val())+
        "&agency_id="+ parseInt($('#input-agency').val());
    window.open(_URL_ + "?" + param , '_blank');
}

/**
 * saver expire date to database
 */
srvDSS.btnSaveExpiredate = function(){
    var date = new Date($('#input-expiredate').datepicker('getDate'));
    // var expire_date = date.toISOString().split("T")[0] + " 00:00:00"
    var expire_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate() + " 00:00:00"
    if(date.toString().split("+").length>1){
        expire_date += "+"+date.toString().split("+")[1].split(" ")[0].substr(0,2)
    }
    else if(date.toString().split("-").length>1){
        expire_date += "-"+date.toString().split("-")[1].split(" ")[0].substr(0,2)
    }
    var param = {
        id:parseInt($('#hidden-input-expiredate').val()),
        expire_date:expire_date
    }
    apiService.SendRequest("PUT",srvDSS.serviceExpiredate,param,function(rs){
        if(rs.result == "OK"){
            window.location.reload();
        }
    });
}
