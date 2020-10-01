/**
*
*   graphWaterLevel Object for handler main page
*
*   @author Werawan Prongpanom<werawan@haii.or.th>
*   @license HAII
*
*/

var graphWaterlevel = {};

graphWaterlevel.init = function(trans, station, province, name, tab){
	graphWaterlevel.service = "thaiwater30/analyst/waterlevel_load";
	graphWaterlevel.translator = trans;
	graphWaterlevel.station = station;
	graphWaterlevel.province = province;
	graphWaterlevel.name = name;
	graphWaterlevel.tab = tab;


	graphWaterlevel.showGraph();


	$('#btn_preview').on('click', graphWaterlevel.btnPreviewClick);

	$('#start_date').datepicker(
		
  	);
	$('#end_date').datetimepicker();

	// $('#graphwaterlevel_year').multiSelect();

	$('#province').on('change', graphWaterlevel.handlerProvinceChange);

    graphWaterlevel.handlerTab();
    graphWaterlevel.handlerStation();


	apiService.SendRequest( "GET", graphWaterlevel.service, {} , graphWaterlevel.handlerSrv );
	HC.useDefaultTooltip();

}

graphWaterlevel.showGraph = function() {
	var waterlevel_param = {
		end_date : $('#end_date').val(),
		station_id : station,
		station_type : "tele_waterlevel",
		start_date : $('#start_date').val()
	};

	var wateryear_param = {
		station_id : station,
		station_type : "canal_waterlevel",
		year : $('#start_year').val()
	};

	var watergate_param = {
		station_id : station, 
		start_date : $('#start_date').val(),
		end_date : $('#end_date').val()
	};

	var datatype = $('#datatype>option:selected').val();

	if (tab == 1) {
		$('#wateryear').hide();

		apiService.SendRequest("GET", "thaiwater30/analyst/waterlevel_graph", waterlevel_param, function(rs){
            console.log(waterlevel_param);
		var station_name = $('#id>option:selected').text();

		 if (rs.result == "OK"){
            var rs = JH.GetJsonValue(rs, "data");
            var seriData = [];
            var firstTs = 0; // timestamp อันแรกเพื่อใช้ในการ ตรึง plotLines
            var data = JH.GetJsonValue(rs, "graph_data");
            var dLen = data.length;

            for (var i = 0; i < dLen; i++) {
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "datetime") ).format('x') );
                _waterlevel = JH.GetJsonValue_Float(d, "value", null);
                seriData.push([_time, _waterlevel]);

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
            option["series"].push( HC.PS(graphWaterlevel.translator["lower_bank"], [ [firstTs, mb] ]) );
            option["series"].push( HC.PS(graphWaterlevel.translator["ground_level"] , [ [firstTs, gl] ]) );

            pl = [
                HC.PlotLines(graphWaterlevel.translator["lower_bank"] + " " + mb, mb, 'red')
                , HC.PlotLines(graphWaterlevel.translator["ground_level"] + " " + gl, gl)
            ]
            option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});
            $('#graph').highcharts(option);
        }
	});
	}
	else if (tab == 2) {
		$('#waterlevelyear').show();
		$('#waterleveldate').hide();

		apiService.SendRequest("GET", "thaiwater30/analyst/waterlevel_yearly_graph", wateryear_param, function(rs){
		
		var station_name = $('#id>option:selected').text();

		if (rs.result == "OK") {
            var rs = JH.GetJsonValue(rs, "data");
            console.log(rs);
		}
		});
	}

	else if (tab == 3){
        
		$('#wateryear').hide();
        var datatype = {
            datatype : tab
        };

		apiService.SendRequest("GET", "thaiwater30/analyst/watergate_graph", watergate_param, function(rs){
			var station_name = $('#id>option:selected').text();

			if (rs.result == "OK") {
                var rs_data = JH.GetJsonValue(rs, "data");
                var gLen = rs_data.length;

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
                    series: [
               
            
            ]
                }

                for (var i = 0; i < gLen; i++){
                    var graph_data = rs_data[i];
                    var seriData_wateryear = [];
                    var _data = JH.GetJsonValue(graph_data, "data");
                    var _name = JH.GetJsonValue(graph_data, "name");
                    var _dLen = _data.length;
                    for (var j = 0; j < _dLen; j++){
                        var d = _data[j];
                        date_wateryear = parseInt( moment.utc( JH.GetJsonValue(d, "datetime") ).format('x') );
                        var value_wateryear = JH.GetJsonValue_Float(d, "value");
                        seriData_wateryear.push([date_wateryear, value_wateryear]);
                    }

                   

                    var _seri_wateryear = HC.Series(_name, 'line', seriData_wateryear);
                    console.log(_seri_wateryear);
                    
                    var data_wateryear = option["series"].push(_seri_wateryear);
                    
                }

                 

                
                pl = []
                option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});
                $('#graph').highcharts(option);
				
			}
		});
	}
}
graphWaterlevel.btnPreviewClick = function(){
	var waterlevel_param = {
		end_date : $('#end_date').val(),
		station_id : station,
		station_type : "tele_waterlevel",
		start_date : $('#start_date').val()
	};

	var wateryear_param = {
		station_id : station,
		station_type : "tele_waterlevel",
		year : $('#graphwaterlevel_year').val()
	};

	var watergate_param = {
		station_id : station, 
		start_date : $('#start_date').val(),
		end_date : $('#end_date').val()
	};

	var datatype = $('#datatype>option:selected').val();
    

	if (datatype == 1) {
        console.log(datatype);
		$('#wateryear').hide();

		apiService.SendRequest("GET", "thaiwater30/analyst/waterlevel_graph", waterlevel_param, function(rs){
            console.log(waterlevel_param);
		var station_name = $('#id>option:selected').text();

		 if (rs.result == "OK"){
            var rs = JH.GetJsonValue(rs, "data");
            var seriData = [];
            var firstTs = 0; // timestamp อันแรกเพื่อใช้ในการ ตรึง plotLines
            var data = JH.GetJsonValue(rs, "graph_data");
            var dLen = data.length;

            for (var i = 0; i < dLen; i++) {
                d = data[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "datetime") ).format('x') );
                _waterlevel = JH.GetJsonValue_Float(d, "value", null);
                seriData.push([_time, _waterlevel]);

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
            option["series"].push( HC.PS(graphWaterlevel.translator["lower_bank"], [ [firstTs, mb] ]) );
            option["series"].push( HC.PS(graphWaterlevel.translator["ground_level"] , [ [firstTs, gl] ]) );

            pl = [
                HC.PlotLines(graphWaterlevel.translator["lower_bank"] + " " + mb, mb, 'red')
                , HC.PlotLines(graphWaterlevel.translator["ground_level"] + " " + gl, gl)
            ]
            option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});
            $('#graph').highcharts(option);
        }
	});
	}
	else if (datatype == 2) {

		$('#wateryear').show();
		$('#waterleveldate').hide();

		apiService.SendRequest("GET", "thaiwater30/analyst/waterlevel_yearly_graph", wateryear_param, function(rs){
		
		var station_name = $('#id>option:selected').text();

		if (rs.result == "OK") {
			var rs_data = JH.GetJsonValue(rs, "data");
			var seriData = [];
			var firstTs = 0;
			var data = JH.GetJsonValue(rs_data, "graph_data");
            var d_graphyear = data[0].graph_data;
            var dLen = d_graphyear.length;
            

            for (var i = 0; i < dLen; i++) {
                d = d_graphyear[i];
                _time = parseInt( moment.utc( JH.GetJsonValue(d, "datetime") ).format('x') );
                _wateryear = JH.GetJsonValue_Float(d, "value", null);
                seriData.push([_time, _wateryear]);

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

            mb = JH.GetJsonValue_Float(rs_data, "min_bank");
            gl = JH.GetJsonValue_Float(rs_data, "ground_level");
            option["series"].push( HC.Series($('#id :selected').text(), 'line', seriData) );
            option["series"].push( HC.PS(graphWaterlevel.translator["lower_bank"], [ [firstTs, mb] ]) );
            option["series"].push( HC.PS(graphWaterlevel.translator["ground_level"] , [ [firstTs, gl] ]) );

            pl = [
                HC.PlotLines(graphWaterlevel.translator["lower_bank"] + " " + mb, mb, 'red')
                , HC.PlotLines(graphWaterlevel.translator["ground_level"] + " " + gl, gl)
            ]
            option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});
            $('#graph').highcharts(option);

		}
		});
	}

	else if (datatype == 3){

		$('#wateryear').hide();

		apiService.SendRequest("GET", "thaiwater30/analyst/watergate_graph", watergate_param, function(rs){

			var station_name = $('#id>option:selected').text();
            console.log(station_name);
      
			if (rs.result == "OK") {
                var rs_data = JH.GetJsonValue(rs, "data");
                var gLen = rs_data.length;

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
                    series: [
               
            
            ]
                }

                for (var i = 0; i < gLen; i++){
                    var graph_data = rs_data[i];
                    var seriData_wateryear = [];
                    var _data = JH.GetJsonValue(graph_data, "data");
                    var _name = JH.GetJsonValue(graph_data, "name");
                    var _dLen = _data.length;
                    for (var j = 0; j < _dLen; j++){
                        var d = _data[j];
                        date_wateryear = parseInt( moment.utc( JH.GetJsonValue(d, "datetime") ).format('x') );
                        var value_wateryear = JH.GetJsonValue_Float(d, "value");
                        seriData_wateryear.push([date_wateryear, value_wateryear]);
                    }

                   

                    var _seri_wateryear = HC.Series(_name, 'line', seriData_wateryear);
                    console.log(_seri_wateryear);
                    
                    var data_wateryear = option["series"].push(_seri_wateryear);
                    
                }

                 

                
                pl = []
                option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});
                $('#graph').highcharts(option);

			}
		});
	}
}

graphWaterlevel.handlerTab = function(){
    $('#datatype').val(tab);
}

graphWaterlevel.handlerStation = function(){
    $('#id').val(station);
}

// เลือก province ใน dropdown
graphWaterlevel.handlerSrv = function(data){
	var select = document.getElementById("province");
	var selectIndex = 0;
	var hasDefault = false;
	select.options.length = 0;

	if (graphWaterlevel.province != "") {
		hasDefault = true;
	}

	if (data.province.result == "OK") {
		province = JH.GetJsonValue(data, "province.data");
		JH.Sort(province, "province_name", false, function(obj){
            return JH.GetLangValue(obj).toLowerCase();
        });

        for (var i = 0 ; i < province.length ; i++){
        	var option = document.createElement("option");
        	var txt_option = JH.GetJsonLangValue(province[i],"province_name.th");
        	var val_option = JH.GetJsonValue(province[i],"province_code");

        	if (hasDefault) {
        		if (val_option == graphWaterlevel.province) {
        			selectIndex = i;
        		}
        	}

        	option.text = txt_option;
        	option.value = val_option;
        	select.add(option);
        }
        select.selectedIndex = selectIndex;
	}

	if (hasDefault) {
		$(select).trigger('change');
	}
}

graphWaterlevel.handlerProvinceChange = function(){
	param = {"province_code" : $(this).val() };
	apiService.GetCachedRequest(graphWaterlevel.service, param, graphWaterlevel.handlerSrvStation);
}

graphWaterlevel.handlerSrvStation = function(data){
	var select = document.getElementById("id");
	var selectIndex = 0, tempSelectIndex = 0, hasDefault = false;
	
	select.innerHTML = "";
	if (data.waterlevel_data.result == "OK") {
		if (graphWaterlevel.station != "" || graphWaterlevel.name != "") {
			hasDefault = true;
		}

		var station = JH.GetJsonValue(data, "waterlevel_data.data");

		for (var i = 0 ; i < station.length ; i++){
			var option = document.createElement("option");
			var txt_option = JH.GetJsonLangValue(station[i], "station.tele_station_name.th");
			var val_option = JH.GetJsonValue(station[i], "station.id");

			if (hasDefault){
				if (val_option == graphWaterlevel.station && graphWaterlevel.station != ""){
					selectIndex = i;
				} else if (txt_option == graphWaterlevel.name && graphWaterlevel.name != "") {
					selectIndex = i;
				}
			}

			option.text = txt_option;
			option.value = val_option;

			select.add(option);

		}
	
		select.selectedIndex = selectIndex;

		if (hasDefault) {
			graphWaterlevel.station = "";
			graphWaterlevel.name = "";
			$(select).trigger('change');
		}
	}
}