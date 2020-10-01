/**
 *
 *   Main JS application file for agency page.
 *		This file is control the options and display data.
 *
 *   @author CIM Systems (Thailand) <cim@cim.co.th>
 *   @license HAII
 *
 */

var srvData = {
  srvUpload: "thaiwater30/backoffice/metadata/upload_img"
}; //initial data
var jid = "#dlgEditAgency"; // prefix id elemenet on form
var upload_file_id1 = 0

/**
 * prepare data.
 *
 * @param {json} translator Text for use on page.
 */
srvData.init = function (translator) {
  var self = srvData; //initial data
  self.translator = translator; //Text for label and message on java script
  self.service = "thaiwater30/backoffice/metadata/agency"; //service agency
  self.service_ministry = "thaiwater30/backoffice/metadata/ministry"; //service ministry
  self.service_dedpartment = "thaiwater30/backoffice/metadata/department"; //service department
  // self.service_upload = "thaiwater30/backoffice/metadata/upload_img";
  // self.service_dedpartment = "thaiwater30/backoffice/metadata/department"; //service department

  //chang- comment
  // self.uploadFile()

  self.groupTableId = "tbl-agency"; //id agency table
  ctrl = $("#" + self.groupTableId);
  self.dataTable = ctrl.DataTable({
    dom: "frlBtip",
    buttons: [
      {
        text:
          ' <i class="fa fa-plus-circle" aria-hidden="true"></i> ' +
          srvData.translator["btn_add_agency"],
        action: self.editAgency,
      },
    ],
    language: g_dataTablesTranslator,
    columns: [
      {
        defaultContent: "",
        orderable: false,
        searchable: false,
      },
      { data: srvData.renderColumAgency },
      { data: srvData.renderColumAgencyName },
      { data: srvData.renderColumDepartment },
      { data: srvData.renderColumMinistry },
      { data: srvData.renderColumLogo },
      {
        data: renderToolButtons,
        orderable: false,
        searchable: false,
      },
    ],
    order: [[1, "asc"]],
    rowCallback: self.dataTableRowCallback,
  });

  /* Event button edit data o datatable */
  ctrl.on("click", ".btn-edit", self.editAgency);
  /* Event button edit data o datatable */
  ctrl.on("click", ".btn-delete", self.deleteAgency);

  self.dataTable
    .on("order.dt search.dt", function () {
      self.dataTable
        .column(0, {
          search: "applied",
          order: "applied",
        })
        .nodes()
        .each(function (cell, i) {
          cell.innerHTML = i + 1;
        });
    })
    .draw();

  /* generate form input agency according languages on system */
  $(document).ready(function () {
    $("select[multiple] option").prop("selected", "selected");
    if (typeof lang === undefined || lang == null) {
      return false;
    }
    for (var i = 0; i < lang.length; i++) {
      var id = lang[i];
      var upName = id.toUpperCase();
      if (id == "th") {
        $("#dlgEditAgency-form").append(
          '<div class="form-group row ministry_name"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditAgency-name"><span class="color-red">*</span>' +
            srvData.translator["btn_add_agency"] +
            "(" +
            upName +
            '):</label> <div class="col-sm-9"> <input id="dlgEditAgency-' +
            id +
            '" type="text" class="form-control" name="department" data-key="' +
            id +
            '" data-parsley-required data-parsley-error-message="' +
            self.translator["msg_err_require"] +
            '"></input> </div> </div> <div class="form-group row short_name"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditAgency-name">' +
            srvData.translator["short_name"] +
            " (" +
            upName +
            '):</label> <div class="col-sm-3"> <input id="short_name_' +
            id +
            '" type="text" class="form-control shortname_department" name="shortname_department" data-key="' +
            id +
            '"/> </div> </div>'
        );
      } else {
        $("#dlgEditAgency-form").append(
          '<div class="form-group row ministry_name"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditAgency-name">' +
            srvData.translator["btn_add_agency"] +
            "(" +
            upName +
            '):</label> <div class="col-sm-9"> <input id="dlgEditAgency-' +
            id +
            '" type="text" class="form-control" name="department" data-key="' +
            id +
            '"></input> </div> </div> <div class="form-group row short_name"> <label class="col-form-label text-sm-right col-sm-3" for="dlgEditAgency-name">' +
            srvData.translator["short_name"] +
            " (" +
            upName +
            '):</label> <div class="col-sm-3"> <input id="short_name_' +
            id +
            '" type="text" class="form-control shortname_department" name="shortname_department" data-key="' +
            id +
            '"/> </div> </div>'
        );
      }
    }
  });

  apiService.SendRequest(
    "GET",
    self.service + "_onload",
    {},
    srvData.handlerService
  );
  $("#filter_ministry,#input_ministry").on("change", srvData.ministryChange);
  $("#btn_preview").on("click", srvData.btnPreviewClick);
};

/**
 * get the data to generate data table
 *
 */
srvData.btnPreviewClick = function () {
  var param = {
    department_id: $("#filter_department").val(),
    ministry_id: $("#filter_ministry").val(),
  };
  apiService.SendRequest(
    "GET",
    srvData.service,
    param,
    srvData.previewDataTables
  );
};

/**
 * get the data to generate data table
 *
 *@param {json} rs data to generate option
 */
srvData.handlerService = function (rs) {
  srvData.handlerDepartment(JH.GetJsonValue(rs, "department"));
  srvData.handlerMinistry(JH.GetJsonValue(rs, "ministry"));
  srvData.previewDataTables(JH.GetJsonValue(rs, "agency"));
};

/**
 * Update option on filter department.
 *
 */
srvData.ministryChange = function () {
  var id = $(this).attr("id"); //element id
  var val = $(this).val(); //ministry id
  var target_id = id.replace("ministry", "department"); //change element id
  var addAll;
  if (target_id.charAt(0) == "i") {
    addAll = false;
  } else {
    addAll = true;
    $("#" + target_id).prop("disabled", false);
    if (val == "") {
      val = "all"; //add option
      $("#" + target_id).prop("disabled", true);
    }
  }
  srvData.gen_file_department(target_id, val, addAll);
};

/**
 * setting selecte department.
 *
 *@param {json} department department data
 */
srvData.handlerDepartment = function (department) {
  if (JH.GetJsonValue(department, "result") != "OK") {
    alert("error");
    return false;
  }
  var data = JH.GetJsonValue(department, "data"); //department data
  JH.Sort(data, "department_name." + JH.GetLang(), false, function (str) {
    return str.toLowerCase();
  });
  JH.Set("department", data);
};

/**
 * setting selecte department.
 *
 *@param {json} ministry ministry data
 */
srvData.handlerMinistry = function (ministry) {
  if (JH.GetJsonValue(ministry, "result") != "OK") {
    alert("error");
    return false;
  }
  var data = JH.GetJsonValue(ministry, "data"); //ministry data
  JH.Sort(data, "ministry_name." + JH.GetLang(), false, function (str) {
    return str.toLowerCase();
  });
  var fm = srvData.gen_fil("filter_ministry", data, "ministry_name"); //element filter ministry
  $(fm).triggerHandler("change");
  var im = srvData.gen_fil("input_ministry", data, "ministry_name"); //element input ministry
  $(im).triggerHandler("change");
};

/**
 * get value ministry to generate option department.
 *
 *@param {json} target_id value option
 *@param {json} eq_val text option
 *@param {boolean} addAll
 */
srvData.gen_file_department = function (target_id, eq_val, addAll) {
  srvData.gen_fil(
    target_id,
    JH.Get("department"),
    "department_name",
    true,
    addAll,
    eq_val,
    "ministry_id"
  );
};

/**
 * generate option filter department.
 *
 *@param {json} id
 *@param {json} source
 *@param {json} key
 *@param {json} isReset
 *@param {json} isAddAll
 *@param {json} eq_val
 *@param {json} ck_key
 */
srvData.gen_fil = function (
  id,
  source,
  key,
  isReset,
  isAddAll,
  eq_val,
  ck_key
) {
  select = document.getElementById(id);
  if (typeof select === undefined || select == null) {
    return false;
  }
  if (isReset) {
    select.options.length = 0;
  }
  if (isAddAll) {
    var option = document.createElement("option");
    option.text = TRANS["msg_display_all"];
    option.value = "";
    select.add(option);
  }
  var data = source;
  if (typeof data === undefined || data == null) {
    return false;
  }
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var option = document.createElement("option");
    var txt_option = JH.GetJsonValue(d, key + ".jp");
    var val_option = d["id"];

    if (eq_val && ck_key && eq_val != JH.GetJsonValue(d, ck_key)) {
      continue;
    }

    if (JH.GetJsonValue(d, key + ".en")) {
      txt_option = JH.GetJsonValue(d, key + ".en");
    }
    if (JH.GetJsonValue(d, key + ".th")) {
      txt_option = JH.GetJsonValue(d, key + ".th");
    }
    option.text = txt_option;
    option.value = val_option;
    select.add(option);
  }
  $(select).select2();
  return select;
};

/**
 * generate option filter department.
 *
 *@param {json} data
 */
srvData.previewDataTables = function (data) {
  var self = srvData; //initial data
  self.dataTable.clear();
  if (JH.GetJsonValue(data, "result") == "OK") {
    JH.Set("data", JH.GetJsonValue(data, "data"));
    self.dataTable.rows.add(JH.GetJsonValue(data, "data"));
  }
  self.dataTable.draw();
};

/**
 * put the data into column agency TH on data table.
 *
 *@param {json} row data on row
 */
srvData.renderColumAgencyTH = function (row) {
  return JH.GetJsonLangValue(row, "agency_name", true);
};

/**
 * put the data into column agency on data table.
 *
 *@param {json} row data on row
 */

srvData.renderColumAgency = function (row) {
  if (JH.GetJsonValue(row, "agency_shortname.th")) {
    return JH.GetJsonValue(row, "agency_shortname.th");
  }
  if (JH.GetJsonValue(row, "agency_shortname.en")) {
    return JH.GetJsonValue(row, "agency_shortname.en");
  }
  return JH.GetJsonValue(row, "agency_shortname.jp");
};

/**
 * put the data into column agency name on data table.
 *
 *@param {json} row data on row
 */
srvData.renderColumAgencyName = function (row) {
  return JH.GetJsonLangValue(row, "agency_name", true);
};

/**
 * put the data into column ministry on data table.
 *
 *@param {json} row data on row
 */
srvData.renderColumMinistry = function (row) {
  return JH.GetJsonLangValue(row, "ministry_name", true);
};

srvData.renderColumLogo = function (row) {
  //chang- change fix logo to db logo
  return '<img src="data:image/png;base64,'+JH.GetJsonLangValue(row, "logo", true)+'" alt="Smiley face" width="42" height="42" style="float:center">'
 };

/**
 * put the data into column department on data table.
 *
 *@param {json} row data on row
 */
srvData.renderColumDepartment = function (row) {
  return JH.GetJsonLangValue(row, "department_name", true);
};

/**
 * Add or Edit Department name
 *
 */
srvData.editAgency = function () {
  var self = srvData; //initial data
  row = $(this).attr("data-row"); //row number
  srvData.showEditAgency(row);
};

/**
 * Dis play modal Add or Edit Department name.
 *
 *@param {json} row data on row
 */
srvData.showEditAgency = function (row) {
  var self = srvData; //initial data
  var jid = "#dlgEditAgency"; //prefix id
  var data = {}; //data multilangauge
  var frm = $(jid + "-form"); //element form

  frm.parsley().reset();
  frm[0].reset();
  $("ul.parsley-errors-list").remove();

  if (row === undefined) {
    $(jid + "-id").val("");
    $(jid + "-title").text(srvData.translator["title_add_agency"]);
    $("#input_ministry").triggerHandler("change");
  } else {
    var data = JH.GetJsonValue(JH.Get("data"), row); //data to display on edit forms
    $(jid + "-title").text(srvData.translator["title_edit_agency"]);
    $(jid + "-id").val(data["id"]);

    //$('#dlgEditAgency-th').val(data["agency_name"]["th"]);
    $("#input_ministry").val(data["ministry_id"]).triggerHandler("change");
    $("#input_department").val(data["department_id"]).trigger("change");

    $(jid + "-form > div.ministry_name > div")
      .children("input")
      .each(function () {
        var frm_lang = $(this).attr("data-key"); //form langauges
        var text = ""; //ministry name
        if (data["agency_name"][frm_lang] != "undefined") {
          text = data["agency_name"][frm_lang];
          $("#dlgEditAgency-" + frm_lang).val(text);
        }
      });

    $(jid + "-form > div.short_name > div")
      .children("input")
      .each(function () {
        var frm_lang_sht = $(this).attr("data-key");
        var text = ""; //ministry short name
        if (data["agency_shortname"][frm_lang_sht] != "undefined") {
          text = data["agency_shortname"][frm_lang_sht];
          $("#short_name_" + frm_lang_sht).val(text);
        }
      });
  }

  $(jid).modal({
    backdrop: "static",
  });
};

/**
 * Delete Department.
 *
 *@param {json} row data on row
 */
srvData.deleteAgency = function (e) {
  var self = srvData; //initial data
  var row = $(this).attr("data-row"); //row number
  var jid = "#dlgEditAgency"; //prefix id
  var data = JH.GetJsonValue(JH.Get("data"), row); //ageny data

  $(jid + "-id").val(JH.GetJsonValue(data, "id"));
  var id = $(jid + "-id").val(); //agenyc id
  var agency_name = JH.GetJsonLangValue(data, "agency_name"); //agenyc name
  var srv = self.service; //service to delete

  srv += "/" + id;
  var s = self.translator["msg_delete_con"].replace("%s", agency_name); //message confirm delete

  bootbox.confirm({
    message: s,
    buttons: {
      confirm: {
        label: '<i class="fa fa-check"></i> ' + self.translator["btn_confirm"],
        className: "btn-success",
      },
      cancel: {
        label: '<i class="fa fa-times"></i> ' + self.translator["btn_cancel"],
        className: "btn-danger",
      },
    },
    callback: function (result) {
      if (result) {
        apiService.SendRequest("DELETE", srv, {}, function (
          data,
          status,
          jqxhr
        ) {
          $("#btn_preview").triggerHandler("click");
          if (data["result"] == "NO") {
            bootbox.alert({
              message: self.translator["msg_delete_unsuc"],
              buttons: {
                ok: {
                  label: self.translator["btn_close"],
                },
              },
            });
            return false;
          }
          bootbox.alert({
            message: self.translator["msg_delete_suc"],
            buttons: {
              ok: {
                label: self.translator["btn_close"],
              },
            },
          });
        });
        return true;
      }
    },
  });
};

/**
 * Event button save new  or edited department
 *
 *@param {json} row data on row
 */
$(jid + "-save-btn").on("click", function (e) {
  if (srvData.saveAgency("#dlgEditAgency")) {
    $(jid).modal("hide");
  }
});

/**
 * Save From Add or Edit Department
 *
 *@param {json} row data on row
 */
srvData.saveAgency = function (jid) {
  console.log('test',jid)
  var self = srvData; //initial data
  var param = {}; //parameter to save data
  var data = {}; //data agency name multilanagauge
  var shortname = {}; //data agency short name multilanagauge
  var frm = $(jid + "-form"); //elemernt form
  var logo = document.getElementById('btn_add_picture');//data logo upload from form chang-

  //Chek form TH not null
  frm.parsley().validate();
  if (!frm.parsley().isValid()) {
    return false;
  }

  $(jid + "-form > div.ministry_name > div")
    .children("input")
    .each(function () {
      var frm_lang = $(this).attr("data-key"); //short name languge on element agency name
      data[frm_lang] = $(jid + "-" + frm_lang).val();
    });

  $(jid + "-form > div.short_name > div")
    .children("input")
    .each(function () {
      var frm_lang_sht = $(this).attr("data-key"); //short name languge on element agency short name
      shortname[frm_lang_sht] = $("#short_name_" + frm_lang_sht).val();
    });

  var id = $(jid + "-id").val(); //agency id
  var method = "POST"; //service method
  var success_msg = srvData.translator["msg_save_suc"]; //message save success
  var srv = self.service; //url service to save

  param["agency_name"] = data;
  param["agency_shortname"] = shortname;
  param["ministry_id"] = $("#input_ministry").val();
  param["department_id"] = $("#input_department").val();
  param["id"] = id;
  param["temp_file_id"] = upload_file_id1
  if (id !== "") {
    method = "PUT";
    srv += "/" + id;
    success_msg = srvData.translator["msg_save_suc"];
    param["id"] = id;
  }
  console.log('param',param,srv)

  //chang- =====================
  if(logo.files.length>0){
    var form = document.createElement('form');
    form.setAttribute("id","test");
    form.setAttribute("enctype","multipart/form-data");
    form.innerHTML = '<input class="file" type="file" name="files">' + '\n<input name="agency_id" value="'+id+'">'
    form.getElementsByClassName("file")[0].files = logo.files;
    apiService.SendRequest("PUT", srvData.srvUpload, form,function (rs) {
            param['logo'] = rs.data.file_path
            apiService.SendRequest(method, srv, param, function (rs) {
              bootbox.alert({
                message: self.translator["msg_save_suc"],
                buttons: {
                  ok: {
                    label: self.translator["btn_close"],
                  },
                },
              });
              $("#btn_preview").triggerHandler("click");
            });
        }, null , true)
  }
  else{
    apiService.SendRequest(method, srv, param, function (rs) {
      bootbox.alert({
        message: self.translator["msg_save_suc"],
        buttons: {
          ok: {
            label: self.translator["btn_close"],
          },
        },
      });
      $("#btn_preview").triggerHandler("click");
    });
  }
  //=============================
  return true;
};

/**
 * Create icon for edit and delete data on datatable.
 *
 *@param {json} row data on row
 */
var renderToolButtons = function (row, type, set, meta) {
  var self = srvData; //initial data
  var s =
    '<i class="btn btn-edit" data-row="' +
    meta.row +
    '" title="' +
    self.translator["btn_edit"] +
    '"></i>' +
    '<i class="btn btn-delete"  data-row="' +
    meta.row +
    '" title="' +
    self.translator["btn_delete"] +
    '"></i>';

  return s;
};

// $(document).on("click", ".browse", function () {
//   var file = $(this).parents().find(".file");
//   file.trigger("click");
// });

// $('#upload').click(function () {
//   $("#file").val("");
//   console.log($("#file").val());
// });

// $('input[type="file"]').change(function (e) {
//   var fileName = e.target.files[0].name;
//   $("#file").val(fileName);
//   console.log($("#file").val());
//   var reader = new FileReader();
//   reader.onload = function (e) {
//     // get loaded data and render thumbnail.
//     document.getElementById("file").src = e.target.result;
//   };
//   // read the image file as a data URL.
//   reader.readAsDataURL(this.files[0]);
// });

//chang- comment srvData.uploadFile
// srvData.uploadFile = function () {
//   // var self = srvData; //initial data

// $('#btn_add_picture').on('change', function () {

//   function getExtension(filename) {
//       var parts = filename.split('.');
//       return parts[parts.length - 1];
//   }
//   function isFile(filename) {
//       var ext = getExtension(filename);
//       switch (ext.toLowerCase()) {
//           case 'jpg':
//           case 'gif':
//           case 'bmp':
//           case 'png':
//               return true;
//       }
//       return false;
//   }
//   var file = $('#btn_add_picture');
//   console.log('file',file)

//   if (!isFile(file.val())) {
//       var type_file = getExtension(file.val());
//       bootbox.alert('ไม่สามารถนำไฟล์ .' + type_file + ' เข้าระบบได้');
//       $('#btn_add_picture').val("")
//   }
//   else if (isFile(file.val())) {
//       var numb = $(this)[0].files[0].size / 1024 / 1024;
//       numb = numb.toFixed(2);
//       if (numb > 10) {
//           $('#btn_add_picture').val("")
//           bootbox.alert('ไอคอนที่คุณอัปโหลดขนาดไฟล์เกิน 10 MB ขนาดไฟล์ของคุณ ' + numb + ' MB');
//       } else {
//           var form = document.getElementById('upload_form');
//           var
//           apiService.SendRequest("PUT", srvData.srvUpload, form,function (rs) {
//                   // upload_file_id1 = rs.data[0].id;
//                   console.log('upload_file_id1',rs)
//               }, null , true)
//       }
//   }
// });
// }
