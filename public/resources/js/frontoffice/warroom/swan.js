// @author	Permporn Kuibumrung <permporn@haii.or.th>

var url_swan = $("#swan_url").val();
        
$('#ex_swan').load(url_swan, function(){
	swanFillStatusColor();
});

function swanFillStatusColor() {
	$.ajax({
		type: "GET",
		url: "resources/js/frontoffice/warroom/swan.json",
		dataType: "json",
		
		success: function (data) {
			   for(var i in data) {
				  var obj = data[i];
				  for(var key in obj) {
					d3.select("svg#svg3076").select("path#"+obj["id"]).style("visibility", "visible");
					d3.select("svg#svg3076").select("path#"+obj["id"]).style("fill", obj["status_color"]);
				  }
			   }
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR.responseText);
		}
	});
}