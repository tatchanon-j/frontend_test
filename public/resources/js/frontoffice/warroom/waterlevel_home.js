//@author	Permporn Kuibumrung <permporn@haii.or.th>
$('#waterlevel_home').DataTable({
	"ajax": {
			"url": "../../resources/js/frontoffice/warroom/waterlevel_home.json",
			"dataSrc": ""
		},
	"columns": [
		{ "data": "tele_station_name" },
		{ "data": "wl_tele_date" },
		{ "data": "wl_tele_time" },
		{ "data": "water_level" },
		{ "data": "water_level" },
		{ "data": "bank" },
		{ "data": "status" },
		{ "data": "status" }
	],
	"dom": 'rt<"bottom"l><"clear">',
	"iDisplayLength": 10,
	"aLengthMenu": [[5, 10, 20], [5, 10, 20]],
	"oLanguage": {             
		"sLengthMenu": "แสดง _MENU_ รายการ"
	},
	"aoColumnDefs":[
		{
			"aTargets": [ 0 ],
			"mData": "tele_station_name",
			"mRender": function ( tele_station_name, type, full )  {
				var a = '<a onclick="gotoMarker(\'' + full.tele_station_id +'\',\''+ full.tele_station_lat +'\',\''+ full.tele_station_long+ '\');return false;"><i class="fa fa-map-marker" aria-hidden="true"></i> '+tele_station_name+'</a>';
				return a;
			}
		},
		{
			"aTargets": [ 6 ],
			"mData": "status",
			"mRender": function ( status, type, full )  {
			 	return '<font color="'+ full.color+'">'+ status +'</font>';
			}
		},
		{
			"aTargets": [ 7 ],
			"mData": "status",
			"mRender": function ( status, type, full )  {
			 	return '<font color="'+ full.color+'">'+ status +'</font>';
			}
		}
		
	]
});
