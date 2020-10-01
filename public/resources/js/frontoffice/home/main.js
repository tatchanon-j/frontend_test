/**
*
*   srvMain Object for handler main page
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
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
    srvMain.initMap();
    srvMain.initFilter();
    srvMain.initLoad();

    // click open modal-rain chart
    $(document).on('click' , 'a[data-toggle="modal-rain"]' , function(e){
        e.preventDefault();
        $('#modal-rain').find('iframe').attr( 'src', 'iframe/graph/rain24?station='+$(this).attr('href') );
        $('#modal-rain').modal();
        return false;
    });
    // click open modal-waterlevel chart
    $(document).on('click' , 'a[data-toggle="modal-waterlevel"]' , function(e){
        e.preventDefault();
        $('#modal-rain').find('iframe').attr( 'src', 'iframe/graph/waterlevel?station='+$(this).attr('href') );
        $('#modal-rain').modal();
        return false;
    });
    // click open modal-dam chart
    $(document).on('click' , 'a[data-toggle="modal-dam"]' , function(e){
        e.preventDefault();
        $('#modal-dam').find('iframe').attr( 'src', 'iframe/graph/dam?dam='+$(this).attr('href') );
        $('#modal-dam').modal();
        return false;
    });
    // click open modal-waterquality chart
    $(document).on('click' , 'a[data-toggle="modal-waterquality"]' , function(e){
        e.preventDefault();
        $('#modal-waterquality').find('iframe').attr( 'src', 'iframe/graph/waterquality?station='+$(this).attr('href') );
        $('#modal-waterquality').modal();
        return false;
    });

    // init modal-prerain-carousel carousel
    $('.carousel').carousel({ interval: false});
    // on modal prerain show set carousel
    $('#modal-prerain').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        $(this).find('ul.nav.nav-tabs li:eq('+Number(button.attr('data-tab'))+') a').tab('show');
        $(this).find('.carousel').carousel( Number(button.attr('data-slide-to')) );
    });
    // on modal prewave show set carousel
    $('#modal-prewave').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        $(this).find('.carousel').carousel( Number(button.attr('data-slide-to')) );
    });

    $('#modal-prerain-tmd').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        $('#modal-prerain-tmd-carousel').carousel( Number(button.attr('data-slide-to')) );
    });
    // on modal prerain_animation show auto play video
    $('#modal-prerain_animation').on('shown.bs.modal', function () {
        // แสดงที่ tab 1 ทุกครั้งที่ modal show
        $('#modal-prerain_animation').find('ul.nav.nav-tabs li:eq(0) a').tab('show');
        srvMain.PlayVideoAtStart("modal-prerain_animation");
    });
    // on tab-pane prerain_animation change auto play video
    $('#modal-prerain_animation a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        srvMain.PlayVideoAtStart("modal-prerain_animation");
    });

}
/**
*   set modal play video at start
*   @param {element} modal - modal ที่เล่นวีดีโอ
*/
srvMain.PlayVideoAtStart = function(modal){
    var v = $('#' + modal ).find('.tab-pane.in.active').find('video')[0];
    v.currentTime = 0;
    if (v.paused) {
        v.play();
    }
}

/**
*  Initial variable in srvMain
*/
srvMain.initVar = function(){
    srvMain.service = "thaiwater30/public/thailand_main";

    // marker setup
    srvMain.Marker = function(c){return {fillColor: c, radius: 8, color: "#4c4c4c", weight: 1, opacity: 0.8, fillOpacity: 1, clickable: true}; }
    $('#div_waterlevel_table , #div_waterquality_table').css('max-height', '780px');

    // Data table
    srvMain.Rain_Table = $("#rain_table");
    srvMain.Rain_DataTable = srvMain.Rain_Table.DataTable({
        fixedHeader: true,
        columns:[
            {data: srvMain.Rain_render_name},
            {data: srvMain.Rain_render_location},
            {data: srvMain.Rain_render_time},
            {data: srvMain.Rain_render_rain},
        ],
        order : [ [ 3, 'desc' ] ],
        language:{
            emptyTable: srvMain.translator["rain_empty_table"]
        }
    });

    // Data table
    srvMain.WaterLevel_Table = $('#waterlevel_table');
    srvMain.WaterLevel_DataTable = srvMain.WaterLevel_Table.DataTable({
        fixedHeader: true,
        order: [ [ 1, 'asc' ] ],
        columns: [
            {data: srvMain.WaterLevel_render_basin, width: "0", visible: false,},
            {data: srvMain.WaterLevel_render_basinId, width: "0", visible: false},
            {data: srvMain.WaterLevel_render_name, width: "112px"},
            {data: srvMain.WaterLevel_render_datetime, width: "53px"},
            {data: srvMain.WaterLevel_render_msl, width: "45px"},
            {data: srvMain.WaterLevel_render_storage, width: "82px"},
            {data: srvMain.WaterLevel_render_situation, width: "48px"},
        ],
        drawCallback: function ( settings ) {
            //console.log(settings);

            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last = null;
            var columnCount = srvMain.WaterLevel_Table.find('thead th').length;

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
    srvMain.WaterLevel_Table_OrderBasin_Current = [ 1, 'asc' ]; // เก็บว่าตอนนี้ order basin แบบไหน
    srvMain.WaterLevel_Table_Order_Current = [ ]; // เก็บว่าตอนนี้ order แบบไหน
    // custom order ให้เรียง basin ก่อนแล้วค่อยเรียง ตาม column ทีเลือก
    srvMain.WaterLevel_Table.on( 'click', 'thead th', function () {
        var currentOrder = srvMain.WaterLevel_DataTable.order()[ srvMain.WaterLevel_DataTable.order().length -1 ];
        var Order =  currentOrder[1];
        // เป็นการเปลี่ยน order ครั้งแรกไม่ต้องเช็คค่าเก่า
        if ( srvMain.WaterLevel_Table_Order_Current.length != 0){
            var _preOrder = srvMain.WaterLevel_Table_Order_Current[ srvMain.WaterLevel_Table_Order_Current.length - 1 ];
            if ( _preOrder[0] == currentOrder[0] ){
                // เปลี่ยน order ที่ คอลั่มเดิม
                Order = _preOrder[1] == 'asc' ? 'desc' : 'asc';
            }
        }
        srvMain.WaterLevel_Table_Order_Current = [
            srvMain.WaterLevel_Table_OrderBasin_Current,
            [ currentOrder[0], Order]
        ];
        srvMain.WaterLevel_DataTable.order( srvMain.WaterLevel_Table_Order_Current ).draw();
    } );
    // Order by the grouping
    $('#waterlevel_table tbody').on( 'click', 'tr.gr', function () {
        var currentOrder = srvMain.WaterLevel_DataTable.order()[0];
        if ( currentOrder[0] === 1 && currentOrder[1] === 'asc' ) {
            srvMain.WaterLevel_Table_OrderBasin_Current = [ 1, 'desc' ];
        } else {
            srvMain.WaterLevel_Table_OrderBasin_Current = [ 1, 'asc' ];
        }
        srvMain.WaterLevel_DataTable.order( srvMain.WaterLevel_Table_OrderBasin_Current ).draw();
    } );

    // Data table

    srvMain.Dam_Table = $("#dam_table");
    srvMain.Dam_DataTable = srvMain.Dam_Table.DataTable({
        fixedHeader: true,
        columns:[
            {data: srvMain.Dam_render_name},
            {data: srvMain.Dam_render_inflow},
            {data: srvMain.Dam_render_storage, type: 'dam'},
            {data: srvMain.Dam_render_uses_water, type: 'dam'},
            {data: srvMain.Dam_render_release},
        ],
        // rowCallback : srvMain.Dam_Row_Callback,
        order: [ [0 , 'asc'] ],
    });
    // custom sort
    jQuery.fn.dataTableExt.oSort['dam-asc']  = function(x,y) {
        x = numeral( x.split(" ")[0] ).value();
        y = numeral( y.split(" ")[0] ).value();
        return ((x < y) ? -1 : ((x > y) ?  1 : 0));
    };
    jQuery.fn.dataTableExt.oSort['dam-desc'] = function(x,y) {
        x = numeral( x.split(" ")[0] ).value();
        y = numeral( y.split(" ")[0] ).value();
        return ((x < y) ?  1 : ((x > y) ? -1 : 0));
    };

    // Data table
    srvMain.WaterQuality_Table = $("#waterquality_table");
    srvMain.WaterQuality_DataTable = srvMain.WaterQuality_Table.DataTable({
        fixedHeader: true,
        columns:[
            {data: srvMain.WaterQuality_render_name},
            {data: srvMain.WaterQuality_render_province},
            {data: srvMain.WaterQuality_render_datetime},
            {data: srvMain.WaterQuality_render_salinity},
            {data: srvMain.WaterQuality_render_do},
            {data: srvMain.WaterQuality_render_ph},
            {data: srvMain.WaterQuality_render_turbid},
            {data: srvMain.WaterQuality_render_conductivity},
            {data: srvMain.WaterQuality_render_tds},
            {data: srvMain.WaterQuality_render_chlorophyll},
            {data: srvMain.WaterQuality_render_temp, visible: false},
            {data: srvMain.WaterQuality_render_depth, visible: false},
        ],
        // createdRow: srvMain.WaterQuality_createdRow, ไม่ต้องทำ 26.02.2561
        order: [ [3, 'desc'], [4, 'desc'], [5, 'desc'], [6, 'desc'], [7, 'desc'], [8, 'desc']],
    });
}

/**
*   เก็บ FEATURE_PROVINCE cache ของแมพไว้
*   @param {string} map - แผนที่ของข้อมูลอะไร
*   @param {L.Feature} feature -
*   @param {L.Layer} layer -
*/
srvMain.onEachFeature = function(map, feature, layer){
    if (typeof srvMain.FEATURE_PROVINCE == "undefined"){
        srvMain.FEATURE_PROVINCE = {};
    }
    if (typeof srvMain.FEATURE_PROVINCE[map] == "undefined"){
        srvMain.FEATURE_PROVINCE[map] = [];
    }
    srvMain.FEATURE_PROVINCE[map][feature.properties.prov_code] = layer;
    srvMain.FEATURE_PROVINCE[map][feature.properties.title] = layer;
}

/**
*   เก็บ FEATURE_PROVINCE ของ แผนที่ rain
*   @param {L.Feature} feature -
*   @param {L.Layer} layer -
*/
srvMain.onEachFeature_Rain = function(feature, layer){
    srvMain.onEachFeature("rain" , feature, layer)
}

/**
*   เก็บ FEATURE_PROVINCE ของ แผนที่ waterlevel
*   @param {L.Feature} feature -
*   @param {L.Layer} layer -
*/
srvMain.onEachFeature_WaterLevel = function(feature, layer){
    srvMain.onEachFeature("waterlevel" , feature, layer)
}

/**
*   Initial map in srvMain
*/
srvMain.initMap = function(){
    $('#rain_map').height('700px');
    $('#dam_map').height('650px');
    $('#waterlevel_map').height('750px');
    $('#waterquality_map').height('750px');

    srvMain.GEOJSON_THAILAND_STYLE = {fillOpacity: 0, opacity: 0, interactive: false};
    srvMain.GEOJSON_FOCUS_STYLE = {opacity: 1};

    // init dam map
    srvMain.dam_map = LL.Map('dam_map');

    // init , add province to rain map
    srvMain.rain_map = LL.Map('rain_map');
    L.geoJson(LL.GetGeoJsonThailand() , {style: srvMain.GEOJSON_THAILAND_STYLE,onEachFeature: srvMain.onEachFeature_Rain } ).addTo(srvMain.rain_map);

    // init , add province to waterlevel map
    srvMain.waterlevel_map = LL.Map('waterlevel_map');
    L.geoJson(LL.GetGeoJsonThailand() , {style: srvMain.GEOJSON_THAILAND_STYLE,onEachFeature: srvMain.onEachFeature_WaterLevel } ).addTo(srvMain.waterlevel_map);

    // init waterquality map
    srvMain.waterquality_map = LL.Map('waterquality_map');
}

/**
*   Initial filter in srvMain
*/
srvMain.initFilter = function(){
    // set rain map , reload table when filter province change
    $('#rain_filter_province').on('change' , function(){
        var _code = $(this).val();
        var param = {province_code: _code};
        apiService.GetCachedRequest(srvMain.service+"_rain" , param , function(rs){
            if (rs.result == "OK"){
                srvMain.Rain_genTable(rs.data);
                srvMain.Rain_genMap(rs.data);
                if (_code != ""){
                    if (typeof srvMain.current_rain !== "undefined"){
                        srvMain.current_rain.setStyle(srvMain.GEOJSON_THAILAND_STYLE);
                    }
                    srvMain.current_rain = srvMain.FEATURE_PROVINCE["rain"][_code];
                    srvMain.current_rain.setStyle(srvMain.GEOJSON_FOCUS_STYLE);// change map style
                    srvMain.rain_map.fitBounds(srvMain.current_rain.getBounds());// change map focus
                }else{
                    LL.CenterDefault(srvMain.rain_map);// reset map focus
                    if (typeof srvMain.current_rain !== "undefined"){
                        // reset map style
                        srvMain.current_rain.setStyle(srvMain.GEOJSON_THAILAND_STYLE);
                        delete srvMain.current_rain
                    }
                }
            }
        })
    });

    // waterlevel on change filter province
    $('#waterlevel_filter_province').on('change' , function(){
        var _code = $(this).val();
        var param = {province_code: _code , order: $('#waterlevel_filter_sort').val()};
        if ( _code != "" ) { $('#waterlevel_filter_sort').hide().val("desc"); }
        else { $('#waterlevel_filter_sort').show(); }
        apiService.GetCachedRequest(srvMain.service+"_waterlevel" , param , function(rs){

            if (rs.result == "OK"){
                srvMain.waterlevelInit = true;
                srvMain.waterlevelCache = [];
                srvMain.WaterLevel_genMap(rs.data);
                if (_code != ""){ // รายจังหวัด
                    var data = srvMain.GetWaterLevel20(''); // data 20 แถวแรก (asc,desc)
                    srvMain.WaterLevel_genTable(data);
                    // srvMain.WaterLevel_genTable(rs.data);
                    if (typeof srvMain.current_waterlevel !== "undefined"){
                        srvMain.current_waterlevel.setStyle(srvMain.GEOJSON_THAILAND_STYLE);
                    }
                    srvMain.current_waterlevel = srvMain.FEATURE_PROVINCE["waterlevel"][_code];
                    srvMain.current_waterlevel.setStyle(srvMain.GEOJSON_FOCUS_STYLE);
                    srvMain.waterlevel_map.fitBounds(srvMain.current_waterlevel.getBounds());
                }else{ // ทั้งประเทศ
                    $('#waterlevel_filter_sort').trigger('change');
                    LL.CenterDefault(srvMain.waterlevel_map);// reset map focus
                    if (typeof srvMain.current_waterlevel !== "undefined"){
                        srvMain.current_waterlevel.setStyle(srvMain.GEOJSON_THAILAND_STYLE);
                        delete srvMain.current_waterlevel
                    }
                }
            }
        })
    });
    // waterlevel on change filter sort
    $('#waterlevel_filter_sort').on('change' , function(){
        var v = $('#waterlevel_filter_sort').val();
        var data = srvMain.GetWaterLevel20(v); // data 20 แถวแรก (asc,desc)
        srvMain.WaterLevel_genTable(data);
    });
}

/**
*   Initial load data in srvMain
*/
srvMain.initLoad = function(){
    apiService.SendRequest( "GET", srvMain.service , {} , function(rs){
        srvMain.handlerFilterProvince( JH.GetJsonValue(rs , "province") );
        srvMain.handlerSrvRain( JH.GetJsonValue(rs , "rain") );
        srvMain.handlerSrvRader( JH.GetJsonValue(rs , "radar") );
        srvMain.handlerSrvWaterLevel( JH.GetJsonValue(rs , "waterlevel") );
        srvMain.handlerSrvDam( JH.GetJsonValue(rs , "dam") );
        srvMain.handlerSrvWaterQuality( JH.GetJsonValue(rs , "waterquality") );
        srvMain.handlerSrvStorm( JH.GetJsonValue(rs , "storm") );
        // srvMain.handlerSrvPreRain( JH.GetJsonValue(rs , "pre_rain") );
        srvMain.handlerSrvPreRainTH( JH.GetJsonValue(rs , "pre_rain") );
        srvMain.handlerSrvPreRainSea( JH.GetJsonValue(rs , "pre_rain_sea") );
        srvMain.handlerSrvPreRainAsia( JH.GetJsonValue(rs , "pre_rain_asia") );
        srvMain.handlerSrvPreRainBsin( JH.GetJsonValue(rs, "pre_rain_basin") );
        srvMain.handlerSrvPreRainAnimation( JH.GetJsonValue(rs , "pre_rain_animation") );
        srvMain.handlerSrvWave( JH.GetJsonValue(rs , "wave") );
        srvMain.handlerSrvWaveAnimation( JH.GetJsonValue(rs , "wave_animation") );
        srvMain.handlerSrvWarning( JH.GetJsonValue(rs , "warning") );
        srvMain.handlerCurrentIcon();
        // re enable fixedHeader for fix bug
        $('#body').on('activate.bs.scrollspy', function (e) {
            if ( srvMain.currentDatatable != null ){
                srvMain.currentDatatable.fixedHeader.disable();
            }
            var box = $(e.target).find('a').attr('data-box');
            var currentDatatable = null;
            switch(box){
                case "rain":
                currentDatatable = srvMain.Rain_DataTable;
                break;
                case "waterlevel":
                currentDatatable = srvMain.WaterLevel_DataTable;
                break;
                case "dam":
                currentDatatable = srvMain.Dam_DataTable;
                break;
                case "waterquality":
                currentDatatable = srvMain.WaterQuality_DataTable;
                break;
            }
            if ( currentDatatable ){
                currentDatatable.fixedHeader.enable();
            }
            srvMain.currentDatatable = currentDatatable;
        })
    } );
}

/**
*   Re focus to current icon from #hash
*/
srvMain.handlerCurrentIcon = function(){
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
*   Generate filter province to box-rain,box-waterlevel
*   @param {array} province - array object
*/
srvMain.handlerFilterProvince = function(province){
    if (province.result != "OK"){
        return false;
    }
    var p = province.data;
    // เรียงตามชื่อจังหวัด
    JH.Sort(p, "province_name", false, function(obj){
        return JH.GetLangValue(obj).toLowerCase();
    });
    var rain_filter_province = document.getElementById("rain_filter_province");
    var waterlevel_filter_province = document.getElementById("waterlevel_filter_province");

    // ใส่ option แสดงทั้งหมด ลงไปใน select
    rain_filter_province.add(new Option(srvMain.translator["show_all_filter_province"], ""));
    waterlevel_filter_province.add(new Option(srvMain.translator["show_all_filter_province"], ""));
    for(var i in p) {
        // ใส่ option ลงไปใน select
        rain_filter_province.add(new Option(JH.GetJsonLangValue(p[i], "province_name"), p[i].province_code));
        waterlevel_filter_province.add(new Option(JH.GetJsonLangValue(p[i], "province_name"), p[i].province_code));
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
srvMain.Gen_GraphLink = function(link , text , title , modal, style){
    return '<a href="'+link+'" title="'+title+'" data-toggle="'+modal+'" style="'+ style +'">'+text+'</a>';
}

/**
*   handler service rain
*   @param {object} rs - result จาก service ในส่วนของ rain
*/
srvMain.handlerSrvRain = function(rs){
    srvTHF.SetRain_Setting(rs.setting);
    srvMain.renderBoxRainTable();
    if (rs.data.result == "OK"){
        srvMain.Rain_genTable(rs.data.data);
        srvMain.Rain_genMap(rs.data.data);
    }
}

/**
*   Render scale สีของฝน ที่อยู่ใต้แผนที่
*/
srvMain.renderBoxRainTable = function(){
    var scale = srvTHF.GetRain_Sacle().slice(0);
    scale.reverse();
    var table = $('#box-rain-table');
    var tr = document.createElement('tr');
    table.append(tr);
    for (i = 0 ; i < scale.length ; i++){
        var td = document.createElement('td');
        td.bgColor = JH.GetJsonValue(scale[i] , "color");
        td.innerText = JH.GetJsonValue(scale[i] , "operator") + JH.GetJsonValue(scale[i] , "term");
        tr.appendChild(td);
    }
}

// render rain table
/**
*   render rain station name
*   @param {object} row - object
*   @return {string} station name
*/
srvMain.Rain_render_name = function(row){
    var station_id = JH.GetJsonValue(row, "station.id");
    var province_code = JH.GetJsonValue(row, "geocode.province_code");
    var station_name = JH.GetJsonLangValue(row, "station.tele_station_name");
    var text = srvMain.translator["_agency_name"]  + JH.GetJsonLangValue(row , "agency.agency_name");
    return srvMain.Rain_GraphLink(station_id+"&province="+province_code , station_name ,text);
}

/**
*   render location
*   @param {object} row - object
*   @return {string} location
*/
srvMain.Rain_render_location = function(row){
    var p = JH.GetJsonLangValue(row , "geocode.province_name"); // province
    var a = JH.GetJsonLangValue(row , "geocode.amphoe_name"); // amphoe
    var text = "";
    if (a != "") { text += srvMain.translator["short_amphoe"] + a + " "; }
    if (p != "") { text += srvMain.translator["short_province"] + p + " "; }
    return text;
}

/**
*   render time
*   @param {object} row - object
*   @return {string} time
*/
srvMain.Rain_render_time = function(row){
    var dt = JH.GetJsonValue(row, "rainfall_datetime");
    if ( !dt ){ return "-"; }
    return JH.DateFormat(dt, "YYYY-MM-DD HH:mm");
}

/**
*   render rain
*   @param {object} row - object
*   @return {string} rain
*/
srvMain.Rain_render_rain = function(row){
    var v = JH.GetJsonValue_Float(row, "rain_24h");
    var color = srvTHF.Rain_GetColor(v);
    // color font status
    // return '<font color="'+color+'">'+ numeral( JH.GetJsonValue(row, "rain_24h") ).format('0,0.0') + '</font>';
    return  '<span class="badge" style="background:'+color+';color:#333;">'+ numeral( JH.GetJsonValue(row, "rain_24h") ).format('0,0.0') + '</span>';
}

/**
*   genarate rain table
*   @param {array} data - array object
*/
srvMain.Rain_genTable = function(data){
    srvMain.Rain_DataTable.clear().draw();
    var a = [];
    // ใช้แค่ 20 row แรก
    for (i = 0 ; i < data.length && i < 25 ; i++){
        srvMain.Rain_DataTable.row.add(data[i]);
    }
    srvMain.Rain_DataTable.draw();
}

/**
*   genarate rain map
*   @param {array} data - array object
*/
srvMain.Rain_genMap = function(data){
    if (typeof srvMain.Rain_AllMarker != "undefined" ){
        // ลบ marker บนแผนที่ฝนทั้งหมด
        srvMain.rain_map.removeLayer(srvMain.Rain_AllMarker);
    }
    srvMain.Rain_AllMarker = new L.FeatureGroup();
    if (typeof data != "object" || data == null){
        return false;
    }
    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var station_lat = JH.GetJsonValue(d , "station.tele_station_lat");
        var station_long = JH.GetJsonValue(d , "station.tele_station_long");
        if (station_lat == "" || station_long == ""){ // ไม่มี lag, long
            continue;
        }

        var v = JH.GetJsonValue_Float(d , "rain_24h");
        var color = srvTHF.Rain_GetColorname(v);
        if ( color == "" ){ // ค่าฝนไม่เข้าเกณฑ์
            continue;
        }

        m = srvTHF.Rain_Marker([station_lat , station_long] , d , color);
        m.bindPopup( srvMain.Rain_PopupText(d) ).bindTooltip( srvMain.Rain_TooltipText(d) );
        m.on('popupopen' , function(e){ this.unbindTooltip(); });
        m.on('popupclose' , function(e){ this.bindTooltip( srvMain.Rain_TooltipText(this.options.properties) ); });
        srvMain.Rain_AllMarker.addLayer(m);
    }
    // ใส่ marker ลงไปใน แผนที่ฝน
    srvMain.Rain_AllMarker.addTo(srvMain.rain_map);
}

/**
*   gen popup text in map on click
*   @param {object} d - object
*   @return {string} popup text
*/
srvMain.Rain_PopupText = function(d){
    text = srvMain.Rain_TooltipText(d);
    text += srvMain.Rain_GraphLink(JH.GetJsonValue(d , "station.id")+"&province="+JH.GetJsonValue(d, "geocode.province_code") , '<i class="fa fa-bar-chart" aria-hidden="true"></i>');
    return text
}

/**
*   gen tooltip text in map on hover
*   @param {object} d - object
*   @return {string} tooltip text
*/
srvMain.Rain_TooltipText = function(d){
    var th = srvMain.Rain_Table.find('th');
    var p = JH.GetJsonLangValue(d , "geocode.province_name", true); // province
    var a = JH.GetJsonLangValue(d , "geocode.amphoe_name", true); // amphoe
    var t = JH.GetJsonLangValue(d , "geocode.tumbon_name", true); // tumbon
    var tap = ""; // tumbon amphoe province
    if (t != "") { tap += srvMain.translator["short_tumbon"] + t + " "; }
    if (a != "") { tap += srvMain.translator["short_amphoe"] + a + " "; }
    if (p != "") { tap += srvMain.translator["short_province"] + p + " "; }
    if (tap != "") { tap += "<br/>" ;}

    text = th[0].innerText+' : ' + JH.GetJsonLangValue(d , "station.tele_station_name", true) + '<br/>';
    text += tap ;
    text += th[2].innerText+' : ' + srvMain.Rain_render_time(d) + '<br/>';
    text += th[3].innerText+' : ' + srvMain.Rain_render_rain(d) + 'มม.<br/>';
    text += srvMain.translator["_agency_name"]  + JH.GetJsonLangValue(d , "agency.agency_name", true) + '<br/>';
    return text;
}

/**
*   gen link to graph
*   @param {string} link - query string ที่ใช้ในการเรียกกราฟ
*   @param {string} text - ข้อคาวมของ ลิ้งค์
*   @param {string} textOptional - ข้อคาวมของ ลิ้งค์ เพิ่มเติม
*   @return {string} a tag
*/
srvMain.Rain_GraphLink = function(link , text, textOptional){
    return srvMain.Gen_GraphLink(link , text , srvMain.translator["rain_graph_title_link"] + "\n" + textOptional , "modal-rain");
}

/**
*   handler service radar
*   @param {array} rs - array object
*/
srvMain.handlerSrvRader = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    // console.log("data:",data);
    var modal_img = $('#modal-radar-img');
    var modal_img_2 = $('#modal-radar-img-2');
    var modal_img_div = document.createElement("div");
    var count = 8;
    for (i = 0 ; i < data.length ; i++){
      if(i <= 8 ){
        if (i == 0){
            // ขึ้น row ใหม่ทุกๆ 3 ภาพ
            modal_img_div = document.createElement("div");
            modal_img_div.className = "row";
            modal_img.append(modal_img_div);
        }
        var div = document.createElement("div");
        div.className = "col-sm-4 radarimg";
      }
      else{
         if (i == 9){
            modal_img_div = document.createElement("div");
            modal_img_div.className = "row";
            modal_img_2.append(modal_img_div);
         }

        var div = document.createElement("div");
        div.className = "col-sm-2 radarimg";
      }
        var imgSrc = JH.GetJsonValue( data[i] , "media_path");
        var trumSrc = JH.GetJsonValue( data[i], "media_path_thumb" );

        if ( imgSrc ){
            imgSrc = IMAGE_URL + imgSrc + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
            trumSrc = IMAGE_URL + trumSrc + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        }else{ // ไม่มีภาพ ให้ใช้ภาพ DEFAULT_RADAR
            imgSrc = DEFAULT_RADAR;
        }

        var media_datetime = JH.DateFormat(data[i].media_datetime)
        // console.log("media_datetime:",media_datetime);

        var radar_name = JH.GetJsonValue(srvMain.translator["radar_name"], "radar_" + JH.GetJsonValue(data[i], "radar_type"));

        radar_name = radar_name + "<br>" + media_datetime;


        var a = document.createElement("a");
        a.rel = "radar";
        a.className = "";
        a.href = imgSrc;
        a.dataset.lightbox = "radar";
        a.dataset.title = radar_name;

        var h5 = document.createElement("h5");
        h5.innerHTML = radar_name;

        var image = document.createElement("img");
        image.src = trumSrc;
        image.className = "img-responsive";

        a.appendChild(image);
        div.appendChild(a);
        div.appendChild(h5);
        modal_img_div.appendChild(div);
    }
}


/**
*   handler service water level
*   @param {object} rs - result จาก service ในส่วนของ waterlevel
*/
srvMain.handlerSrvWaterLevel = function(rs){
    srvTHF.SetWaterLevel_Setting(rs.setting);
    srvMain.WaterLevel_genTableScale();
    if (rs.data.result == "OK"){
        srvMain.WaterLevel_Table_Data = rs.data.data;
        srvMain.WaterLevel_genMap(rs.data.data);
        var data = srvMain.GetWaterLevel20('desc');
        srvMain.WaterLevel_genTable(data);
    }
}

/**
*   get waterlevel 20 row order by basin, storage_percent
*   @param {string} sort - ace, desc
*   @return {array} array waterlevel data
*/
srvMain.GetWaterLevel20 = function(sort){
    if (sort == "asc"){
        rev = false;
        data = srvMain.waterlevelCache.slice(-20);
    }else if (sort == "desc"){
        rev = true;
        data = srvMain.waterlevelCache.slice(0,20);
    }else{
        data = srvMain.waterlevelCache;
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
srvMain.WaterLevel_render_basin = function(d){
    var basin_name = JH.GetJsonLangValue(d , "basin.basin_name");
    return basin_name;
}

/**
*   render basin id
*   @param {object} d - object
*   @return {string} basin id
*/
srvMain.WaterLevel_render_basinId = function(d){
    var basin_id = JH.GetJsonLangValue(d , "basin.id");
    return basin_id;
}

/**
*   get tumbon_name amphoe_name province_name
*   @param {object} d - object
*   @return {string} tumbon_name+amphoe_name+province_name
*/
srvMain.WaterLevel_GetTAP = function(d){
    var t = JH.GetJsonLangValue(d , "geocode.tumbon_name"); // tumbon
    var a = JH.GetJsonLangValue(d , "geocode.amphoe_name"); // amphoe
    var p = JH.GetJsonLangValue(d , "geocode.province_name"); // province
    var tap = ""; // tumbon amphoe province
    if (t != "") { tap += srvMain.translator["short_tumbon"] + t + " "; }
    if (a != "") { tap += srvMain.translator["short_amphoe"] + a + " "; }
    if (p != "") { tap += srvMain.translator["short_province"] + p + " "; }
    return tap;
}

/**
*   redner column name
*   @param {object} d - object
*   @return {string} text
*/
srvMain.WaterLevel_render_name = function(d){
    var tap = srvMain.WaterLevel_GetTAP(d);
    var province_code = JH.GetJsonValue(d , "geocode.province_code");
    var station_id = JH.GetJsonValue(d, "station.id");
    var station_type = JH.GetJsonValue(d, "station_type");
    var station_name = JH.GetJsonLangValue(d , "station.tele_station_name");
    var text = srvMain.translator["_agency_name"]  + JH.GetJsonLangValue(d , "agency.agency_name");
    var station_link = srvMain.WaterLevel_GraphLink(station_id+"&station_type="+station_type+"&province="+province_code , station_name + tap,text);
    var waterlevel_datetime = JH.GetJsonValue(d , "waterlevel_datetime");
    if ( !moment().isSame(waterlevel_datetime, 'date') ){
        // ถ้าข้อมูลไม่ใช่วันปัจจุบัน ใช้สีใน setting
        station_link = $(station_link).css('color', srvTHF.GetWaterLevel_NotToday().colorname )[0].outerHTML;
    }
    return station_link;
}

/**
*   render datetime
*   @param {object} d - object
*   @return {string} datetime
*/
srvMain.WaterLevel_render_datetime = function(d){
    var waterlevel_datetime = JH.GetJsonValue(d , "waterlevel_datetime");
    var waterlevel_datetime_text = srvTHF.DateFormat( waterlevel_datetime );
    return waterlevel_datetime_text;
}

/**
*   render waterlevel_msl
*   @param {object} d - object
*   @return {string} waterlevel_msl
*/
srvMain.WaterLevel_render_msl = function(d){
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
srvMain.WaterLevel_render_storage = function(d){
    var storage_percent = JH.GetJsonValue(d , "storage_percent") ;
    var storage_percent_text = srvTHF.NumFormat( storage_percent );
    return storage_percent_text;
}

/**
*   render situation
*   @param {object} d - object
*   @return {string} situation
*/
srvMain.WaterLevel_render_situation = function(d){
    var storage_percent = JH.GetJsonValue(d , "storage_percent") ;
    var water_situation = srvTHF.WaterLevel_GetSituation( storage_percent, srvMain.translator ) ;
    return water_situation;
}

/**
*   genarate table waterlevel scale
*/
srvMain.WaterLevel_genTableScale = function(){
    var table = $('#waterlevel_table_scale');
    var scale = srvTHF.GetWaterLevel_Scale();
    table.empty();
    text = "<td>"+srvMain.translator["waterlevel_scale_text"]+" (ม.รทก.)</td>";
    for (var i = scale.length - 1 ; i >= 0 ; i--){
        var s = scale[i];
        var color = JH.GetJsonValue(s, "color");
        var t = JH.GetJsonValue(s, "text");
        if ( !t ){ continue; }
        text += '<td bgcolor="'+color+'">'+t+'</td>';
    }
    table.append(text);
}

/**
*   genarate waterlevel map
*   @param {array} data - array object
*/
srvMain.WaterLevel_genMap = function(data){
    if (typeof srvMain.WaterLevel_AllMarker != "undefined" ){
        srvMain.waterlevel_map.removeLayer(srvMain.WaterLevel_AllMarker);
    }
    srvMain.WaterLevel_AllMarker = new L.FeatureGroup();
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

        if ( color == "gray" ){ // สีเทา ให้ข้าม
            continue;
        }

        if (srvMain.waterlevelInit && v != ""){
            // เก็บ cache ที่มีค่า storage_percent ในตอนสร้างแผนที่ waterlevel ครั้งแรก
            srvMain.waterlevelCache.push(d);
        }

        m = srvTHF.WaterLevel_Marker([station_lat , station_long] , d , color);
        m.bindPopup( srvMain.WaterLevel_PopupText(d) ).bindTooltip( srvMain.WaterLevel_TooltipText(d) );
        m.on('popupopen' , function(e){ this.unbindTooltip(); });
        m.on('popupclose' , function(e){ this.bindTooltip( srvMain.WaterLevel_TooltipText(this.options.properties) ); });
        srvMain.WaterLevel_AllMarker.addLayer(m);
    }
    srvMain.waterlevelInit = false;
    srvMain.WaterLevel_AllMarker.addTo(srvMain.waterlevel_map);
}

/**
*   genarate popup text in map
*   @param {object} d - object
*   @return {string} popup text
*/
srvMain.WaterLevel_PopupText = function(d){
    var station = JH.GetJsonValue(d,"station");
    var geocode = JH.GetJsonValue(d , "geocode");

    var station_id = JH.GetJsonValue(station, "id");
    var station_type = JH.GetJsonValue(d, "station_type");
    var province_code = JH.GetJsonValue(geocode , "province_code");

    var text = srvMain.WaterLevel_TooltipText(d);
    text += srvMain.WaterLevel_GraphLink( station_id+"&station_type="+station_type+"&province="+province_code  , '<i class="fa fa-bar-chart" aria-hidden="true"></i>');
    return text
}

/**
*   gen tooltip text in map on hover
*   @param {object} d - object
*   @return {string} tolltip text
*/
srvMain.WaterLevel_TooltipText = function(d){
    var station = JH.GetJsonValue(d , "station");
    var geocode = JH.GetJsonValue(d , "geocode");

    tap = srvMain.WaterLevel_GetTAP(d);
    if (tap != "") { tap += "<br/>"; }

    var th = srvMain.WaterLevel_Table.find('th');
    text = th[0].innerText+' : ' + JH.GetJsonLangValue(station , "tele_station_name") + '<br/>';
    text += tap;
    // text += th[2].innerText+' : ' + srvTHF.NumFormat( JH.GetJsonValue(d , "waterlevel_m") ) + '<br/>';
    text += th[2].innerText+' : ' + srvTHF.NumFormat( JH.GetJsonValue(d , "waterlevel_msl") ) + '<br/>';
    text += th[4].innerText+' : ' + srvTHF.WaterLevel_GetSituation( JH.GetJsonValue(d , "storage_percent" ), srvMain.translator) + '<br/>';
    return text;
}

/**
*   waterlevel table add data
*   @param {array} data - array object
*/
srvMain.WaterLevel_genTable = function(data){
    srvMain.WaterLevel_DataTable.clear();
    srvMain.WaterLevel_DataTable.rows.add(data);
    srvMain.WaterLevel_DataTable.draw();
}

/**
*   gen link to graph
*   @param {string} link - query string ที่ใช้ในการเรียกกราฟ
*   @param {string} text - ข้อคาวมของ ลิ้งค์
*   @param {string} textOptional - ข้อคาวมของ ลิ้งค์เพิ่มเติม
*   @return {string} a tag
*/
srvMain.WaterLevel_GraphLink = function(link , text, textOptional){
    return srvMain.Gen_GraphLink(link , text , srvMain.translator["waterlevel_graph_title_link"] + "\n" + textOptional, "modal-waterlevel");
}


/**
*   handler service dam
*   @param {object} rs - result จาก service ในส่วนของ dam
*/
srvMain.handlerSrvDam = function(rs){
    srvTHF.Set("dam" , srvMain.translator["dam"]);
    srvTHF.SetDam_Scale(rs.setting);
    srvMain.Dam_genTableScale();
    if (rs.data.result == "OK"){
        var _d = rs.data.data.slice();
        // เรียงข้อมูลตามวันที่ มากไปน้อย
        JH.Sort(_d, "dam_date", true, moment);
        if ( _d.length == 0){
            $('#dam_max_date').text( JH.DateFormat(null, "YYYY-MM-DD") );
        }else{
            // แสดง่วันที่ล่าสุดของข้อมูล
            $('#dam_max_date').text( JH.DateFormat(_d[0].dam_date, "YYYY-MM-DD") );
        }

        srvMain.Dam_genTable( rs.data.data );
        srvMain.Dam_genMap( rs.data.data );
    }
}

/**
*   สร้าง scale สีของเขื่อน ที่อยู่ใต้แผนที่
*   @param {object} rs - result จาก service ในส่วนของ dam
*/
srvMain.Dam_genTableScale = function(){
    var table = $('#dam_table_scale');
    var scale = srvTHF.GetDam_Scale();
    table.empty();
    text = "<td>"+srvMain.translator["dam_scale_text"]+"</td>";
    for (var i = scale.length - 1 ; i >= 0 ; i--){
        var s = scale[i];
        var color = JH.GetJsonValue(s, "color");
        var t = JH.GetJsonValue(s, "text");
        text += '<td bgcolor="'+color+'">'+t+'</td>';
    }
    table.append(text);
}

/**
*   render dam name
*   @param {object} row - object
*   @return {string} dam name
*/
srvMain.Dam_render_name = function(row){
    var id = JH.GetJsonValue(row["dam"] , "id");
    var text = srvMain.translator["dam"] + JH.GetJsonLangValue(row["dam"] , "dam_name", true).replace("*","");
    return srvMain.Dam_GraphLink(id , text);
}

/**
*   render dam inflow
*   @param {object} row - object
*   @return {string} dam inflow
*/
srvMain.Dam_render_inflow = function(row){
    return srvTHF.NumFormat( JH.GetJsonValue(row,"dam_inflow") );
}

/**
*   render dam storage
*   @param {object} row - object
*   @return {string} dam storage (dam storage percent %)
*/
srvMain.Dam_render_storage = function(row){
    var dam_storage = JH.GetJsonValue(row, "dam_storage");
    dam_storage = numeral( Math.round(dam_storage) ).format('0,0');
    var dam_storage_percent = JH.GetJsonValue(row, "dam_storage_percent");
    dam_storage_percent = Math.round(dam_storage_percent);
    return dam_storage+
    ' (<font color="'+srvTHF.Dam_GetColor(dam_storage_percent)+'">'+dam_storage_percent+'%</font>)';
}

/**
*   render dam uses water
*   @param {object} row - object
*   @return {string} dam uses water (dam uses water percent%)
*/
srvMain.Dam_render_uses_water = function(row){
    var dam_uses_water_percent = JH.GetJsonValue(row, "dam_uses_water_percent");
    dam_uses_water_percent = Math.round(dam_uses_water_percent);
    return srvTHF.NumFormat(JH.GetJsonValue(row, "dam_uses_water"))+' ('+dam_uses_water_percent+'%)';
}

/**
*   render dam released
*   @param {object} row - object
*   @return {string} dam released
*/
srvMain.Dam_render_release = function(row){
    return srvTHF.NumFormat(JH.GetJsonValue(row, "dam_released"));
}

/**
*   genarate dam table
*   @param {array} data - array object
*/
srvMain.Dam_genTable = function(data){
    srvMain.Dam_DataTable.clear();
    srvMain.Dam_DataTable.rows.add(data);
    srvMain.Dam_DataTable.draw();

    srvTHF.Dam_SortData( data );

    var damLowText = srvTHF.GetDam_Low_Text();
    var damHighText = srvTHF.GetDam_High_Text();

    var Dam_low = srvTHF.GetDam_Setting_Low();
    var Dam_high = srvTHF.GetDam_Setting_High();

    damLowText = '<strong><font color="'+ Dam_low["color"] +'">'+ srvMain.translator[Dam_low["trans"]] +'</font> :</strong>' + damLowText;
    damHighText = '<strong><font color="'+ Dam_high["color"] +'">'+ srvMain.translator[Dam_high["trans"]] +'</font> :</strong> ' + damHighText;
    // ข้อความที่อยู่ข้างใต้ แผนที่ เขื่อน
    $('#Dam_text').html( damLowText +"<br/>"+ damHighText);
}

/**
*   genarate dam map
*   @param {array} data - array object
*/
srvMain.Dam_genMap = function(data){
    if (data == null) { return false; }
    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var dam = d["dam"];
        var dam_lat = JH.GetJsonValue(dam , "dam_lat");
        var dam_long = JH.GetJsonValue(dam , "dam_long");
        if (dam_lat == "" && dam_long == ""){
            continue;
        }
        var v = JH.GetJsonValue(d , "dam_storage_percent");

        m = srvTHF.Dam_Marker([dam_lat , dam_long] , d , srvTHF.Dam_GetColorname(v));
        m.addTo(srvMain.dam_map);
        m.bindPopup( srvMain.Dam_PopupText(d) ).bindTooltip( srvMain.Dam_TooltipText(d) );
        m.on('popupopen' , function(e){ this.unbindTooltip(); });
        m.on('popupclose' , function(e){ this.bindTooltip( srvMain.Dam_TooltipText(this.options.properties) ); });
    }
}

/**
*   gen popup text in map
*   @param {object} data - object
*   @return {string} popup text
*/
srvMain.Dam_PopupText = function(d){
    text = srvMain.Dam_TooltipText(d);
    text += srvMain.Dam_GraphLink(JH.GetJsonValue(d["dam"] , "id") , '<i class="fa fa-bar-chart" aria-hidden="true"></i>');
    return text
}

/**
*   gen tooltip text in map
*   @param {object} data - object
*   @return {string} tooltip text
*/
srvMain.Dam_TooltipText = function(d){
    var th = srvMain.Dam_Table.find('th');

    text = th[0].innerText+' : ' + srvMain.Dam_render_name(d) + '<br/>';
    text += th[1].innerText+' : ' + srvMain.Dam_render_inflow(d) + '<br/>';
    text += th[2].innerText+' : ' + srvMain.Dam_render_storage(d) + '<br/>';
    text += th[3].innerText+' : ' + srvMain.Dam_render_uses_water(d) + '<br/>';
    text += th[4].innerText+' : ' + srvMain.Dam_render_release(d) + '<br/>';
    return text;
}

/**
*   gen link to grpah
*   @param {string} link - query string
*   @param {string} text - ข้อความของ ลิ้งค์
*   @return {string} a tag
*/
srvMain.Dam_GraphLink = function(link , text){
    return srvMain.Gen_GraphLink(link , text , srvMain.translator["dam_graph_title_link"] , "modal-dam");
}


/**
*   handler service waterquality
*   @param {object} rs - result จาก service ในส่วนของ dam
*/
srvMain.handlerSrvWaterQuality = function(rs){
    srvTHF.SetWaterQuality_Setting(rs.setting);
    if (rs.data.result == "OK"){
        srvMain.WaterQuality_genTable( JH.GetJsonValue(rs.data,"data") );
        srvMain.WaterQuality_genMap( JH.GetJsonValue(rs.data,"data") );
    }
}

/**
*   genarate waterquality table
*   @param {array} data - array object
*/
srvMain.WaterQuality_genTable = function(data){
    srvMain.WaterQuality_DataTable.clear();
    srvMain.WaterQuality_DataTable.rows.add(data);
    srvMain.WaterQuality_DataTable.draw();
}

/**
*   render waterquality station name
*   @param {object} row - object
*   @return {string} waterquality station name
*/
srvMain.WaterQuality_render_name = function(row){
    var text = JH.GetJsonLangValue( row , "waterquality_station.waterquality_station_name").replace("สถานี" , "");
    var id = JH.GetJsonValue( JH.GetJsonValue(row, "waterquality_station"), "id")
    var style = "";
    if ( !moment().isSame(JH.GetJsonValue(row, "waterquality_datetime"), 'date') ){
        // ถ้าข้อมูลไม่ใช่วันปัจจุบัน ใช้สีใน setting
        style = "color: " + srvTHF.GetWaterQuality_not_today().color ;
    }
    var textAgency = srvMain.translator["_agency_name"]  + JH.GetJsonLangValue(row , "waterquality_station.agency_name");

    return srvMain.WaterQuality_GraphLink(id+"&province="+JH.GetJsonValue(row["waterquality_station"], "province_code") , text, style,textAgency);
}

/**
*   render province name
*   @param {object} row - object
*   @return {string} province name
*/
srvMain.WaterQuality_render_province = function(row){
    return JH.GetJsonLangValue( JH.GetJsonValue(row, "waterquality_station"), "province_name");
}

/**
*   render datetime
*   @param {object} row - object
*   @return {string} datetime
*/
srvMain.WaterQuality_render_datetime = function(row){
    return srvTHF.DateFormat( JH.GetJsonValue(row, "waterquality_datetime") );
}

/**
*   render ph
*   @param {object} row - object
*   @return {string} ph
*/
srvMain.WaterQuality_render_ph = function(row){
    var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_ph") );
    var color = "";
    if (text != "") { color = srvTHF.WaterQuality_GetColor_ph(JH.GetJsonValue_Float(row, "waterquality_ph") )}
    return '<font color="'+color+'">' + text + '</font>';
}

/**
*   render salinity
*   @param {object} row - object
*   @return {string} salinity
*/
srvMain.WaterQuality_render_salinity = function(row){
    var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_salinity") );
    var color = "";
    if (text != "") { color = srvTHF.WaterQuality_GetColor_salinity(JH.GetJsonValue_Float(row, "waterquality_salinity") )}
    return '<font color="'+color+'">' + text + '</font>';
}

/**
*   render turbid
*   @param {object} row - object
*   @return {string} turbid
*/
srvMain.WaterQuality_render_turbid = function(row){
    var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_turbid") );
    var color = "";
    if (text != "") { color = srvTHF.WaterQuality_GetColor_turbid(JH.GetJsonValue_Float(row, "waterquality_turbid") )}
    return '<font color="'+color+'">' + text + '</font>';
}

/**
*   render ec
*   @param {object} row - object
*   @return {string} ec
*/
srvMain.WaterQuality_render_conductivity = function(row){
    return srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_conductivity") );
}

/**
*   render tds
*   @param {object} row - object
*   @return {string} tds
*/
srvMain.WaterQuality_render_tds = function(row){
    var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_tds") );
    var color = "";
    if (text != "") { color = srvTHF.WaterQuality_GetColor_tds(JH.GetJsonValue_Float(row, "waterquality_tds") )}
    return '<font color="'+color+'">' + text + '</font>';
}

/**
*   render chlorophyll
*   @param {object} row - object
*   @return {string} chlorophyll
*/
srvMain.WaterQuality_render_chlorophyll = function(row){
    return srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_chlorophyll") );
}

/**
*   render do
*   @param {object} row - object
*   @return {string} do
*/
srvMain.WaterQuality_render_do = function(row){
    var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_do") );
    var color = "";
    if (text != "") { color = srvTHF.WaterQuality_GetColor_do(JH.GetJsonValue_Float(row, "waterquality_do") )}
    return '<font color="'+color+'">' + text + '</font>';
}

/**
*   render temp
*   @param {object} row - object
*   @return {string} temp
*/
srvMain.WaterQuality_render_temp = function(row){
    return srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_temp") );
}

/**
*   render depth
*   @param {object} row - object
*   @return {string} depth
*/
srvMain.WaterQuality_render_depth = function(row){
    return srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_depth") );
}

/**
*   water quality หลังจากสร้าง tr
*   @param {int} row - แถวที่
*   @param {object} data - object
*/
srvMain.WaterQuality_createdRow = function ( row, data ) {
    var ph = JH.GetJsonValue(data, "waterquality_ph");
    var salinity = JH.GetJsonValue(data, "waterquality_salinity");
    var turbid = JH.GetJsonValue(data, "waterquality_turbid");
    var ec = JH.GetJsonValue(data, "waterquality_ec");
    var tds = JH.GetJsonValue(data, "waterquality_tds");
    var chlorophyll = JH.GetJsonValue(data, "waterquality_chlorophyll");
    var _do = JH.GetJsonValue(data, "waterquality_do");
    var temp = JH.GetJsonValue(data, "waterquality_temp");
    if ( !ph && !salinity && !turbid && !ec && !tds && !chlorophyll && !_do && !temp){
        // เช็คถ้าทุกค่าเป็น null ให้ ลบ แถวนี้ทิ้ง
        srvMain.WaterQuality_DataTable.row(row).remove().draw( false );
    }
}

/**
*   genarate waterquality map
*   @param {array} data - array object
*/
srvMain.WaterQuality_genMap = function(data){
    if (data == null) { return false; }
    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var station = JH.GetJsonValue(d , "waterquality_station");
        var station_lat = JH.GetJsonValue(station , "waterquality_station_lat");
        var station_long = JH.GetJsonValue(station , "waterquality_station_long");
        if (station_lat == "" || station_long == ""){ continue; }
        var color = srvTHF.WaterQuality_GetMarkerColor(d);
        if ( color == srvTHF.GetWaterQuality_Default().color ){
            color = srvTHF.GetWaterQuality_Default().colorname;
        }
        if ( !moment().isSame(JH.GetJsonValue(d, "waterquality_datetime"), 'date') ){
            // ถ้าข้อมูลไม่ใช่วันปัจจุบัน ใช้สีใน setting
            color = srvTHF.GetWaterQuality_not_today().colorname ;
        }
        m = srvTHF.WaterQuality_Marker([station_lat , station_long] , d , color);
        m.addTo(srvMain.waterquality_map);
        m.bindPopup( srvMain.WaterQuality_PopupText(d) ).bindTooltip( srvMain.WaterQuality_TooltipText(d) );
        m.on('popupopen' , function(e){ this.unbindTooltip(); });
        m.on('popupclose' , function(e){ this.bindTooltip( srvMain.WaterQuality_TooltipText(this.options.properties) ); });
    }
}

/**
*   genarate popup text in map
*   @param {object} d - object
*   @return {string} popup text
*/
srvMain.WaterQuality_PopupText = function(d){
    text = srvMain.WaterQuality_TooltipText(d);
    text += srvMain.WaterQuality_GraphLink(
        JH.GetJsonValue(
            JH.GetJsonValue(d, "waterquality_station"), "id"
        )+
        "&province="+JH.GetJsonValue(d["waterquality_station"], "province_code") ,
        '<i class="fa fa-bar-chart" aria-hidden="true"></i>'
    );
    return text
}

/**
*   genarate tooltip text in map
*   @param {object} d - object
*   @return {string} tooltip text
*/
srvMain.WaterQuality_TooltipText = function(d){
    var th = srvMain.WaterQuality_Table.find('th');
    var station = JH.GetJsonValue(d, "waterquality_station");
    var default_empty = '<font color=""></font>';
    var default_empty_red = '<font color="red"></font>';

    var p = JH.GetJsonLangValue(station, "province_name"); // province
    var a = JH.GetJsonLangValue(station, "amphoe_name"); // amphoe
    var t = JH.GetJsonLangValue(station, "tumbon_name"); // tumbon
    var tap = ""; // tumbon amphoe province
    if (t != "") { tap += srvMain.translator["short_tumbon"] + t + " ";}
    if (a != "") { tap += srvMain.translator["short_amphoe"] + a + " ";}
    if (p != "") { tap += srvMain.translator["short_province"] + p + " ";}
    tap += "<br/>";


    var salinity = srvMain.WaterQuality_render_salinity(d);
    if (salinity != default_empty) { salinity = th[3].innerText + " : " + salinity + '<br/>' ; }
    var strdo = srvMain.WaterQuality_render_do(d);
    if (strdo != default_empty){ strdo = th[4].innerText + " : " +  strdo + '<br/>' ; }var ph = srvMain.WaterQuality_render_ph(d);
    if (ph != default_empty){ ph = th[5].innerText + " : " + ph + '<br/>' ; }
    var turbid = srvMain.WaterQuality_render_turbid(d);
    if (turbid != default_empty){ turbid = th[6].innerText + " : " + turbid + '<br/>' ; }
    var ec = srvMain.WaterQuality_render_conductivity(d);
    if (ec != ""){ ec = th[7].innerText + " : " +  ec + '<br/>' ; }
    var tds = srvMain.WaterQuality_render_tds(d);
    if (tds != default_empty){ tds = th[8].innerText + " : " + tds + '<br/>' ; }
    var chlorophyll = srvMain.WaterQuality_render_chlorophyll(d);
    if (chlorophyll != ""){ chlorophyll = th[9].innerText + " : " + chlorophyll + '<br/>' ; }
    // var temp = srvMain.WaterQuality_render_temp(d);
    // if (temp != ""){ temp = th[10].innerText + " : " +  temp + '<br/>' ; }
    // var depth = srvMain.WaterQuality_render_depth(d);
    // if (depth != ""){ depth = th[11].innerText + " : " + depth + '<br/>' ; }


    text = th[0].innerText + ' : ' + JH.GetJsonLangValue( station , "waterquality_station_name" ).replace("สถานี","") + '<br/>';
    text += tap;
    text += salinity ;
    text += strdo;
    text += ph ;
    text += turbid;
    text += ec;
    text += tds;
    text += chlorophyll;
    // text += temp;
    // text += depth;
    text += srvMain.translator["_agency_name"]  + JH.GetJsonLangValue(station , "agency_name") + '<br/>';
    return text;
}

/**
*   gen link to graph
*   @param {string} link - query string ที่ใช้ในการเรียกกราฟ
*   @param {string} text - ข้อคาวมของ ลิ้งค์
*   @param {string} style - style ที่ต้องการเพิ่ม
*   @param {string} textOptional - ข้อคาวมของ ลิ้งค์เพิ่มเติม
*   @return {string} a tag
*/
srvMain.WaterQuality_GraphLink = function(link , text, style, textOptional){
    return srvMain.Gen_GraphLink(link , text , srvMain.translator["waterquality_graph_title_link"] + "\n" + textOptional, "modal-waterquality", style);
}


/**
*   handler service storm
*   @param {object} rs - result จาก service ในส่วนของ storm
*/
srvMain.handlerSrvStorm = function(rs){
    srvTHF.SetStorm_Setting( JH.GetJsonValue(rs , "setting") );
    srvTHF.renderModalStormTable();
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var dataCollege = JH.GetJsonValue(data, "college");
    // dataCollege ภาพพายุด้านซ้าย
    for (i = 0 ; i < dataCollege.length ; i++){
        var name = JH.GetJsonValue( dataCollege[i] , "filename");
        if ( name == "" ){ continue; }
        if ( $('#box-storm-img-' + name[0] ).length != 1  ){ continue;  }
        // ใส่ภาพลง div ที่เตรียมไว้ตามชื่อไฟล์
        var image = document.createElement("img");
        image.src = IMAGE_URL + JH.GetJsonValue( dataCollege[i] , "media_path");
        image.className  = "img-responsive center-block";
        $('#box-storm-img-' + name[0] ).append(image);
    }
    var source = JH.GetJsonValue(data, "us");
    var sourceName = srvMain.translator['box-storm-img-us-source'];
    var s1 = JH.GetJsonValue(data, "typhoon");
    var s2 = JH.GetJsonValue(data, "kochi");
    if (s1) {
        source = s1;
        sourceName = srvMain.translator['box-storm-img-typhoon-source'];
    }
    if (s2) {
        source = s2;
        sourceName = srvMain.translator['box-storm-img-himawari-source'];
    }
    // source ภาพพายุด้านขวา
    for (i = 0 ; i < source.length ; i++){
        var name = JH.GetJsonValue( source[i] , "filename");
        if ( name == "" ){ continue; }
        var image = document.createElement("img");
        image.src = IMAGE_URL + JH.GetJsonValue( source[i] , "media_path");
        image.className  = "img-responsive center-block";
        $('#box-storm-img-himawari').append(image);
    }
    $('#box-storm-img-source').text(sourceName);
}


/**
*   handler service pre_rain
*   @param {object} rs - result จาก service ในส่วนของ pre_rain
*/
srvMain.handlerSrvPreRain = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var div_img = $('#box-predict_rain-img');
    var boxPreRain , divClassName;
    var modal_img = $('#modal-prerain-carousel');
    var carIndi = $('#modal-prerain-carousel').find('ol.carousel-indicators');
    var carInner = $('#modal-prerain-carousel').find('div.carousel-inner');

    if(data.length == 0){
      modal_img.find('a').hide()
      modal_img.find('h6').text(srvMain.translator['no_data']);
      return false
    }else{
      modal_img.find('a').show()
    }

    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var filename = JH.GetJsonValue(d, "filename");
        var aHref = JH.GetJsonValue( data[i] , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var imgSrc = "", imgInModal = "";
        var image = document.createElement("img");
        var hasArea = false;
        var Active = i == 0 ? 'active' : '';
        if (filename.search("d03")+1){ // ชื่อไฟล์มีคำว่า d03
            // ใช้ภาพใหญ่ ปรับกว้าง 320px
            boxPreRain = $('#box-predict_rain-img1');
            imgSrc = JH.GetJsonValue( data[i] , "media_path");
            imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
            image.style.width = "320px";
            // ภาพบน modal-prerain-carousel ใช้ ภาพใหญ่ map-area-3
            imgInModal = '<div class="item '+Active+'"> <img class="center-block" usemap="#map-area-3" src="'+IMAGE_URL + aHref+'" > </div>';
        }else{
            // ใชภาพ thumb
            boxPreRain = $('#box-predict_rain-img2');
            imgSrc = JH.GetJsonValue( data[i] , "media_path_thumb");
            imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
            // ภาพบน modal-prerain-carousel ใช้ ภาพใหญ่ map-area-9
            imgInModal = '<div class="item"> <img class="center-block" usemap="#map-area-9" src="'+IMAGE_URL + aHref+'" > </div>';
        }

        var a = document.createElement("a");
        a.rel = "predict_rain";
        a.className = "col-md-4 fancybox img-thumbnail";
        a.href = "javascript:void(0);";

        image.src = IMAGE_URL + imgSrc;
        image.dataset.toggle = "modal";
        image.dataset.target = "#modal-prerain";
        image.dataset.slideTo = i;

        a.appendChild(image);
        boxPreRain.append(a);
        // ใส่ภาพ carousel ลง modal-prerain
        carIndi.append('<li data-target="#modal-prerain-carousel" data-slide-to="'+i+'" class="'+Active+'"></li>');
        carInner.append(imgInModal);
    }
    carInner.find('img').maphilight();
}
/**
*   handler service pre_rain thailand
*   @param {object} rs - result จาก service ในส่วนของ pre_rain
*/
srvMain.handlerSrvPreRainTH = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var div_img = $('#box-predict_rain-img');
    var boxPreRain , divClassName;
    var modal_img = $('#modal-prerain-carousel');
    var carIndi = modal_img.find('ol.carousel-indicators');
    var carInner = modal_img.find('div.carousel-inner');

    if(data.length == 0){
      modal_img.find('a').hide()
      modal_img.find('h6').text(srvMain.translator['no_data']);
      return false
    }else{
      modal_img.find('a').show()
    }

    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var filename = JH.GetJsonValue(d, "filename");
        var aHref = JH.GetJsonValue( data[i] , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var imgSrc = "", imgInModal = "";
        var image = document.createElement("img");
        var hasArea = false;
        var Active = i == 0 ? 'active' : '';

        // ใช้ภาพใหญ่ ปรับกว้าง 320px
        boxPreRain = $('#box-predict_rain-img1');
        imgSrc = JH.GetJsonValue( data[i] , "media_path_thumb");
        imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");

        image.style.width = "381px";
        // ภาพบน modal-prerain-carousel ใช้ ภาพใหญ่ map-area-3
        imgInModal = '<div class="item '+Active+'"> <img class="center-block" usemap="#map-area-3" src="'+IMAGE_URL + aHref+'" > </div>';


        var a = document.createElement("a");
        a.rel = "predict_rain";
        a.className = "col-md-4 fancybox";
        a.href = "javascript:void(0);";

        image.src = IMAGE_URL + aHref;
        image.dataset.toggle = "modal";
        image.dataset.target = "#modal-prerain";
        image.dataset.slideTo = i;
        image.dataset.tab = 0;
        image.className = "img-responsive img-thumbnail";

        a.appendChild(image);
        boxPreRain.append(a);
        // ใส่ภาพ carousel ลง modal-prerain
        carIndi.append('<li data-target="#modal-prerain-carousel" data-slide-to="'+i+'" class="'+Active+'"></li>');
        carInner.append(imgInModal);
    }
    carInner.find('img').maphilight();
}

/**
*   handler service pre_rain sea
*   @param {object} rs - result จาก service ในส่วนของ pre_rain_sea
*/
srvMain.handlerSrvPreRainSea = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var div_img = $('#box-predict_rain-img');
    var boxPreRain , divClassName;
    var modal_img = $('#modal-prerain-sea-carousel');
    var carIndi = modal_img.find('ol.carousel-indicators');
    var carInner = modal_img.find('div.carousel-inner');

    if(data.length == 0){
      modal_img.find('a').hide()
      modal_img.find('h6').text(srvMain.translator['no_data']);
      return false
    }else{
      modal_img.find('a').show()
    }

    showImg = ["d02_day04.jpg", "d02_day05.jpg", "d02_day06.jpg", "d02_day07.jpg"];

    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var filename = JH.GetJsonValue(d, "filename");
        var aHref = JH.GetJsonValue( data[i] , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var imgSrc = "", imgInModal = "";
        var image = document.createElement("img");
        var hasArea = false;
        var Active = i == 0 ? 'active' : '';

        // ใชภาพ thumb
        boxPreRain = $('#box-predict_rain-img2');
        imgSrc = JH.GetJsonValue( data[i] , "media_path_thumb");
        imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        // ภาพบน modal-prerain-carousel ใช้ ภาพใหญ่ map-area-9
        imgInModal = '<div class="item '+Active+'"> <img class="center-block" usemap="#map-area-9" src="'+IMAGE_URL + aHref+'" > </div>';

        var a = document.createElement("a");
        a.rel = "predict_rain";
        a.className = "col-md-3 fancybox text-center";
        a.href = "javascript:void(0);";

        image.style.width = "80%";
        image.style.marginTop = "15px";
        image.src = IMAGE_URL + imgSrc;
        image.dataset.toggle = "modal";
        image.dataset.target = "#modal-prerain";
        image.dataset.slideTo = i;
        image.dataset.tab = 1;
        image.className = "img-responsive img-thumbnail";

        a.appendChild(image);
        // ต้องแสดงในหน้าจอ
        if ( showImg.indexOf( filename ) > -1 ){
            boxPreRain.append(a);
        }

        // ใส่ภาพ carousel ลง modal-prerain
        carIndi.append('<li data-target="#modal-prerain-sea-carousel" data-slide-to="'+i+'" class="'+Active+'"></li>');
        carInner.append(imgInModal);
    }
    carInner.find('img').maphilight();
}


/**
*   handler service pre_rain_southeast-asia
*   @param {object} rs - result จาก service ในส่วนของ pre_rain_southeast-asia
*/
srvMain.handlerSrvPreRainSoutheastAsia = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var div_img = $('#box-predict_rain-img');
    var boxPreRain , divClassName;
    var modal_img = $('#modal-prerain-southeast-asia-carousel');
    var carIndi = $('#modal-prerain-southeast-asia-carousel').find('ol.carousel-indicators');
    var carInner = $('#modal-prerain-southeast-asia-carousel').find('div.carousel-inner');

    if(data.length == 0){
      modal_img.find('a').hide()
      modal_img.find('h6').text(srvMain.translator['no_data']);
      return false
    }else{
      modal_img.find('a').show()
    }

    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var filename = JH.GetJsonValue(d, "filename");
        var aHref = JH.GetJsonValue( data[i] , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var imgSrc = "", imgInModal = "";
        var image = document.createElement("img");
        var hasArea = false;
        var Active = i == 0 ? 'active' : '';

        // ใช้ภาพใหญ่ ปรับกว้าง 320px
        boxPreRain = $('#box-predict_rain-img1');
        imgSrc = JH.GetJsonValue( data[i] , "media_path");
        imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        // ภาพบน modal-prerain-southeast-asia-carousel ใช้ ภาพใหญ่ map-area-3
        imgInModal = '<div class="item '+Active+'"> <img class="center-block" usemap="#map-area-9" src="'+IMAGE_URL + aHref+'" > </div>';
        // ใส่ภาพ carousel ลง modal-prerain
        carIndi.append('<li data-target="#modal-prerain-carousel" data-slide-to="'+i+'" class="'+Active+'"></li>');
        carInner.append(imgInModal);
    }
    carInner.find('img').maphilight();
}



/**
*   handler service pre_rain_asia
*   @param {object} rs - result จาก service ในส่วนของ pre_rain_asia
*/
srvMain.handlerSrvPreRainAsia = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var div_img = $('#box-predict_rain-img');
    var boxPreRain , divClassName;
    var modal_img = $('#modal-prerain-asia-carousel');
    var carIndi = modal_img.find('ol.carousel-indicators');
    var carInner = modal_img.find('div.carousel-inner');

    if(data.length == 0){
      modal_img.find('a').hide()
      modal_img.find('h6').text(srvMain.translator['no_data']);
      return false
    }else{
      modal_img.find('a').show()
    }

    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var filename = JH.GetJsonValue(d, "filename");
        var aHref = JH.GetJsonValue( data[i] , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var imgSrc = "", imgInModal = "";
        var image = document.createElement("img");
        var hasArea = false;
        var Active = i == 0 ? 'active' : '';

        // ใช้ภาพใหญ่ ปรับกว้าง 320px
        boxPreRain = $('#box-predict_rain-img1');
        imgSrc = JH.GetJsonValue( data[i] , "media_path");
        imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        // ภาพบน modal-prerain-asia-carousel ใช้ ภาพใหญ่ map-area-3
        imgInModal = '<div class="item '+Active+'"> <img class="center-block" usemap="#map-are-27" src="'+IMAGE_URL + aHref+'" > </div>';

        // ใส่ภาพ carousel ลง modal-prerain
        carIndi.append('<li data-target="#modal-prerain-carousel" data-slide-to="'+i+'" class="'+Active+'"></li>');
        carInner.append(imgInModal);
    }
    carInner.find('img').maphilight();
}


/**
*   handler service pre_rain_basin
*   @param {object} rs - result จาก service ในส่วนของ pre_rain_basin
*/
srvMain.handlerSrvPreRainBsin = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var div_img = $('#box-predict_rain-img');
    var boxPreRain , divClassName;
    var modal_img = $('#modal-prerain-basin-carousel');
    var carIndi = modal_img.find('ol.carousel-indicators');
    var carInner = modal_img.find('div.carousel-inner');

    if(data.length == 0){
      modal_img.find('a').hide()
      modal_img.find('h6').text(srvMain.translator['no_data']);
      return false
    }else{
      modal_img.find('a').show()
    }

    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var filename = JH.GetJsonValue(d, "filename");
        var aHref = JH.GetJsonValue( data[i] , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var imgSrc = "", imgInModal = "";
        var image = document.createElement("img");
        var hasArea = false;
        var Active = i == 0 ? 'active' : '';

        // ใช้ภาพใหญ่ ปรับกว้าง 320px
        boxPreRain = $('#box-predict_rain-img1');
        imgSrc = JH.GetJsonValue( data[i] , "media_path");
        imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");

        // ภาพบน modal-prerain-basin-carousel ใช้ ภาพใหญ่ map-area-3
        imgInModal = '<div class="item '+Active+'"> <img class="center-block" usemap="#map-area-basin" src="'+IMAGE_URL + aHref+'" > </div>';

        carIndi.append('<li data-target="#modal-prerain-carousel" data-slide-to="'+i+'" class="'+Active+'"></li>');
        carInner.append(imgInModal);
    }
    carInner.find('img').maphilight();
}


/**
*   handler service pre_rain_animation
*   @param {object} rs - result จาก service ในส่วนของ pre_rain_animation
*/
srvMain.handlerSrvPreRainAnimation = function(rs){
    if (rs.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data");
    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var _img = IMAGE_URL + JH.GetJsonValue( d , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var html = '<video width="100%"controls>';
        html += '<source src="'+ _img +'" type="video/mp4">';
        html += '</video>';
        $('#animation_0' + (i+1)).html(html);
    }
}


/**
*   handler service wave
*   @param {object} rs - result จาก service ในส่วนของ wave
*/
srvMain.handlerSrvWave = function(rs){
    if (rs.data.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    var div_img = $('#box-predict_wave-img');
    var box , divClassName;
    var carIndi = $('#modal-prewave-carousel').find('ol.carousel-indicators');
    var carInner = $('#modal-prewave-carousel').find('div.carousel-inner');
    for (i = 0 ; i < data.length ; i++){
        var d = data[i];
        var filename = JH.GetJsonValue(d, "filename");
        var aHref = JH.GetJsonValue( data[i] , "media_path") + "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
        var imgSrc = "", imgInModal = "";
        var image = document.createElement("img");
        var Active = i == 0 ? 'active' : '';

        if ( i <= 2){
            // ใช้ภาพใหญ่ ปรับกว้าง 320px
            var a = document.createElement("a");

            box = $('#box-predict_wave-img1');
            imgSrc = JH.GetJsonValue( data[i] , "media_path");
            imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
            image.style.width = "320px";
            // ภาพบน modal-prewave-carousel
            imgInModal = '<div class="item '+Active+'"> <img class="center-block" src="'+IMAGE_URL + aHref+'" > </div>';
        }else{
            // ใชภาพ thumb

            box = $('#box-predict_wave-img2');
            imgSrc = JH.GetJsonValue( data[i] , "media_path");
            imgSrc += "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
            // ภาพบน modal-prewave-carousel
            imgInModal = '<div class="item"> <img class="center-block" src="'+IMAGE_URL + aHref+'" > </div>';
        }

        var a = document.createElement("a");
        a.rel = "predict_wave";
        a.className = "fancybox";
        a.href = "javascript:void(0);";


        image.src = IMAGE_URL + imgSrc;
        image.dataset.toggle = "modal";
        image.dataset.target = "#modal-prewave";
        image.dataset.slideTo = i;
        image.className = "img-thumbnail";

        a.appendChild(image);
        box.append(a);
        // ใส่ภาพ carousel ลง modal-prewave
        carIndi.append('<li data-target="#modal-prewave-carousel" data-slide-to="'+i+'" class="'+Active+'"></li>');
        carInner.append(imgInModal);
    }
}


/**
*   handler service wave_animation
*   @param {object} rs - result จาก service ในส่วนของ wave_animation
*/
srvMain.handlerSrvWaveAnimation = function(rs){
    if (rs.result != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data");
    var body = $('#box-prewave_animation').find('.box-body');
    for (i = 0 ; i < data.length ; i++){
        // console.log('data[i]',data[i])
        // show .gif
        if (i == 0) {
            var image = document.createElement("img");
            image.className = "img-responsive";
            image.src = IMAGE_URL +
            JH.GetJsonValue( data[i] , "media_path") +
            "&t=" + JH.GetJsonValue( data[i] , "media_datetime");
            body.append(image);
        }
    }
}


/**
*   handler service warnign
*   @param {object} rs - result จาก service ในส่วนของ warnign
*/
srvMain.handlerSrvWarning = function(rs){
    var warning_setting = JH.GetJsonValue(rs , "setting");
    srvTHF.SetWarning_Setting( warning_setting );

    srvMain.handlerWarningRain(JH.GetJsonValue(rs, "temp_data"));
    srvMain.handlerWarningPreRain(JH.GetJsonValue(rs, "temp_data2"));
    WarningBoxRiskRain();
    WarningBoxRiskDrought(JH.GetJsonValue(rs, "drought"));
    WarningBoxRiskFlood(JH.GetJsonValue(rs, "flood"));
    warning_provinceHandler();
    
}

/**
*   คำนวณฝนเหมือนหน้า ภาพรวมประเทศไทย
*   @param {object} rs - result จาก service ในส่วนของ temp_data
*/
srvMain.handlerWarningRain = function(rs){
    if (JH.GetJsonValue(rs, "result") == "OK"){
        var data = JH.GetJsonValue(rs, "data");
        for (i = 0 ; i < data.length ; i++){
            var d = data[i];

            var rain24h = JH.GetJsonValue_Float(d , "rain");
            var rain1h = JH.GetJsonValue_Float(d , "rain1h");
            var zone = JH.GetJsonValue(d , "warning_zone");
            if (zone == ""){ continue; }
            var level24h = srvTHF.Rain_GetRuleLevel(zone , rain24h , "rain24h" ) ;
            var level1h = srvTHF.Rain_GetRuleLevel(zone , rain1h , "rain1h" ) ;
            var v = Math.max( level24h , level1h );

            // cache province level
            var province = JH.GetJsonLangValue(d , "province_name");
            rain_cacheProvinceLevel( province , v );
        }
    }
}

/**
*   cache rain province ที่ level มากที่สุด
*   @param {string} province - province name
*   @param {int} v - level
*/
var rain_cacheProvinceLevel = function(province , v){
    if (arguments.length == 0) { return JH.GetJsonValue(srvMain , "cache.rain_province"); }
    if (typeof srvMain["cache"]["rain_province"] == "undefined"){
        srvMain["cache"]["rain_province"] = {};
    }
    var max = Math.max( v , JH.GetJsonValue_Float(srvMain , "cache.rain_province." + province ));
    srvMain["cache"]["rain_province"][province] = max;
}

/**
*   คำนวณคาดการณ์ฝนเหมือนหน้า ภาพรวมประเทศไทย
*   @param {object} rs - result จาก service ในส่วนของ temp_data2
*/
srvMain.handlerWarningPreRain = function(rs){
    if ( JH.GetJsonValue(rs , "result") != "OK" ){ return false; }
    var data = JH.GetJsonValue(rs , "data");
    for (i = 0 ; i < data.length ; i ++){
        var d = data[i];
        var province_name = JH.GetJsonLangValue(d , "province_name");
        prerain_cache(province_name);
    }
}

/**
*   cache prerain province
*   @param {string} text - province name
*   @return {array} array province name
*/
var prerain_cache = function(text){
    if (arguments.length == 0) { return JH.GetJsonValue(srvMain , "cache.prerain_province"); }
    if (typeof srvMain["cache"]["prerain_province"] == "undefined"){
        srvMain["cache"]["prerain_province"] = [];
    }
    srvMain["cache"]["prerain_province"].push(text);
}

/**
*   generate risk rain
*/
var WarningBoxRiskRain = function(){
    var rain = rain_cacheProvinceLevel();
    var prerain = prerain_cache();
    var text = "";
    for (i = 0 ; i < prerain.length ; i++){
        var d = prerain[i];
        if (JH.GetJsonValue_Int(rain, d) != 0){
            if ( text != "" ){
                text += ",";
            }
            text += d;
        }
    }

    $('#box-risk-rain').append(text);
}

/**
*   generate risk drought
*   @param {object} rs - result จาก service ในส่วนของ drought
*/
var WarningBoxRiskDrought = function(rs){
    if ( JH.GetJsonValue(rs , "result") != "OK" ){ return false; }
    var drought = JH.GetJsonValue(rs , "data");
    var text = "";
    for (i = 0 ; i < drought.length ; i++){
        var d = drought[i];
        if ( i != 0 ){
            text += ", ";
        }
        text += JH.GetJsonLangValue(d,"province_name");
    }
    $('#box-risk-drought').append(text);
}

/**
*   generate risk flood
*   @param {object} rs - result จาก service ในส่วนของ flood
*/
var WarningBoxRiskFlood = function(rs){
    if ( JH.GetJsonValue(rs , "result") != "OK" ){ return false; }
    var flood = JH.GetJsonValue(rs , "data");
    var text = "";
    for (i = 0 ; i < flood.length ; i++){
        var d = flood[i];
        if ( i != 0 ){
            text += ", ";
        }
        text += JH.GetJsonLangValue(d,"province_name");
    }    

    $('#box-risk-flood').append(text);
}


/**
 *  by Peerapong 20/08/2018
*   get warning province from api http://portal.disaster.go.th/portal/wsjson?queryCode=DPM010&user=xws-0010&password=xws0010
*   @return warning province text
*/
var warning_provinceHandler = function() {
    var host = srvMain.service;
    var disasterUrl = host.replace('thaiwater30/public/thailand_main','') + 'proxy.php?url=http%3A%2F%2Fportal.disaster.go.th%2Fportal%2Fwsjson%3FqueryCode%3DDPM010%26user%3Dxws-0010%26password%3Dxws0010';
    var data = '-ss-';
    // load data and render
    $.ajax({
        type: "GET",
        crossDomain: true,
        url: disasterUrl,
        dataType: "json",
        success: warning_provinceFilter,
        error:function(err){
          console.log('Connection to disaster.go.th fail');
        }
    });
    return data;
  }
  
  /**
   * 
   * @method text json
   * @return text warning_data
   */
  var warning_provinceFilter = function(json) {
  
      var warning_data = [];
      var data_list = json.contents.rows;
  
      if(data_list.length > 0){
          $.each(data_list, function( i, v ) {
              var province_id =  v.PROVINCE_ID; 
              var province =  v.PROVINCE_NAME; 
              var status= v.STATUS_NAME;
  
              if(status == 'เกิดเหตุการณ์'){
                  warning_data[v.TAMBOL_ID] = v;
              }
          });
      }
  
    // reset array key warning_data
    warning_data = warning_data.filter(function(){return true;});
  
    return warning_provinceShowLabel(warning_data);
  }
  
  /**
   * fetch list warning
   * @method arry warning_data
   * @return text warning_label
   */
  var warning_provinceShowLabel = function(warning_data) {
    var list = '<ol>';
    if(warning_data.length>0){
      $.each(warning_data, function( index, v ) {
        list += '<li>ตำบล' + v.TAMBOL_NAME + ' อำเภอ' + v.AMPHUR_NAME + ' จังหวัด' + v.PROVINCE_NAME + '</li>';
      });
    }else{
      list += '--';
    }

    list += '</ol>';
    
    $('#box-risk-rain').html(list);
  }