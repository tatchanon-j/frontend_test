/**
*
*   Main JS application file for setting dataset page.
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
mgmt.init = function (translator) {
  mgmt.option = {}; //opiton data
  mgmt.translator = translator; //Text for label and message on javascript
  mgmt.service = "thaiwater30/backoffice/dataimport_config/dataimport_dataset"; //sercice datat import datatset
  mgmt.service_copy = "thaiwater30/backoffice/dataimport_config/dataimport_dataset_copy"; //service dataset copy
  mgmt.service_replay = "dataimport/rdl/node0/ps"; //service node
  mgmt.deleteRow = ""; //The data for the whole row
  mgmt.table = $('#tbl'); //table id
  mgmt.dataTable = mgmt.table.DataTable({
    dom: 'frlBtip',
    buttons: [{
      text: ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + btn_add_conv,
      action: mgmt.addMetadata
    }],
    language: g_dataTablesTranslator,
    columns: [{
      data: 'id',
    }, {
      data: 'download_name',
    }, {
      data: 'convert_name',
    }, {
      data: 'table_name',
    }
      , {
      data: mgmt.renderEditBtn
    }],
    order: [],
  });

  mgmt.initEvent();

  apiService.SendRequest('GET', mgmt.service, {}, function (rs) {
    if (rs.result == "OK") {
      mgmt.handlerDownloadList(rs.data.dataimport_dataset_list);
      mgmt.handlerSelectOption(rs.data.select_option);
    }
  });

  // Search in select
  $(".select-search").select2();

  $('#download_name').on('change', function () {
    console.log('bbbbb')

    apiService.GetCachedRequest(mgmt.service, {}, function (rs) {
      if (rs.result == "OK") {
        mgmt.optionRelate('input_name', rs.data.select_option.download_list);
        mgmt.inputNameChange()
      }
    });
  })

  $('#download_name_data').on('change', function () {
    console.log('aaa')

    apiService.GetCachedRequest(mgmt.service, {}, function (rs) {
      if (rs.result == "OK") {
        mgmt.optionRelateData('input_name_data', rs.data.select_option.download_list);
        mgmt.inputNameChangeData()

      }
    });
  })

  $('#import_table').on('change', function () {
    apiService.GetCachedRequest(mgmt.service, {}, function (rs) {
      if (rs.result == "OK") {
        mgmt.optionRelate('partition_field', rs.data.select_option.import_table, true);
        mgmt.optionRelate('name', rs.data.select_option.import_table);
        if (JH.GetJsonValue(mgmt["cache"], "inEditMode")) {
          mgmt.renderField();
        }
      }
    });
  })

  $('#import_table_data').on('change', function () {
    apiService.GetCachedRequest(mgmt.service, {}, function (rs) {
      if (rs.result == "OK") {
        mgmt.optionRelateData('partition_field', rs.data.select_option.import_table, true);
        mgmt.optionRelateData('name', rs.data.select_option.import_table);
        if (JH.GetJsonValue(mgmt["cache"], "inEditMode")) {
          mgmt.renderFieldData();
        }
      }
    });
  })

  //input only eng.
  $("#config_name").keypress(function (event) {
    var ew = event.which;
    if ((ew >= 32 && ew <= 126) || (ew == 8)) {
      return true;
    } else if (ew === 8) {
      return true;
    }
    return false;
  });

}


/**
* create button on table
*
* @param {json} row the data for the whole row
*
*/
mgmt.renderEditBtn = function (row) {
  return '<i class="btn btn-copy" title="' + mgmt.translator['msg_copy'] + '" data-id="' + row.id + '"></i>' +
    '<i class="btn btn-view" title="view json" data-name="viewJson" data-id="' + row.id + '"></i>' +
    '<i class="btn btn-edit" data-id="' + row["id"] + '"></i>' +
    '<i class="btn btn-view-data" title="view data" data-name="viewData" data-id="' + row["id"] + '"></i>' +

    '<i class="btn btn-delete" style="padding-left:20px;" title="delete"></i>';
}


/**
* init all event onclick
*
*/
mgmt.initEvent = function () {
  mgmt.table.on('click', '.btn.btn-copy', mgmt.btnCopy)
  mgmt.table.on('click', '.btn.btn-view', mgmt.btnEditClick)
  mgmt.table.on('click', '.btn.btn-view-data', mgmt.btnEditClick)
  mgmt.table.on('click', '.btn.btn-edit', mgmt.btnEditClick)
  mgmt.table.on('click', '.btn.btn-delete', mgmt.btnDeleteClick)
  mgmt.table.on('click', '.btn-play', mgmt.rePlay);

  var form = $('#mgmt-script-form');
  form.on('click', '.fields-tab', mgmt.fieldsTabClick);
  form.on('click', '.rm-tab-fields', mgmt.removeFieldsTabClick);
  form.on('click', '.add-fields', mgmt.addFieldsClick);

  form.on('change', 'select[name="transform_method"]', mgmt.transformMethodChange);
  form.on('change', 'select[name="input_format_date"]', mgmt.inputormatChange);
  form.on('keyup', 'input[id="input_name"]', mgmt.inputNameChange);

  form.on('click', '.add-missing-data', mgmt.addMissingDataClick);
  form.on('click', '.rm-missing-data', mgmt.removeMissingDataClick);
  form.on('change', 'select[name="add_missing"]', mgmt.addMissingChange);

  var form_data = $('#mgmt-data-form');
  form_data.on('click', '.fields-tab', mgmt.fieldsTabClick);
  // form_data.on('click', '.rm-tab-fields', mgmt.removeFieldsTabClick);
  // form_data.on('click', '.add-fields', mgmt.addFieldsClick);

  // form_data.on('change', 'select[name="transform_method"]', mgmt.transformMethodChange);
  // form_data.on('change', 'select[name="input_format_date"]', mgmt.inputormatChange);
  // form_data.on('keyup', 'input[id="input_name_data"]', mgmt.inputNameChangeData);

  // form_data.on('click', '.add-missing-data', mgmt.addMissingDataClick);
  // form_data.on('click', '.rm-missing-data', mgmt.removeMissingDataClick);
  // form_data.on('change', 'select[name="add_missing"]', mgmt.addMissingChange);


  $('#btn-cancel').on('click', mgmt.hideForm);
  $('#btn-save').on('click', mgmt.btnSaveClick);
  $('#btn-confirm').on('click', mgmt.btnDeleteConFirmClick);
}


/**
* prepare data to edit.
*
* @param {string} e data of element
*
*/
mgmt.btnEditClick = function (e) {
  var btn_view = $(this).attr('data-name'); //type to display data
  var d = mgmt.dataTable.rows($(e.target).closest('tr')).data()[0]; //the data for the whole row
  var id = GetJsonValue(d, "id"); //dataset id

  mgmt.tr = $(this).closest('tr');
  mgmt.row_data = mgmt.dataTable.row(mgmt.tr).data();

  apiService.SendRequest("GET", mgmt.service + "/" + id, {}, function (rs) {
    if (rs.result != "OK") { return false; }

    if (btn_view == "viewJson") {
      mgmt.showJson(id, rs.data);
      return false
    }

    if (btn_view == "viewData") {
      $('select[id="agent_user_data"]').prop('disabled', 'disabled')
      $('select[name="convert_method_data"]').attr('disabled', 'disabled');
      $('select[name="import_method_data"]').prop('disabled', 'disabled');
      $('select[name="input_name_data"]').attr('disabled', 'disabled');
      $('select[name="import_table_data"]').attr('disabled', 'disabled');
      $('select[name="partition_field"]').attr('disabled', 'disabled');
      $('select[name="name"]').attr('disabled', 'disabled');
      $('select[name="transform_method"]').attr('disabled', 'disabled');
      $('select[name="type"]').attr('disabled', 'disabled');
      $('select[name="table"]').attr('disabled', 'disabled');
      $('select[name="add_missing"]').attr('disabled', 'disabled');
      $('select[name="input_format_date"]').attr('disabled', 'disabled');
      $('select[name="download_name_data"]').attr('disabled', 'disabled');
      $('input[id="data_folder"]').prop('disabled', true);
      $('input[name="convert_name"]').prop('disabled', true);
      $('input[name="config_name"]').prop('disabled', true);
      $('input[name="header_row"]').prop('disabled', true);
      $('input[name="unique_constraint"]').prop('disabled', true);
      $('textarea').prop('disabled', true);
      $('input[name="input_field"]').prop('disabled', true);
      $('input[name="to"]').prop('disabled', true);
      $('input[name="add_missing_from"]').prop('disabled', true);
      $('input[name="missing_data"]').prop('disabled', true);
      $('input[name="input_format_custom"]').prop('disabled', true);
      mgmt.showData(id, rs.data);
      return false
    } else {
      $('select[id="agent_user_data"]').prop('disabled', 'disabled')
      $('select[name="convert_method_data"]').attr('disabled', 'disabled');
      $('select[name="import_method_data"]').prop('disabled', 'disabled');
      $('select[name="input_name_data"]').attr('disabled', 'disabled');
      $('select[name="import_table_data"]').attr('disabled', 'disabled');
      $('select[name="partition_field"]').attr('disabled', false);
      $('select[name="name"]').attr('disabled', false);
      $('select[name="transform_method"]').attr('disabled', false);
      $('select[name="type"]').attr('disabled', false);
      $('select[name="table"]').attr('disabled', false);
      $('select[name="add_missing"]').attr('disabled', false);
      $('select[name="input_format_date"]').attr('disabled', false);
      $('select[name="download_name_data"]').attr('disabled', 'disabled');
      $('input[id="data_folder"]').prop('disabled', false);
      $('input[name="convert_name"]').prop('disabled', false);
      $('input[name="config_name"]').prop('disabled', false);
      $('input[name="header_row"]').prop('disabled', false);
      $('input[name="unique_constraint"]').prop('disabled', false);
      $('textarea').prop('disabled', false);
      $('input[name="input_field"]').prop('disabled', false);
      $('input[name="to"]').prop('disabled', false);
      $('input[name="add_missing_from"]').prop('disabled', false);
      $('input[name="missing_data"]').prop('disabled', false);
      $('input[name="input_format_custom"]').prop('disabled', false);

      mgmt.showForm(id, rs.data);
    }

    
  });
}


/**
* display json data on modal.
*
* @param {string} id dataset id
* @param {json} rs the option data
*
*/
mgmt.showJson = function (id, rs) {
  var form = $('#dlgDatajson-form'); //element form display data is json
  form.find('#dlgDatajson-conv-json').val(JSON.stringify(GetJsonValue(rs, "convert_setting")));
  form.find('#dlgDatajson-import-json').val(JSON.stringify(GetJsonValue(rs, "import_setting")));
  form.find('#dlgDatajson-lookup-json').val(JSON.stringify(GetJsonValue(rs, "lookup_table")));
  form.find('#dlgDatajson-im-tbl-sjon').val(JSON.stringify(GetJsonValue(rs, "import_table_json")));

  $('#dlgDatajson').modal({
    backdrop: 'static'
  })

}


/**
* clone data to create new data
*
*/
mgmt.btnCopy = function () {
  var id = $(this).attr('data-id'); //datatset id
  var param = {
    dataset_id: parseInt(id)
  }

  bootbox.confirm({
    message: mgmt.translator['msg_con_copy'],
    reorder: true,
    buttons: {
      confirm: {
        label: mgmt.translator['btn_confirm'],
        className: 'btn-primary'
      },
      cancel: {
        label: mgmt.translator['btn_cancel'],
        className: 'btn-default'
      }
    },
    callback: function (result) {
      if (result) {

        apiService.SendRequest('POST', mgmt.service_copy, param, function (rs) {
          if (rs.result !== "OK") {
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
            callback: function () {
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
* delete data in table.
*
* @param {}
*
*/
mgmt.btnDeleteClick = function (e) {
  mgmt.deleteRow = mgmt.dataTable.rows($(e.target).closest('tr'));
  var d = mgmt.deleteRow.data()[0]; //the data for the whole row
  var id = GetJsonValue(d, "id"); // dataset id
  var text = GetJsonValue(d, "convert_name"); // convert name
  $('#modal-delete').modal().find('h5').text(modal_delete_title.replace('%s', text));
}


/**
* alert confirm delete data in table.
*
*/
mgmt.btnDeleteConFirmClick = function () {
  if (mgmt.deleteRow == "") { return false; }
  var id = GetJsonValue(mgmt.deleteRow.data()[0], "id"); //datatset id
  apiService.SendRequest("DELETE", mgmt.service + "/" + id, {}, function (rs) {
    if (rs.result != "OK") { alert(rs.data); return false; }
    mgmt.deleteRow.remove().draw();
    mgmt.deleteRow = "";
    $('#modal-delete').modal('hide');
  });
}


/**
* prepare data
*
* @param {string} row number
*
*/
mgmt.rePlay = function (row) {
  var data = mgmt.dataTable.row($(this).closest('tr')).data(); //the data for whole row
  var name = JH.GetJsonValue(data, "convert_name"); //convert name
  var param_play = {
    download_id: JH.GetJsonValue(data, "download_id"),
    download_script: JH.GetJsonValue(data, "download_script"),
  }; //parameter for run

  // Dialog box to comfirm redownload.
  var s = mgmt.translator['msg_process'] + " : " + name; //message confirm rerun script
  bootbox.confirm({
    message: s,
    reorder: true,
    buttons: {
      confirm: {
        label: '<i class="fa fa-check"></i> ' + mgmt.translator['btn_confirm'],
        className: 'btn-success'
      },
      cancel: {
        label: '<i class="fa fa-times"></i> ' + mgmt.translator['btn_cancel'],
        className: 'btn-danger'
      }
    },
    callback: function (result) {
      if (result) {
        apiService.SendRequest('POST', mgmt.service_replay, param_play, function (data, status, jqxhr) {
          if (status !== "success") {
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
mgmt.fieldsTabClick = function () {
  var fieldsTabs = $(this).closest('ul.fields-tabs'); //filed tabs element
  var fieldsTabContent = fieldsTabs.next('div.fields-tab-content'); //conten element in field tabs
  var li = $(this).closest('li'); //element li
  var index = li.index(); //index of element li

  fieldsTabContent.children('div.tab-pane.active').removeClass('active');
  fieldsTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
  current["fields"] = index;
  mgmt["cache"]["index"] = index;
  mgmt.handlerFieldsEvent();

  var field_date_form = fieldsTabs.next().find('.active #input_format_date').trigger("change"); //input format date element
}

/**
* btn remove fields tab click
*
* @param {}
*
*/
mgmt.removeFieldsTabClick = function () {
  var fieldsTabs = $(this).closest('ul.fields-tabs');
  var fieldsTabContent = fieldsTabs.next('div.fields-tab-content');
  var li = $(this).closest('li');
  var index = li.index();
  var lastLi = fieldsTabs.children('li:not(.add-tab):last');
  var lastIndex = lastLi.index();
  lastLi.remove();
  fieldsTabContent.children('.tab-pane:eq(' + index + ')').remove();

  if (index == current["fields"]) { current["fields"] = -1; }
  if (index == lastIndex) { index--; }
  fieldsTabs.children('li:eq(' + index + ')').children('a').trigger('click');
  mgmt.handlerFieldsEvent();
  // hostTabs.find('li:eq('+index+')').find('a').css("background-color", "yellow");
}

mgmt.removeFieldsTabClick2 = function () {
  var fieldsTabs = $(this).closest('ul.fields-tabs');
  var fieldsTabContent = fieldsTabs.next('div.fields-tab-content');
  var li = $(this).closest('li');
  var index = li.index();
  var lastLi = fieldsTabs.children('li:not(.add-tab):last');
  var lastIndex = lastLi.index();
  lastLi.remove();
  fieldsTabContent.children('.tab-pane:eq(' + index + ')').remove();

  if (index == current["fields"]) { current["fields"] = -1; }
  if (index == lastIndex) { index--; }
  fieldsTabs.children('li:eq(' + index + ')').children('a').trigger('click');
  mgmt.handlerFieldsEvent();
  // hostTabs.find('li:eq('+index+')').find('a').css("background-color", "yellow");
}


/**
* add new fields tab
*
*/
mgmt.addFieldsClick = function () {
  mgmt.addFields($(this));
}


/**
* add data into fields tab
*
* @param {json} el element
*
*/
mgmt.addFields = function (el) {
  var ltLast = el.closest('.add-tab'); //buttom add new tabs element
  var fieldsTabs = ltLast.closest('ul.fields-tabs'); //field tabs element
  var fieldsTabContent = fieldsTabs.next('div.fields-tab-content'); //conten element in field tabs
  var index = ltLast.index(); //index of button add new tabs element

  mgmt["cache"]["index"] = index;
  index++;

  var spanRemove = ''; //button remove tabs
  var newContent; //content element

  if (index != 1) {
    spanRemove = '<span class="rm-tab-fields">x</span>';
  }
  newContent = $('#pane-fields-master').clone().removeClass('hidden').removeAttr('id');
  // add fields tab
  ltLast.before('<li class="nav-item"><a href="#" class="fields-tab nav-link" data-toggle="tab">field#' + index + '</a>' + spanRemove + '</li>');
  // add fields tab-content
  fieldsTabContent.append(newContent);
  newContent.find('select[name="transform_method"]').removeAttr('id');
  newContent.find('select[name="type"]').removeAttr('id');
  newContent.find('select[name="name"]').removeAttr('id');

  newContent.find('select[name="table"]').removeAttr('id');
  newContent.find('select[name="input_format_date"]').removeAttr('id');
  newContent.find('select[name="add_missing"]').removeAttr('id');

  fieldsTabs.find('.fields-tab:last').trigger('click');
  mgmt.handlerFieldsEvent();
  return newContent;
}


/**
* enable or disable to edit import table data according field tab active.
*
*/
mgmt.handlerFieldsEvent = function () {
  if (JH.GetJsonValue(mgmt["cache"], "index") == 0) {
    $('#import_table').removeAttr('disabled');
  } else {
    $('#import_table').prop('disabled', true);
  }
}


/**
* input_name Chage
*
*/
mgmt.inputNameChange = function () {
  var txt = $('#input_name').val(); //input name

  $('.input_name_ctrl').hide();
  if (mgmt.isJsonXml(txt)) { $('.div_data_tag').show(); }
  else { $('.div_header_row').show(); }
}

mgmt.inputNameChangeData = function () {
  var txt = $('#input_name_data').val(); //input name

  $('.input_name_ctrl').hide();
  if (mgmt.isJsonXml(txt)) { $('.div_data_tag').show(); }
  else { $('.div_header_row').show(); }
}



/**
* set file type for input name
*
* @param {string} input name
*
*/
mgmt.isJsonXml = function (txt) {
  if (arguments.length == 0) { return false; }
  if (!txt) { return false; }
  if (txt == "") { return false; }
  var text = txt.split(".");
  if (text.length == 0 || text.length == 1) { return false; }
  var ext = text[text.length - 1]; //type file of input name
  if (ext == "json" || ext == "xml") { return true; }
  return false;
}


/**
* transform_method change
*
*/
mgmt.transformMethodChange = function () {
  var tabPane = $(this).closest('.tab-pane'); //tab pane element

  tabPane.find('.transform_method_ctrl').hide();
  tabPane.find('.transform_method_ctrl_' + $(this).val()).show();

  if ($(this).val() == "mapping") {
    tabPane.find('select[name="add_missing"]').trigger('change');
  } else {
    tabPane.find('select[name="add_missing"]').trigger('change');
  }

  if ($(this).val() == "datetime") {
    tabPane.find('select[name="input_format_date"]').trigger('change');
  }
}


/**
* input fomat chamge
*
*/
mgmt.inputormatChange = function () {
  var tabPane = $(this).closest('.tab-pane'); //tab pane element

  tabPane.find('select[name="input_format_date"]')
  var type = $(this).val(); //type of input date
  if (type == 'custom') {
    $('.frm-custom-date').show()
  } else {
    $('.frm-custom-date').hide()
  }
}

/**
* add missing change
*
*/
mgmt.addMissingChange = function () {
  var tabPane = $(this).closest('.tab-pane'); //tabs pane element
  var transform_method = tabPane.find('select[name="transform_method"]').val();

  if ($(this).val() == "true") {
    tabPane.find('input[name="from"]').prop('disabled', true);
    tabPane.find('input[name="add_missing_from"]:eq(0)').prop('required', true);
    tabPane.find('input[name="missing_data"]:eq(0)').prop('required', true);
    tabPane.find('.add_missing_true').show();
  }

  if ($(this).val() !== "true" || transform_method !== 'mapping') {

    tabPane.find('input[name="from"]').removeAttr('disabled');
    tabPane.find('input[name="add_missing_from"]:eq(0)').removeAttr('required');
    tabPane.find('input[name="missing_data"]:eq(0)').removeAttr('required');
    tabPane.find('.add_missing_ctrl').hide();
  }
}


/**
* add missing data click
*
*/
mgmt.addMissingDataClick = function () {
  mgmt.addMissingData($(this));
}


/**
* add new missing data
*
* @param {json} el element
*
*/
mgmt.addMissingData = function (el) {
  var tabPane = el.closest('.tab-pane'); //tabs pane element

  newContent = $('#add-missing-master').clone().removeClass('hidden').addClass('transform_method_ctrl transform_method_ctrl_mapping').removeAttr('id');
  tabPane.append(newContent);
  return newContent;
}

/**
* remove missing data
*
*/
mgmt.removeMissingDataClick = function () {
  $(this).closest('.add_missing_ctrl').remove();
}


/**
* add data to table.
*
* @param {json} rs dataset data
*
*/
mgmt.handlerDownloadList = function (rs) {
  mgmt.dataTable.clear();
  mgmt.dataTable.rows.add(rs);
  mgmt.dataTable.draw();
}


/**
* prepare dat to genoption.
*
* @param {json} rs option data
*
*/
mgmt.handlerSelectOption = function (rs) {
  mgmt.SelectOption = rs;
  mgmt.genSelect('download_name', GetJsonValue(rs, "download_list"));
  mgmt.optionRelate('input_name', GetJsonValue(rs, "download_list"));
  mgmt.genSelect('agent_user', GetJsonValue(rs, "agent_user"));
  mgmt.genSelect('convert_method', GetJsonValue(rs, "convert_method"));
  mgmt.genSelect('import_method', GetJsonValue(rs, "import_method"));
  mgmt.genSelect('import_table', GetJsonValue(rs, "import_table"));
  mgmt.genSelect('type', GetJsonValue(rs, "type"));
  mgmt.genSelect('transform_method', GetJsonValue(rs, "transform_method"));
  mgmt.genSelect('table', GetJsonValue(rs, "master_table"));
  mgmt.genSelect('add_missing', GetJsonValue(rs, "add_missing"));
  mgmt.genSelect('input_format_date', GetJsonValue(rs, "input_format_datetime"))
  mgmt.optionRelate('partition_field', GetJsonValue(rs, "import_table"), true);
  mgmt.optionRelate('name', GetJsonValue(rs, "import_table")); input_name

  mgmt.genSelect('download_name_data', GetJsonValue(rs, "download_list"));
  mgmt.optionRelateData('input_name_data', GetJsonValue(rs, "download_list"));
  mgmt.genSelect('agent_user_data', GetJsonValue(rs, "agent_user"));
  mgmt.genSelect('convert_method_data', GetJsonValue(rs, "convert_method"));
  mgmt.genSelect('import_method_data', GetJsonValue(rs, "import_method"));
  mgmt.genSelect('import_table_data', GetJsonValue(rs, "import_table"));
  mgmt.genSelect('type_data', GetJsonValue(rs, "type"));
  mgmt.genSelect('transform_method_data', GetJsonValue(rs, "transform_method"));
  mgmt.genSelect('table_data', GetJsonValue(rs, "master_table"));
  mgmt.genSelect('add_missing_data', GetJsonValue(rs, "add_missing"));
  mgmt.genSelect('input_format_date_data', GetJsonValue(rs, "input_format_datetime"))
  mgmt.optionRelateData('partition_field', GetJsonValue(rs, "import_table"), true);
  mgmt.optionRelateData('name_data', GetJsonValue(rs, "import_table"));
}


/**
* update option in dropdown which relate with other dropdown.
*
* @param {string} el element name
* @param {json} rs option data
* @param {boolean} addEmpty
*
*/
mgmt.optionRelate = function (el, rs, addEmpty) {
  $('#' + el + '> option').not('.default').remove();

  var table_name = $('#import_table').val(); //table name
  var download_name = $('#download_name').val(); //download name
  var rs_data = apiService.getFieldValue(rs, 'data'); //option data
  console.log('table', table_name)
  console.log('download_name', table_name)

  var data_relate = {
    result: 'OK'
  }; // result data from service

  if (rs_data == null) { return }
  if (el == 'input_name' || el == 'input_name_data') {
    for (var i = 0; i < rs_data.length; i++) {
      if (rs_data[i]['value'] == download_name) {
        data_relate['data'] = [{ text: rs_data[i]['filename'], value: rs_data[i]['filename'] }]
      }
    }
  } else {
    for (var i = 0; i < rs_data.length; i++) {
      if (rs_data[i]['value'] == table_name) {
        data_relate['data'] = rs_data[i]['related'].slice();
        if (addEmpty) {
          data_relate['data'].splice(0, 0, { text: '', value: '' });
        }
      }
    }
  }
  mgmt.genSelectByName(el, data_relate);
}

mgmt.optionRelateData = function (el, rs, addEmpty) {
  console.log('optionRelateData')

  $('#' + el + '> option').not('.default').remove();

  var table_name = $('#import_table_data').val(); //table name
  console.log('table_name', table_name)

  var download_name = $('#download_name_data').val(); //download name
  console.log('download_name_data', download_name)
  var rs_data = apiService.getFieldValue(rs, 'data'); //option data

  console.log('rs', rs)

  var data_relate = {
    result: 'OK'
  }; // result data from service

  if (rs_data == null) { return }
  if (el == 'input_name_data' || el == 'input_name') {
    for (var i = 0; i < rs_data.length; i++) {
      if (rs_data[i]['value'] == download_name) {
        data_relate['data'] = [{ text: rs_data[i]['filename'], value: rs_data[i]['filename'] }]
      }
    }
  } else {
    for (var i = 0; i < rs_data.length; i++) {
      if (rs_data[i]['value'] == table_name) {
        data_relate['data'] = rs_data[i]['related'].slice();
        if (addEmpty) {
          data_relate['data'].splice(0, 0, { text: '', value: '' });
        }
      }
    }
  }
  mgmt.genSelectByName(el, data_relate);
}



/**
* generate option for dropdown by identify with id of element.
*
* @param {string} el element name
* @param {rs} rs option data
*
*/
mgmt.genSelect = function (el, rs) {
  var select = document.getElementById(el); //dropdown element
  var data_rs = apiService.getFieldValue(rs, 'data'); //option data

  if (typeof rs === "undefined") { return false; }
  if (typeof mgmt.option[el] === "undefined") { mgmt.option[el] = {}; }
  if (data_rs == null || rs.result != "OK") { return false; }


  for (var i = 0; i < data_rs.length; i++) {
    var data = data_rs[i]; //option data
    var option = document.createElement("option"); //create option
    var txt_option = data["text"]; //opiton name
    var val_option = data["value"]; //option value
    mgmt.option[el][val_option] = data;
    option.text = txt_option;
    option.value = val_option;
    if (el == "add_missing" && val_option == false) { option.setAttribute('selected', 'true') } //Set default of add_mssing is false
    select.add(option);
  }
}


/**
* generate option for dropdown by identify with name of element.
*
* @param {string} name name of element
* @param {json} rs option data
*
*/
mgmt.genSelectByName = function (name, rs) {
  var select = $('select[name="' + name + '"]'); //dropdown element
  var data_rs = apiService.getFieldValue(rs, 'data'); //option data

  select.empty();
  if (typeof rs === "undefined") { return false; }
  if (rs.result != "OK" || data_rs == null) { return false; }
  if (!data_rs) { return false }

  for (var i = 0; i < data_rs.length; i++) {
    var data = data_rs[i]; //option data
    var txt_option = data["text"]; //option name
    var val_option = data["value"]; //option value
    var opt = new Option(txt_option, val_option); //create option element
    select.append(opt);
  }
}


/**
* display form to add new data.
*
*/
mgmt.addMetadata = function () {
  mgmt.showForm();
}


/**
* display form to add or edit data.
*
* @param {string} id dataset id
* @param {json} d dataset data
*
*/
mgmt.showForm = function (id, d) {
  mgmt.data = {};
  mgmt.isEdit = false;
  if (typeof d !== "undefined") { mgmt.data = d; mgmt.dataId = id; mgmt.isEdit = true; }

  var form = $('#mgmt-script-form'); //scritp form element
  form.parsley().reset();
  form.find('.fields-tabs > li:not(.add-tab)').remove();
  form.find('.fields-tab-content').empty();

  $('#tbl_wrapper').addClass('hidden');
  form[0].reset();
  form.removeClass('hidden');

  if (!mgmt.isEdit) {
    var newContent = mgmt.addFields(form.find('.add-fields'));
    return false;
  }
  // in edit mode
  var convert_setting = GetJsonValue(d, "convert_setting"); //convert setting data
  var config = GetJsonValue(convert_setting, "configs")[0]; //config data
  var fields = GetJsonValue(config, "fields"); //field data

  mgmt["cache"]["fields"] = fields;
  mgmt["cache"]["partition_field"] = JH.GetJsonValue(d, "partition_field");
  mgmt["cache"]["inEditMode"] = true;

  form.find('#agent_user').val(GetJsonValue(d, "agent_user_id")).triggerHandler('change');
  form.find('#convert_name').val(GetJsonValue(d, "convert_name"));
  form.find('#convert_method').val(GetJsonValue(d, "convert_method")).triggerHandler('change');
  form.find('#download_name').val(GetJsonValue(d, "download_id")).triggerHandler('change');
  form.find('#import_method').val(GetJsonValue(d, "import_method"));
  form.find('#import_table').val(GetJsonValue(d, "import_table")).triggerHandler('change');
  form.find('#partition_field').val(GetJsonValue(d, "partition_field"));
  form.find('#unique_constraint').val(GetJsonValue(d, "unique_constraint"));

  form.find('#data_folder').val(GetJsonValue(convert_setting, "data_folder"));

  form.find('#config_name').val(GetJsonValue(config, "name"));
  form.find('#input_name').val(GetJsonValue(config, "input_name")).trigger('change');
  form.find('#header_row').val(GetJsonValue(config, "header_row"));
  form.find('#data_tag').val(GetJsonValue(config, "data_tag"));
  form.find('#row_validator').val(GetJsonValue(config, "row_validator"));
}


mgmt.showData = function (id, d) {
  mgmt.data = {};
  mgmt.isEdit = false;
  if (typeof d !== "undefined") { mgmt.data = d; mgmt.dataId = id; mgmt.isEdit = true; }

  var form = $('#mgmt-data-form'); //scritp form element
  form.parsley().reset();
  form.find('.fields-tabs > li:not(.add-tab)').remove();
  form.find('.fields-tab-content').empty();

  // $('#tbl_wrapper').addClass('hidden');
  form[0].reset();
  form.removeClass('hidden');

  // if (!mgmt.isEdit) {
  //   var newContent = mgmt.addFields(form.find('.add-fields'));
  //   return false;
  // }

  // in edit mode
  var convert_setting = GetJsonValue(d, "convert_setting"); //convert setting data
  var config = GetJsonValue(convert_setting, "configs")[0]; //config data
  var fields = GetJsonValue(config, "fields"); //field data

  mgmt["cache"]["fields"] = fields;
  mgmt["cache"]["partition_field"] = JH.GetJsonValue(d, "partition_field");
  mgmt["cache"]["inEditMode"] = true;

  form.find('#agent_user').val(GetJsonValue(d, "agent_user_id")).triggerHandler('change');
  form.find('#convert_name').val(GetJsonValue(d, "convert_name"));
  form.find('#convert_method').val(GetJsonValue(d, "convert_method")).triggerHandler('change');
  form.find('#download_name_data').val(GetJsonValue(d, "download_id")).triggerHandler('change');
  form.find('#import_method').val(GetJsonValue(d, "import_method"));
  form.find('#import_table_data').val(GetJsonValue(d, "import_table")).triggerHandler('change');
  form.find('#partition_field').val(GetJsonValue(d, "partition_field"));
  form.find('#unique_constraint').val(GetJsonValue(d, "unique_constraint"));

  form.find('#data_folder').val(GetJsonValue(convert_setting, "data_folder"));

  form.find('#config_name').val(GetJsonValue(config, "name"));
  form.find('#input_name').val(GetJsonValue(config, "input_name")).trigger('change');
  form.find('#header_row').val(GetJsonValue(config, "header_row"));
  form.find('#data_tag').val(GetJsonValue(config, "data_tag"));
  form.find('#row_validator').val(GetJsonValue(config, "row_validator"));

  $('#exampleModalLong').modal({
    backdrop: 'static'
  })
}

/**
* g
*/
mgmt.renderField = function () {
  mgmt["cache"]["inEditMode"] = false;
  var form = $('#mgmt-script-form'); //scritp form element

  form.find('#partition_field').val(JH.GetJsonValue(mgmt, "cache.partition_field"));

  var fields = JH.GetJsonValue(mgmt, "cache.fields"); //field data

  if (typeof fields === undefined || fields == null) { return false }

  for (var i = 0; i < fields.length; i++) {
    var fieldTab = mgmt.addFields(form.find('.add-fields')); //button add new tab element
    var field = fields[i]; //field data
    var transform_method = GetJsonValue(field, "transform_method"),
      transform_params = GetJsonValue(field, "transform_params"); //transform method

    if (field.transform_method == 'datetime' && field.transform_params) {
      var input_format = GetJsonValue(field.transform_params, "input_format"); //input format
      var input_format_custom = GetJsonValue(field.transform_params, "input_format_custom"); //input format custom
    }

    var type = (GetJsonValue(field, "type") == "" ? "string" : GetJsonValue(field, "type"));

    fieldTab.find('select[name="name"]').val(GetJsonValue(field, "name"));
    fieldTab.find('select[name="type"]').val(type);
    fieldTab.find('input[name="input_field"]').val(GetJsonValue(field, "input_fields"));
    fieldTab.find('select[name="transform_method"]').val(transform_method).trigger('change');
    //fieldTab.find('select[name="input_format_date"]').val( input_format ).trigger('change');
    switch (transform_method) {
      case "constant":
      case "evaluate":
        fieldTab.find('input[name="transform_params"]').val(transform_params);
        break;
      case "datetime":
        fieldTab.find('select[name="input_format_date"]').val(input_format).trigger('change');
        var form_date = fieldTab.find('select[name="input_format_date"]').val();

        if (!form_date) {
          fieldTab.find('select[name="input_format_date"]').val('custom').trigger('change');
          fieldTab.find('input[name="input_format_custom"]').val(input_format);
        }
        break;
      case "mapping":
        var _from = JH.GetJsonValue(transform_params, "from");
        var _missing_data = JH.GetJsonValue(transform_params, "missing_data");
        var _add_missing = GetJsonValue(transform_params, "add_missing");
        fieldTab.find('select[name="table"]').val(GetJsonValue(transform_params, "table"));
        fieldTab.find('input[name="to"]').val(GetJsonValue(transform_params, "to"));
        fieldTab.find('input[name="from"]').val(JH.ArrayJoin(_from));
        fieldTab.find('select[name="add_missing"]').val(_add_missing.toString()).trigger('change');
        fieldTab.find('input[name="missing_data"]').val(GetJsonValue(transform_params, "missing_data"));

        if (_add_missing) {
          if (typeof _from === undefined || _from == null) { return false }
          var j = 0;
          for (var k in _missing_data) {
            if (j != 0) {
              mgmt.addMissingData(fieldTab);
            }
            fieldTab.find('input[name="add_missing_from"]:eq(' + j + ')').val(k);
            fieldTab.find('input[name="missing_data"]:eq(' + j + ')').val(JH.GetJsonValue(_missing_data, k));
            j++;
          }
        }
        break;
      case "mappingnil":
        var _from = JH.GetJsonValue(transform_params, "from");
        fieldTab.find('select[name="table"]').val(JH.GetJsonValue(transform_params, "table"));
        fieldTab.find('input[name="to"]').val(JH.GetJsonValue(transform_params, "to"));
        fieldTab.find('input[name="from"]').val(JH.ArrayJoin(_from));
        break;
      case "qc":
        fieldTab.find('input[name="input_field"]').val('');
        break;
    }
  }
}


mgmt.renderFieldData = function () {
  mgmt["cache"]["inEditMode"] = false;
  var form = $('#mgmt-data-form'); //scritp form element

  form.find('#partition_field').val(JH.GetJsonValue(mgmt, "cache.partition_field"));

  var fields = JH.GetJsonValue(mgmt, "cache.fields"); //field data

  if (typeof fields === undefined || fields == null) { return false }

  for (var i = 0; i < fields.length; i++) {
    var fieldTab = mgmt.addFields(form.find('.add-fields')); //button add new tab element
    var field = fields[i]; //field data
    var transform_method = GetJsonValue(field, "transform_method"),
      transform_params = GetJsonValue(field, "transform_params"); //transform method

    if (field.transform_method == 'datetime' && field.transform_params) {
      var input_format = GetJsonValue(field.transform_params, "input_format"); //input format
      var input_format_custom = GetJsonValue(field.transform_params, "input_format_custom"); //input format custom
    }

    var type = (GetJsonValue(field, "type") == "" ? "string" : GetJsonValue(field, "type"));

    fieldTab.find('select[name="name"]').val(GetJsonValue(field, "name"));
    fieldTab.find('select[name="type"]').val(type);
    fieldTab.find('input[name="input_field"]').val(GetJsonValue(field, "input_fields"));
    fieldTab.find('select[name="transform_method"]').val(transform_method).trigger('change');
    //fieldTab.find('select[name="input_format_date"]').val( input_format ).trigger('change');
    switch (transform_method) {
      case "constant":
      case "evaluate":
        fieldTab.find('input[name="transform_params"]').val(transform_params);
        break;
      case "datetime":
        fieldTab.find('select[name="input_format_date"]').val(input_format).trigger('change');
        var form_date = fieldTab.find('select[name="input_format_date"]').val();

        if (!form_date) {
          fieldTab.find('select[name="input_format_date"]').val('custom').trigger('change');
          fieldTab.find('input[name="input_format_custom"]').val(input_format);
        }
        break;
      case "mapping":
        var _from = JH.GetJsonValue(transform_params, "from");
        var _missing_data = JH.GetJsonValue(transform_params, "missing_data");
        var _add_missing = GetJsonValue(transform_params, "add_missing");
        fieldTab.find('select[name="table"]').val(GetJsonValue(transform_params, "table"));
        fieldTab.find('input[name="to"]').val(GetJsonValue(transform_params, "to"));
        fieldTab.find('input[name="from"]').val(JH.ArrayJoin(_from));
        fieldTab.find('select[name="add_missing"]').val(_add_missing.toString()).trigger('change');
        fieldTab.find('input[name="missing_data"]').val(GetJsonValue(transform_params, "missing_data"));

        if (_add_missing) {
          if (typeof _from === undefined || _from == null) { return false }
          var j = 0;
          for (var k in _missing_data) {
            if (j != 0) {
              mgmt.addMissingData(fieldTab);
            }
            fieldTab.find('input[name="add_missing_from"]:eq(' + j + ')').val(k);
            fieldTab.find('input[name="missing_data"]:eq(' + j + ')').val(JH.GetJsonValue(_missing_data, k));
            j++;
          }
        }
        break;
      case "mappingnil":
        var _from = JH.GetJsonValue(transform_params, "from");
        fieldTab.find('select[name="table"]').val(JH.GetJsonValue(transform_params, "table"));
        fieldTab.find('input[name="to"]').val(JH.GetJsonValue(transform_params, "to"));
        fieldTab.find('input[name="from"]').val(JH.ArrayJoin(_from));
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
*/
mgmt.hideForm = function () {
  $('#tbl_wrapper').removeClass('hidden');
  $('#mgmt-script-form').addClass('hidden');
}


/**
* save data
*
*/
mgmt.btnSaveClick = function () {

  $('input[name="add_missing_from"]').not(':eq(0)').removeAttr('required');
  $('input[name="missing_data"]').not(':eq(0)').removeAttr('required');

  $('#mgmt-script-form').parsley().validate()
  if (!$('#mgmt-script-form').parsley().isValid()) { return false }

  var param = mgmt.data; //parameter for save dataset
  var configs = { fields: [] }; //prepare config data for add to parameter

  param["download_id"] = parseInt($('#download_name').val());
  param["agent_user_id"] = parseInt($('#agent_user').val());
  param["convert_method"] = $('#convert_method').val();
  param["convert_name"] = $('#convert_name').val();
  param["import_method"] = $('#import_method').val();
  param["import_table"] = $('#import_table').val();
  param["unique_constraint"] = $('#unique_constraint').val();
  param["partition_field"] = $('#partition_field').val();
  param["convert_setting"] = {
    data_folder: $('#data_folder').val(),
    configs: [configs]
  }
  configs["name"] = $('#config_name').val();
  configs["input_name"] = $('#input_name').val();

  if ($('#header_row').val() != "" && !mgmt.isJsonXml(configs["input_name"])) { configs["header_row"] = parseInt($('#header_row').val()) }
  if ($('#data_tag').val() != "" && mgmt.isJsonXml(configs["input_name"])) { configs["data_tag"] = $('#data_tag').val() }
  if ($('#row_validator').val() != "") { configs["row_validator"] = $('#row_validator').val() }

  var fielsTabs = $('#mgmt-script-form .fields-tab-content').children('div.tab-pane');
  if (typeof fielsTabs === undefined || fielsTabs == null) { return false }
  for (var i = 0; i < fielsTabs.length; i++) {
    var fielsTab = $(fielsTabs[i]); //field tabs element
    var ft_o = {}; //field data
    configs["fields"].push(ft_o);

    var transform_method = fielsTab.find('select[name="transform_method"]').val(),
      transform_params = fielsTab.find('input[name="transform_params"]').val(),
      input_field = fielsTab.find('input[name="input_field"]').val(),
      input_format = fielsTab.find('select[name="input_format_date"]').val(),
      input_format_custom = fielsTab.find('input[name="input_format_custom"]').val(),
      table = fielsTab.find('select[name="table"]').val(),
      to = fielsTab.find('input[name="to"]').val(),
      from = fielsTab.find('input[name="from"]').val(),
      add_missing = (fielsTab.find('select[name="add_missing"]').val() == 'true'),
      missing_data = add_missing && fielsTab.find('input[name="missing_data"]').val() ? {} : null; //the all data to put into the field

    ft_o["name"] = fielsTab.find('select[name="name"]').val();
    ft_o["type"] = fielsTab.find('select[name="type"]').val();
    ft_o["transform_method"] = transform_method;
    ft_o["input_fields"] = input_field.split(",");
    ft_o["transform_params"] = "";
    switch (transform_method) {
      case "constant":
        ft_o["transform_params"] = transform_params;
        break;
      case "datetime":
        if (input_format == 'custom') {
          ft_o["transform_params"] = {
            input_format: input_format_custom
          };
        } else {
          ft_o["transform_params"] = {
            input_format: input_format
          };
        }
        break;
      case "mapping":
        var arrForm = from.split(',');
        if (missing_data) {
          fielsTab.find('input[name="add_missing_from"]').each(function (i) {
            if (i == 0) {
              //arrForm.push(this.value);
              missing_data[this.value] = fielsTab.find('input[name="missing_data"]:eq(' + i + ')').val();
              return true;
            }
            // เช็ค add_missing_from ไม่ว่าง ให้ missing_data ที่อยู่คู่กันต้องไม่ว่างด้วย
            if ($(this).val().trim() != "") {
              md = fielsTab.find('input[name="missing_data"]:eq(' + i + ')');
              md.prop('required', true);

              //arrForm.push(this.value);
              missing_data[this.value] = fielsTab.find('input[name="missing_data"]:eq(' + i + ')').val();
            }
          })
          // validate
          $('#mgmt-script-form').parsley().validate()
          if (!$('#mgmt-script-form').parsley().isValid()) { return false; }
        }

        ft_o["transform_params"] = {
          table: table,
          to: to,
          from: arrForm,
          add_missing: add_missing,
          missing_data: missing_data
        };
        break;
      case "mappingnil":
        var arrForm = from.split(',');
        ft_o["transform_params"] = {
          table: table,
          to: to,
          from: arrForm,
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
  if (mgmt.isEdit) { method = "PUT"; }

  var cron_switch = $('#cron-switch').is(':checked')
  var tbl = $('#tbl_wrapper'); //element of wrapper table
console.log("check",param)

  apiService.SendRequest(method, mgmt.service, param, function (rs) {
    if (rs.result == "OK") {
      row = { convert_name: $('#convert_name').val(), download_name: $("#download_name option:selected").text() };
      if (typeof mgmt.row_data !== 'undefined') {
        console.log("Edit");
        mgmt.row_data["convert_name"] = $('#convert_name').val();
        mgmt.row_data["download_name"] = $("#download_name option:selected").text();
        mgmt.dataTable.row(mgmt.tr).data(mgmt.row_data).draw();
        bootbox.alert(msg_save_suc, function () {
          $('.add_missing_ctrl').hide();
          tbl.removeClass('hidden');
          $('#mgmt-script-form').addClass('hidden');
          // window.location.reload()

        })
      } else {
        console.log("Add");
        bootbox.alert(msg_save_suc, function () {
          $('.add_missing_ctrl').hide();
          tbl.removeClass('hidden');
          $('#mgmt-script-form').addClass('hidden');
          window.location.reload()
        })
      }

    }
  })
}
