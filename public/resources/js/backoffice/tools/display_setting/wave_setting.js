/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvWave = {}; //initial data

srvWave.wave_setting = function(rs,code_data,setting_name,el_name) {
  console.log(rs);
  $('#wave_trans').val(rs.trans);
  $('#wave_colorname').val(rs.colorname);
  $('#wave_color').val(rs.color).css({'background-color':rs.color});
}
