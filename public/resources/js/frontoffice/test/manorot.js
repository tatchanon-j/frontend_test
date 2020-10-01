var manorot = {};

manorot.init = function() {
	manorot.service_url = "test/manorot";

	manorot.datatable = $('#manorot-table').DataTable({
		columns: [
			{data: manorot.renderRegionId},
			{data: 'province_id'},
			{data: manorot.renderProvinceName},
		],
		pageLength: 10
	});

	// register button click event
	$('#manorot-btn').on('click', manorot.btnClick);

	// 3rd param is param in json format
	// 4th param is function that handle fail request
	apiService.SendRequest('GET', manorot.service_url, null, manorot.handlerGetService);
}

// button click event handle
manorot.btnClick = function() {
	var param = {
		region_id: "5",
		province_id: "81",
	}

	apiService.SendRequest('GET', manorot.service_url, param, manorot.handlerGetService);
}

// handle after get servuce
manorot.handlerGetService = function(data, textStatus, jqXHR) {
	manorot.datatable.clear();
	manorot.datatable.rows.add(data);
	manorot.datatable.draw();
};

// specific render column
manorot.renderRegionId = function(row){
  return JH.GetJsonValue(row, "region_code", "ไม่มี");
}

// specific render column
manorot.renderProvinceName = function(row) {
	// console.log(arguments);
	return '<button>' + JH.GetJsonLangValue(row, "province_name") + '</button>';
}