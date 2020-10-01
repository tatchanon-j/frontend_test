/**
*
*   graphRain Object for handler main page
*
*   @author Werawan Prongpanom<werawan@haii.or.th>
*   @license HAII
*
*/

var graphRain = {};

graphRain.init = function(trans, station, province, name, tab){
    graphRain.service = "thaiwater30/analyst/rain_load";
    graphRain.translator = trans;
    graphRain.station = station;
    graphRain.province = province;
    graphRain.name = name;
    graphRain.tab = tab;
    
    graphRain.initRain();

    // $('#start_date').datepicker('disabled');
    $('#toyearly').datepicker({
        format: "yyyy",
        startMode: "years", 
        minViewMode: "years"
    });
    // $('#date_yesterday').datepicker('setDate', 'today-6');
    $('#todate_yesterday').datepicker();
    $('#month').datepicker({
        format: "mm",
        startMode: "months", 
        minViewMode: "months"
    });
    $('#toyear').datepicker({
        format: "yyyy",
        startMode: "years", 
        minViewMode: "years"
    });

    
    $('#btn_preview').on('click', graphRain.btnPreviewClick);
    graphRain.handlerTab();
    graphRain.handlerStation(); 

    $('#province').on('change', graphRain.handlerProvinceChange);

    apiService.SendRequest( "GET", graphRain.service, {} , graphRain.handlerSrv );
    HC.SetFormat("pointFormat", "0,0.0");
    HC.useDefaultTooltip();
}
// กดดูกราฟจากตารางครั้งแรก
if (tab == 1) {
graphRain.initRain = function(){
    $('#dateyesterday').hide();
    $('#datemonth').hide();
    $('#yearly').hide();

    var param_rain24 = {
        station_id : station
    };

    var datatypes = {
        datatype : tab
    };

    apiService.SendRequest( "GET", "thaiwater30/analyst/rain_24h_graph", param_rain24 , function(rs){
        var datatypeText = $('#datatype>option:selected').text();
        // var stationText = $('#id>option:selected').text();

        var seriData = [[],[]];
        var sum = 0;
        if (rs.result == "OK") {
            var data = JH.GetJsonValue(rs, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "rainfall_datetime") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall_value", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 1) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);

                }
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }

            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                //_seri["yAxis"] = 1;
                option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                    { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                ];
            } else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }
    });
}

} else if (tab == 2) {
    graphRain.initRain = function(){
    $('#dateyesterday').hide();
    $('#datemonth').hide();
    $('#yearly').hide();

    var param_rain24 = {
        station_id : station
    };

    var datatypes = {
        datatype : tab
    };

    apiService.SendRequest( "GET", "thaiwater30/analyst/rain_today_graph", param_rain24 , function(rs){
        var datatypeText = $('#datatype>option:selected').text();
        // var stationText = $('#id>option:selected').text();

        var seriData = [[],[]];
        var sum = 0;
        if (rs.result == "OK") {
            var data = JH.GetJsonValue(rs, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "date_time") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 1) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);

                }
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }

            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                // _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                // //_seri["yAxis"] = 1;
                // option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } }
                ];
            } else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }
    });
    }
} else if (tab == 3) {
    graphRain.initRain = function(){
        $('#todate').hide();
        $('#datemonth').hide();
        $('#yearly').hide();
        $('#dateyesterday').show();

        var param_rainyesterday = {
            station_id : station,
            start_date : $('#date_yesterday').val(),
            end_date : $('#todate_yesterday').val()
        };

        var datatypes = {
            datatype : tab
        }

        apiService.SendRequest("GET","thaiwater30/analyst/rain_yesterday_graph", param_rainyesterday, function(rainyesterday){

            var datatypeText = $('#datatype>option:selected').text();
            
            var seriData = [[],[]];
            var sum = 0;
            
            if (rainyesterday.result == "OK") {
            var data = JH.GetJsonValue(rainyesterday, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "rainfall_datetime") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall_value", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 1) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);
                    
                } 
               
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }

            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                //_seri["yAxis"] = 1;
                option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                    { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                ];
            } 

            else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }

        });

    }
} else if (tab == 4) {
    graphRain.initRain = function(){
        $('#todate').hide();
        $('#dateyesterday').hide();
        $('#yearly').hide();

        var param_rainmonth = {
            station_id : station,
            month : $('#month').val(),
            year : $('#toyear').val()
        };

        var datatypes = {
            datatype : tab
        };

        apiService.SendRequest("GET", "thaiwater30/analyst/rain_monthly_graph", param_rainmonth, function(rainmonth){
            var datatypeText = $('#datatype>option:selected').text();
            var seriData = [[],[]];
            var sum = 0;
            
            if (rainmonth.result == "OK") {
            var data = JH.GetJsonValue(rainmonth, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "rainfall_datetime") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall_value", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 1) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);
                    
                } 
               
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }
            
            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                //_seri["yAxis"] = 1;
                option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                    { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                ];
            } 
            // else if (datatypes.datatype == 3) {
            //     HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
            //     option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );

            // }

            else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }
        });

    }
} else if (tab == 5) {
    graphRain.initRain = function(){
        $('#todate').hide();
        $('#dateyesterday').hide();
        $('#datemonth').hide();

        var param_rainyear = {
            station_id : station,
            year : $('#toyearly').val()
        };
        
        var datatypes = {
            datatype : tab
        };

        apiService.SendRequest("GET", "thaiwater30/analyst/rain_yearly_graph", param_rainyear, function(rainyear){
     
            var datatypeText = $('#datatype>option:selected').text();
            var seriData = [[],[]];
            var sum = 0;
            
            if (rainyear.result == "OK") {
            var data = JH.GetJsonValue(rainyear, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "date_time") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 5) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);
                } 
                
               
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }

            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                //_seri["yAxis"] = 1;
                option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                    { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                ];
            } 
            // else if (datatypes.datatype == 3) {
            //     HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
            //     option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );

            // }

            else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }
        });
    }
}

// กดดูกราฟใน modal แสดงกราฟแล้ว
graphRain.btnPreviewClick = function(){

    var id_station = $('#id').val();
    var data_type = $('#datatype').val();

    if (data_type == '1') {

        $('#dateyesterday').hide();
        $('#datemonth').hide();
        $('#yearly').hide();

        var param_rain24 = {
            station_id : id_station
        };

        var datatypes = {
            datatype : data_type
        };

        apiService.SendRequest( "GET", "thaiwater30/analyst/rain_24h_graph", param_rain24 , function(rs){

            var datatypeText = $('#datatype>option:selected').text();
            // var stationText = $('#id>option:selected').text();

            var seriData = [[],[]];
            var sum = 0;
            if (rs.result == "OK") {
                    var data = JH.GetJsonValue(rs, "data");
                    var dLen = data.length;
                    for (var i = 0 ; i < dLen ; i++){
                        d = data[i];
                        _time = parseInt( moment.utc( JH.GetJsonValue(d, "rainfall_datetime") ).format('x') );
                        _rainfall = JH.GetJsonValue_Float(d, "rainfall_value", null);
                        seriData[0].push([_time, _rainfall]);

                        if (datatypes.datatype == 1) {
                            sum += _rainfall;
                            seriData[1].push([_time, sum]);

                        }
                    }
                    option = {
                        xAxis: {
                            type: 'datetime',
                            tickInterval: 0,
                            labels: { rotation: -90 }
                        },
                        plotOptions: {
                            column: {
                                rotation: 0,
                                dataLabels: {
                                    formatter:function(){
                                        return numeral(this.y).format('0,0.0');
                                    }
                                }
                            }
                        },
                        series: [],
                    }

                    if (datatypes.datatype == 1) {
                        HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                        option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                        _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                        //_seri["yAxis"] = 1;
                        option["series"].push( _seri );
                        option["yAxis"] =[
                            { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                            { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                        ];
                    } else{
                        HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                        option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                        option["yAxis"] = { title: { text: datatypeText + rain_unit } };
                    }

                    $('#graph').highcharts(option);
                }
            });
    } else if (data_type == '2') {

        $('#dateyesterday').hide();
        $('#datemonth').hide();
        $('#yearly').hide();

        var param_rain24 = {
            station_id : id_station
        };

        var datatypes = {
            datatype : data_type
        };

        apiService.SendRequest( "GET", "thaiwater30/analyst/rain_today_graph", param_rain24 , function(rs){

            var datatypeText = $('#datatype>option:selected').text();
            // var stationText = $('#id>option:selected').text();

            var seriData = [[],[]];
            var sum = 0;
            if (rs.result == "OK") {
                    var data = JH.GetJsonValue(rs, "data");
                    var dLen = data.length;
                    for (var i = 0 ; i < dLen ; i++){
                        d = data[i];
                        _time = parseInt( moment.utc( JH.GetJsonValue(d, "date_time") ).format('x') );
                        _rainfall = JH.GetJsonValue_Float(d, "rainfall", null);
                        seriData[0].push([_time, _rainfall]);

                        if (datatypes.datatype == 1) {
                            sum += _rainfall;
                            seriData[1].push([_time, sum]);

                        }
                    }
                    option = {
                        xAxis: {
                            type: 'datetime',
                            tickInterval: 0,
                            labels: { rotation: -90 }
                        },
                        plotOptions: {
                            column: {
                                rotation: 0,
                                dataLabels: {
                                    formatter:function(){
                                        return numeral(this.y).format('0,0.0');
                                    }
                                }
                            }
                        },
                        series: [],
                    }

                    if (datatypes.datatype == 1) {
                        HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                        option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                        _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                        //_seri["yAxis"] = 1;
                        option["series"].push( _seri );
                        option["yAxis"] =[
                            { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                            { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                        ];
                    } else{
                        HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                        option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                        option["yAxis"] = { title: { text: datatypeText + rain_unit } };
                    }

                    $('#graph').highcharts(option);
                }
            });
    } else if (data_type == '3') {
        
        $('#todate').hide();
        $('#datemonth').hide();
        $('#yearly').hide();
        $('#dateyesterday').show();

        var param_rainyesterday = {
            station_id : $('#id').val(),
            start_date : $('#date_yesterday').val(),
            end_date : $('#todate_yesterday').val()
        };

        var datatypes = {
            datatype : data_type
        }

        apiService.SendRequest("GET","thaiwater30/analyst/rain_yesterday_graph", param_rainyesterday, function(rainyesterday){
   
            var datatypeText = $('#datatype>option:selected').text();
            
            var seriData = [[],[]];
            var sum = 0;
            
            if (rainyesterday.result == "OK") {
            var data = JH.GetJsonValue(rainyesterday, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "rainfall_datetime") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall_value", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 1) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);
                    
                } 
               
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }
        
            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                //_seri["yAxis"] = 1;
                option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                    { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                ];
            } 

            else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }

        });
    } else if (data_type == '4') {

        $('#todate').hide();
        $('#dateyesterday').hide();
        $('#yearly').hide();
        $('#datemonth').show();

        var param_rainmonth = {
            station_id : station,
            month : $('#month').val(),
            year : $('#toyear').val()
        };

        var datatypes = {
            datatype : data_type
        };

        apiService.SendRequest("GET", "thaiwater30/analyst/rain_monthly_graph", param_rainmonth, function(rainmonth){
            var datatypeText = $('#datatype>option:selected').text();
            var seriData = [[],[]];
            var sum = 0;
            
            if (rainmonth.result == "OK") {
            var data = JH.GetJsonValue(rainmonth, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "rainfall_datetime") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall_value", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 1) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);
                    
                } 
               
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }
            
            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                //_seri["yAxis"] = 1;
                option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                    { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                ];
            } 
            // else if (datatypes.datatype == 3) {
            //     HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
            //     option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );

            // }

            else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }
        });
    } else if (data_type == '5') {

        $('#todate').hide();
        $('#dateyesterday').hide();
        $('#datemonth').hide();
        $('#yearly').show();

        var param_rainyear = {
            station_id : id_station,
            year : $('#toyearly').val()
        };
        
        var datatypes = {
            datatype : data_type
        };

        apiService.SendRequest("GET", "thaiwater30/analyst/rain_yearly_graph", param_rainyear, function(rainyear){

            var datatypeText = $('#datatype>option:selected').text();
            var seriData = [[],[]];
            var sum = 0;
            
            if (rainyear.result == "OK") {
            var data = JH.GetJsonValue(rainyear, "data");
            var dLen = data.length;
            for (var i = 0 ; i < dLen ; i++){
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "date_time") ).format('x') );
                _rainfall = JH.GetJsonValue_Float(d, "rainfall", null);
                seriData[0].push([_time, _rainfall]);

                if (datatypes.datatype == 5) {
                    sum += _rainfall;
                    seriData[1].push([_time, sum]);
                } 
            }
            option = {
                xAxis: {
                    type: 'datetime',
                    tickInterval: 0,
                    labels: { rotation: -90 }
                },
                plotOptions: {
                    column: {
                        rotation: 0,
                        dataLabels: {
                            formatter:function(){
                                return numeral(this.y).format('0,0.0');
                            }
                        }
                    }
                },
                series: [],
            }
        
            if (datatypes.datatype == 1) {
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
                option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );
                _seri = HC.Series(graphRain.translator["chart_y2_text"], 'line', seriData[1]);
                //_seri["yAxis"] = 1;
                option["series"].push( _seri );
                option["yAxis"] =[
                    { title: { text: graphRain.translator["chart_y_text"] + rain_unit } } ,
                    { title: { text: graphRain.translator["chart_y2_text"] + rain_unit } , opposite: true, }
                ];
            } 
            // else if (datatypes.datatype == 3) {
            //     HC.SetFormat("headFormat", HC.DateTimeLabelFormats.hour);
            //     option["series"].push( HC.Series(graphRain.translator["chart_y_text"], 'column', seriData[0]) );

            // }

            else{
                HC.SetFormat("headFormat", HC.DateTimeLabelFormats.day);
                option["series"].push( HC.Series(datatypeText, 'column', seriData[0]) );
                option["yAxis"] = { title: { text: datatypeText + rain_unit } };
            }

            $('#graph').highcharts(option);
        }
        });
    }
}
graphRain.handlerTab = function(){
    $('#datatype').val(tab);
}
graphRain.handlerStation = function(){
    $('#id').val(station);
}
graphRain.handlerSrv = function(rs){
    graphRain.handlerSrvProvince(rs.province);
}

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
            var val_option = JH.GetJsonValue(data[i], "province_code");

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

graphRain.handlerProvinceChange = function(){
    province_param = $(this).val();
    apiService.GetCachedRequest(graphRain.service, {} , graphRain.handlerSrvStation);
}

graphRain.handlerSrvStation = function(rs){
    var select = document.getElementById("id");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;

    if (graphRain.province != "" || graphRain.name != ""){
        hasDefault = true;
    }

    data = JH.GetJsonValue(rs, "province.data");

    for (var i = 0 ; i < data.length ; i++){
        var province = JH.GetJsonValue(data[i], "province_code");
        var tele = JH.GetJsonValue(data[i], "tele_station");

        if (province_param*1 == province*1) {
            for (var j = 0 ; j < tele.length ; j++){
            var option = document.createElement("option");
            var tele_name = JH.GetJsonLangValue(tele[j], "tele_station_name", true);
            var tele_id = JH.GetJsonValue(tele[j], "tele_station_id");

            if (hasDefault){
                if (tele_id == graphRain.station){
                    selectIndex = j;
                }
            }

            option.text = tele_name;
            option.value = tele_id;
            select.add(option);
            }

            select.selectedIndex  = selectIndex;
        }
    }

    if (hasDefault){
            graphRain.station = "";
            graphRain.name = "";
            $(select).trigger('change');
        }
}





