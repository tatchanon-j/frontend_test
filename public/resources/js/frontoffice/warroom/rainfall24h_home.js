// @author	Permporn Kuibumrung <permporn@haii.or.th>
$('#rainfall24h_home').DataTable({
	"ajax": {
			"url": "../../resources/js/frontoffice/warroom/rainfall24h_home.json",
			"dataSrc": ""
		},
	"columns": [
		{ "data": "tele_station_name" },
		{ "data": "province_name" },
		{ "data": "rainfall_time" },
		{ "data": "rainfall24h" }
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
				var a = '<a onclick="gotoMarker(\'' + full.tele_station_id +'\',\''+ full.tele_station_lat +'\',\''+ full.tele_station_long+ '\');return false;"><i class="fa fa-map-marker" aria-hidden="true"></i> '+ tele_station_name +'</a>';
				return a;
			}
		}
	]
});
