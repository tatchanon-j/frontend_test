/**
*
*   Main JS application file for management metadata page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var mgmt = {}; //initial dat
var current = {
  host: -1,
  ci: {},
  input: {}
}

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
mgmt.init = function(translator){
  mgmt.option = {}; //option data
  mgmt.service = "thaiwater30/backoffice/dataimport_config/metadata"; //service metadata
  mgmt.download = {}; //doewnload data
  mgmt.dataset_list = {}; //dataset list data
  mgmt.translator = translator;

  mgmt.table = $('#metadata-tbl'); //id of table element
  mgmt.dataTable = mgmt.table.DataTable({
    dom : 'frlBtip',
    buttons:[],
    language : g_dataTablesTranslator,
    columns : [ {
      data : 'metadata_name.value',
    },{
      data : 'metadata_name.text',
    }, {
      data : mgmt.renderDownloadId,
    }, {
      data : 'download_name.text.',
    }, {
      data : 'dataset_name.text',
    }, {
      data : 'agency_name.text',
    },  {
      data : mgmt.renderEditBtn
    } ],
    order : [ ],
  });

  mgmt.initEvent();

  apiService.SendRequest('GET',mgmt.service,{},function(rs){

    if (rs.result == "OK"){
      mgmt.handlerMetadataList(rs.data.metadata_list);
      mgmt.handlerSelectOption(rs.data.select_option);

      // Search in select
      $(".select-search").select2();
    }
  });
}


/**
* init all event onclick
*
* @param {json} row the data for the whole row
*
* @return {text} elemet buttons
*/
mgmt.renderEditBtn = function(row){
  return '<i class="btn btn-edit" style="padding-left:20px;" title="edit"></i>';
}

/**
 * [renderDownloadId description]
 * @param  {[type]} row [description]
 * @return {[type]}     [description]
 */
mgmt.renderDownloadId = function(row){
  if (row.download_name.value == 0) {
    text = "";
  } else {
    text = row.download_name.value
  }
  return text;
}


/**
* init all event onclick
*
*/
mgmt.initEvent = function(){
  mgmt.table.on('click' , '.btn.btn-edit' , mgmt.btnEditClick);
  var form = $('#mgmt-script-form'); //script form element
  $('#download_name').on('change' , mgmt.downloadNameChage);
  $('#btn-cancel').on('click' , mgmt.hideForm);
  $('#btn-save').on('click' , mgmt.btnSaveClick);
}


/**
* generatw icon on data table.
*
* @param {json} e element data
*
*/
mgmt.btnEditClick = function(e){
  mgmt.currentRow = mgmt.dataTable.rows($(e.target).closest('tr'));
  var data = mgmt.currentRow.data()[0]; //the data for the whole row

  $('#form')[0].reset();

  if (data["download_name"]["value"] != 0 ){
    $('#download_name').val( data["download_name"]["value"] ).triggerHandler('change');
  }else{
    $('#download_name').val('0').triggerHandler('change');
  }
  if (data["dataset_name"]["value"] != 0 ){  $('#dataset_name').val( data["dataset_name"]["value"] ); }

  if (data["monitor_script"] != "" ){ $('#monitor_script').val( data["monitor_script"] ); }
  $('#additional_dataset').val(data["additional_dataset"]).trigger('change.select2');
  $('#modal').modal();
}


/**
* generate data rows on data table
*
* @param {json} rs metadata data
*
*/
mgmt.handlerMetadataList = function(rs){
  mgmt.dataTable.clear();
  mgmt.dataTable.rows.add(rs);
  mgmt.dataTable.draw();
}


/**
* Set default option on selecte.
*
* @param {json} rs option data
*
*/
mgmt.handlerSelectOption = function(rs){
  mgmt.SelectOption = rs;
  dl = GetJsonValue(rs , "download_list" );
  adl = GetJsonValue(rs , "all_download_list" );
  mgmt.genSelect('download_name',  dl, 'id' , 'name' , true );
  $('#download_name').triggerHandler('change');

  if ( adl.result == "OK"){
    var select = document.getElementById('additional_dataset'); // additional_dataset select
    data = GetJsonValue(adl, 'data');
    for (var i = 0; i < data.length; i++){
    //   <optgroup label="Swedish Cars">
    //   <option value="volvo">Volvo</option>
    //   <option value="saab">Saab</option>
    // </optgroup>
      d = data[i];
      gr = document.createElement('optgroup');
      gr.label = GetJsonValue(d, 'name');

      dsl = GetJsonValue(d, 'dataset_list');
      for (var j = 0; j < dsl.length; ++j) {
          dj = dsl[j];
          opt = document.createElement('option');
          opt.text = GetJsonValue(dj, 'text') + ' (#' + GetJsonValue(dj, 'value') + ')' ;
          opt.value = GetJsonValue(dj, 'value');
          gr.appendChild(opt);
      }
      select.appendChild(gr);
    }
  }
}


/**
* update option in selecte dataset name.
*
*/
mgmt.downloadNameChage = function(){
  var v = $(this).val(); //download name
  var t = {
    result: "OK",
    data: []
  }; //the option data

  if (typeof mgmt.option["download_name"][v] !== "undefined"){
    t.data = mgmt.option["download_name"][v]["dataset_list"];
  }
  mgmt.genSelect('dataset_name' , t , "value" , "text");
}


/**
* generate option on selecte.
*
* @param {string} el id of element
* @param {json} rs the option data
* @param {string} _value name of data value
* @param {string} _text name of data name
* @param {boolean} _c
*
*/
mgmt.genSelect = function(el , rs , _value , _text , _c){
  var select = document.getElementById(el); //element of dropdown
  var data_rs = apiService.getFieldValue(rs,'data'); //the option data
  var DefaultListData = new Option(mgmt.translator['none_selected'], 0);

  if(data_rs == null){return }

  select.length = 0;

  if (typeof rs === "undefined") { console.log('undefi'); return false; }
  if (typeof mgmt.option[el] === "undefined" ) { mgmt.option[el] = {}; }
  if (rs.result != "OK") { return false;}


  select.add(DefaultListData);
  for (var i = 0 ; i < data_rs.length ; i++){
    var data = data_rs[i]; //the option data
    var option = document.createElement("option"); // create option element
    var txt_option = GetJsonValue(data , _text); //option name
    var	val_option = GetJsonValue(data , _value); //option value

    if (typeof _c !== "undefined" && _c == true){ mgmt.option[el][val_option] = data; }

    option.text = txt_option;
    option.value = val_option;
    select.add(option);

  }
}


/**
* save data.
*
*/
mgmt.btnSaveClick = function(){
  var olddata = mgmt.currentRow.data()[0]; //the data foe the whole row
  var param = {metadata_id: parseInt( olddata["metadata_name"]["value"] ),
  download_id: parseInt( $('#download_name').val() ),
  dataset_id: parseInt( $('#dataset_name').val() ),
  monitor_script: $('#monitor_script').val(),
  additional_dataset: $('#additional_dataset').val()
}; //parameter for save data

  apiService.SendRequest("PUT" , mgmt.service , param , function(rs){
    if (rs.result == "OK"){
      bootbox.alert(msg_save_suc);

      olddata["monitor_script"] = $('#monitor_script').val();
      olddata["dataset_name"] = {
        text: $('#dataset_name option:selected').text(),
        value: $('#dataset_name').val()
      };
      olddata["download_name"] = {
        text: $('#download_name option:selected').text(),
        value: $('#download_name').val()
      };
      olddata["additional_dataset"] = param.additional_dataset;
      mgmt.currentRow.invalidate().draw();
    }
    $('#modal').modal('hide');
  })
}
