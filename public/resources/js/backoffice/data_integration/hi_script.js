/**
*
*   Main JS application file for History script page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var hs = {
    cache : {}
};
var init_hiscript

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
hs.init = function(translator){
    hs.translator = translator; //Text for label and message on javascript
    hs.service = "thaiwater30/backoffice/dataimport_config/history"; //service history script
    hs.service_redownload = "dataimport/rdl/node0/ps"; //service for node

    hs.enableMultiSelect('metadata');
    hs.enableMultiSelect('status');
    ctrl = $('#tbl')
    hs.dataTable = ctrl.DataTable({
        dom : 'frltip',
        language : g_dataTablesTranslator,
        columns : [{
            data: hs.renderColumnMetadataServiceName,
        },{
            data: hs.renderColumnAgency,
        },{
            data: hs.renderColumnBegin_at,
        },{
            data: hs.renderColumnEnd_at,
        },{
            data: hs.renderColumnDuration_time,
        },{
            data: hs.renderColumnSatatus,
        },{
            data: 'metadata_convert_frequency',
        },{
            data: 'metadata_channel',
        },{
            data: 'filesize',
        },{
            data: hs.renderColumnEvent_code,
        },{
            data: hs.renderReRunBtn,
        }],
    		order : [ [ 2, 'desc' ] ]
    });

    $('#btn_preview').on('click' , hs.btnPreviewOnClick);
    $('#agency').select2().on('change' , hs.agencyOnClose);

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
* @param {string} el id of element
* @param {json} onClose
*
*/
hs.enableMultiSelect = function(el , onClose){
    option = {
        buttonWidth : '100%',
        maxHeight : 300,
        includeSelectAllOption : true,
        selectAllNumber : true,
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
* Get the value from filter agency to generate option into filter metadata
*
*/
hs.agencyOnClose = function(){
    var values = $('#agency').val(); //agency id
    var source = { result: "OK" , data : []}; //prepare metadata data

    if (values != null){
        // for (var i = 0 ; i < values.length ; i++){


            //var value = values[i];
            source.data = JH.GetJsonValue( JH.Get("agency") , values + ".metadata_id" ) ;

            // if (arr == ""){ continue; }
            //source.data = source.data.concat( arr );
        // }
    }

    if(values == undefined ){
      var el = 'metadata'; //element name of metadata
      $('#metadata > option').remove();
        $('#' + el).multiselect('rebuild');
        $('#' + el).multiselect('selectAll', false);
        $('#' + el).multiselect('updateButtonText');
    }else{
      hs.genSelectOption( "metadata" , source );
    }
}


/**
* send data to generate option
*
* @param {json} data the data foe generate option
*
*/
hs.handlerSelectOption = function(data){
    hs.genSelectOption( "agency" , JH.GetJsonValue(data , "select_option.agency_id") , "agency");
    hs.genSelectOption( "status" , JH.GetJsonValue(data , "select_option.process_status") );
    hs.agencyOnClose();
}


/**
* generate option
*
* @param {string} el element id
* @param {json} source the data to generate option
* @param {json} _cache chache of dropdown
*
*/
hs.genSelectOption = function( el , source , _cache){
    var select = document.getElementById(el); //element of dropdown

    select.length = 1;
     if(el !== 'agency'){select.length = 0}
    if ( JH.GetJsonValue(source , "result") != "OK" ){ return false; }

    var data = JH.GetJsonValue( source , "data" ); //the data for generate option



    if(typeof data === undefined || data == null){return false}

    for (var i = 0 ; i < data.length ; i++){
        var d = data[i]; //the data to generate option
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
    if(el !== 'agency'){
      $('#' + el).multiselect('rebuild');
      $('#' + el).multiselect('selectAll', false);
      $('#' + el).multiselect('updateButtonText');
    }
}


/**
* generate data rows on data table
*
*/
hs.btnPreviewOnClick = function(){
  var val_startdate = $('#startdate').val(); //start date
  var val_enddate	= $('#enddate').val(); //end date
  var val_agency	= $('#agency').val(); //agency id
  var val_metadata	= $('#metadata').val(); //metadata id
  var val_status	= $('#status').val(); //status

  //Validate filter is null
  if(!val_startdate || !val_enddate || !val_agency || !val_metadata || !val_status){
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
	var startDate = new Date(val_startdate); //start date
	var stDate = startDate.setDate( startDate.getDate());
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

  //Prepare parameter for get data.
  var param = {
      agency_id: parseInt($('#agency').val()),
      metadata_id: ($('#metadata').val().join()).split(',').map(function(item) {
          return parseInt(item);
      }),
      process_status: ($('#status').val().join()).split(',').map(function(item) {
          return parseInt(item);
      }),
      begin_at: $('#startdate').val(),
      end_at: $('#enddate').val()
  };
  //Get data from servie to push on datatable.
  apiService.SendRequest("GET" , hs.service , param , function(rs){
      init_hiscript = rs

      hs.dataTable.clear()

      if ( JH.GetJsonValue(rs , "result") != "OK"){ return false; }
      // if ( JH.GetJsonValue(rs , "data") == "" || JH.GetJsonValue(rs , "data") == null ){ return false; }
      hs.dataTable.rows.add( JH.GetJsonValue(rs , "data") );
      hs.dataTable.draw()
  })
}



/**
* create buttons on table
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderReRunBtn = function(row, type, set, meta){
    var rerun_f = row['rerun_flag']; //tpye of rerun

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
  var data = init_hiscript['data'][row]; //prepare data to redownload
  var dataset_log_id = JH.GetJsonValue(data, 'dataimport_dataset_log_id'); // data set log id
  var dataimport_download_log_id = JH.GetJsonValue(data, 'dataimport_download_log_id'); //download log id
  var dataimport_download_id = JH.GetJsonValue(data, 'dataimport_download_id'); //download id
  var download_script = JH.GetJsonValue(data, 'download_method'); //download metgod

  param = {
    download_id: dataimport_download_id.toString(),
    download_script: download_script
  }

  // Dialog box to comfirm redownload.
  var metadata_name = JH.GetJsonLangValue(data, 'metadataservice_name',true); //metadata name
  var s = hs.translator['msg_redownload_con'].replace('%s',metadata_name); //message confirm redownload

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
        console.log("Param:",param);
        apiService.SendRequest('POST', hs.service_redownload, param, function(data, status, jqxhr){
          console.log("data:",data);
          console.log("status:",status);
            hs.btnPreviewOnClick() // Reload data table
          	if (data["result"] !== "OK"){
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
  var data = init_hiscript['data'][row]; //prepare data to reconvert
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
  var s = hs.translator['msg_reconvert_con'].replace('%s',metadata_name); //messaage confirm reconvert
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


/**
* put data into column metadata service
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderColumnMetadataServiceName = function(row){
    return JH.GetJsonLangValue(row, "metadataservice_name", true);
}


/**
* put data into column agency
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderColumnAgency = function(row){
    return JH.GetJsonLangValue(row, "agency_name", true);
}


/**
* put data into column begin at
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderColumnBegin_at = function(row){
  return JH.GetJsonValue(row,"download_begin_at");
}


/**
* put data into column end at
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderColumnEnd_at = function(row){
  return JH.GetJsonValue(row,"import_end_at");
}


/**
* put data into column duration time
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderColumnDuration_time = function(row){
  return JH.GetJsonValue(row, "duration");
}


/**
* put data into column status
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderColumnSatatus = function(row){
	var rerun_f = row['rerun_flag'];

    if(row['process_status'] == 0 && rerun_f == "dl"){
			return 'Download Failed'
	}
	else if(row['process_status'] == 0 && rerun_f != "dl"){
			return 'No new data';
    }
    else if(row['process_status'] == 1){
        return 'Convert Failed'
    }else if(row['process_status'] == 2){
        return 'Import Failed'
    }else{
        return 'Successful'
    }

}


/**
* put data into column event code
*
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
*/
hs.renderColumnEvent_code = function(row){
    return JH.GetJsonLangValue(row, "event_code", true);
}


/**
* set date range on filter
*
* @param {string} date_range date range
*/
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
