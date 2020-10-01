/**
*
*   waterquality Object for handler main page
*
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/

var waterquality = {};

waterquality.init = function(){
	$.extend( true, $.fn.dataTable.defaults, {
        "dom": 't',
        "iDisplayLength": 200,
        "language":  g_dataTablesTranslator
    } );
	waterquality.GetScale();
	//waterquality.initWaterQuality();

	waterquality.initMap();
	$('#graphtype').on('change' , waterquality.handlerGraphTypeChange);

	// click open modal-waterquality chart
    $(document).on('click' , 'a[data-toggle="modal-waterquality"]' , function(e){
        e.preventDefault();
        $('#modal-waterquality').find('iframe').attr( 'src', 'iframe/graph/waterquality?station='+$(this).attr('href') );
        $('#modal-waterquality').modal();
        return false;
    });
}

waterquality.initWaterQuality = function(data){
		waterquality.service = "thaiwater30/analyst/waterquality_load";

		$(' #div_waterquality_table').css('max-height', '500px');

		srvTHF.SetWaterQuality_Setting(data.scale.data);
		waterquality.WaterQuality_table = $('#waterquality_table');
    waterquality.datatable = waterquality.WaterQuality_table.DataTable({
    	fixedHeader: true,
		 	columns: [
		 		{data: waterquality.renderStation},
		 		{data: waterquality.renderProvince},
		 		{data: waterquality.renderDate},
		 		{data: waterquality.renderTimes},
		 		{data: waterquality.renderPh},
		 		{data: waterquality.renderSalinity},
		 		{data: waterquality.renderTurbid},
		 		{data: waterquality.renderEc},
		 		{data: waterquality.renderTds},
		 		{data: waterquality.renderChlorophyll},
		 		{data: waterquality.renderDo},
		 	],
			drawCallback: function ( settings ) {
	        var api = this.api();
	        var rows = api.rows( {page:'current'} ).nodes();
	        var last = null;
	        var columnCount = waterquality.WaterQuality_table.find('thead th').length;
					/*
	        api.column(0, {page:'current'} ).data().each( function ( group, i ) {

	            if ( last !== group ) {
	                // group by basin
	                $(rows).eq( i ).before(
	                    '<tr class="gr"><th colspan="'+columnCount+'">'+group+'</th></tr>'
	                );

	                last = group;
	            }
	        } );
					*/
	    },
		 	order : [ [ 2, 'asc' ] ],
	        language:{
	            emptyTable: "ไม่มีฝน"
	        },
		 	// pageLength: 20 //show 20 rows
		});

    apiService.SendRequest('GET', waterquality.service, null, waterquality.handlerGetWaterQualityService);
}

waterquality.onEachFeature = function(map, feature, layer){
	if (typeof waterquality.FEATURE_PROVINCE == "undefined") {
		waterquality.FEATURE_PROVINCE = {};
	}
	if (typeof waterquality.FEATURE_PROVINCE[map] == "undefined") {
		waterquality.FEATURE_PROVINCE[map] = [];
	}
	waterquality.FEATURE_PROVINCE[map][feature.properties.prov_code] = layer;
	waterquality.FEATURE_PROVINCE[map][feature.properties.title] = layer;
}

waterquality.onEachFeature_Rain = function(feature, layer){
	waterquality.onEachFeature("quality", feature, layer)
}

waterquality.initMap = function(){
	$('#waterquality_map').height('530px');

	waterquality.GEOJSON_THAILAND_STYLE = {fillOpacity: 0, opacity: 0, interactive: false};
	waterquality.GEOJSON_FOCUS_STYLE = {opacity: 1};

	waterquality.waterquality_map = LL.Map('waterquality_map');
	L.geoJson(LL.GetGeoJsonThailand(), {style: waterquality.GEOJSON_THAILAND_STYLE, onEachFeature: waterquality.onEachFeature_Rain } ).addTo(waterquality.waterquality_map);
}
waterquality.handlerGetWaterQualityService = function(data){

	if (data.data.result == "OK") {
		waterquality.GenTable_WaterQuality(data.data.data);
		waterquality.WaterQuality_genMap(data.data.data);
	}
}

waterquality.GetScale = function(){
	waterquality.service_scale = "thaiwater30/analyst/waterquality_load";
	apiService.SendRequest('GET', waterquality.service_scale, null, waterquality.initWaterQuality);
}

waterquality.GetRainScale = function(data){
	srvTHF.SetRain_Setting(data.scale);
	waterquality.renderBoxRainTable();
}

waterquality.handlerGraphTypeChange = function (){
    var graphSelectText = $(this).find('option:selected').text();
    var graphSelectValue = $(this).find('option:selected').val();
    $('#graphSelect').text('กราฟ'+graphSelectText);
    $('#modal-waterquality').find('iframe').attr( 'src', 'iframe/graph/waterquality?station='+$(this).attr('href')+'&graphtype='+graphSelectValue);
}

waterquality.GenTable_WaterQuality = function(data){
	waterquality.datatable.clear();
	waterquality.datatable.rows.add(data);
	// for (i = 0 ; i < data.length  ; i++){
  //       waterquality.datatable.row.add(data[i]);
  //   }
	waterquality.datatable.draw();

}

waterquality.WaterQuality_genMap = function(data){
	if (typeof waterquality.WaterQuality_AllMarker != "undefined") {
		waterquality.waterquality_map.removeLayer(waterquality.WaterQuality_AllMarker);
	}
	waterquality.WaterQuality_AllMarker = new L.FeatureGroup();
	if (typeof data != "object" || data == null) {
		return false;
	}
	for (i = 0; i < data.length ; i++){
		var d = data[i];
		var station_lat = JH.GetJsonValue(d, "waterquality_station.waterquality_station_lat");
		var station_long = JH.GetJsonValue(d, "waterquality_station.waterquality_station_long");

		var color = srvTHF.WaterQuality_GetMarkerColor(d);
    if ( color == srvTHF.GetWaterQuality_Default().color ){
        color = srvTHF.GetWaterQuality_Default().colorname;
    }

		m = srvTHF.WaterQuality_Marker([station_lat, station_long], d, color);
		m.bindPopup(waterquality.WaterQuality_PopupText(d)).bindTooltip(waterquality.WaterQuality_TooltipText(d));
		m.on('popupopen', function(e){ this.unbindTooltip(); });
		m.on('popupclose', function(e){ this.bindTooltip( waterquality.WaterQuality_TooltipText(this.options.properties) ); });
		waterquality.WaterQuality_AllMarker.addLayer(m);
	}
	waterquality.WaterQuality_AllMarker.addTo(waterquality.waterquality_map);
}

/**
*   gen popup text in map on click
*   @param {object} d - object
*   @return {string} popup text
*/
waterquality.WaterQuality_PopupText = function(d){
	text = waterquality.WaterQuality_TooltipText(d);
	text += waterquality.WaterQuality_GraphLink(JH.GetJsonValue(d, "waterquality_station.id")+ "&province="+JH.GetJsonValue(d, "province_code")+"&tab=1", '<i class="fa fa-bar-chart" aria-hidden="true"></i>');
	return text
}

/**
*   gen tooltip text in map on hover
*   @param {object} d - object
*   @return {string} tooltip text
*/
waterquality.WaterQuality_TooltipText = function(d){
	//var th = waterquality.WaterQuality_table.find('th');
	var p = JH.GetJsonLangValue(d, "waterquality_station.province_name.th", true);
	var a = JH.GetJsonLangValue(d, "waterquality_station.amphoe_name.th", true);
	var t = JH.GetJsonLangValue(d, "waterquality_station.tumbon_name.th", true);
	var tap = "";
	if (t != "") { tap += "ต." + t + " "; }
	if (a != "") { tap += "อ." + a + " "; }
	if (p != "") { tap += "จ." + p + " "; }
	if (tap != "") { tap += "<br/>" ;}

	text = "ชื่อสถานี : " + JH.GetJsonLangValue(d, "waterquality_station.waterquality_station_name", true) + '<br/>';
	text += tap;
	text += "กรด-ด่าง (pH) : " + waterquality.renderPh(d) + '<br/>';
	text += "ความเค็ม (g/L) : " + waterquality.renderSalinity(d) + '<br/>';
	text += "ความขุ่น (ntu) : " + waterquality.renderTurbid(d) + '<br/>';
	text += "ความนำไฟฟ้า (µS/cm) : " + waterquality.renderEc(d) + '<br/>';
	text += "สารละลาย (tds) : " + waterquality.renderTds(d) + '<br/>';
	text += "คลอโรฟิลล์ (qg/L) : " + waterquality.renderChlorophyll(d) + '<br/>';
	text += "ออกซิเจน (mg/L) : " + waterquality.renderDo(d) + '<br/>';
	text += "หน่วยงานเจ้าของข้อมูล : " + JH.GetJsonLangValue(d, "waterquality_station.agency_name.th", true) + '<br/>';
	// text += waterquality.translator["_agency_name"] + JH.GetJsonLangValue(d, "agency.agency_name", true) + '<br/>';
	return text;
}

waterquality.renderStation = function(row){
	var station_id = JH.GetJsonValue(row, "waterquality_station.id");
	var province_code = JH.GetJsonValue(row, "geocode.province_code");
	var station_name = JH.GetJsonValue(row, "waterquality_station.waterquality_station_name.th");

	return waterquality.WaterQuality_GraphLink(station_id+"&province="+province_code+"&tab=1", station_name);
}

waterquality.renderProvince = function(row){
	return JH.GetJsonValue(row, "waterquality_station.province_name.th");
}

waterquality.renderDate = function (row){
  return moment(JH.GetJsonValue(row, "waterquality_datetime")).format('D/M/YYYY');
}

waterquality.renderTimes = function (row){
  return moment(JH.GetJsonValue(row, "waterquality_datetime")).format('H:mm');
}

waterquality.renderPh = function (row){
	var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_ph") );
  var color = "";
  if (text != "") { color = srvTHF.WaterQuality_GetColor_ph(JH.GetJsonValue_Float(row, "waterquality_ph") )}
  return '<font color="'+color+'">' + text + '</font>';
}

waterquality.renderEc = function (row){
  return numeral('0').format('0,0.00');
}

waterquality.renderSalinity = function (row){
	var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_salinity") );
  var color = "";
  if (text != "") { color = srvTHF.WaterQuality_GetColor_salinity(JH.GetJsonValue_Float(row, "waterquality_salinity") )}
  return '<font color="'+color+'">' + text + '</font>';
}

waterquality.renderTurbid = function (row){
	var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_turbid") );
  var color = "";
  if (text != "") { color = srvTHF.WaterQuality_GetColor_turbid(JH.GetJsonValue_Float(row, "waterquality_turbid") )}
  return '<font color="'+color+'">' + text + '</font>';
}

waterquality.renderTds = function (row){
	var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_tds") );
  var color = "";
  if (text != "") { color = srvTHF.WaterQuality_GetColor_tds(JH.GetJsonValue_Float(row, "waterquality_tds") )}
  return '<font color="'+color+'">' + text + '</font>';
}

waterquality.renderChlorophyll = function (row){
  return JH.GetJsonValue(row, "waterquality_chlorophyll");
}

waterquality.renderDo = function (row){
	var text = srvTHF.NumFormat( JH.GetJsonValue(row, "waterquality_do") );
  var color = "";
  if (text != "") { color = srvTHF.WaterQuality_GetColor_do(JH.GetJsonValue_Float(row, "waterquality_do") )}
  return '<font color="'+color+'">' + text + '</font>';
}

waterquality.WaterQuality_GraphLink = function(link , text){
    return waterquality.Gen_GraphLink(link , text , "ไม่มีฝน" , "modal-waterquality");
}


waterquality.Gen_GraphLink = function(link , text , title , modal, style){
    return '<a href="'+link+'" title="'+title+'" data-toggle="'+modal+'" style="'+ style +'">'+text+'</a>';
}

waterquality.renderLocation = function(row){
	var p = JH.GetJsonLangValue(row , "geocode.province_name.th"); // province
    var a = JH.GetJsonLangValue(row , "geocode.amphoe_name"); // amphoe
    var text = "";
    if (a != "") { text += "อ." + a + " "; }
    if (p != "") { text += "จ." + p + " "; }
    return text;
}

waterquality.renderTime = function(row){
	return JH.GetJsonValue(row, "rainfall_datetime");
}
