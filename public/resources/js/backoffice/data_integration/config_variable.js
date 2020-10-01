var config_variable = {};
var elementPrefix = '#dlgEdit'; //prefix element id
var dropdown = {}
/**
 * Initial page load.
 *
 * @param {json} translator Text for use on page.
 */
config_variable.init = function (translator) {
  console.log('trans', translator)
  config_variable.translator = translator; //Text for label and message on javascript
  // config_variable.service_node = 'dataimport/rdl/node0/cron';
  config_variable.service = 'thaiwater30/backoffice/dataimport_config/config_variable';
  config_variable.service_list_cat = 'thaiwater30/backoffice/dataimport_config/list_category_variable';

  // config_variable.service_iscronenabled = "thaiwater30/backoffice/dataimport_config/iscronenabled"; //service iscronebled

  //*data table setting
  config_variable.tableCron = 'tbl_variable'; //element id of data table
  ctrl = $('#' + config_variable.tableCron);
  config_variable.dataTable = ctrl.DataTable({
    dom: 'frl<"activebtn">Btip',
    buttons: [{
      text: ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' + TRANS["add_title"],
      action: config_variable.AddDataShow
    }],
    "iDisplayLength": 50,
    "columnDefs": [
      { "className": "dt-center", "targets": "_all" }
    ],
    language: g_dataTablesTranslator,
    columns: [
      {
        defaultContent: '',
        orderable: false,
        searchable: false,
      }, {
        data: 'id',
        visible: false
      }, {
        data: 'category',
      }, {
        data: 'name',
      }, {
        data: 'variable_name',
      }, {
        data: 'value',
      }, {
        data: renderToolButtons,
        orderable: false,
        searchable: false,
      }
    ],
    order: [
      [1, 'asc']
    ],
    initComplete: function () {
      // $("div.activebtn").html('<label style="margin-left:10px">สถานะ Cron:</label><select id="selectField" style="width:20%;padding: 1px 10px;margin: 1px;"><option value="">ทั้งหมด</option><option [ngValue]="true">' +status_disable+'</option><option [ngValue]="false">'+status_enable+'</option></select>');
      // $('#selectField').on('change', function () {
      // var selectedCountry = $(this).children("option:selected").val();
      // config_variable.dataTable.column(6).search($(this).val()).draw();
      // })
    },
  })
  config_variable.dataTable.on('order.dt search.dt', function () {
    config_variable.dataTable.column(0, {
      search: 'applied',
      order: 'applied'
    }).nodes().each(function (cell, i) {
      cell.innerHTML = i + 1;
    });
  }).draw();

  apiService.SendRequest('GET', config_variable.service, '', config_variable.putRenderTable)


  apiService.SendRequest('GET', config_variable.service_list_cat, {}, function (rs) {
    dropdown = rs.data
    console.log('sa',dropdown)
    config_variable.renderListCategory(rs);
    // config_variable.handlerSelectOption(rs.data);

  });

  apiService.SendRequest('GET', config_variable.service, {}, function (rs) {
    config_variable.updateDatatable(rs);
  });

  ctrl.on('click', '.btn-edit', config_variable.btnEditClick);
  ctrl.on('click', 'i.btn-delete', config_variable.deleteCategory)
  $('#dlgEdit-save-btn').on('click', config_variable.btnSaveClick);
  $('#dlgAdd-save-btn').on('click', config_variable.btnSaveClick);
}
config_variable.updateDatatable = function (rs) {
  config_variable.dataTable.clear()
  config_variable.dataTable.rows.add(rs.data)
  config_variable.dataTable.draw()
}

config_variable.putRenderTable = function (rs) {
  config_variable.dataTable.clear();
  if (typeof rs.result === 'undefined') { return false }
  config_variable.dataTable.rows.add(JH.GetJsonValue(rs, 'data'))
  config_variable.dataTable.draw();
}

/**
 * Create icon for edit and delete data on datatable
 *
 * @param {json} row The data of each row on table
 * @param {json}
 * @param {json}
 * @param {json}
 *
 * @return buttons
 */
var renderToolButtons = function (row, type, set, meta) {
  var self = config_variable; //initial data
  /*   if (row.id == 0) {
      s = '' ;
    } else { */
  s = '<i class="btn btn-edit" data-row="' + meta.row + '" title="' + config_variable.translator['btn_edit'] + '"></i>' + '<i class="btn btn-delete"  data-row="' + meta.row + '" title="' + config_variable.translator['btn_delete'] + '"></i>'; //elment buttons on table
  /*   } */
  return s
}


config_variable.editDataShow = function () {
  var row = $(this).attr('data-row'); //row number
  config_variable.showEditCategory(row)
}

config_variable.AddDataShow = function () {
  document.getElementById("dlgAdd-form").reset();
  var jid = '#dlgAdd'; //prefix id of element in form
  $(jid + '-title').text(config_variable.translator['title_add_config_variable']);
  var frm = $(jid + '-form'); //element form
  frm.parsley().reset()
  $("#id").val('');
  $("#category").val();
  $("#name").val('');
  $("#variable").val('');
  $('#value').val('');
  $("#dlgAdd").modal("show");

}
config_variable.btnEditClick = function () {
  var table = $("#tbl_variable").DataTable();
  config_variable.rowEdit = table.row($(this).closest("tr"));
  rowData = config_variable.rowEdit.data();
  config_variable.showEditCategory(rowData);
};

/**
* Display modal for Add or Edit data.
*
* @param {json} data
*
*/
config_variable.showEditCategory = function (data) {
  console.log('data', data)
  document.getElementById("dlgEdit-form").reset();
  var jid = '#dlgEdit'; //prefix id of element in form
  var frm = $(jid + '-form'); //element form
  frm.parsley().reset()
  $(jid + '-title').text(config_variable.translator['title_edit_config_variable']);
  // $('ul.parsley-errors-list').remove()

  // if (data) {
    $("#id").val(data.id);
    // $("#category").val(3);
    for (i = 0; i < dropdown.length; i++) {
      if (dropdown[i].name_category == data.category) {
        $("#category").val(dropdown[i].id);
        break
      }
    }
    $("#name").val(data.name);
    $("#variable_name").val(data.variable_name);
    $('#value').val(data.value);
  // }
  $('#dlgEdit').modal('show');
}

config_variable.renderListCategory = function (rs) {
  var s = ""
  // if (!$.isArray(rs.data)) {
  //   rs.data = []
  // }
  for (var i = 0; i < rs.data.length; i++) {
    s += '<option value = "' + rs.data[i].id + '">'
    s += rs.data[i].name_category
    s += '</option>'
  }
  $('#category').html(s)
  $('#category_add').html(s)

}

config_variable.btnSaveClick = function () {
  if (true) {
  }
  // var form = $('#dlgEdit-form');
  // var form_add = $('#dlgAdd-form');
  // var p = form.parsley()
  // p.validate()
  // if (!p.isValid()) {
  //   return false
  // }
  // if (true) {
  // }
  id = 0
  var check_data_standard_id = $('#id').val()
  var method = "POST"
  if (check_data_standard_id == "" || check_data_standard_id == 0) {
    method = "POST";
  } else {
    method = "PUT"
  }
  console.log('method', method)

  if (method == "PUT") {
    var jsonData = {
      variable_id: parseInt($('#id').val()),
      category: parseInt($('#category').val()),
      name: $('#name').val(),
      variable_name: $('#variable_name').val(),
      value: $('#value').val(),
    }
  } else {
    var jsonData = {
      variable_id: parseInt($('#id_add').val()),
      category: parseInt($('#category_add').val()),
      name: $('#name_add').val(),
      variable_name: $('#variable_name_add').val(),
      value: $('#value_add').val(),
    }
  }

  console.log('jsonData', jsonData)

  apiService.SendRequest(method, config_variable.service, jsonData,
    function (rs, status) {
      if (status == 'success') {
        apiService.SendRequest('Get', config_variable.service, {}, function (rs) {
          bootbox.alert({
            message: config_variable.translator['msg_save_suc'],
            buttons: {
              ok: {
                label: config_variable.translator['btn_close']
              }
            }
          })
          config_variable.updateDatatable(rs);
        })

      } else {
        bootbox.alert({
          message: config_variable.translator['msg_save_unsuccess'],
          buttons: {
            ok: {
              label: config_variable.translator['btn_close']
            }
          }
        })
      }
      if (method == "PUT") {
        document.getElementById("dlgEdit-form").reset();
        $("#dlgEdit").modal("hide");

      } else {
        document.getElementById("dlgAdd-form").reset();
        $("#dlgAdd").modal("hide");

      }
    });
};


config_variable.deleteCategory = function (e) {
  var table = $("#tbl_variable").DataTable();
  config_variable.rowEdit = table.row($(this).closest("tr"));
  rowData = config_variable.rowEdit.data();
  var DelData = {
    variable_id: rowData.id
  }
  bootbox.confirm({
    message: "ต้องการลบชุดมาตรฐานข้อมูลใช่หรือไม่",
    buttons: {
      confirm: {
        label: 'ยืนยัน',
        className: 'btn-success'
      },
      cancel: {
        label: 'ยกเลิก',
        className: 'btn-danger'
      }
    },
    callback: function (result) {
      if (result) {
        apiService.SendRequest("DELETE", config_variable.service, DelData,
          function (rs) {
            apiService.SendRequest('Get', config_variable.service, {}, function (rs) {
              config_variable.updateDatatable(rs);
              if (rs["result"] == "NO") {
                bootbox.alert({
                  message: config_variable.translator['msg_delete_unsuc_relate'],
                  buttons: {
                    ok: {
                      label: config_variable.translator['btn_close']
                    }
                  }
                })
                return false;
              }
              bootbox.alert({
                message: config_variable.translator['msg_delete_suc'],
                buttons: {
                  ok: {
                    label: config_variable.translator['btn_close']
                  }
                }
              })
            })
            return true
          })
      }
    }
  });
}
