var cim = {}; // เปลี่ยนตามชื่อตัวเอง

cim.init = function(){
  cim.service_url = "test/cim"; // เปลี่ยนตามชื่อตัวเอง

  cim.datatable = $('#cim-table').DataTable({
    columns: [
      {data: cim.renderRegionId},
      {data: 'province_id'},
      {data: cim.renderProvinceName},
    ],

  });

  $('#cim-btn').on('click', cim.btnClick);

  apiService.SendRequest('GET', cim.service_url, null, cim.handlerGetService);
}

cim.btnClick = function(){
  var param = {
    region_id: $('#input-region_id').val(),
    province_id: $('#input-province_id').val(),
  };
  apiService.SendRequest('GET', cim.service_url, param, cim.handlerGetService);
}

cim.handlerGetService = function(data, textStatus, jqXHR ){
  cim.datatable.clear();
  cim.datatable.rows.add(data);
  cim.datatable.draw();
};

cim.renderRegionId = function(row){
  return JH.GetJsonValue(row, "region_id", "ไม่มี");
}

cim.renderProvinceName = function(row){
  return '<button>'+ JH.GetJsonLangValue(row, "province_name") +'</button>';
}
