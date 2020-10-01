/**
*
*   graphDamDailyStation Object for handler iframe graph quality.
*
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/
var graphDamDaily = {};

/**
*   Initial graphDamDaily
*   @param {object} trans - translate object from laravel

*/
graphDamDaily.init = function(trans,station,dam_size){
    graphDamDaily.service = "thaiwater30/analyst/dam_load";
    graphDamDaily.serviceCompare = "thaiwater30/analyst/dam_daily_graph";
    graphDamDaily.translator = trans;
    graphDamDaily.station = station;
    graphDamDaily.dam_size = dam_size;

    $('#btn_preview').on('click' , graphDamDaily.btnPreviewClick);
    $('#graphtype').on('change' , graphDamDaily.handlerGraphTypeChange);

    apiService.SendRequest( "GET", graphDamDaily.service , {} , graphDamDaily.handlerSrv );
    HC.useDefaultTooltip();
}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphDamDaily.handlerSrv = function(rs){
    //console.log(rs);
    graphDamDaily.handlerSrvDamName(rs);
    graphDamDaily.handlerSrvDamDataType(rs);
    graphDamDaily.handlerRenderYearRange();
    graphDamDaily.handlerRenderMonth();
    graphDamDaily.handlerRenderDay();
    graphDamDaily.handlerSrvSetting(rs.scale);
    graphDamDaily.btnPreviewClick();
}

/**
*   handler service scale setting
*   set scale to cache
*   @param {object} rs - result.setting from service
*/
graphDamDaily.handlerSrvSetting = function(rs){
    if (rs.result == "OK"){
        data = JH.GetJsonValue(rs, "data");
        JH.Set("scale", data);
    }
}

/**
*   render year range
*
*   @param {object} rs - result.datatype from service
*/
graphDamDaily.handlerRenderYearRange = function(){
  var result = [];
  var year_id = 'year_range';
  var year_range = 3;
  var year = moment(new Date()).add('-' + year_range,'year').format('Y');
  var select = document.getElementById(year_id);
  select.options.length = 0;
  for (var i=0 ; i < year_range; i++){
    var new_year = (parseInt(year) + parseInt(i));
    var option = document.createElement("option");
    option.text = new_year;
    option.value = new_year;
    select.add(option);
    result.push(new_year);
  }
  graphDamDaily.Dam_render_multiselect('#' + year_id);
  $('#' + year_id).val(result);
  $('#' + year_id).multiselect("refresh");
}

/**
*   render month
*
*   @param {object} rs - result month
*/
graphDamDaily.handlerRenderMonth = function(){
  var m_trans = graphDamDaily.translator.month;
  var month = 12;;
  var select = document.getElementById('month');
  select.options.length = 0;
  for (var i=1 ; i <= month; i++){
    var option = document.createElement("option");
    option.text = m_trans['month_'+i];
    option.value = i;
    select.add(option);
  }
  var month_now = moment().format('MM');
  $('#month').val(parseInt(month_now));
}

/**
*   render day
*
*   @param {object} rs - result month
*/
graphDamDaily.handlerRenderDay = function(){
  var day = 31;
  var select = document.getElementById('day');
  select.options.length = 0;
  for (var i=1 ; i <= day; i++){
    var option = document.createElement("option");
    option.text = i;
    option.value = i;
    select.add(option);
  }
  var day_now = moment().format('DD');
  $('#day').val(day_now);
}

/**
*   handler service dam
*   render select station
*   @param {object} rs - result from service dam
*/
graphDamDaily.handlerSrvDamName = function (rs) {
    var select = document.getElementById("dam_name");
    if (rs.dam_data.result == "OK"){
        data = JH.GetJsonValue(rs, "dam_data.data");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "dam.dam_name");
            var val_option = JH.GetJsonValue(d, "dam.id");
            option.text = 'เขื่อน'+txt_option;
            option.value = val_option;
            select.add(option);
        }
    }
    graphDamDaily.Dam_render_multiselect('#dam_name');
    $('#dam_name').val(graphDamDaily.station);
    $('#dam_name').multiselect("refresh");
}

/**
*   handler service dam datatype
*   render select dam datatype
*   @param {object} rs - result from service dam datatype
*/
graphDamDaily.handlerSrvDamDataType = function(rs){
    var select = document.getElementById("datatype");
    if (rs.dam_datatype.result == "OK"){
        data = JH.GetJsonValue(rs, "dam_datatype.data");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = JH.GetJsonLangValue(d, "text");
            var val_option = JH.GetJsonValue(d, "value");
            option.text = txt_option;
            option.value = val_option;
            select.add(option);
        }
    }
}

/**
*   handler series data
*   @param {object} rs - result from service
*/
graphDamDaily.handlerSeriesData = function(rs) {
    var seriesData = [];
    var newData = [];

    $.each(rs, function(data, item) {
        var data = {
            name: item.year,
            y: item.data
        };
        newData.push(data);
    });

    var newSeriesData = {
        name: 'dam_graph_daily',
        data: newData,
        "colorByPoint": true
    };

    seriesData.push(newSeriesData);
    return seriesData;
};

/**
*   event on btn preview click
*   load data and render grpah
*/
graphDamDaily.btnPreviewClick = function(){
    var dam_id = '';
    var dam_selected = $("#dam_name option:selected").each(function(){
          dam_id += ((dam_id == "") ? "" : ",")+$(this).val();
    });

    var year = '';
    var year_selected = $("#year_range option:selected").each(function(){
          year += ((year == "") ? "" : ",")+$(this).val();
    });

    var param = {
        dam_id : dam_id,
        year : year,
        month  : $('#month').val() ,
        day : $('#day').val(),
        data_type : $('#datatype').val()
    };

    var datatype_text = $('#datatype>option:selected').text().replace(/\(.*\)/,"");
    var title_text = datatype_text + ' วันที่ ' + $('#day').val()+' '+$('#month>option:selected').text();
    apiService.SendRequest("GET", graphDamDaily.serviceCompare, param , function(rs){
        var station_name = $('#station>option:selected').text();
        if (rs.result == "OK"){
            rs = JH.GetJsonValue(rs, "data");
            var seriesData = graphDamDaily.handlerSeriesData(rs);

            option = {
                chart: {
                    type: 'column'
                },
                legend: {
                    enabled: false
                },
                title:{ text : graphDamDaily.translator["waterquality_graph_title_link"] + title_text },
                xAxis: {
                    type: 'category',
                    //title: { text: xAxis_text }
                },
                yAxis: {
                    title: {
                        text: $('#datatype>option:selected').text() + ' ' + graphDamDaily.translator["dam_unit"]
                    }
                },
                plotOptions: {
                    series: {
                        pointWidth: 80
                    }
                },
                tooltip: {
                    formatter: function () {
                        var s =title_text+' ';
                        $.each(this.points, function () {
                            s += this.key;
                        });
                        return s;
                    },
                    shared: true
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
graphDamDaily.handlerGraphTypeChange = function (){
    var graphSelectText = $(this).find('option:selected').text();
    var graphSelectValue = $(this).find('option:selected').val();
    $('#graphSelect').text('กราฟ' + graphSelectText);
    $(location).attr('href','../graph/dam?station=' + graphDamDaily.station + '&graphtype=' + graphSelectValue);
}

/**
 * multiple select setting
 * @method
 * @param  {[type]} selector_id [select box id]
 * @return {[type]}             [generate multiselect]
 */
graphDamDaily.Dam_render_multiselect = function(selector_id) {
  $(selector_id).multiselect({
    buttonWidth : '100%',
    maxHeight : 300,
    includeSelectAllOption : true,
    selectAllNumber : false,
    enableFiltering: true,
    selectAllText : graphDamDaily.translator.none_selected,
    allSelectedText : graphDamDaily.translator.all_selected,
    nonSelectedText : graphDamDaily.translator.none_selected,
  });
}
