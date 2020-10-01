/**
*
*   graphWaterQualityDatetime Object for handler iframe graph quality.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/
var graphWaterQualityDatetime = {};

/**
*   Initial graphWaterQualityDatetime
*   @param {object} trans - translate object from laravel
*   @param {int} station - station id
*   @param {string} name - station name
*/
graphWaterQualityDatetime.init = function(trans , station , name){
    graphWaterQualityDatetime.service = "thaiwater30/analyst/waterquality_load";
    graphWaterQualityDatetime.serviceCompare = "thaiwater30/analyst/waterquality_compare_datetime_graph";
    graphWaterQualityDatetime.translator = trans;
    graphWaterQualityDatetime.station = station;
    graphWaterQualityDatetime.name = name;

    graphWaterQualityDatetime.handlerRenderStation();

    $('#btn_preview').on('click' , graphWaterQualityDatetime.btnPreviewClick);
    $('#graphtype').on('change' , graphWaterQualityDatetime.handlerGraphTypeChange);
    graphWaterQualityDatetime.handlerMultipleDate();

    apiService.SendRequest( "GET", graphWaterQualityDatetime.service , {} , graphWaterQualityDatetime.handlerSrv );
    HC.useDefaultTooltip();
}

/**
*   date plus and minus
*   multiple textbox date
*/
graphWaterQualityDatetime.handlerMultipleDate = function(){
    var start_date       = moment().format('YYYY-MM-DD');
    var date_add          = $('.date-add');
    var date_remove       = $('.date-remove');
    var date_primary      = $('.date-primary').clone().html();
    var multi_date_fields = $('.multi-date-fields');
    $('.filter_date').val(start_date);
    $('.date-remove').hide();

    var x = 1;
    date_add.click(function(e){
        e.preventDefault(); x++;
        var last_date = multi_date_fields.children(".form-group:last").find('.filter_date').val();
        var new_date  = moment(last_date, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD');
        var last_div  = multi_date_fields.append('<div class="form-group"><div class="col-sm-12"><div class="col-sm-8 col-sm-offset-4">'+date_primary+'</div></div></div>');

        last_div.children(".form-group:last").find('.filter_date').val(new_date);

        if(x > 1) $('.date-remove').fadeIn();
    });
    date_remove.click(function(e){
        if(x > 1) multi_date_fields.children(".form-group:last").remove(); x--;
        if(x === 1) $('.date-remove').fadeOut();
    });
}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphWaterQualityDatetime.handlerSrv = function(rs){
    graphWaterQualityDatetime.handlerSrvDatatype(rs.waterquality_param);
    graphWaterQualityDatetime.handlerSrvSetting(rs.scale);
    graphWaterQualityDatetime.btnPreviewClick();
}

/**
*   handler service scale setting
*   set scale to cache
*   @param {object} rs - result.setting from service
*/
graphWaterQualityDatetime.handlerSrvSetting = function(rs){
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
graphWaterQualityDatetime.handlerSrvDatatype = function(rs){
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
graphWaterQualityDatetime.handlerRenderStation = function(){
    apiService.GetCachedRequest(graphWaterQualityDatetime.service, {}, graphWaterQualityDatetime.handlerSrvStation);
}

/**
*   handler service station
*   render select station
*   @param {object} rs - result from service station
*/
graphWaterQualityDatetime.handlerSrvStation = function(rs){

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
        if (graphWaterQualityDatetime.station != "" || graphWaterQualityDatetime.name != ""){
            hasDefault = true;
        }

        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "waterquality_station_name", true).replace("สถานี" , "");
            var val_option = d["id"];

            if (hasDefault){
                if (val_option == graphWaterQualityDatetime.station && graphWaterQualityDatetime.station != ""){
                    // query string station
                    selectIndex = i;
                }else if (JH.GetJsonLangValue(d, "waterquality_station_name", true) == graphWaterQualityDatetime.name && graphWaterQualityDatetime.name != ""){
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
            graphWaterQualityDatetime.station = "";
            graphWaterQualityDatetime.name = "";
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
  			selectAllText : graphWaterQualityDatetime.translator.none_selected,
  			allSelectedText : graphWaterQualityDatetime.translator.all_selected,
  			nonSelectedText : graphWaterQualityDatetime.translator.none_selected,
  		})
  	});

}

/**
*   handler series data
*   @param {object} rs - result from service
*/
graphWaterQualityDatetime.handlerSeriesData = function(rs) {

    var seriesData = [];
    var loop = 0;

    $.each(rs, function(data, item) {
        var newData = [];
        var limit = 0;

        $.each(item.station, function(data,item) {

            newData.push([item.station_name.th,item.value]);
             // if(limit===10){
             //   return false;
             // }
            limit++;
        });
        var newSeriesData = {
            name: ''+item.datetime+'',
            data: newData,
            type:'line'
        };

        seriesData.push(newSeriesData);
        loop++;
    });

    return seriesData;
};

/**
*   event on btn preview click
*   load data and render grpah
*/
graphWaterQualityDatetime.btnPreviewClick = function(){
    var date = '';
    var filter_date = $("input[name='filter_date[]']").each(function(){
         date += ((date == "") ? "" : ",")+$(this).val() ;
    });

    var station_id = '';
    var station_selected = $("#station option:selected").each(function(){
          station_id += ((station_id == "") ? "" : ",")+$(this).val();
    });

    var param = {
        waterquality_station_id : station_id,
        param : $('#datatype').val(),
        date  : date
    };

    var datatype_text = $('#datatype>option:selected').text().replace(/\(.*\)/,"");
    var datatype_unit = $('#datatype>option:selected').text().replace(datatype_text , "");
    apiService.SendRequest("GET", graphWaterQualityDatetime.serviceCompare, param , function(rs){
        var station_name = $('#station>option:selected').text();

        if (rs.result == "OK"){
            rs = JH.GetJsonValue(rs, "data");
            var seriesData = graphWaterQualityDatetime.handlerSeriesData(rs);

            option = {
                //title:{ text : graphWaterQualityDatetime.translator["waterquality_graph_title_link"] + datatype_text +":"+station_name },
                title:{ text : graphWaterQualityDatetime.translator["waterquality_graph_title_link"] + datatype_text },
                xAxis: {
                    type: 'category',
                    labels: { rotation: -90 }
                },
                yAxis: {
                    tickInterval: 0.5,
                    title: {
                        text: $('#datatype>option:selected').text()
                    }
                },
                tooltip: {
                   crosshairs: true
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
graphWaterQualityDatetime.handlerGraphTypeChange = function (){
    var graphSelectText = $(this).find('option:selected').text();
    var graphSelectValue = $(this).find('option:selected').val();
    $('#graphSelect').text('กราฟ'+graphSelectText);
    $(location).attr('href','../graph/waterquality?station='+$(this).attr('href')+'&graphtype='+graphSelectValue);
}
