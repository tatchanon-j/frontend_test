/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvPrerain = {}; //initial data

srvPrerain.prerain_setting = function(rs,code_data,setting_name,el_name) {
  var self = srvPrerain;
  console.log(setting_name);
  console.log("RS:",rs);
  self.jsonObj = rs;
  var arr_rule = rs.rule;
  var arr_level = rs["level-text"];
  //Rule data
  for(var i=1; i<=Object.keys(arr_rule).length; i++){
    $('#text-level-'+i).html(translate["predict_rain_level_"+i]);
    var arr_sub_rule = arr_rule[i];
    for(var j=0; j<Object.keys(arr_sub_rule).length; j++){
      $('#rule'+i+' .pre_rain_operator_'+(j+1)).val(arr_sub_rule[j].operator);
      $('#rule'+i+' .pre_rain_term_'+(j+1)).val(arr_sub_rule[j].term);
      $('#rule'+i+' .pre_rain_level_'+(j+1)).val(arr_sub_rule[j].level);
    }
  }

  //Level data
  Object.keys(arr_level).forEach(function(i){
    var lv = arr_level[i];
    $('.pre_rain_leval_grp'+i+ ' .text-level').text(lv.text);
    $('.pre_rain_leval_grp'+i+ ' #pre_rain_level_colorname').val(lv.colorname);
    $('.pre_rain_leval_grp'+i+ ' #pre_rain_level_color').val(lv.color).css({'background-color':lv.color});
  })
}
