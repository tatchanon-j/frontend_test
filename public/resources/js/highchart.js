/**
 *
 *  Highcharts Object for handler Highcharts.
 *
 *  @author CIM Systems (Thailand) <cim@cim.co.th>
 *  @license HAII
 *
 */

var srvHighchart = {};
var HC = srvHighchart; // alias

/**
*   set language to th
*/
srvHighchart.setLangThai = function(){
    Highcharts.setOptions({
        lang: {
            months: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
            weekdays: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
            shortMonths: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
        }
    });
}

/**
*   Initial HC
*/
srvHighchart.init = function(){
    if ( JH.IsTH() ){
        srvHighchart.setLangThai();
    }
    // set default option
    Highcharts.setOptions({
        lang: { thousandsSep: ',', numericSymbols: null, },
        chart: { zoomType: 'x' },
        title: { text: '', },
        legend:{ enabled: true },
        exporting : { enabled: false },
        credits: { enabled: false },
        tooltip: {
            enabled: true,
            shared: true,
            crosshairs: true,
            valueDecimals: 2
        },
        plotOptions: {
            series : {
                marker: {
                    enabled:false
                },
            },
            column : {
                groupPadding: 0,
                pointPadding:0,
                dataLabels: {
                    crop: false,
                    align: 'center',
                    enabled: true,
                    rotation: 0,
                    formatter:function() {
                        return numeral(this.y).format('0,0');
                    } ,
                }
            }
        },
        xAxis:{
            dateTimeLabelFormats: HC.DateTimeLabelFormats,
            labels:{
                formatter: HC.Labelformatter
            }
        },
        yAxis:{
            allowDecimals: false,
            gridZIndex: -1,
            labels:{
                formatter:function() {
                    return numeral(this.value).format('0,0');
                } ,
                style: { fontSize:'11px'}
            }
        },
    });
}

/**
*   set Highcharts to use HC.ToolTipFormatter
*/
srvHighchart.useDefaultTooltip = function(){
    Highcharts.setOptions({
        tooltip: {
            formatter: HC.ToolTipFormatter
        }
    });
}

/**
*   create series object
*   @param {string} _name - ชื่อของซีรี่ย์
*   @param {string} _type - ชนิดของซีรี่ย์
*   @param {array} _data - ดาต้า
*   @return {object}
*/
HC.Series = function(_name, _type, _data){
    var name = '';
    var type = 'line';
    var data = null;
    if (_name){ name = _name; }
    if (_type){ type = _type; }
    if (_data){ data = _data; }
    return {
        name: name
        , type: type
        , data: data
    };
};

/**
*   create series object สำหรับตรึง plotLines
*   @param {string} _text - ชื่อ
*   @param {array} _data - ดาต้า
*   @return {object}
*/
HC.PS = function(_text, _data){
    var _s = HC.Series(_text, '', _data);
    _s["lineWidth"] = 0;
    _s["showInLegend"] = false;
    _s["enableMouseTracking"] = false;
    return _s;
}

/**
*   create plotLines object
*   @param {string} _text - ชื่อ
*   @param {string} _value - ค่าที่จะ point
*   @param {string} _color - สี #ffffff , white, default = yellow
*   @return {object}
*/
HC.PlotLines = function(_text, _value, _color){
    var text = '', value = null, color = 'yellow';
    if (_text) { text = _text; }
    if (_value) { value = _value; }
    if (_color) { color = _color; }
    return {
        color: color
        , dashStyle: 'Dash'
        , width: 1
        , value: value
        , label: { text: text }
    }
}

/**
*   default dateTimeLabelFormats use moment format
*/
HC.DateTimeLabelFormats = {
    millisecond: 'LTS',
    second: 'LTS',
    minute: 'LT',
    hour: 'D MMM YYYY HH:mm',
    day: 'D MMM YYYY HH:mm',
    week: 'D MMM YYYY',
    month: 'D MMM YYYY',
    year: 'D MMM YYYY'
};

/**
*   default Labelformatter
*/
HC.Labelformatter = function(){
    _dateTimeLabelFormat = JH.GetJsonValue(this, "dateTimeLabelFormat");
    _format = HC.Format.labelFormat ? HC.Format.labelFormat : _dateTimeLabelFormat;
    if ( !_format  ){ return this.value; }
    return JH.DateUtcFormat(this.value, _format);
}

/**
*   default format
*/
HC.Format = {
    headFormat: HC.DateTimeLabelFormats.hour,
    pointFormat: "0,0.00",
    labelFormat: "",
}

/**
*   set format object
*   @param {string} key - key ใน HC.Format ที่จะให้ตั้งค่า
*   @param {string} value - ค่าที่จะตั้ง
*/
HC.SetFormat = function(key, value){
    HC.Format[key] = value;
}

/**
*   get tooltipformatter
*/
HC.ToolTipFormatter = function(){
    this["fc"] = HC.Labelformatter;
    this["dateTimeLabelFormat"] = HC.Format["headFormat"];
    this["value"] = this.x;
    var s = '<span style="font-size: 10px">'+this["fc"]()+'</span><br/>';

    $.each(this.points, function () {
        s += '<span style="color:'+this.color+'">\u25CF</span> '+this.series.name+
        ': <b>'+numeral(this.y).format(HC.Format["pointFormat"])+'</b><br/>';
    });

    return s;
}
