/**
*
*   graphWaterQualityParam Object for handler iframe graph quality.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/
var graphWaterQualityParam = {};

/**
*   Initial graphWaterQualityParam
*   @param {object} trans - translate object from laravel
*   @param {int} station - station id
*   @param {string} name - station name
*/
graphWaterQualityParam.init = function(trans , station , name){
    graphWaterQualityParam.service = "thaiwater30/analyst/waterquality_load";
    graphWaterQualityParam.serviceCompare = "thaiwater30/analyst/waterquality_compare_param_graph";
    graphWaterQualityParam.translator = trans;
    graphWaterQualityParam.station = station;
    graphWaterQualityParam.name = name;

    graphWaterQualityParam.handlerRenderStation();
    graphWaterQualityParam.dateTimePicker();

    $('#btn_preview').on('click' , graphWaterQualityParam.btnPreviewClick);
    $('#graphtype').on('change' , graphWaterQualityParam.handlerGraphTypeChange);

    apiService.SendRequest( "GET", graphWaterQualityParam.service , {} , graphWaterQualityParam.handlerSrv );
    HC.useDefaultTooltip();

}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphWaterQualityParam.handlerSrv = function(rs){
    graphWaterQualityParam.handlerSrvDatatype(rs.waterquality_param);
    graphWaterQualityParam.handlerSrvSetting(rs.scale);
    graphWaterQualityParam.btnPreviewClick();
}

/**
*   handler service scale setting
*   set scale to cache
*   @param {object} rs - result.setting from service
*/
graphWaterQualityParam.handlerSrvSetting = function(rs){
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
graphWaterQualityParam.handlerSrvDatatype = function(rs){
    if (rs.result == "OK"){
        graphWaterQualityParam.paramName = [];
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
            graphWaterQualityParam.paramName.push(data[i]);
        }

        $('#datatype').val('salinity');

        // Setting option multiselect
      	$('#datatype').each(function(i, e) {
        		$(e).multiselect({
        			buttonWidth : '100%',
        			maxHeight : 300,
        			includeSelectAllOption : true,
        			selectAllNumber : false,
        			enableFiltering: true,
        			selectAllText : graphWaterQualityParam.translator.none_selected,
        			allSelectedText : graphWaterQualityParam.translator.all_selected,
        			nonSelectedText : graphWaterQualityParam.translator.none_selected,
              onChange: function(option, checked) {

                  var selectedOptions = $('#datatype option:selected');

                  if (selectedOptions.length >= 2) {
                      var nonSelectedOptions = $('#datatype option').filter(function() {
                          return !$(this).is(':selected');
                      });
                      nonSelectedOptions.each(function() {
                          var input = $('input[value="' + $(this).val() + '"]');
                          input.prop('disabled', true);
                          input.parent('li').addClass('disabled');
                      });
                  }
                  else {
                      $('#datatype option').each(function() {
                          var input = $('input[value="' + $(this).val() + '"]');
                          input.prop('disabled', false);
                          input.parent('li').addClass('disabled');
                      });
                  }
               }
        		})
      	});
    }
}

/**
*   handler render station
*   load data and render select station
*/
graphWaterQualityParam.handlerRenderStation = function(){
    apiService.GetCachedRequest(graphWaterQualityParam.service, {}, graphWaterQualityParam.handlerSrvStation);
}

/**
*   handler service station
*   render select station
*   @param {object} rs - result from service station
*/
graphWaterQualityParam.handlerSrvStation = function(rs){
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
        if (graphWaterQualityParam.station != "" || graphWaterQualityParam.name != ""){
            hasDefault = true;
        }

        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "waterquality_station_name", true).replace("สถานี" , "");
            var val_option = d["id"];

            if (hasDefault){
                if (val_option == graphWaterQualityParam.station && graphWaterQualityParam.station != ""){
                    // query string station
                    selectIndex = i;
                }else if (JH.GetJsonLangValue(d, "waterquality_station_name", true) == graphWaterQualityParam.name && graphWaterQualityParam.name != ""){
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
            graphWaterQualityParam.station = "";
            graphWaterQualityParam.name = "";
            //
        }
    }

}

/**
*   handler series data
*   @param {object} rs - result from service
*/
graphWaterQualityParam.handlerSeriesData = function(rs) {

    var seriesData = [];
    var loop = 0;
    var paramName = graphWaterQualityParam.paramName;
    var seriesName = '';
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

        for (var i=0 ; i < paramName.length ; i++ ){
            var data_param_name = 'waterquality_' + paramName[i].value;
            if(data_param_name==item.series_name){
                seriesName = JH.GetJsonLangValue(paramName[i], "name", true)
            }
        }

        var newSeriesData = {
            name: ''+seriesName+'',
            data: newData,
            type:'line',
            yAxis: loop
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
graphWaterQualityParam.dateTimePicker = function (){
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
graphWaterQualityParam.btnPreviewClick = function(){
    var datatype_id = '';
    var datatype_selected = $("#datatype option:selected").each(function(){
          datatype_id += ((datatype_id == "") ? "" : ",")+$(this).val();
    });

    var param = {
        waterquality_station_id : $('#station').val(),
        param : datatype_id,
        start_datetime : $('#filter_startdate').val(),
        end_datetime : $('#filter_enddate').val()
    };

    var station_text = $('#station>option:selected').text().replace(/\(.*\)/,"");
    var station_unit = $('#station>option:selected').text().replace(station_text , "");
    apiService.SendRequest("GET", graphWaterQualityParam.serviceCompare, param , function(rs){
        if (rs.result == "OK"){
            rs = JH.GetJsonValue(rs, "data");
            var seriesData = graphWaterQualityParam.handlerSeriesData(rs);

            option = {
                title:{ text : graphWaterQualityParam.translator["station"] + station_text },
                xAxis: {
                    type: 'datetime',
                    title: { text: xAxis_text },
                    labels: { rotation: -90 }
                },
                yAxis: [{
                    lineWidth: 1,
                    title: {}
                }, {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                      rotation: 270,
                      text:''
                    }
                }],
                series: seriesData
            }

            if(seriesData.length > 0){
              for(var y=0;y<seriesData.length;y++){
                option.yAxis[y].title.text = seriesData[y].name;
              }
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
graphWaterQualityParam.handlerGraphTypeChange = function (){
    var graphSelectText = $(this).find('option:selected').text();
    var graphSelectValue = $(this).find('option:selected').val();
    $('#graphSelect').text('กราฟ'+graphSelectText);
    $(location).attr('href','../graph/waterquality?station='+$(this).attr('href')+'&graphtype='+graphSelectValue);
}
