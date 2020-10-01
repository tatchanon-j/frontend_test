/**
*
*   graphDam Object for handler iframe graph dam.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var graphDam = {};

/**
*   Initial graphDam
*   @param {object} trans - translate object from laravel
*   @param {int} dam_station - dam station id
*   @param {string} name - dam station name
*/
graphDam.init = function(trans , dam_station, name){
    graphDam.leapYear = 2016; // 366 days in 1 year
    graphDam.translator = trans;
    graphDam.dam_station = dam_station;
    graphDam.name = name;

    $('#date').text( JH.DateFormat(moment(), 'DD MMM YYYY') );
    $('#btn_preview').on('click' , graphDam.btnPreviewClick);

    apiService.SendRequest( "GET", "thaiwater30/iframe/dam" , {} , function(rs){
        graphDam.handlerSrvDam(rs.dam);
        graphDam.handlerSrvDamDatatype(rs.dam_datatype);
        if ( dam_station || name ){
            $('#btn_preview').trigger('click');
        }
    } );
    HC.SetFormat("headFormat", "D MMM");
    HC.SetFormat("labelFormat", "D MMM");
    HC.useDefaultTooltip();
}

/**
*   event on btn preview click
*   load data and render grpah
*/
graphDam.btnPreviewClick = function(){
    var param = {};
    $('form').find('select:visible').each(function(i , e){
        param[$(e).attr('name')] = $(e).val();
    });
    apiService.SendRequest("GET", "thaiwater30/iframe/dam_graph", param , function(rs){
        if (rs.result == "OK"){
            option = {
                title: { text: $('#dam_datatype>option:selected').text() + $('#dam_name>option:selected').text(), },
                xAxis: {
                    tickInterval: 30 * 24 * 3600 * 1000, // 1 month
                    type: 'datetime',
                    title: {text: day},
                    labels: { rotation: -90 },
                    max: parseInt( moment.utc([graphDam.leapYear, 11, 31]).format('x') ),
                    min: parseInt( moment.utc([graphDam.leapYear, 0, 1]).format('x') ),
                },
                yAxis: {
                    title: {
                        text: $('#dam_datatype>option:selected').text() +" "+ dam_unit
                    }
                },
                series: []
            }

            var data = JH.GetJsonValue(rs, "data");
            var graph_data = JH.GetJsonValue(data, "graph_data");
            var gdLen = graph_data.length;
            var curYear = new Date().getFullYear(); // ปี ปัจจุบัน
            for (var i = 0 ; i < gdLen ; i++){
                var gd = graph_data[i];
                var seriData = [];
                var _year = JH.GetJsonValue(gd, "year");
                var _data = JH.GetJsonValue(gd, "data");
                var _dLen = _data.length;
                for(var j = 0 ; j < _dLen ; j++){
                    var d = _data[j];
                    var date = moment.utc( JH.GetJsonValue(d, "date") );
                    date = parseInt( moment.utc([graphDam.leapYear, date.month(), date.date()]).format('x'));
                    var value = JH.GetJsonValue_Float(d, "value", null);
                    seriData.push([date, value]);
                }
                var _seri = HC.Series(JH.DateFormat(_year+'-01-01', "YYYY"), 'line', seriData);
                if (curYear == _year){
                    // ตั้งให้ ซีรี่ย์ เป็นสีแดง
                    _seri["color"] = "red" ;
                }
                option["series"].push(_seri);
            }
            if ( param["data_type"] == "dam_storage"){
                // dam_storage เพิ่ม lower, upper bound
                var tempDate = parseInt( moment.utc([graphDam.leapYear, 0, 1]).format('x') );
                var lower_bound = JH.GetJsonValue_Float(data, "lower_bound");
                // ตรึง lower, upper
                option["series"].push(HC.PS(graphDam.translator["lower_bound"], [ [tempDate, lower_bound] ]));
                var upper_bound = JH.GetJsonValue_Float(data, "upper_bound");
                option["series"].push(HC.PS(graphDam.translator["upper_bound"], [ [tempDate, upper_bound] ]));

                pl = [
                    HC.PlotLines(graphDam.translator["lower_bound"] +" " + numeral(lower_bound).format('0,0') + " " + dam_unit, lower_bound)
                    , HC.PlotLines(graphDam.translator["upper_bound"] +" " + numeral(upper_bound).format('0,0') + " " + dam_unit, upper_bound)
                ]
                option["yAxis"] = $.extend(option["yAxis"], { plotLines: pl});
            }

            $('#graph').highcharts(option);
        }
    });

}

/**
*   handler service dam
*   สร้าง select dam ถ้ามี dam_station, name ตอน init จะ default ไปที่อันนั้น
*   @param {object} rs - result.data.dam from service dam
*/
graphDam.handlerSrvDam = function(rs){
    var select = document.getElementById("dam_name");
    var selectIndex = 0;
    var hasDefault = false;
    select.options.length = 0;

    if (graphDam.dam_station != "" || graphDam.name != ""){
        hasDefault = true;
    }

    if (rs.result == "OK"){
        data = JH.GetJsonValue(rs, "data");
        for (var i = 0 ; i < data.length ; i++){
            var d = data[i];
            var option = document.createElement("option");
            var txt_option = dam + JH.GetJsonLangValue(d, "dam_name", true).replace("*","");
            var	val_option = d["id"];

            if (hasDefault){
                if (val_option == graphDam.dam_station && graphDam.dam_station != ""){
                    selectIndex = i;
                    hasDefault = false;
                }else if ( JH.GetJsonLangValue(d, "dam_name", true) == graphDam.name && graphDam.name != ""){
                    selectIndex = i;
                    hasDefault = false;
                }
            }

            option.text = txt_option;
            option.value = val_option;
            select.add(option);
        }
        select.selectedIndex  = selectIndex;
    }
}

/**
*   handler service datatype
*   สร้าง select datatype
*   @param {object} rs - result.data.dam_datatype from service dam
*/
graphDam.handlerSrvDamDatatype = function(rs){
    var select = document.getElementById("dam_datatype");
    select.options.length = 0;
    data = rs.data;
    for (var i = 0 ; i < data.length ; i++){
        var option = document.createElement("option");
        var txt_option = JH.GetJsonLangValue(data[i], "text");
        var val_option = JH.GetJsonValue(data[i], "value");

        option.text = txt_option;
        option.value = val_option;
        select.add(option);
    }

}
