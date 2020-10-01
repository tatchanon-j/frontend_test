/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvStorm = {}; //initial data

srvStorm.storm_setting = function(rs,code_data,setting_name,el_name) {

  console.log(setting_name);
  console.log("Data:",rs);

  for(var i=0; i<rs.length; i++){
    $('#storm-'+i).find('input[name="color"]').val(rs[i].color).css({'background-color':rs[i].color});
    $('#storm-'+i).find('input[name="term"]').val(rs[i].term);
    $('#storm-'+i).find('span[name="kmh_text"]').text(rs[i].kmh_text);
    $('#storm-'+i).find('span[name="knots_text"]').text(rs[i].knots_text);
    $('#storm-'+i).find('span[name="mph_text"]').text(rs[i].mph_text);
    $('#storm-'+i).find('span[name="scale_text"]').text(rs[i].scale_text);
    $('#storm-'+i).find('span[name="strength"]').text(rs[i].strength);
  }
}
