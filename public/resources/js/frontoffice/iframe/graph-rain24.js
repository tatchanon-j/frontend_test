/**
*
*   graphRain Object for handler iframe graph rain.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var graphRain = {};

/**
*   Initial graphRain
*   @param {object} trans - translate object from laravel
*   @param {int} station - station id
*   @param {string} province - province code
*   @param {string} name - station name
*/
graphRain.init = function(trans, station, province, name){
    graphRain.service = "thaiwater30/iframe/rain24";
    graphRain.serviceShared = "thaiwater30/frontend/shared/";
    graphRain.translator = trans;
    graphRain.station = station;
    graphRain.name = name;
    graphRain.province = province;
    graphRain.chart = null ;
    $('#btn_preview').on('click' , graphRain.btnPreviewClick);

    $('#province').on('change' , graphRain.handlerProvinceChange);

    apiService.SendRequest( "GET", graphRain.service , {} , graphRain.handlerSrv );
    HC.SetFormat("pointFormat", "0,0.[0]");
    // HC.useDefaultTooltip();
    // custom null value to display -
    Highcharts.setOptions({
        tooltip: {
            formatter: graphRain.ToolTipFormatter
        }
    });
}
/**
*   get tooltipformatter
*/
graphRain.ToolTipFormatter = function(){
    this["fc"] = HC.Labelformatter;
    this["dateTimeLabelFormat"] = HC.Format["headFormat"];
    this["value"] = this.x;
    var t = "";
    var _graph = $('#graph').highcharts();

    // มี 2 series ให้ใช้เฉพาะของอันแรก, มี series เดีนวให้ใช้เป็น -
    if ( this.points.length == 2 ){
        t = numeral(this.points[0].y).format(HC.Format["pointFormat"]);
    }else{
        t = "-";
    }

    // custom date 
    var data_type = $('#datatype').val();
    var date = '';
    if(data_type == 2){
        _dm = moment.utc(this.x).format("DD MMM");
        _y = (parseInt(moment.utc(this.x).format("YYYY"))+543);
        _h = moment.utc(this.x).format("HH:MM");
        _formatter = _dm + ' ' +_y
        date += _formatter;
    }else{
        date += this["fc"]();
    }

    var s = '<span style="font-size: 10px">'+date+'</span><br/>' + 
    '<span style="color:'+ _graph.series[0].color +'">\u25CF</span> '+ 
    _graph.series[0].name + ': <b> '+ t +' </b><br/>';

    return s;
}


/**
*   event on btn preview click
*   load data and render grpah
*/
graphRain.btnPreviewClick = function(){
    var param = {
        id :parseInt( $('#id').val() ),
        datatype : $('#datatype').val(),
        province_code : $('#province').val()
    };
    var _rotation = param["datatype"] == "1" ? -90 : 0; // rotation xAxis label
    apiService.SendRequest("GET", "thaiwater30/iframe/rain24_graph", param , function(rs){
        var datatypeText = $('#datatype>option:selected').text();
        var stationText = $('#id>option:selected').text();
        var seriData = [[],[]];
        var sum = 0;
        if (rs.result == "OK"){
            var data = JH.GetJsonValue(rs, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "rainfall_datetime") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall_value", null);
                seriData[0].push([_time, _rainfall]);
                seriData[1].push([_time, 0]);
                // summary rainfall 24h
                // if (param.datatype == 1){
                //     sum += _rainfall;
                //     seriData[1].push([_time, sum]);
                // }
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    labels: {
                        formatter: function() {
                            _dm = moment.utc(this.value).format("DD MMM");
                            _y = (parseInt(moment.utc(this.value).format("YYYY"))+543);
                            _h = moment.utc(this.value).format("HH:MM");
                            _formatter = param["datatype"] == "1" ? _dm + ' ' +_y + ' ' + _h   : _dm + ' ' +_y
                            return _formatter;
                        },
                        rotation: _rotation
                      }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function() {
                                return numeral(this.y).format(HC.Format["pointFormat"]);
                            }
                        }
                    }
                },
                series: [],
            }

            // if (param.datatype == 1){
            //     HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
            //     option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
            //     _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
            //     _seri["yAxis"] = 1;
            //     option["series"].push( _seri );
            //     option["yAxis"] =[
            //         { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
            //         { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
            //     ];
            // }else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                // series ปล่าวๆเพื่อให้มี xAxis ทุกอัน และ แสดง - ได้
                var tempPS = HC.PS(datatypeText, seriData[1]);
                tempPS["enableMouseTracking"] = true;
                // disable marker, hover state
                tempPS["marker"] = {
                    enabled: false,
                    states: {
                        hover: { enabled: false },
                        select: { enabled: false }
                    }
                };
                tempPS["states"] = {
                    hover: { enabled: false },
                };

                if ( param.datatype == 1 ){
                    option["yAxis"] = { title: { text: graphRain.translator["chart_y_text"] + rain_unit } };
                    option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                }else{
                    option["yAxis"] = { title: { text: datatypeText + rain_unit } };
                    option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                }
                option["series"].push( tempPS ); // ใส่เป็น series ที่ 2

            // }

            $('#graph').highcharts(option);
        }
    });
}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphRain.handlerSrv = function(rs){
    graphRain.handlerSrvProvince(rs.province);
    graphRain.handlerSrvDatatype(rs.datatype);
}

/**
*   handler service province
*   สร้าง select province ถ้ามี province ตอน init จะ default ไปที่อันนั้น
*   @param {object} rs - result.province from service
*/
graphRain.handlerSrvProvince = function(rs){
    var select = document.getElementById("province");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;

    if (graphRain.province != "" || graphRain.name != ""){
        hasDefault = true;
    }

    if (rs.result == "OK"){
        data = JH.GetJsonValue(rs, "data");
        JH.Sort(data, "province_name", false, function(obj){
            return JH.GetLangValue(obj).toLowerCase();
        });
        for (var i = 0 ; i < data.length ; i++){
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(data[i], "province_name", true);
            var	val_option = JH.GetJsonValue(data[i], "province_code");

            if (hasDefault){
                if (val_option == graphRain.province){
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
graphRain.handlerProvinceChange = function(){
    param = {"province_code" : $(this).val() };
    apiService.GetCachedRequest(graphRain.serviceShared+"station", param, graphRain.handlerSrvStation);
}

/**
*   handler service datatype
*   สร้าง select datatype
*   @param {object} rs - result.datatype from service
*/
graphRain.handlerSrvDatatype = function(rs){
    if (rs.result == "OK"){
        var select = document.getElementById("datatype");
        select.options.length = 0;
        data = rs.data;
        for (var i = 0 ; i < data.length ; i++){
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(data[i], "text", true);
            var val_option = JH.GetJsonValue(data[i], "value");

            option.text = txt_option;
            option.value = val_option;
            select.add(option);
        }
    }
}

/**
*   handler service station
*   สร้าง select station ถ้ามี name ตอน init จะ default ไปที่อันนั้น
*   @param {object} rs - result from service station
*/
graphRain.handlerSrvStation = function(rs){
    var select = document.getElementById("id");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;
    if (rs.result == "OK"){
        data = rs.data;
        // sort ตามเรียงตามชื่อสถานี
        JH.Sort(data, "station_name", false, function(x){
            return JH.GetLangValue(x).toLowerCase();
        });
        if (graphRain.station != "" || graphRain.name != ""){
            hasDefault = true;
        }

        for (var i = 0 ; i < data.length ; i++){
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(data[i], "station_name", true);
            var val_option = JH.GetJsonValue(data[i], "station_id");

            if (hasDefault){
                if (val_option == graphRain.station && graphRain.station != "" ){
                    selectIndex = i;
                }else if ( txt_option == graphRain.name && graphRain.name != "" ){
                    selectIndex = i;
                }
            }

            option.text = txt_option;
            option.value = val_option;
            select.add(option);
        }
        select.selectedIndex = selectIndex;

        if (hasDefault){
            graphRain.station = "";
            graphRain.name = "";
            $('#btn_preview').trigger('click');
        }
    }
}
