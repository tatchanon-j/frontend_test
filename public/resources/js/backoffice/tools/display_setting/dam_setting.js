/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvDam = {}; //initial data

srvDam.dam_setting = function(rs,code_data,setting_name,el_name) {
	console.log("Data:",rs);
	$('.dam_high_text').html(translate[rs.high.trans]);
	$('.dam_low_text').html(translate[rs.low.trans]);
	$('#dam-scal-high-color').val(rs.high.color).css({'background-color':rs.high.color});
	$('#dam-scal-low-color').val(rs.low.color).css({'background-color':rs.low.color});


	// Object.keys(rs.scale).foreach(function(i){
	//
	// })

	$('.dam_scale div.dam_scale_sub').each(function(i){
		$(this).find('input[name="term"]').val(rs.scale[i].term);
		$(this).find('input[name="color"]').val(rs.scale[i].color).css({'background-color':rs.scale[i].color});
	})

}
