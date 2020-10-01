// @author   Thitiporn Meeprasert <thitiporn@haii.or.th>

$.ajax({
    type: "POST",
    url: "../resources/js/frontoffice/warroom/salinity.json",
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

setContent = function(data) {
	if (data.length != 0) {
		var object = $.parseJSON(data);
	    $.each(object, function (index) {
		    stationId = object[index].station_id;
		    stationName = object[index].station_name;
		    stationShort = stationName.split(' ');
		    stationDate = object[index].station_date;
		    salinity = numeral(object[index].salinity).format(numericFormat);
		    salinityColor = object[index].salinity_color;
			divId = index +1;

			$('#date').text(stationDate);
			$('#tab_1_2_' + divId + '.tab-pane.active div.widget-thumb.text-center h4.text-center.white').text(stationName);
			$('#tab_1_2_' + divId + ' #salinity').text(salinity);
			$('#list' + divId).text(stationShort[0]);
	    });
	}
}