/**
*
*   p Object for handler data service to agency print page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var p = {};

/**
*   Initial p
*   @param {int} oh_id - order header id
*/
p.init = function(oh_id){
    // thai number
    p.array = {"1":"๑", "2":"๒", "3":"๓", "4" : "๔", "5" : "๕", "6" : "๖", "7" : "๗", "8" : "๘", "9" : "๙", "0" : "๐"};
    p.service = "thaiwater30/backoffice/data_service/print";
    p.groupData = {};

    apiService.SendRequest("GET" , p.service , {order_header_id: oh_id} , function(rs){
        if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
        var data = JH.GetJsonValue(rs , "data");
        var gd = p.groupData;
        for( var i = 0 ; i < data.length; i++){
            var d = data[i];
            var agency_id = JH.GetJsonValue(d , "agency.id");
            if ( JH.GetJsonValue(gd , agency_id) != "" ){
                gd[ agency_id ].push( d );
            }else{
                gd[ agency_id ] = [ d ];
            }
        }
        p.renderPrint();
    });
}

/**
*   conver number to thai number
*   @param {string} num - text you need to convert
*/
p.thaiNumber = function(num){
    var str = num.toString();
    for (var val in p.array) {
        str = str.split(val).join(p.array[val]);
    }
    return str;
}

/**
*   render print
*/
p.renderPrint = function(){
    var gd = p.groupData;
    for(var key in gd) {
        var v = gd[key];

        p.renderPage1(v);
        p.renderPage2(v);
        p.renderDetail(v);
    }
}

/**
*   date time format
*   @param {string} datetime - datetime you need to convert
*/
p.DateFormat = function(datetime){
    // 2016-10-10T09:00:00+07:00
    return JH.DateFormat(datetime, "DD MMMM YYYY HH:mm");
}

/**
*   get value with thai number
*   @param {object} o - object ที่เก็บค่า
*   @param {string} k - key ที่ต้องการดึง
*   @return {string} value with thai number
*/
p.genText = function(o , k){
    return p.thaiNumber(JH.GetJsonValue(o , k));
}

/**
*   get date value with thai number
*   @param {object} o - object ที่เก็บค่า
*   @param {string} k - key ที่ต้องการดึง
*   @return {string} datetime value with thai number
*/
p.genDateText  = function(o , k){
    if (arguments.length == 0){ return p.thaiNumber( p.DateFormat('') );}
    return p.thaiNumber( p.DateFormat( JH.GetJsonValue(o , k) ) );
}

/**
*   get lang value with thai number
*   @param {object} o - object ที่เก็บค่า
*   @param {string} k - key ที่ต้องการดึง
*   @return {string} datetime value with thai number
*/
p.genLangText  = function(o , k){
    return p.thaiNumber(JH.GetJsonLangValue(o , k,true));
}

/**
*   render page 1
*   @param {object} data - data from service
*/
p.renderPage1 = function(data){
    var d = data[0];
    var page = $('#page-1').clone().removeAttr('id').removeClass('hidden');
    $('.pdf').append(page);

    page.find('span[name="letterno"]').text( p.genText(d , "detail_letterno") );
    page.find('span[name="date"]').text( p.genDateText(d , "detail_letterdate") );
    page.find('span[name="meta_agency"]').text( p.genLangText(d , "agency.agency_name") );
    page.find('span[name="user_agency"]').text( p.genLangText(d , "user_agency_name") );
}

/**
*   render page 2
*   @param {object} data - data from service
*/
p.renderPage2 = function(data){
    var d = data[0];
    var page = $('#page-2').clone().removeAttr('id').removeClass('hidden');
    $('.pdf').append(page);

    page.find('span[name="oh_id"]').text( p.genText(d , "order_header_id") );
    page.find('span[name="date"]').text( p.genDateText() );
    page.find('span[name="user_id"]').text( p.genText(d , "user_id") );
    page.find('span[name="user_name"]').text( p.genText(d , "user_fullname") );
    page.find('span[name="user_ministry"]').text( p.genLangText(d , "user_ministry_name") );
    page.find('span[name="user_agency"]').text( p.genLangText(d , "user_agency_name") );
    page.find('span[name="user_office_name"]').text( p.genText(d , "user_office_name") );
    page.find('span[name="user_phone"]').text( p.genText(d , "user_phone") );
    page.find('span[name="order_purpose"]').text( p.genText(d , "order_purpose") );
}

/**
*   render page table detail
*   @param {object} data - data from service
*/
p.renderDetail = function(data){
    var pageDetail, body;
    for (var i = 0 ; i < data.length ; i++){
        var d = data[i];

        if( !pageDetail ){
            pageDetail = $('#page-detail').clone().removeAttr('id').removeClass('hidden');
            $('.pdf').append(pageDetail);
            body = pageDetail.find('table > tbody');
        }

        var tr = "<tr>";
        tr += "<td align='center'>" + p.thaiNumber( (i+1) ) + "</td>";
        tr += "<td>" + p.genLangText(d , "metadata.metadataservice_name") + "</td>";
        tr += "<td>" + p.genLangText(d , "agency.agency_name") + "</td>";
        tr += "<td>" + p.genText(d , "detail_frequency") + "</td>";
        tr += "<td>" + p.renderBasinName( JH.GetJsonValue(d , "basin") ) + "</td>";
        tr += "<td>" + p.renderProvinceName( JH.GetJsonValue(d , "province") ) + "</td>";
        tr += "<td>" + p.renderDateRange( d ) + "</td>";
        tr += "<td>" + p.genLangText( d , "service.servicemethod_name" ) + "</td>";
        tr += "<td></td>";
        tr += "<td></td>";
        tr += "</tr>";
        body.append(tr);
        if ( body.height() > pageDetail.find('.subpage').height() ){
            body.find('tr:last').remove();

            pageDetail = $('#page-detail').clone().removeAttr('id').removeClass('hidden');
            $('.pdf').append(pageDetail);
            body = pageDetail.find('table > tbody');
            body.append(tr);
        }
    }
}

/**
*   render join lang data array with ", "
*   @param {object} data - data from service
*   @param {string} key - key ที่ต้องการดึง
*   @return {string}
*/
p.renderLangArray = function(data , key){
    var text = "";
    for (var i = 0 ; i < data.length ; i++){
        if ( i != 0 ){ text += ", "; }
        text += JH.GetJsonLangValue(data[i] , key,true);
    }
    return text;
}

/**
*   render basin name
*   @param {object} data - data
*   @return {string} basin name
*/
p.renderBasinName = function(data){
    return p.renderLangArray(data , "basin_name");
}

/**
*   render province name
*   @param {object} data - data
*   @return {string} province name
*/
p.renderProvinceName = function(data){
    return p.renderLangArray(data , "province_name");
}

/**
*   render date range
*   @param {object} data - data
*   @return {string} date range
*/
p.renderDateRange = function(data){
	var from_date = p.genDateText(data , "detail_fromdate");
	var to_date = p.genDateText(data , "detail_todate");
	if (from_date == "" || to_date == ""){ return ""; }
	return TRANSLATOR["from_date"] + " " +from_date + "<br/>" + TRANSLATOR["to_date"] + " " +to_date;
}
