// @author   Thitiporn Meeprasert <thitiporn@haii.or.th>
var socket = io.connect('http://192.168.10.145:3000/');
socket.on('notification1', function (data) {
    setContent(data);
});

setContent = function(data) {
    if (data.length != 0) {
	   var object = $.parseJSON(data);
        $.each(object, function (index) {
            damId = object[index].dam_id;
            damName = object[index].dam_name;
            damShort = damName.split(' ');
            damDate = object[index].dam_date;
            damStorage = numeral(object[index].dam_storage).format(numericFormat);
            damStoragePercent = object[index].dam_storage_percent;
            damStorageStatusColor = object[index].dam_storage_status_color;
            damInflow = numeral(object[index].dam_inflow).format(numericFormat);
            damReleased = numeral(object[index].dam_released).format(numericFormat);
            divId = index + 1;

            $('#data' + divId).text(damInflow);
            $('#name' + divId).text(damName);
            $('#list' + divId).text(damShort[0]);
            $('#dam_storage_percent' + divId).text(damStoragePercent);
            $('#dam_inflow' + divId).text(damInflow);
            $('#dam_released' + divId).text(damReleased);
        });
    }
}