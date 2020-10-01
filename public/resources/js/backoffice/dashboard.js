var dash = {};

dash.init = function (translator) {
  dash.translator = translator;
  dash.service = "thaiwater30/backoffice/dashboard/monitor";

  //$("#offline").on("click", "a.text-red", dash.closeAlert);

  apiService.SendRequest('GET', dash.service, {}, dash.handlerService);
  //dash.handlerService(as);

  $.ajax({
    url: window.location.href,
    type: "HEAD",
    async: true,
  }).done(dash.renderWebStatus);

  //$('#filter_agency,#form-agency').on('change', dash.agencyChange);

};


// Keep data
var dataset;
// handler service

dash.handlerService = function (rs) {
  dataset = JH.GetJsonValue(rs, "data_import")
  //dash.renderSelectAgency(JH.GetJsonValue(rs, "agency"))
  //dash.renderAlertOnline(JH.GetJsonValue(rs, "alert_online"));
  dash.renderImportLog(dataset,$('#filter_agency').on('change', dash.agencyChange));
  // dash.renderDataimportNotUpdate(JH.GetJsonValue(rs, "data_import"))
  // dash.renderAlertOffline(JH.GetJsonValue(rs, "alert_offline"));
  // dash.renderActivityLog(JH.GetJsonValue(rs, "dataimport"));
  // dash.renderLastLogin(JH.GetJsonValue(rs, "last_login"));
  // dash.renderUserOnline(JH.GetJsonValue(rs, "user_online"));
  dash.handlerAgency(JH.GetJsonValue(rs, "agency_list"));
  dash.renderDataService(JH.GetJsonValue(rs, "data_service"));
  dash.renderIgnore(JH.GetJsonValue(rs, "data_ignore"));
  dash.renderUser(JH.GetJsonValue(rs, "count_user"));
  dash.renderServerStatus(JH.GetJsonValue(rs, "server_status"));
};

// render data import
dash.renderImportLog = function (rs, id) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  var dataNotUpdate = [];
  var dataNearUpdate = [];
  JH.Sort(data, "last_update", false, function (x) {
    return moment(x).format("x");
  });
  var ul = $("ul#online");
  // if change id
  if (id > 0) { 
    ul.empty();
    for (var i = 0; i < data.length; i++) {
      if (data[i].agency_id == id) {
        ul.append(
          '<li class="item">' +
          '<div class="product-title">' +
          JH.GetJsonLangValue(data[i], "metadataservice_name", true) +
          dash.renderTime(data[i]) +
          "</div>" +
          '<span class="product-description">' +
          dash.translator["agency"] +
          " : " +
          JH.GetJsonLangValue(data[i], "agency_name", true) +
          "</span>" +
          '<span class="product-description">' +
          dash.translator["latest"] +
          " : " +
          dash.formatDateTime(JH.GetJsonValue(data[i], "import_begin_at")) +
          "</span>" +
          "</li>"
        );
      }
    }
  } else {
    for (var i = 0; i < data.length; i++) {
      if (data[i].metadata_update_plan >= 1440) { // data[i].metadata_update_plan > data[i].overdue_minute && 
        dataNearUpdate.push(data[i])
      } else {
        dataNotUpdate.push(data[i])
      }

      ul.append(
        '<li class="item">' +
        '<div class="product-title">' +
        JH.GetJsonLangValue(data[i], "metadataservice_name", true) +
        dash.renderTime(data[i]) +
        "</div>" +
        '<span class="product-description">' +
        dash.translator["agency"] +
        " : " +
        JH.GetJsonLangValue(data[i], "agency_name", true) +
        "</span>" +
        '<span class="product-description">' +
        dash.translator["latest"] +
        " : " +
        dash.formatDateTime(JH.GetJsonValue(data[i], "import_begin_at")) +
        "</span>" +
        "</li>"
      );
    }

    dash.renderDataimportNotUpdate(dataNotUpdate);
    dash.renderDataimportNearUpdate(dataNearUpdate);
  }
};

// render data import is not update
dash.renderDataimportNotUpdate = function (data) {
  var ul = $("ul#datanotupdate");
  for (var i = 0; i < data.length; i++) {
    ul.append(
      '<li class="item">' +
      '<div class="product-title">' +
      JH.GetJsonLangValue(data[i], "metadataservice_name", true) +
      "</div>" +
      '<span class="product-description">' +
      dash.translator["agency"] +
      " : " +
      JH.GetJsonLangValue(data[i], "agency_name", true) +
      "</span>" +

      '<span class="product-description">' +
      'ความถี่' +
      " : " +
      JH.GetJsonValue(data[i], "metadata_convertfrequency") +
      "</span>" +

      '<span class="product-description">' +
      dash.translator["latest"] +
      " : " +
      dash.formatDateTime(JH.GetJsonValue(data[i], "import_begin_at")) +
      "</span>" +
      "</li>"
    );
  }
}

// render data import near update
dash.renderDataimportNearUpdate = function (data) {
  var ul = $("ul#datanearupdate");
  for (var i = 0; i < data.length; i++) {
    ul.append(
      '<li class="item">' +
      '<div class="product-title">' +
      JH.GetJsonLangValue(data[i], "metadataservice_name", true) +
      "</div>" +
      '<span class="product-description">' +
      dash.translator["agency"] +
      " : " +
      JH.GetJsonLangValue(data[i], "agency_name", true) +
      "</span>" +

      '<span class="product-description">' +
      'ความถี่' +
      " : " +
      JH.GetJsonValue(data[i], "metadata_convertfrequency") +
      "</span>" +

      '<span class="product-description">' +
      dash.translator["latest"] +
      " : " +
      dash.formatDateTime(JH.GetJsonValue(data[i], "import_begin_at")) +
      "</span>" +
      "</li>"
    );
  }
}

dash.handlerAgency = function (rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") { return false; }
  var data = JH.GetJsonValue(rs, "data"); //agency data
  JH.Sort(data, "agency_name", false, JH.GetLangValue);
  var filter = dash.gen_filter_agency("filter_agency", data); //elemet filter agency
  $(filter).trigger('change');
}

dash.gen_filter_agency = function (id, data, cache) {
  var filter_agency = document.getElementById(id); //element filter agency
  //Add text and value for element option on filter.
  if (typeof data === undefined || data == null) { return false }
  for (var i = 0; i < data.length; i++) {
    var d = data[i]; //initial agency data

    var option = document.createElement("option"); //create element option
    var txt_option = JH.GetJsonLangValue(d, "agency_name", true); //oprion name
    var val_option = JH.GetJsonValue(d, "id"); //option value

    if (cache) { dash["DATA"]["agency"][val_option] = d; }

    option.text = txt_option;
    option.value = val_option;
    filter_agency.add(option);
  }
  return filter_agency;
}

// Change id
dash.agencyChange = function () {
  var val = $(this).val(); //id category
  dash.renderImportLog(dataset,val)
}

//render ignore count
dash.renderUser = function (rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  $("#count-user").text(JH.GetJsonValue(data, "count_no_user"));
};


// render alert online
// dash.renderAlertOnline = function (rs) {
//   if (JH.GetJsonValue(rs, "result") != "OK") {
//     return false;
//   }
//   var data = JH.GetJsonValue(rs, "data");
//   JH.Sort(data, "last_update", false, function (x) {
//     return moment(x).format("x");
//   });
//   var ul = $("ul#online");
//   for (var i = data.length; i > 0; i--) {
//     ul.append(
//       '<li class="item">' +
//         '<div class="product-title">' +
//         JH.GetJsonLangValue(data[i], "metadataservice_name", true) +
//         dash.renderTime(data[i]) +
//         "</div>" +
//         '<span class="product-description">' +
//         dash.translator["agency"] +
//         " : " +
//         JH.GetJsonLangValue(data[i], "agency.agency_name", true) +
//         "</span>" +
//         '<span class="product-description">' +
//         dash.translator["latest"] +
//         " : " +
//         dash.formatDateTime(JH.GetJsonValue(data[i], "last_update")) +
//         "</span>" +
//         "</li>"
//     );
//   }
// };

// render time from now with label-color
dash.renderTime = function (d) {
  var label_level;
  var overdue_minute = JH.GetJsonValue(d, "overdue_minute");
  switch (true) {
    case overdue_minute > 2880: // 2 days
      label_level = "danger";
      break;
    case overdue_minute > 1440: // 1 day
      label_level = "warning";
      break;
    case overdue_minute > 60: // 1 hr
      label_level = "primary";
      break;
    default:
      label_level = "info";
  }
  return (
    '<span class="badge badge-' +
    label_level +
    ' pull-right">' +
    '<i class="fa fa-clock-o"></i> ' +
    moment(JH.GetJsonValue(d, "import_begin_at")).fromNow() +
    "</span>"
  );
};
// render alert offline
dash.renderAlertOffline = function (rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  var ul = $("ul#offline");
  for (var i = 0; i < data.length; i++) {
    var text = $("<li></li>").addClass("item");
    text.data("data", data[i]);
    text.html(
      '<div class="product-title">' +
      JH.GetJsonLangValue(data[i], "metadataservice_name", true) +

      "</div>" +
      '<span class="product-description">' +
      dash.translator["agency"] +
      " : " +
      JH.GetJsonLangValue(data[i], "agency.agency_name", true) +
      "</span>" +
      '<span class="product-description">' +
      dash.translator["frequency"] +
      " : " +
      JH.GetJsonValue(data[i], "frequency_unit.datafrequency") +
      "</span>" +
      '<span class="product-description">' +
      dash.translator["latest"] +
      " : " +
      dash.formatDateTime(JH.GetJsonValue(data[i], "metadata_offline_date")) +
      "</span>"
    );
    ul.append(text);
  }
};
// format datetime using momnet
dash.formatDateTime = function (dt) {
  return JH.DateFormat(dt);
};
// close alert
dash.closeAlert = function () {
  var li = $(this).closest("li");
  var data = li.data("data");
  var m_id = JH.GetJsonValue(data, "metadata_id");
  apiService.SendRequest(
    "PATCH",
    dash.service,
    { metadata_id: m_id },
    function () {
      // animation
      li.hide("drop", { direction: "right" }, "slow");
    }
  );
};
// render activity log
dash.renderActivityLog = function (rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  dash.renderTblAcLog("tbl-dl", JH.GetJsonValue(data, "downloader"));
  dash.renderTblAcLog("tbl-cv", JH.GetJsonValue(data, "converter"));
  dash.renderTblAcLog("tbl-im", JH.GetJsonValue(data, "importer"));
  // $('#tbl-dl').DataTable().rows.add( JH.GetJsonValue(rs, "downloader") ).draw();
  // $('#tbl-cv').DataTable().rows.add( JH.GetJsonValue(rs, "converter") ).draw();
  // $('#tbl-im').DataTable().rows.add( JH.GetJsonValue(rs, "importer") ).draw();
};

dash.renderTblAcLog = function (tbl, data) {
  var tbl = $("#" + tbl);
  for (var i = 0; i < data.length; i++) {
    tbl.append(
      "<tr>" +
      "<td>" +
      dash.renderAcLogColumnName(data[i]) +
      "</td>" +
      "<td>" +
      dash.renderAcLogColumnAgency(data[i]) +
      "</td>" +
      "<td>" +
      dash.renderAcLogColumnStartTime(data[i]) +
      "</td>" +
      "<td>" +
      dash.renderAcLogColumnDuration(data[i]) +
      "</td>" +
      "</tr>"
    );
  }
};
// render column name
dash.renderAcLogColumnName = function (row) {
  return JH.GetJsonLangValue(row, "metadataservice_name", true);
};
// redner column agency
dash.renderAcLogColumnAgency = function (row) {
  return JH.GetJsonLangValue(row, "agency_shortname", true);
};
// render column start time
dash.renderAcLogColumnStartTime = function (row) {
  return dash.formatDateTime(JH.GetJsonValue(row, "start_time"));
};
// render duration
dash.renderAcLogColumnDuration = function (row) {
  var time = JH.GetJsonValue(row, "duration");
  time /= 1000000000;
  return time.toFixed(2);
};
// render last login
dash.renderLastLogin = function (rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  var tbl = $("#tbl-login");
  for (var i = 0; i < data.length; i++) {
    tbl.append(
      "<tr>" +
      "<td>" +
      JH.GetJsonValue(data[i], "account") +
      "</td>" +
      "<td>" +
      dash.formatDateTime(JH.GetJsonValue(data[i], "login_time")) +
      "</td>" +
      "</tr>"
    );
  }
};
// render user online
dash.renderUserOnline = function (rs) {
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  $("#user_online").text(data);
};
dash.renderDataService = function (rs) {
  //console.log(rs)
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  $("#ds-nr").text(JH.GetJsonValue(data, "count_no_result"));
};

//render ignore count
dash.renderIgnore = function (rs) {
  //console.log(rs)
  if (JH.GetJsonValue(rs, "result") != "OK") {
    return false;
  }
  var data = JH.GetJsonValue(rs, "data");
  $("#water-ignore").text(JH.GetJsonValue(data, "ignore_count_water"));
  $("#rain-ignore").text(JH.GetJsonValue(data, "ignore_count_rain"));
};

// render web status
dash.renderWebStatus = function (message, text, jqXHR) {
  var d = { name: window.location.origin, error: "" };
  if (jqXHR.status < 200 || jqXHR.status >= 400) {
    d.error = "error" + jqXHR.statusText;
  }

  dash.renderStdServerStatus("#dashboard_status_web_detail", [d]);
};
// render server status to ul
dash.renderStdServerStatus = function (id, a) {
  var detail = "";
  if (a !== undefined && typeof a == "object") {
    for (var i = 0; i < a.length; i++) {
      var d = a[i];
      detail +=
        '<li class="renderStd"><a>' +
        d.name +
        ' <span class="badge badge-pill badge-';
      if (d.error === undefined || d.error == "") {
        detail += 'success">ONLINE';
      } else {
        detail += 'danger">OFFLINE';
      }
      detail += "</span></a></li>";
    }
  }
  $(id).html(detail);
};

dash.renderServerStatusS = function (id,a) {
  console.log(a)
  var detail = "";
    if (a.apis != undefined || a.dataimports != undefined || a.dbs != undefined) {
    for (var i = 0; i < a.length; i++) {
      var d = a[i];
      detail +=
        '<li class="renderStd"><a>' +
        d.name +
        ' <span class="badge badge-pill badge-';
      if (d.error === undefined || d.error == "") {
        detail += 'success">ONLINE';
      } else {
        detail += 'danger">OFFLINE';
      }
      detail += "</span></a></li>";
    }
  }
  $(id).html(detail);
};
// render server status
dash.renderServerStatus = function (rs) {
  //API
  dash.renderStdServerStatus("#dashboard_status_api_detail", rs.apis);
  dash.renderStdServerStatus(
    "#dashboard_status_dataimport_detail",
    rs.dataimports
  );
  dash.renderStdServerStatus("#dashboard_status_db_detail", rs.dbs);
  //dash.renderServerStatusS("#dashboard_status_server",rs);
};
