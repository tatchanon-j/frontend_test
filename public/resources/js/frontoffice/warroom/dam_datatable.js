//@author	"Weanika Chumjai" <weanika@haii.or.th>
$('#dam_home').DataTable({
	"ajax": {
			"url": "../../resources/json/damSample.json",
			"dataSrc": ""
		},
	"columns": [
		{ "data": "dam_name" },
		{ "data": "dam_inflow" },
		{ "data": "dam_storage_percent" },
		{ "data": "dam_uses_water_percent" },
		{ "data": "dam_uses_water_percent" }
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
			"mData": "dam_name",
			"mRender": function ( dam_name, type, data )  {
				var a = '<p align="left"><a onclick="gotoMarker(\'' + data.dam_id +'\',\''+ data.dam_lat +'\',\''+ data.dam_long+ '\');return false;"><i class="fa fa-map-marker" aria-hidden="true"></i> '+"เขื่อน"+dam_name+'</a></p>';
				return a;
			}
		},
		{
			"aTargets": [ 2 ],
			"mData": "dam_storage_percent",
			"mRender": function ( dam_storage_percent, type, data )  {
			 	return '<font color="'+ data.color+'">'+ dam_storage_percent +'</font>';
			}
		}/*,
		{
			"aTargets": [ 7 ],
			"mData": "status",
			"mRender": function ( status, type, data )  {
			 	return '<font color="'+ data.color+'">'+ status +'</font>';
			}
		}*/
		
	]
});
