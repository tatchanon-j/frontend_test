/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvWarning = {}; //initial data

srvWarning.warning_setting = function(rs,code_data,setting_name,el_name) {
var self = srvWarning;
console.log(setting_name);
console.log(rs);

$('#warning-drought').val(JH.GetJsonValue(rs,'drought')).css({'background-color':JH.GetJsonValue(rs,'drought')});
$('#warning-flood').val(JH.GetJsonValue(rs,'flood')).css({'background-color':JH.GetJsonValue(rs,'flood')});
$('#warning-rain').val(JH.GetJsonValue(rs,'rain')).css({'background-color':JH.GetJsonValue(rs,'rain')});
$('#warning-warning').val(JH.GetJsonValue(rs,'warning')).css({'background-color':JH.GetJsonValue(rs,'warning')});
}
