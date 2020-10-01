/**
*
*   graphWaterQuality Object for handler iframe graph quality.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var graphWaterQuality = {};

/**
*   Initial graphWaterQuality
*   @param {object} trans - translate object from laravel
*   @param {int} station - station id
*   @param {string} province - province code
*   @param {string} name - station name
*/
graphWaterQuality.init = function(trans , station , province, name){
    graphWaterQuality.service = "thaiwater30/iframe/waterquality";
    graphWaterQuality.serviceShared = "thaiwater30/frontend/shared/waterquality_station";
    graphWaterQuality.translator = trans;
    graphWaterQuality.station = station;
    graphWaterQuality.name = name;
    graphWaterQuality.province = province;
    $('#btn_preview').on('click' , graphWaterQuality.btnPreviewClick);

    $('#province').on('change' , graphWaterQuality.handlerProvinceChange);

    apiService.SendRequest( "GET", graphWaterQuality.service , {} , graphWaterQuality.handlerSrv );
    HC.useDefaultTooltip();
}

/**
*   event on btn preview click
*   load data and render grpah
*/
graphWaterQuality.btnPreviewClick = function(){
    var param = {
        waterquality_station_id : parseInt( $('#id').val() ),
        param : $('#datatype').val(),
        province_code : $('#province').val()
    };
    var datatype_text = $('#datatype>option:selected').text().replace(/\(.*\)/,"");
    var datatype_unit = $('#datatype>option:selected').text().replace(datatype_text , "");
    apiService.SendRequest("GET", graphWaterQuality.service+"_graph", param , function(rs){
        var station_name = $('#id>option:selected').text();
        if (rs.result == "OK"){
            rs = JH.GetJsonValue(rs, "data");
            var seriData = [];
            var data = JH.GetJsonValue(rs[0], "data");
            var dLen = data.length;
            var leapYear = 2016;
            // เตรียม ซีรีย์ดาต้า
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                mm = moment.utc( JH.GetJsonValue(d, "datetime") );
                if ( mm.format('mm') != '00' ){ continue; }
                _time = parseInt( mm.format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "value", null);
                seriData.push([_time, _rainfall]);
            }
            option = {
                title:{ text : graphWaterQuality.translator["waterquality_graph_title_link"] + datatype_text +":"+station_name },
                xAxis: {
                    type: 'datetime',
                    title: { text: xAxis_text },
                    labels: { rotation: -90 }
                },
                yAxis: {
                    title: {
                        text: $('#datatype>option:selected').text()
                    }
                },
                series: []
            }
            if (param.param == "ph"){
                option["yAxis"] = $.extend(option["yAxis"], { min: 0, max: 14, tickInterval: 3.5});
            }
            option["series"].push( HC.Series(station_name, null, seriData));
            // ใส่เกณฑ์ลงกราฟ
            var scale = JH.GetJsonValue( JH.Get('scale'), 'scale.' + param.param  );
            if ( scale ){
                var pl = [];
                for (var i = 0 ; i < scale.length; i++){
                    var s = scale[i];
                    if ( !JH.GetJsonValue(s, "inGraph") ){ continue; }
                    var text = JH.GetJsonValue(s, "text") + ' ' + TRANSLATOR[JH.GetJsonValue(s, "trans")];
                    var value = JH.GetJsonValue_Float(s, "term");
                    var color = JH.GetJsonValue(s, "color");
                    option["series"].push(
                        HC.PS(text, value)
                    );
                    pl.push(
                        HC.PlotLines(text, value, color)
                    );
                }
                option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl });
            }

            $('#graph').highcharts(option);
        }
    });

}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphWaterQuality.handlerSrv = function(rs){
    graphWaterQuality.handlerSrvProvince(rs.province);
    graphWaterQuality.handlerSrvDatatype(rs.datatype);
    graphWaterQuality.handlerSrvSetting(rs.setting);
}

/**
*   handler service scale setting
*   set scale to cache
*   @param {object} rs - result.setting from service
*/
graphWaterQuality.handlerSrvSetting = function(rs){
    if (rs.result == "OK"){
        data = JH.GetJsonValue(rs, "data");
        JH.Set("scale", data);
    }
}

/**
*   handler service datatype
*   render select datatype
*   @param {object} rs - result.datatype from service
*/
graphWaterQuality.handlerSrvDatatype = function(rs){
    if (rs.result == "OK"){
        var select = document.getElementById("datatype");
        select.options.length = 0;
        data = JH.GetJsonValue(rs, "data");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = data[i]["text"];
            var val_option = JH.GetJsonValue(d, "value");

            option.text = txt_option;
            option.value = val_option;
            select.add(option);
        }
    }
}

/**
*   handler service province
*   render select province
*   @param {object} rs - result.province from service
*/
graphWaterQuality.handlerSrvProvince = function(rs){
    var select = document.getElementById("province");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;

    if (graphWaterQuality.province != ""){
        hasDefault = true;
    }

    if (rs.result == "OK"){
        data = JH.GetJsonValue(rs, "data");
        JH.Sort(data, "province_name", false, function(obj){
            return JH.GetLangValue(obj).toLowerCase();
        });
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "province_name");
            var	val_option = JH.GetJsonValue(d, "province_code");

            if (hasDefault){
                if (val_option == graphWaterQuality.province){
                    selectIndex = i;
                }
            }

            option.text = txt_option;
            option.value = val_option;
            select.add(option);
        }
        select.selectedIndex  = selectIndex;
    }

    if (hasDefault){
        $(select).trigger('change');
    }
}

/**
*   event on select province change
*   load data and render select station
*/
graphWaterQuality.handlerProvinceChange = function(){
    param = {"province_code" : $(this).val() };
    apiService.GetCachedRequest(graphWaterQuality.serviceShared, param, graphWaterQuality.handlerSrvStation);
}

/**
*   handler service station
*   render select station
*   @param {object} rs - result from service station
*/
graphWaterQuality.handlerSrvStation = function(rs){
    var select = document.getElementById("id");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;
    if (rs.result == "OK"){
        data = JH.GetJsonValue(rs, "data");
        // sort ตามเรียงตามชื่อสถานี
        JH.Sort(data, "waterquality_station_name", false, function(x){
            return JH.GetLangValue(x).replace("สถานี" , "").toLowerCase();
        });
        if (graphWaterQuality.station != "" || graphWaterQuality.name != ""){
            hasDefault = true;
        }

        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "waterquality_station_name", true).replace("สถานี" , "");
            var val_option = d["id"];

            if (hasDefault){
                if (val_option == graphWaterQuality.station && graphWaterQuality.station != ""){
                    // query string station
                    selectIndex = i;
                }else if (JH.GetJsonLangValue(d, "waterquality_station_name", true) == graphWaterQuality.name && graphWaterQuality.name != ""){
                    // query string name
                    selectIndex = i;
                }
            }

            option.text = txt_option;
            option.value = val_option;
            select.add(option);
        }
        select.selectedIndex = selectIndex;

        if (hasDefault){
            graphWaterQuality.station = "";
            graphWaterQuality.name = "";
            $('#btn_preview').trigger('click');
        }
    }
}
