/**
*
*   graphWaterQualityWaterLevel Object for handler iframe graph quality.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/
var graphWaterQualityWaterLevel = {};

/**
*   Initial graphWaterQualityWaterLevel
*   @param {object} trans - translate object from laravel
*   @param {int} station - station id
*   @param {string} name - station name
*/
graphWaterQualityWaterLevel.init = function(trans , station , name){
    graphWaterQualityWaterLevel.service = "thaiwater30/analyst/waterquality_load";
    graphWaterQualityWaterLevel.serviceCompare = "thaiwater30/analyst/waterquality_compare_waterlevel_graph";
    graphWaterQualityWaterLevel.translator = trans;
    graphWaterQualityWaterLevel.station = station;
    graphWaterQualityWaterLevel.name = name;

    graphWaterQualityWaterLevel.handlerRenderStation();
    graphWaterQualityWaterLevel.dateTimePicker();

    $('#btn_preview').on('click' , graphWaterQualityWaterLevel.btnPreviewClick);
    $('#graphtype').on('change' , graphWaterQualityWaterLevel.handlerGraphTypeChange);

    apiService.SendRequest( "GET", graphWaterQualityWaterLevel.service , {} , graphWaterQualityWaterLevel.handlerSrv );
    HC.useDefaultTooltip();
}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphWaterQualityWaterLevel.handlerSrv = function(rs){
    graphWaterQualityWaterLevel.handlerSrvDatatype(rs.waterquality_param);
    graphWaterQualityWaterLevel.handlerSrvWaterlevelStation(rs.waterlevel_station);
    graphWaterQualityWaterLevel.handlerSrvSetting(rs.scale);
    graphWaterQualityWaterLevel.btnPreviewClick();
}

/**
*   handler service scale setting
*   set scale to cache
*   @param {object} rs - result.setting from service
*/
graphWaterQualityWaterLevel.handlerSrvSetting = function(rs){
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
graphWaterQualityWaterLevel.handlerSrvDatatype = function(rs){
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
*   handler service waterlevel station
*   render select waterlevel station
*   @param {object} rs - result.waterlevel_station from service
*/
graphWaterQualityWaterLevel.handlerSrvWaterlevelStation = function(rs){

    if (rs.result == "OK"){
        var select = document.getElementById("waterlevel_station");
        select.options.length = 0;
        data = JH.GetJsonValue(rs, "data.tele_waterlevel");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "station_name");
            var val_option = JH.GetJsonValue(d, "station_id");

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
graphWaterQualityWaterLevel.handlerRenderStation = function(){
    apiService.GetCachedRequest(graphWaterQualityWaterLevel.service, {}, graphWaterQualityWaterLevel.handlerSrvStation);
}

/**
*   handler service station
*   render select station
*   @param {object} rs - result from service station
*/
graphWaterQualityWaterLevel.handlerSrvStation = function(rs){

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
        if (graphWaterQualityWaterLevel.station != "" || graphWaterQualityWaterLevel.name != ""){
            hasDefault = true;
        }

        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "waterquality_station_name", true).replace("สถานี" , "");
            var val_option = d["id"];

            if (hasDefault){
                if (val_option == graphWaterQualityWaterLevel.station && graphWaterQualityWaterLevel.station != ""){
                    // query string station
                    selectIndex = i;
                }else if (JH.GetJsonLangValue(d, "waterquality_station_name", true) == graphWaterQualityWaterLevel.name && graphWaterQualityWaterLevel.name != ""){
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
            graphWaterQualityWaterLevel.station = "";
            graphWaterQualityWaterLevel.name = "";
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
  			selectAllText : graphWaterQualityWaterLevel.translator.none_selected,
  			allSelectedText : graphWaterQualityWaterLevel.translator.all_selected,
  			nonSelectedText : graphWaterQualityWaterLevel.translator.none_selected,
  		})
  	});

}

/**
*   handler series data
*   @param {object} rs - result from service
*/
graphWaterQualityWaterLevel.handlerSeriesData = function(rs) {
  console.log(rs);
    var seriesData = [];
    var loop = 0;
    $.each(rs, function(data, item) {
        var newData = [];
        var limit = 0;

        $.each(item.data, function(data, item) {
            mm = moment.utc( item.name );
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
            type:'line',
            yAxis: loop
        };

        seriesData.push(newSeriesData);
        loop++;
    });
    console.log(seriesData);
    return seriesData;
};

/**
*   start date and end date
*   setting format date and time
*/
graphWaterQualityWaterLevel.dateTimePicker = function (){
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
graphWaterQualityWaterLevel.btnPreviewClick = function(){
    var param = {
        waterquality_station_id : $("#station option:selected").val(),
        waterlevel_station_id : $("#waterlevel_station option:selected").val(),
        waterlevel_station_type : 'tele_waterlevel',
        param : $('#datatype').val(),
        start_datetime : $('#filter_startdate').val(),
        end_datetime : $('#filter_enddate').val()
    };

    var datatype_text = $('#datatype>option:selected').text().replace(/\(.*\)/,"");
    var datatype_unit = $('#datatype>option:selected').text().replace(datatype_text , "");
    apiService.SendRequest("GET", graphWaterQualityWaterLevel.serviceCompare, param , function(rs){
        var station_name = $('#station>option:selected').text();
        if (rs.result == "OK"){
            rs = JH.GetJsonValue(rs, "data");
            var seriesData = graphWaterQualityWaterLevel.handlerSeriesData(rs);
            option = {
                //title:{ text : graphWaterQualityWaterLevel.translator["waterquality_graph_title_link"] + datatype_text +":"+station_name },
                title:{ text : graphWaterQualityWaterLevel.translator["waterquality_graph_title_link"] + datatype_text },
                xAxis: {
                    type: 'datetime',
                    title: { text: xAxis_text },
                    labels: { rotation: -90 }
                },
                yAxis: [{
                    lineWidth: 1,
                    title: {
                      text: $('#datatype>option:selected').text()
                    }
                }, {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                      rotation: 270,
                      text : graphWaterQualityWaterLevel.translator["waterlevel()"].replace("&lt;br/&gt;","\n\r")
                    }
                }],

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
graphWaterQualityWaterLevel.handlerGraphTypeChange = function (){
    var graphSelectText = $(this).find('option:selected').text();
    var graphSelectValue = $(this).find('option:selected').val();
    $('#graphSelect').text('กราฟ'+graphSelectText);
    $(location).attr('href','../graph/waterquality?station='+$(this).attr('href')+'&graphtype='+graphSelectValue);
}
