/**
*
*   Main JS application file for method page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var mm = {}; //initial daat
var frm_id = '#dlgMethod'; //prefix id of element in form

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
mm.init = function(group_Translator){
  mm.translator = group_Translator; //Text for label and message on java script
  mm.service = "thaiwater30/backoffice/metadata/metadata_method"; //service method
  mm.table = $('#tbl-method'); //elemetn table method
  mm.table.on('click' , '.btn-edit' , mm.btnEditClick);
  mm.table.on('click' , '.btn-delete' , mm.btnDeleteClick);

  $(frm_id + '-save-btn').on('click', mm.btnSaveMethod);

  mm.dataTable = mm.table.DataTable({
    dom : 'frlBtip',
    buttons : [ {
      text : ' <i class="fa fa-plus-circle" aria-hidden="true"></i> '+ mm.translator['method_page_name'],
      action : mm.btnEditClick
    } ],
    language : g_dataTablesTranslator,
    columns : [ {
      defaultContent : '',
      orderable : false,
      searchable : false,
    },{
      data :  mm.renderColumMethod
    },{
      data : mm.renderToolButtons,
      orderable : false,
      searchable : false,
    } ],
    order : [ [ 1, 'asc' ] ]
  })



  mm.dataTable.on('order.dt search.dt', function() {
    mm.dataTable.column(0, {
      search : 'applied',
      order : 'applied'
    }).nodes().each(function(cell, i) {
      cell.innerHTML = i + 1;
    });
  }).draw();

  apiService.SendRequest("GET" , mm.service , {} , mm.handlerService);
}



/**
* add the data to table
*
* @param {json} rs initial method data
*
*/
mm.handlerService = function(rs){
  mm.dataTable.clear();
  if (JH.GetJsonValue(rs, "result") == "OK"){
    mm.obj_data = rs;
    mm.dataTable.rows.add(JH.GetJsonValue(rs,"data"));
  }
  mm.dataTable.draw();
}



/**
* put the data into column
*
* @param {json} row the data to put on column
*
* @return {string} method name
*/
mm.renderColumMethod = function(row){
  return JH.GetJsonValue(row,"metadata_method_name");
}



/**
* put the data into column
*
* @param {json} row generate buttons on data table
*
* @return {string} elemtn buttons
*/
mm.renderToolButtons = function(row, type, set, meta) {
  var self = mm; //initial data
  var s = '<i class="btn btn-edit" data-row="'+meta.row+'" title="' + self.translator['btn_edit']
  + '"></i>' + '<i class="btn btn-delete"  data-row="'+meta.row+'" title="'
  + self.translator['btn_delete'] + '"></i>'; // default buton on table

  return s
}



/**
* get row number to edit
*
*/
mm.btnEditClick = function(){
  var row = $(this).attr('data-row'); //row number
  mm.showFrom(row);
}



/**
* display form to add or edit data
*
* @param {json} row row number
*
*/
mm.showFrom = function(row){
  var frm = $(frm_id + '-form'); // element form input method

  frm.parsley().reset()
  $('ul.parsley-errors-list').remove()

  if (row === undefined) {
    $(frm_id + '-title').text(mm.translator['add_method'])
    $(frm_id + '-form')[0].reset();
    $(frm_id + '-id').val('');
  } else {
    var id = mm.obj_data['data'][row]['metadata_method_id']
    $(frm_id + '-title').text(mm.translator['edit_method'])
    $(frm_id + '-id').val(id);
    $(frm_id + '-name').val(mm.obj_data['data'][row]['metadata_method_name'])
  }

  $('#dlgMethod').modal({
    backdrop : 'static'
  })
}



/**
* delete data in data table
*
*/
mm.btnDeleteClick = function(){
  var row = $(this).attr('data-row'); //row numner
  var data = mm.obj_data["data"][row]; //initial method data
  var id = JH.GetJsonLangValue(data, 'metadata_method_id',true); //method id
  var param = {
    metadata_method_id:id
  }

  var name = JH.GetJsonLangValue(data, 'metadata_method_name',true); //method name
  var s = mm.translator['msg_delete_con'].replace('%s',name); // message confirm delete method

  bootbox.confirm({
    message: s,
    buttons: {
      confirm: {
        label: '<i class="fa fa-check"></i> ' +  mm.translator['btn_confirm'],
        className: 'btn-success'
      },
      cancel: {
        label: '<i class="fa fa-times"></i> ' +  mm.translator['btn_cancel'],
        className: 'btn-danger'
      }
    },
    callback: function (result) {
      if(result){
        apiService.SendRequest("DELETE", mm.service, param, function(data, status, jqxhr){
          apiService.SendRequest("GET" , mm.service , {} , mm.handlerService);
          if (data["result"] == "NO"){
            bootbox.alert({
              message: mm.translator['msg_delete_unsuc'],
              buttons: {
                ok: {
                  label: mm.translator['btn_close']
                }
              }
            })
            return false;
          }
          bootbox.alert({
            message: mm.translator['msg_delete_suc'],
            buttons: {
              ok: {
                label: mm.translator['btn_close']
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
* save data
*
*/
mm.btnSaveMethod = function() {
  var param = {}; // initial parameter
  var frm = $(frm_id + '-form'); //element form save method
  var method = "POST"; //method
  var srv	=	mm.service; //service

  frm.parsley().validate()
  if (!frm.parsley().isValid()) {
    return false
  }

  var id = $(frm_id + '-id').val(); //id method


  param = {
    metadata_method_name : $(frm_id + '-name').val()
  }

  if(id !== ''  ){
    srv+= '/'+ id
    method	=	"PUT"
  }

  apiService.SendRequest(method, srv, param, function(data, status, jqxhr){
    apiService.SendRequest('GET', mm.service, {}, mm.handlerService)
    bootbox.alert({
      message: mm.translator['msg_save_suc'],
      buttons: {
        ok: {
          label: mm.translator['btn_close']
        }
      }
    })
  })
  $(frm_id).modal('hide');
  return true
}
