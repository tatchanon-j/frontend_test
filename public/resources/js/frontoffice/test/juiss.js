var juiss = {};

juiss.init = function(){
  juiss.service_url = 'test/juiss';

  juiss.datatable = $('#juiss-table').DataTable({
      columns: [
        {data: juiss.renderRegionId},
        {data: 'province_id'},
        {data: juiss.renderProvinceName},
      ]
  });

  $('#btn-filter').on('click',juiss.btnClick);

  apiService.SendRequest('GET',juiss.service_url, null, juiss.handlerGetService);
}

juiss.btnClick = function(){
var param = {
  region_id: $('#input_region_id').val(),
  province_id: $('#input_province_id').val(),
}

apiService.SendRequest('GET',juiss.service_url, param, juiss.handlerGetService);

}

juiss.handlerGetService = function(data, textStatus, jqXHR){
  juiss.datatable.clear();
  juiss.datatable.rows.add(data);
  juiss.datatable.draw();
  console.log(data)
};

juiss.renderRegionId = function(row){
  return JH.GetJsonValue(row,"region_id","ไม่มี");
}

juiss.renderProvinceName = function(row){
  console.log(arguments);
  return '<button>' + JH.GetJsonLangValue(row,"province_name") + '</button>'
}
