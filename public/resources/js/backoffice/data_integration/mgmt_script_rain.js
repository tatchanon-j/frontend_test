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
mgmt.init = function (translator) {
  mgmt.option = {};
  mgmt.translator = translator
  mgmt.service = "thaiwater30/backoffice/dataimport_config_migrate/dataimport_download"
  mgmt.service_copy = "thaiwater30/backoffice/dataimport_config_migrate/dataimport_download_copy"
  mgmt.service_iscronenabled = "thaiwater30/backoffice/dataimport_config_migrate/iscronenabled"
  mgmt.service_updatecron = "dataimport/rdl/node0/cron"
  mgmt.service_dataimport_download = 'dataimport/rdl/node0/download'
  mgmt.service_run = 'thaiwater30/backoffice/dataimport_config/ps/'
  // mgmt.service_run = 'dataimport/rdl/node0/ps'
  mgmt.deleteRow = "";
  mgmt.table = $('#tbl');
  mgmt.dataTable = mgmt.table.DataTable({
    dom: 'frl<"activebtn">Btip',
    buttons: [{
      text: ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + btn_add_script,
      action: mgmt.addMetadata
    }],
    language: g_dataTablesTranslator,
    columns: [{
      data: 'id',
    }, {
      data: mgmt.download_name,
    }, {
      data: mgmt.download_method,
    }, {
      data: mgmt.description,
    }, {
      data: mgmt.renderStatus,
    }, {
      data: mgmt.crond_command
    }, {
      data: mgmt.renderEditBtn
    }],
    order: [],
    initComplete: function(){
      $("div.activebtn").html('<label style="margin-left:10px">สถานะ Cron:</label><select id="selectField" style="width:20%;padding: 1px 10px;margin: 1px;"><option value="">ทั้งหมด</option><option [ngValue]="true">'+status_enable+'</option><option [ngValue]="false">'+status_disable+'</option></select>');
      $('#selectField').on('change', function () {
          mgmt.dataTable.column(4).search($(this).val()).draw();
      })
   },
  });

  mgmt.initEvent();

  apiService.SendRequest('GET', mgmt.service, {}, function (rs) {
    if (rs.result == "OK") {

      mgmt.ddl = rs.data.dataimport_download_list;
      mgmt.download_list = rs.data.dataimport_download_list
      mgmt.handlerDownloadList(rs.data.dataimport_download_list);
      mgmt.handlerSelectOption(rs.data.select_option);
      // Search in select
      $(".select-search").select2({});


    }
  });

  $("#filter_download_type").on("change", function () { mgmt.handlerDownloadList(mgmt.ddl); })

}



/**
* put data into column download name
*
* @param {json} row the data for the whole row
*
* @return {string} download name
*/
mgmt.download_name = function (row) {
  return JH.GetJsonValue(row, 'download_name')
}

mgmt.crond_command = function (row) {
  return "dataimport/bin/rdl " + JH.GetJsonValue(row, 'id') + " " + JH.GetJsonValue(row, 'download_method')
}

/**
* put data into column download method
*
* @param {json} row the data for the whole row
*
* @return {string} download method
*/
mgmt.download_method = function (row) {
  return JH.GetJsonValue(row, 'download_method')
}


/**
* put data into column description
*
* @param {json} row the data for the whole row
*
* @return {string} description
*/
mgmt.description = function (row) {
  return JH.GetJsonValue(row, 'description')
}


/**
* put data into column status
*
* @param {json} row the data for the whole row
*
* @return {string} status
*/
mgmt.renderStatus = function (row) {
  var s = '<font color="red">' + status_disable + '</font>'; //status with text red color

  if (JH.GetJsonValue(row, "is_cronenabled") == true) {
    s = '<font color="green">' + status_enable + '</font>'; ////status with text green color
  }
  return s;
}


/**
* put data into column buttons
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
* @return {string} element of buttons
*/
mgmt.renderEditBtn = function (row, type, set, meta) {
  // return '<i class="btn btn-copy" title="'+mgmt.translator['msg_copy']+'" data-id="'+row.id+'"></i><i class="btn btn-view" title="view json" data-name="viewJson" data-id="'+row.id+'"></i><i class="btn btn-edit" data-id="'+row["id"]+'"></i></i><i class="btn btn-delete" title="delete"></i>';
  if (row.is_run == true) {
    return '<i class="btn btn-copy" data-row="' + meta.row + '" title="' + mgmt.translator['msg_copy'] + '" data-id="' + row.id + '"></i>' +
      '<i class="btn btn-view" data-row="' + meta.row + '" title="view json" data-name="viewJson" data-id="' + row.id + '"></i>' +
      '<i class="btn btn-play" data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="play"></i>' +
      '<i class="btn btn-pause" data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="pause"></i>' +
      '<i class="btn btn-edit" data-row="' + meta.row + '" data-id="' + row["id"] + '"></i>' +
      '<i class="btn btn-view-data" data-row="' + meta.row + '" title="view data" data-name="viewData" data-id="' + row["id"] + '"></i>' +

      '<i class="btn btn-delete" style="padding-left:20px;" data-row="' + meta.row + '" title="delete"></i>';
  } else {
    return '<i class="btn btn-copy" data-row="' + meta.row + '" title="' + mgmt.translator['msg_copy'] + '" data-id="' + row.id + '"></i>' +
      '<i class="btn btn-view" data-row="' + meta.row + '" title="view json" data-name="viewJson" data-id="' + row.id + '"></i>' +
      '<i class="btn " data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="play"></i>' +
      '<i class="btn btn-pause" data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="pause"></i>' +
      '<i class="btn btn-edit" data-row="' + meta.row + '" data-id="' + row["id"] + '"></i>' +
      '<i class="btn btn-view-data" data-row="' + meta.row + '" title="view data" data-name="viewData" data-id="' + row["id"] + '"></i>' +

      '<i class="btn btn-delete" style="padding-left:20px;" data-row="' + meta.row + '" title="delete"></i>';
  }
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

  mgmt.table.on('click', '.btn.btn-play', mgmt.btnPlayClick)
  mgmt.table.on('click', '.btn.btn-pause', mgmt.btnPauseClick)

  var form = $('#mgmt-script-form');
  form.on('click', '.source_option-tab', mgmt.sourceOptionTabClick);
  form.on('click', '.rm-tab-source_option', mgmt.removeSourceOptionTabClick);
  form.on('click', '.add-source_option', mgmt.addSourceOptionClick);

  form.on('click', '.detail-tab', mgmt.detailTabClick);
  form.on('click', '.rm-tab-detail', mgmt.removeDetailTabClick);
  form.on('click', '.add-detail', mgmt.addDetailClick);
  form.on('change', '.download_driver', mgmt.downloadDriverChange);

  form.on('click', '.file-tab', mgmt.fileTabClick); 
  form.on('click', '.rm-tab-file', mgmt.removeFileTabClick);
  form.on('click', '.add-file', mgmt.addFileClick);

  var form_data = $('#mgmt-data-form');
  form_data.on('click', '.source_option-tab', mgmt.sourceOptionTabClick2);
  // form_data.on('click', '.rm-tab-source_option', mgmt.removeSourceOptionTabClick);
  // form_data.on('click', '.add-source_option', mgmt.addSourceOptionClick);

  form_data.on('click', '.detail-tab', mgmt.detailTabClick2);
  // form_data.on('click', '.rm-tab-detail', mgmt.removeDetailTabClick);
  // form_data.on('click', '.add-detail', mgmt.addDetailClick);
  // form_data.on('change', '.download_driver', mgmt.downloadDriverChange);

  // form_data.on('click', '.file-tab', mgmt.fileTabClick);
  // form_data.on('click', '.rm-tab-file', mgmt.removeFileTabClick);
  // form_data.on('click', '.add-file', mgmt.addFileClick);

  $('#download_method').on('change', mgmt.downloadScriptOnChange);
  $('#btn-cancel').on('click', mgmt.hideForm);
  $('#btn-save').on('click', mgmt.btnSaveClick);
  $('#btn-delete').on('click', mgmt.btnDeleteConFirmClick);
}


/**
* prepare data to edit.
*
*/
mgmt.btnEditClick = function () {
  var btn_view = $(this).attr('data-name'); //data name
  var id = $(this).attr('data-id'); //script id
  var row = $(this).attr('data-row'); //row number
  var node = mgmt.download_list[row].node; //node

  mgmt.tr = $(this).closest('tr');
  mgmt.selectedRow = mgmt.dataTable.row(mgmt.tr);
  mgmt.row_data = mgmt.dataTable.row(mgmt.tr).data();
  mgmt.node = node;
  mgmt.service_updatecron = "dataimport/rdl/" + node + "/cron"

  if (!node) {
    mgmt.service_updatecron = "dataimport/rdl/node0/cron"
  }
  apiService.SendRequest("GET", mgmt.service + "/" + id, {}, function (rs) {
    if (rs.result != "OK") { return false; }

    if (btn_view == "viewJson") {
      mgmt.showJson(id, rs.data);
      return false
    }

    if (btn_view == "viewData") {

      $('select[id="download_method_data"]').prop('disabled', 'disabled')
      $('select[id="agent_user_data"]').attr('disabled', 'disabled');
      $('select[name="import_method_data"]').prop('disabled', 'disabled');
      $('select[name="input_name_data"]').attr('disabled', 'disabled');
      $('select[name="node_data"]').attr('disabled', 'disabled');
      $('select[name="download_driver"]').attr('disabled', 'disabled');
      $('select[name="name"]').attr('disabled', 'disabled');
      $('select[name="transform_method"]').attr('disabled', 'disabled');
      $('select[name="is_dateonly_pf"]').attr('disabled', 'disabled');
      $('select[name="is_hot_migration_mode"]').attr('disabled', 'disabled');
      $('select[name="add_missing"]').attr('disabled', 'disabled');
      $('select[name="input_format_date"]').attr('disabled', 'disabled');
      $('select[name="download_name_data"]').attr('disabled', 'disabled');
      $('input[id="download_name"]').prop('disabled', true);
      $('input[id="description"]').prop('disabled', true);
      $('input[id="data_folder"]').prop('disabled', true);
      $('input[id="crontab_setting"]').prop('disabled', true);
      $('input[name="max_process"]').prop('disabled', true);
      $('textarea').prop('disabled', true);
      $('input[name="name"]').prop('disabled', true);
      $('input[name="retry_count"]').prop('disabled', true);
      $('input[name="detail_host"]').prop('disabled', true);
      $('input[name="table_name"]').prop('disabled', true);
      $('input[name="partition_field"]').prop('disabled', true);
      $('input[name="last_update_field"]').prop('disabled', true);
      $('input[name="data_limit_hours"]').prop('disabled', true);
      $('input[name="output_filtname"]').prop('disabled', true);

      mgmt.showData(id, rs.data);
      return false
    }

    $('select[id="download_method_data"]').prop('disabled', 'disabled')
      $('select[id="agent_user_data"]').attr('disabled', 'disabled');
      $('select[name="import_method_data"]').prop('disabled', 'disabled');
      $('select[name="input_name_data"]').attr('disabled', 'disabled');
      $('select[name="node_data"]').attr('disabled', 'disabled');
      $('select[name="download_driver"]').attr('enabled', 'enabled');
      $('select[name="name"]').attr('disabled', 'disabled');
      $('select[name="transform_method"]').attr('disabled', 'disabled');
      $('select[name="is_dateonly_pf"]').attr('disabled', 'disabled');
      $('select[name="is_hot_migration_mode"]').attr('disabled', 'disabled');
      $('select[name="add_missing"]').attr('disabled', 'disabled');
      $('select[name="input_format_date"]').attr('disabled', 'disabled');
      $('select[name="download_name_data"]').attr('disabled', 'disabled');
      $('input[id="download_name"]').prop('disabled', false);
      $('input[id="description"]').prop('disabled', false);
      $('input[id="data_folder"]').prop('disabled', false);
      $('input[id="crontab_setting"]').prop('disabled', false);
      $('input[name="max_process"]').prop('disabled', false);
      $('textarea').prop('disabled', false);
      $('input[name="name"]').prop('disabled', false);
      $('input[name="retry_count"]').prop('disabled', false);
      $('input[name="detail_host"]').prop('disabled', false);
      $('input[name="table_name"]').prop('disabled', false);
      $('input[name="partition_field"]').prop('disabled', false);
      $('input[name="last_update_field"]').prop('disabled', false);
      $('input[name="data_limit_hours"]').prop('disabled', false);
      $('input[name="output_filtname"]').prop('disabled', false);


    mgmt.showForm(id, rs.data);
    mgmt.node = $("#node").val()
  })
  // apiService.SendRequest("GET", mgmt.service_updatecron, {}, function (rs) {
  //   var data_result = apiService.getFieldValue(rs, 'result');
  //   if (data_result == null) { return }
  //   for (var i = 0; i < data_result.length; i++) {
  //     if (JH.GetJsonValue(data_result[i], "download_id") == id) {
  //       $('#max_process').val(JH.GetJsonValue(data_result[i], "max_process"));
  //       return false;
  //     }
  //   }
  // })

}


/**
* display json data of on modal.
*
* @param {string} id script id
* @param {json} rs the download setting data
*
*/
mgmt.showJson = function (id, rs) {
  var form = $('#dlgDatajson-form'); //the element of form to display script with json

  form.find('#dlgDatajson-down-json').val(JSON.stringify(GetJsonValue(rs, "download_setting")));
  $('#dlgDatajson').modal({
    backdrop: 'static'
  })
}


/**
* clone data to to create new data.
*
*/
mgmt.btnCopy = function () {
  var id = $(this).attr('data-id'); // script id
  var param = {
    download_id: parseInt(id)
  }; //parameter to copy script

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
              return true
            }
          })
          //location.reload();
        });
        //return true
      }
    }
  })
}


/**
* source_option tab click
*
*/
mgmt.sourceOptionTabClick = function () {
  var source_optionTabs = $(this).closest('ul.source_option-tabs'); //source optoin tabs element
  var source_optionTabContent = source_optionTabs.next('div.source_option-tab-content'); //content element in source option tabs
  var li = $(this).closest('li'); //le element
  var index = li.index(); //index of element

  source_optionTabContent.children('div.tab-pane.active').removeClass('active');
  source_optionTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
  current["source_option"] = index;
}

mgmt.sourceOptionTabClick2 = function () {
  var source_optionTabs = $(this).closest('ul.source_option-tabs'); //source optoin tabs element
  var source_optionTabContent = source_optionTabs.next('div.source_option-tab-content'); //content element in source option tabs
  var li = $(this).closest('li'); //le element
  var index = li.index(); //index of element

  source_optionTabContent.children('div.tab-pane.active').removeClass('active');
  source_optionTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
  current["source_option"] = index;
}


/**
* btn remove source_option tab click
*
*/
mgmt.removeSourceOptionTabClick = function () {
  var source_optionTabs = $(this).closest('ul.source_option-tabs'); //source option tabs element
  var source_optionTabContent = source_optionTabs.next('div.source_option-tab-content'); //content element in source option  tbas
  var li = $(this).closest('li'); //li element
  var index = li.index(); //index of li element
  var lastLi = source_optionTabs.children('li:not(.add-tab):last'); //last li element
  var lastIndex = lastLi.index(); //index of last li element

  lastLi.remove();
  source_optionTabContent.children('.tab-pane:eq(' + index + ')').remove();

  if (index == current["source_option"]) { current["source_option"] = -1; }
  if (index == lastIndex) { index--; }
  source_optionTabs.children('li:eq(' + index + ')').children('a').trigger('click');
}


/**
* add form in source option tab
*
* @return {string}  source option
*
*/
mgmt.addSourceOptionClick = function () {
  var so = mgmt.addSourceOption($(this)); //add source option
  var dt = mgmt.addDetail(so.find('li.add-tab')); //add detail

  mgmt.addFile(dt.find('li.add-tab'));
  return so
}


/**
* add tab of sorce option.
*
* @param {string} el
*
* @return {string}  source option
*
*/
mgmt.addSourceOption = function (el) {
  var ltLast = el.closest('.add-tab'); //button add new tabs element
  var source_optionTabs = ltLast.closest('ul.source_option-tabs'); //source option tabs element
  var source_optionTabContent = source_optionTabs.next('div.source_option-tab-content'); //conten element in source option tabs
  var index = ltLast.index(); //index of button add new tabs

  index++;
  // add source_option tab
  ltLast.before('<li class="nav-item"><a href="#" class="source_option-tab nav-link" data-toggle="tab">source_option#' + index + '</a><span class="rm-tab-source_option">x</span></li>');
  // add source_option tab-content
  var newContent = $('#pane-source_option-master').clone().removeClass('hidden').removeAttr('id');
  source_optionTabContent.append(newContent);

  source_optionTabs.find('.source_option-tab:last').trigger('click');

  source_optionTabContent.find('input[name="name"]').keypress(function (event) {
    var ew = event.which;
    if (ew >= 32 && ew <= 126) {
      return true;
    } else if (ew === 8) {
      return true;
    }
    return false;
  });

  return newContent;
}


/**
* detail tab click
*
*/
mgmt.detailTabClick = function () {
  var detailTabs = $(this).closest('ul.detail-tabs'); //detail tabs element
  var detailTabContent = detailTabs.next('div.detail-tab-content'); //content element in detail tabs
  var li = $(this).closest('li'); //li element
  var index = li.index(); //index of li element

  detailTabContent.children('div.tab-pane.active').removeClass('active');
  detailTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
  current["detail"] = index;
}

mgmt.detailTabClick2 = function () {
  var detailTabs = $(this).closest('ul.detail-tabs'); //detail tabs element
  var detailTabContent = detailTabs.next('div.detail-tab-content'); //content element in detail tabs
  var li = $(this).closest('li'); //li element
  var index = li.index(); //index of li element

  detailTabContent.children('div.tab-pane.active').removeClass('active');
  detailTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
  current["detail"] = index;
}

/**
* btn remove detail tab click
*
*/
mgmt.removeDetailTabClick = function () {
  var detailTabs = $(this).closest('ul.detail-tabs'); //detail tabs element
  var detailTabContent = detailTabs.next('div.detail-tab-content'); // contene element in tabs detail
  var li = $(this).closest('li'); //li element
  var index = li.index(); //index of li element
  var lastLi = detailTabs.children('li:not(.add-tab):last'); // last li element
  var lastIndex = lastLi.index(); //

  lastLi.remove();
  detailTabContent.children('.tab-pane:eq(' + index + ')').remove();

  if (index == current["detail"]) { current["detail"] = -1; }
  if (index == lastIndex) { index--; }
  detailTabs.children('li:eq(' + index + ')').children('a').trigger('click');
}


/**
* get data for add tab of detail.
*
* @return {string} element detail
*
*/
mgmt.addDetailClick = function () {
  var dt = mgmt.addDetail($(this));
  return dt;
}


/**
* add tab of detail.
*
* @param {json} XXX
*
* @return {string} element detail
*
*/
mgmt.addDetail = function (el) {
  var ltLast = el.closest('.add-tab'); //buton add new tabs
  var detailTabs = ltLast.closest('ul.detail-tabs'); //detail tabs element
  var detailTabContent = detailTabs.next('div.detail-tab-content'); //content element in detail tab contet
  var index = ltLast.index(); //index of lt

  index++;
  // add detail tab
  ltLast.before('<li class="nav-item"><a href="#" class="detail-tab nav-link" data-toggle="tab">detail#' + index + '</a></li>');
  // add detail tab-content
  var newContent = $('#pane-detail-master').clone().removeClass('hidden').removeAttr('id');
  newContent.find('select').removeAttr('id');
  newContent.find('select.metadata_select').multiselect({ enableFiltering: true });
  detailTabContent.append(newContent);

  detailTabs.find('.detail-tab:last').trigger('click');
  return newContent;
}


/**
* download driver change
*
*/
mgmt.downloadDriverChange = function () {
  var tabPane = $(this).closest('div.tab-pane'); //tab pane element
  var v = $(this).val(); // driver
  var download_driver = $('.download_driver').val(); //download_driver data
  var o = mgmt.option["download_driver"][v]; //download_driver

  if (typeof o === "undefined") { return false; }
  tabPane.find('.download_driver_ctrl').hide();
  if (typeof o["enable"] !== "undefined") { tabPane.find('.download_driver_ctrl_' + o["enable"]).show(); }
  mgmt.driver_relate(download_driver)
}


/**
*  display or hide form in put data, which relate with data selected on dropdown driver
*
* @param {json} dl driver
*
*/
mgmt.driver_relate = function (dl) {
  if (dl == 'pqmigrate://') {
    $('.pqmigrate').show();
    $('.pqtransform').hide();
    $('.div-sql').show();
    $('.no_driver').hide();
  } else if (dl == 'pqtransform://') {
    $('.pqmigrate').hide();
    $('.pqtransform').show();
    $('.div-sql').show();
    $('.no_driver').hide();
  } else {
    $('.pqmigrate').hide();
    $('.pqtransform').hide();
    $('.div-sql').hide();
    $('.no_driver').show();
  }
}


/**
* file tab click
*
*/
mgmt.fileTabClick = function () {
  var fileTabs = $(this).closest('ul.file-tabs'); //file tabs element
  var fileTabContent = fileTabs.next('div.file-tab-content'); //content element in tab content
  var li = $(this).closest('li'); //li element
  var index = li.index(); //index of li element

  fileTabContent.children('div.tab-pane.active').removeClass('active');
  fileTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
  current["file"] = index;
}


/**
* btn remove file tab click
*
*/
mgmt.removeFileTabClick = function () {
  var fileTabs = $(this).closest('ul.file-tabs'); //file tabs element
  var fileTabContent = fileTabs.next('div.file-tab-content'); //content element in tab content
  var li = $(this).closest('li'); //li element
  var index = li.index(); // index of li element
  var lastLi = fileTabs.children('li:not(.add-tab):last'); //last li element
  var lastIndex = lastLi.index(); //index of last li element

  lastLi.remove();
  fileTabContent.children('.tab-pane:eq(' + index + ')').remove();

  if (index == current["file"]) { current["file"] = -1; }
  if (index == lastIndex) { index--; }
  fileTabs.children('li:eq(' + index + ')').children('a').trigger('click');
}


/**
* add file tab
*
*/
mgmt.addFileClick = function () {
  mgmt.addFile($(this));
}


/**
* add new tab of file.
*
* @param {string} el element name
*
* @return {string} element of new content
*/
mgmt.addFile = function (el) {
  var ltLast = el.closest('.add-tab'); //button add new tabs element
  var fileTabs = ltLast.closest('ul.file-tabs'); //file tabs element
  var fileTabContent = fileTabs.next('div.file-tab-content'); //content element in file tab
  var index = ltLast.index(); //index of button add new tabs element

  index++;
  // add file tab
  ltLast.before('<li class="nav-item"><a href="#" class="file-tab nav-link" data-toggle="tab">file#' + index + '</a><span class="rm-tab-file">x</span></li>');
  // add file tab-content
  var newContent = $('#pane-file-master').clone().removeClass('hidden').removeAttr('id');
  fileTabContent.append(newContent);

  fileTabs.find('.file-tab:last').trigger('click');
  return newContent;
}


/**
* download_type on change
*
*/
mgmt.downloadScriptOnChange = function () {
  var v = $(this).val(); //download method
  $('.dl_script_ctrl').hide();
  var o = mgmt.option["download_method"][v]; //download method
  if (typeof o === "undefined") { return false; }
  if (typeof o["enable"] !== "undefined") { $('.dl_script_ctrl_' + o["enable"]).show(); }
}


/**
* add data to table.
*
* @param {json} rs download list data
*
*/
mgmt.handlerDownloadList = function (rs) {
  var arrData = [];
  var download_type = $("#filter_download_type").val();

  for (var i = 0; i < rs.length; i++) {
    var data = rs[i];
    var dname = (data.download_name).substr(0, 7);
    if (download_type == "migrate") {
      if (dname == "migrate") {
        arrData.push(data)
      }
    }
    else if (download_type == "normal") {
      if (dname !== "migrate") {
        arrData.push(data)
      }
    }
    else {
      arrData.push(data);
    }
  }

  mgmt.dataTable.clear();
  mgmt.dataTable.rows.add(arrData);
  mgmt.dataTable.draw();
}


/**
* prepare data to generate option.
*
* @param {json} rs option data
*
*/
mgmt.handlerSelectOption = function (rs) {
  mgmt.SelectOption = rs;
  mgmt.genSelect('download_method', rs["download_method"]);
  mgmt.genSelect('download_driver', rs["download_driver"]);
  mgmt.genSelect('agent_user', rs["agent_user"]);
  mgmt.genSelect('node', rs["rdl_nodes"]);
  mgmt.genSelect('agent_user_data', rs["agent_user"]);
  mgmt.genSelect('download_method_data', rs["download_method"]);
  mgmt.genSelect('node_data', rs["rdl_nodes"]);
}


/**
* generate optin into dropdown.
*
* @param {string} el element name
* @param {json} rs option list data
*
*/
mgmt.genSelect = function (el, rs) {
  var select = document.getElementById(el); //dropdown element
  var data_result = apiService.getFieldValue(rs, 'data'); //option list data

  if (data_result == null) { return }
  if (typeof rs === "undefined") { return false; }
  if (typeof mgmt.option[el] === "undefined") { mgmt.option[el] = {}; }
  if (rs.result != "OK") { return false; }

  for (var i = 0; i < rs.data.length; i++) {
    var data = rs.data[i];
    var option = document.createElement("option");
    var txt_option = data["text"];
    var val_option = data["value"];
    mgmt.option[el][val_option] = data;

    option.text = txt_option;
    option.value = val_option;
    select.add(option);
  }
}


/**
* display form add data.
*
*/
mgmt.addMetadata = function () {
  mgmt.showForm();
}


/**
* display form add or edit data.
*
* @param {string} id id of script data
* @param {json} d script data
*
*/
mgmt.showForm = function (id, d) {
  $('.data-filters').hide();
  $('#mgmt-script-form').parsley().reset();
  mgmt.data = {};
  mgmt.isEdit = false;
  if (typeof d !== "undefined") { mgmt.data = d; mgmt.dataId = id; mgmt.isEdit = true; }
  var form = $('#mgmt-script-form');
  var frm_detail = $('.tab-pane');
  form.find('.source_option-tabs > li:not(.add-tab)').remove();
  form.find('.source_option-tab-content').empty();

  form.find('.ci-tabs > li:not(.add-tab)').remove();
  form.find('.ci-tab-content').empty();

  $('#tbl_wrapper').addClass('hidden');
  form[0].reset();
  form.removeClass('hidden');
  form.find('#download_method').triggerHandler('change')
  var dl = frm_detail.find('select[name="download_driver"]').val()
  mgmt.driver_relate(dl)
  frm_detail.find('select[name="download_driver"]').trigger('change');
  if (!mgmt.isEdit) {
    $('#btn-on-off').hide();
    $('.switch').hide();
    mgmt.addSourceOption(form.find('.add-source_option'));
    mgmt.addDetail(form.find('.add-detail'));
    mgmt.addFile(form.find('.add-file'));

    return false;
  }

  // Button switch on-off crontab setting
  var is_cronenable = JH.GetJsonValue(d, "is_cronenabled");
  if (is_cronenable == true) {
    $('#cron-switch').bootstrapToggle('on')
  } else {
    $('#cron-switch').bootstrapToggle('off')
  }

  $('#btn-on-off').show();
  $('.switch').show();

  // in edit mode
  // load source_options
  var ds = JH.GetJsonValue(d, "download_setting");
  form.find('#download_id').val(JH.GetJsonValue(d, "id"));
  form.find('#download_method').val(JH.GetJsonValue(d, "download_method")).triggerHandler('change');
  form.find('#download_name').val(JH.GetJsonValue(d, "download_name"));
  form.find('#crontab_setting').val(JH.GetJsonValue(d, "crontab_setting"));
  form.find('#node').val(JH.GetJsonValue(d, "node"));
  form.find('#description').val(JH.GetJsonValue(d, "description"));
  form.find('#agent_user').val(JH.GetJsonValue(d, "agent_user_id")).triggerHandler('change');
  form.find('#max_process').val(JH.GetJsonValue(d, "max_process"));
  form.find('#archive_folder').val(JH.GetJsonValue(ds, "archive_folder"));
  form.find('#result_file').val(JH.GetJsonValue(ds, "result_file"));
  form.find('#data_folder').val(JH.GetJsonValue(ds, "data_folder"));

  mgmt.loadEditSourceOption(form, JH.GetJsonValue(ds, "source_options"));

}

mgmt.showData = function (id, d) {
  $('.data-filters').hide();
  $('#mgmt-data-form').parsley().reset();
  mgmt.data = {}; 
  mgmt.isEdit = false;
  if (typeof d !== "undefined") { mgmt.data = d; mgmt.dataId = id; mgmt.isEdit = true; }
  var form = $('#mgmt-data-form');
  var frm_detail = $('.tab-pane');
  form.find('.source_option-tabs > li:not(.add-tab)').remove();
  form.find('.source_option-tab-content').empty();

  form.find('.ci-tabs > li:not(.add-tab)').remove();
  form.find('.ci-tab-content').empty();

  // $('#tbl_wrapper').addClass('hidden');
  form[0].reset();
  form.removeClass('hidden');
  form.find('#download_method').triggerHandler('change')
  var dl = frm_detail.find('select[name="download_driver"]').val()
  mgmt.driver_relate(dl)
  frm_detail.find('select[name="download_driver"]').trigger('change');
  // if (!mgmt.isEdit) {
  //   $('#btn-on-off').hide();
  //   $('.switch').hide();
  //   mgmt.addSourceOption(form.find('.add-source_option'));
  //   mgmt.addDetail(form.find('.add-detail'));
  //   mgmt.addFile(form.find('.add-file'));

  //   return false;
  // }

  // Button switch on-off crontab setting
  var is_cronenable = JH.GetJsonValue(d, "is_cronenabled");
  if (is_cronenable == true) {
    $('#ShowData #cron-switch').bootstrapToggle('on')
  } else {
    $('#ShowData #cron-switch').bootstrapToggle('off')
  }
  $('#ShowData #cron-switch').prop('disabled', true);


  $('#btn-on-off').show();
  $('.switch').show();

  // in edit mode
  // load source_options
  var ds = JH.GetJsonValue(d, "download_setting");
  form.find('#download_id').val(JH.GetJsonValue(d, "id"));
  form.find('#download_method').val(JH.GetJsonValue(d, "download_method")).triggerHandler('change');
  form.find('#download_name').val(JH.GetJsonValue(d, "download_name"));
  form.find('#crontab_setting').val(JH.GetJsonValue(d, "crontab_setting"));
  form.find('#node').val(JH.GetJsonValue(d, "node"));
  form.find('#description').val(JH.GetJsonValue(d, "description"));
  form.find('#agent_user').val(JH.GetJsonValue(d, "agent_user_id")).triggerHandler('change');
  form.find('#max_process').val(JH.GetJsonValue(d, "max_process"));
  form.find('#archive_folder').val(JH.GetJsonValue(ds, "archive_folder"));
  form.find('#result_file').val(JH.GetJsonValue(ds, "result_file"));
  form.find('#data_folder').val(JH.GetJsonValue(ds, "data_folder"));

  mgmt.loadEditSourceOption(form, JH.GetJsonValue(ds, "source_options"));

  $('#ShowData').modal({
    backdrop : 'static'
  })

}


/**
* put data into form source option tab.
*
* @param {string} form elemet of tabs
* @param {json} so source option list data
*
*/
mgmt.loadEditSourceOption = function (form, so) {
  var name = "";
  if (typeof so === undefined || so == null) { return false }
  for (var i = 0; i < so.length; i++) {
    var s = so[i]; //source option data
    var paneSource = mgmt.addSourceOption(form.find('.add-source_option')); //pane source element

    paneSource.find('input[name="retry_count"]').val(JH.GetJsonValue(s, "retry_count"));
    paneSource.find('input[name="name"]').val(JH.GetJsonValue(s, "name"));
    var details = JH.GetJsonValue(s, "details"); //detail

    if (typeof details === undefined || details == null) { return false }
    for (var j = 0; j < details.length; j++) {
      var detail = details[j]; //detail
      var paneDetail = mgmt.addDetail(paneSource.find('.add-detail')); //pane detail
      var host = JH.GetJsonValue(detail, "host").split("://"); //host
      var hostUrl = host[1]; //hostUrl

      paneDetail.find('.download_driver').val(host[0] + "://").trigger('change');

      paneDetail.find('.table_name').val(JH.GetJsonValue(detail['params'], "table_name"));
      paneDetail.find('.partition_field').val(JH.GetJsonValue(detail['params'], "partition_field"));
      paneDetail.find('.is_dateonly_pf').val(JH.GetJsonValue(detail['params'], "is_dateonly_partition_field").toString());
      paneDetail.find('.last_update_field').val(JH.GetJsonValue(detail['params'], "last_updated_field"));
      paneDetail.find('.is_hot_migration_mode').val(JH.GetJsonValue(detail['params'], "is_hot_migration_mode").toString());
      paneDetail.find('.data_limit_hours').val(JH.GetJsonValue(detail['params'], "data_limit_hours"));
      paneDetail.find('.sql').val(JH.GetJsonValue(detail['params'], "sql"));
      paneDetail.find('.output_filtname').val(JH.GetJsonValue(detail['params'], "output_filename"));

      if (paneDetail.find('.download_driver_ctrl').is(":visible")) {
        var u_h = hostUrl.split("@"); // add @ in host
        var user_pass = u_h[0].split(":"); //add : in username and password
        paneDetail.find('input[name="username"]').val(user_pass[0]);
        paneDetail.find('input[name="password"]').val(user_pass[1]);
        hostUrl = u_h[1];
      }
      paneDetail.find('.detail_host').val(hostUrl);
      var files = JH.GetJsonValue(detail, "files"); //files

      if (typeof files === undefined || files == null) { return false }
      for (var k = 0; k < files.length; k++) {
        var file = files[k];
        var paneFile = mgmt.addFile(paneDetail.find('.add-file'));
        paneFile.find('input[name="source"]').val(JH.GetJsonValue(file, "source"));
        paneFile.find('input[name="destination"]').val(JH.GetJsonValue(file, "destination"));
      }
    }

    if (name == "") { name = JH.GetJsonValue(s, "name"); }
  }
  form.find("#name").val(name);
}


/**
* hidden form when click to cancel on form add or edit.
*
*
*/
mgmt.hideForm = function () {
  $('.data-filters').show();
  $('#tbl_wrapper').removeClass('hidden');
  $('#mgmt-script-form').addClass('hidden');
}


/**
* save data.
*
*/
mgmt.btnSaveClick = function () {
  var data_update_table = [];
  $('#mgmt-script-form').parsley().validate();

  if (!$('#mgmt-script-form').parsley().isValid()) {
    return false;
  }

  var full_agency = $('#agent_user option:selected').text(); //full agency name
  var pre_agency = full_agency.substring(0, 10); //prefix in agency name

  if (pre_agency == 'dataimport') {
    var agency_param = full_agency.substring(11); //agency for use in parameter
  }

  var download_method_selected = $('#download_method option:selected').val(); //download method id
  var download_id_val = $('#download_id').val(); //download id
  var max_process_val = $('#max_process').val() ? parseInt($('#max_process').val()) : 10; //max process
  var cron_switch = $('#cron-switch').is(':checked')

  var param_cronenabled = {
    dataimport_download_id: download_id_val
  }

  var crontab_setting_val = $('#crontab_setting').val(); //crontab setting

  param_cron = {
    download_id: download_id_val,
    agency: agency_param,
    interval: crontab_setting_val,
    download_script: download_method_selected,
    max_process: max_process_val,
    name: $('#download_name').val(),
    description: $('#description').val()
  }

  var param = mgmt.data; //parameter for save data
  param["is_cronenabled"] = cron_switch;
  param["max_process"] = max_process_val;
  param["download_name"] = $('#download_name').val();
  param["agent_user_id"] = parseInt($('#agent_user').val());
  param["download_method"] = $('#download_method').val();
  param["crontab_setting"] = $('#crontab_setting').val();
  param["description"] = $('#description').val();
  param["download_setting"] = {
    data_folder: $('#data_folder').val(),
    source_options: []
  };
  if ($('#download_method').val() == "dl-collector") {
    param["download_setting"]["archive_folder"] = $('#archive_folder').val();
    if ($('#result_file').val() != "") {
      param["download_setting"]["result_file"] = $('#result_file').val();
    }
  }

  param["node"] = $('#node').val();


  var so = param.download_setting.source_options; //parameter source_options
  var soTabs = $('#mgmt-script-form .source_option-tab-content').children('div.tab-pane'); //tab pane in source option

  if (typeof soTabs === undefined || soTabs == null) { return false }

  for (var i = 0; i < soTabs.length; i++) {
    var soTab = $(soTabs[i]); //tab pane in source option
    var so_o = {
      name: soTab.find('input[name="name"]').val(),
      details: []
    };

    if (soTab.find('input[name="retry_count"]').val() != "") {
      so_o["retry_count"] = parseInt(soTab.find('input[name="retry_count"]').val());
    } //the data to put in source tabs

    var detailTabs = soTab.find('.detail-tab-content').children('div.tab-pane'); //detailTabs

    if (typeof detailTabs === undefined || detailTabs == null) { return false }

    for (var j = 0; j < detailTabs.length; j++) {
      var detailTab = $(detailTabs[j]); //detailTabs
      var detail_o = {
        host: detailTab.find('select[name="download_driver"]').val() + detailTab.find('input[name="detail_host"]').val(),
        files: []
      }

      if (detailTab.find('.download_driver_ctrl').is(':visible')) {
        var user_pass = detailTab.find('input[name="username"]').val() + ":" + detailTab.find('input[name="password"]').val();
        detail_o["host"] = detail_o["host"].replace("://", "://" + user_pass + "@");
      } //the data to put in detailTabs

      var filesTabs = detailTab.find('.file-tab-content').children('div.tab-pane'); //filesTabs

      if (typeof filesTabs === undefined || filesTabs == null) { return false }

      for (var k = 0; k < filesTabs.length; k++) {
        var filesTab = $(filesTabs[k]); //filesTab
        var files_o = {
          source: filesTab.find('input[name="source"]').val(),
          destination: filesTab.find('input[name="destination"]').val()
        } //the data to put in filesTab

        detail_o["files"].push(files_o);
      }

      var d_params = {}; //param for detail tab
      var download_driver = detailTab.find('select[name="download_driver"]').val(); //download driver

      if (download_driver == 'pqmigrate://') {

        d_params = {
          sql: detailTab.find('.sql').val(),
          table_name: detailTab.find('.table_name').val(),
          partition_field: detailTab.find('.partition_field').val(),
          is_dateonly_partition_field: (detailTab.find('select[name="is_dateonly_pf"]').val() === "true"),
          last_updated_field: detailTab.find('.last_update_field').val(),
          is_hot_migration_mode: (detailTab.find('select[name="is_hot_migration_mode"]').val() === "true"),
          data_limit_hours: detailTab.find('.data_limit_hours').val() ? parseInt(detailTab.find('.data_limit_hours').val()) : 1,
        }
      }

      if (download_driver == 'pqtransform://') {
        d_params = {
          sql: detailTab.find('.sql').val(),
          output_filename: detailTab.find('.output_filtname').val()
        }
      }

      detail_o['params'] = d_params;
      so_o["details"].push(detail_o);
    };


    so.push(so_o);
  }
  var method = "POST";
  mgmt.service_dataimport_download = 'dataimport/rdl/node0/download'
  if (mgmt.isEdit) {
    method = "PUT";
    mgmt.service_dataimport_download = "dataimport/rdl/" + mgmt.node + "/download"

    if (!mgmt.node) {
      mgmt.service_dataimport_download = 'dataimport/rdl/node0/download'
    }
  }

  console.log('param',param)

  apiService.SendRequest(method, mgmt.service, param, function (rs, data) {
    var json_data = rs.data; //initial script data
    // apiService.SendRequest('POST', mgmt.service_dataimport_download, json_data, function (data) {
    //   if (data.result !== true) {
    //     return false
    //   }

      if (method == 'POST') {
        bootbox.alert(msg_save_suc, function () {
          location.reload();
          return false
        })
      }

      if (rs.result == "OK" && method == "PUT") {
        var form = $('#tbl_wrapper'); //element of wrapper table

        form.removeClass('hidden');
        $('#mgmt-script-form').addClass('hidden');
        if (mgmt.selectedRow) {
          var data = mgmt.selectedRow.data();
          data["download_name"] = $('#download_name').val();
          data["download_method"] = $('#download_method').val();
          data["description"] = $('#description').val();
          data["is_cronenabled"] = cron_switch;
          mgmt.selectedRow.data(data).draw();
          mgmt.selectedRow = null;
          location.reload();
      }
      bootbox.alert(msg_save_suc, function () {})
        // var cron_switch = $('#cron-switch').is(':checked')

        // if (typeof mgmt.row_data !== 'undefined') {
        //   mgmt.row_data["download_name"] = $('#download_name').val();
        //   mgmt.row_data["download_method"] = $('#download_method').val();
        //   mgmt.row_data["crontab_setting"] = $('#crontab_setting').val();
        //   mgmt.row_data["description"] = $('#description').val();
        //   mgmt.row_data["is_cronenabled"] = cron_switch;
        // }

        // // Turn on
        // if (cron_switch == true) {
        //   param_cronenabled['is_cronenabled'] = true;
        //   apiService.SendRequest('PUT', mgmt.service_iscronenabled + "/" + download_id_val, param_cronenabled, function (op) {
        //     if (op.result !== 'OK') {
        //       return false
        //     }
        //     apiService.SendRequest('POST', mgmt.service_updatecron, param_cron, function (op) {
        //       if (op.result !== true) {
        //         return false
        //       }

        //       mgmt.dataTable.row(mgmt.tr).data(mgmt.row_data).draw();
        //       bootbox.alert(msg_save_suc, function () {
        //         //location.reload();

        //       })
        //     })
        //   })
        // } //end if
        // // Trun off
        // else {
        //   param_cronenabled['is_cronenabled'] = false,
        //     apiService.SendRequest('PUT', mgmt.service_iscronenabled + "/" + download_id_val, param_cronenabled, function (op) {
        //       if (op.result !== 'OK') {
        //         return false
        //       }
        //       apiService.SendRequest('DELETE', mgmt.service_updatecron, param_cron, function (op) {
        //         if (op.result !== true) {
        //           return false
        //         }

        //         mgmt.dataTable.row(mgmt.tr).data(mgmt.row_data).draw();
        //         bootbox.alert(msg_save_suc, function () {
        //           //location.reload();

        //         })
        //       })
        //     })
        // }
      }
    })

  // });
}


/**
* delete data on table.
*
* @param {json} e element data
*
*/
mgmt.btnDeleteClick = function (e) {
  mgmt.deleteRow = mgmt.dataTable.rows($(e.target).closest('tr'));
  var d = mgmt.deleteRow.data()[0];
  var id = JH.GetJsonValue(d, "id");
  var text = JH.GetJsonValue(d, "download_name");
  $('#modal-delete').modal().find('h5').text(modal_delete_title.replace('%s', text));
}


/**
* alert confirm delete data on table.
*
*/
mgmt.btnDeleteConFirmClick = function () {
  if (mgmt.deleteRow == "") { return false; }

  var id = JH.GetJsonValue(mgmt.deleteRow.data()[0], "id"); //script id

  apiService.SendRequest("DELETE", mgmt.service + "/" + id, {}, function (rs) {
    if (rs.result != "OK") { alert(rs.data); return false; }
    mgmt.deleteRow.remove().draw();
    mgmt.deleteRow = "";
    $('#modal-delete').modal('hide');
    bootbox.alert({
      message: msg_delete_suc,
      buttons: {
        ok: {
          label: btn_close
        }
      }
    })
  });
}


/**
* start service for script.s
*
*/
mgmt.btnPlayClick = function () {
  var down_id = parseInt($(this).attr('download-id')); //download id
  var down_med = $(this).attr('download-method'); //download method
  var name = $(this).attr('name'); //script name
  var row = $(this).attr('data-row'); //rwo number
  var node = mgmt.download_list[row].node; //node

  // mgmt.service_run = "dataimport/rdl/" + node + "/ps"
  // if (!node) {
  //   mgmt.service_run = 'dataimport/rdl/node0/ps'
  // }

  var param = {
    download_id: down_id,
    download_script: down_med
  } //parameter for run script

  var s = mgmt.translator['msg_con_run'].replace('%s', name); //message confirm for run script
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
        apiService.SendRequest("POST", mgmt.service_run + down_id, {}, function (data, status, jqxhr) {
          if (data["result"] == "NO") {
            bootbox.alert({
              message: mgmt.translator['msg_run_unsuc'],
              buttons: {
                ok: {
                  label: mgmt.translator['btn_close']
                }
              }
            })
            return false;
          }

          bootbox.alert({
            message: mgmt.translator['msg_run_suc'],
            buttons: {
              ok: {
                label: mgmt.translator['btn_close']
              }
            },
            callback: function () {
            }
          })
        })
        return true
      }
    }
  })
}


/**
* stop service for script.
*
*/
mgmt.btnPauseClick = function () {
  var down_id = parseInt($(this).attr('download-id')); //download id
  var down_med = $(this).attr('download-method'); //download methed
  var name = $(this).attr('name'); //script name
  var row = $(this).attr('data-row'); //row number
  var node = mgmt.download_list[row].node; //node

  // mgmt.service_run = "dataimport/rdl/" + node + "/ps"

  // if (!node) {
  //   mgmt.service_run = 'dataimport/rdl/node0/ps'
  // }
  var param = {
    download_id: down_id
  }

  var s = mgmt.translator['msg_con_pause'].replace('%s', name); //message confirm stop run script

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
        apiService.SendRequest("DELETE", mgmt.service_run + down_id, {}, function (data, status, jqxhr) {

          if (data["result"] == "NO") {
            bootbox.alert({
              message: mgmt.translator['msg_pause_unsuc'],
              buttons: {
                ok: {
                  label: mgmt.translator['btn_close']
                }
              },
              callback: function () {
              }
            })
            return false;
          }

          bootbox.alert({
            message: mgmt.translator['msg_pause_suc'],
            buttons: {
              ok: {
                label: mgmt.translator['btn_close']
              }
            }
          })
        },
          function (jqXHR, textStatus, errorThrown, k, m) {
            var text = jqXHR.responseText; //response text form service
            text = text.split('\n');
            text = text[2];
            text = text.substring(7)

            var ms_err = JSON.parse(text); //message error

            if (ms_err.error) {
              bootbox.dialog({
                message: '<PRE>' + ms_err.error + '</PRE>',
                title: mgmt.translator['msg_title_error'],
                buttons: {
                  danger: {
                    label: apiService.transMessage(mgmt.translator['btn_close']),
                    className: 'btn-danger',
                    callback: function () {
                    }
                  }
                }
              });
            } else {
              apiService.cbServiceAjaxError(mgmt.service_event, jqXHR, textStatus, errorThrown)
            }
          }
        )
        return true
      }
    }
  })
}
