/**
*
*   srvMain Object for handler main page
*
*   @author Permporn Kuibumrung <permporn@haii.co.th>
*   @license HAII
*
*/
var srvMain = {
    cache: {}
};
/**
*   Initial srvMain
*   @param {object} trans - translate object from laravel
*/
srvMain.init = function(trans){
    //set dafault datatable
    $.extend( true, $.fn.dataTable.defaults, {
        "dom": 't',
        "iDisplayLength": 200,
        "language":  g_dataTablesTranslator
    } );
    srvMain.translator = trans;
    srvMain.waterlevelInit = true;
    srvMain.waterlevelCache = [];
    srvMain.currentDatatable = null;

    srvMain.initVar();
    srvMain.initLoad();
}

/**
*  Initial variable in srvMain
*/
srvMain.initVar = function(){
    srvMain.service = "thaiwater30/public/thailand_main";

    // Data table CityPlan
    srvMain.CityPlan_table = $("#cityplan_table");
    srvMain.CityPlan_DataTable = srvMain.CityPlan_table.DataTable({
        fixedHeader: true,
        columns:[
            {data: srvMain.CityPlan_render_name},
            {data: srvMain.CityPlan_render_dowload}
        ],
        order : [ [ 0, 'asc' ] ],
        language:{
            emptyTable: srvMain.translator["data_empty_table"]
        },
         "searching": true
    });
}

/**
*   Initial load data in srvMain
*/
srvMain.initLoad = function(){
    apiService.SendRequest( "GET", srvMain.service , {} , function(rs){
        srvMain.handlerSrvCityPlan( JH.GetJsonValue(rs , "province") );
    } );
}

/**
*   handler service Province -> CityPlan
*   @param {object} rs - result จาก service ในส่วนของ Province
*/
srvMain.handlerSrvCityPlan = function(rs){
    if (rs.result == "OK"){
        srvMain.CityPlan_genTable(rs.data);
    }
}

function isBigEnough(element) {

    var isBigEnough = ['11', '12', '19', '25', '32', '37', '45', '47', '50', '57', '70', '74', '76', '80', '93', '97'];

    return isBigEnough.indexOf(element.province_code) < 0;

    
}

srvMain.CityPlan_genTable = function(data){

    srvMain.CityPlan_DataTable.clear().draw();

    var result = data.filter(isBigEnough);

    var a = [];
    for (i = 0 ; i < result.length ; i++){
        srvMain.CityPlan_DataTable.row.add(result[i]);
    }
    srvMain.CityPlan_DataTable.draw();
}

srvMain.CityPlan_render_name = function(row){
    return JH.GetJsonLangValue(row, "province_name");
}

srvMain.CityPlan_render_dowload = function(row){
    return '<center><a href="products/masterplan/' + row.province_code + '.zip" title="'+srvMain.translator["dowload"]+'" download ><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span></a></center>';
}

$('#cityplan_input').on( 'keyup', function () {
    srvMain.CityPlan_DataTable.search( this.value ).draw();
});
