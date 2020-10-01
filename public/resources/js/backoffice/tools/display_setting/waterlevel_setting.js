/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

$(function(){console.log("waterquality_setting");})


var srvWaterLv = {}; //initial data

srvWaterLv.waterlevel_setting = function(rs,code_data,setting_name,el_name) {
	console.log("Data:",rs)

	var arr_level = rs.level;
	var arr_scale = rs.scale;

	// $('#waterlevel-scale div.waterlevel-scale').each(function(i){
	// 	$('.waterlevel_level_text_'+i).html(translate[arr_scale[i].trans]);
	// 	$(this).find('input[name="term"]').val(rs.scale[i].term);
	// 	$(this).find('input[name="color"]').val(rs.scale[i].color).css({'background-color':rs.scale[i].color});
	// })
  //
	// $('.waterlevel-nottoday').find('input[name="color"]').val(rs.not_today.color).css({'background-color':rs.not_today.color});
  //
  //
	// $('#waterlevel-rule div.waterlevel_rule_sub').each(function(i){
	// 	$(this).find('input[name="term"]').val(rs.scale[i].term);
	// })
  //
	// $('#waterlevel-level div.waterlevel_level_sub').each(function(i){
	// 	$('.waterlevel_level_name_'+(i+1)).html(translate[arr_level[i+1].trans]);
	// 	$(this).find('input[name="term"]').val(rs.rule[i].term);
	// 	$(this).find('input[name="color"]').val(rs.level[i+1].color).css({'background-color':rs.level[i+1].color});
	// })

}
