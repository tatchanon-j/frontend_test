/**
*
*   graphDamMediumStation Object for handler iframe graph quality.
*
*   @author Peerapong Srisom <peerapong@haii.or.th>
*   @license HAII
*
*/
var graphDamMedium = {};

/**
*   Initial graphDamMedium
*   @param {object} trans - translate object from laravel

*/
graphDamMedium.init = function(trans,station,dam_size){
    graphDamMedium.service = "thaiwater30/analyst/dam_load";
    graphDamMedium.serviceCompare = "thaiwater30/analyst/dam_medium_graph";
    graphDamMedium.translator = trans;
    graphDamMedium.station = station;
    graphDamMedium.dam_size = dam_size;

    $('#btn_preview').on('click' , graphDamMedium.btnPreviewClick);
    $('#graphtype').on('change' , graphDamMedium.handlerGraphTypeChange);

    apiService.SendRequest( "GET", graphDamMedium.service , {} , graphDamMedium.handlerSrv );
    HC.useDefaultTooltip();

}

/**
*   handler service
*   @param {object} rs - result from service
*/
graphDamMedium.handlerSrv = function(rs){
    graphDamMedium.handlerSrvDamName(rs);
    graphDamMedium.handlerSrvDamDataType(rs);
    graphDamMedium.handlerRenderYearRange();
    graphDamMedium.handlerSrvSetting(rs.scale);
    graphDamMedium.btnPreviewClick();
}

/**
*   handler service scale setting
*   set scale to cache
*   @param {object} rs - result.setting from service
*/
graphDamMedium.handlerSrvSetting = function(rs){
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
graphDamMedium.handlerRenderYearRange = function(){
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
  graphDamMedium.Dam_render_multiselect('#' + year_id);
  $('#' + year_id).val(result);
  $('#' + year_id).multiselect("refresh");
}

/**
*   handler service dam
*   render select station
*   @param {object} rs - result from service dam
*/
graphDamMedium.handlerSrvDamName = function (rs) {
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
    graphDamMedium.Dam_render_multiselect('#dam_name');
    $('#dam_name').val(graphDamMedium.station);
    $('#dam_name').multiselect("refresh");
}

/**
*   handler service dam datatype
*   render select dam datatype
*   @param {object} rs - result from service dam datatype
*/
graphDamMedium.handlerSrvDamDataType = function(rs){
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

graphDamMedium.sortJSON = function (data, key, way) {
    return data.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        if (way === '123' ) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
        if (way === '321') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
    });
}

graphDamMedium.handlerSeriesData = function(rs) {
    var seriesData = [];
    var loop = 0;
    var data_length = rs.graph_data.length-1;
    $.each(rs.graph_data, function(data, item) {
        var newData = [];
        var limit = 0;
        item.data = graphDamMedium.sortJSON(item.data, 'date', '123');
        $.each(item.data, function(data, item) {
            var new_date = moment.utc( new Date() ).format('YYYY-')+moment.utc( item.date ).format('MM-DD');
            mm = moment.utc( new_date );
            if ( mm.format('mm') != '00' ){ return; }
            var datetime = parseInt( mm.format('x') );
            newData.push([datetime,item.value]);
             // if(limit===10){
             //   return false;
             // }
            limit++;
        });

        var newSeriesData = {
            name: ''+item.year+'',
            data: newData,
            color: ((loop==data_length)?'#FF0000':''),
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
graphDamMedium.btnPreviewClick = function(){
    var dam_id = '';
    var dam_selected = $("#dam_name option:selected").each(function(){
          dam_id += ((dam_id == "") ? "" : ",")+$(this).val();
    });

    var year = '';
    var year_selected = $("#year_range option:selected").each(function(){
          year += ((year == "") ? "" : ",")+$(this).val();
    });

    var param = {
        medium_id : dam_id,
        year : year,
        data_type : 'medium'+$('#datatype').val()
    };

    var datatype_text = $('#datatype>option:selected').text().replace(/\(.*\)/,"");
    var datatype_unit = $('#datatype>option:selected').text().replace(datatype_text , "");
    apiService.SendRequest("GET", graphDamMedium.serviceCompare, param , function(rs){

        if (rs.result == "OK"){
            rs = JH.GetJsonValue(rs, "data");
            var seriesData = graphDamMedium.handlerSeriesData(rs);
            option = {
                title:{ text : graphDamMedium.translator["waterquality_graph_title_link"] + datatype_text },
                xAxis: {
                    type: 'datetime',
                    title: { text: xAxis_text },
                    labels: { rotation: 0 ,formatter:function(){
                      return moment.utc(this.value).format('DD MMM');
                    }},
                    tickInterval: 30 * 24 * 3600 * 1000,
                    min: moment.utc( moment().format('YYYY')+'-01-01' ).format('x'),
                    max : moment.utc( moment().format('YYYY')+'-12-01' ).format('x')
                },
                yAxis: {
                    title: {
                        text: $('#datatype>option:selected').text() + ' ' + graphDamMedium.translator["dam_unit"]
                    }
                },
                tooltip: {
                    formatter: function() {
                        var s = '<b>' + moment(this.x).format('DD MMM') + ' </b>';
                        $.each(this.points, function(i, point) {
                            s += '<br/><span style="color:' + point.color + '">\u25CF</span>: ' + point.series.name + ': ' + Highcharts.numberFormat(point.y, 2);
                        });
                        return s;
                    },
                    shared: true
                },
                series: seriesData
            }

            // dam_storage เพิ่ม lower, upper bound
            // var tempDate = parseInt( moment.utc([2018, 0, 1]).format('x') );
            // var lower_bound = JH.GetJsonValue_Float(rs, "lower_bound");
            // // ตรึง lower, upper
            // option["series"].push(HC.PS(graphDamMedium.translator["lower_bound"], [ [tempDate, lower_bound] ]));
            // var upper_bound = JH.GetJsonValue_Float(rs, "upper_bound");
            // option["series"].push(HC.PS(graphDamMedium.translator["upper_bound"], [ [tempDate, upper_bound] ]));
            // var dam_unit = graphDamMedium.translator["dam_unit"];
            // pl = [
            //     HC.PlotLines(graphDamMedium.translator["lower_bound"] +" " + numeral(lower_bound).format('0,0') + " " + dam_unit, lower_bound)
            //     , HC.PlotLines(graphDamMedium.translator["upper_bound"] +" " + numeral(upper_bound).format('0,0') + " " + dam_unit, upper_bound)
            // ]
            // option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});

            $('#graph').highcharts(option);
        }
    });

}

/**
*
*   graph type change
*   change type to iframe
*/
graphDamMedium.handlerGraphTypeChange = function (){
    var graphSelectText = $(this).find('option:selected').text();
    var graphSelectValue = $(this).find('option:selected').val();
    $('#graphSelect').text('กราฟ' + graphSelectText);
    $(location).attr('href','../graph/dam?station=' + graphDamMedium.station + '&graphtype=' + graphSelectValue);
}

graphDamMedium.Dam_yearRange = function (){
  var result = [];
  var year_range = 3;
  var year = moment(new Date()).add('-'+year_range,'year').format('Y');
  for (var i=0 ; i < year_range; i++){
    var new_year = (parseInt(year) + parseInt(i));
    result.push([new_year])
  }
  return result;
}

/**
 * multiple select setting
 * @method
 * @param  {[type]} selector_id [select box id]
 * @return {[type]}             [generate multiselect]
 */
graphDamMedium.Dam_render_multiselect = function(selector_id) {
  $(selector_id).multiselect({
    buttonWidth : '100%',
    maxHeight : 300,
    includeSelectAllOption : true,
    selectAllNumber : false,
    enableFiltering: true,
    selectAllText : graphDamMedium.translator.none_selected,
    allSelectedText : graphDamMedium.translator.all_selected,
    nonSelectedText : graphDamMedium.translator.none_selected,
  });
}
