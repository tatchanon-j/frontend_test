/**
*
*   Main JS application file for management metadata for rain page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var mgmt = {}; //initial data
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
  mgmt.translator = translator; //Text for label and message on javascript
  mgmt.service = "thaiwater30/backoffice/dataimport_config_migrate/metadata"; //serviec metadata
  mgmt.service_pro = 'thaiwater30/backoffice/dataimport_config_migrate/metadata_provision'; //service metdata province
  mgmt.download = {}; //download data
  mgmt.dataset_list = {}; //dataset list data

  mgmt.table = $('#metadata-tbl'); //id of table element
  mgmt.dataTable = mgmt.table.DataTable({
    dom : 'frlBtip',
    buttons:[ {
      text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> '+ mgmt.translator['btn_add_mgmt_metadata_rain'],
      action : mgmt.btnEditMetadataClick
    } ],
    language : g_dataTablesTranslator,
    columns : [ {
      data : 'metadata_name.value',
    }, {
      data : 'metadata_name.text',
    }, {
      data : 'download_name.text.',
    }, {
      data : 'dataset_name.text',
    },
    {
      data : mgmt.renderEditBtn
    } ],
    order : [ ],
  });

  mgmt.initEvent();

  apiService.SendRequest('GET',mgmt.service,{},function(rs){
    mgmt.rs = rs;
    if (rs.result == "OK"){
      mgmt.ddl = rs.data.metadata_list;
      mgmt.handlerMetadataList(rs.data.metadata_list);
      mgmt.handlerSelectOption(rs.data.select_option);

      // Search in select
      $(".select-search").select2();
    }
  });

  $("#filter_download_type").on("change", function(){
    mgmt.handlerMetadataList(mgmt.ddl);
  })
}

/**
* init all event onclick
*
* @param {json} row the data for the whole row
*
* @return {text} elemet buttons
*/
mgmt.renderEditBtn = function(row){
  return '<i class="btn btn-relate" title="link"></i>'+
  '<i class="btn btn-edit" title="edit"></i>'+
  '<i class="btn btn-delete" style="padding-left:20px;" title="delete"></i>';
}

/**
* init all event onclick
*
*/
mgmt.initEvent = function(){
  mgmt.table.on('click' , '.btn.btn-relate' , mgmt.btnEditClick)
  mgmt.table.on('click' , '.btn.btn-edit' , mgmt.btnEditMetadataClick)
  mgmt.table.on('click' , '.btn.btn-delete' , mgmt.btnDeleteMetadataClick)
  var form = $('#mgmt-script-form');
  $('#download_name').on('change' , mgmt.downloadNameChage);

  // $('#btn-cancel,#dlgbtn-cancel').on('click' , mgmt.hideForm);
  $('#btn-save').on('click' , mgmt.btnSaveClick);
  $('#dlgbtn-save').on('click' , mgmt.btnSaveMetadataClick);

}

/**
* generatw icon on data table.
*
* @param {json} e element data
*
*/
mgmt.btnEditClick = function(e){
  mgmt.currentRow = mgmt.dataTable.rows($(e.target).closest('tr')); //the element data for whole data
  var data = mgmt.currentRow.data()[0]; //the data for first whole data

  $('#form')[0].reset();

  if (data["download_name"]["value"] != 0 ){
    $('#download_name').val( data["download_name"]["value"] ).triggerHandler('change');
  }else{
    $('#download_name').val('0').triggerHandler('change');
  }
  if (data["dataset_name"]["value"] != 0 ){ $('#dataset_name').val( data["dataset_name"]["value"] ); }
  if (data["monitor_script"] != "" ){ $('#monitor_script').val( data["monitor_script"] ); }
  $('#modal').modal();
}

/**
* generatw icon on data table.
*
* @param {json} e element data
*
*/
mgmt.btnDeleteMetadataClick = function(e){
  mgmt.currentRow = mgmt.dataTable.rows($(e.target).closest('tr')); //the data for the whole row
  var data = mgmt.currentRow.data()[0];
  var param = {id : data.metadata_name.value}

  var s = mgmt.translator['msg_delete_con'].replace('%s',data.metadata_name.text); //message confirm delete

  bootbox.confirm({
    message: s,
    reorder: true,
    buttons: {
      confirm: {
        label: '<i class="fa fa-check"></i> ' +  mgmt.translator['btn_confirm'],
        className: 'btn-success'
      },
      cancel: {
        label: '<i class="fa fa-times"></i> ' +  mgmt.translator['btn_cancel'],
        className: 'btn-danger'
      }
    },
    callback: function (result) {
      if(result){
        apiService.SendRequest("DELETE", mgmt.service_pro, param, function(data, status, jqxhr){
          apiService.SendRequest('GET',mgmt.service,{},function(rs){
            mgmt.rs = rs;
            if (rs.result == "OK"){
              mgmt.handlerMetadataList(rs.data.metadata_list);
              mgmt.handlerSelectOption(rs.data.select_option);

              // Search in select
              $(".select-search").select2();
            }
          });
          if (data["result"] == "NO"){
            bootbox.alert({
              message: mgmt.translator['msg_delete_unsuc'],
              buttons: {
                ok: {
                  label: mgmt.translator['btn_close']
                }
              }
            })
            return false;
          }
          bootbox.alert({
            message: mgmt.translator['msg_delete_suc'],
            buttons: {
              ok: {
                label: mgmt.translator['btn_close']
              }
            }
          })
        })
        return true
      }
    }
  });

}

//generatw icon on data table.
mgmt.btnEditMetadataClick = function(e){
  var frm = $('#dlgMetadata-form'); //metadata form elment
  frm.parsley().reset()

  mgmt.currentRow = mgmt.dataTable.rows($(e.target).closest('tr'));
  var data = mgmt.currentRow.data()[0]; //the data for whole row

  $('#dlgMetadata-form')[0].reset();

  if(!data){
    $('#dlgMetadata-title').text(mgmt.translator['title_add_metadata']);
  }else{
    $('#id').val(data.metadata_name.value);
    $('#dlgMetadata-title').text(mgmt.translator['title_edit_metadata']);
    $('#dlgMetadata-name').val(data.metadata_name.text);
  }

  $('#dlgMetadata').modal();
}

/**
* generate data rows on data table
*
* @param {json} rs metadata data
*
*/
mgmt.handlerMetadataList = function(rs){
  var arrData = [];
  var download_type = $("#filter_download_type").val();

  for(var i=0; i< rs.length; i++){
  	var data = rs[i];
    var dname = (data.download_name.text).substr(0,7);
  	if(download_type == "migrate"){
      if(dname == "migrate"){
        arrData.push(data)
      }
    }
    else if(download_type == "normal"){
       if(dname !== "migrate"){
         arrData.push(data)
        }
      }
    else{
      arrData.push(data);
    }
	  }

  mgmt.dataTable.clear();
  mgmt.dataTable.rows.add(arrData);
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

  mgmt.genSelect('download_name', GetJsonValue(rs , "download_list" ) , 'id' , 'name' , true );
  $('#download_name').triggerHandler('change');
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
  var select = document.getElementById(el); //the option data
  var DefaultListData = new Option(mgmt.translator['none_selected'], 0);

  select.length = 0;
  if (typeof rs === "undefined") {  return false; }
  if (typeof mgmt.option[el] === "undefined" ) { mgmt.option[el] = {}; }
  if (rs.result != "OK") { return false;}

  var data_result = apiService.getFieldValue(rs,'data');

  if(data_result == null){return }

  select.add(DefaultListData);
  for (var i = 0 ; i < data_result.length ; i++){
    var data = data_result[i]; //option data
    var option = document.createElement("option"); //option element
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
  var olddata = mgmt.currentRow.data()[0]; //the data for the whole row
  var param = {metadata_id: parseInt( olddata["metadata_name"]["value"] ),
  download_id: parseInt( $('#download_name').val() ),
  dataset_id: parseInt( $('#dataset_name').val() ),
  monitor_script: $('#monitor_script').val()
}; //parameter for savev

  apiService.SendRequest("PUT" , mgmt.service , param , function(rs){
  if (rs.result == "OK"){
    // bootbox.alert(msg_save_suc);

    bootbox.alert({
      message: msg_save_suc,
      buttons: {
        ok: {
          label: mgmt.translator['btn_close']
        }
      }
    })

    olddata["monitor_script"] = $('#monitor_script').val();
    olddata["dataset_name"] = {
      text: $('#dataset_name option:selected').text(),
      value: $('#dataset_name').val()
    };
    olddata["download_name"] = {
      text: $('#download_name option:selected').text(),
      value: $('#download_name').val()
    };
    mgmt.currentRow.invalidate().draw();
  }
  $('#modal').modal('hide');
})
}

//save data.
mgmt.btnSaveMetadataClick = function(){
  var method = 'POST'
  var id = $('#id').val();
  var frm = $('#dlgMetadata-form')
  var name = '{"th":'+ '"'+$('#dlgMetadata-name').val() + '"}';
  frm.parsley().validate()
  if(!frm.parsley().isValid()){
    return false
  }

  var olddata = mgmt.currentRow.data()[0];
  var param = {
    metadataservice_name : name
  }

  if(id){
    method = "PUT"
    param['id'] = parseInt($('#id').val());
  }

  apiService.SendRequest(method , mgmt.service_pro , param , function(rs){
    if (rs.result == "OK"){
      bootbox.alert({
        message: msg_save_suc,
        buttons: {
          ok: {
            label: mgmt.translator['btn_close']
          }
        }
      })

      apiService.SendRequest('GET',mgmt.service,{},function(rs){
        mgmt.rs = rs;
        if (rs.result == "OK"){
          mgmt.handlerMetadataList(rs.data.metadata_list);
          mgmt.handlerSelectOption(rs.data.select_option);
          // Search in select
          $(".select-search").select2();
        }
      });
      // mgmt.currentRow.invalidate().draw();
    }
    $('#dlgMetadata').modal('hide');
  })
}
