/**
 *
 *   Main JS application file for download setting page.
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
    mgmt.option = {}; //initial option data
    mgmt.translator = translator; //Text for label and message on javascript
    mgmt.service = "thaiwater30/backoffice/dataimport_config/dataimport_download"; //service data import download
    mgmt.service_copy = "thaiwater30/backoffice/dataimport_config/dataimport_download_copy"; //service data import dowload copy
    mgmt.service_iscronenabled = "thaiwater30/backoffice/dataimport_config/iscronenabled"; //service iscronebled
    mgmt.service_updatecron = "dataimport/rdl/node0/cron"; //service update cron
    mgmt.service_dataimport_download = 'dataimport/rdl/node0/download'; //service download
    mgmt.service_run = 'thaiwater30/backoffice/dataimport_config/ps/'; //service for start script
    // mgmt.service_run = 'dataimport/rdl/node0/ps'; //service for start script
    mgmt.deleteRow = ""; //row The data for delete the whole row
    mgmt.table = $('#tbl'); //element table

    mgmt.dataTable = mgmt.table.DataTable({
        dom: 'frl<"activebtn">Btip',
        buttons: [{
            text: '<i class="fa fa-plus-circle" aria-hidden="true"></i> ' + btn_add_script,
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
        }
        ],
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
            mgmt.download_list = rs.data.dataimport_download_list
            mgmt.handlerDownloadList(rs.data.dataimport_download_list);
            mgmt.handlerSelectOption(rs.data.select_option);
            // box search in select
            $(".select-search").select2({});
        }
    });
}


/**
 * put data into column download name
 *
 * @param {json} row The data for the whole row
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
 * @param {json} row The data for the whole row
 */
mgmt.download_method = function (row) {
    return JH.GetJsonValue(row, 'download_method')
}

/**
 * put data into column description
 *
 * @param {json} row The data for the whole row
 */
mgmt.description = function (row) {
    return JH.GetJsonValue(row, 'description')
}

/**
 * put data into column status
 *
 * @param {json} row The data for the whole row
 */
mgmt.renderStatus = function (row) {
    var s = '<font color="red">' + status_disable + '</font>'; //diplay status to red color

    if (JH.GetJsonValue(row, "is_cronenabled") == true) {
        s = '<font color="green">' + status_enable + '</font>';
    }
    return s;
}

/**
 * create button on table
 *
 * @param {json} row The data for the whole row
 * @param {json} type The data type requested for the cell
 * @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
 * @param {json} meta An object that contains additional information about the cell being requested.
 *
 */
mgmt.renderEditBtn = function (row, type, set, meta) {
    if (row.is_run == true) {
        return '<i class="btn btn-copy" data-row="' + meta.row + '" title="' + mgmt.translator['msg_copy'] + '" data-id="' + row.id + '"></i>' +
            '<i class="btn btn-view"  data-row="' + meta.row + '" title="view json" data-name="viewJson" data-id="' + row.id + '"></i>' +
            '<i class="btn btn-play"  data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="play"></i>' +
            '<i class="btn btn-pause"  data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="pause"></i>' +
            '<i class="btn btn-edit"  data-row="' + meta.row + '" data-id="' + row["id"] + '"></i>' +

            '<i class="btn btn-view-data"  data-row="' + meta.row + '" title="view data" data-name="viewData" data-id="' + row["id"] + '"></i>' +
            '<i class="btn btn-delete" data-row="' + meta.row + '" title="delete"></i>';
    } else {
        return '<i class="btn btn-copy"  data-row="' + meta.row + '" title="' + mgmt.translator['msg_copy'] + '" data-id="' + row.id + '"></i>' +
            '<i class="btn btn-view"  data-row="' + meta.row + '" title="view json" data-name="viewJson" data-id="' + row.id + '"></i>' +
            '<i class="btn "  data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="play"></i>' +
            '<i class="btn btn-pause"  data-row="' + meta.row + '" download-id="' + row.id + '" download-method="' + row.download_method + '" name="' + row.download_name + '" title="pause"></i>' +
            '<i class="btn btn-edit"  data-row="' + meta.row + '" data-id="' + row["id"] + '"></i>' +

            '<i class="btn btn-view-data"  data-row="' + meta.row + '" title="view data" data-name="viewData" data-id="' + row["id"] + '"></i>' +
            '<i class="btn btn-delete" data-row="' + meta.row + '" title="delete"></i>';
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

    var form = $('#mgmt-script-form'); //element script form
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

    var form_data = $('#mgmt-view-form'); //element script form
    form_data.on('click', '.source_option-tab', mgmt.sourceOptionTabClick);
    // form_data.on('click', '.rm-tab-source_option', mgmt.removeSourceOptionTabClick);
    // form_data.on('click', '.add-source_option', mgmt.addSourceOptionClick);

    form_data.on('click', '.detail-tab', mgmt.detailTabClick);
    // form_data.on('click', '.rm-tab-detail', mgmt.removeDetailTabClick);
    // form_data.on('click', '.add-detail', mgmt.addDetailClick);
    // form_data.on('change', '.download_driver', mgmt.downloadDriverChange);

    form_data.on('click', '.file-tab', mgmt.fileTabClick);
    // form_data.on('click', '.rm-tab-file', mgmt.removeFileTabClick);
    // form_data.on('click', '.add-file', mgmt.addFileClick);

    $('#download_method').on('change', mgmt.downloadScriptOnChange);

    $('#btn-cancel').on('click', mgmt.hideForm);
    $('#btn-save').on('click', mgmt.btnSaveClick);
    $('#btn-delete').on('click', mgmt.btnDeleteConFirmClick);
}


/**
 * prepare data to edit
 *
 */
mgmt.btnEditClick = function () {
    var btn_view = $(this).attr('data-name'); //type to display scritp data display for edit or view only
    var id = $(this).attr('data-id'); //script id
    var row = $(this).attr('data-row'); //row number
    //var node = mgmt.download_list[row].node; //node
    var data_row = mgmt.dataTable.row($(this).closest('tr')).data();
    var node = data_row.node; //node

    mgmt.tr = $(this).closest('tr');
    mgmt.selectedRow = mgmt.dataTable.row(mgmt.tr);
    mgmt.row_data = mgmt.dataTable.row(mgmt.tr).data();



    mgmt.service_updatecron = "dataimport/rdl/" + node + "/cron";

    if (!node) {
        mgmt.service_updatecron = "dataimport/rdl/node0/cron"
    }

    apiService.SendRequest("GET", mgmt.service + "/" + id, {}, function (rs) {
        if (rs.result != "OK") {
            return false;
        }

        if (btn_view == "viewJson") {
            mgmt.showJson(id, rs.data);
            return false
        }
        if (btn_view == "viewData") {
            $('input[name="name"]').prop('disabled', true);
            $('input[name="retry_count"]').prop('disabled', true);
            $('select[name="download_driver"]').attr('disabled', 'disabled');
            $('input[name="detail_host"]').prop('disabled', true);
            $('select[name="username"]').attr('disabled', 'disabled');
            $('input[name="delete_after_days"]').prop('disabled', true);
            $('input[name="timeout_seconds"]').prop('disabled', true);
            $('input[name="source"]').prop('disabled', true);
            $('input[name="destination"]').prop('disabled', true);

            
            mgmt.node = $("#node").val()
            mgmt.showData(id, rs.data);
            return false
        }
        $('input[name="name"]').prop('disabled', false);
        $('input[name="retry_count"]').prop('disabled', false);
        $('input[name="delete_after_days"]').prop('disabled', false);
        $('input[name="timeout_seconds"]').prop('disabled', false);
        $('input[name="detail_host"]').prop('disabled', false);
        $('select[name="username"]').removeAttr('disabled');
        $('select[name="download_driver"]').removeAttr('disabled');
        $('input[name="source"]').prop('disabled', false);
        $('input[name="destination"]').prop('disabled', false);



        mgmt.showForm(id, rs.data);
        mgmt.node = $("#node").val()
    })


    // apiService.SendRequest("GET", mgmt.service_updatecron, {}, function (rs) {
    //     var result = apiService.getFieldValue(rs, "result"); //data for update cron

    //     if (typeof result === undefined || result == null) {
    //         return
    //     }
    //     for (var i = 0; i < result.length; i++) {
    //         if (JH.GetJsonValue(result[i], "download_id") == id) {
    //             $('#max_process').val(JH.GetJsonValue(result[i], "max_process"));
    //             return false;
    //         }
    //     }
    // })
}


/**
 * display json data of on modal
 *
 * @param {json} id
 * @param {json} rs script id
 */
mgmt.showJson = function (id, rs) {
    var form = $('#dlgDatajson-form'); //element form for display script is json format

    form.find('#dlgDatajson-down-json').val(JSON.stringify(GetJsonValue(rs, "download_setting")));
    $('#dlgDatajson').modal({
        backdrop: 'static'
    })
}


/**
 * clone data to to create new data
 *
 */
mgmt.btnCopy = function () {
    var id = $(this).attr('data-id'); //script id
    var param = {
        download_id: parseInt(id)
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
                            return true
                        }
                    })
                });
            }
        }
    })
}


/**
 * source_option tab click
 */
mgmt.sourceOptionTabClick = function () {
    var source_optionTabs = $(this).closest('ul.source_option-tabs'); //element of tabs source option
    var source_optionTabContent = source_optionTabs.next('div.source_option-tab-content'); //element of content in tabs source option
    var li = $(this).closest('li'); //element li
    var index = li.index(); //index of li

    source_optionTabContent.children('div.tab-pane.active').removeClass('active');
    source_optionTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
    current["source_option"] = index;
}


/**
 * btn remove source_option tab click
 *
 */
mgmt.removeSourceOptionTabClick = function () {
    var source_optionTabs = $(this).closest('ul.source_option-tabs'); // element tabs source option
    var source_optionTabContent = source_optionTabs.next('div.source_option-tab-content'); //element of content in tabs source optio
    var li = $(this).closest('li'); //element li
    var index = li.index(); //index of li
    var lastLi = source_optionTabs.children('li:not(.add-tab):last'); //laste element li
    var lastIndex = lastLi.index(); //index of last element li

    lastLi.remove();
    source_optionTabContent.children('.tab-pane:eq(' + index + ')').remove();

    if (index == current["source_option"]) {
        current["source_option"] = -1;
    }
    if (index == lastIndex) {
        index--;
    }
    source_optionTabs.children('li:eq(' + index + ')').children('a').trigger('click');
    // hostTabs.find('li:eq('+index+')').find('a').css("background-color", "yellow");
}


// add form in source option tab
mgmt.addSourceOptionClick = function () {
    var so = mgmt.addSourceOption($(this)); //add tabs source option
    var dt = mgmt.addDetail(so.find('li.add-tab')); //add detail in tabs

    mgmt.addFile(dt.find('li.add-tab'));
    return so;
}


/**
 * add tab of sorce option
 *
 */
mgmt.addSourceOption = function (el) {
    var ltLast = el.closest('.add-tab'); //element button add new tabs
    var source_optionTabs = ltLast.closest('ul.source_option-tabs'); //element of tabs source oprion
    var source_optionTabContent = source_optionTabs.next('div.source_option-tab-content'); //elemet div content in tabs source eoption
    var index = ltLast.index();

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
    var detailTabs = $(this).closest('ul.detail-tabs'); //element of tabs detail
    var detailTabContent = detailTabs.next('div.detail-tab-content'); //element of content in tabs detail
    var li = $(this).closest('li'); //elemet li
    var index = li.index(); //index of elemet

    detailTabContent.children('div.tab-pane.active').removeClass('active');
    detailTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
    current["detail"] = index;
}


/**
 * btn remove detail tab click
 *
 */
mgmt.removeDetailTabClick = function () {
    var detailTabs = $(this).closest('ul.detail-tabs'); //element of tabs detail
    var detailTabContent = detailTabs.next('div.detail-tab-content'); //element of content in tabs detail
    var li = $(this).closest('li'); //elemnt of li
    var index = li.index(); //index of eleme tli
    var lastLi = detailTabs.children('li:not(.add-tab):last'); //last element li in tabs
    var lastIndex = lastLi.index(); //index of last element li

    lastLi.remove();
    detailTabContent.children('.tab-pane:eq(' + index + ')').remove();

    if (index == current["detail"]) {
        current["detail"] = -1;
    }
    if (index == lastIndex) {
        index--;
    }
    detailTabs.children('li:eq(' + index + ')').children('a').trigger('click');
}


/**
 * add detail tab
 *
 */
mgmt.addDetailClick = function () {
    var dt = mgmt.addDetail($(this));
    return dt;
}


/**
 * add tab of detail
 *
 */
mgmt.addDetail = function (el) {
    var ltLast = el.closest('.add-tab'); //element of buton add new tabs
    var detailTabs = ltLast.closest('ul.detail-tabs'); //element of tabs detail
    var detailTabContent = detailTabs.next('div.detail-tab-content'); //element of content in tabs
    var index = ltLast.index(); //index of element

    index++;
    // add detail tab
    ltLast.before('<li class="nav-item"><a href="#" class="detail-tab nav-link" data-toggle="tab">detail#' + index + '</a></li>');
    // add detail tab-content
    var newContent = $('#pane-detail-master').clone().removeClass('hidden').removeAttr('id');
    newContent.find('select').removeAttr('id');
    newContent.find('select.metadata_select').multiselect({
        enableFiltering: true
    });
    detailTabContent.append(newContent);

    detailTabs.find('.detail-tab:last').trigger('click');
    return newContent;
}


/**
 * download driver change
 *
 */
mgmt.downloadDriverChange = function () {
    var tabPane = $(this).closest('div.tab-pane'); //element of tab pane
    var v = $(this).val(); //download driver
    var o = mgmt.option["download_driver"][v]; //host

    if (typeof o === "undefined") {
        return false;
    }
    tabPane.find('.download_driver_ctrl').hide();
    if (typeof o["enable"] !== "undefined") {
        tabPane.find('.download_driver_ctrl_' + o["enable"]).show();
    }
}


/**
 * file tab click
 *
 */
mgmt.fileTabClick = function () {
    var fileTabs = $(this).closest('ul.file-tabs'); //element tabs pane of file
    var fileTabContent = fileTabs.next('div.file-tab-content'); //element content in tabs file
    var li = $(this).closest('li'); //elemt li in tabs file
    var index = li.index(); //index of elemt li in tabs file

    fileTabContent.children('div.tab-pane.active').removeClass('active');
    fileTabContent.children('div.tab-pane:eq(' + index + ')').addClass('active');
    current["file"] = index;
}


/**
 * btn remove file tab click
 *
 */
mgmt.removeFileTabClick = function () {
    var fileTabs = $(this).closest('ul.file-tabs'); //element tabs pane of file
    var fileTabContent = fileTabs.next('div.file-tab-content'); //element content in tabs file
    var li = $(this).closest('li'); //element li in tabs file
    var index = li.index(); //index of element tabs
    var lastLi = fileTabs.children('li:not(.add-tab):last'); //last element li in tabs
    var lastIndex = lastLi.index(); //index of last eleme tli in tabs

    lastLi.remove();
    fileTabContent.children('.tab-pane:eq(' + index + ')').remove();

    if (index == current["file"]) {
        current["file"] = -1;
    }
    if (index == lastIndex) {
        index--;
    }
    fileTabs.children('li:eq(' + index + ')').children('a').trigger('click');
}


/**
 * add file tab
 *
 */
mgmt.addFileClick = function () {
    $('input[name="name"]').prop('disabled', false);
        $('input[name="retry_count"]').prop('disabled', false);
        $('input[name="delete_after_days"]').prop('disabled', false);
        $('input[name="timeout_seconds"]').prop('disabled', false);
        $('input[name="detail_host"]').prop('disabled', false);
        $('select[name="username"]').removeAttr('disabled');
        $('select[name="download_driver"]').removeAttr('disabled');
        $('input[name="source"]').prop('disabled', false);
        $('input[name="destination"]').prop('disabled', false);
    mgmt.addFile($(this));
}


/**
 * add new tab of file
 *
 */
mgmt.addFile = function (el) {
    var ltLast = el.closest('.add-tab'); //element of button add new tabs file
    var fileTabs = ltLast.closest('ul.file-tabs'); //eleemnt of tabs file
    var fileTabContent = fileTabs.next('div.file-tab-content'); //element content of in tabs file
    var index = ltLast.index(); //index of element in tabs file

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
    var o = mgmt.option["download_method"][v]; //the data for download method
    if (typeof o === "undefined") {
        return false;
    }
    if (typeof o["enable"] !== "undefined") {
        $('.dl_script_ctrl_' + o["enable"]).show();
    }
}


/**
 * add data to table
 *
 */
mgmt.handlerDownloadList = function (rs) {
    mgmt.dataTable.clear();
    mgmt.dataTable.rows.add(rs);
    mgmt.dataTable.draw();
}


/**
 * prepare data to generate option
 *
 */
mgmt.handlerSelectOption = function (rs) {
    mgmt.SelectOption = rs;
    mgmt.genSelect('download_method', rs["download_method"]);
    mgmt.genSelect('download_driver', rs["download_driver"]);
    mgmt.genSelect('agent_user', rs["agent_user"]);
    mgmt.genSelect('node', rs["rdl_nodes"]);

    mgmt.genSelect('download_method_data', rs["download_method"]);
    mgmt.genSelect('download_driver_data', rs["download_driver"]);
    mgmt.genSelect('agent_user_data', rs["agent_user"]);
    mgmt.genSelect('node_data', rs["rdl_nodes"]);
}


/**
 * generate optin into dropdown
 *
 * @param {string} el element id
 * @param {json} rs the data for generate option
 */
mgmt.genSelect = function (el, rs) {
    var select = document.getElementById(el); //element of dropdown

    if (typeof rs === "undefined") {
        return false;
    }
    if (typeof mgmt.option[el] === "undefined") {
        mgmt.option[el] = {};
    }
    if (rs.result != "OK") {
        return false;
    }

    var data_option = apiService.getFieldValue(rs, 'data'); //the data to generate option

    if (data_option == null) {
        return
    }
    for (var i = 0; i < data_option.length; i++) {
        var data = data_option[i]; //the data to generate option
        var option = document.createElement("option"); //create elment option
        var txt_option = data["text"]; //opion name
        var val_option = data["value"]; //option value
        mgmt.option[el][val_option] = data;

        option.text = txt_option;
        option.value = val_option;
        select.add(option);
    }
}


/**
 * display form add data
 *
 */
mgmt.addMetadata = function () {
    mgmt.showForm();
}


/**
 * display form add or edit data
 *
 */
mgmt.showForm = function (id, d) {
    $('.data-filters').hide();
    $('#mgmt-script-form').parsley().reset();
    mgmt.data = {};
    mgmt.isEdit = false;
    if (typeof d !== "undefined") {
        mgmt.data = d;
        mgmt.dataId = id;
        mgmt.isEdit = true;
    }
    var form = $('#mgmt-script-form'); //elemet of script form

    form.find('.source_option-tabs > li:not(.add-tab)').remove();
    form.find('.source_option-tab-content').empty();

    form.find('.ci-tabs > li:not(.add-tab)').remove();
    form.find('.ci-tab-content').empty();

    $('#tbl_wrapper').addClass('hidden');
    form[0].reset();
    form.removeClass('hidden');
    form.find('#download_method').triggerHandler('change')

    if (!mgmt.isEdit) {
        $('#btn-on-off').hide();
        $('.switch').hide();
        mgmt.addSourceOption(form.find('.add-source_option'));
        mgmt.addDetail(form.find('.add-detail'));
        mgmt.addFile(form.find('.add-file'));

        var frm = form.find('.add-source_option'); //elemt form source option
        return false;
    }

    // Button switch on-off crontab setting
    var is_cronenable = JH.GetJsonValue(d, "is_cronenabled"); //is cronebled data

    if (is_cronenable == true) {
        $('#cron-switch').bootstrapToggle('on')
    } else {
        $('#cron-switch').bootstrapToggle('off')
    }

    $('#btn-on-off').show();
    $('.switch').show();

    // in edit mode
    // load source_options
    var ds = JH.GetJsonValue(d, "download_setting"); //dowmload setting data

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


    //var cron = $('#crontab-modal');
    //var crontab = JH.GetJsonValue(d, "crontab_setting");
    //var listcron = crontab.split(" ");
    //console.log(listcron);
    //cron.find('#minuteArray').val(listcron[0].substring(2,listcron[0].length));

    mgmt.loadEditSourceOption(form, JH.GetJsonValue(ds, "source_options"));
}


mgmt.showData = function (id, d) {
    console.log('id',id)
    $('.data-filters').hide();
    $('#mgmt-view-form').parsley().reset();


    mgmt.data = {};
    // mgmt.isEdit = false;
    // if (typeof d !== "undefined") {
    //     mgmt.data = d;
    //     mgmt.dataId = id;
    //     mgmt.isEdit = true;
    // }
    var form = $('#mgmt-view-form'); //elemet of script form

    form.find('.source_option-tabs > li:not(.add-tab)').remove();
    form.find('.source_option-tab-content').empty();

    form.find('.ci-tabs > li:not(.add-tab)').remove();
    form.find('.ci-tab-content').empty();

    // $('#tbl_wrapper').addClass('hidden');
    // form[0].reset();
    // form.removeClass('hidden');
    form.find('#download_method').triggerHandler('change')

    // if (!mgmt.isEdit) {
    //     $('#btn-on-off').hide();
    //     $('.switch').hide();
    //     mgmt.addSourceOption(form.find('.add-source_option'));
    //     mgmt.addDetail(form.find('.add-detail'));
    //     mgmt.addFile(form.find('.add-file'));

    //     var frm = form.find('.add-source_option'); //elemt form source option
    //     return false;
    // }

    // Button switch on-off crontab setting
    var is_cronenable = JH.GetJsonValue(d, "is_cronenabled"); //is cronebled data

    if (is_cronenable == true) {
        $('#cron-switch').bootstrapToggle('on')
    } else {
        $('#cron-switch').bootstrapToggle('off')
    }

    $('#btn-on-off').show();
    $('.switch').show();

    // in edit mode
    // load source_options
    var ds = JH.GetJsonValue(d, "download_setting"); //dowmload setting data

    form.find('#download_id').val(JH.GetJsonValue(d, "id"));
    form.find('#download_method').val(JH.GetJsonValue(d, "download_method")).triggerHandler('change');
    form.find('#download_name').val(JH.GetJsonValue(d, "download_name"));
    form.find('#crontab_setting').val(JH.GetJsonValue(d, "crontab_setting"));
    form.find('#node_data').val(JH.GetJsonValue(d, "node"));
    form.find('#description').val(JH.GetJsonValue(d, "description"));
    form.find('#agent_user_data').val(JH.GetJsonValue(d, "agent_user_id")).triggerHandler('change');
    form.find('#max_process').val(JH.GetJsonValue(d, "max_process"));
    form.find('#archive_folder').val(JH.GetJsonValue(ds, "archive_folder"));
    form.find('#result_file').val(JH.GetJsonValue(ds, "result_file"));
    form.find('#data_folder').val(JH.GetJsonValue(ds, "data_folder"));


    //var cron = $('#crontab-modal');
    //var crontab = JH.GetJsonValue(d, "crontab_setting");
    //var listcron = crontab.split(" ");
    //console.log(listcron);
    //cron.find('#minuteArray').val(listcron[0].substring(2,listcron[0].length));

    mgmt.loadEditSourceOption(form, JH.GetJsonValue(ds, "source_options"));
    $('#showData').modal({
        backdrop: 'static'
    })
}

/**
 * put data into form source option tab
 *
 */
mgmt.loadEditSourceOption = function (form, so) {
    var name = ""; //name of element
    for (var i = 0; i < so.length; i++) {
        var s = so[i]; //the data to generate option
        var paneSource = mgmt.addSourceOption(form.find('.add-source_option'));
        paneSource.find('input[name="retry_count"]').val(JH.GetJsonValue(s, "retry_count"));
        paneSource.find('input[name="name"]').val(JH.GetJsonValue(s, "name"));
        var details = JH.GetJsonValue(s, "details");

        for (var j = 0; j < details.length; j++) {
            var detail = details[j];
            var paneDetail = mgmt.addDetail(paneSource.find('.add-detail'));
            var host = JH.GetJsonValue(detail, "host").split("://");
            var hostUrl = host[1];
            paneDetail.find('.download_driver').val(host[0] + "://").trigger('change');
            if (paneDetail.find('.download_driver_ctrl').is(":visible")) {
                var u_h = hostUrl.split("@");
                var user_pass = u_h[0].split(":");
                var dad = JH.GetJsonValue_Int(detail, "delete_after_days");
                paneDetail.find('input[name="username"]').val(user_pass[0]);
                paneDetail.find('input[name="password"]').val(user_pass[1]);
                paneDetail.find('input[name="delete_after_days"]').val(dad);
                hostUrl = u_h[1];
            }
            paneDetail.find('.detail_host').val(hostUrl);

            paneDetail.find('input[name="timeout_seconds"]').val(JH.GetJsonValue(detail, "timeout_seconds"));
            var files = JH.GetJsonValue(detail, "files");
            for (var k = 0; k < files.length; k++) {
                var file = files[k];
                var paneFile = mgmt.addFile(paneDetail.find('.add-file'));
                paneFile.find('input[name="source"]').val(JH.GetJsonValue(file, "source"));
                paneFile.find('input[name="destination"]').val(JH.GetJsonValue(file, "destination"));
            }
        }

        if (name == "") {
            name = JH.GetJsonValue(s, "name");
        }
    }
    form.find("#name").val(name);
}

/**
 * hidden form when click to cancel on form add or edit
 *
 */
mgmt.hideForm = function () {
    $('.data-filters').show();
    $('#tbl_wrapper').removeClass('hidden');
    $('#mgmt-script-form').addClass('hidden');
}


/**
 * save data
 *
 */
mgmt.btnSaveClick = function () {
    $('#mgmt-script-form').parsley().validate();
    if (!$('#mgmt-script-form').parsley().isValid()) {
        return false;
    }

    var full_agency = $('#agent_user option:selected').text(); //agency full name
    var pre_agency = full_agency.substring(0, 10); //ageny short name

    if (pre_agency == 'dataimport') {
        var agency_param = full_agency.substring(11); //parameter agency
    }

    var download_method_selected = $('#download_method option:selected').val(); //download method
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

    var param = mgmt.data; //initial script data

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

    var so = param.download_setting.source_options; //source option
    var soTabs = $('#mgmt-script-form .source_option-tab-content').children('div.tab-pane'); //element children tabs pane

    if (typeof soTabs === undefined || soTabs == null) {
        return false
    }
    for (var i = 0; i < soTabs.length; i++) {
        var soTab = $(soTabs[i]); //elent tabs
        var so_o = {
            name: soTab.find('input[name="name"]').val(),
            details: []
        };

        if (soTab.find('input[name="retry_count"]').val() != "") {
            so_o["retry_count"] = parseInt(soTab.find('input[name="retry_count"]').val());
        }

        var detailTabs = soTab.find('.detail-tab-content').children('div.tab-pane'); //element children tabs pane
        if (typeof detailTabs === undefined || detailTabs == null) {
            return false
        }
        for (var j = 0; j < detailTabs.length; j++) {
            var detailTab = $(detailTabs[j]); //element detail tabs pane
            var detail_o = {
                host: detailTab.find('select[name="download_driver"]').val() + detailTab.find('input[name="detail_host"]').val(),
                delete_after_days: 0,
                files: [],
                timeout_seconds: parseInt(detailTab.find('input[name="timeout_seconds"]').val()),
            }
            if (detailTab.find('.download_driver_ctrl').is(':visible')) {
                var user_pass = detailTab.find('input[name="username"]').val() + ":" + detailTab.find('input[name="password"]').val(); //user and  password
                detail_o["host"] = detail_o["host"].replace("://", "://" + user_pass + "@");
                detail_o["delete_after_days"] = parseInt(detailTab.find('input[name="delete_after_days"]').val());
            }
            var filesTabs = detailTab.find('.file-tab-content').children('div.tab-pane');
            if (typeof filesTabs === undefined || filesTabs == null) {
                return false
            }
            for (var k = 0; k < filesTabs.length; k++) {
                var filesTab = $(filesTabs[k]);
                var files_o = {
                    source: filesTab.find('input[name="source"]').val(),
                    destination: filesTab.find('input[name="destination"]').val(),
                }

                detail_o["files"].push(files_o);
            }

            so_o["details"].push(detail_o);
        };


        so.push(so_o);
    }
    var method = "POST";
    var val_node = $('#node').val();
    var node = "node0"
    if (val_node) {
        node = val_node;
    }
    mgmt.service_dataimport_download = "dataimport/rdl/" + node + "/download";
    mgmt.service_updatecron = "dataimport/rdl/" + node + "/cron";
    if (mgmt.isEdit) {
        method = "PUT";

    }
    console.log('Result',param)

    apiService.SendRequest(method, mgmt.service, param, function (rs, data) {
        var json_data = rs.data; //the data download import
        // apiService.SendRequest('POST', mgmt.service_dataimport_download, json_data, function (data) {
        //     if (data.result !== true) {
        //         return false
        //     }

        if (method == 'POST') {
            bootbox.alert(msg_save_suc, function () {
                location.reload();
                return false
            })
        }else{
            location.reload();

        }

        if (rs.result == "OK" && method == "PUT") {
            var form = $('#tbl_wrapper'); //element table
            form.removeClass('hidden');
            $('#mgmt-script-form').addClass('hidden');

            // var cron_switch = $('#cron-switch').is(':checked')
            // if (typeof mgmt.row_data !== 'undefined') {
            // mgmt.row_data["download_name"] = $('#download_name').val();
            // mgmt.row_data["download_method"] = $('#download_method').val();
            // mgmt.row_data["crontab_setting"] = $('#crontab_setting').val();
            // mgmt.row_data["description"] = $('#description').val();
            // mgmt.row_data["is_cronenabled"] = cron_switch;
            // }


            //Remove old node when new node is not old node.
            // if (node !== mgmt.node) {
            //     newnode = val_node ? mgmt.node : node;
            //     mgmt.service_updatecron = "dataimport/rdl/" + newnode + "/cron";
            // }


            // apiService.SendRequest('DELETE', mgmt.service_updatecron, param_cron, function (op) {
            //     if (op.result !== true) {
            //         return false
            //     }

            //     // Turn on
            //     if (cron_switch == true) {
            //         param_cronenabled['is_cronenabled'] = true;
            //         apiService.SendRequest('PUT', mgmt.service_iscronenabled + "/" + download_id_val, param_cronenabled, function (op) {
            //             if (op.result !== 'OK') {
            //                 return false
            //             }

            //             apiService.SendRequest('POST', mgmt.service_updatecron, param_cron, function (op) {
            //                 mgmt.node = null;
            //                 if (op.result !== true) {
            //                     return false
            //                 }

            //                 //mgmt.dataTable.row(mgmt.tr).data(mgmt.row_data).draw();

            //             })
            //         })
            //     }
            //     else {
            //         param_cronenabled['is_cronenabled'] = false,
            //             apiService.SendRequest('PUT', mgmt.service_iscronenabled + "/" + download_id_val, param_cronenabled, function (op) {
            //                 if (op.result !== 'OK') {
            //                     return false
            //                 }
            //             })
            //     }

            //     mgmt.row_data["is_cronenabled"] = cron_switch;
            //     mgmt.dataTable.row(mgmt.tr).data(mgmt.row_data).draw();
            //     bootbox.alert(msg_save_suc, function () {

            //     })
            // })

            // mgmt.row_data["is_cronenabled"] = cron_switch;
            // mgmt.dataTable.row(mgmt.tr).data(mgmt.row_data).draw();
            if (mgmt.selectedRow) {
                var data = mgmt.selectedRow.data();
                data["download_name"] = $('#download_name').val();
                data["download_method"] = $('#download_method').val();
                data["description"] = $('#description').val();
                data["is_cronenabled"] = cron_switch;
                mgmt.selectedRow.data(data).draw();
                mgmt.selectedRow = null;
            }
            bootbox.alert(msg_save_suc, function () {})
        }
        // });

    });
}


/**
 * delete data on table
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
 * alert confirm delete data on table
 *
 */
mgmt.btnDeleteConFirmClick = function () {
    if (mgmt.deleteRow == "") {
        return false;
    }
    var id = JH.GetJsonValue(mgmt.deleteRow.data()[0], "id"); //download id
    var param = { download_id: id }
    // get node from db
    // apiService.SendRequest("GET", mgmt.service + "/" + id, {}, function (rs) {
    //     if (rs.result != "OK") {
    //         return false;
    //     }

    //     var node = JH.GetJsonValue(rs.data, "node");
    //     if (node){
    //         // remove from converter
    //         apiService.SendRequest("DELETE", "dataimport/rdl/" + node + "/cron", {});

    //     }
    // remove from db
    apiService.SendRequest("DELETE", mgmt.service + "/" + id, param, function (rs) {
        if (rs.result != "OK") {
            alert(rs.data);
            return false;
        }
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
    // })
}


/**
 * start service for script
 *
 */
mgmt.btnPlayClick = function () {
    var down_id = parseInt($(this).attr('download-id')); //download id
    var down_med = $(this).attr('download-method'); //download method
    var name = $(this).attr('name'); //download name
    var row = $(this).attr('data-row'); //row number
    var node = mgmt.download_list[row].node; //node

    // mgmt.service_run = "dataimport/rdl/" + node + "/ps"

    // if (!node) {
    //     mgmt.service_run = 'dataimport/rdl/node0/ps'
    // }


    var param = {
        download_id: down_id,
        download_script: down_med
    }

    var s = mgmt.translator['msg_con_run'].replace('%s', name); //message confirm run cron
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
                            // location.reload();
                        }
                    })
                })
                return true
            }
        }
    })
}


/**
 * stop service for script
 *
 */
mgmt.btnPauseClick = function () {
    var down_id = parseInt($(this).attr('download-id')); //download id
    var down_med = $(this).attr('download-method'); //download method
    var name = $(this).attr('name'); //download name
    var row = $(this).attr('data-row'); //row number
    var node = mgmt.download_list[row].nod; //node

    // mgmt.service_run = "dataimport/rdl/" + node + "/ps"

    // if (!node) {
    //     mgmt.service_run = 'dataimport/rdl/node0/ps'
    // }
    var param = {
        download_id: down_id
    }

    var s = mgmt.translator['msg_con_pause'].replace('%s', name); //message confirm pause run cron
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
                                // location.reload();
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
                        var text = jqXHR.responseText; //text respone error from service
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
                                        callback: function () { }
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


/**
 * input only eng
 *
 */
$(function () {
    $('div').find('input[name="name"]').keypress(function (event) {
        var ew = event.which;
        if (ew >= 32 && ew <= 126) {
            return true;
        } else if (ew === 8) {
            return true;
        }
        return false;
    });
})
