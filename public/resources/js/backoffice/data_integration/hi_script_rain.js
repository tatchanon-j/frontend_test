/**
*
*   Main JS application file for history run script for rain page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var hs = {
  cache : {}
};
var init_hiscript; //initial dat



/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
hs.init = function(translator){
  hs.translator = translator; //Text for label and message on javascript
  hs.service = "thaiwater30/backoffice/dataimport_config_migrate/history"; //service history
  hs.service_redownload = "dataimport/rdl/node0/ps"; //service nod

  hs.enableMultiSelect('metadata');
  hs.enableMultiSelect('status');
  ctrl = $('#tbl');
  hs.dataTable = ctrl.DataTable({
    dom : 'frltip',
    language : g_dataTablesTranslator,
    columns : [{
      data: hs.renderColumnMeatadataServiceName,
    },
    {
      data: hs.renderColumnBegin_at,
    },{
      data: hs.renderColumnEnd_at,
    },{
      data: hs.renderColumnDuration_time,
    },{
      data: hs.renderColumnSatatus,
    },
    {
      data: 'filesize',
    },{
      data: hs.renderColumnEvent_code,
    },{
      data: hs.renderReRunBtn,
    }],
    order : [ [ 2, 'desc' ] ]
  });

  $('#btn_preview').on('click' , hs.btnPreviewOnClick);

  ctrl.on('click','.btn-download', hs.reDownload);
  ctrl.on('click','.btn-convert', hs.reConvert);

  apiService.SendRequest("GET" , hs.service+"_page" , {} , function(rs){
    if ( JH.GetJsonValue(rs , "result") != "OK" ){ return false; }
    hs.handlerSelectOption( JH.GetJsonValue(rs , "data") );
    hs.rangDateFilter(JH.GetJsonValue(rs , "data.date_range") );
  });
};


/**
* seting for multiselect
*
* @param {string} el elemnt id
* @param {json} onClose
*
*/
hs.enableMultiSelect = function(el , onClose){
  option = {
    buttonWidth : '100%',
    maxHeight : 300,
    includeSelectAllOption : true,
    selectAllNumber : false,
    enableFiltering: true,
    selectAllText : hs.translator['select_all'],
    allSelectedText : hs.translator['all_selected'],
    nonSelectedText : hs.translator['none_selected'],
    filterPlaceholder: hs.translator['search']
  }
  if ( typeof onClose === "function" ){
    option["onDropdownHide"] = onClose;
  }

  $('#' + el ).multiselect(option);
}



/**
* send data to generate option
*
* @param {json} data the data to generate option
*
*/
hs.handlerSelectOption = function(data){
  hs.genSelectOption( "metadata" , JH.GetJsonValue(data , "select_option.metadata") , "agency");
  hs.genSelectOption( "status" , JH.GetJsonValue(data , "select_option.process_status") );
}


/**
* generate option
*
* @param {string} el element id
* @param {json} source data to generate option
* @param {json} _cache cache of dropdown
*
*/
hs.genSelectOption = function( el , source , _cache){
  var select = document.getElementById(el);

  select.length = 0;
  if ( JH.GetJsonValue(source , "result") != "OK" ){ return false; }

  var data = apiService.getFieldValue(source,'data'); //initial data to generate option

  if(data == null){return }
  for (var i = 0 ; i < data.length ; i++){
    var d = data[i]; //the data to genrate option
    var option = document.createElement("option"); //create option element
    var txt_option = JH.GetJsonValue(d , "text"); //option name
    var	val_option = JH.GetJsonValue(d , "value"); //option value

    option.text = txt_option;
    option.value = val_option;
    select.add(option);

    if (_cache){
      if ( JH.Get(_cache) == "" ) { JH.Set(_cache , {} ); }
      var c = JH.Get( _cache );
      c[val_option] = d;
      JH.Set(_cache , c);
    }
  }
  $('#' + el).multiselect('rebuild');
  $('#' + el).multiselect('selectAll', false);
  $('#' + el).multiselect('updateButtonText');
}


/**
* display data table
*/
hs.btnPreviewOnClick = function(){
  var val_startdate = $('#startdate').val(); //start date
  var val_enddate	= $('#enddate').val(); //end date
  var val_metadata	= $('#metadata').val(); //metadata id
  var val_status	= $('#status').val(); //status

  //Validate filter is null
  if(!val_startdate || !val_enddate || !val_metadata || !val_status){
    bootbox.alert({
      message: hs.translator['msg_err_require_filter'],
      buttons: {
        ok: {
          label: hs.translator['btn_close']
        }
      }
    })

    return false
  }

  //Validate date time is invalid
  var startDate = new Date(val_startdate); //get start date
  var stDate = startDate.setDate( startDate.getDate()); //start date in type of date
  maxDate = startDate.setDate( startDate.getDate() + 30 );
  var endDate = new Date(val_enddate); //end date
  endDate = endDate.setDate( endDate.getDate());

  if(stDate > endDate){

    bootbox.alert({
      message: hs.translator['msg_stdate_over_endate'],
      buttons: {
        ok: {
          label: hs.translator['btn_close']
        }
      }
    })

    return false
  }
  if(endDate > maxDate){
    bootbox.alert({
      message: hs.translator['msg_err_date_over_range'].replace('%s',30),
      buttons: {
        ok: {
          label: hs.translator['btn_close']
        }
      }
    })
    $('#filter_enddate').val('');
    return false
  }

  var param = {
    metadata_id: ($('#metadata').val().join()).split(',').map(function(item) {
      return parseInt(item);
    }),
    process_status: ($('#status').val().join()).split(',').map(function(item) {
      return parseInt(item);
    }),
    begin_at: $('#startdate').val(),
    end_at: $('#enddate').val()
  };
  apiService.SendRequest("GET" , hs.service , param , function(rs){
    init_hiscript = rs

    hs.dataTable.clear()

    if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
    hs.dataTable.rows.add( JH.GetJsonValue(rs , "data") );
    hs.dataTable.draw()
  })
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
hs.renderReRunBtn = function(row, type, set, meta){
  var rerun_f = row['rerun_flag']; //typeof of button

  if(rerun_f == 'dl'){
    return '<i class="btn btn-download" data-row="'+meta.row+'" title="redownload"></i>';
  }else if(rerun_f == 'cv'){
    return '</i><i class="btn btn-convert" data-row="'+meta.row+'"title="reconvert"></i>';
  }else{
    return '';
  }
}


/**
* If reraun_flag as DL
*
*/
hs.reDownload = function(){
  var row = $(this).attr('data-row'); //row number
  var data = init_hiscript['data'][row]; //row The data for the whole row
  var dataset_log_id = JH.GetJsonValue(data,'dataimport_dataset_log_id'); //data set log id
  var dataimport_download_log_id = JH.GetJsonValue(data,'dataimport_download_log_id'); //download log id
  var dataimport_download_id = JH.GetJsonValue(data,'dataimport_download_id'); //download id
  var download_script = JH.GetJsonValue(data,'download_method'); //download method


  param = {
    download_id: dataimport_download_id.toString(),
    download_script: download_script
  }

  // Dialog box to comfirm redownload.
  var metadata_name = JH.GetJsonLangValue(data, 'metadataservice_name',true)
  var s = hs.translator['msg_redownload_con'].replace('%s',metadata_name)
  bootbox.confirm({
    message: s,
    reorder: true,
    buttons: {
      confirm: {
        label: '<i class="fa fa-check"></i> ' +  hs.translator['btn_confirm'],
        className: 'btn-success'
      },
      cancel: {
        label: '<i class="fa fa-times"></i> ' +  hs.translator['btn_cancel'],
        className: 'btn-danger'
      }
    },
    callback: function (result) {
      if(result){
        apiService.SendRequest('POST', hs.service_redownload, param, function(data, status, jqxhr){
          hs.btnPreviewOnClick() // Reload data table
          if (data["result"] == "NO"){
            bootbox.alert({
              message: hs.translator['msg_redownload_unsuc'],
              buttons: {
                ok: {
                  label: hs.translator['btn_close']
                }
              }
            })
            return false;
          }
          bootbox.alert({
            message: hs.translator['msg_redownload_suc'],
            buttons: {
              ok: {
                label: hs.translator['btn_close']
              }
            }
          })
          return true
        })
      }
    }
  });
}


/**
* If reraun_flag as CV
*
*/
hs.reConvert = function(){
  var row = $(this).attr('data-row'); //row number
  var data = init_hiscript['data'][row]; //row The data for the whole row
  var dataset_log_id = data['dataimport_dataset_log_id']; //data set log id
  var dataimport_download_id = data['dataimport_download_id']; //download id

  var param_1 = {
    download_id: dataimport_download_id.toString(),
    download_script: "dl-qmgr",
    additional_parameters:[
      "-step=cv",
      "-cmd=reset,fetch",
      "-dataset_log_id="+dataset_log_id
    ]}
    var param_2 = {
      download_id: dataimport_download_id.toString(),
      download_script:"dl-qmgr",
      additional_parameters:[
        "-step=im",
        "-cmd=reset,fetch",
        "-dataset_log_id="+dataset_log_id
      ]}

      // Dialog box to comfirm redownload.
      var metadata_name = JH.GetJsonLangValue(data, 'metadataservice_name', true); //metadata name
      var s = hs.translator['msg_reconvert_con'].replace('%s',metadata_name); //message confirm reconvert

      bootbox.confirm({
        message: s,
        reorder: true,
        buttons: {
          confirm: {
            label: '<i class="fa fa-check"></i> ' +  hs.translator['btn_confirm'],
            className: 'btn-success'
          },
          cancel: {
            label: '<i class="fa fa-times"></i> ' +  hs.translator['btn_cancel'],
            className: 'btn-danger'
          }
        },
        callback: function (result) {
          if(result){

            apiService.SendRequest('POST', hs.service_redownload, param_1,  function(data, status, jqxhr){

              if (status !== "success"){return false}

              apiService.SendRequest('POST', hs.service_redownload, param_2, function(data, status, jqxhr){

                hs.btnPreviewOnClick() // Reload data table
                if (status !== "success"){
                  bootbox.alert({
                    message: hs.translator['msg_reconvert_unsuc'],
                    buttons: {
                      ok: {
                        label: hs.translator['btn_close']
                      }
                    }
                  })
                  return false;
                }

                bootbox.alert({
                  message: hs.translator['msg_reconvert_suc'],
                  buttons: {
                    ok: {
                      label: hs.translator['btn_close']
                    }
                  }
                })
                return true
              })

            })


          }
        }
      });
    }

    //put the data into column onda table.
    hs.renderColumnMeatadataServiceName = function(row){
      return JH.GetJsonLangValue(row, "metadataservice_name", true);
    }
    hs.renderColumnAgency = function(row){
      return JH.GetJsonLangValue(row, "agency_name", true);
    }
    hs.renderColumnBegin_at = function(row){
      return JH.GetJsonValue(row,"download_begin_at");
    }
    hs.renderColumnEnd_at = function(row){
      return JH.GetJsonValue(row,"import_end_at");
    }
    hs.renderColumnDuration_time = function(row){
      return JH.GetJsonValue(row, "duration");
    }
    hs.renderColumnSatatus = function(row){
      var rerun_f = row['rerun_flag'];

      if(row['process_status'] == 0 && rerun_f == "dl"){
        return 'Download Failed'
      }
      else if(row['process_status'] == 0 && rerun_f != "dl"){
        return 'No new data';
      }else if(row['process_status'] == 1){
        return 'Convert Failed'
      }else if(row['process_status'] == 2){
        return 'Import Failed'
      }else{
        return 'Successful'
      }

    }
    hs.renderColumnEvent_code = function(row){
      return JH.GetJsonLangValue(row, "event_code", true);
    }

    //setting range date on filter datetime.
    hs.rangDateFilter = function(date_range){
      $("#startdate").val(moment().format("YYYY-MM-DD HH:mm"))
      $("#startdate").datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        icons: {
          time: 'fa fa-clock-o',
          date: 'fa fa-calendar',
          up: 'fa fa-chevron-up',
          down: 'fa fa-chevron-down',
          previous: 'fa fa-chevron-left',
          next: 'fa fa-chevron-right',
          today: 'fa fa-check',
          clear: 'fa fa-trash',
          close: 'fa fa-times'
        }
      }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        var maxDate = $(this).datetimepicker( "getDate" );
        maxDate.setDate( maxDate.getDate() + parseInt(date_range) );
        $('#enddate').datetimepicker('setStartDate', minDate);
        $('#enddate').datetimepicker('setEndDate', maxDate);
      })

      $("#enddate").val(moment().format("YYYY-MM-DD HH:mm"))
      $("#enddate").datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        icons: {
          time: 'fa fa-clock-o',
          date: 'fa fa-calendar',
          up: 'fa fa-chevron-up',
          down: 'fa fa-chevron-down',
          previous: 'fa fa-chevron-left',
          next: 'fa fa-chevron-right',
          today: 'fa fa-check',
          clear: 'fa fa-trash',
          close: 'fa fa-times'
        }
      }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        $('#startdate').datetimepicker('setEndDate', minDate);
      });
    }
