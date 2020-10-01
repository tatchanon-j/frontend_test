/**
*
*   sp Object for handler agency/agency_shopping page
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var sp = {};

/**
*   Initial sp
*   @param {object} trans - translate object from laravel
*/
sp.init = function(){
    sp.serviceShopping = "thaiwater30/agency/agency_shopping";
    sp.serviceDetail = "thaiwater30/agency/agency_shopping_detail";
    sp.serviceMetadata = "thaiwater30/agency/agecncy_metadata";
    sp.serviceAgency = "thaiwater30/agency/agecncy_detail";
    sp.already_done = false;
    sp.modal_already_done = false;
    sp.IsModalWeather = false;

    // config ตัวที่จะมีลิ้งไปดูกราฟ
    sp.tbChart = {
        rainfall_daily: {
            url: "/thaiwater30/iframe/graph/rain24?",
            query: [
                {text: "name", from: "tele_station_name", isJson: true},
                {text: "province", from: "province_code", isJson: false}
            ]
        },
        canal_waterlevel: {
            url: "/thaiwater30/iframe/graph/waterlevel?station_type=canal_waterlevel",
            query: [
                {text: "name", from: "canal_station_name", isJson: true},
                {text: "province", from: "province_code", isJson: false}
            ]
        },
        tele_waterlevel: {
            url: "/thaiwater30/iframe/graph/waterlevel?station_type=tele_waterlevel",
            query: [
                {text: "name", from: "tele_station_name", isJson: true},
                {text: "province", from: "province_code", isJson: false}
            ]
        },
        dam_daily: {
            url: "/thaiwater30/iframe/graph/dam?",
            query: [
                {text: "name", from: "dam_name", isJson: true}
            ]
        },
        waterquality: {
            url: "/thaiwater30/iframe/graph/waterquality?",
            query: [
                {text: "name", from: "waterquality_station_name", isJson: true},
                {text: "province", from: "province_code", isJson: false},
            ]
        }
    };

    // config หัวตารางของแต่ละข้อมูล
    sp.tbConfig = {
        air: {
            name: "air_station_name",
            lat: "air_station_lat",
            long: "air_station_long",
            date: "air_datetime",
            columns: [
                { column: "air_station_name", trans: "tele_station_name" },
                { column: "air_datetime", trans: "datetime" },
                { column: "air_so2", trans: "air_so2", isValue: true},
                { column: "air_no2", trans: "air_no2", isValue: true},
                { column: "air_co", trans: "air_co", isValue: true},
                { column: "air_o3", trans: "air_o3", isValue: true},
                { column: "air_pm10", trans: "air_pm10", isValue: true},
                { column: "air_pm25", trans: "air_pm25", isValue: true},
                { column: "air_aqi", trans: "air_aqi", isValue: true},
            ]
        },
        canal_waterlevel: {
            name: "canal_station_name",
            lat: "canal_station_lat",
            long: "canal_station_long",
            date: "canal_waterlevel_datetime",
            columns: [
                { column: "canal_station_name", trans: "tele_station_name" },
                { column: "canal_waterlevel_datetime", trans: "datetime" },
                { column: "canal_waterlevel_value", trans: "canal_waterlevel_value", isValue: true},
                { column: "comm_status", trans: "comm_status"},
            ]
        },
        crosssection: {
            columns: [
                { column: "section_location", trans: "section_location"},
                { column: "point_id", trans: "point_id"},
                { column: "section_lat", trans: "section_lat"},
                { column: "section_long", trans: "section_long"},
                { column: "distance", trans: "distance"},
                { column: "water_level_msl", trans: "water_level_msl"},
                { column: "remark", trans: "remark"},
            ]
        },
        dam_daily: {
            name: "dam_name",
            lat: "dam_lat",
            long: "dam_long",
            date: "dam_date",
            columns: [
                { column: "dam_name", trans: "dam_name" },
                { column: "dam_date", trans: "date" },
                { column: "dam_level", trans: "dam_level", isValue: true},
                { column: "dam_storage", trans: "dam_storage", isValue: true},
                { column: "dam_inflow", trans: "dam_inflow", isValue: true},
                { column: "dam_released", trans: "dam_released", isValue: true},
                { column: "dam_spilled", trans: "dam_spilled", isValue: true},
                { column: "dam_losses", trans: "dam_losses", isValue: true},
                { column: "dam_evap", trans: "dam_evap", isValue: true},
                { column: "dam_uses_water", trans: "dam_uses_water", isValue: true},
                { column: "dam_storage_percent", trans: "dam_storage_percent", isValue: true},
                { column: "dam_uses_water_percent", trans: "dam_uses_water_percent", isValue: true},
                { column: "dam_inflow_avg", trans: "dam_inflow_avg", isValue: true},
                { column: "dam_released_acc", trans: "dam_released_acc", isValue: true},
                { column: "dam_inflow_acc", trans: "dam_inflow_acc", isValue: true},
                { column: "dam_inflow_acc_percent", trans: "dam_inflow_acc_percent", isValue: true},
            ]
        },
        dam_hourly: {
            name: "dam_name",
            lat: "dam_lat",
            long: "dam_long",
            date: "dam_datetime",
            columns: [
                { column: "dam_name", trans: "dam_name" },
                { column: "dam_datetime", trans: "datetime" },
                { column: "dam_level", trans: "dam_level", isValue: true},
                { column: "dam_storage", trans: "dam_storage", isValue: true},
                { column: "dam_inflow", trans: "dam_inflow", isValue: true},
                { column: "dam_released", trans: "dam_released", isValue: true},
                { column: "dam_spilled", trans: "dam_spilled", isValue: true},
                { column: "dam_losses", trans: "dam_losses", isValue: true},
                { column: "dam_evap", trans: "dam_evap", isValue: true},
                { column: "dam_uses_water", trans: "dam_uses_water", isValue: true},
                { column: "dam_storage_percent", trans: "dam_storage_percent", isValue: true},
                { column: "dam_uses_water_percent", trans: "dam_uses_water_percent", isValue: true},
                { column: "dam_inflow_avg", trans: "dam_inflow_avg", isValue: true},
                { column: "dam_released_acc", trans: "dam_released_acc", isValue: true},
                { column: "dam_inflow_acc", trans: "dam_inflow_acc", isValue: true},
                { column: "dam_inflow_acc_percent", trans: "dam_inflow_acc_percent", isValue: true},
            ]
        },
        flood_situation: {
            date: "flood_datetime",
            columns: [
                { column: "flood_name", trans: "flood_name" },
                { column: "flood_datetime", trans: "datetime" },
                { column: "flood_link", trans: "flood_link"},
                { column: "flood_description", trans: "flood_description"},
                { column: "flood_remark", trans: "remark"},
            ]
        },
        floodforecast: {
            name: "floodforecast_name",
            lat: "floodforecast_lat",
            long: "floodforecast_long",
            date: "floodforecast_datetime",
            columns: [
                { column: "floodforecast_name", trans: "tele_station_name" },
                { column: "floodforecast_datetime", trans: "datetime" },
                { column: "floodforecast_value", trans: "floodforecast_value", isValue: true},
            ]
        },
        ford_waterlevel: {
            name: "ford_station_name",
            lat: "ford_station_lat",
            long: "ford_station_long",
            date: "ford_waterlevel_datetime",
            columns: [
                { column: "ford_station_name", trans: "tele_station_name" },
                { column: "ford_waterlevel_datetime", trans: "datetime" },
                { column: "ford_waterlevel_value", trans: "ford_waterlevel_value", isValue: true},
                { column: "comm_status", trans: "comm_status", isValue: true},
                { column: "qc_status", trans: "qc_status", isValue: true},
            ]
        },
        geohazard_situation: {
            date: "geohazard_datetime",
            columns: [
                { column: "geohazard_name", trans: "geohazard_name" },
                { column: "geohazard_datetime", trans: "datetime" },
                { column: "geohazard_link", trans: "geohazard_link" },
                { column: "geohazard_description", trans: "geohazard_description" },
                { column: "geohazard_author", trans: "geohazard_author" },
                { column: "geohazard_colorlevel", trans: "geohazard_colorlevel" },
                { column: "geohazard_remark", trans: "remark" },
            ]
        },
        humid: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "humid_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "humid_datetime", trans: "datetime" },
                { column: "humid_value", trans: "humid_value", isValue: true },
            ]
        },
        m_air_station: {
            columns: [
                    { column: "air_station_oldcode", trans: "oldcode" },
                    { column: "air_station_name", trans: "tele_station_name" },
                    { column: "agency_id", trans: "agency_id" },
                    { column: "air_staiton_type", trans: "station_type" },
                    { column: "air_station_lat", trans: "lat" },
                    { column: "air_station_long", trans: "long" },
            ]
        },
        m_canal_station: {
            columns: [
                { column: "canal_station_name", trans: "tele_station_name" },
                { column: "canal_station_lat", trans: "lat" },
                { column: "canal_station_long", trans: "long" },
            ]
        },
        m_dam: {
            columns: [
                { column: "dam_name", trans: "tele_station_name" },
                { column: "dam_lat", trans: "lat" },
                { column: "dam_long", trans: "long" },
            ]
        },
        m_floodforcast_station: {
            columns: [
                { column: "floodforcast_name", trans: "tele_station_name" },
                { column: "floodforcast_lat", trans: "lat" },
                { column: "floodforcast_long", trans: "long" },
            ]
        },
        m_ford_station: {
            columns: [
                { column: "ford_station_name", trans: "tele_station_name" },
                { column: "ford_station_lat", trans: "lat" },
                { column: "ford_station_long", trans: "long" },
            ]
        },
        m_medium_dam: {
            columns: [
                { column: "mediumdam_name", trans: "tele_station_name" },
                { column: "mediumdam_lat", trans: "lat" },
                { column: "mediumdam_long", trans: "long" },
            ]
        },
        m_sea_station: {
            columns: [
                { column: "sea_station_name", trans: "tele_station_name" },
                { column: "sea_station_lat", trans: "lat" },
                { column: "sea_station_long", trans: "long" },
            ]
        },
        m_swan_station: {
            columns: [
                { column: "swan_name", trans: "tele_station_name" },
                { column: "swan_lat", trans: "lat" },
                { column: "swan_long", trans: "long" },
            ]
        },
        m_tele_station: {
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "tele_station_lat", trans: "lat" },
                { column: "tele_station_long", trans: "long" },
            ]
        },
        m_waterquality_station: {
            columns: [
                { column: "waterquality_station_name", trans: "tele_station_name" },
                { column: "waterquality_station_lat", trans: "lat" },
                { column: "waterquality_station_long", trans: "long" },
            ]
        },
        medium_dam: {
            name: "mediumdam_name",
            lat: "mediumdam_lat",
            long: "mediumdam_long",
            date: "mediumdam_date",
            columns: [
                { column: "mediumdam_name", trans: "tele_station_name" },
                { column: "mediumdam_storage", trans: "dam_storage", isValue: true },
                { column: "mediumdam_inflow", trans: "dam_inflow", isValue: true },
                { column: "mediumdam_released", trans: "dam_released", isValue: true },
                { column: "mediumdam_uses_water", trans: "dam_uses_water", isValue: true },
                { column: "mediumdam_storage_percent", trans: "dam_storage_percent", isValue: true },
            ]
        },
        pressure: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "pressure_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "pressure_datetime", trans: "datetime" },
                { column: "pressure_value", trans: "pressure_value", isValue: true },
            ]
        },
        rainfall: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "rainfall_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "rainfall_datetime", trans: "datetime" },
                { column: "rainfall5m", trans: "rainfall5m", isValue: true },
                { column: "rainfall10m", trans: "rainfall10m", isValue: true },
                { column: "rainfall15m", trans: "rainfall15m", isValue: true },
                { column: "rainfall30m", trans: "rainfall30m", isValue: true },
                { column: "rainfall1h", trans: "rainfall1h", isValue: true },
                { column: "rainfall3h", trans: "rainfall3h", isValue: true },
                { column: "rainfall6h", trans: "rainfall6h", isValue: true },
                { column: "rainfall12h", trans: "rainfall12h", isValue: true },
                { column: "rainfall24h", trans: "rainfall24h", isValue: true },
                { column: "rainfall_acc", trans: "rainfall_acc", isValue: true },
            ]
        },
        rainfall_daily: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "rainfall_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "rainfall_datetime", trans: "datetime" },
                { column: "rainfall_value", trans: "rainfall_value", isValue: true },
            ]
        },
        rainforecast: {
            date: "rainforecast_datetime",
            columns: [
                { column: "rainforecast_datetime", trans: "datetime" },
                { column: "rainforecast_value", trans: "rainforecast_value", isValue: true },
                { column: "rainforecast_level", trans: "rainforecast_level" },
                { column: "rainforecast_leveltext", trans: "rainforecast_leveltext" },
            ]
        },
        soilmoisture: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "soil_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "soil_datetime", trans: "datetime" },
                { column: "soil_value", trans: "soil_value", isValue: true },
            ]
        },
        solar: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "solar_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "solar_datetime", trans: "datetime" },
                { column: "solar_value", trans: "solar_value", isValue: true },
            ]
        },
        swan: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "swan_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "swan_datetime", trans: "datetime" },
                { column: "swan_depth", trans: "swan_depth", isValue: true },
                { column: "swan_highsig", trans: "swan_highsig", isValue: true },
                { column: "swan_direction", trans: "swan_direction", isValue: true },
                { column: "swan_period_top", trans: "swan_period_top", isValue: true },
                { column: "swan_period_average", trans: "swan_period_average", isValue: true },
                { column: "swan_windx", trans: "swan_windx", isValue: true },
                { column: "swan_windy", trans: "swan_windy", isValue: true },
            ]
        },
        tele_waterlevel: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "waterlevel_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "waterlevel_datetime", trans: "datetime" },
                { column: "waterlevel_m", trans: "waterlevel_m", isValue: true },
                { column: "waterlevel_msl", trans: "waterlevel_msl", isValue: true },
                { column: "waterlevel_in", trans: "waterlevel_in", isValue: true },
                { column: "waterlevel_out", trans: "waterlevel_out", isValue: true },
                { column: "waterlevel_out2", trans: "waterlevel_out2", isValue: true },
                { column: "flow_rate", trans: "flow_rate", isValue: true },
                { column: "discharge", trans: "discharge", isValue: true },
                { column: "floodgate_open", trans: "floodgate_open", isValue: true },
                { column: "floodgate_height", trans: "floodgate_height", isValue: true },
            ]
        },
        temperature: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "temp_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "temp_datetime", trans: "datetime" },
                { column: "temp_value", trans: "temp_value", isValue: true },
            ]
        },
        temperature_daily: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "temperature_date",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "temperature_date", trans: "date" },
                { column: "temperature_value", trans: "temp_value", isValue: true },
                { column: "maxtemperature", trans: "maxtemperature", isValue: true },
                { column: "diffmaxtemperature", trans: "diffmaxtemperature", isValue: true },
                { column: "mintemperature", trans: "mintemperature", isValue: true },
                { column: "diffmintemperature", trans: "diffmintemperature", isValue: true },
            ]
        },
        water_resource: {
            columns: [
                { column: "water_resource_oldcode", trans: "water_resource_oldcode" },
                { column: "projectname", trans: "projectname" },
                { column: "projecttype", trans: "projecttype" },
                { column: "fiscal_year", trans: "fiscal_year" },
                { column: "mooban", trans: "mooban" },
                { column: "coordination", trans: "coordination" },
                { column: "benefit_household", trans: "benefit_household" },
                { column: "benefit_area", trans: "benefit_area" },
                { column: "capacity", trans: "capacity" },
                { column: "standard_cost", trans: "standard_cost" },
                { column: "budget", trans: "budget" },
                { column: "contract_signdate", trans: "contract_signdate" },
                { column: "contract_enddate", trans: "contract_enddate" },
                { column: "rec_date", trans: "rec_date" },
            ]
        },
        waterquality: {
            name: "waterquality_station_name",
            lat: "waterquality_station_lat",
            long: "waterquality_station_long",
            date: "waterquality_datetime",
            columns: [
                { column: "waterquality_station_name", trans: "tele_station_name" },
                { column: "waterquality_datetime", trans: "datetime" },
                { column: "waterquality_do", trans: "waterquality_do", isValue: true },
                { column: "waterquality_ph", trans: "waterquality_ph", isValue: true },
                { column: "waterquality_temp", trans: "waterquality_temp", isValue: true },
                { column: "waterquality_turbid", trans: "waterquality_turbid", isValue: true },
                { column: "waterquality_bod", trans: "waterquality_bod", isValue: true },
                { column: "waterquality_tcb", trans: "waterquality_tcb", isValue: true },
                { column: "waterquality_fcb", trans: "waterquality_fcb", isValue: true },
                { column: "waterquality_nh3n", trans: "waterquality_nh3n", isValue: true },
                { column: "waterquality_wqi", trans: "waterquality_wqi", isValue: true },
                { column: "waterquality_ammonium", trans: "waterquality_ammonium", isValue: true },
                { column: "waterquality_nitrate", trans: "waterquality_nitrate", isValue: true },
                { column: "waterquality_colorstatus", trans: "waterquality_colorstatus" },
                { column: "waterquality_status", trans: "waterquality_status" },
                { column: "waterquality_salinity", trans: "waterquality_salinity", isValue: true },
                { column: "waterquality_conductivity", trans: "waterquality_conductivity", isValue: true },
                { column: "waterquality_tds", trans: "waterquality_tds", isValue: true },
                { column: "waterquality_chlorophyll", trans: "waterquality_chlorophyll", isValue: true },
            ]
        },
        weather_forecast: {
            date: "weather_date",
            columns: [
                { column: "weather_date", trans: "date" },
                { column: "overall_forcast", trans: "overall_forcast" },
                { column: "region_forcast", trans: "region_forcast" },
            ]
        },
        wind: {
            name: "tele_station_name",
            lat: "tele_station_lat",
            long: "tele_station_long",
            date: "wind_datetime",
            columns: [
                { column: "tele_station_name", trans: "tele_station_name" },
                { column: "wind_datetime", trans: "datetime" },
                { column: "wind_speed", trans: "wind_speed", isValue: true },
                { column: "wind_dir_value", trans: "wind_dir_value", isValue: true },
                { column: "wind_dir", trans: "wind_dir" },
            ]
        },
    }

    sp.modal_weather_map_marker = new L.FeatureGroup();
    // set default marker
    sp.marker = { radius: 4, fillColor: "#FF7415", color: "#4c4c4c", weight: 1, opacity: 0.8, fillOpacity: 1 };

    sp.modal_table = $('#modal').find('div#modal-table');
    sp.modal_img = $('#modal').find('div#modal-img');
    sp.modal_weather_table = $('#modal').find('div#modal-weather-table');
    sp.modal_weather_map = $('#modal').find('div#modal-weather-map');
    sp.modal_agency_table = $('#modal-agency-table').find('tbody');

    apiService.SendRequest("GET" , sp.serviceShopping , {} , sp.handlerServiceShopping);
};

/**
*   handler service sp.serviceShopping
*   @param {object} rs - result from service
*/
sp.handlerServiceShopping = function(rs){
    if (JH.GetJsonValue(rs , "result") != "OK"){ return false; }
    var data = JH.GetJsonValue(rs , "data");
    var sortedData = data.splice(0, 1);
    JH.Sort(data, "agency_name", false , JH.GetLangValue);
    sortedData = sortedData.concat(data);
    JH.Set('data' , sortedData);
    for (var i = 0 ; i < sortedData.length ; i++){
        var d = sortedData[i];
        var agency = JH.GetJsonLangValue(d , "agency_name", true);
        var metadata = JH.GetJsonValue_Int(d , "metadata");
        var metadata_status_connect = JH.GetJsonValue_Int(d , "metadata_status_connect");
        var metadata_status_wait_update = JH.GetJsonValue_Int(d , "metadata_status_wait_update");
        var metadata_status_wait_connect = JH.GetJsonValue_Int(d , "metadata_status_wait_connect");
        var dataservice = JH.GetJsonValue_Int(d , "dataservice");

        var headText = (i + 1) + ". " + agency + " (" + TRANSLATOR["metadata"].replace("%s" , metadata);
        if (metadata_status_connect != 0){ headText += TRANSLATOR["metadata_status_connect"].replace("%s" , metadata_status_connect) ;}
        if (metadata_status_wait_update != 0){ headText += TRANSLATOR["metadata_status_wait_update"].replace("%s" , metadata_status_wait_update) ;}
        if (metadata_status_wait_connect != 0){ headText += TRANSLATOR["metadata_status_wait_connect"].replace("%s" , metadata_status_wait_connect) ;}
        if (dataservice != 0){ headText += TRANSLATOR["dataservice"].replace("%s" , dataservice) ;}
        headText += " )";
        sp.gencard(headText , i);
    }
    sp.already_done = false;
};

/**
*   genarate card
*   @param {string} headText - text in panal header
*   @param {int} i - card row
*/
sp.gencard = function(headText , i){
    var card ='<div class="card">'+
    '<div class="card-header" role="tab">'+
    '<h6 class="card-title">'+'<a class="text-secondary" role="button" data-toggle="collapse" aria-extended="true" data-parent="#accordion" href="#card' + i + '" >'+headText +'</a>'+'</h6>'+'</div>'+

    '<div id="card' + i + '" class="card-collapse collapse" role="tabcard">'+

    '<div class="card-body">'+
    '</div>'+'</div>'+'</div>'+'<div class="custom-margin"></div>';

    $('#accordion').append(card);
}

/**
*   event accordion on hide
*   clear panal body
*   @param {Event} e - eventObject
*/
$('#accordion').on('hidden.bs.collapse', function (e) {
    var card = $(e.target);
    card.find('.card-body').empty();
});

/**
*   event accordion on show
*   load and display card body
*   @param {Event} e - eventObject
*/
$('#accordion').on('show.bs.collapse', function (e) {
    if ( sp.already_done ){
        sp.already_done = false;
    }else{
        // หยุดไว้ก่อนอย่าพึ่งโชว์จนกว่าจะโหลดข้อมูลเสร็จ
        e.preventDefault();
        var card = $(e.target);
        var id = card.get(0).id;
        var data = JH.Get('data.' + id.replace("card" , ""));
        var param = { agency: JH.GetJsonValue_Int(data , "agency_id") };
        JH.Set('agency' , JH.GetJsonValue_Int(data , "agency_id"));
        apiService.SendRequest( "GET" , sp.serviceDetail , param , function(rs){
            var tbl = $('<table class="no-thead table table-bordered display"><tbody></tbody></table>');
            card.find('.card-body').append( $('<div class="table-responsive"></div>').append(tbl) );

            tbl.find('tbody').empty().append(
                sp.genConnect( JH.GetJsonValue(rs , "connect") )
                + sp.genWaitUpdate( JH.GetJsonValue(rs , "wait_update") )
                + sp.genWaitConnect( JH.GetJsonValue(rs , "wait_connect") )
                + sp.genCancel( JH.GetJsonValue(rs , "cancel") )
                + sp.genAgencyCount( JH.GetJsonValue(rs , "agency_count") )
            );

            sp.already_done = true;
            card.collapse('show');
        })
    }
});

/**
*   genarate table
*   @param {string} status - ชนิดของตาราง
*   @param {object} data - ข้อมูล
*   @return {string} ตาราง
*/
sp.genTable = function(status, data){
    if (typeof data === "undefined" || !data ){ return "" ;}
    if (data.length == 0){ return ""; }
    JH.Set(status , data);
    var isConnect = ( status == "connect" );
    var tb = '<tr class="bg-info-table" align="center"><td colspan="3">' + TRANSLATOR["tr_metadata_status_" + status] + '</td></tr>';
    tb += '<tr class="bg-info-table" align="center">';
    tb += '<td>' + TRANSLATOR['col_order'] + '</td>';
    if ( isConnect ){ // ถ้า สถานะเป็น connect จะต้องมี คอลั่ม ความถี่
        tb += '<td >' + TRANSLATOR["col_name"] + '</td>';
        tb += '<td >' + TRANSLATOR["col_frequency"] + '</td>';
    }else{
        tb += '<td colspan="2">' + TRANSLATOR["col_name"] + '</td>';
    }
    tb += '</tr>';
    for (var i = 0 ; i < data.length ; i++){
        tb += '<tr>';
        tb += '<td class="text-center"> ' + (i + 1 ) + ' </td>';
        if ( isConnect ){
            if ( JH.GetJsonValue(data[i], "dataimport_download_id") && JH.GetJsonValue(data[i], "dataimport_dataset_id") ){
                tb += '<td> <a href="javascript:sp.showDetail('+i+')">' + JH.GetJsonLangValue(data[i] , 'metadataservice_name', true) + '</a> </td>';
            }else{ // no dataimport_download_id, dataimport_dataset_id
                tb += '<td>' + JH.GetJsonLangValue(data[i] , 'metadataservice_name', true) + '</td>';
            }
            tb += '<td> ' + JH.GetJsonValue(data[i] , 'metadata_convertfrequency') + ' </td>';
        }else{
            tb += '<td colspan="2"> ' + JH.GetJsonLangValue(data[i] , 'metadataservice_name', true) + ' </td>';
        }
        tb += '</tr>';
    }
    return tb;
}

/**
*   genarate table connect
*   @param {object} data - ข้อมูล
*   @return {string} ตาราง
*/
sp.genConnect = function(data){
    return sp.genTable('connect', data);
}

/**
*   display data
*   @param {int} index - แถวที่ ชอง panal
*/
sp.showDetail = function(index){
    var data = JH.Get('connect.'+index);
    var param = { metadata: JH.GetJsonValue_Int(data , "id") };

    apiService.SendRequest("GET" , sp.serviceMetadata , param , function(rs){
        if (JH.GetJsonValue(rs , "result") != "OK"){ alert('something went wrong'); return false;}
        JH.Set("modal_data" , JH.GetJsonValue(rs , "data"));
        $('#modal').modal('show');
    })
}

/**
*   genarate table wait update
*   @param {object} data - ข้อมูล
*   @return {string} ตาราง
*/
sp.genWaitUpdate = function(data){
    return sp.genTable('wait_update', data);
}

/**
*   genarate table wait connect
*   @param {object} data - ข้อมูล
*   @return {string} ตาราง
*/
sp.genWaitConnect = function(data){
    return sp.genTable('wait_connect', data);
}

/**
*   genarate table cancel
*   @param {object} data - ข้อมูล
*   @return {string} ตาราง
*/
sp.genCancel = function(data){
    return sp.genTable('cancel', data);
}

/**
*   genarate table จำนวนการที่ขอใช้บริการข้อมูล
*   @param {object} data - ข้อมูล
*   @return {string} ตาราง
*/
sp.genAgencyCount = function(data){
    if (typeof data === "undefined" || !data ){ return "" ;}
    if (data.length == 0){ return ""; }
    JH.Set("agencycount" , data);
    var tb = '<tr class="bg-info-table" align="center"><td colspan="3">' + TRANSLATOR["tr_metadata_dataservice"] + '</td></tr>';
    tb += '<tr class="bg-info-table" align="center">';
    tb += '<td>' + TRANSLATOR['col_order'] + '</td>';
    tb += '<td>' + TRANSLATOR["col_agency_name"] + '</td>';
    tb += '<td>' + TRANSLATOR["col_agency_count"] + '</td>';
    tb += '</tr>';
    for (var i = 0 ; i < data.length ; i++){
        tb += '<tr>';
        tb += '<td class="text-center"> ' + (i + 1 ) + ' </td>';
        tb += '<td> <a href="javascript:sp.showAgency('+i+')">' + JH.GetJsonLangValue(data[i] , 'agency_name', true) + '</a> </td>';
        tb += '<td class="text-center"> ' + JH.GetJsonValue(data[i] , 'count') + ' </td>';
        tb += '</tr>';
    }
    return tb;
}

/**
*   แสดงรายระเอียด การใช้บริการข้อมูล
*   @param {int} int - แถวที่ ของ ตาราง
*/
sp.showAgency = function(i){
    var data = JH.Get('agencycount.'+i);
    sp.detailAgencyName = JH.GetJsonLangValue(data, "agency_name",true);
    var param = { agency: JH.GetJsonValue_Int(data , "agency_id") , m_agency: JH.Get('agency') };

    apiService.SendRequest("GET" , sp.serviceAgency , param , function(rs){
        if (JH.GetJsonValue(rs , "result") != "OK"){ alert('something went wrong'); return false;}
        JH.Set("modal_agency_data" , JH.GetJsonValue(rs , "data"));
        $('#modal-agency').modal('show');
    })
}

/**
*   event on modal show
*   load and display modal
*   @param {Event} e - eventObject
*/
$('#modal').on('show.bs.modal' , function(e){
    if( sp.modal_already_done ){
        sp.modal_already_done = false;
    }else{
        // หยุดไว้ก่อนจนกว่าจะโหลดข้อมูลเสร็จ
        e.preventDefault();

        sp.genModalTable();
        sp.genModalImg();
        sp.genModalWeather();

        sp.modal_already_done = true;
        $('#modal').modal('show');
    }
});

/**
*   event on modal show ( wait for CSS transitions to complete )
*   set map to default
*   @param {Event} e - eventObject
*/
$('#modal').on('shown.bs.modal' , function(e){
    if ( sp.IsModalWeather ){
        sp.IsModalWeather = false;
        sp.modal_weather_map.css("height" , "650");
        if (typeof sp.map === "undefined"){
            // สร้าง map ตอน modal shown ครั้งแรก
            sp.map = LL.Map('modal-weather-map');
        }
        sp.modal_weather_map_marker.addTo(sp.map);
        LL.CenterDefault(sp.map);
    }
});

/**
*   genarate table on modal
*/
sp.genModalTable = function(){
    sp.modal_table.empty();
    var table = JH.GetJsonValue( JH.Get("modal_data") , "table" );

    if ( table == "" ){ return false ;}

    sp.modal_table.append(sp.genTable_ModalTable(table, JH.GetJsonValue( JH.Get("modal_data"), "tb_name"), false));
}

/**
*   genarate image on modal
*/
sp.genModalImg = function(){
    sp.modal_img.empty();
    var img = JH.GetJsonValue( JH.Get("modal_data") , "img" );
    if ( img == "" ){ return false; }
    for (var i = 0 ; i < img.length ; i++){
        var d = img[i];
        var filename = JH.GetJsonValue(d, "filename");
        var media_path = JH.GetJsonValue( d , "media_path");
        if ( sp.isImageFile(filename) ){
            var div = document.createElement("div");
            div.className = "col-sm-3";

            var image = document.createElement("img");
            image.src = media_path;
            image.className  = "img-responsive img-thumbnail";

            div.appendChild(image);
            sp.modal_img.append(div);
        }else{
            var a = '<a href="'+media_path+'">'+filename+'</a><br>';
            sp.modal_img.append(a);
        }
    }
}

/**
*   genarate map and table on modal
*/
sp.genModalWeather = function(){
    if (typeof sp.map !== "undefined"){ sp.map.removeLayer(sp.modal_weather_map_marker); }
    sp.modal_weather_table.empty();
    sp.modal_weather_map_marker = new L.FeatureGroup();
    sp.modal_weather_map.css("height" , "0");

    var weather = JH.GetJsonValue( JH.Get("modal_data") , "weather" );
    if (weather == "") { return false; }

    sp.IsModalWeather = true;

    sp.modal_weather_table.append(sp.genTable_ModalTable(weather, JH.GetJsonValue( JH.Get("modal_data"), "tb_name"), true));
}

/**
*   function genarate table
*   @param {object} rs - object to display
*   @param {string} tb_name - table name
*   @param {bool} hasMap - has map in modal ?
*   @return {string} table
*/
sp.genTable_ModalTable = function(rs , tb_name, hasMap){
    var columns = JH.GetJsonValue( rs , "columns" );
    var use_columns = [];
    var data = JH.GetJsonValue( rs , "data" );

    var tbl = $('<table class="table table-bordered display"><thead></thead><tbody></tbody></table>');
    var tbl_head = tbl.find('thead');
    var tbl_body = tbl.find('tbody');
    var date = null;

    var cfg =  JH.GetJsonValue(sp.tbConfig, tb_name);
    // tb_name ต้องมีอยู่ใน tbConfig
    if ( !cfg ) { console.error('no config'); return false; }
    if ( JH.GetJsonValue(cfg, 'date') ){ date = JH.GetJsonValue(cfg, 'date'); }

    var c_lat = JH.GetJsonValue(cfg, "lat");
    var c_long = JH.GetJsonValue(cfg, "long");
    var c_name = JH.GetJsonValue(cfg, "name");
    var c_date = JH.GetJsonValue(cfg, "date");

    // ใส่หัวตาราง
    var tr = "<tr>";
    for( var i = 0 ; i < cfg.columns.length; i++){
        var _column = cfg.columns[i].column;
        if ( $.inArray( _column, columns ) > -1 ){
            // มี colum นี้จาก rs เก็บไว้ใน use_columns เพื่อที่จะใช้ในการทำ tbody
            use_columns.push( cfg.columns[i] );
            tr += "<th>"+ JH.GetJsonValue(TRANS_tbConfig,  cfg.columns[i].trans) + "</th>";
        }
    }
    tr += "</tr>";
    tbl_head.append(tr);

    // ใส่ tbody
    for(var i = 0 ; i < data.length ; i++){
        tr = "<tr>";
        var d = data[i];

        for( var j = 0 ; j < use_columns.length; j++){
            var _tb_name = null;
            var _isValue = JH.GetJsonValue(use_columns[j], "isValue");
            if ( use_columns[j].column == c_name ){ _tb_name = tb_name ;} // ถ้าเป็น column name ใส่ tb_name

            tr += '<td>' + sp.genDataColumn(d, use_columns[j].column, _tb_name, _isValue, c_date) + '</td>';
        }

        if ( hasMap ){ // มีแผนที่ด้านซ้าย
            if( !c_lat || !c_long ){ continue } // ไม่มี config lat long ข้ามไป
            var _lat = JH.GetJsonValue(d , c_lat);
            var _long = JH.GetJsonValue(d , c_long);
            var _name = JH.GetJsonLangValue(d, c_name, true);
            if (_lat != "" && _long != ""){
                // add marker to map
                var marker = new L.circleMarker([_lat,_long], sp.marker);
                marker.bindPopup( _name ).bindTooltip( _name );
                sp.modal_weather_map_marker.addLayer(marker);
            }
        }

        tr += "</tr>";
        tbl_body.append(tr);
    }
    return tbl;
}

/**
*   genarate ข้อมูลในคอลั่ม
*   @param {object} d - json data
*   @param {string} column - column ที่จะให้ดึงจาก d
*   @param {string|null} tb_name - null ถ้าไม่ใช่ column name
*   @param {boolean} isValue -
*   @param {string} c_date - column date ที่จะใช้เช็ควันปัจจุบัน
*   @return {string} ค่าที่ได้จาก d
*/
sp.genDataColumn = function(d, column, tb_name, isValue, c_date){
    var text = JH.GetJsonValue(d , column);
    if ( typeof text === 'object' ){ text = JH.GetJsonLangValue(d, column, true); }// เป็น object แสดงว่าต้องดึงมาก lang
    if ( text ){ // เช็คถ้า text != ""
        if ( column.indexOf('_datetime') !== -1 ){ text = JH.DateFormat(text, 'YYYY-MM-DD HH:mm'); }
        else if ( column.indexOf('_date') !== -1 ){ text = JH.DateFormat(text, 'YYYY-MM-DD'); }
    }
    if ( tb_name ){ // ส่ง tb_name มาด้วย แสดงว่า เป็นชื่อ สร้าง chart link ตาม sp.tbChart
        text = sp.genChartLink(d, text, tb_name);
    }else if( isValue ){ // เป็น value ต้องเป็นข้อความสีแดงถ้า วันที่ ไม่ใช่วันปัจจุบัน
        if ( !moment().isSame( moment.utc(JH.GetJsonValue(d, c_date) ), 'day') ){
            // ไม่ใช่วันปัจจุบัน
            text = '<font color="red">' + text + '</font>';
        }
    }
    return text;
}

/**
*   genarate link graphing as configured
*   @param {object} d - json data
*   @param {string} text - link text
*   @param {string} tb_name - table name
*   @return {string} a tag
*/
sp.genChartLink = function(d, text, tb_name){
    var tbChart = JH.GetJsonValue(sp.tbChart, tb_name);
    if ( !tbChart ){ return text; }

    var a = "<a href='"+ JH.GetJsonValue(tbChart, "url");
    var query = JH.GetJsonValue(tbChart, "query");
    for ( var i = 0 ; i < query.length; i++){
        var q = query[i];
        a += "&" + JH.GetJsonValue(q, "text");
        a += "=" + sp.genDataColumn(d, JH.GetJsonValue(q, "from"));
    }
    a += "' target='_bank'>" + text + "</a>";
    return a;
}

/**
*   event modal-agency on show
*   modal รายระเอียดการใช้บริการข้อมูล
*   @param {Event} e - Event object
*/
$('#modal-agency').on('show.bs.modal' , function(e){
    if( sp.modal_already_done ){ sp.modal_already_done = false; }
    else{
        // หยุดไว้ก่อนจนกว่าจะโหลดข้อมูลเสร็จ
        e.preventDefault();

        sp.genModalAgencyTable();

        sp.modal_already_done = true;
        $('#modal-agency').modal('show');
    }
});

/**
*   genarate table บน modal รายระเอียดการใช้บริการข้อมูล
*/
sp.genModalAgencyTable = function(){
    $('#modal-agency-header').text( JH.GetJsonValue(sp, "detailAgencyName") );
    sp.modal_agency_table.empty();
    var data = JH.Get("modal_agency_data");

    if ( data == "" ){ return false ;}
    for(var i = 0 ; i < data.length ; i++){
        var d = data[i];
        var tr = "<tr>";
        var rs_date = "";
        tr += "<td>" + (i + 1) + "</td>";
        tr += "<td>" + JH.GetJsonValue(d , "id") + "</td>";
        tr += "<td>" + JH.GetJsonValue(d , "user_name") + "</td>";
        tr += "<td>" + JH.GetJsonLangValue(d , "metadata_name", true) + "</td>";
        tr += "<td>" + JH.GetJsonLangValue(d , "servicemethod_name", true) + "</td>";
        tr += "<td>" + JH.DateFormat( JH.GetJsonValue(d , "create_date"), 'DD MMM YYYY' ) + "</td>";
        if ( JH.GetJsonValue(d , "result_date") ){
            rs_date = JH.DateFormat( JH.GetJsonValue(d , "result_date"), 'DD MMM YYYY' );
        }
        tr += "<td>" + rs_date + "</td>";
        tr += "<td>" + sp.renderResult( JH.GetJsonValue(d , "result") ) + "</td>";
        tr += "</tr>";
        sp.modal_agency_table.append(tr);
    }
}

/**
*   render สถานะการให้บริการ ให้เป็น เป็น ข้อความ
*   @param {string} text - status
*/
sp.renderResult = function(text){
    if (text == ""){ return ""; }
    return TRANSLATOR["result_"+text];
}

/**
*   check ว่าเป็นประเภทรูปภาพ
*   @param {string} filename - filename
*   @return {bool} is image
*/
sp.isImageFile = function(filename){
    return filename.match(/.(jpg|jpeg|png|gif)$/i);
}
