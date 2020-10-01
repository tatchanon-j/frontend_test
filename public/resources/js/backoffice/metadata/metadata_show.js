/**
 *
 *   This file is control the options and display data.
 *
 *   @author Thitiporn  Meeprasert <thitiporn@haii.or.th>
 *   @license HAII
 *
 */
var srvData = {}; //initial main function
var elementPrefix = '#dlgEdit'; //prefix element id
var init_DataShow; //initial DataShow data
/**
 * prepare data
 *
 * @param {json} translator Text for use on page
 *
 */
srvData.init = function(translator) {
  var self = srvData;
  self.translator = translator; //Text for label and message on java script
  self.base_service = 'thaiwater30/backoffice/metadata/';
  self.service = self.base_service + 'metadata_show';
  self.service_show_system = self.base_service + 'show_system';
  self.service_subcategory = self.base_service + 'subcategory';
  self.service_agency_metadata = "thaiwater30/backoffice/dataimport_config/history_page"; // for agency and metadata

  self.groupTableId = 'tbl-data-show'; //id table
  ctrl = $('#' + self.groupTableId)
  self.dataTable = ctrl.DataTable({
    dom        : 'frlBtip',
    buttons    : [ {
      text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> เพิ่มข้อมูล',
      action : self.editDataShow
    } ],
    language: g_dataTablesTranslator,
    columns : [ {
      defaultContent : '',
      orderable : false,
      searchable : false,
    }, {
      data: 'metadata_name'
    },{
      data: 'connection_format'
    },{
     data: 'metadata_method'
    }, {
      data: 'agency_name'
    }, {
      data: 'metadata_show_system_name'
    }, {
      data: 'subcategory_name'
    }, {
      data: renderToolButtons,
      orderable: false,
      searchable: false,
    }],
    order: [
      [1, 'asc']
    ],
    rowCallback: self.dataTableRowCallback
  });

  /* Genalate order number on datatable */
  self.dataTable.on('order.dt search.dt', function() {
    self.dataTable.column(0, {
      search : 'applied',
      order : 'applied'
    }).nodes().each(function(cell, i) {
      cell.innerHTML = i + 1;
    });
  }).draw();

  /* Event button */
  ctrl.on('click', '.btn-edit', self.editDataShow)
 // ctrl.on('click', '.btn-add', self.editDataShow)
  ctrl.on('click', '.btn-delete', self.deleteDataShow)

  // get data from service
  apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables);
  apiService.SendRequest('GET', self.service_show_system, {}, srvData.handleShowSystem);
  apiService.GetCachedRequest(self.service_subcategory, {}, srvData.handlerSubcategory);

  // for agency and metadata
  apiService.SendRequest("GET", self.service_agency_metadata, {}, function(rs) {
    if (JH.GetJsonValue(rs, "result") != "OK") {
      return false;
    }
    srvData.handlerSelectOption(JH.GetJsonValue(rs, "data"));
  });
  $('#agency').select2().on('change' , srvData.agencyOnClose);
  $('#metadata').select2();
  $('#subcategory').select2();

}
/**
 * generate data rows on data table
 *
 * @param {json} subcategory initial data of subcategory
 *
 */
srvData.previewDataTables = function(data) {
  console.log("Reload");
  var a = []; //DataShow data to put on talbe
  var self = srvData; //initial data
  var data = apiService.getFieldValue(data, 'data'); //DataShow data
  init_DataShow = data;
  if (data == null) {
    return
  }
  for (var i = 0; i < data.length; i++) {
    a.push(data[i]);
  }
  self.dataTable.clear()
  self.dataTable.rows.add(a)
  self.dataTable.draw()
}
/**
 * show form add /edit
 *
 */
srvData.editDataShow = function() {
  var row = $(this).attr('data-row'); //row number
  var self = srvData; //initial data
  srvData.showEditDataShow(row)
}
/**
 * Display modal Add or Edit DataShow
 *
 * @param {json} row row number
 *
 */
srvData.showEditDataShow = function(row) {
  var frm = $(elementPrefix + '-form'); //elemnt form

  // clear form
  frm[0].reset();
  frm.parsley().reset()
  $('ul.parsley-errors-list').remove()
  $(elementPrefix + '-id').val()
  $('#agency').val(null).trigger('change');
  $('#metadata').val(null).trigger('change');
  $('#metadata_show_system').val("")
  $('#subcategory').val(null).trigger('change');

  if (row === undefined) { // add
    $(elementPrefix + '-id').val('');
    $(elementPrefix + '-title').text("เพิ่มข้อมูล")
  } else { // edit
    $(elementPrefix + '-title').text("แก้ไข")
    $(elementPrefix + '-id').val(init_DataShow[row]["id"])
    $('#agency').val(init_DataShow[row]['agency_id']).trigger('change')
    srvData.agencyOnClose()
    $('#metadata').val(init_DataShow[row]['metadata_id'])
    $('#metadata_show_system').val(init_DataShow[row]['metadata_show_system_id'])
    $('#subcategory').val(init_DataShow[row]['subcategory_id']).trigger('change')
  }
  $(elementPrefix).modal({
    backdrop: 'static'
  })
}
/**
 * deletete data
 *
 */
srvData.deleteDataShow = function(e) {
  var row = $(this).attr('data-row'); //row number
  var self = srvData; //initial data
  var srv = self.service; //service
  // $(elementPrefix + '-id').val(init_DataShow[row]["id"])
  // var id = $(elementPrefix + '-id').val(); //id DataShow
  var param = {
    id: parseInt(init_DataShow[row]["id"])
  };
  var s = self.translator['msg_delete_con'].replace('%s', init_DataShow[row]["metadata_show_system_name"]); //message save success

  bootbox.confirm({
    message: s,
    buttons: {
      confirm: {
        label: '<i class="fa fa-check"></i> ' + self.translator['btn_confirm'],
        className: 'btn-success'
      },
      cancel: {
        label: '<i class="fa fa-times"></i> ' + self.translator['btn_cancel'],
        className: 'btn-danger'
      }
    },
    callback: function(result) {
      if (result) {
        apiService.SendRequest("DELETE", srv, param, function(data, status, jqxhr) {
          apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
          if (data["result"] == "NO") {
            bootbox.alert({
              message: self.translator['msg_delete_unsuc'],
              buttons: {
                ok: {
                  label: self.translator['btn_close']
                }
              }
            })
            return false;
          }
          bootbox.alert({
            message: self.translator['msg_delete_suc'],
            buttons: {
              ok: {
                label: self.translator['btn_close']
              }
            }
          })
        })
        return true
      }
    }
  });
}
/**
 * Event button save new  or edited department
 *
 */
$('#dlgEdit-save-btn').on('click', function(e) {
  if (srvData.saveDataShow('#dlgEdit')) {
    $('#dlgEdit').modal('hide')
  }
});
/**
 * save data
 *
 * @param {string} elementPrefix prefix id
 *
 */
srvData.saveDataShow = function(elementPrefix) {
  var self = srvData; //initial data
  var param = {}; //initial parameter
  var frm = $(elementPrefix + '-form'); //element form

  frm.parsley().validate()
  if (!frm.parsley().isValid()) {
    return false
  }
  var id = $('#id').val(); //id DataShow
  var method = "POST"; // method
  var success_msg = srvData.translator['msg_save_suc']; //message save success
  var srv = self.service; //service
  param['metadata_id'] = parseInt($('#metadata').val());
  param['metadata_show_system_id'] = parseInt($('#metadata_show_system').val());
  param['subcategory_id'] = parseInt($('#subcategory').val());

  if (id !== '') {
    method = "PUT";
    srv += '?id=' + id;
    success_msg = srvData.translator['msg_save_suc'];
    param['id'] = parseInt(id);
  }
  apiService.SendRequest(method, srv, param, function(data, status, jqxhr) {
    apiService.SendRequest('GET', self.service, {}, srvData.previewDataTables)
    bootbox.alert({
      message: self.translator['msg_save_suc'],
      buttons: {
        ok: {
          label: self.translator['btn_close']
        }
      }
    })
  })
  return true
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
var renderToolButtons = function(row, type, set, meta) {
  var self = srvData; //initial data
/*   if (row.id == 0) {
    s = '' ;
  } else { */
    s = '<i class="btn btn-edit" data-row="' + meta.row + '" title="' + srvData.translator['btn_edit'] + '"></i>' + '<i class="btn btn-delete"  data-row="' + meta.row + '" title="' + srvData.translator['btn_delete'] + '"></i>'; //elment buttons on table
/*   } */
  return s
}
/**
 * handler system show
 *
 */
srvData.handleShowSystem = function(rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  srvData.gen_show_system("metadata_show_system", data); //
}
/**
 * Genalate input form for system show
 *
 */
srvData.gen_show_system = function(id, data) {
  input_system_show = document.getElementById(id);
  if (typeof data === undefined || data == null) {
    return false
  }
  JH.Sort(data, "metadata_show_system", false, JH.GetLangValue);
  for (var i = 0; i < data.length; i++) {
    var d = data[i]; //initial agency data
    var option = document.createElement("option"); //create element option
    var txt_option = JH.GetJsonLangValue(d, "metadata_show_system", true); //option name
    var val_option = JH.GetJsonValue(d, "id"); //option value
    option.text = txt_option;
    option.value = val_option;
    input_system_show.add(option);
  }
  return input_system_show;
}
/**
 * handler subcategory
 *
 */
srvData.handlerSubcategory = function(rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  srvData.gen_subcategory("subcategory", data); //
}
/**
 * Genalate Sub Category  (ส่วนที่ข้อมูลไปแสดง)
 *
 */
srvData.gen_subcategory = function(id, data) {

  input_subcategory = document.getElementById(id);
  if (typeof data === undefined || data == null) {
    return false;
  }
  JH.Sort(data, "subcategory_name", false, JH.GetLangValue);
  for (var i = 0; i < data.length; i++) {
    var d = data[i]; //initial data

    var option = document.createElement("option"); //create element option
    var txt_option = JH.GetJsonLangValue(d, "subcategory_name", true); //option name

    var val_option = JH.GetJsonValue(d, "id"); //option value
    option.text = txt_option;
    option.value = val_option;
    input_subcategory.add(option);
  }
  return input_subcategory;
}
/**
 * send data to generate option
 *
 * @param {json} data the data foe generate option
 *
 */
srvData.handlerSelectOption = function(data) {
  srvData.genSelectOption("agency", JH.GetJsonValue(data, "select_option.agency_id"), "agency");
  srvData.agencyOnClose();
}
/**
 * generate option
 *
 * @param {string} el element id
 * @param {json} source the data to generate option
 * @param {json} _cache chache of dropdown
 *
 */
srvData.genSelectOption = function(el, source, _cache) {
  var select = document.getElementById(el); //element of dropdown
  select.length = 1;
  if (el !== 'agency') {
    select.length = 0
  }
  if (JH.GetJsonValue(source, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(source, "data"); //the data for generate option
  if (typeof data === undefined || data == null) {
    return false
  }

  for (var i = 0; i < data.length; i++) {
    var d = data[i]; //the data to generate option
    var option = document.createElement("option"); //create option element
    var txt_option = JH.GetJsonValue(d, "text"); //option name
    var val_option = JH.GetJsonValue(d, "value"); //option value
    option.text = txt_option;
    option.value = val_option;
    select.add(option);
    if (_cache) {
      if (JH.Get(_cache) == "") {
        JH.Set(_cache, {});
      }
      var c = JH.Get(_cache);
      c[val_option] = d;
      JH.Set(_cache, c);
    }
  }
}
/**
 * Get the value from filter agency to generate option into filter metadata
 *
 */
srvData.agencyOnClose = function() {
  var values = $('#agency').val(); //agency id
  var source = {
    result: "OK",
    data: []
  }; //prepare metadata data
  if (values != null) {
    source.data = JH.GetJsonValue(JH.Get("agency"), values + ".metadata_id");
  }
  if (values == undefined) {
    var el = 'metadata'; //element name of metadata
    $('#metadata > option').remove();
  } else {
    srvData.genSelectOption("metadata", source);
  }
}
