/**
*
*   asum Object for handler agency/agency_summary page
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var asum = {};

/**
*   Initial asum
*/
asum.init = function(){
    asum.startYear = 1950;
    asum.service = "thaiwater30/agency/agency_summary";

    asum.initFilter();
    $('#btn_preview').on('click' , asum.btnPreviewClick);
    asum.btnPreviewClick();
}

/**
*   Initial filter
*   render filter year and month
*/
asum.initFilter = function(){
    // สร้าง select year ตั้งแต่ asum.startYear จนถึง ปีปัจจุบัน
    var filter = document.getElementById('filter_year');
    for (var i = new Date().getFullYear() ; i >= asum.startYear ; i-- ){
        var o = document.createElement('option');
        o.text = i;
        o.value = i;
        filter.add(o);
    }
    // default current month
    $('#filter_month').val( moment().month() + 1 );
}

/**
*   event btn previve on click
*   load data and render chart
*/
asum.btnPreviewClick = function(){
    var param = {year : $('#filter_year').val() , month: $('#filter_month').val() };
    apiService.SendRequest("GET" , asum.service , param , function(rs){
        if (JH.GetJsonValue(rs , "result") == "OK"){
            asum.genChart( JH.GetJsonValue(rs , "data.online") );
            asum.genChartOffline( JH.GetJsonValue(rs , "data.offline") );
        }
    })
}

/**
*   genarate chart
*   @param {array} data - result.data.online จาก service
*/
asum.genChart = function(data){
    if (! data ){ return false; }
    var categories = [];
    var series_data = [];
    // ทำ series data
    for (var i = 0 ; i < data.length ; i++){
        var d = data[i];

        var percent = numeral(JH.GetJsonValue_Float(d , "download_count_percent")).format('0,0.00');
        categories.push( JH.GetJsonValue(d , "agency.agency_shortname.en") );
        series_data.push( numeral(percent).value() );
    }
    var option = {
        chart: { type: 'column' },
        xAxis: {
            categories: categories,
            title:{
                text: TRANSLATOR["xaxis_text"]
            },
            crosshair: true
        },
        yAxis: {
            title: {
                text: TRANSLATOR["yaxis_text"]
            }
        },
        series: [{
            name: TRANSLATOR["series_name"],
            data: series_data
        }],
        tooltip: {
            headerFormat: '<span style="font-size: 10px">{series.name}</span><br/>',
            pointFormat: '<span style="color:{point.color}">\u25CF</span> {point.key}: <b>{point.y}</b><br/>',
            valueSuffix: ' %'
        }
    };
    $('#div_preview').highcharts(option);
}/**
*   genarate chart offline
*   @param {array} data - result.data.offline จาก service
*/
asum.genChartOffline = function(data){
    if (! data ){ return false; }
    var categories = [];
    var series_data = [];
    // ทำ series data
    for (var i = 0 ; i < data.length ; i++){
        var d = data[i];

        var percent = numeral(JH.GetJsonValue_Float(d , "download_count"));
        categories.push( JH.GetJsonValue(d , "agency.agency_shortname.en") );
        series_data.push( numeral(percent).value() );
    }
    var option = {
        chart: { type: 'column' },
        xAxis: {
            categories: categories,
            title:{
                text: TRANSLATOR["xaxis_text"]
            },
            crosshair: true
        },
        yAxis: {
            title: {
                text: TRANSLATOR["yaxis_text_offline"]
            }
        },
        series: [{
            name: TRANSLATOR["series_name_offline"],
            data: series_data
        }],
        tooltip: {
            headerFormat: '<span style="font-size: 10px">{series.name}</span><br/>',
            pointFormat: '<span style="color:{point.color}">\u25CF</span> {point.key}: <b>{point.y}</b><br/>',
        }
    };
    $('#div_preview-offline').highcharts(option);
}
