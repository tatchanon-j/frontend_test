/**
*
*   Main JS application file for setting dataset for page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var mgmt = {
  cache: {}
};

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
  mgmt.option = {}; //prepare data to genrate option
  mgmt.translator = translator; //Text for label and message on javascript
  mgmt.service = "thaiwater30/backoffice/dataimport_config_migrate/dataimport_dataset"; //service dataimport dataset
  mgmt.service_copy = "thaiwater30/backoffice/dataimport_config_migrate/dataimport_dataset_copy"; //service datatimport dataset copy
  mgmt.service_replay = "dataimport/rdl/node0/ps"; //service node
  mgmt.deleteRow = ""; //prepare delete row data
  mgmt.table = $('#tbl'); //id of table element
  $("#filter_download_type").on("change", mgmt.handleDataset)
  mgmt.handleDataset();

  mgmt.dataTable = mgmt.table.DataTable({
    dom : 'frlBtip',
    buttons : [ {
      text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> '+btn_add_conv,
      action : mgmt.addMetadata
    } ],
    language : g_dataTablesTranslator,
    columns : [ {
      data : 'id',
    }, {
      data : 'download_name',
    }, {
      data : 'convert_name',
    }, {
      data : mgmt.renderEditBtn
    } ],
    order : [ ],
  });

  mgmt.initEvent();



  // Search in select
  $(".select-search").select2();

  $('#download_name').on('change', function(){
    apiService.GetCachedRequest(mgmt.service,{},function(rs){
      if (rs.result == "OK"){
        mgmt.optionRelate('input_name',rs.data.select_option.download_list);
        mgmt.inputNameChange()
      }
    });
  })

  $('#import_table').on('change', function(){
    apiService.GetCachedRequest(mgmt.service,{},function(rs){
      if (rs.result == "OK"){
        mgmt.optionRelate('partition_field',rs.data.select_option.import_table, true);
        mgmt.optionRelate('name',rs.data.select_option.import_table);
        if (JH.GetJsonValue(mgmt["cache"],"inEditMode")){
          mgmt.renderField();
        }
      }
    });
  })



  //input only eng.
  $("#config_name").keypress(function(event){
    var ew = event.which;
    if( (ew >= 32 && ew <=126) || (ew == 8) ){
      return true;
    }else if(ew === 8){
      return true;
  }
    return false;
  });

  $('#convert_method').on('change', mgmt.convertMethodChange)
}


mgmt.handleDataset = function(){
  var param = {download_name:$("#filter_download_type").val()}
  apiService.SendRequest('GET',mgmt.service,param,function(rs){
    if (rs.result == "OK"){
      if(typeof rs === "undefined" || rs == null){return false}
      mgmt.handlerDownloadList(rs.data.dataimport_dataset_list);
      mgmt.handlerSelectOption(rs.data.select_option);
    }
  });
}

/**
* generate button on table
*
* @param {json} row The data for the whole row
*
*/
mgmt.renderEditBtn = function(row){
  return '<i class="btn btn-copy" title="'+mgmt.translator['msg_copy']+'" data-id="'+row.id+'"></i>'+
  '<i class="btn btn-view" title="view json" data-name="viewJson" data-id="'+row.id+'"></i>'+
  '<i class="btn btn-edit" data-id="'+row.id+'"></i>'+
  '<i class="btn btn-delete" style="padding-left:20px;" title="delete"></i>';
}


/**
* init all event onclickle
*
*/
mgmt.initEvent = function(){
  mgmt.table.on('click' , '.btn.btn-copy' , mgmt.btnCopy)
  mgmt.table.on('click' , '.btn.btn-view' , mgmt.btnEditClick)
  mgmt.table.on('click' , '.btn.btn-edit' , mgmt.btnEditClick)
  mgmt.table.on('click' , '.btn.btn-delete' , mgmt.btnDeleteClick)

  mgmt.table.on('click' , '.btn.btn-play' , mgmt.btnPlayClick)
  mgmt.table.on('click' , '.btn.btn-pause' , mgmt.btnPauseClick)

  mgmt.table.on('click' , '.btn-play', mgmt.rePlay);

  var form = $('#mgmt-script-form'); //script form element
  form.on('click' , '.fields-tab' , mgmt.fieldsTabClick);
  form.on('click' , '.rm-tab-fields' , mgmt.removeFieldsTabClick);
  form.on('click' , '.add-fields' , mgmt.addFieldsClick);

  form.on('change' , 'select[name="transform_method"]' , mgmt.transformMethodChange);
  form.on('keyup' , 'input[id="input_name"]' , mgmt.inputNameChange);

  $('#btn-cancel').on('click' , mgmt.hideForm);
  $('#btn-save').on('click' , mgmt.btnSaveClick);
  $('#btn-confirm').on('click' , mgmt.btnDeleteConFirmClick);
}


/**
* prepare data to edit
*
* @param {json} e element data
*
*/
mgmt.btnEditClick = function(e){
  var btn_view = $(this).attr('data-name'); //type name of buton to display data
  var d = mgmt.dataTable.rows($(e.target).closest('tr')).data()[0]; //The data for the whole row
  var id = JH.GetJsonValue(d , "id"); //id dataset

  mgmt.tr = $(this).closest('tr');
  mgmt.row_data = mgmt.dataTable.row( mgmt.tr ).data();



  apiService.SendRequest("GET" , mgmt.service+"/"+id , {} , function(rs){
    if (rs.result != "OK"){ return false; }
    if(btn_view){
      mgmt.showJson(id , rs.data);
      return false
    }

    mgmt.showForm(id , rs.data);
  });
}


/**
* display json data on modal
*
* @param {string} id id of data set
* @param {json} //the data of dataset
*
*/
mgmt.showJson = function(id, rs){
  var form = $('#dlgDatajson-form'); //dialog json data form element
  form.find('#dlgDatajson-conv-json').val( JSON.stringify(JH.GetJsonValue(rs , "convert_setting")) );
  form.find('#dlgDatajson-import-json').val( JSON.stringify(JH.GetJsonValue(rs , "import_setting")) );
  form.find('#dlgDatajson-lookup-json').val( JSON.stringify(JH.GetJsonValue(rs , "lookup_table")) );
  form.find('#dlgDatajson-im-tbl-sjon').val( JSON.stringify(JH.GetJsonValue(rs , "import_table_json")) );

  $('#dlgDatajson').modal({
    backdrop : 'static'
  })
}


/**
* clone data to create new data
*
*/
mgmt.btnCopy = function(){
  var id = $(this).attr('data-id'); //id of dataset

  var param = {
    dataset_id : parseInt(id)
  }


  bootbox.confirm({
    message: mgmt.translator['msg_con_copy'],
    reorder:true,
    buttons:{
      confirm:{
        label: mgmt.translator['btn_confirm'],
        className:'btn-primary'
      },
      cancel:{
        label: mgmt.translator['btn_cancel'],
        className:'btn-default'
      }
    },
    callback: function(result){
      if(result){

        apiService.SendRequest('POST', mgmt.service_copy, param, function(rs){
          if (rs.result !== "OK"){
            bootbox.alert({
              message: mgmt.translator['msg_copy_unsuc'],
              buttons: {
                ok: {
                  label: mgmt.translator['btn_close']
                }
              }
            })
            return false;
          }
          bootbox.alert({
            message: mgmt.translator['msg_copy_suc'],
            buttons: {
              ok: {
                label: mgmt.translator['btn_close']
              }
            },
            callback: function(){
              location.reload();
            }
          })
        });
        return true
      }
    }
  })
}


/**
* delete data in table
*
* @param {json} e data of element
*
*/
mgmt.btnDeleteClick = function(e){
  mgmt.deleteRow = mgmt.dataTable.rows($(e.target).closest('tr'));
  var d = mgmt.deleteRow.data()[0]; //The data for the whole row
  var id = JH.GetJsonValue(d , "id"); //dataset id
  var text = JH.GetJsonValue(d , "convert_name"); //convert name
  $('#modal-delete').modal().find('h5').text( modal_delete_title.replace('%s' , text) );
}


/**
* display confirm delete
*
*/
mgmt.btnDeleteConFirmClick = function(){
  if (mgmt.deleteRow == "") { return false; }
  var id = JH.GetJsonValue(mgmt.deleteRow.data()[0] , "id"); //dataset id
  apiService.SendRequest("DELETE" , mgmt.service+"/"+id , {} , function(rs){
    if (rs.result != "OK") { alert(rs.data);return false; }
    mgmt.deleteRow.remove().draw();
    mgmt.deleteRow = "";
    $('#modal-delete').modal('hide');
  });
}


/**
* run scritp
*
*/
mgmt.btnPlayClick = function(){
  var down_id = parseInt($(this).attr('download-id')); //downlkoad id
  var pro_id = parseInt($(this).attr('process-id')); //process id
  var name = $(this).attr('name'); //scritp name
  var param = {
    download_id : down_id,
    process_id : pro_id
  }

  var s = mgmt.translator['msg_con_run'].replace('%s',name); //message confirm run script
  bootbox.confirm({
    message: s,
    reorder:true,
    buttons:{
      confirm:{
        label:'<i class="fa fa-check"></i> ' +  mgmt.translator['btn_confirm'],
        className:'btn-success'
      },
      cancel:{
        label:'<i class="fa fa-times"></i> ' +  mgmt.translator['btn_cancel'],
        className:'btn-danger'
      }
    },
    callback: function(result){
      if(result){
        return true
      }
    }
  })
}


/**
* stop scritp
*
*/
mgmt.btnPauseClick = function(){
  var down_id = parseInt($(this).attr('download-id')); //download id
  var pro_id = parseInt($(this).attr('process-id')); //process id
  var name = $(this).attr('name'); //script name
  var param = {
    download_id : down_id,
    process_id : pro_id
  }

  var s = mgmt.translator['msg_con_pause'].replace('%s',name); //message confirm stop run script
  bootbox.confirm({
    message: s,
    reorder:true,
    buttons:{
      confirm:{
        label:'<i class="fa fa-check"></i> ' +  mgmt.translator['btn_confirm'],
        className:'btn-success'
      },
      cancel:{
        label:'<i class="fa fa-times"></i> ' +  mgmt.translator['btn_cancel'],
        className:'btn-danger'
      }
    },
    callback: function(result){
      if(result){
        return true
      }
    }
  })
}


/**
* rerun script
* @param {json} row The data for the whole row
*
*/
mgmt.rePlay = function(row){
  var data = mgmt.dataTable.row($(this).closest('tr')).data(); //The data for the whole row
  var name = JH.GetJsonValue(data,"convert_name"); //convert name
  var param_play = {
    download_id: JH.GetJsonValue(data,"download_id"),
    download_script: JH.GetJsonValue(data,"download_script"),
  }

  // Dialog box to comfirm redownload.
  var s = mgmt.translator['msg_process'] + " : " + name; //message confirm rerun script
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
        apiService.SendRequest('POST', mgmt.service_replay, param_play,  function(data, status, jqxhr){
          if (status !== "success"){
            bootbox.alert({
              message: mgmt.translator['msg_process_unsuc'],
              buttons: {
                ok: {
                  label: mgmt.translator['btn_close']
                }
              }
            })
            return false;
          }
          bootbox.alert({
            message: mgmt.translator['msg_process_suc'],
            buttons: {
              ok: {
                label: mgmt.translator['btn_close']
              }
            }
          })
        })
      }
    }
  });
}


/**
* fields tab click
*
*/
mgmt.fieldsTabClick = function(){
  var fieldsTabs = $(this).closest('ul.fields-tabs'); //fields tabs element
  var fieldsTabContent = fieldsTabs.next('div.fields-tab-content'); //content element in fields tabs
  var li = $(this).closest('li'); //li element
  var index = li.index(); //index of li element

  fieldsTabContent.children('div.tab-pane.active').removeClass('active');
  fieldsTabContent.children('div.tab-pane:eq('+index+')').addClass('active');
  current["fields"] = index;
  mgmt["cache"]["index"] = index;
  mgmt.handlerFieldsEvent();
}


/**
* btn remove fields tab click
*
*/
mgmt.removeFieldsTabClick = function(){
  var fieldsTabs = $(this).closest('ul.fields-tabs'); //fields tabs element
  var fieldsTabContent = fieldsTabs.next('div.fields-tab-content'); //content element in fields tabs
  var li = $(this).closest('li'); //li element
  var index = li.index(); //index of li element
  var lastLi = fieldsTabs.children('li:not(.add-tab):last'); //last li element
  var lastIndex = lastLi.index(); //last index of li element

  lastLi.remove();
  fieldsTabContent.children('.tab-pane:eq('+index+')').remove();

  if ( index == current["fields"] ) { current["fields"] = -1; }
  if ( index == lastIndex ) { index--; }
  fieldsTabs.children('li:eq('+index+')').children('a').trigger('click');
  mgmt.handlerFieldsEvent();
}


/**
* add fields tab
*
*/
mgmt.addFieldsClick = function(){
  mgmt.addFields($(this));
}


/**
* add data into fields tab
*
* @param {json} el data of element
*
*/
mgmt.addFields = function(el){
  var ltLast = el.closest('.add-tab'); //buton add new tabs element
  var fieldsTabs = ltLast.closest('ul.fields-tabs'); //field tabs element
  var fieldsTabContent = fieldsTabs.next('div.fields-tab-content'); //conten element in field tabs
  var index = ltLast.index(); //index of button add

  mgmt["cache"]["index"] = index;
  index ++;

  var spanRemove = ''; //buton delete tabs
  var newContent;
  if (index != 1){
    spanRemove = '<span class="rm-tab-fields">x</span>';
  }
  newContent = $('#pane-fields-master').clone().removeClass('hidden').removeAttr('id');
  // add fields tab
  ltLast.before('<li class="nav-item"><a href="#" class="fields-tab nav-link" data-toggle="tab">field#'+index+'</a>'+spanRemove+'</li>');
  // add fields tab-content
  fieldsTabContent.append(newContent);
  newContent.find('select[name="transform_method"]').removeAttr('id');
  newContent.find('select[name="type"]').removeAttr('id');
  newContent.find('select[name="name"]').removeAttr('id');

  newContent.find('select[name="table"]').removeAttr('id');
  // newContent.find('select[name="input_format_date"]').removeAttr('id');
  newContent.find('select[name="add_missing"]').removeAttr('id');
  newContent.find('select[name="input_format"]').removeAttr('id');
  newContent.find('input[name="input_format"]').removeAttr('id');



  fieldsTabs.find('.fields-tab:last').trigger('click');
  mgmt.handlerFieldsEvent();
  return newContent;
}


/**
* enable or disable to edit import table data according field tab active
*
*/
mgmt.handlerFieldsEvent = function(){
  if ( JH.GetJsonValue(mgmt["cache"],"index") == 0 ){
    $('#import_table').removeAttr('disabled');
  }else{
    $('#import_table').prop('disabled', true);
  }
}


/**
* input_name Chage
*
*/
mgmt.inputNameChange = function(){
  var txt = $('#input_name').val(); //input name
  $('.input_name_ctrl').hide();
  if ( mgmt.isJsonXml(txt) ) { $('.div_data_tag').show(); }
  else { $('.div_header_row').show(); }
}


/**
* add file type is json or xml
* @param {json}
*
*/
mgmt.isJsonXml = function(txt){
  if (arguments.length == 0){ return false; }
  if ( !txt ){return false;}
  if ( txt == "" ){return false;}
  var text = txt.split("."); //input name
  if (text.length == 0 || text.length == 1){ return false; }
  var ext = text[text.length - 1];
  if ( ext == "json" || ext == "xml" ) { return true; }
  return false;
}


/**
* transform_method change
*
*/
mgmt.transformMethodChange = function(){
  var tabPane = $(this).closest('.tab-pane'); //tab pane element

  tabPane.find('.transform_method_ctrl').hide();
  tabPane.find('.transform_method_ctrl_' + $(this).val()).show();
  $('#input_format_date').on('change',function(){
    var type = $(this).val(); //type of input date

    if(type == 'custom'){
      $('.frm-custom-date').show()
    }else{
      $('.frm-custom-date').hide()
    }
  })
}


/**
* convert_method change
*
*/
mgmt.convertMethodChange = function(){
  var conv_method = $('#convert_method').val(); //convert method

  if(conv_method == 'cv-nil'){
    $('.not-cv-nil').attr('hidden',true);
  }else{
    $('.not-cv-nil').removeAttr('hidden');
  }
}


/**
* add data to table
*
* @param {json} rs the dataset data
*
*/
mgmt.handlerDownloadList = function(rs){
  mgmt.dataTable.clear();
  mgmt.dataTable.rows.add(rs);
  mgmt.dataTable.draw();
}


/**
* prepare dat to genoption
*
* @param {json}
*
*/
mgmt.handlerSelectOption = function(rs){
  mgmt.SelectOption = rs;
  mgmt.genSelect('download_name', JH.GetJsonValue(rs , "download_list" ) );
  mgmt.optionRelate('input_name', JH.GetJsonValue(rs , "download_list" ) );
  mgmt.genSelect('agent_user', JH.GetJsonValue(rs , "agent_user" ) );
  mgmt.genSelect('convert_method', JH.GetJsonValue(rs , "convert_method" ) );
  mgmt.genSelect('import_method', JH.GetJsonValue(rs , "import_method" ) );
  mgmt.genSelect('import_table', JH.GetJsonValue(rs , "import_table" ) );

  mgmt.genSelect('type', JH.GetJsonValue(rs , "type" ) );
  mgmt.genSelect('transform_method', JH.GetJsonValue(rs , "transform_method" ) );
  mgmt.genSelect('table', JH.GetJsonValue(rs , "master_table" ) );
  mgmt.genSelect('add_missing', JH.GetJsonValue(rs , "add_missing" ) );

  mgmt.genSelect('input_format_date', JH.GetJsonValue(rs , "input_format_datetime" ) )

  mgmt.optionRelate('partition_field', JH.GetJsonValue(rs , "import_table" ), true );
  mgmt.optionRelate('name', JH.GetJsonValue(rs , "import_table" ) );
}


/**
* update option in dropdown which relate with other dropdown
*
* @param {string} el element id
* @param {json} rs the data option
* @param {boolean} addEmpty clear option
*
*/
mgmt.optionRelate = function(el, rs , addEmpty){
  $('#'+el +'> option').not('.default').remove();

  var table_name = $('#import_table').val(); //table name
  var download_name = $('#download_name').val(); //download name
  var data_result = apiService.getFieldValue(rs,'data'); //the data to generate option

  if(data_result == null){return }

  var data_relate = {
    result : 'OK'
  }

  if(el == 'input_name'){
    for(var i=0; i<data_result.length; i++){
      if(data_result[i]['value'] == download_name){
        data_relate['data'] = [{text : data_result[i]['filename'],value : data_result[i]['filename']}]
      }
    }
  }else{
    for(var i=0; i<data_result.length; i++){
      if(data_result[i]['value'] == table_name){
        data_relate['data'] = data_result[i]['related'].slice();
        if (addEmpty){
          data_relate['data'].splice(0, 0, {text: '',value: ''});
        }
      }
    }
  }
  mgmt.genSelectByName(el, data_relate );
}


/**
* generate option for dropdown by identify with id of element.
*
* @param {string} el element id
* @param {json} rs the option data
*
*/
mgmt.genSelect = function(el , rs){
  var select = document.getElementById(el); //dropdown element

  if (typeof rs === "undefined") { return false; }
  if (typeof mgmt.option[el] === "undefined") { mgmt.option[el] = {}; }
  if (rs.result != "OK") { return false;}
  var data_result = apiService.getFieldValue(rs,'data')
  if(typeof data_result === undefined || data_result == null){return }
  for (var i = 0 ; i < data_result.length ; i++){
    var data = data_result[i]; //the option data
    var option = document.createElement("option"); //create option element
    var txt_option = data["text"]; //option name
    var	val_option = data["value"]; //option value

    mgmt.option[el][val_option] = data;

    option.text = txt_option;
    option.value = val_option;
    select.add(option);

  }
}


/**
* generate option for dropdown by identify with name of element.
*
* @param {json}
*
*/
mgmt.genSelectByName = function(name , rs){
  var select = $('select[name="'+name+'"]'); //dropdown element

  select.empty();
  if (rs.result != "OK") { return false;}
  if (typeof rs === "undefined") { return false; }
  var data_result = apiService.getFieldValue(rs,'data'); //initila option data

  if(typeof data_result === undefined || data_result == null){return }
  for (var i = 0 ; i < data_result.length ; i++){
    var data = data_result[i]; //opiton data
    var txt_option = data["text"]; //option name
    var	val_option = data["value"]; //option value
    var opt = new Option(txt_option, val_option); //crat optionelement
    select.append(opt);
  }
}


/**
* display form to add new data.
*
*/
mgmt.addMetadata = function(){
  mgmt.showForm();
}


/**
* display form to add or edit data.
*
* @param {string} id form id
* @param {json} d the dataset data
*
*/
mgmt.showForm = function(id , d){
  mgmt.data = {};
  mgmt.isEdit = false;
  if (typeof d !== "undefined"){ mgmt.data = d; mgmt.dataId = id; mgmt.isEdit = true;}

  var form = $('#mgmt-script-form'); //script form element
  form.parsley().reset();
  form.find('.fields-tabs > li:not(.add-tab)').remove();
  form.find('.fields-tab-content').empty();

  $('#tbl_wrapper').addClass('hidden');
  form[0].reset();
  form.removeClass('hidden');

  if (! mgmt.isEdit ){
    var newContent = mgmt.addFields(form.find('.add-fields'));
    form.find('#convert_method').triggerHandler('change');
    return false;
  }
  // // in edit mode
  var convert_setting =  JH.GetJsonValue(d , "convert_setting"); //convert setting data
  var config = JH.GetJsonValue( convert_setting , "configs")[0]; //config name
  var fields = JH.GetJsonValue(config , "fields"); //fields data

  mgmt["cache"]["fields"] = fields;
  mgmt["cache"]["partition_field"] = JH.GetJsonValue(d , "partition_field");
  mgmt["cache"]["inEditMode"] = true;
  form.find('#agent_user').val( JH.GetJsonValue(d , "agent_user_id") ).triggerHandler('change');
  form.find('#convert_name').val( JH.GetJsonValue(d , "convert_name") ).triggerHandler('change');
  form.find('#convert_method').val( JH.GetJsonValue(d , "convert_method") ).triggerHandler('change');
  form.find('#download_name').val( JH.GetJsonValue(d , "download_id") ).triggerHandler('change');
  form.find('#import_method').val( JH.GetJsonValue(d , "import_method") );
  form.find('#import_table').val( JH.GetJsonValue(d , "import_table") ).triggerHandler('change');
  form.find('#partition_field').val( JH.GetJsonValue(d , "partition_field") );
  form.find('#unique_constraint').val( JH.GetJsonValue(d , "unique_constraint") );
  form.find('#row_validator').val( JH.GetJsonValue(d , "unique_constraint") );

  form.find('#data_folder').val( JH.GetJsonValue(convert_setting , "data_folder") );

  form.find('#config_name').val( JH.GetJsonValue(config , "name") );
  form.find('#input_name').val( JH.GetJsonValue(config , "input_name") ).trigger('change');
  form.find('#header_row').val( JH.GetJsonValue(config , "header_row") );
  form.find('#data_tag').val( JH.GetJsonValue(config , "data_tag") );
}


/**
* generate field tabs
*
* @param {json}
*
*/
mgmt.renderField = function(){
  mgmt["cache"]["inEditMode"] = false;
  var form = $('#mgmt-script-form'); //script form element

  form.find('#partition_field').val( JH.GetJsonValue(mgmt , "cache.partition_field") );

  var fields = JH.GetJsonValue(mgmt,"cache.fields"); //cache of fields data

  if(typeof fields === undefined || fields == null){return fal}

  for (var i = 0 ; i < fields.length ; i++){
    var fieldTab = mgmt.addFields(form.find('.add-fields')); //button add new tabs element
    var field = fields[i]; //tabs field element
    var transform_method = JH.GetJsonValue( field , "transform_method"); //transform method
    var transform_params = JH.GetJsonValue( field , "transform_params" ); //transform parameter
    var type = (JH.GetJsonValue( field , "type" ) == "" ? "string" : JH.GetJsonValue( field , "type" )); //type element on filed tabs

    fieldTab.find('select[name="name"]').val( JH.GetJsonValue( field , "name" ));
    fieldTab.find('select[name="type"]').val( type );
    fieldTab.find('input[name="input_field"]').val( JH.GetJsonValue( field , "input_fields" ) );
    fieldTab.find('select[name="transform_method"]').val( transform_method ).trigger('change');
    switch (transform_method) {
      case "constant":
      case "evaluate":
      fieldTab.find('input[name="transform_params"]').val(transform_params);
      break;
      case "datetime":
      fieldTab.find('input[name="input_format"]').val( JH.GetJsonValue( transform_params , "input_format") );
      break;
      case "mapping":
      fieldTab.find('select[name="table"]').val( JH.GetJsonValue(transform_params , "table") );
      fieldTab.find('input[name="to"]').val( JH.GetJsonValue(transform_params , "to") );
      fieldTab.find('input[name="from"]').val( JH.GetJsonValue(transform_params , "from").join() );
      break;
      case "qc":
      fieldTab.find('input[name="input_field"]').val('');
      break;
    }
  }
}


/**
* hide form when clik on cancel.
*
* @param {json}
*
*/
mgmt.hideForm = function(){
  $('#tbl_wrapper').removeClass('hidden');
  $('#mgmt-script-form').addClass('hidden');
}


/**
* save data
*
* @param {json}
*
*/
mgmt.btnSaveClick = function(){
  $('#mgmt-script-form').parsley().validate()
  if (!$('#mgmt-script-form').parsley().isValid()) { return false }

  var param = mgmt.data; //parameter
  var configs = { fields: [] }; //data on field tabs

  param["download_id"] = parseInt( $('#download_name').val() );
  param["agent_user_id"] = parseInt( $('#agent_user').val() );
  param["convert_method"] =  $('#convert_method').val();
  param["convert_name"] =  $('#convert_name').val();
  param["import_method"] =  $('#import_method').val();
  param["import_table"] =  $('#import_table').val();
  param["unique_constraint"]  = $('#unique_constraint').val();
  param["partition_field"] = $('#partition_field').val();
  param["convert_setting"] = {
    data_folder: $('#data_folder').val(),
    configs: [ configs ]
  }
  configs["name"] = $('#config_name').val();
  configs["input_name"] = $('#input_name').val();
  if ($('#header_row').val() != "" && !mgmt.isJsonXml(configs["input_name"] ) ) { configs["header_row"] = parseInt( $('#header_row').val() ) }
  if ($('#data_tag').val() != "" && mgmt.isJsonXml(configs["input_name"]) ) { configs["data_tag"] = $('#data_tag').val() }
  if ($('#row_validate').val() != "") { configs["row_validate"] = $('#row_validate').val() }

  var fielsTabs = $('.fields-tab-content').children('div.tab-pane');
  if(typeof fielsTabs === undefined || fielsTabs == null){return false}
  for (var i = 0 ; i < fielsTabs.length ; i++){
    var fielsTab = $(fielsTabs[i]); //field tabs element
    var ft_o = {}; //filed tabs data
    configs["fields"].push(ft_o);

    var transform_method = fielsTab.find('select[name="transform_method"]').val(),
    transform_params = fielsTab.find('input[name="transform_params"]').val(),
    input_field = fielsTab.find('input[name="input_field"]').val(),
    input_format = fielsTab.find('input[name="input_format"]').val(),
    table = fielsTab.find('select[name="table"]').val(),
    to = fielsTab.find('input[name="to"]').val(),
    from = fielsTab.find('input[name="from"]').val(),
    add_missing = fielsTab.find('select[name="add_missing"]').val(),
    missing_data = fielsTab.find('input[name="missing_data"]').val(); //transform method data

    ft_o["name"] = fielsTab.find('select[name="name"]').val();
    ft_o["type"] = fielsTab.find('select[name="type"]').val();
    ft_o["transform_method"] = transform_method;
    ft_o["input_fields"] = input_field.split(",") ;
    ft_o["transform_params"] = "";
    switch (transform_method) {
      case "constant":
      ft_o["transform_params"] = transform_params;
      break;
      case "datetime":
      ft_o["transform_params"] = {
        input_format: input_format
      };
      break;
      case "mapping":
      ft_o["transform_params"] = {
        table: table,
        to: to,
        from: from.split(",")
      };
      break;
      case "qc":
      delete ft_o['input_fields'];
      delete ft_o['type'];
      case "evaluate":
      ft_o["transform_params"] = transform_params;
      delete ft_o['input_fields'];
      break;
    }
  }
  var method = "POST";
  if ( mgmt.isEdit ) { method = "PUT"; }

  var cron_switch = $('#cron-switch').is(':checked')
  var tbl = $('#tbl_wrapper'); //element of wrapper table

  if(typeof mgmt.row_data !== 'undefined'){
    mgmt.row_data["convert_name"] =  $('#convert_name').val();
    mgmt.row_data["download_name"]  = $("#download_name option:selected").text();
  }

  apiService.SendRequest(method , mgmt.service , param , function(rs){
    if (rs.result == "OK"){
      //  mgmt.dataTable.row( mgmt.tr ).data( mgmt.row_data ).draw();

      row = {convert_name: $('#convert_name').val(), download_name: $("#download_name option:selected").text()};
      if(typeof mgmt.row_data !== 'undefined'){
        mgmt.row_data["convert_name"] =  $('#convert_name').val();
        mgmt.row_data["download_name"]  = $("#download_name option:selected").text();
        mgmt.dataTable.row( mgmt.tr ).data( mgmt.row_data ).draw();
        bootbox.alert(msg_save_suc, function(){
          $('.add_missing_ctrl').hide();
          tbl.removeClass('hidden');
          $('#mgmt-script-form').addClass('hidden');
        })
      }else{
        bootbox.alert(msg_save_suc, function(){
          $('.add_missing_ctrl').hide();
          tbl.removeClass('hidden');
          $('#mgmt-script-form').addClass('hidden');
          window.location.reload()
        })
      }
    }
  })
}
