/**
*
*   srvMain Object for handler main page
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var waterlevel = {
    cache: {}
};

/**
*   Initial srvMain
*   @param {object} trans - translate object from laravel
*/
waterlevel.init = function(trans){
    //set dafault datatable
    $.extend( true, $.fn.dataTable.defaults, {
        "dom": 't',
        "iDisplayLength": 200,
        "language":  g_dataTablesTranslator
    } );
    waterlevel.translator = trans;

    waterlevel.waterlevelInit = true;
    waterlevel.waterlevelCache = [];
    waterlevel.currentDatatable = null;

    waterlevel.initVar();
    waterlevel.initMap();
    waterlevel.initFilter();
    waterlevel.initLoad();

    // click open modal-waterlevel chart
    $(document).on('click' , 'a[data-toggle="modal-waterlevel"]' , function(e){
        e.preventDefault();
        $('#modal-waterlevel').find('iframe').attr( 'src', 'iframe/graph/waterlevel?station='+$(this).attr('href') );
        $('#modal-waterlevel').modal();
        return false;
    });
}

/**
*  Initial variable in srvMain
*/
waterlevel.initVar = function(){
    waterlevel.service = "thaiwater30/public/waterlevel_load";
    waterlevel.service_watergate = "thaiwater30/public/watergate_load";
    waterlevel.service_cctv = "thaiwater30/analyst/cctv";

    // marker setup
    waterlevel.Marker = function(c){return {fillColor: c, radius: 8, color: "#4c4c4c", weight: 1, opacity: 0.8, fillOpacity: 1, clickable: true}; }
    $('#div_waterlevel_table, #div_watergate_table').css('max-height', '800px');

    // Data table
    waterlevel.WaterLevel_Table = $('#waterlevel_table');
    waterlevel.WaterLevel_DataTable = waterlevel.WaterLevel_Table.DataTable({
        fixedHeader: true,
        order: [ [ 1, 'asc' ] ],
        columns: [
            {data: waterlevel.WaterLevel_render_basin, width: "0", visible: false,},
            {data: waterlevel.WaterLevel_render_basinId, width: "0", visible: false},
            {data: waterlevel.WaterLevel_render_name, width: "52px"},
            {data: waterlevel.WaterLevel_render_agency, width: "50px", visible: false},
            {data: waterlevel.WaterLevel_render_datetime, width: "53px"},
            {data: waterlevel.WaterLevel_render_msl, width: "45px"},
            {data: waterlevel.WaterLevel_render_storage, width: "82px"},
            {data: waterlevel.WaterLevel_render_situation, width: "48px"},
            {data: waterlevel.WaterLevel_render_state, width: "50px", visible: false},
        ],
        drawCallback: function ( settings ) {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last = null;
            var columnCount = waterlevel.WaterLevel_Table.find('thead th').length;

            api.column(0, {page:'current'} ).data().each( function ( group, i ) {

                if ( last !== group ) {
                    // group by basin
                    $(rows).eq( i ).before(
                        '<tr class="gr"><th colspan="'+columnCount+'">'+group+'</th></tr>'
                    );

                    last = group;
                }
            } );
        }
    });
    waterlevel.WaterLevel_Table_OrderBasin_Current = [ 1, 'asc' ]; // เก็บว่าตอนนี้ order basin แบบไหน
    waterlevel.WaterLevel_Table_Order_Current = [ ]; // เก็บว่าตอนนี้ order แบบไหน
    // custom order ให้เรียง basin ก่อนแล้วค่อยเรียง ตาม column ทีเลือก
    waterlevel.WaterLevel_Table.on( 'click', 'thead th', function () {
        var currentOrder = waterlevel.WaterLevel_DataTable.order()[ waterlevel.WaterLevel_DataTable.order().length -1 ];
        var Order =  currentOrder[1];
        // เป็นการเปลี่ยน order ครั้งแรกไม่ต้องเช็คค่าเก่า
        if ( waterlevel.WaterLevel_Table_Order_Current.length != 0){
            var _preOrder = waterlevel.WaterLevel_Table_Order_Current[ waterlevel.WaterLevel_Table_Order_Current.length - 1 ];
            if ( _preOrder[0] == currentOrder[0] ){
                // เปลี่ยน order ที่ คอลั่มเดิม
                Order = _preOrder[1] == 'asc' ? 'desc' : 'asc';
            }
        }
        waterlevel.WaterLevel_Table_Order_Current = [
            waterlevel.WaterLevel_Table_OrderBasin_Current,
            [ currentOrder[0], Order]
        ];
        waterlevel.WaterLevel_DataTable.order( waterlevel.WaterLevel_Table_Order_Current ).draw();
    } );
    // Order by the grouping
    $('#waterlevel_table tbody').on( 'click', 'tr.gr', function () {
        var currentOrder = waterlevel.WaterLevel_DataTable.order()[0];
        if ( currentOrder[0] === 1 && currentOrder[1] === 'asc' ) {
            waterlevel.WaterLevel_Table_OrderBasin_Current = [ 1, 'desc' ];
        } else {
            waterlevel.WaterLevel_Table_OrderBasin_Current = [ 1, 'asc' ];
        }
        waterlevel.WaterLevel_DataTable.order( waterlevel.WaterLevel_Table_OrderBasin_Current ).draw();
    } );

    //table watergate
    waterlevel.WaterGate_Table = $('#watergate_table');
    waterlevel.WaterGate_DataTable = waterlevel.WaterGate_Table.DataTable({
        fixedHeader: true,
        order: [ [ 1, 'asc' ] ],
        columns: [
            {data: waterlevel.WaterGate_render_station},
            {data: waterlevel.WaterGate_render_date_in},
            {data: waterlevel.WaterGate_render_time_in},
            {data: waterlevel.WaterGate_render_watergate_in},
            {data: waterlevel.WaterGate_render_watergate_out},
            {data: waterlevel.WaterGate_render_date_out},
            {data: waterlevel.WaterGate_render_time_out},
            {data: waterlevel.WaterGate_render_floodgate},
            {data: waterlevel.WaterGate_render_floodgate_height},
            {data: waterlevel.WaterGate_render_floodgate_open},
            {data: waterlevel.WaterGaate_render_pump},

        ]
    });


}

/**
*   เก็บ FEATURE_BASIN cache ของแมพไว้
*   @param {string} map - แผนที่ของข้อมูลอะไร
*   @param {L.Feature} feature -
*   @param {L.Layer} layer -
*/
waterlevel.onEachFeature = function(map, feature, layer){
    if (typeof waterlevel.FEATURE_BASIN == "undefined"){
        waterlevel.FEATURE_BASIN = {};
    }
    if (typeof waterlevel.FEATURE_BASIN[map] == "undefined"){
        waterlevel.FEATURE_BASIN[map] = [];
    }
    // console.log(waterlevel.FEATURE_BASIN);
    waterlevel.FEATURE_BASIN[map][feature.properties.BASIN_CODE] = layer;
    waterlevel.FEATURE_BASIN[map][feature.properties.BASIN_T] = layer;
}

/**
*   เก็บ FEATURE_BASIN ของ แผนที่ waterlevel
*   @param {L.Feature} feature -
*   @param {L.Layer} layer -
*/
waterlevel.onEachFeature_WaterLevel = function(feature, layer){
    waterlevel.onEachFeature("waterlevel" , feature, layer)
}

/**
*   Initial map in srvMain
*/
waterlevel.initMap = function(){
    $('#waterlevel_map').height('530px');

    waterlevel.GEOJSON_THAILAND_STYLE = {fillOpacity: 0, opacity: 0, interactive: false};
    waterlevel.GEOJSON_FOCUS_STYLE = {opacity: 1};

    // init ,  waterlevel map
    waterlevel.waterlevel_map = LL.Map('waterlevel_map');
    L.geoJson(LL.GetGeoJsonThailand() , {style: waterlevel.GEOJSON_THAILAND_STYLE,onEachFeature: waterlevel.onEachFeature_WaterLevel } ).addTo(waterlevel.waterlevel_map);

    LL.CenterDefault(waterlevel.waterlevel_map);
}

/**
*   Initial filter in srvMain
*/
waterlevel.initFilter = function(){

    // waterlevel on change filter basin
    $('#waterlevel_filter_basin').on('change' , function(){
        var table = waterlevel.WaterLevel_DataTable;
        table.column(3).visible(true);
        table.column(8).visible(true);

        var _code = $(this).val();
        var _agency = $('#waterlevel_filter_agency').val();
        var param = {basin_id: _code, agency_id: _agency};
        apiService.GetCachedRequest(waterlevel.service , param , function(rs){
            // console.log(_code);
            if (rs.waterlevel_data.result == "OK"){
                waterlevel.waterlevelInit = true;
                waterlevel.waterlevelCache = [];
                waterlevel.WaterLevel_genMap(rs.waterlevel_data.data);

               if(_code != ""){ // รายจังหวัด
                    // console.log(_code);
                     var data = waterlevel.GetWaterLevel20('');
                     // console.log(data);
                    waterlevel.WaterLevel_genTable(data);
                    if (typeof waterlevel.current_waterlevel !== "undefined"){
                        //waterlevel.current_waterlevel.setStyle(waterlevel.GEOJSON_THAILAND_STYLE);
                    }
                    //waterlevel.current_waterlevel = waterlevel.FEATURE_BASIN["waterlevel"][_code];

                    // zoom basin
                    for(var i=0; i < BASIN.features.length ; i++){
                        if(BASIN.features[i].properties.BASIN_CODE == _code){
                           //console.log(BASIN.features[i].properties.BASIN_CODE +'==' + _code);
                           var basin = BASIN.features[i].properties;
                           var long = basin.x;
                           var lat = basin.y;
                        }
                    }
                    if(lat){
                        waterlevel.waterlevel_map.setView([lat,long], 7);
                    }

                    // zoom fitBounds stations
                    // var stations = [];

                    // for(var i=0; i < data.length; i++){
                    //     var long = data[i].station.tele_station_long;
                    //     var lat = data[i].station.tele_station_lat;
                    //     stations.push([lat,long]);
                    // }

                    // waterlevel.waterlevel_map.fitBounds(stations); //zoom


                    //waterlevel.current_waterlevel.setStyle(waterlevel.GEOJSON_FOCUS_STYLE);
                }
                else{ // ทั้งประเทศ
                    var data_all = waterlevel.GetWaterLevel20('desc');
                    waterlevel.WaterLevel_genTable(data_all);
                    // $('#waterlevel_filter_basin').trigger('change');
                    LL.CenterDefault(waterlevel.waterlevel_map);// reset map focus
                    if (typeof waterlevel.current_waterlevel !== "undefined"){
                        // waterlevel.current_waterlevel.setStyle(waterlevel.GEOJSON_THAILAND_STYLE);
                        delete waterlevel.current_waterlevel
                    }
                }
            }
        });
    });

    $('#waterlevel_filter_agency').on('change' , function(){
        var table = waterlevel.WaterLevel_DataTable;
        table.column(3).visible(true);
        table.column(8).visible(true);

        var _agency = $(this).val();
        var _basin = $('#waterlevel_filter_basin').val();
        var param_agency = {agency_id: _agency, basin_id: _basin};
        apiService.GetCachedRequest(waterlevel.service , param_agency , function(agency){

            if (agency.waterlevel_data.result == "OK") {
                waterlevel.waterlevelInit = true;
                waterlevel.waterlevelCache = [];
                waterlevel.WaterLevel_genMap(agency.waterlevel_data.data);
                if (_agency != "") {
                    var data_agency = waterlevel.GetWaterLevel20('desc');

                    waterlevel.WaterLevel_genTable(data_agency);
                }else {
                    var data_agency_all = waterlevel.GetWaterLevel20('desc');
                    waterlevel.WaterLevel_genTable(data_agency_all);
                }
            }
        });
    });

    // $('#tabwaterlevel').on('click', function(){
    //     apiService.GetCachedRequest(waterlevel.service_cctv , {} , function(cctv){
    //         if (cctv.result == "OK") {
    //             waterlevel.waterlevelInit = true;
    //             waterlevel.waterlevelCache = [];
    //             LL.CenterDefault(waterlevel.waterlevel_map);
    //             waterlevel.cctv_genMap(cctv.data);

    //         }
    //     });
    // });

    // $('#show_agency').on('click', function(){
    //     var table = waterlevel.WaterLevel_DataTable;
    //     table.column(3).visible(true);
    //     table.column(8).visible(true);

    //     // waterlevel.WaterLevel_DataTable.column(4).visible(true);
    // });
}

/**
*   Initial load data in waterlevel
*/
waterlevel.initLoad = function(){
    apiService.SendRequest( "GET", waterlevel.service , {} , function(rs){
        waterlevel.handlerFilterBasin( JH.GetJsonValue(rs , "basin") );
        waterlevel.handlerSrvWaterLevel(rs);
        waterlevel.handlerFilterAgency( JH.GetJsonValue(rs, "agency") );
        waterlevel.handlerCurrentIcon();
        // re enable fixedHeader for fix bug
        // $('#body').on('activate.bs.scrollspy', function (e) {
        //     if ( waterlevel.currentDatatable != null ){
        //         waterlevel.currentDatatable.fixedHeader.disable();
        //     }
        //     var box = $(e.target).find('a').attr('data-box');
        //     var currentDatatable = null;
        //     switch(box){
        //         case "waterlevel":
        //         currentDatatable = waterlevel.WaterLevel_DataTable;
        //         break;
        //     }
        //     if ( currentDatatable ){
        //         currentDatatable.fixedHeader.enable();
        //     }
        //     waterlevel.currentDatatable = currentDatatable;
        // })
    } );

    //watergate
    apiService.SendRequest("GET", waterlevel.service_watergate, {} , function(watergate){
        waterlevel.handlerSrvWaterGate(watergate);
    });

    apiService.SendRequest("GET", waterlevel.service_cctv, {} , function(cctv){
        waterlevel.handlerSrvCCTV(cctv);
    });
}

/**
*   Re focus to current icon from #hash
*/
waterlevel.handlerCurrentIcon = function(){
    if (window.location.hash){
        var hashId = window.location.hash;
        setTimeout(function() {
            // หลักจากโหลดหน้าจอเสร็จ รอ 1 วิ เพื่อไปหาไอคอน ที่เลือก
            $('html,body').animate({scrollTop: $(hashId).offset().top});
            $('body').scrollspy({ target: '#body', offset: 35 });
            $('body').each(function () {
                var $spy = $(this).scrollspy('refresh');
            });
        }, 1000);
    }else{
        $('body').scrollspy({ target: '#body', offset: 35 });
        $('body').each(function () {
            var $spy = $(this).scrollspy('refresh');
        });
    }
}

/**
*   Generate filter basin to box-rain,box-waterlevel
*   @param {array} basin - array object
*/
waterlevel.handlerFilterBasin = function(basin){

    if (basin.result != "OK"){
        return false;
    }
    var p = basin.data;

    // เรียงตามชื่อจังหวัด
    JH.Sort(p, "basin_name.th", false, function(obj){
        return JH.GetLangValue(obj).toLowerCase();
    });
    var waterlevel_filter_basin = document.getElementById("waterlevel_filter_basin");

    // ใส่ option แสดงทั้งหมด ลงไปใน select
    waterlevel_filter_basin.add(new Option(waterlevel.translator["show_all_filter_basin"], ""));

    for(var i in p) {
        // ใส่ option ลงไปใน select
        waterlevel_filter_basin.add(new Option(JH.GetJsonLangValue(p[i], "basin_name.th"), p[i].id));
    }
}

waterlevel.handlerFilterAgency = function(agency){
    if (agency.result != "OK") {
        return false;
    }
    var a = agency.data;

    JH.Sort(a, "agency_name.th", false, function(obj){
        return JH.GetLangValue(obj).toLowerCase();
    });
    var waterlevel_filter_agency = document.getElementById("waterlevel_filter_agency");
    waterlevel_filter_agency.add(new Option(waterlevel.translator["_agency_name"], ""));

    for(var i in a){
        waterlevel_filter_agency.add(new Option(JH.GetJsonLangValue(a[i], "agency_name.th"), a[i].id));
    }
}

/**
*   generate a tag to modal graph
*   @param {string} link - href
*   @param {string} text - ข้อความของ a
*   @param {string} title -
*   @param {string} modal - id ของ modal ที่จะให้เปิด
*   @param {string} style - custom style
*   @return {string} a tag
*/
waterlevel.Gen_GraphLink = function(link , text , title , modal, style){
    return '<a href="'+link+'" title="'+title+'" data-toggle="'+modal+'" style="'+ style +'">'+text+'</a>';
}

waterlevel.CCTV_Gen_GraphLink = function(link, title, model, style){
    console.log(link);
    return '<h3>'+link+title+model+style+'</h3>';

}

/**
*   handler service water level
*   @param {object} rs - result จาก service ในส่วนของ waterlevel
*/
waterlevel.handlerSrvWaterLevel = function(rs){
    srvTHF.SetWaterLevel_Setting(rs.scale.data);
    waterlevel.WaterLevel_genTableScale();
    if (rs.waterlevel_data.result == "OK") {
        waterlevel.WaterLevel_Table_Data = rs.waterlevel_data.data;
        waterlevel.WaterLevel_genMap(rs.waterlevel_data.data);

        var data = waterlevel.GetWaterLevel20('desc');
        waterlevel.WaterLevel_genTable(data);
        $('li.tab1').on('click', function(){
            //alert("tab3");
            waterlevel.WaterLevel_genMap(rs.waterlevel_data.data);
            waterlevel.waterlevel_map.removeLayer(waterlevel.cctv_AllMarker);
            //console.log(cctv);
        });
    }
}

/**
*   get waterlevel 20 row order by basin, storage_percent
*   @param {string} sort - ace, desc
*   @return {array} array waterlevel data
*/
waterlevel.GetWaterLevel20 = function(sort){
    if (sort == "asc"){
        rev = false;
        data = waterlevel.waterlevelCache.slice(-20);
    }else if (sort == "desc"){
        rev = true;
        data = waterlevel.waterlevelCache.slice(0,20);
    }else{
        data = waterlevel.waterlevelCache;
    }
    // เรียง WaterLevel_Table_Data ตาม basin.id , storage_percent
    JH.Sort(data, ["basin.id", "storage_percent"], [false, rev]);

    return data;
}

// render waterlevel column
/**
*   render basin
*   @param {object} d - object
*   @return {string} basin name
*/
waterlevel.WaterLevel_render_basin = function(d){
    var basin_name = JH.GetJsonLangValue(d , "basin.basin_name.th");
    return basin_name;
}

/**
*   render basin id
*   @param {object} d - object
*   @return {string} basin id
*/
waterlevel.WaterLevel_render_basinId = function(d){
    var basin_id = JH.GetJsonLangValue(d , "basin.id");
    return basin_id;
}

/**
*   get tumbon_name amphoe_name province_name
*   @param {object} d - object
*   @return {string} tumbon_name+amphoe_name+province_name
*/
waterlevel.WaterLevel_GetTAP = function(d){
    var t = JH.GetJsonLangValue(d , "geocode.tumbon_name"); // tumbon
    var a = JH.GetJsonLangValue(d , "geocode.amphoe_name"); // amphoe
    var p = JH.GetJsonLangValue(d , "geocode.province_name"); // province
    var tap = ""; // tumbon amphoe province
    if (t != "") { tap += waterlevel.translator["short_tumbon"] + t + " "; }
    if (a != "") { tap += waterlevel.translator["short_amphoe"] + a + " "; }
    if (p != "") { tap += waterlevel.translator["short_province"] + p + " "; }
    return tap;
}

/**
*   redner column name
*   @param {object} d - object
*   @return {string} text
*/
waterlevel.WaterLevel_render_name = function(d){
    var tap = waterlevel.WaterLevel_GetTAP(d);
    var province_code = JH.GetJsonValue(d , "geocode.province_code");
    var basin_id = JH.GetJsonValue(d, "basin.id");
    var agency_id = JH.GetJsonValue(d, "agency.id");
    var station_id = JH.GetJsonValue(d, "station.id");
    var station_type = JH.GetJsonValue(d, "station_type");
    var station_name = JH.GetJsonLangValue(d , "station.tele_station_name");
    var station_link = waterlevel.WaterLevel_GraphLink(station_id+"&station_type="+station_type+"&province="+province_code+"&basin="+basin_id+"&agency="+agency_id+"&tab=1" , station_name);
    var waterlevel_datetime = JH.GetJsonValue(d , "waterlevel_datetime");
    if ( !moment().isSame(waterlevel_datetime, 'date') ){
        // ถ้าข้อมูลไม่ใช่วันปัจจุบัน ใช้สีใน setting
        station_link = $(station_link).css('color', srvTHF.GetWaterLevel_NotToday().colorname )[0].outerHTML;
    }
    return station_link;
}

waterlevel.WaterLevel_render_agency = function(d){
    var agency_id = JH.GetJsonValue(d, "agency.id");
    var agency_name = JH.GetJsonValue(d, "agency.agency_name.en");
    return agency_name;
}

/**
*   render datetime
*   @param {object} d - object
*   @return {string} datetime
*/
waterlevel.WaterLevel_render_datetime = function(d){
    var waterlevel_datetime = JH.GetJsonValue(d , "waterlevel_datetime");
    var waterlevel_datetime_text = srvTHF.DateFormat( waterlevel_datetime );
    return waterlevel_datetime_text;
}

/**
*   render waterlevel_msl
*   @param {object} d - object
*   @return {string} waterlevel_msl
*/
waterlevel.WaterLevel_render_msl = function(d){
    var waterlevel_msl = JH.GetJsonValue(d , "waterlevel_msl") ;
    var waterlevel_msl_text = srvTHF.NumFormat( waterlevel_msl );
    if ( waterlevel_msl == 999999 ){
        // ข้อมูลเป็น 999999 ใช้ข้อความจาก setting
        waterlevel_msl_text = srvTHF.GetWaterLevel_NotToday().text;
    }
    return waterlevel_msl_text;
}

/**
*   render storage
*   @param {object} d - object
*   @return {string} storage
*/
waterlevel.WaterLevel_render_storage = function(d){
    var storage_percent = JH.GetJsonValue(d , "storage_percent") ;
    var storage_percent_text = srvTHF.NumFormat( storage_percent );
    return storage_percent_text;
}

/**
*   render situation
*   @param {object} d - object
*   @return {string} situation
*/
waterlevel.WaterLevel_render_situation = function(d){
    var storage_percent = JH.GetJsonValue(d , "storage_percent") ;
    var water_situation = srvTHF.WaterLevel_GetSituation( storage_percent, waterlevel.translator ) ;
    return water_situation;
}

//get situation แทน state ไปก่อน รอข้อมูล
waterlevel.WaterLevel_render_state = function(d){
    var storage_percent = JH.GetJsonValue(d, "storage_percent");
    var water_state = srvTHF.WaterLevel_GetSituation(storage_percent, waterlevel.translator);
    return water_state;
}

/**
*   genarate table waterlevel scale
*/
waterlevel.WaterLevel_genTableScale = function(){
    var table = $('#waterlevel_table_scale');
    var scale = srvTHF.GetWaterLevel_Scale();
    table.empty();
    text = "<td>"+waterlevel.translator["waterlevel_scale_text"]+"</td>";
    for (var i = scale.length - 1 ; i >= 0 ; i--){
        var s = scale[i];
        var color = JH.GetJsonValue(s, "color");
        var t = JH.GetJsonValue(s, "text");
        if ( !t ){ continue; }
        text += '<td bgcolor="'+color+'">'+t+'</td>';
    }
    table.append(text);
}

waterlevel.handlerSrvWaterGate = function(watergate){

    if (watergate.result == "OK") {
        waterlevel.WaterGate_Table_Data = watergate.data.watergate_data.data;
        // waterlevel.WaterLevel_genMap(watergate.data.watergate_data.data);
        // var data = waterlevel.GetWaterLevel20('desc');
        waterlevel.WaterGate_genTable(watergate.data.watergate_data.data);


        $('li.tab2').on('click', function(){
            waterlevel.waterlevel_map.removeLayer(waterlevel.WaterLevel_AllMarker);
            waterlevel.watergate_genMap(watergate.data.watergate_data.data);
            waterlevel.waterlevel_map.removeLayer(waterlevel.cctv_AllMarker);

        });

    }
}

waterlevel.WaterGate_render_station = function(g){
    var station_id = JH.GetJsonValue(g, "tele_station.id");
    var station_name = JH.GetJsonValue(g, "tele_station.tele_station_name.th");
    var province_code = JH.GetJsonValue(g, "tele_station.geocode.province_code");

    // var watergate_datetime = JH.GetJsonValue(g , "waterlevel_datetime");
    // if ( !moment().isSame(waterlevel_datetime, 'date') ){
    //     // ถ้าข้อมูลไม่ใช่วันปัจจุบัน ใช้สีใน setting
    //     station_link = $(station_link).css('color', srvTHF.GetWaterLevel_NotToday().colorname )[0].outerHTML;
    // }
    return waterlevel.WaterLevel_GraphLink(station_id+"&province="+province_code+"&tab=3", station_name);
}

waterlevel.WaterGate_render_date_in = function(g){
    var date = JH.GetJsonValue(g, "watergate_datetime_in");
    var date_str = date.substring(0,2);
    return date_str;

}

waterlevel.WaterGate_render_time_in = function(g){
    var time = JH.GetJsonValue(g, "watergate_datetime_in");
    var time_str = time.substring(10, 16);
    return time_str;
}

waterlevel.WaterGate_render_watergate_in = function(g){
    return JH.GetJsonValue(g, "watergate_in");
}

waterlevel.WaterGate_render_watergate_out = function(g) {
    return JH.GetJsonValue(g, "watergate_out");
}

waterlevel.WaterGate_render_date_out = function(g){
    var date_out = JH.GetJsonValue(g, "watergate_datetime_out");
    var date_out_str = date_out.substring(0,10);
    return date_out_str;
}

waterlevel.WaterGate_render_time_out = function(g){
    var time_out = JH.GetJsonValue(g, "watergate_datetime_out");
    var time_out_str = time_out.substring(10, 16);
    return time_out_str;
}

waterlevel.WaterGate_render_floodgate = function(g){
    return JH.GetJsonValue(g, "floodgate");
}

waterlevel.WaterGate_render_floodgate_height = function(g){
    return JH.GetJsonValue(g, "floodgate_height");
    // return JH.GetJsonValue(g, "")
}

waterlevel.WaterGate_render_floodgate_open = function(g) {
    return JH.GetJsonValue(g, "floodgate_open");
}

waterlevel.WaterGaate_render_pump = function(g) {
    return JH.GetJsonValue(g, "pump_on");

}
waterlevel.PlayVideoAtStart = function(modal){
    var v = $('#' + modal ).find('.tab-pane.in.active').find('video')[0];
    v.currentTime = 0;
    if (v.paused) {
        v.play();
    }
}
waterlevel.handlerSrvCCTV = function(cctv){
    srvTHF.SetCCTV_Setting(cctv.data);

    if (cctv.result == "OK") {

        //waterlevel.cctv_genMap(cctv.data);
        $('li.tab3').on('click', function(){
            waterlevel.waterlevel_map.removeLayer(waterlevel.WaterLevel_AllMarker);
            waterlevel.waterlevel_map.removeLayer(waterlevel.watergate_AllMarker);
            //alert("tab3");
            waterlevel.cctv_genMap(cctv.data);
            //console.log(cctv);
        });
        // var data = JH.GetJsonValue(cctv , "data");

    // for (i = 0 ; i < data.length ; i++){
    //     var d = data[i];
    //     var _img = IMAGE_URL + JH.GetJsonValue( d , "cctv_url") + "&t=" + JH.GetJsonValue( data[i] , "description");
    //     var html = '<video width="100%"controls>';
    //     html += '<source src="'+ _img +'" type="video/mp4">';
    //     html += '</video>';
    //     $('#div_cctv' + (i+1)).html(html);
    // }
    }
}
/**
*   genarate waterlevel map
*   @param {array} data - array object
*/
waterlevel.WaterLevel_genMap = function(data){
    // if (typeof waterlevel.WaterLevel_AllMarker != "undefined" ){
    //     waterlevel.genMap_clear();
    // }

    waterlevel.WaterLevel_AllMarker = new L.FeatureGroup();
    if ( typeof data != "object" || data == null ){
        return false;
    }
    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var station = JH.GetJsonValue(d , "station");
        var station_lat = JH.GetJsonValue(station , "tele_station_lat");
        var station_long = JH.GetJsonValue(station , "tele_station_long");
        if (station_lat == "" || station_long == ""){ // ไม่มี lag, long ให้ข้าม
            continue;
        }

        var v = JH.GetJsonValue(d , "storage_percent");
        var color = srvTHF.WaterLevel_GetColorName(v);
        var waterlevel_datetime = JH.GetJsonValue(d , "waterlevel_datetime");
        if ( !moment().isSame(waterlevel_datetime, 'date') ){
            // ถ้าข้อมูลไม่ใช่วันปัจจุบัน ใช้สีใน setting
            color = srvTHF.GetWaterLevel_NotToday().colorname;
        }

        if ( color == "" ){ // ไม่มีสี ให้ข้าม
            continue;
        }
        if (waterlevel.waterlevelInit && v != ""){
            // เก็บ cache ที่มีค่า storage_percent ในตอนสร้างแผนที่ waterlevel ครั้งแรก
            waterlevel.waterlevelCache.push(d);
        }

        m = srvTHF.WaterLevel_Marker([station_lat , station_long] , d , color);
        m.bindPopup( waterlevel.WaterLevel_PopupText(d) ).bindTooltip( waterlevel.WaterLevel_TooltipText(d) );
        m.on('popupopen' , function(e){ this.unbindTooltip(); });
        m.on('popupclose' , function(e){ this.bindTooltip( waterlevel.WaterLevel_TooltipText(this.options.properties) ); });
        waterlevel.WaterLevel_AllMarker.addLayer(m);
    }
    waterlevel.waterlevelInit = false;
    waterlevel.WaterLevel_AllMarker.addTo(waterlevel.waterlevel_map);
}

waterlevel.watergate_genMap = function(data){
    // if (typeof waterlevel.watergate_AllMarker != "undefined") {
    //     waterlevel.genMap_clear();

    // }

    waterlevel.watergate_AllMarker = new L.FeatureGroup();
    if (typeof data != "object" || data == null) {
        return false;
    }

    for (i = 0; i < data.length; i++){
        var d = data[i];
        var lat = JH.GetJsonValue(d, "tele_station.tele_station_lat");
        var long = JH.GetJsonValue(d, "tele_station.tele_station_long");

        m = srvTHF.WaterLevel_Marker([lat , long] , d);
        m.bindPopup( waterlevel.WaterGate_PopupText(d) ).bindTooltip( waterlevel.WaterGate_TooltipText(d) );
        m.on('popupopen' , function(e){ this.unbindTooltip(); });
        m.on('popupclose' , function(e){ this.bindTooltip( waterlevel.WaterGate_TooltipText(this.options.properties) ); });
        waterlevel.watergate_AllMarker.addLayer(m);
    }
    waterlevel.waterlevelInit = false;
    waterlevel.watergate_AllMarker.addTo(waterlevel.waterlevel_map);
}

waterlevel.watergate_genMap_onClick = function(data){
    if (typeof waterlevel.watergate_AllMarker_onClick != "undefined") {
        waterlevel.genMap_clear();

    }

    waterlevel.watergate_AllMarker = new L.FeatureGroup();
    if (typeof data != "object" || data == null) {
        return false;
    }

    for (i = 0; i < data.length; i++){
        var d = data[i];
        var lat = JH.GetJsonValue(d, "tele_station.tele_station_lat");
        var long = JH.GetJsonValue(d, "tele_station.tele_station_long");

        m = srvTHF.WaterLevel_Marker([lat , long] , d);
        m.bindPopup( waterlevel.WaterLevel_PopupText(d) ).bindTooltip( waterlevel.WaterLevel_TooltipText(d) );
        m.on('popupopen' , function(e){ this.unbindTooltip(); });
        m.on('popupclose' , function(e){ this.bindTooltip( waterlevel.WaterLevel_TooltipText(this.options.properties) ); });
        waterlevel.watergate_AllMarker.addLayer(m);
    }
    waterlevel.waterlevelInit = false;
    waterlevel.watergate_AllMarker_onClick.addTo(waterlevel.waterlevel_map);
}

waterlevel.cctv_genMap = function(data){
    // if (typeof waterlevel.cctv_AllMarker != "undefined") {
    //     waterlevel.genMap_clear();
    // }

    waterlevel.cctv_AllMarker = new L.FeatureGroup();
    if (typeof data != "object" || data == null) {
        return false;
    }

    $('#desc_click').html("<center><h3>กรุณา คลิก ไอคอนบนแผนที่ เพื่อแสดงข้อมูล</h3></center>");
    for (i = 0; i < data.length; i++){
        var d = data[i];

        var lat = JH.GetJsonValue(d, "lat");
        var long = JH.GetJsonValue(d, "long");
        var type = JH.GetJsonValue(d, "media_type");

        var station = JH.GetJsonValue(d, "title");

        var color = srvTHF.CCTV_GetColorName(type);

        m = srvTHF.CCTV_Marker([lat , long] , d, color);
        m.bindPopup( waterlevel.CCTV_PopupText(d) ).bindTooltip( waterlevel.CCTV_TooltipText(d) );
        m.on('popupopen' , function(e){

           $('#desc_click').html(
                "<center><h3>"+e.target.options.properties.title+"</h3><br/><iframe src='"+e.target.options.properties.cctv_url+"'></iframe><h4>"+e.target.options.properties.description+"</h3></center>"
                // e.target.options.properties.cctv_urls
                );
            this.unbindTooltip();
        });



        //m.on('popupclose' , function(e){ this.bindTooltip( waterlevel.CCTV_TooltipText(this.options.properties) ); });
        waterlevel.cctv_AllMarker.addLayer(m);
    }
    waterlevel.waterlevelInit = false;
    waterlevel.cctv_AllMarker.addTo(waterlevel.waterlevel_map);

}

waterlevel.genMap_clear = function(){
     waterlevel.waterlevel_map.removeLayer(waterlevel.WaterLevel_AllMarker);
     waterlevel.waterlevel_map.removeLayer(waterlevel.watergate_AllMarker);
     waterlevel.waterlevel_map.removeLayer(waterlevel.cctv_AllMarker);
     waterlevel.waterlevel_map.removeLayer(waterlevel.waterlevel_onclick_AllMarker);
}

/**
*   genarate popup text in map
*   @param {object} d - object
*   @return {string} popup text
*/
waterlevel.WaterLevel_PopupText = function(d){
    var station = JH.GetJsonValue(d,"station");
    var geocode = JH.GetJsonValue(d , "geocode");

    var station_id = JH.GetJsonValue(station, "id");
    var station_type = JH.GetJsonValue(d, "station_type");
    var province_code = JH.GetJsonValue(geocode , "province_code");

    var text = waterlevel.WaterLevel_TooltipText(d);
    text += waterlevel.WaterLevel_GraphLink( station_id+"&station_type="+station_type+"&province="+province_code+"&tab=1" , '<i class="fa fa-bar-chart" aria-hidden="true"></i>');
    return text
}

waterlevel.WaterGate_PopupText = function(d){
    var station = JH.GetJsonValue(d, "tele_station.tele_station_name.th");
    var station_id = JH.GetJsonValue(d, "tele_station.id");
    var geocode = JH.GetJsonValue(d, "tele_station.geocode.geocode");
    var province_code = JH.GetJsonValue(d, "tele_station.geocode.province_code");

    var text = waterlevel.WaterGate_TooltipText(d);
    text += waterlevel.WaterLevel_GraphLink(station_id+ "&province="+province_code+"&tab=3", '<i class="fa fa-bar-chart" aria-hidden="true"></i>');
    return text;

}

waterlevel.CCTV_PopupText = function(d){

    var station = JH.GetJsonValue(d, "title");
    // var station_id = JH.GetJsonValue(d, "dam_id");

    // var text = waterlevel.CCTV_TooltipText(d);
    // text += waterlevel.CCTV_GraphLink( station_id+station );
    return station;
}

/**
*   gen tooltip text in map on hover
*   @param {object} d - object
*   @return {string} tolltip text
*/
waterlevel.WaterLevel_TooltipText = function(d){
    var station = JH.GetJsonValue(d , "station");
    var geocode = JH.GetJsonValue(d , "geocode");

    tap = waterlevel.WaterLevel_GetTAP(d);
    if (tap != "") { tap += "<br/>"; }

    var th = waterlevel.WaterLevel_Table.find('th');
    text = th[0].innerText+' : ' + JH.GetJsonLangValue(station , "tele_station_name") + '<br/>';
    text += tap;
    // text += th[2].innerText+' : ' + srvTHF.NumFormat( JH.GetJsonValue(d , "waterlevel_m") ) + '<br/>';
    text += th[2].innerText+' : ' + srvTHF.NumFormat( JH.GetJsonValue(d , "waterlevel_msl") ) + '<br/>';
    text += th[4].innerText+' : ' + srvTHF.WaterLevel_GetSituation( JH.GetJsonValue(d , "storage_percent" ), waterlevel.translator) + '<br/>';
    return text;
}

waterlevel.WaterGate_TooltipText = function(d){
    var station = JH.GetJsonValue(d, "tele_station.tele_station_name.th");
    return station;

}

waterlevel.CCTV_TooltipText = function(d){
    var station = JH.GetJsonValue(d, "title");
    return station;

}

/**
*   waterlevel table add data
*   @param {array} data - array object
*/
waterlevel.WaterLevel_genTable = function(data){
    waterlevel.WaterLevel_DataTable.clear();
    waterlevel.WaterLevel_DataTable.rows.add(data);
    waterlevel.WaterLevel_DataTable.draw();
}

waterlevel.WaterGate_genTable = function(data){
    waterlevel.WaterGate_DataTable.clear();
    waterlevel.WaterGate_DataTable.rows.add(data);
    waterlevel.WaterGate_DataTable.draw();
}

/**
*   gen link to graph
*   @param {string} link - query string ที่ใช้ในการเรียกกราฟ
*   @param {string} text - ข้อคาวมของ ลิ้งค์
*   @return {string} a tag
*/
waterlevel.WaterLevel_GraphLink = function(link , text){
    return waterlevel.Gen_GraphLink(link , text , "กราฟข้อมูลระดับน้ำ" , "modal-waterlevel");
}

waterlevel.CCTV_GraphLink = function(link, text){
    console.log(link);
    //$('#desc_click').html("qqqqqqqqqq");
    //return waterlevel.CCTV_Gen_GraphLink(link , text , waterlevel.translator["waterlevel_graph_title_link"] , "desc_click");
}
