/**
*
*   Main JS application file for management display page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvWaterq = {}; //initial data

srvWaterq.waterquality_setting = function(rs,code_data,setting_name,el_name) {
	console.log("waterquality_setting:",rs);

	//Criteria
	$('#criteria div.criteria_sub').each(function(i){
		var class_name = $(this).attr('class').split(" ");
		var arr_name = [class_name];
		arr_name = arr_name[0][1];

		console.log("Name:",arr_name);

		//Criteria
		if(arr_name != 'ph'){
			console.log("DD:",rs.criteria[144]);
			$(this).find('input[name="term"]').val(rs.criteria[144][arr_name][0].term);
			$(this).find('input[name="color"]').val(rs.criteria[144][arr_name][0].color).css({'background-color':rs.criteria[arr_name][0].color});
		}else{
			$(this).find('.ph_sub').each(function(k){
				$(this).find('input[name="term"]').val(rs.criteria[144][arr_name][k].term);
				$(this).find('input[name="term-2"]').val(rs.criteria[144][arr_name][k].term_2);
				$(this).find('input[name="color"]').val(rs.criteria[144][arr_name][k].color).css({'background-color':rs.criteria[arr_name][k].color});
			})
		}
	})

	//Default
	$('#default div.default_sub').find('input[name="color"]').val(rs.default.color).css({'background-color':rs.default.color});
	//Not_today
	$('.not_today').find('input[name="color"]').val(rs.not_today.color).css({'background-color':rs.not_today.color});

	//default
	$('.default').find('input[name="color"]').val(rs.default.color).css({'background-color':rs.default.color});


	//Scale
	$('#scale div.scale_sub').each(function(i){
		var class_name = $(this).attr('class').split(" ");
		var arr_name = [class_name];
		arr_name = arr_name[0][1];

		console.log("Name:",arr_name);

		//Scale
		if(arr_name != 'ph'){
			console.log("No PH");
			$('#scale div.'+arr_name).find('div.sub').each(function(j){
				console.log(j)
				$(this).find('input[name="term"]').val(rs.scale[arr_name][j].term);
				$(this).find('input[name="color"]').val(rs.scale[arr_name][j].color).css({'background-color':rs.scale[arr_name][j].color});
			})
		}else{
			console.log("PH");
			$('#scale div.'+arr_name).find('div.sub').each(function(k){
				console.log(k);
				$(this).find('input[name="term"]').val(rs.scale[arr_name][k].term);
				$(this).find('input[name="term-2"]').val(rs.scale[arr_name][k].term_2);
				$(this).find('input[name="color"]').val(rs.scale[arr_name][k].color).css({'background-color':rs.scale[arr_name][k].color});
			})
		}
	})

}
