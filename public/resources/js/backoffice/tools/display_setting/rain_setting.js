/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvRain = {}; //initial data

srvRain.rain_setting = function(rs,code_data,setting_name,el_name) {

  console.log(setting_name);
  console.log("data:",rs);

  $('#rain-rule div.tab-pane').each(function(i){
    // console.log(i);
    i+=1; //i begin at 1s
    i<10? i='0'+i:i=i; // add 0 front index of array because array in source json begin at 01.

    // console.log("Name:",rs.level_color[3].name )

    $(this).find('div.sub-content-rule').each(function(k){
      console.log(k);
      $(this).find('input[name="rain1h"]').val( rs.rule[i][k].rain1h );
      $(this).find('input[name="rain3d"]').val( rs.rule[i][k].rain3d );
      $(this).find('input[name="rain24h"]').val( rs.rule[i][k].rain24h );
      $('#rain-rule div.tab-pane').siblings().find('h4.rain_rule_level_color_4').text(rs.level_color[4].name);
      $('#rain-rule div.tab-pane').siblings().find('h4.rain_rule_level_color_3').text( rs.level_color[3].name );
    })
  })

  $('#rain-rule div.level-color').each(function(i){
    // console.log(i);
    var tg_color = rs.level_color[i+3].color;
    var name = rs.level_color[i+3].name;
    // console.log("Name:",name);

  	$('#rain-rule div.level-color').prev().find('.level_color_name_'+(i+3)).text(name);
		$(this).find('input[name="color"]').val(tg_color).css({'background-color':tg_color});
		$('#rain-rule div.level-color').find('.level_color_name_'+(i+3)).text(name);
	})

  $('#rain-scale div.rain-scale-level').each(function(i){
    var tg_color = rs.scale[i].color;
    $(this).find('input[name="term"]').val(rs.scale[i].term);
		$(this).find('input[name="color"]').val(tg_color).css({'background-color':tg_color});
	})
}
