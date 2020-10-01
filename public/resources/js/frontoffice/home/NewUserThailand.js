/**
*
*   srvTH Object for handler index page
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvTH = {
    cache: {}
};

/**
*   Initial srvMain
*   @param {string} _host - web url
*   @param {string} _img_path - image url
*/
srvTH.Init = function(_host, _img_path ){
    var self = srvTH;
    self.SERVICE = "thaiwater30/public/thailand"; // url service
    self._HOST_ = _host;
    self._IMG_PATH = _img_path;
    self._MAIN_PAGE_ = _host + '/main';
    self.IntervalTime = 125; // ปุ่ม arrowUp, down ตอนกดค้างจะ ทำงานทุกๆ 125 ms
    self.currentRow = null;
    self.isNormalSituation = {};
    var anHoureBefore = moment().add(-1, 'hours').startOf('hour'); // วันเวลาปัจจุบัน -1 ชั่วโมง ที่ .00
    self.DATE = JH.DateFormat(anHoureBefore, 'DD MMM YYYY'); // วันที่ anHoureBefore
    self.DATE_TIME = JH.DateFormat(anHoureBefore) + ( JH.GetLang() == 'th' ? ' น.' : ''); // วันเวลาของ anHoureBefore
    self.TIME = JH.DateFormat(anHoureBefore, 'hh:mm') + ( JH.GetLang() == 'th' ? ' น.' : '');

    // default thailand polygon style
    self.GEOJSON_THAILAND_STYLE = {
        fillOpacity: 1, opacity: 0.5, fillColor: 'white' , color: 'black' , weight: 1 , interactive: false,
        onEachFeature: self.GEOJSON_THAILAND_onEachFeature,
    };
    // default เส้นของ river
    self.GEOJSON_RIVER_MAIN_STYLE = {weight: 1, clickable:false, };
    // default สีของ polygon
    self.GEOJSON_FILL_STYLE = {fillOpacity: 0.8,  opacity: 0,};
    // default ขอบ ของ polygon
    self.GEOJSON_BORDER_STYLE = {fillOpacity: 0, opacity: 1, dashArray: '3',};

    self.fillStyle = function(options){
        return $.extend({}, self.GEOJSON_FILL_STYLE, options);
    }
    self.borderStyle = function(options){
        return $.extend({}, self.GEOJSON_BORDER_STYLE, options);
    }

    self.initMap();
    self.initControlMap();
    self.initEvent();
}

/**
*   Initial map in srvTH
*/
srvTH.initMap = function(){
    self = srvTH;

    map = LL.Map('map', {zoomControl: false});
    JH.Get('LL.tileLayer').setOpacity(0.3);
    self.map = map;

    // disable event map
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    // add geojson to map
    _geoJson =  L.geoJson(LL.GetGeoJsonThailand() , self.GEOJSON_THAILAND_STYLE );
    _geoJson.addTo(map);

    // add river to map
    _geoJson =  L.geoJson(GEOJSON_RIVER_MAIN , self.GEOJSON_RIVER_MAIN_STYLE  );
    _geoJson.addTo(map);
    
    map.fitBounds(_geoJson.getBounds());
}

/**
*   Initial control map
*/
srvTH.initControlMap = function(){
    var self = srvTH;
    var map = self.map;

    // logo
    var control_topleft_logo = L.control({ position : "topleft" });
    control_topleft_logo.onAdd = function(){
        var div_logo = L.DomUtil.create('div' , 'logo');
        // div_logo.innerHTML = '<img src="'+srvTH._HOST_+srvTH._IMG_PATH+'NHC_logo_color.png?v=1464561387" class="logo img-responsive">'

        // change to new logo
        div_logo.innerHTML = '<img src="'+srvTH._HOST_+srvTH._IMG_PATH+'logo.png?v=1464561387" class="logo img-responsive">'
        return div_logo
    }
    control_topleft_logo.addTo(map)

    // ข้อความ + วันที่ ขวาบน ของหน้าจอ
    var control_topright = L.control({position : "topright"});
    control_topright.onAdd = function(){
        var div = L.DomUtil.create('div', 'info legend');
        //div.innerHTML = TRANSLATOR["info_legend"];
        div.innerHTML = '<h2>สถานการณ์น้ำ</h2><h3 style="margin-top:-20px;" class="text-center">ประเทศไทย</h3>';
        div_date = L.DomUtil.create('div' , 'btn-primary-index text-center info date ');

        div.appendChild(div_date);

        return div;
    };
    control_topright.addTo(map);

     // powered by nhc
    var control_bottomleft = L.control({position : "bottomleft"});
    control_bottomleft.onAdd = function(){
        var div = L.DomUtil.create('div' , '');
        var img = '<img src="'+srvTH._HOST_+srvTH._IMG_PATH+'home/NHC-logo-40.png?v=1464561387">';
        //div.innerHTML = '<a href="'+self._MAIN_PAGE_+'">'+img+'</a>'
        div.innerHTML = '<a href="'+self._MAIN_PAGE_+'" class="b">'+img+' คลังข้อูลน้ำและภูมิอากาศแห่งชาติ  </a>'
        return div
    }
    control_bottomleft.addTo(map);

    // ปุ่ม entersite
    var control_bottomright = L.control({position : "bottomright"});
    control_bottomright.onAdd = function(){
        var div = L.DomUtil.create('div' , '');
        var img = '<img src="'+srvTH._HOST_+srvTH._IMG_PATH+'home/entersite.gif?v=1464561387" class=" img-responsive" style="height:34px;width:120px;">';
        div.innerHTML = '';//<a href="'+self._MAIN_PAGE_+'">'+img+'</a>'

        return div
    }
    control_bottomright.addTo(map);

    // info
    var div = document.getElementById('info');
    var divLeft = document.createElement('div');
    divLeft.className = "col-md-6 ";
    var divRight = document.createElement('div');
    divRight.className = "col-md-6 ";

    // load data and render
    apiService.SendRequest("GET" , srvTH.SERVICE , {} , function(rs){
        srvTH.handlerProvince( JH.GetJsonValue(rs , "province") );
        srvTH.handlerDate();

        srvTH.handlerRain( JH.GetJsonValue(rs , "rain") );
        srvTH.handlerWaterLevel( JH.GetJsonValue(rs , "waterlevel") );
        srvTH.handlerDam( JH.GetJsonValue(rs , "dam") );
        srvTH.handlerWaterQuality( JH.GetJsonValue(rs , "waterquality") );
        srvTH.handlerStorm( JH.GetJsonValue(rs , "storm") );
        srvTH.handlerPreRain( JH.GetJsonValue(rs , "pre_rain") );
        srvTH.handlerWave( JH.GetJsonValue(rs , "wave") );
        srvTH.handlerWarning( JH.GetJsonValue(rs , "warning") );

        divLeft.appendChild( control_topleft_icon_rain() );
        divLeft.appendChild( control_topleft_icon_waterlevel() );
        divLeft.appendChild( control_topleft_icon_dam() );
        divLeft.appendChild( control_topleft_icon_waterquality( ) );

        divRight.appendChild( control_topleft_icon_storm() );
        divRight.appendChild( control_topleft_icon_clock() );
        divRight.appendChild( control_topleft_icon_wave() );
        divRight.appendChild( control_topleft_icon_warnning() );

        // สถานการณ์ ทั้ง 8 อัน ปกติ ให้้ขึ้น สถานการณ์ปกติ ตรงกลาง
        if ( Object.keys(srvTH.isNormalSituation).length != 8){
            $(div).find('div.normalsituation').remove();
            div.appendChild(divLeft);
            div.appendChild(divRight);

            // show arrow down
            $('#info').find('.control-box').each(function(){
                var controlBox = $(this);
                var controlBody = controlBox.find('.control-body');
                var controlDiv = controlBody.find('div');

                var controlBodyHeight = controlBody.height();
                var controlDivHeight = controlDiv.height();

                if (controlDivHeight > controlBodyHeight){
                    controlBox.find('.control-arrow').addClass('hasDown');
                }
            });
        }else{
            $(div).find('div.normalsituation').addClass('active');
        }
    });
}

/*
*   Initial event arrow click, hold
*/
srvTH.initEvent = function(){
    // event arrow down click,hold
    $('#info').on('mousedown', '.control-arrow .fa-angle-up', function(){
        e = this;
        srvTH["cache"]["interval"] = setInterval(function(){
            arrowUpClick(e);
        }, srvTH["IntervalTime"]);
        arrowUpClick(this);
    })
    .on('mouseup mouseleave', '.control-arrow .fa-angle-up', function(){
        if (srvTH["cache"]["interval"]){
            clearInterval(srvTH["cache"]["interval"]);
            srvTH["cache"]["interval"] = null;
        }
    });
    // event arrow down click,hold
    $('#info').on('mousedown', '.control-arrow .fa-angle-down', function(){
        e = this;
        srvTH["cache"]["interval"] = setInterval(function(){
            arrowDownClick(e);
        }, srvTH["IntervalTime"]);
        arrowDownClick(this);
    })
    .on('mouseup mouseleave', '.control-arrow .fa-angle-down', function(){
        if (srvTH["cache"]["interval"]){
            clearInterval(srvTH["cache"]["interval"]);
            srvTH["cache"]["interval"] = null;
        }
    });
}

/**
*   Default geojson thailand on each feature
*   @param {l.feature} feature -
*   @param {l.layer} layer -
*/
srvTH.GEOJSON_THAILAND_onEachFeature = function(feature , layer){
    var self = srvTH;
    self._onEachFeature("province",feature , layer);
}

/**
*   On each feature function
*   @param {string} map - ชื่อของข้อมุล
*   @param {l.feature} feature -
*   @param {l.layer} layer -
*/
srvTH._onEachFeature = function(map , feature, layer){
    var self = srvTH;
    if (typeof self.FEATURE_PROVINCE == "undefined"){
        self.FEATURE_PROVINCE = {};
    }
    if (typeof self.FEATURE_PROVINCE[map] == "undefined"){
        self.FEATURE_PROVINCE[map] = [];
    }
    // cache polygon province ไว้สำหรับเปลี่ยนสี
    self.FEATURE_PROVINCE[map][feature.properties.prov_code] = layer;
    self.FEATURE_PROVINCE[map][feature.properties.title] = layer;
}

/**
*   Render current date
*/
srvTH.handlerDate = function(){
    // แสดงวันปัจจุบัน
    $('div.info.date').html(srvTH.DATE);
}

/**
*   handler service province
*   @param {object} rs - result จาก service ในส่วนของ province
*/
srvTH.handlerProvince = function(rs){
    if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data");
    for ( var i = 0 ; i < data.length ; i++){
        var d = data[i];
        province_cache( JH.GetJsonValue(d , "province_code") , d);
    }
}

/**
*   get, set province cache
*   @param {string} province_code - province code
*   @param {mix} o - value
*   @return cache.province
*/
var province_cache = function(province_code , o){
    if ( arguments.length == 0 ) { return JH.GetJsonValue( srvTH , "cache.province") ;}
    if (typeof srvTH["cache"]["province"] == "undefined"){
        srvTH["cache"]["province"] = {};
    }
    srvTH["cache"]["province"][province_code] = o;
}

/**
*   create label with class
*   @param {string} text - ข้อความ
*   @param {string} level - label class
*   @return {string} span class label
*/
var Label = function(text , level){
    if (typeof level === "undefined"){
        return Label(text , 'title');
    }
    return '<span class="label label-'+level+'">'+text+'</span>'
}

/**
*   create label with background-color
*   @param {string} text - ข้อความ
*   @param {string} color - สี
*   @return {string} span class label
*/
var LabelBg = function(text , color){
    return '<span class="label" style="background-color:'+color+'">'+text+'</span>'
}

/**
*   handler service rain
*   @param {object} rs - result จาก service ในส่วนของ rain
*/
srvTH.handlerRain = function(rs){
    srvTHF.SetRain_Setting( JH.GetJsonValue(rs , "setting") );
    srvTHF.renderModalRainTable();
    srvTH["cache"]["rain_province_date"] = JH.GetJsonValue(rs , "date");
    if (JH.GetJsonValue(rs, "data.result") == "OK"){
        var data = JH.GetJsonValue(rs, "data.data");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            // gen marker on map
            var station_lat = JH.GetJsonValue(d , "station.tele_station_lat");
            var station_long = JH.GetJsonValue(d , "station.tele_station_long");
            var rain24h = JH.GetJsonValue_Float(d , "rain_24h");
            var rain1h = JH.GetJsonValue_Float(d , "rain_1h");
            var color = srvTHF.Rain_GetColorname(rain24h);

            var zone = JH.GetJsonValue(d , "geocode.warning_zone");
            if (zone == ""){ continue; }
            var level24h = srvTHF.Rain_GetRuleLevel(zone , rain24h , "rain24h" ) ;
            var level1h = srvTHF.Rain_GetRuleLevel(zone , rain1h , "rain1h" ) ;
            var v = Math.max( level24h , level1h );

            if ( v != 0 && station_lat != "" && station_long != "" ){
                var level_color = srvTHF.Rain_GetLevelColor(v);
                if ( JH.GetJsonValue(level_color, "colorname") == "") { continue; }
                // add to map
                var m = srvTHF.Rain_Marker([station_lat , station_long] , d , JH.GetJsonValue(level_color, "colorname"));
                srvTH.map.addLayer(m);
            }

            // cache province level
            var province = JH.GetJsonLangValue(d , "geocode.province_name");
            rain_cacheProvinceLevel( province , v );
        }
    }
}

/**
*   generate control-box-rain
*/
var control_topleft_icon_rain = function(){
    var headDate = rain_head_text();
    var bodyText = rain_body_text();

    return controlBoxRain( headDate , bodyText );
};

/**
*   get, set rain cache province level
*   @param {string} province - province
*   @param {mix} v - value
*   @return cache.rain_province
*/
var rain_cacheProvinceLevel = function(province , v){
    if (arguments.length == 0) { return JH.GetJsonValue(srvTH , "cache.rain_province"); }
    if (typeof srvTH["cache"]["rain_province"] == "undefined"){
        srvTH["cache"]["rain_province"] = {};
    }
    var max = Math.max( v , JH.GetJsonValue_Float(srvTH , "cache.rain_province." + province ));
    srvTH["cache"]["rain_province"][province] = max;
}

/**
*   get rain head text from cache.rain_province
*   @return rain head text
*/
var rain_head_text = function(){
    return srvTH.DATE_TIME;
}

/**
*   get rain body text from cache.rain_province
*   @return rain body text
*/
var rain_body_text = function(){
    var o = {};
    var text = "";
    var provinces = rain_cacheProvinceLevel();
    for (var province in provinces){
        var level = provinces[ province ];
        if ( level <= 1 ){ continue; }
        var level_color = srvTHF.Rain_GetLevelColor(level);
        if ( typeof o[level] === "undefined"){ o[level] = ""; }
        o[level] += LabelBg(province , level_color.color);
    }
    for (var i in o){
        text += '<b>' + TRANSLATOR[ srvTHF.Rain_GetLevelColor(i)["trans"] ]+ ' : </b>' + o[i] + "<br/>" ;
    }
    if (text == "") {
        text = TRANSLATOR["normal"];
        srvTH.isNormalSituation["rain"] = true;
    }

    return text;
}

/**
*   handler service waterlevel
*   @param {object} rs - result จาก service ในส่วนของ waterlevel
*/
srvTH.handlerWaterLevel = function(rs){
    srvTHF.SetWaterLevel_Setting( JH.GetJsonValue(rs , "setting") );
    srvTHF.renderModalWaterlevelTable();
    srvTH["cache"]["waterlevel_date"] = JH.GetJsonValue(rs , "date");
    if ( JH.GetJsonValue(rs , "data.result") == "OK" ){
        var data = JH.GetJsonValue( rs , "data.data");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var station = JH.GetJsonValue(d , "station");
            var station_lat = JH.GetJsonValue(station , "tele_station_lat");
            var station_long = JH.GetJsonValue(station , "tele_station_long");

            var storage_percent = JH.GetJsonValue(d , "storage_percent");
            var level = srvTHF.WaterLevel_GetRulelevel(storage_percent);
            if (level == ""){ continue; }
            var province_name = JH.GetJsonLangValue(d , "geocode.province_name");
            waterlevel_cacheProvinceLevel( province_name , level );

            var color = srvTHF.WaterLevel_GetlevelColorName(level);
            if ( color != "" && station_lat != "" && station_long != ""){
                m = srvTHF.WaterLevel_Marker([station_lat , station_long] , d , color);
                srvTH.map.addLayer(m);
            }
        }
    }
}

/**
*   get, set waterlevel cache province level
*   @param {string} province - province
*   @param {mix} v - value
*   @return cache.waterlevel_province
*/
var waterlevel_cacheProvinceLevel = function(province , v){
    if (arguments.length == 0) { return JH.GetJsonValue(srvTH , "cache.waterlevel_province"); }
    if (typeof srvTH["cache"]["waterlevel_province"] == "undefined"){
        srvTH["cache"]["waterlevel_province"] = {};
    }
    // เก็บค่ามากสุดของแต่ละจังหวัด
    var max = Math.max( v , JH.GetJsonValue_Float(srvTH , "cache.waterlevel_province." + province ));
    srvTH["cache"]["waterlevel_province"][province] = max;
}

/**
*   generate control-box-Waterlevel
*/
var control_topleft_icon_waterlevel = function(){

    var headDate = waterlevel_head_text();
    var bodyText = waterlevel_body_text();

    return controlBoxWaterlevel( headDate , bodyText );
};

/**
*   get waterlevel head text from cache.waterlevel_date
*   @return waterlevel head text
*/
var waterlevel_head_text = function(){
    return srvTH.DATE_TIME;
}

/**
*   get waterlevel body text from waterlevel_cacheProvinceLevel
*   @return waterlevel body text
*/
var waterlevel_body_text = function(){
    var o = {};
    var text = "";
    var provinces = waterlevel_cacheProvinceLevel();
    for (var province in provinces){
        var level = provinces[ province ];
        var level_color = srvTHF.WaterLevel_GetlevelColor(level);
        if ( typeof o[level] === "undefined"){ o[level] = ""; }
        o[level] += LabelBg(province, level_color);
    }
    for (var i in o){
        text += '<b>' + TRANSLATOR[ srvTHF.GetWaterLevel_Level()[i]["trans"] ]+ ' : </b>' + o[i] + "<br/>" ;
    }

    if (text == "") {
        text = TRANSLATOR["normal"];
        srvTH.isNormalSituation["waterlevel"] = true;
    }
    return text;
}

/**
*   handler service dam
*   @param {object} rs - result จาก service ในส่วนของ dam
*/
srvTH.handlerDam = function(rs){
    srvTHF.SetDam_Scale(rs.setting);
    srvTHF.renderModalDamTable();
    srvTH["cache"]["dam_date"] = JH.GetJsonValue(rs , "date");
    if (rs.data.result == "OK"){
        srvTHF.Dam_SortData( rs.data.data );
        srvTH.renderMarkerDam();
    }
}

/**
*   genarate dam marker into map
*/
srvTH.renderMarkerDam = function(){
    var Dam_Low = srvTHF.Dam_Low;
    var Dam_High = srvTHF.Dam_High;
    for (var i = 0 ; i < Dam_Low.length ; i++){
        var d = Dam_Low[i];
        var dam = d["dam"];
        var dam_lat = JH.GetJsonValue(dam , "dam_lat");
        var dam_long = JH.GetJsonValue(dam , "dam_long");
        if (dam_lat == "" && dam_long == ""){
            continue;
        }
        var v = JH.GetJsonValue(d , "dam_uses_water_percent");
        m = srvTHF.Dam_Marker([dam_lat , dam_long] , d , srvTHF.Dam_GetColorname(v));
        m.addTo(srvTH.map);
    }
    for (var i = 0 ; i < Dam_High.length ; i++){
        var d = Dam_High[i];
        var dam = d["dam"];
        var dam_lat = JH.GetJsonValue(dam , "dam_lat");
        var dam_long = JH.GetJsonValue(dam , "dam_long");
        if (dam_lat == "" && dam_long == ""){
            continue;
        }
        var v = JH.GetJsonValue(d , "dam_storage_percent");
        m = srvTHF.Dam_Marker([dam_lat , dam_long] , d , srvTHF.Dam_GetColorname(v));
        m.addTo(srvTH.map);
    }
}

/**
*   generate control-box-dam
*   @return {controlBox}
*/
var control_topleft_icon_dam = function(){
    var headDate = dam_head_text();
    var bodyText = dam_body_text();

    return controlBoxDam( headDate , bodyText );
};

/**
*   get box-dam head text
*   @return {string} box-dam head text
*/
var dam_head_text = function(){
    return srvTH.DATE;
}

/**
*   get box-dam body text
*   @return {string} box-dam body text
*/
var dam_body_text = function(){
    var text = "";
    var Dam_Low_Text = srvTHF.GetDam_Low_Text();
    var Dam_Low = srvTHF.GetDam_Setting_Low();
    var _low = "";
    if (Dam_Low_Text != ""){
        _low = '<font color="'+ Dam_Low["color"] +'">'+ TRANSLATOR[Dam_Low["trans"]] +'</font>';
        text += _low + ' : ' + Dam_Low_Text;
    }

    var Dam_High_Text = srvTHF.GetDam_High_Text();
    var Dam_High = srvTHF.GetDam_Setting_High();
    var _high = "";
    if (Dam_High_Text != ""){
        _high = '<font color="'+ Dam_High["color"] +'">'+ TRANSLATOR[Dam_High["trans"]] +'</font>';
        if ( Dam_Low_Text != ""){
            text += '<br/>';
        }
        text += _high + ' : ' + Dam_High_Text;
    }

    if ( Dam_Low_Text == "" && Dam_High_Text == "" ){
        text = TRANSLATOR["normal"];
        srvTH.isNormalSituation["dam"] = true;
    }
    return text;
}

/**
*   handler service waterquality
*   @param {object} rs - result ในส่วนของ waterquality
*/
srvTH.handlerWaterQuality = function(rs){
    srvTHF.SetWaterQuality_Setting( JH.GetJsonValue(rs, "setting") );
    srvTHF.renderModalWaterqualityTable();
    srvTH["cache"]["waterquality_date"] = JH.GetJsonValue( rs , "date");
    if ( JH.GetJsonValue(rs , "data.result") == "OK" ){
        var data = JH.GetJsonValue(rs , "data.data");

        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var station = JH.GetJsonValue(d , "waterquality_station");
            var station_lat = JH.GetJsonValue(station , "waterquality_station_lat");
            var station_long = JH.GetJsonValue(station , "waterquality_station_long");
            var station_id = JH.GetJsonValue(station , "id");

            var salinity_do = {
                waterquality_salinity: JH.GetJsonValue(d, "waterquality_salinity"),
                waterquality_do: JH.GetJsonValue(d, "waterquality_do")
            };
            if (station_lat == "" || station_long == ""){ continue; }
            var color = srvTHF.WaterQuality_GetMarkerColor(salinity_do);
            // salinity & do ปกติ
            if ( color == srvTHF.GetWaterQuality_Default().color ){ continue; }
            // salinity | do ไม่เข้าเกณฑ์มาตรฐาน
            var sanility = JH.GetJsonValue_Float(d, "waterquality_salinity");
            var sanility_color = srvTHF.WaterQuality_GetColor_salinity(sanility);
            if ( sanility_color != srvTHF.GetWaterQuality_Default().color ){ waterquality_cache(d, "salinity"); }
            // waterquality_do
            var _do = JH.GetJsonValue_Float(d, "waterquality_do");
            var _do_color = srvTHF.WaterQuality_GetColor_do(_do);
            if ( _do_color != srvTHF.GetWaterQuality_Default().color ){ waterquality_cache(d, "do"); }

            m = srvTHF.WaterQuality_Marker([station_lat , station_long] , d , color);
            srvTH.map.addLayer(m);
        }
    }
}

/**
*   generate control-box-Waterquality
*   @return {controlBox}
*/
var control_topleft_icon_waterquality = function(){

    var headDate = waterquality_head_text();
    var bodyText = waterquality_body_text();

    return controlBoxWaterquality( headDate , bodyText );
};

/**
*   get, set waterquality cache
*   @param {object} data - data
*   @param {string} quality - "salinity", "do"
*   @return cache.waterquality
*/
var waterquality_cache = function(data, quality){
    if (arguments.length == 0) { return JH.GetJsonValue( srvTH , "cache.waterquality") ;}
    if (typeof srvTH["cache"]["waterquality"] == "undefined"){
        srvTH["cache"]["waterquality"] = {};
    }
    if (typeof srvTH["cache"]["waterquality"][quality] == "undefined"){
        srvTH["cache"]["waterquality"][quality] = [];
    }
    srvTH["cache"]["waterquality"][quality].push(data);
}

/**
*   get waterquality head text
*   @return waterquality head text
*/
var waterquality_head_text = function(){
    return srvTH.DATE_TIME;
}

/**
*   get waterquality body text
*   @return waterquality body text
*/
var waterquality_body_text = function(){
    var setting = srvTHF.GetWaterQuality_Display();
    var text = "";
    var station_cache = waterquality_cache();

    for ( var key in station_cache){
        var _cache = station_cache[key];
        if ( text != "" ){ text += "<br/>"; }
        text += "<b>"+ JH.GetJsonValue( TRANSLATOR , "waterquality_alert_" + key) +"</b>";
        for (var i = 0 ; i < _cache.length; i++){
            var d = _cache[i];
            var station_name = JH.GetJsonLangValue(d, "waterquality_station.waterquality_station_name");
            var value = JH.GetJsonValue_Float(d, "waterquality_" + key);
            var color = srvTHF.WaterQuality_GetColor( JH.GetJsonValue( srvTHF.GetWaterQuality_Scale() , key ) , value );
            text += LabelBg(station_name, color);
        }
    }
    if ( text == "" ){
        text = TRANSLATOR["normal"];
        srvTH.isNormalSituation["waterquality"] = true;
    }

    return text;
}

/**
*   handler service storm
*   @param {object} rs - result ในส่วนของ storm
*/
srvTH.handlerStorm = function(rs){
    srvTHF.SetStorm_Setting( JH.GetJsonValue(rs, "setting") );
    srvTHF.renderModalStormTable();
    srvTH["cache"]["storm_date"] = JH.GetJsonValue( rs , "date");
    if ( JH.GetJsonValue(rs , "data.result") != "OK" ){ return false; }
    var storm = JH.GetJsonValue(rs , "data.data");
    var latlngs = [];
    var storm_name = "";
    var temp_color = "";
    var color = "";
    var polyLineW = 4; // default ขนาดเส้น
    var noPoint = true;
    var curDt = moment.utc(srvTH["cache"]["storm_date"]);
    for (var i = 0 ; i < storm.length ; i++){
        if ( storm_name != ""  && noPoint){
            if ( temp_color == ""){
                storm_cache( {name:storm_name , color: color} );
            }else{
                storm_cache( {name:storm_name , color: temp_color} );
            }

        }
        var st = storm[i];
        storm_name = JH.GetJsonLangValue(st , "storm_name");
        // reset
        polyLineW = 4;
        noPoint = true;
        temp_color = "";
        var data = JH.GetJsonValue(st, "storm_data");
        for (var j = 0 ; j < data.length; j++){
            var d = data[j];
            var lat = JH.GetJsonValue(d , "storm_lat");
            var long = JH.GetJsonValue(d , "storm_long");
            var storm_wind = JH.GetJsonValue(d , "storm_wind");
            var storm_dt = moment( JH.GetJsonValue(d, "storm_datetime") );
            var sw = storm_wind.split(" ");
            if (lat == "" || long == "" || sw[0] == ""){ continue; }
            color = srvTHF.Storm_GetColor(sw[0]) ;

            latlngs.push([lat , long]);
            if (latlngs.length < 2){ continue; }
            else if ( latlngs.length > 2){ latlngs.splice(0,1); }
            L.polyline(latlngs, {color: color, weight: polyLineW}).addTo(srvTH.map);

            if ( storm_dt.isAfter(curDt) ){
                // เริ่มทำนาย ใส่จุด
                if ( noPoint && latlngs.length == 2){
                    temp_color = color;
                    L.circleMarker( latlngs[latlngs.length - 1], {color: temp_color, weight: polyLineW + 2})
                    .setRadius(5)
                    .addTo(srvTH.map);
                    noPoint = false;
                    storm_cache( {name:storm_name , color: color} );
                }
                // ทำนาย ปรับเส้นให้บาง
                polyLineW = 2;
            }
        }
    }
    if ( storm_name != ""  && noPoint){
        if ( temp_color == ""){
            storm_cache( {name:storm_name , color: color} );
        }else{
            storm_cache( {name:storm_name , color: temp_color} );
        }
    }
    // L.polyline(latlngs, {color: color}).addTo(srvTH.map);
    // srvTH.map.fitBounds(polyline.getBounds());
}

/**
*   generate control-box-storm
*   @return {controlBox}
*/
var control_topleft_icon_storm = function(){
    var headDate = storm_headText();
    var bodyText = storm_bodyText();

    return controlBoxStorm( headDate , bodyText );
};

/**
*   get , set storm cache
*   @param {string} storm_name - storm_name
*   @return cache.storm
*/
var storm_cache = function(storm_name){
    if (arguments.length == 0) { return JH.GetJsonValue(srvTH , "cache.storm") ;}
    if (typeof srvTH["cache"]["storm"] == "undefined"){
        srvTH["cache"]["storm"] = [];
    }
    srvTH["cache"]["storm"].push( storm_name );
}

/**
*   get storm head text
*   @return storm head text
*/
var storm_headText = function(){
    return srvTH.DATE_TIME;
}

/**
*   get storm body text
*   @return storm body text
*/
var storm_bodyText = function(){
    var text = "";
    // var wave_setting = srvTHF.GetWave_Setting();
    var storms = storm_cache();
    if (storms.length == 0) {
        text = TRANSLATOR["no_storm"];
        srvTH.isNormalSituation["storm"] = true;
    }
    for (var i = 0 ; i < storms.length ; i++){
        var d = storms[i];
        text += LabelBg( JH.GetJsonValue(d , "name") , JH.GetJsonValue(d , "color") );
        // LabelBg
    }
    return text;
}

/**
*   handler service pre_rain
*   @param {object} rs - result ในส่วนของ pre_rain
*/
srvTH.handlerPreRain = function(rs){
    var pre_rain_setting = JH.GetJsonValue(rs , "setting");
    srvTHF.SetPreRain_Setting( pre_rain_setting );
    srvTHF.renderModalClockTable();

    var PreRainProvince = {}

    if ( JH.GetJsonValue(rs , "data.result") != "OK" ){ return false; }
    var data = JH.GetJsonValue(rs , "data.data");
    for (var i = 0 ; i < data.length ; i ++){
        var d = data[i];
        var province_name = JH.GetJsonLangValue(d , "province_name", true);
        var level = JH.GetJsonValue(d, "rainforecast_level");

        // แยก จังหวัดไปตามแต่ละ level
        if ( JH.GetJsonValue(PreRainProvince , level) == "" ){
            PreRainProvince[level] = [];
        }
        PreRainProvince[level].push(province_name);
    }
    var _LevelText = srvTHF.GetPreRain_LevelText();
    for (var l in PreRainProvince){
        if ( l == "" ){ continue; }
        var provs = PreRainProvince[l];
        var color = JH.GetJsonValue(_LevelText, l+".color");
        for (var i = 0 ; i < provs.length ; i++){
            // เทสี แต่ละจังหวัด
            srvTH.FEATURE_PROVINCE["province"][provs[i]].setStyle({fillColor: color});
            prerain_cache(provs[i] , color, l);
        }
    }
}

/**
*   get , set prerain cache
*   @param {string} text - province name
*   @param {string} color - สี
*   @param {string} level - ระดับ
*   @return cache.prerain
*/
var prerain_cache = function(text , color , level){
    if (arguments.length == 0) { return JH.GetJsonValue(srvTH , "cache.prerain"); }
    if (typeof srvTH["cache"]["prerain"] == "undefined"){
        srvTH["cache"]["prerain"] = {};
        srvTH["cache"]["prerain_province"] = [];
    }
    if (typeof srvTH["cache"]["prerain"][level] == "undefined"){
        srvTH["cache"]["prerain"][level] = "";
    }
    srvTH["cache"]["prerain_province"].push(text);
    srvTH["cache"]["prerain"][level] += LabelBg(text , color);
}

/**
*   generate control-box-clock
*   @return {controlBox}
*/
var control_topleft_icon_clock = function(){
    var headDate = prerain_headText();
    var bodyText = prerain_bodyText();

    return controlBoxPredictRain( headDate , bodyText );
};

/**
*   get prerain head text
*   @return prerain head text
*/
var prerain_headText = function(){
    return srvTH.DATE;
}

/**
*   get prerain body text
*   @return prerain body text
*/
var prerain_bodyText = function(){
    var text = "";
    var prerainC = prerain_cache();
    var _LevelText = srvTHF.GetPreRain_LevelText();
    var i = 0;
    if (prerainC){
        for (var l in prerainC){
            if ( i != 0){ text += "<br/>";}
            var provs = prerainC[l];
            var levelText = TRANSLATOR[ JH.GetJsonValue(_LevelText, l+".trans") ];
            text += '<b>' + levelText + "</b> : " + provs;
            i++;
        }
    }else{
        text = TRANSLATOR["normal"];
        srvTH.isNormalSituation["prerain"] = true;
    }
    return text;
}

/**
*   handler service wave
*   @param {object} rs - result ในส่วนของ wave
*/
srvTH.handlerWave = function(rs){
    var wave_setting = JH.GetJsonValue(rs , "setting");
    if (Array.isArray(wave_setting)) {
        wave_setting = wave_setting[0]; // ใช้ตัวแรก
    }
    srvTHF.SetWave_Setting( wave_setting );
    srvTHF.renderModalWaveTable();
    srvTH["cache"]["wave_date"] = JH.GetJsonValue( rs , "date");

    if ( JH.GetJsonValue(rs , "data.result") == "OK" ){
        var data = JH.GetJsonValue(rs , "data.data");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var station = JH.GetJsonValue(d , "swan_station");
            var station_lat = JH.GetJsonValue(station , "lat");
            var station_long = JH.GetJsonValue(station , "long");
            var station_province_code = JH.GetJsonValue_Float(station , "province_code");
            var station_province_name = JH.GetJsonLangValue(station , "province_name");

            wave_cache(station_province_code);

            if (station_lat == "" || station_long == ""){ continue; }

            var color = JH.GetJsonValue( wave_setting , "colorname" );
            var m = srvTHF.Wave_Marker([station_lat , station_long] , d , color);
            srvTH.map.addLayer(m);
        }
    }
}

/**
*   generate control-box-wave
*   @return {controlBox}
*/
var control_topleft_icon_wave = function(rs){
    var headDate = wave_headText();
    var bodyText = wave_bodyText()

    return controlBoxPredictWave( headDate , bodyText );
};

/**
*   get , set wave cache
*   @param {string} province_code - province code
*   @return cache..wave
*/
var wave_cache = function(province_code){
    if (arguments.length == 0) { return JH.GetJsonValue(srvTH , "cache.wave") ;}
    if (typeof srvTH["cache"]["wave"] == "undefined"){
        srvTH["cache"]["wave"] = [];
    }
    srvTH["cache"]["wave"].push( parseInt(province_code) );
}

/**
*   get wave head text
*   @return wave head text
*/
var wave_headText = function(){
    return srvTH.DATE;
}

/**
*   get wave body text
*   @return wave body text
*/
var wave_bodyText = function(){
    var text = "";
    var wave_setting = srvTHF.GetWave_Setting();
    var province = province_cache();
    if ( !wave_cache() ){
        srvTH.isNormalSituation["wave"] = true;
        return TRANSLATOR["normal"];
    }
    var arr = $.unique( wave_cache() ).sort(function(a, b){return a-b}) ;
    for (var i = 0 ; i < arr.length ; i++){
        var d = arr[i];
        text += LabelBg( JH.GetJsonLangValue(province , d+".province_name"), JH.GetJsonValue(wave_setting,"color") );
    }
    if ( text != ""){
        text = TRANSLATOR["wave_body_head_text"] + "<br/>" + text;
    }
    return text;
}

/**
*   handler service warning
*   @param {object} rs - result ในส่วนของ warning
*/
srvTH.handlerWarning = function(rs){
    var warning_setting = JH.GetJsonValue(rs , "setting");

    //  ถ้า drought result เป็น ok และ มี data ให้เก็บ data ไว้
    var drought = JH.GetJsonValue(rs , "drought");
    if ( JH.GetJsonValue(drought, "result") == "OK"){
        var data = JH.GetJsonValue(drought, "data");
        if ( data.length > 0){
            srvTH["cache"]["warning_drought"] = data
        }
    }
    //  ถ้า flood result เป็น ok และ มี data ให้เก็บ data ไว้
    var flood = JH.GetJsonValue(rs , "flood");
    if ( JH.GetJsonValue(flood, "result") == "OK"){
        var data = JH.GetJsonValue(flood, "data");
        if ( data.length > 0){
            srvTH["cache"]["warning_flood"] = data
        }
    }

    srvTHF.SetWarning_Setting( warning_setting );
}

/**
*   generate control-box-warning
*   @return {controlBox}
*/
var control_topleft_icon_warnning = function(){
    var headDate = warning_headText();
    var bodyText = warning_bodyText();

    return controlBoxRisk( headDate , bodyText );
};

/**
*   get warning head text
*   @return warning head text
*/
var warning_headText = function(){
    return prerain_headText();
}

/**
*   get warning body text
*   @return warning body text
*/
var warning_bodyText = function(){
    var setting = srvTHF.GetWarning_Setting();
    var rain_color = JH.GetJsonValue(setting , "rain");
    var drought_color = JH.GetJsonValue(setting , "drought");
    var flood_color = JH.GetJsonValue(setting , "flood");
    var text = "";
    var rain = rain_cacheProvinceLevel();
    var prerain = JH.GetJsonValue( srvTH["cache"],"prerain_province");
    var drought = JH.GetJsonValue( srvTH["cache"],"warning_drought");
    var flood = JH.GetJsonValue( srvTH["cache"],"warning_flood");
    if ( !prerain && !drought && !flood){
        srvTH.isNormalSituation["warning"] = true;
        return TRANSLATOR["normal"];
    }
    // พื้นที่ประสบอุทกภัยและดินโคลนถล่ม
    if ( prerain ){
        text += TRANSLATOR["risk_text_rain"] + TRANSLATOR["ambit"] + TRANSLATOR["province"] ;
        for (var i = 0 ; i < prerain.length ; i++){
            var d = prerain[i];
            if (JH.GetJsonValue_Int(rain, d) != 0){
                text += LabelBg(d , rain_color);
                var _layer = JH.GetJsonValue(srvTH.FEATURE_PROVINCE["province"], d);
                if ( _layer ){
                    _layer.setStyle({color: rain_color, weight: 2, opacity: 1});
                }
            }
        }
    }else{
        text += TRANSLATOR["no_risk"] + TRANSLATOR["risk_text_rain"];
    }

    // ภัยแล้ง
    if ( drought ){
        text += "<br/>" + TRANSLATOR["risk_text_drought"] + TRANSLATOR["ambit"] + TRANSLATOR["province"] ;
        for (var i = 0 ; i < drought.length ; i++){
            var d = drought[i];
            var _name = JH.GetJsonLangValue(d, "province_name");
            var _code = JH.GetJsonLangValue(d, "province_code");
            text += LabelBg(_name, drought_color);
            var _layer =  JH.GetJsonLangValue(srvTH.FEATURE_PROVINCE["province"], _code);
            if ( _layer ){
                _layer.setStyle({color: drought_color, weight: 2, opacity: 1});
            }
        }
    }else{
        text += "<br/>" + TRANSLATOR["no_risk"] + TRANSLATOR["risk_text_drought"];
    }

    // อุทกภัย
    if ( flood ){
        text += "<br/>" + TRANSLATOR["risk_text_warning"] + TRANSLATOR["ambit"] + TRANSLATOR["province"] ;
        for (var i = 0 ; i < flood.length ; i++){
            var d = flood[i];
            var _name = JH.GetJsonLangValue(d, "province_name");
            var _code = JH.GetJsonLangValue(d, "province_code");
            text += LabelBg(_name , drought_color);
            var _layer =  JH.GetJsonLangValue(srvTH.FEATURE_PROVINCE["province"], _code);
            if ( _layer ){
                _layer.setStyle({color: drought_color, weight: 2, opacity: 1});
            }
        }
    }else{
        text += "<br/>" + TRANSLATOR["no_risk"] + TRANSLATOR["risk_text_warning"];
    }

    return text;
}

/**
*   สร้าง element control-box
*   @param {string} controlClass - class
*   @param {string} headText - header text
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {element}
*/
var controlBox = function(colClass, controlClass, headText , headDate , bodyText){
    var row = document.createElement('div');
    row.className = "row";

    var div = document.createElement('div');
    div.className = "col-md-7 " + colClass;

    var control = document.createElement('div');
    control.className="control-box control-box-"+controlClass;

    var div_control_head = document.createElement('div');
    div_control_head.className='control-head';

    var div_icon = document.createElement('div');
    div_icon.className='icon';
    // add event icon click to expand control-box
    div_icon.addEventListener("click", function(){
        var targetRow = $(this).closest('div.row');
        if ( srvTH.currentRow ){
            srvTH.currentRow.removeClass('active');
            if ( targetRow.index() == srvTH.currentRow.index() ){
                srvTH.currentRow = null;
                return false;
            }
        }
        targetRow.addClass('active');
        srvTH.currentRow = targetRow;
    });
    var div_info = document.createElement('div');
    div_info.className='info';
    // add event info click to open modal
    div_info.addEventListener("click", function(){
        $('#modal-'+controlClass).modal();
    });
    // div header text
    var div_control_head_text = document.createElement('div');
    div_control_head_text.className='control-head-text';
    div_control_head_text.innerHTML = headText+"<span>"+headDate+"</span>";

    // add icon, info, header text into div
    div_control_head.appendChild(div_icon);
    div_control_head.appendChild(div_info);
    div_control_head.appendChild(div_control_head_text);

    // div body text
    var div_control_body = document.createElement('div');
    div_control_body.className='control-body';
    div_control_body.innerHTML = '<div>'+bodyText+'</div>';

    // div arrow down, up
    var div_control_arrow = document.createElement('div');
    div_control_arrow.className='control-arrow';
    div_control_arrow.innerHTML = '<span class="fa fa-angle-down"></span><span class="fa fa-angle-up"></span>';

    control.appendChild(div_control_head);
    control.appendChild(div_control_body);
    control.appendChild(div_control_arrow);

    div.appendChild(control);
    row.appendChild(div);
    return row;
}

/**
*   สร้าง a tag
*   @param {string} text - ชื่อที่จะแสดง
*   @param {string} href - url
*   @return {string}
*/
var genTagA = function(text , href){
    s = '<a ';
    if (href){
        s += 'href="'+href+'" ';
    }
    s += '> ' + text + '</a>';
    return s
}

/**
*   สร้าง element control-box-rain
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxRain = function(headDate , bodyText){
    return controlBox('col-md-offset-2','rain' , genTagA(JH.GetJsonValue(TRANSLATOR, "rain") , srvTH._MAIN_PAGE_+'#box-rain') , headDate , bodyText)
}

/**
*   สร้าง element control-box-Waterlevel
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxWaterlevel = function(headDate , bodyText){
    return controlBox('col-md-offset-1', 'waterlevel' , genTagA(JH.GetJsonValue(TRANSLATOR, "waterlevel") , srvTH._MAIN_PAGE_+'#box-waterlevel') , headDate , bodyText)
}

/**
*   สร้าง element control-box-dam
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxDam = function(headDate , bodyText){
    return controlBox('col-md-offset-1', 'dam' , genTagA(JH.GetJsonValue(TRANSLATOR, "dam") , srvTH._MAIN_PAGE_+'#box-dam') , headDate , bodyText)
}

/**
*   สร้าง element control-box-Waterquality
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxWaterquality = function(headDate , bodyText){
    return controlBox('col-md-offset-2', 'waterquality' , genTagA(JH.GetJsonValue(TRANSLATOR, "waterquality") , srvTH._MAIN_PAGE_+'#box-waterquality') , headDate , bodyText)
}

/**
*   สร้าง element control-box-Storm
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxStorm = function(headDate , bodyText){
    return controlBox('col-md-offset-3', 'storm' , genTagA(JH.GetJsonValue(TRANSLATOR, "storm") , srvTH._MAIN_PAGE_+'#box-storm') , headDate , bodyText)
}

/**
*   สร้าง element control-box-PredictRain
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxPredictRain = function(headDate , bodyText){
    return controlBox('col-md-offset-4', 'clock' , genTagA(JH.GetJsonValue(TRANSLATOR, "predict_rain") , srvTH._MAIN_PAGE_+'#box-predict_rain') , headDate , bodyText)
}

/**
*   สร้าง element control-box-PredictWave
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxPredictWave = function(headDate , bodyText){
    return controlBox('col-md-offset-4', 'wave' , genTagA(JH.GetJsonValue(TRANSLATOR, "predict_wave") , srvTH._MAIN_PAGE_+'#box-predict_wave') , headDate , bodyText)
}

/**
*   สร้าง element control-box-Risk
*   @param {string} headDate - header date
*   @param {string} bodyText - body text
*   @return {controlBox}
*/
var controlBoxRisk = function(headDate , bodyText){
    return controlBox('col-md-offset-3', 'warning' , genTagA(JH.GetJsonValue(TRANSLATOR, "risk") , srvTH._MAIN_PAGE_+'#box-risk') , headDate , bodyText)
}

/**
*   เลื่อนกล่อง ลง ตอนกดลูกศร ลง
*   @param {element} i - element ลูกศรขึ้น
*/
var arrowDownClick = function(i){
    var controlArrow = $(i).closest('.control-arrow');
    var controlBody = $(i).closest('.control-box').find('.control-body');
    var controlDiv = controlBody.find('div');
    var bodyHeight = controlBody.height();
    var divHeight = controlDiv.height();

    var divDif = divHeight - bodyHeight;

    var top = parseInt(controlDiv.css('top'), 10);
    var fsize = parseInt(controlDiv.css('font-size'), 10);
    top -= fsize;
    if (divDif + top + fsize >= 0){
        controlArrow.addClass('hasUp');
    }else{
        controlArrow.removeClass('hasDown');
        clearInterval(srvTH["cache"]["interval"]);
        if (srvTH["cache"]["interval"]){
            srvTH["cache"]["interval"] = null;
        }
    }
    controlDiv.css('top' , top+'px');
};
/**
*   เลื่อนกล่อง ขึ้น ตอนกดลูกศร ขึ้น
*   @param {element} i - element ลูกศรลง
*/
var arrowUpClick =function(i){
    var controlArrow = $(i).closest('.control-arrow');
    var controlBody = $(i).closest('.control-box').find('.control-body');
    var controlDiv = controlBody.find('div');
    var bodyHeight = controlBody.height();
    var divHeight = controlDiv.height();
    var divDif = divHeight - bodyHeight;

    var top = parseInt(controlDiv.css('top'), 10);
    var fsize = parseInt(controlDiv.css('font-size'), 10);
    top += fsize;
    if (top < 0){
        controlArrow.addClass('hasDown');
    }else{
        controlArrow.removeClass('hasUp');
        clearInterval(srvTH["cache"]["interval"]);
        if (srvTH["cache"]["interval"]){
            srvTH["cache"]["interval"] = null;
        }
        top = 0;
    }
    controlDiv.css('top' , top+'px');
};
