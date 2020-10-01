var srvData = {};
var pre_id = '#dlgCompTransec'; //Prefix id of element in form
var currentdate = new Date(); //current date time
var datetime = 	currentdate.getFullYear() + "-"
+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
+ ("0" + currentdate.getDate()).slice(-2) + " "

/**
 * Initial page load.
 *
 * @param {json} translator Text for use on page.
 */
srvData.init = function(translator) {

    srvData.translator = translator; //Text for label and message on javascript
    srvData.service_summay_data = "thaiwater30/migration_log/summary_data";
    srvData.service_data_by_table = "thaiwater30/migration_log/data_by_table";


    //*data table setting
    srvData.metadataTableId = 'tbl-compare-transection'; //element id of data table
    ctrl = $('#' + srvData.metadataTableId);
    srvData.dataTable = ctrl.DataTable({
  		dom : 'frlBtip',
  		buttons : [ {
  			extend : 'excelHtml5',
  			text : ' <i class="fa fa-file-excel-o color-green" aria-hidden="true"></i> Export excel',
  		} ],
        "iDisplayLength": 50,
        language: g_dataTablesTranslator,
        columns: [
            // {
            // 	defaultContent : '',
            // 	orderable : false,
            // 	searchable : false,
            // },
            {
                data: srvData.renderColum_NHC_Table,
            }, {
                data: srvData.renderColum_NHC_Count,
            }, {
                data: srvData.renderColum_TW30_Table,
            }, {
                data: srvData.renderColum_TW30_Count,
            }, {
                data: srvData.renderColum_Diff,
            }, {
                data: srvData.renderToolButtons,
                orderable: false,
                searchable: false,
            }
        ],
        "footerCallback": function(row, data, start, end, display) {
            var api = this.api(),
                data;
            // Remove the formatting to get integer data for summation
            var intVal = function(i) {
                return numeral(i).value();
            };

            // Sum over all pages
            total_summary_total_nhc = api.column(1).data().reduce(function(a, b) {
                return intVal(a) + intVal(b);
            }, 0);
            total_summary_total_tw30 = api.column(3).data().reduce(function(a, b) {
                return intVal(a) + intVal(b);
            }, 0);

            // Sum over this page, 3 is colum number begin at 0
            total_page_summary_total_nhc = api.column(1, {
                page: 'current'
            }).data().reduce(function(a, b) {
                return intVal(a) + intVal(b);
            }, 0);
            total_page_summary_total_tw30 = api.column(3, {
                page: 'current'
            }).data().reduce(function(a, b) {
                return intVal(a) + intVal(b);
            }, 0);

            // Update footer
            $('#total_summary_total_nhc').html(total_page_summary_total_nhc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + total_summary_total_nhc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            $('#total_summary_total_tw30').html(total_page_summary_total_tw30.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + total_summary_total_tw30.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

        },
        order: [
            [0, 'asc']
        ]
    })


    // Event button edit data o datatable.
    ctrl.on('click', 'i.btn-view', srvData.getDataByTable);

    $('#btn-cancel').on('click', srvData.closeDetail);
    $('#btn_reprocess').on('click', srvData.Reprocess);

    $('#filter_startdate ,#filter_enddate').datetimepicker({
    	format : 'YYYY-MM-DD HH:mm'
    });

    // var currentdate = new Date(); //current dateand time
    // var default_date = currentdate.getFullYear() + "-" +
    //     ("0" + (currentdate.getMonth() + 1)).slice(-2) + "-" +
    //     ("0" + currentdate.getDate()).slice(-2) + " ";
    //
    // $('#filter_startdate ,#filter_enddate').val(default_date);

    $('#btn_display').on('click',srvData.initParamDataByTable)

    srvData.displayDataTable();

}

/**
 * Put data to rows on data table.
 */
srvData.displayDataTable = function() {
  var self = srvData;
  apiService.SendRequest('GET', srvData.service_summay_data, {}, function(rs){
    srvData.dataTable.clear();
    if (JH.GetJsonValue(rs, "result") != "OK") {
        return false;
    }
    $('.last_update').text(rs.last_update);
    if ( JH.GetJsonValue(rs, "bg_running") ){
        // bg_running == true แสดงว่ามี bg process กำลังทำงานอยู่ ให้ปิดการทำานของ #btn_reprocess
        $('#btn_reprocess').prop('disabled', true).off('click');
    }
    srvData.dataTable.rows.add(JH.GetJsonValue(rs, "data"));
    srvData.dataTable.draw();
  });
}

/**
 * put data on codition colu,n.
 *
 * @param {json} row The data for the whole row.
 * @param {json} type The data type requested for the cell
 * @param {json} set Value to set if the type parameter is set.
 * @param {json} meta The row and column index for the requested cell.
 *
 * @return {text} The name data for display on name column.
 */
srvData.renderColum_NHC_Table = function(row, type, set, meta) {
    return JH.GetJsonValue(row, 'nhc_table');
}

srvData.renderColum_NHC_Count = function(row, type, set, meta) {
    var nhc_count = JH.GetJsonValue(row, 'nhc_count');
    if (nhc_count) {
        nhc_count = nhc_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return nhc_count
}

srvData.renderColum_TW30_Table = function(row, type, set, meta) {
    return JH.GetJsonValue(row, 'tw30_table');
}

srvData.renderColum_Diff = function(row) {
    var nhc = JH.GetJsonValue_Int(row, 'nhc_count');
    var tw30 = JH.GetJsonValue_Int(row, 'tw30_count');
    var cl = "";
    var diff = tw30 - nhc;
    if (diff > 0) {
        cl = "text-green";
    } else if (diff < 0) {
        cl = "text-red";
    }
    return "<span class='" + cl + "'>" + diff + "</span>";
}

srvData.renderColum_TW30_Count = function(row, type, set, meta) {
    var tw30_count = JH.GetJsonValue(row, 'tw30_count');
    if (tw30_count) {
        tw30_count = tw30_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return tw30_count
}

/**
 * Create icon for edit and delete data on datatable.
 *
 * @param {json} row The data on data table
 * @param {json} type
 * @param {json} set
 * @param {json} meta Colum and row id
 *
 *@return {json} The element HTML of buttons.
 */
srvData.renderToolButtons = function(row, type, set, meta) {
    var s = '<i class="btn btn-view" data-row="' + meta.row + '"></i>';
    return s;
}

srvData.initParamDataByTable = function(){
  var self = srvData;


  var st_date = $('#filter_startdate').val();
  var en_date = $('#filter_enddate').val();

  console.log("st_date:",st_date);


  $('.div_detail_table').show();
  $('.div_main_table').hide();
  $('body').addClass('sidebar-collapse');


  if(!st_date || !en_date){
		bootbox.alert({
			message: self.translator['msg_err_require_filter'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})

		return false
	}

  var date_range = parseInt($('#date_range').val()); //date range
	var startDate = new Date(st_date) //get start date
	var stDate = startDate.setDate( startDate.getDate()); //convert start date to number
	maxDate = startDate.setDate( startDate.getDate() + 30 ); //Max range date from startdate
	var endDate = new Date(en_date) //get end date
	endDate = endDate.setDate( endDate.getDate()); //convert end dte to number

	if(stDate > endDate){
		bootbox.alert({
			message: self.translator['msg_stdate_over_endate'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})

		return false;
	}
	if(endDate > maxDate){
		bootbox.alert({
			message: self.translator['msg_err_date_over_range'].replace('%s',30),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		$('#filter_enddate').val('');
		return false
	}
  $('span.tb-name').text( srvData.nhc_table );

  var param = {
    nhc_table : srvData.nhc_table,
    start_date: st_date,
    end_date: en_date
  }

  apiService.SendRequest('GET', srvData.service_data_by_table, param, srvData.displayDetail);
}


srvData.getDataByTable = function() {
    var row = srvData.dataTable.row($(this).closest('tr')).data();
    srvData.nhc_table =  row.nhc_table;
    srvData.setDefaultFilterDate();
    srvData.initParamDataByTable();
    // apiService.SendRequest('GET', srvData.service_data_by_table, param, srvData.displayDetail);
}

/**
 * Display modal add or edit data.
 *
 * @param {text} key The id for identify on service url to get
 *                   the dataset to display on edit form.
 */
srvData.displayDetail = function(sm) {
    console.log(sm);
    if (typeof sm === 'undefined' || sm == null) {
        return false
    }

   if(!sm.data.nhc || !sm.data.tw30){
     srvData.alertErrNull();
     return false
   }

    var column_nhc = [];
    var column_tw30 = [];
    var column_name_nhc = sm.data.nhc[0];
    var row_data_nhc = sm.data.nhc[1];
    var column_name_tw30 = sm.data.tw30[0];
    var row_data_tw30 = sm.data.tw30[1];

    // if (!column_name_nhc || !column_name_tw30) {srvData.alertErrNull()}

    $('.div_detail_table').show();
    $('.div_main_table').hide();
    $('body').addClass('sidebar-collapse');


    /* prepare column data for nhc table */
      for (var i = 0; i < column_name_nhc.length; i++) {
          var js_title_nhc = {};

          js_title_nhc = {
              title: column_name_nhc[i]
          };

          column_nhc.push(js_title_nhc);
      }


    /* prepare column data for thaiwater30 table*/
    for (var i = 0; i < column_name_tw30.length; i++) {
        var js_title_tw30 = {};
        js_title_tw30 = {
            title: column_name_tw30[i]
        };

        column_tw30.push(js_title_tw30);
    }

    //Table detail NHC
    srvData.oldTableId = $('#tbl-detail-old');
    if (srvData.ElementTableOld) {
		srvData.ElementTableOld.destroy();
		srvData.oldTableId.empty();
    }

  	srvData.ElementTableOld = srvData.oldTableId.DataTable({
  		dom: 'frltip',
  		language: g_dataTablesTranslator,
  		columns: column_nhc,
  		data: row_data_nhc,
  	});

    //Table detail Thaiwater30
    srvData.newTableId = $('#tbl-detail-new');
    if (srvData.ElementTableNew) {
		srvData.ElementTableNew.destroy();
		srvData.newTableId.empty();
    }
  	srvData.ElementTableNew = srvData.newTableId.DataTable({
  		dom: 'frltip',
  		language: g_dataTablesTranslator,
  		columns: column_tw30,
  		data: row_data_tw30,
  	});
}

srvData.closeDetail = function() {
    $('.div_detail_table').hide();
    $('.div_main_table').show()
    $('body').removeClass('sidebar-collapse');
}

srvData.Reprocess = function() {
    apiService.SendRequest('PUT', srvData.service_summay_data, {}, function(rs) {
        console.log("Result:", rs);
        if (typeof rs === 'undefined' || rs == null) {
            bootbox.alert("Can't reprcess");
            return false
        }

        if (rs.result == 'OK') {
            $('#btn_reprocess').prop('disabled', true).off('click');
            bootbox.alert("Reprocess Success");
        } else {
            bootbox.alert("Reprocess Fail !!!");
        }
    });
}

srvData.setDefaultFilterDate = function(){

  var start_date = datetime + " 00:00"
  var end_date = datetime + ("0" + currentdate.getHours()).slice(-2) + ":" + ("0" + currentdate.getMinutes()).slice(-2);

  $("#filter_startdate").val(start_date);
  $("#filter_enddate").val(end_date);

};

srvData.alertErrNull = function(){
  bootbox.alert("ไม่มีข้อมูลสำหรับแสดงผล");
  return false
}
