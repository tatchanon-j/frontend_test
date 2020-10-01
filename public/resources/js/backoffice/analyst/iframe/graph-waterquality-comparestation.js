/**
*
*   graphWaterQualityStationStation Object for handler iframe graph quality.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/
var graphWaterQualityStation = {};

/**
*   Initial graphWaterQualityStation
*   @param {object} trans - translate object from laravel
*   @param {int} station - station id
*   @param {string} name - station name
*/
graphWaterQualityStation.init = function(trans , station , name){
    graphWaterQualityStation.service = "thaiwater30/analyst/waterquality_load";
    graphWaterQualityStation.serviceCompare = "thaiwater30/analyst/waterquality_compare_station_graph";
    graphWaterQualityStation.translator = trans;
    graphWaterQualityStation.station = station;
    graphWaterQualityStation.name = name;

    graphWaterQualityStation.handlerRenderStation();
    graphWaterQualityStation.dateTimePicker();

    $('#btn_preview').on('click' , graphWaterQualityStation.btnPreviewClick);
    $('#graphtype').on('change' , graphWaterQualityStation.handlerGraphTypeChange);

    apiService.SendRequest( "GET", graphWaterQualityStation.service , {} , graphWaterQualityStation.handlerSrv );
    HC.useDefaultTooltip();
}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphWaterQualityStation.handlerSrv = function(rs){
    graphWaterQualityStation.handlerSrvDatatype(rs.waterquality_param);
    graphWaterQualityStation.handlerSrvSetting(rs.scale);
    graphWaterQualityStation.btnPreviewClick();
}

/**
*   handler service scale setting
*   set scale to cache
*   @param {object} rs - result.setting from service
*/
graphWaterQualityStation.handlerSrvSetting = function(rs){
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
graphWaterQualityStation.handlerSrvDatatype = function(rs){
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
*   handler render station
*   load data and render select station
*/
graphWaterQualityStation.handlerRenderStation = function(){
    apiService.GetCachedRequest(graphWaterQualityStation.service, {}, graphWaterQualityStation.handlerSrvStation);
}

/**
*   handler service station
*   render select station
*   @param {object} rs - result from service station
*/
graphWaterQualityStation.handlerSrvStation = function(rs){

    var select = document.getElementById("station");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;

    if (rs.waterquality_station.result == "OK"){
        data = JH.GetJsonValue(rs, "waterquality_station.data");
        // sort ตามเรียงตามชื่อสถานี
        JH.Sort(data, "waterquality_station_name", false, function(x){
            return JH.GetLangValue(x).replace("สถานี" , "").toLowerCase();
        });
        if (graphWaterQualityStation.station != "" || graphWaterQualityStation.name != ""){
            hasDefault = true;
        }

        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "waterquality_station_name", true).replace("สถานี" , "");
            var val_option = d["id"];

            if (hasDefault){
                if (val_option == graphWaterQualityStation.station && graphWaterQualityStation.station != ""){
                    // query string station
                    selectIndex = i;
                }else if (JH.GetJsonLangValue(d, "waterquality_station_name", true) == graphWaterQualityStation.name && graphWaterQualityStation.name != ""){
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
            graphWaterQualityStation.station = "";
            graphWaterQualityStation.name = "";
            //
        }
    }

    // Setting option multiselect
  	$('select[multiple=multiple]').each(function(i, e) {
  		$(e).multiselect({
  			buttonWidth : '100%',
  			maxHeight : 300,
  			includeSelectAllOption : true,
  			selectAllNumber : false,
  			enableFiltering: true,
  			selectAllText : graphWaterQualityStation.translator.none_selected,
  			allSelectedText : graphWaterQualityStation.translator.all_selected,
  			nonSelectedText : graphWaterQualityStation.translator.none_selected,
  		})
  	});

}

/**
*   handler series data
*   @param {object} rs - result from service
*/
graphWaterQualityStation.handlerSeriesData = function(rs) {
    var seriesData = [];
    var loop = 0;
    $.each(rs, function(data, item) {
        var newData = [];
        var limit = 0;

        $.each(item.data, function(data, item) {
            mm = moment.utc( item.datetime );
            if ( mm.format('mm') != '00' ){ return; }
            var datetime = parseInt( mm.format('x') );
            newData.push([datetime,item.value]);
             // if(limit===10){
             //   return false;
             // }
            limit++;
        });

        var newSeriesData = {
            name: ''+item.series_name.th+'',
            data: newData,
            type:'line'
        };

        seriesData.push(newSeriesData);
        loop++;
    });
    return seriesData;
};

/**
*   start date and end date
*   setting format date and time
*/
graphWaterQualityStation.dateTimePicker = function (){
    var start_date = {
        format : 'YYYY-MM-DD HH:mm',
        defaultDate : moment(new Date()).add(-3, 'days').format('YYYY-MM-DD HH:mm'), // start before 3 days
        maxDate : moment(new Date()).add(1, 'days').format('YYYY-MM-DD HH:mm')
    };
    var end_date = {
        format : 'YYYY-MM-DD HH:mm',
        defaultDate : moment(new Date()).format('YYYY-MM-DD HH:mm'),
        maxDate : moment(new Date()).format('YYYY-MM-DD HH:mm')
    }
    $('#filter_startdate').datetimepicker(start_date);
    $('#filter_enddate').datetimepicker(end_date);
}
/**
*   event on btn preview click
*   load data and render grpah
*/
graphWaterQualityStation.btnPreviewClick = function(){
    var station_id = '';
    var station_selected = $("#station option:selected").each(function(){
          station_id += ((station_id == "") ? "" : ",")+$(this).val();
    });

    var param = {
        waterquality_station_id : station_id,
        param : $('#datatype').val(),
        start_datetime : $('#filter_startdate').val(),
        end_datetime : $('#filter_enddate').val()
    };

    var datatype_text = $('#datatype>option:selected').text().replace(/\(.*\)/,"");
    var datatype_unit = $('#datatype>option:selected').text().replace(datatype_text , "");
    apiService.SendRequest("GET", graphWaterQualityStation.serviceCompare, param , function(rs){
        var station_name = $('#station>option:selected').text();
        if (rs.result == "OK"){
            rs = JH.GetJsonValue(rs, "data");
            var seriesData = graphWaterQualityStation.handlerSeriesData(rs);

            option = {
                //title:{ text : graphWaterQualityStation.translator["waterquality_graph_title_link"] + datatype_text +":"+station_name },
                title:{ text : graphWaterQualityStation.translator["waterquality_graph_title_link"] + datatype_text },
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
                series: seriesData
            }
            $('#graph').highcharts(option);
        }
    });

}

/**
*
*   graph type change
*   change type to iframe
*/
graphWaterQualityStation.handlerGraphTypeChange = function (){
    var graphSelectText = $(this).find('option:selected').text();
    var graphSelectValue = $(this).find('option:selected').val();
    $('#graphSelect').text('กราฟ'+graphSelectText);
    $(location).attr('href','../graph/waterquality?station='+$(this).attr('href')+'&graphtype='+graphSelectValue);
}
