/**
*
*   graphWaterLevel Object for handler iframe graph waterlevel.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var graphWaterLevel = {};

/**
*   Initial graphWaterLevel
*   @param {object} trans - translate object from laravel
*   @param {int} station - station id
*   @param {string} station_type - station type
*   @param {string} province - province code
*   @param {string} name - station name
*/
graphWaterLevel.init = function(trans, station, station_type, province, name){
    graphWaterLevel.service = "thaiwater30/iframe/waterlevel";
    graphWaterLevel.serviceShared = "thaiwater30/frontend/shared/";
    graphWaterLevel.translator = trans;
    graphWaterLevel.station = station;
    graphWaterLevel.name = name;
    graphWaterLevel.station_type = station_type;
    graphWaterLevel.province = province;
    $('#btn_preview').on('click' , graphWaterLevel.btnPreviewClick);

    $('#province').on('change' , graphWaterLevel.handlerProvinceChange);

    apiService.SendRequest( "GET", graphWaterLevel.service , {} , graphWaterLevel.handlerSrv );
    HC.useDefaultTooltip();
}

/**
*   event on btn preview click
*   load data and render grpah
*/
graphWaterLevel.btnPreviewClick = function(){
    var vals = $('#id').val().split(".");
    if ( vals.length != 2 ) { return false; }
    var param = {
        id : vals[1] ,
        station_type :vals[0]
    };
    apiService.SendRequest("GET", graphWaterLevel.service + "_graph", param , function(rs){
        if (rs.result == "OK"){
            var rs = JH.GetJsonValue(rs, "data");
            var seriData = [];
            var firstTs = 0; // timestamp อันแรกเพื่อใช้ในการ ตรึง plotLines
            var data = JH.GetJsonValue(rs, "graph_data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "datetime") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "value", null);
                seriData.push([_time, _rainfall]);

                if ( i == 0 ){ firstTs = _time; }
            }
            option = {
                title: { text: chart_title },
                xAxis: {
                    type: 'datetime',
                    labels: { rotation: -90 }
                },
                yAxis: {
                    title: {
                        text: yAxis_text
                    }
                },
                legend:{ enabled: false }, // hide legend
                series: []
            }
            mb = JH.GetJsonValue_Float(rs, "min_bank");
            gl = JH.GetJsonValue_Float(rs, "ground_level");
            option["series"].push( HC.Series($('#id :selected').text(), 'line', seriData) );
            option["series"].push( HC.PS(graphWaterLevel.translator["lower_bank"], [ [firstTs, mb] ]) );
            option["series"].push( HC.PS(graphWaterLevel.translator["ground_level"] , [ [firstTs, gl] ]) );

            pl = [
                HC.PlotLines(graphWaterLevel.translator["lower_bank"] + " " + mb, mb, 'red')
                , HC.PlotLines(graphWaterLevel.translator["ground_level"] + " " + gl, gl)
            ]
            option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});
            $('#graph').highcharts(option);
        }
    });
}

/**
*   handler service
*   load data and render select province
*   @param {object} rs - result from service
*/
graphWaterLevel.handlerSrv = function(rs){
    var select = document.getElementById("province");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;

    if (graphWaterLevel.province != ""){
        hasDefault = true;
    }

    if (rs.result == "OK"){
        data = JH.GetJsonValue(rs, "data");
        // sort ตาม province name
        JH.Sort(data, "province_name", false, function(obj){
            return JH.GetLangValue(obj).toLowerCase();
        });
        for (var i = 0 ; i < data.length ; i++){
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(data[i],'province_name',true);
            var	val_option = JH.GetJsonValue(data[i],'province_code');

            if (hasDefault){
                if (val_option == graphWaterLevel.province){
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
graphWaterLevel.handlerProvinceChange = function(){
    param = {"province_code" : $(this).val() };
    apiService.GetCachedRequest(graphWaterLevel.serviceShared+"tele_canal_station", param, graphWaterLevel.handlerSrvStation);
}

/**
*   handler service station
*   สร้าง select station กรุ๊ปโดย station type
*   @param {object} rs - result from service station
*/
graphWaterLevel.handlerSrvStation = function(rs){
    var select = document.getElementById("id");
    var selectIndex = 0, tempSelectIndex = 0, hasDefault = false;
    var i = 0 , j = 0;

    select.innerHTML = ""; // clear select to empty
    if (rs.result == "OK"){

        if (graphWaterLevel.station != "" || graphWaterLevel.name != ""){
            hasDefault = true;
        }
        var data = JH.GetJsonValue(rs, "data");
        for( key in data){
            var data_key = data[key];
            // sort ตามเรียงตามชื่อสถานี
            JH.Sort(data_key, "station_name", false, function(x){
                return JH.GetLangValue(x).toLowerCase();
            });
            var option_group = document.createElement("optgroup");
            option_group.label = JH.GetJsonValue(graphWaterLevel.translator, key);
            select.add(option_group);
            var dlen = data_key.length ;
            for ( i = 0 ; i < dlen ; i++, tempSelectIndex++){
                var option = document.createElement("option");
                var txt_option = JH.GetJsonLangValue(data_key[i], "station_name", true);
                var val_option = JH.GetJsonValue(data_key[i], "station_id");
                if ( key == "canal_waterlevel" ){ val_option = JH.GetJsonValue(data_key[i], "id"); }

                if (hasDefault && graphWaterLevel["station_type"] == key ){
                    if (val_option == graphWaterLevel.station && graphWaterLevel.station != ""){
                        selectIndex = tempSelectIndex;
                    }else if (txt_option == graphWaterLevel.name && graphWaterLevel.name != ""){
                        selectIndex = tempSelectIndex;
                    }
                }
                option.text = txt_option;
                option.value = key + "." + val_option;
                option_group.appendChild(option);
            }
        }
        select.selectedIndex = selectIndex;

        if (hasDefault){
            // clear default value
            graphWaterLevel.station = "";
            graphWaterLevel.name = "";
            $('#btn_preview').trigger('click');
        }
    }
}
