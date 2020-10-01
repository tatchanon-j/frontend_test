var rain = {};

rain.init = function(){
	$.extend( true, $.fn.dataTable.defaults, {
        "dom": 't',
        "iDisplayLength": 200,
        "language":  g_dataTablesTranslator
    } );

	// rain.initRain24();
	rain.initRainToday();
	rain.initYesterday();
	rain.initMonth();
	rain.initYear();

	rain.initMap();

	rain.GetScale();
	// click open modal-rain chart
    $(document).on('click' , 'a[data-toggle="modal-rain"]' , function(e){
        e.preventDefault();
        $('#modal-rain').find('iframe').attr( 'src', 'iframe/graph/rain?station='+$(this).attr('href') );
        $('#modal-rain').modal();
        return false;
    });
}

rain.initRain24 = function(){
	rain.service = "thaiwater30/public/rain_24h";

    rain.datatable = $("#rain24_table").DataTable({
    	fixedHeader: true,
	 	columns: [
	 		{data: rain.renderStation},
	 		{data: rain.renderLocation},
	 		{data: rain.renderTime},
	 		{data: rain.renderRain24Value},
	 	],
	 	order : [ [ 3, 'desc' ] ],
        language:{
            emptyTable: "ไม่มีฝน"
        },
	 	// pageLength: 20 //show 20 rows

	 });

    apiService.SendRequest('GET', rain.service, null, rain.handlerGetRain24Service);
}

rain.onEachFeature = function(map, feature, layer){
	if (typeof rain.FEATURE_PROVINCE == "undefined") {
		rain.FEATURE_PROVINCE = {};
	}
	if (typeof rain.FEATURE_PROVINCE[map] == "undefined") {
		rain.FEATURE_PROVINCE[map] = [];
	}
	rain.FEATURE_PROVINCE[map][feature.properties.prov_code] = layer;
	rain.FEATURE_PROVINCE[map][feature.properties.title] = layer;
}

rain.onEachFeature_Rain = function(feature, layer){
	rain.onEachFeature("rain", feature, layer)
}

rain.initMap = function(){
	$('#rain_map').height('530px');

	rain.GEOJSON_THAILAND_STYLE = {fillOpacity: 0, opacity: 0, interactive: false};
	rain.GEOJSON_FOCUS_STYLE = {opacity: 1};

	rain.rain_map = LL.Map('rain_map');
	L.geoJson(LL.GetGeoJsonThailand(), {style: rain.GEOJSON_THAILAND_STYLE, onEachFeature: rain.onEachFeature_Rain } ).addTo(rain.rain_map);
}
rain.handlerGetRain24Service = function(data){
	if (data.result == "OK") {
		rain.GenTable_Rain24(data.data);
		rain.Rain_genMap(data.data);
	}
}

rain.GetScale = function(){
	rain.service_scale = "thaiwater30/public/rain_load";

	apiService.SendRequest('GET', rain.service_scale, null, rain.GetRainScale);
	apiService.SendRequest('GET', rain.service_scale, null, rain.initRain24);
}

rain.GetRainScale = function(data){
	srvTHF.SetRain_Setting(data.scale);
	rain.renderBoxRainTable();
}

rain.GenTable_Rain24 = function(data){
	rain.datatable.clear();
	// rain.datatable.rows.add(data);
	for (i = 0 ; i < data.length && i < 20 ; i++){
        rain.datatable.row.add(data[i]);
    }
	rain.datatable.draw();
}

rain.Rain_genMap = function(data){
	if (typeof rain.Rain_AllMarker != "undefined") {
		rain.rain_map.removeLayer(rain.Rain_AllMarker);
	}
	rain.Rain_AllMarker = new L.FeatureGroup();
	if (typeof data != "object" || data == null) {
		return false;
	}
	for (i = 0; i < data.length ; i++){
		var d = data[i];
		var station_lat = JH.GetJsonValue(d, "station.tele_station_lat");
		var station_long = JH.GetJsonValue(d, "station.tele_station_long");


		var v = JH.GetJsonValue_Float(d, "rain_24h");
		var color = srvTHF.Rain_GetColorname(v);

		m = srvTHF.Rain_Marker([station_lat, station_long], d, color);
		m.bindPopup(rain.Rain_PopupText(d)).bindTooltip(rain.Rain_TooltipText(d));
		m.on('popupopen', function(e){ this.unbindTooltip(); });
		m.on('popupclose', function(e){ this.bindTooltip( rain.Rain_TooltipText(this.options.properties) ); });
		rain.Rain_AllMarker.addLayer(m);
	}
	rain.Rain_AllMarker.addTo(rain.rain_map);
}

/**
*   gen popup text in map on click
*   @param {object} d - object
*   @return {string} popup text
*/
rain.Rain_PopupText = function(d){
	text = rain.Rain_TooltipText(d);
	text += rain.Rain_GraphLink(JH.GetJsonValue(d, "station.id")+ "&province="+JH.GetJsonValue(d, "geocode.province_code")+"&tab=1", '<i class="fa fa-bar-chart" aria-hidden="true"></i>');
	return text
}

/**
*   gen tooltip text in map on hover
*   @param {object} d - object
*   @return {string} tooltip text
*/
rain.Rain_TooltipText = function(d){
	//var th = rain.rain24_table.find('th');
	var p = JH.GetJsonLangValue(d, "geocode.province_name", true);
	var a = JH.GetJsonLangValue(d, "geocode.amphoe_name", true);
	var t = JH.GetJsonLangValue(d, "geocode.tumbon_name", true);
	var tap = "";
	if (t != "") { tap += "ต." + t + " "; }
	if (a != "") { tap += "อ." + a + " "; }
	if (p != "") { tap += "จ." + p + " "; }
	if (tap != "") { tap += "<br/>" ;}

	text = "ชื่อสถานี : " + JH.GetJsonLangValue(d, "station.tele_station_name", true) + '<br/>';
	text += tap;
	text += "ข้อมูลล่าสุด : " + rain.renderTime(d) + '<br/>';
	text += "ฝนสะสม : " + rain.renderRain24Value(d) + '<br/>';
	text += "หน่วยงานเจ้าของข้อมูล : " + JH.GetJsonLangValue(d, "agency.agency_name.th", true) + '<br/>';
	// text += rain.translator["_agency_name"] + JH.GetJsonLangValue(d, "agency.agency_name", true) + '<br/>';
	return text;
}
rain.renderBoxRainTable = function(){
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

rain.renderStation = function(row){
	var station_id = JH.GetJsonValue(row, "station.id");
	var province_code = JH.GetJsonValue(row, "geocode.province_code");
	var station_name = JH.GetJsonValue(row, "station.tele_station_name.th");

	return rain.Rain_GraphLink(station_id+"&province="+province_code+"&tab=1", station_name);
}

rain.Rain_GraphLink = function(link , text){
    return rain.Gen_GraphLink(link , text , "กราฟปริมาณฝน" , "modal-rain");
}

rain.Gen_GraphLink = function(link , text , title , modal, style){
    return '<a href="'+link+'" title="'+title+'" data-toggle="'+modal+'" style="'+ style +'">'+text+'</a>';
}

rain.renderLocation = function(row){
	var p = JH.GetJsonLangValue(row , "geocode.province_name.th"); // province
    var a = JH.GetJsonLangValue(row , "geocode.amphoe_name"); // amphoe
    var text = "";
    if (a != "") { text += "อ." + a + " "; }
    if (p != "") { text += "จ." + p + " "; }
    return text;
}

rain.renderTime = function(row){
	return JH.GetJsonValue(row, "rainfall_datetime");
}

rain.renderRain24Value = function(row){
	var v = JH.GetJsonValue_Float(row, "rain_24h");
	var color = srvTHF.Rain_GetColor(v);
	// return '<font color="'+color+'">'+ numeral( JH.GetJsonValue(row, "rain_24h") ).format('0,0.0') + '</font>';

	return  '<span class="badge" style="background:'+color+';color:#333;">'+ numeral( JH.GetJsonValue(row, "rain_24h") ).format('0,0.0') + '</span>';
}

rain.initRainToday = function(){
	rain.service_raintoday = "thaiwater30/public/rain_today";

    rain.raintoday_datatable = $("#raintoday_table").DataTable({
    	fixedHeader: true,
	 	columns: [
	 		{data: rain.renderStation_RainToday},
	 		{data: rain.renderLocation_RainToday},
	 		{data: rain.renderTime_RainToday},
	 		{data: rain.renderValue_RainToday},
	 	],
	 	order : [ [ 3, 'desc' ] ],
        language:{
            emptyTable: "ไม่มีฝน"
        },
	 	// pageLength: 20 //show 20 rows

	 });

    apiService.SendRequest('GET', rain.service_raintoday, null, rain.handlerGetRainTodayService);
}

rain.handlerGetRainTodayService = function(data){
	if (data.result == "OK") {
		rain.GenTable_RainToday(data.data);
	}
}

rain.GenTable_RainToday = function(data){
	rain.raintoday_datatable.clear();
	// rain.datatable.rows.add(data);
	for (i = 0 ; i < data.length && i < 20 ; i++){
        rain.raintoday_datatable.row.add(data[i]);
    }
	rain.raintoday_datatable.draw();
}

rain.renderStation_RainToday = function(row){
	var station_id = JH.GetJsonValue(row, "station.id");
	var province_code = JH.GetJsonValue(row, "geocode.province_code");
	var station_name = JH.GetJsonValue(row, "station.tele_station_name.th");

	return rain.Rain_GraphLink(station_id+"&province="+province_code+"&tab=2", station_name);
}

rain.renderLocation_RainToday = function(row){
	var p = JH.GetJsonLangValue(row , "geocode.province_name.th"); // province
    var a = JH.GetJsonLangValue(row , "geocode.amphoe_name"); // amphoe
    var text = "";
    if (a != "") { text += "อ." + a + " "; }
    if (p != "") { text += "จ." + p + " "; }
    return text;
}

rain.renderTime_RainToday = function(row){
	return JH.GetJsonValue(row, "rainfall_datetime");
}

rain.renderValue_RainToday = function(row){
	var v = JH.GetJsonValue_Float(row, "rainfall_value");

	return numeral( JH.GetJsonValue(row, "rainfall_value") ).format('0,0.0');
}

rain.initYesterday = function(){
	rain.service_rainyesterday = "thaiwater30/public/rain_yesterday";

    rain.rainyesterday_datatable = $("#rainyesterday_table").DataTable({
    	fixedHeader: true,
	 	columns: [
	 		{data: rain.renderStation_RainYesterday},
	 		{data: rain.renderLocation_RainYesterday},
	 		{data: rain.renderTime_RainYesterday},
	 		{data: rain.renderValue_RainYesterday},
	 	],
	 	order : [ [ 3, 'desc' ] ],
        language:{
            emptyTable: "ไม่มีฝน"
        },
	 	// pageLength: 20 //show 20 rows

	 });

    apiService.SendRequest('GET', rain.service_rainyesterday, null, rain.handlerGetRainYesterdayService);
}

rain.handlerGetRainYesterdayService = function(data){
	if (data.result == "OK") {
		rain.GenTable_RainYesterday(data.data);
	}
}

rain.GenTable_RainYesterday = function(data){
	rain.rainyesterday_datatable.clear();
	// rain.datatable.rows.add(data);
	for (i = 0 ; i < data.length && i < 20 ; i++){
        rain.rainyesterday_datatable.row.add(data[i]);
    }
	rain.rainyesterday_datatable.draw();
}

rain.renderStation_RainYesterday = function(row){
	var station_id = JH.GetJsonValue(row, "tele_station_id");
	var province_code = JH.GetJsonValue(row, "province_code");
	var station_name = JH.GetJsonValue(row, "tele_station_name.th");

	return rain.Rain_GraphLink(station_id+"&province="+province_code+"&tab=3", station_name);
}

rain.renderLocation_RainYesterday = function(row){
	var p = JH.GetJsonLangValue(row , "province_name.th"); // province
    var a = JH.GetJsonLangValue(row , "amphoe_name"); // amphoe
    var text = "";
    if (a != "") { text += "อ." + a + " "; }
    if (p != "") { text += "จ." + p + " "; }
    return text;
}

rain.renderTime_RainYesterday = function(row){
	return JH.GetJsonValue(row, "rainfall_datetime");
}

rain.renderValue_RainYesterday = function(row){
	var v = JH.GetJsonValue_Float(row, "rainfall_value");

	return numeral( JH.GetJsonValue(row, "rainfall_value") ).format('0,0.0');
}

rain.initMonth = function(){
	rain.service_rainmonth = "thaiwater30/public/rain_monthly";

    rain.rainmonth_datatable = $("#rainmonth_table").DataTable({
    	fixedHeader: true,
	 	columns: [
	 		{data: rain.renderStation_RainMonth},
	 		{data: rain.renderLocation_RainMonth},
	 		{data: rain.renderTime_RainMonth},
	 		{data: rain.renderValue_RainMonth},
	 	],
	 	order : [ [ 3, 'desc' ] ],
        language:{
            emptyTable: "ไม่มีฝน"
        },
	 	// pageLength: 20 //show 20 rows

	 });

    apiService.SendRequest('GET', rain.service_rainmonth, null, rain.handlerGetRainMonthService);
}

rain.handlerGetRainMonthService = function(data){
	if (data.result == "OK") {
		rain.GenTable_RainMonth(data.data);
	}
}

rain.GenTable_RainMonth = function(data){
	rain.rainmonth_datatable.clear();
	// rain.datatable.rows.add(data);
	for (i = 0 ; i < data.length && i < 20 ; i++){
        rain.rainmonth_datatable.row.add(data[i]);
    }
	rain.rainmonth_datatable.draw();
}

rain.renderStation_RainMonth = function(row){
	var station_id = JH.GetJsonValue(row, "station.id");
	var province_code = JH.GetJsonValue(row, "geocode.province_code");
	var station_name = JH.GetJsonValue(row, "station.tele_station_name.th");

	return rain.Rain_GraphLink(station_id+"&province="+province_code+"&tab=4", station_name);
}

rain.renderLocation_RainMonth = function(row){
	var p = JH.GetJsonLangValue(row , "geocode.province_name.th"); // province
    var a = JH.GetJsonLangValue(row , "geocode.amphoe_name"); // amphoe
    var text = "";
    if (a != "") { text += "อ." + a + " "; }
    if (p != "") { text += "จ." + p + " "; }
    return text;
}

rain.renderTime_RainMonth = function(row){
	return JH.GetJsonValue(row, "rainfall_datetime");
}

rain.renderValue_RainMonth= function(row){
	var v = JH.GetJsonValue_Float(row, "rainfall_value");


	return numeral( JH.GetJsonValue(row, "rainfall_value") ).format('0,0.0');
}

rain.initYear = function(){
	rain.service_rainyear = "thaiwater30/public/rain_yearly";

    rain.rainyear_datatable = $("#rainyear_table").DataTable({
    	fixedHeader: true,
	 	columns: [
	 		{data: rain.renderStation_RainYear},
	 		{data: rain.renderLocation_RainYear},
	 		{data: rain.renderTime_RainYear},
	 		{data: rain.renderValue_RainYear},
	 	],
	 	order : [ [ 3, 'desc' ] ],
        language:{
            emptyTable: "ไม่มีฝน"
        },
	 	// pageLength: 20 //show 20 rows

	 });

    apiService.SendRequest('GET', rain.service_rainyear, null, rain.handlerGetRainYearService);
}

rain.handlerGetRainYearService = function(data){
	if (data.result == "OK") {
		rain.GenTable_RainYear(data.data);
	}
}

rain.GenTable_RainYear = function(data){
	rain.rainyear_datatable.clear();
	// rain.datatable.rows.add(data);
	for (i = 0 ; i < data.length && i < 20 ; i++){
        rain.rainyear_datatable.row.add(data[i]);
    }
	rain.rainyear_datatable.draw();
}

rain.renderStation_RainYear = function(row){
	var station_id = JH.GetJsonValue(row, "station.id");
	var province_code = JH.GetJsonValue(row, "geocode.province_code");
	var station_name = JH.GetJsonValue(row, "station.tele_station_name.th");

	return rain.Rain_GraphLink(station_id+"&province="+province_code+"&tab=5", station_name);
}

rain.renderLocation_RainYear = function(row){
	var p = JH.GetJsonLangValue(row , "geocode.province_name.th"); // province
    var a = JH.GetJsonLangValue(row , "geocode.amphoe_name"); // amphoe
    var text = "";
    if (a != "") { text += "อ." + a + " "; }
    if (p != "") { text += "จ." + p + " "; }
    return text;
}

rain.renderTime_RainYear = function(row){
	return JH.GetJsonValue(row, "rainfall_datetime");
}

rain.renderValue_RainYear= function(row){
	var v = JH.GetJsonValue_Float(row, "rainfall_value");


	return numeral( JH.GetJsonValue(row, "rainfall_value") ).format('0,0.0');
}
