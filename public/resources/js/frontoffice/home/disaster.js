/**
*
*   srvMain Object for handler main page
*
*   @author Peerapong Srisom <peerapong@haii.co.th>
*   @license HAII
*
*/
var srvMain = {
    cache: {}
};
/**
*   Initial srvMain
*   @param {object} trans - translate object from laravel
*/
srvMain.init = function (trans) {
    //set dafault datatable
    $.extend(true, $.fn.dataTable.defaults, {
        "dom": 't',
        "iDisplayLength": 200,
        "language": g_dataTablesTranslator
    });
    srvMain.translator = trans;
    srvMain.waterlevelInit = true;
    srvMain.waterlevelCache = [];
    srvMain.currentDatatable = null;

    srvMain.initVar();
    srvMain.initLoad();
    srvMain.Disaster_delete();


    srvMain.btnDisasterAddClick();
    srvMain.initEventDate();
    srvMain.Disaster_Submit();
    srvMain.geoThailandJs();

}

/**
*  Initial variable in srvMain
*/
srvMain.initVar = function () {
    srvMain.service = "thaiwater30/public/disaster/list";

    // Data table Disaster
    srvMain.Disaster_table = $("#disaster_table");
    srvMain.Disaster_DataTable = srvMain.Disaster_table.DataTable({
        fixedHeader: false,
        columnDefs: [
            { className: 'text-center', targets: [0, 1, 2, 3, 4, 6] },
            { className: 'text-left', targets: [5] },
        ],
        columns: [
            { data: 'id' },
            { data: 'event_datetime' },
            { data: 'tumbon' },
            { data: 'amphur' },
            { data: 'province' },
            { data: 'warning_description' },
            { data: 'created_at' },
            { data: srvMain.Disaster_render_button_del }

        ],
        order: [[0, 'desc']],
        language: {
            emptyTable: srvMain.translator["data_empty_table"]
        },
        "searching": true
    });
}

srvMain.Disaster_delete = function () {
    $('#disaster_table tbody').on('click', '.btn-disasater-del', function () {
        var row_id = $(this).attr('data-row');
        var disasterUrl = './disaster/del';

        if(confirm("ยืนยันลบข้อมูล รหัส "+row_id+" ?")) {
            // load data and render
            $.ajax({
                type: "POST",
                crossDomain: true,
                url: disasterUrl,
                data: { id: row_id, _token: TOKEN },
                dataType: "json",
                success: function () {
                    $('#dlgAdd').modal('hide');
                    srvMain.initLoad();
                },
                error: function (err) {
                    console.log('Connection fail');
                }
            });
        }        
    });
}

/**
*   Initial load data in srvMain
*/
srvMain.initLoad = function () {
    // apiService.SendRequest( "GET", srvMain.service , {} , function(rs){
    //     srvMain.handlerSrvDisaster( rs );
    // } );

    var disasterUrl = './disaster/list';
    var data = '--';
    // load data and render
    $.ajax({
        type: "GET",
        crossDomain: true,
        url: disasterUrl,
        dataType: "json",
        success: srvMain.handlerSrvDisaster,
        error: function (err) {
            console.log('Connection fail');
        }
    });
}


srvMain.handlerSrvDisaster = function (rs) {
    srvMain.Disaster_genTable(rs);
}

srvMain.Disaster_genTable = function (data) {

    srvMain.Disaster_DataTable.clear().draw();

    for (i = 0; i < data.length; i++) {
        srvMain.Disaster_DataTable.row.add(data[i]);
    }
    srvMain.Disaster_DataTable.draw();
}

srvMain.Disaster_render_button_del = function (row) {
    return '<a class="btn-disasater-del btn btn-danger btn-sm" data-row="' + JH.GetJsonLangValue(row, "id") + '" ><i class="fa fa-trash"></i></a>';
}

srvMain.Disaster_render_dowload = function (row) {
    return '<center><a href="/images/' + row.province_code + '.zip" class="disabled" title="' + srvMain.translator["dowload"] + '" download ><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span></a></center>';
}

$('#disaster_input').on('keyup', function () {
    srvMain.Disaster_DataTable.search(this.value).draw();
});


srvMain.btnDisasterAddClick = function () {
    $('#btn-disaster-add').on('click', function () {
        $('#dlgAdd').modal('show');
    });
}

/**
 * Setting input datetime
 */
srvMain.initEventDate = function () {
    $("#disasterEventDatetime").datetimepicker({
        useCurrent: true,
    });
};

/**
 * Submmit button
 */
srvMain.Disaster_Submit = function () {
    $('.btn-disaster-submit').on('click', function () {
        var disasterUrl = './disaster/add';
        var datas = $('#disasterForm').serialize();
        console.log(datas);
        $.ajax({
            type: "POST",
            url: disasterUrl,
            data: datas,
            dataType: "json",
            success: function (res) {
                $('#dlgAdd').modal('hide');
                srvMain.initLoad();
            },
            error: function () {
                alert('error handling here');
            }
        });
        return false;
    });
}

/**
 * Autocomplete
 */
srvMain.geoThailandJs = function () {
    $.Thailand({
        $district: $('#disasterDistrict'), // input ของตำบล
        $amphoe: $('#disasterAmphoe'), // input ของอำเภอ
        $province: $('#disasterProvince'), // input ของจังหวัด
        $zipcode: $('#disasterZipcode'), // input ของรหัสไปรษณีย์
        $search: $('#disasterForm [name="search"]'),
        database: './resources/js/jquery.Thailand.js/database/db.json',
        onDataFill: function (data) {
            console.log(data)
            var html = '<b>ที่อยู่:</b> ตำบล' + data.district + ' อำเภอ' + data.amphoe + ' จังหวัด' + data.province + ' ' + data.zipcode;
            $('#output').html('<div class="uk-alert-warning" uk-alert><a class="uk-alert-close" uk-close></a>' + html + '</div>');
        },
        onLoad: function () {
            //console.info('Autocomplete is ready!');
        }
    });
}