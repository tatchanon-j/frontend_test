// @author   Thitiporn Meeprasert <thitiporn@haii.or.th>

$.ajax({
    type: "POST",
    url: "resources/js/frontoffice/warroom/rainfall24h_home.json",
    dataType: 'html',
}).done(function(data) {
	setContent(data)
}).fail(function(data) {
	console.log("failed");
});

// var socket = io.connect('http://192.168.10.145:3000/');
// socket.on('notification2', function (data) {
//     setContent(data);
// });

/*
"tele_station_name":"บ้านช่องลม อ.พนม",
"tele_station_id":"teleegat0118",
"rainfall_date":"2016\/11\/22",
"rainfall_date_calc":"2016\/11\/22",
"rainfall_time":"22:00:00",
"rainfall24h":100,
"unit":"มม.",
"tele_station_lat":"8.905283",
"tele_station_long":"98.687993",
"district_name":"คลองศก",
"amphoe_name":"พนม",
"province_name":"สุราษฎร์ธานี"
*/

setContent = function(data) {
	if (data.length != 0) {
		var object = $.parseJSON(data);
		var tabdata = '';
		
	    $.each(object, function (index) {
		    stationId = object[index].tele_station_id;
		    stationName = object[index].tele_station_name;
			provinceName = object[index].province_name;
		    stationDate = object[index].rainfall_date;
			stationTime = object[index].rainfall_time.substring(0, 5);
		    rainfall24h = object[index].rainfall24h;
		    unit = object[index].unit;
			
			tabdata = '<div class="tab-pane" id="rainfall_tab'+index+'">';
			tabdata += '	<div class="widget-thumb ">';
			tabdata += '		<h4 class="text-center white"> '+stationName+', <small class="white-gray">จ.'+provinceName+' </small> </h4>';
			tabdata += '		<div class="widget-thumb-wrap">';
			tabdata += '			<div class="widget-thumb-body" style="width: 100%;float: left">';
			tabdata += '				<h1 style="font-size:5em;" class="widget-thumb-body-stat text-center" data-counter="counterup" data-value="'+rainfall24h+'">'+rainfall24h+'</h1>';
			tabdata += '				<span class="widget-thumb-subtitle text-center">('+unit+')</span>';
			tabdata += '			</div>';
			tabdata += '			<div class="widget-thumb-body text-center" style="width: 100%;">';
			tabdata += '				<span class="widget-thumb-subtitle">ฝนหนัก</span>';
			tabdata += '				<i class="fa fa-cloud"></i>';
			tabdata += '			</div>';
			tabdata += '		</div>';
			tabdata += '	</div>';
			tabdata += '</div>';

			navtab = '<li>';
			navtab += '	<a href="#rainfall_tab'+index+'" data-toggle="tab">';
			navtab += '		<small>'+stationTime+'</small>';
			navtab += '		<h5><i class="fa fa-cloud"></i></h5>';
			navtab += '		<h4 data-counter="counterup" data-value="'+rainfall24h+'">'+rainfall24h+'</h4>';
			navtab += '	</a>';
			navtab += '</li>'



			if(index < 5){
				$('#rainfall').append(tabdata);
				$('#nav-rainfall').append(navtab);
				$('#rainfall .tab-pane').eq(0).addClass('active');
				$('#nav-rainfall ul li').eq(0).addClass('active');
			}
/*
			$('#date').text(stationDate);
			$('#tab_1_2_' + divId + '.tab-pane.active div.widget-thumb.text-center h4.text-center.white').text(stationName);
			$('#tab_1_2_' + divId + ' #salinity').text(salinity);
			$('#list' + divId).text(stationShort[0]);
			*/
	    });
	}
}