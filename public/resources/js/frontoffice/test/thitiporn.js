/**
 *
 *   training test show get data from api render table
 *
 *   @author Thitiporn Meeprasert <thitiporn@haii.or.th>
 *   @license HAII
 *
 */
var main = {};

main.init = function() {

  // api
  // http://api2.thaiwater.net:9200/api/v1/test/thitiporn
  // api doc
  // http://web.thaiwater.net/thaiwater30/api-docs/test#/test/get_test_thitiporn
  main.service_url = "test/thitiporn";

  main.datatable = $('#thitipornTable').DataTable({
    //   columns: [{
    //     data: 'region_id'
    //   }, {
    //     data: 'province_id'
    //   }, {
    //     data: 'province_name'
    //   }, {
    //     data: 'province_name_json.th'
    //   }, ],
    //   "pageLength": 10
    // });

    columns: [{
      data: main.renderRegionId
    }, {
      data: 'province_id'
    }, {
      data: 'province_name'
    }, {
      data: 'province_name_json.th'
    }, ],
    "pageLength": 10
  });

  $('#openProvince').on('click', main.btnopenProvinceClick);

  // call service
  // apiService.SendRequest(methos (GET/PUT/POST),service_url,parameter,function,function return error model custom);
  apiService.SendRequest('GET', main.service_url, null, main.handleGetService);
}

/**
 *   event on btn open province click
 *   send param to api and re load table \
 */
main.btnopenProvinceClick = function() {
  console.log("test");
  // var param = {
  //   region_id: "5"
  // };
  var param = {
    region_id: "5",
    privnce_id: "81",
  };

  // $('#inputRegionId').value();
  // call service with param
  apiService.SendRequest('GET', main.service_url, param, main.handleGetService);
}

/**
 *   get data from service
 *   @param {object} data - json data object from service
 *   @param {String} txtStatus - get status
 */
main.handleGetService = function(data, txtStatus) {
  console.log(data)
  main.datatable.clear();
  main.datatable.rows.add(data);
  main.datatable.draw();

};

/**
 * [render province name]
 * @param  {[object]} row [row object from service]
 * @return {[string]}     [province name]
 */
main.renderProvinceNameJson = function(row) {
  console.log(arguements);
  ret = JH.GetJsonValue(row, "province_name.th");
  // function ช่วยเช็คให้ว่า มี ภาษา .th .en หรือไม่
  ret = JH.GetJsonLangValue(row, "province_name");
  return ret;
};

main.renderRegionId = function(row) {
  // ตรวจสอบ element ใน json ว่ามีข้อมูลหรือไม่ ถ้าไม่มีข้อมูลให้แสดงข้อความ ไม่มี
  return JH.GetJsonValue(row, "region_id", "ไม่มี");
};
