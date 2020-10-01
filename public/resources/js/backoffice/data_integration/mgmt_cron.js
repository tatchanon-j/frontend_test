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
    mgmt.service = 'thaiwater30/backoffice/dataimport_config/download_cron_list';
    mgmt.service_iscronenabled = "thaiwater30/backoffice/dataimport_config/iscronenabled"; //service iscronebled

    //*data table setting
    mgmt.tableCron = 'tbl-mgmt-cron'; //element id of data table
    ctrl = $('#' + mgmt.tableCron);
    mgmt.dataTable = ctrl.DataTable({
      dom: 'frl<"activebtn">Btip',
  		buttons : [{
  			extend : 'excelHtml5',
  			text : ' <i class="fa fa-file-excel-o color-green" aria-hidden="true"></i> excel',
  		} ],
        "iDisplayLength": 50,
        language: g_dataTablesTranslator,
        columns: [
            {
                data: 'download_id',
            }, {
                data: 'download_name',
            }, {
                data: 'description',
            },  {
                data: 'download_method',
            }, {
                data: 'agency',
            },  {
                data: 'crontab_setting',
            },{
              data: mgmt.renderStatus,
            }, {
                data: mgmt.renderToolButtons,
                orderable: false,
                searchable: false,
            }
        ],
        order: [
            [0, 'asc']
        ],
        initComplete: function(){
          $("div.activebtn").html('<label style="margin-left:10px">สถานะ Cron:</label><select id="selectField" style="width:20%;padding: 1px 10px;margin: 1px;"><option value="">ทั้งหมด</option><option [ngValue]="true">' +status_disable+'</option><option [ngValue]="false">'+status_enable+'</option></select>');
          $('#selectField').on('change', function () {
            var selectedCountry = $(this).children("option:selected").val();
              mgmt.dataTable.column(6).search($(this).val()).draw();
          })
       },
    })

    apiService.SendRequest('GET', mgmt.service, '', mgmt.putRenderTable)

    ctrl.on('click', '.btn-play',mgmt.playData);
    ctrl.on('click', '.btn-stop',mgmt.stopData);
    ctrl.on('click', '.btn-edit',mgmt.editData);

    $('#btn-save').on('click', mgmt.saveData);
}

/**
 * put data into column status
 *
 * @param {json} row The data for the whole row
 */
mgmt.renderStatus = function (row) {
   //diplay status to red color

  if (JH.GetJsonValue(row, "is_cronenabled") == true) {
      s = '<font color="green">' + status_enable + '</font>';
  } else if (JH.GetJsonValue(row, "is_cronenabled") == false){
    var s = '<font color="red">' + status_disable + '</font>';
  }
  return s;
}


mgmt.putRenderTable = function(rs){
    mgmt.dataTable.clear();
    if(typeof rs.result === 'undefined'){return false}
    mgmt.dataTable.rows.add(JH.GetJsonValue(rs,'data'))
    mgmt.dataTable.draw();
}

mgmt.renderToolButtons = function(row){
  return '<i class="btn btn-play" title="'+mgmt.translator['title_btn_run_cron']+'"></i>'+
         '<i class="btn btn-stop" title="'+mgmt.translator['title_btn_stop_cron']+'"></i>'+
         '<i class="btn btn-edit" title="'+mgmt.translator['btn_edit']+'"></i>';         
}

mgmt.playData = function(){
  var data = mgmt.dataTable.row( $(this).closest('tr') ).data();
  var download_id = data.download_id;
  var param_node = mgmt.iniParam_discron(data);
  var param_cronenabled = {
    is_cronenabled:true,
    dataimport_download_id: download_id.toString()
  }

  console.log("Data:",data);
  console.log("param_node:",param_node);
  console.log("Param_cronenabled:",param_cronenabled);

  apiService.SendRequest('POST', mgmt.service_node, param_node, function(rs){
    if(!rs.result){
      bootbox.alert({
        message: mgmt.translator['msg_run_unsuc'],
        buttons:{
          ok:{
            label:mgmt.translator['btn_close']
          }
        }
      });
      return false
    }else{
      apiService.SendRequest('PUT', mgmt.service_iscronenabled+"/"+data.download_id, param_cronenabled, function(rs){
        if(rs.result !== 'OK'){
          bootbox.alert({
            message: mgmt.translator['msg_run_unsuc'],
            buttons:{
              ok:{
                label:mgmt.translator['btn_close']
              }
            }
          });
          return false
        }
        else{
          bootbox.alert({
            message: mgmt.translator['msg_run_suc'],
            buttons:{
              ok:{
                label:mgmt.translator['btn_close']
              }
            },
            callback: function(){
              // location.reload();
            }
          });
        }
      })
    }
  })
}

mgmt.stopData = function(){
  var data = mgmt.dataTable.row( $(this).closest('tr') ).data();
  var download_id = data.download_id;
  var param_node = mgmt.iniParam_discron(data);
  var param_cronenabled = {
    is_cronenabled:false,
    dataimport_download_id: download_id.toString()
  }

  console.log("Data:",data);
  console.log("param_node:",param_node);
  console.log("Param_cronenabled:",param_cronenabled);

  apiService.SendRequest('POST', mgmt.service_node, param_node, function(rs){
    if(!rs.result){
      bootbox.alert({
        message: mgmt.translator['msg_stop_unsuc'],
        buttons:{
          ok:{
            label:mgmt.translator['btn_close']
          }
        }
      });
      return false
    }else{
      apiService.SendRequest('PUT', mgmt.service_iscronenabled+"/"+data.download_id, param_cronenabled, function(rs){
        if(rs.result !== 'OK'){
          bootbox.alert({
            message: mgmt.translator['msg_stop_unsuc'],
            buttons:{
              ok:{
                label:mgmt.translator['btn_close']
              }
            }
          });
          return false
        }
        else{
          bootbox.alert({
            message: mgmt.translator['msg_stop_suc'],
            buttons:{
              ok:{
                label:mgmt.translator['btn_close']
              }
            },
            callback: function(){
              // location.reload();
            }
          });
        }
      })
    }
  })
}

mgmt.editData = function(){
  var frm = $(dlg_id+'-form');
  frm.parsley().reset();
  $('ul.parsley-errors-list').remove();
  frm[0].reset();

  var data = mgmt.dataTable.row( $(this).closest('tr') ).data();
  var cron_arr = JH.GetJsonValue(data,'crontab_setting').split(' ');

  console.log("Data:",data);

  $(dlg_id+'-agency').val(JH.GetJsonValue(data,'agency'));
  $(dlg_id+'-dl-script').val(JH.GetJsonValue(data,'download_method'));
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
  var ag = $(dlg_id+'-agency').val();
  frm.parsley().validate();
  if(!frm.parsley().isValid()){
    return false
  }


  var param_1 = {
      download_id: parseInt(dl_id),
      crontab_setting:mgmt.getCrontabSetting(),
      agency: ag
    }

  var param_2 = {
    download_id: parseInt(dl_id),
    download_script: $(dlg_id+'-dl-script').val(),
    interval:mgmt.getCrontabSetting(),
    max_process: 10,
    additional_params:[],
    agency: ag
  };

  console.log("Param1:",param_1);
  console.log("Param2:",param_2);

  apiService.SendRequest('PUT', mgmt.service+'/'+dl_id, param_1, function(rs){
    mgmt.result_1 = rs.result;
    if(rs.result !== 'OK'){
      bootbox.alert({
        message: mgmt.translator['msg_save_unsuc'],
        buttons:{
          ok:{
            label:mgmt.translator['btn_close']
          }
        }
      });
      return false
    }else{
      apiService.SendRequest('POST', mgmt.service_node, param_2, function(rs){
        if(!rs.result){
          bootbox.alert({
            message: mgmt.translator['msg_save_unsuc'],
            buttons:{
              ok:{
                label:mgmt.translator['btn_close']
              }
            }
          });
          return false
        }else{
          bootbox.alert({
            message: mgmt.translator['msg_save_suc'],
            buttons:{
              ok:{
                label:mgmt.translator['btn_close']
              }
            },
            callback: function(){
              location.reload();
            }
          });
        }
      })
    }
  })



}

mgmt.getCrontabSetting = function(data){
  var crontab_setting_data = '';

  $('form#dlg-mgmt-cron-form').find('input[name="crontab"]').each( function(i){
    i<4? crontab_setting_data += $(this).val()+' ' : crontab_setting_data += $(this).val()
  } )

  return crontab_setting_data
}

// mgmt.iniParam = function(data){
//   var param = {
//       download_id: parseInt(dl_id),
//       download_script: $(dlg_id+'-dl-script').val(),
//       interval:mgmt.getCrontabSetting(),
//       max_process: 10,
//       additional_params:[],
//       agency: ag
//     }
//
//     return param
// }

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
