var mgmt = {};
var dlg_id = '#dlg-mgmt-cron';

/**
* Initial page load.
*
* @param {json} translator Text for use on page.
*/
mgmt.init = function(translator) {
    mgmt.translator = translator; //Text for label and message on javascript
    mgmt.service_node = 'dataimport/rdl/node0/cron';
    mgmt.service = 'thaiwater30/backoffice/dataimport_config/api_cron_list';
    mgmt.service_put = 'thaiwater30/backoffice/dataimport_config/api_cron_list/';
    mgmt.service_run = 'thaiwater30/backoffice/dataimport_config/api_cron_run/';

    //*data table setting
    mgmt.tableCron = 'tbl-mgmt-cron'; //element id of data table
    ctrl = $('#' + mgmt.tableCron);
    mgmt.dataTable = ctrl.DataTable({
        dom : 'frltip',
        "iDisplayLength": 50,
        // buttons : [ {
        // 	text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> Cron',
        // 	action : mgmt.editData
        // } ],
        language: g_dataTablesTranslator,
        columns: [
            {
                defaultContent : '',
                orderable : false,
                searchable : false,
            }, {
                data: 'setting_name',
            },  {
                data: 'interval',
            }, {
                data: mgmt.renderToolButtons,
                orderable: false,
                searchable: false,
            }
        ],
        order: [
            [0, 'asc']
        ]
    })

    mgmt.dataTable.on('order.dt search.dt', function() {
        mgmt.dataTable.column(0, {
            search : 'applied',
            order : 'applied'
        }).nodes().each(function(cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();

    apiService.SendRequest('GET', mgmt.service, '', mgmt.putRenderTable)
    
    /* ctrl.on('click', '.btn-delete',mgmt.deleteData); */
    ctrl.on('click', '.btn-edit',mgmt.editData);
    ctrl.on('click', '.btn-play', mgmt.playCron);
    

    $('#btn-save').on('click', mgmt.saveData);

    
}

mgmt.putRenderTable = function(rs){
    mgmt.dataTable.clear();
    if(typeof rs.result === 'undefined'){return false}
    mgmt.dataTable.rows.add(JH.GetJsonValue(rs,'data'))
    mgmt.dataTable.draw();
}

mgmt.renderToolButtons = function(row){
    var s = mgmt.translator['not_edit_remove'].replace('%s',row.name);
    if(row.setting_name){
        return '<i class="btn btn-play" title="play"></i><i class="btn btn-edit" title="'+mgmt.translator['btn_edit']+'"></i>';
    }
    else{
        return '<i class="fa fa-info-circle" aria-hidden="true" data-toggle="tooltip" title="'+s+'"></i>'
    }
}

mgmt.playCron = function(){
    var data = mgmt.dataTable.row( $(this).closest('tr') ).data();
    var setting_name = JH.GetJsonValue(data, 'setting_name');

    apiService.SendRequest('PUT', mgmt.service_run + setting_name , null, function(data){
        if ( data.result == "OK"){
            bootbox.alert(mgmt.translator['msg_run_suc']);
        }
    });
}
mgmt.editData = function(){
    var frm = $(dlg_id+'-form');
    frm.parsley().reset();
    $('ul.parsley-errors-list').remove();
    frm[0].reset();

    var data = mgmt.dataTable.row( $(this).closest('tr') ).data();
    var cron_arr = JH.GetJsonValue(data,'interval').split(' ');

    console.log("Data:",data);

    $(dlg_id+'-cron-name').val(JH.GetJsonValue(data,'setting_name'));
    $(dlg_id+'-id').val(JH.GetJsonValue(data,'download_id'));
    for(var i=0; i<cron_arr.length; i++){
        $(dlg_id+'-crontab_setting-'+i).val(cron_arr[i]);
    }


    $("input[name='crontab']").keypress(function(event){
        var ew = event.which;
        if(ew >= 32 && ew <=126){
            return true;
        }else if(ew === 8){
            return true;
        }
        return false;
    });


    $(dlg_id).modal('show');
}

mgmt.saveData = function(){
    var frm = $(dlg_id+'-form');
    var dl_id = $(dlg_id+'-id').val();
    var setting_name = $(dlg_id+'-cron-name').val();
    frm.parsley().validate();
    if(!frm.parsley().isValid()){
        return false
    }


    var param = {
        crontab_setting:mgmt.getCrontabSetting(),
    }

    mgmt.service_put += setting_name

    apiService.SendRequest('PUT', mgmt.service_put, param, function(data, status, jqxhr){
        if (data["result"] == "NO"){
            bootbox.alert({
                message: mgmt.translator['msg_save_unsuc'],
                buttons: {
                    ok: {
                        label: mgmt.translator['btn_close']
                    }
                }
            });
            return false;
        }
        bootbox.alert({
            message: mgmt.translator['msg_save_suc'],
            buttons: {
                ok: {
                    label: mgmt.translator['btn_close']
                }
            },callback: function(){
                location.reload()
            }
        });
    });
    return true;

}

mgmt.getCrontabSetting = function(data){
    var crontab_setting_data = '';

    $('form#dlg-mgmt-cron-form').find('input[name="crontab"]').each( function(i){
        i<4? crontab_setting_data += $(this).val()+' ' : crontab_setting_data += $(this).val()
    } )

    return crontab_setting_data
}

mgmt.iniParam_discron = function(data){
    var param = {
        download_id: data.download_id,
        download_script: data.download_method,
        interval:data.crontab_setting,
        max_process: 10,
        additional_params:[],
        agency: data.agency
    }

    return param
}
