/**
*
*   srvHistory Object for handler data_service/history page
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvHistory = {};
var srvHistory_ListData = []
/**
*   Initial srvHistory
*   @param {object} trans - translate object from laravel
*/
srvHistory.init = function(trans){
    srvHistory.translator = trans;
    srvHistory.service = "thaiwater30/data_service/history";
    srvHistory.metadata = "thaiwater30/backoffice/metadata/metadata"

    srvHistory.table = $('#table');
    srvHistory.table.on('click' , '#btn_detail' , srvHistory.showOrderDetail);
    srvHistory.table.on('click' , '#btn_select' , srvHistory.showOrderDetail_download);
    srvHistory.dataTable = srvHistory.table.DataTable({
        dom : 'frtlip',
        language : g_dataTablesTranslator,
        columns : [ {
            data : 'id',
        }, {
            data : 'order_datetime',
        }, {
            data : 'order_quality',
        }, {
            data : 'order_status.order_status',
        },{
            data : srvHistory.renderTableButton,
            orderable : false,
            searchable : false,
        } ],
        order: [ [0, 'asc'] ]
    });

    srvHistory.orderDetailTable = $('#table_order_detail').DataTable({
        dom : 'frtlip',
        language : g_dataTablesTranslator,
        columns : [ {
            defaultContent : '',
            orderable : false,
            searchable : false,
        },{
            data : srvHistory.renderMetadataserviceName,
        },{
            data : srvHistory.renderDetailFrequency,
        },{
            data : srvHistory.renderAgencyName,
        },{
            data : srvHistory.renderServiceMethodName,
        },{
            data : srvHistory.renderProvinceName,
        },{
            data : srvHistory.renderBasinName,
        },{
            data : srvHistory.renderStatus,
        }],
        order: [ ]
    });

    
    // table_order_detail datatable เปลี่ยนคอลั่มแรกให้เป็นเลขเรียงตามแถว
    srvHistory.orderDetailTable.on('order.dt search.dt', function() {
        srvHistory.orderDetailTable.column(0, {
            search : 'applied',
            order : 'applied'
        }).nodes().each(function(cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();

    $("#table_order_detail_download").on('click' , '#btn_select_download' , srvHistory.DownloadFile);
    
    srvHistory.orderDetailTable_Download = $('#table_order_detail_download').DataTable({
        dom : 'frtlip',
        language : g_dataTablesTranslator,
        columns : [ {
            defaultContent : '',
            orderable : false,
            searchable : false,
        },{
            data : srvHistory.renderMetadataserviceName,
        },{
            data : srvHistory.renderDate,
        },{
            data : srvHistory.renderStatus,
        },{
            data : srvHistory.renderTableButton_Download,
            orderable : false,
            searchable : false,
        }],
        order: [ ]
    });

    
    // table_order_detail datatable เปลี่ยนคอลั่มแรกให้เป็นเลขเรียงตามแถว
    srvHistory.orderDetailTable_Download.on('order.dt search.dt', function() {
        srvHistory.orderDetailTable_Download.column(0, {
            search : 'applied',
            order : 'applied'
        }).nodes().each(function(cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();


        

	apiService.SendRequest('GET', srvHistory.service, "", srvHistory.handlerSrvTable);
	// apiService.SendRequest('GET', srvHistory.service, "", srvHistory.test);
    //srvHistory.handlerSrvTable(data);
}

srvHistory.test = function(rs){
	// // console.log("-- HELLO --",rs);

}


/**
*   handler service srvShop.service_onload
*   @param {object} rs - result from service
*/
srvHistory.handlerSrvTable = function(rs){
    // gen status
	// console.log("-- HELLO --",rs);
    if (rs.status.result == "OK"){
        var text = "";
        for (var i = 0 ; i < rs.status.data.length ; i++){
            var s = rs.status.data[i];
            text += (i+1) + ". " + s["order_status"] + "<br/>";
        }
        $('#status').html(text);
    }
    //  gen table
    if (rs.order.result == "OK"){
        srvHistory.dataTable.clear();
        if ( JH.GetJsonValue(rs.order, "data")){
            srvHistory.dataTable.rows.add(JH.GetJsonValue(rs.order, "data"));
        }
        srvHistory.dataTable.draw();
    }
}

/**
*   render button
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} button
*/
srvHistory.renderTableButton = function(row, type, set, meta){
    var str = '<button type="button" id="btn_detail" class="btn btn-default" data-item="'+row.id+'">'+
    '<i class="fa fa-info-circle" aria-hidden="true"></i> '+srvHistory.translator["detail"]+'</button>' +
    '<button type="button" class="btn btn-default ml-2" id="btn_select" data-item="'+row.id+'" >'+
    '<i class="fa fa-check-circle mr-2" style="color:#3c8dbc" aria-hidden="true"></i>เลือก</button>';
    return str;
}


/**
*   render button
*   @param {object} row - The data for the whole row
*   @param {string} type - The data type requested for the cell
*   @param {any} set - Value to set if the type parameter is set String
*   @param {object} meta - An object that contains additional information about the cell being requested
*   @return {string} button
*/
srvHistory.renderTableButton_Download = function(row, type, set, meta){
    var str = '<button type="button" class="btn btn-primary ml-2" id="btn_select_download" data-item="'+row.id+'" ><i class="fa fa-download mr-2" aria-hidden="true"></i>'+
   'ดาวน์โหลด</button>';
    return str;
}



/**
*   display order detail
*/
srvHistory.showOrderDetail = function(){
    var param = {id: parseInt( $(this).attr('data-item') ) };
    // console.log("-- showOrderDetail --",param);
    apiService.GetCachedRequest(srvHistory.service , param, function(rs){
        // console.log("-- showOrderDetail -- : GetCachedRequest = ",param);
        if (rs.result == "OK"){
            srvHistory.orderDetailTable.clear();
            srvHistory.orderDetailTable.rows.add(rs.data);
            srvHistory.orderDetailTable.draw();
            $('#modal').modal();
        }
    });
}

/**
*   display order detail
*/
srvHistory.showOrderDetail_download = function(){
    var param = {id: parseInt( $(this).attr('data-item') ) };
    // console.log("Download",param);
    apiService.GetCachedRequest(srvHistory.service , param, function(rs){
        // console.log("Download : ",param);
        if (rs.result == "OK"){
            // console.log("Download RS : ",rs);
            srvHistory_ListData = rs.data
            srvHistory.orderDetailTable_Download.clear();
            srvHistory.orderDetailTable_Download.rows.add(rs.data);
            srvHistory.orderDetailTable_Download.draw();
            // $("#table_order_detail_download").on('click' , '#btn_select_download' , srvHistory.DownloadFile);
            $('#modal_2').modal();
        }
    });
}

/**
*   render metadataservice name
*   @param {object} row - The data for the whole row
*   @return {string} metadataservice name
*/
srvHistory.renderMetadataserviceName = function(row){
    return JH.GetJsonLangValue(row["metadata"] , "metadataservice_name", true);
}
/**
*   render detail frequency
*   @param {object} row - The data for the whole row
*   @return {string} detail frequency
*/
srvHistory.renderDetailFrequency = function(row){
    // console.log("data-frequency",row);
    return JH.GetJsonValue(row, "detail_frequency");
}
/**
*   render detail frequency
*   @param {object} row - The data for the whole row
*   @return {string} detail frequency
*/
srvHistory.renderDate = function(row){
    // console.log("detail_source_result_date",row);
    return JH.GetJsonValue(row, "detail_source_result_date");
}



/**
*   render agency name
*   @param {object} row - The data for the whole row
*   @return {string} agency name
*/
srvHistory.renderAgencyName = function(row){
    return JH.GetJsonLangValue(row["agency"] , "agency_name", true);
}

/**
*   render servicemethod name
*   @param {object} row - The data for the whole row
*   @return {string} servicemethod name
*/
srvHistory.renderServiceMethodName = function(row){
    return JH.GetJsonLangValue(row["service"] , "servicemethod_name", true);
}

/**
*   render province name
*   @param {object} row - The data for the whole row
*   @return {string} province name
*/
srvHistory.renderProvinceName = function(row){
    if ( !row["province"] ){ return ""; }
    var str = ""
    for (var i = 0 ; i < row["province"].length ; i++){
        var p = row["province"][i];
        str += JH.GetJsonLangValue(p , "province_name", true);
        if (i != row["province"].length - 1 ){
            str +",";
        }
    }
    return str;
}

/**
*   render basin name
*   @param {object} row - The data for the whole row
*   @return {string} basin name
*/
srvHistory.renderBasinName = function(row){
    if ( !row["basin"] ){ return ""; }
    var str = ""
    for (var i = 0 ; i < row["basin"].length ; i++){
        var p = row["basin"][i];
        str += JH.GetJsonLangValue(p , "basin_name", true);
        if (i != (row["basin"].length - 1) ){
            str += ",";
        }
    }
    return str;
}

/**
*   render detail_status
*   @param {object} row - The data for the whole row
*   @return {string} detail_status
*/
srvHistory.renderStatus = function(row){
    return JH.GetJsonValue(row["order_detail_status"] , "detail_status");
}

/**
*   download file
*/

srvHistory.DownloadFile = function() {
    var param = $(this).attr('data-item');
    // console.log("Download",param);
    listData = srvHistory_ListData
    data = listData.find(el=>el.id == param)
    // console.log(data)
    if (data == null){
        return
    }
    
    // apiService.GetCachedRequest(srvHistory.metadata , {metadata_id :data.e_id}, function(rs){
    //     // console.log("PARAM = ",param.id);
    //     if (rs.result == "OK"){
    //         // console.log("RS",rs)
    //     }
    // });



    pv = JH.GetJsonValue(data , "province");
    // console.log(pv)
    pv_name = ""
    for(i=0;i<pv.length;i++){
        // console.log(pv[i])
        //pv_name.push(JH.GetJsonLangValue(pv[i] , "province_name",true))
        pv_name += JH.GetJsonLangValue(pv[i] , "province_name",true)
        if(i != pv.length-1){
            pv_name += ","
        }

    }


    // console.log(JH.GetJsonValue(data , "metadataservice_name"))
    form_content = {
        id:{
            header:'"ลำดับ"',
            data:''
        },
        agency:{
            header:'"หน่วยงานเจ้าของข้อมูล"',
            data:'"'+JH.GetJsonLangValue(data["agency"] , "agency_name",true)+'"'
        },
        category:{
            header:'"หมวดหมู่"',
            data:'"'+JH.GetJsonLangValue(data["category"] , "category_name",true)+'"'
        },
        department:{
            header:'"แผนก"',
            data:'"'+JH.GetJsonLangValue(data["department"] , "department_name",true)+'"'
        },
        metadata:{
            header:'"ชื่อข้อมูล"',
            data:'"'+JH.GetJsonLangValue(data["metadata"] , "metadataservice_name",true)+'"'
        },
        ministry:{
            header:'"กระทรวง"',
            data:'"'+JH.GetJsonLangValue(data["ministry"] , "ministry_name",true)+'"'
        },
        province:{
            header:'"จังหวัด"',
            data:'"'+[pv_name]+'"'
        },
        user_fullname:{
            header:'"ชื่อผู้ใช้งาน"',
            data:'"'+JH.GetJsonValue(data, "user_fullname")+'"'
        },
        order_detail_status:{
            header:'"สถานะคำขอข้อมูล"',
            data:'"'+JH.GetJsonValue(data["order_detail_status"], "detail_status")+'"'
        },
        order_purpose:{
            header:'"วัตถุประสงค์"',
            data:'"'+JH.GetJsonValue(data, "order_purpose")+'"'
        },
        detail_frequency:{
            header:'"ความถี่ข้อมูล"',
            data:'"'+JH.GetJsonValue(data, "detail_frequency")+'"'
        },
        service:{
            header:'"ประเภทการนำออก"',
            data:'"'+JH.GetJsonLangValue(data["service"], "servicemethod_name",true)+'"'
        }

    }

    var list = [
        form_content.id,
        form_content.user_fullname,
        form_content.metadata,
        form_content.order_detail_status,
        form_content.order_purpose,
        form_content.detail_frequency,
        form_content.service,
        form_content.agency,
        form_content.category,
        form_content.department,
        form_content.ministry,
        form_content.province
    ]


    header = []
    content = []
    for(i=0;i<list.length;i++){
        if(i==0){
            header.push(list[i].header)
            content.push('"'+i+1+'"')
        }
        else{
            header.push(list[i].header)
            content.push(list[i].data)
        }

    }
    payload = []
    payload.push(header)
    payload.push(content)

    ////////////
	
	// var data = []; //the session log data
	// var tbl = srvSessionLog.dataTable; //table element
	// var rows_count = tbl.data().count(); //amount row

	// if ( rows_count == 0 ) {
	// 	bootbox.alert("no data to export")
	// }

	// var headers = tbl.settings()[0].aoColumns; //headers data
	// var row = []; //row data

	// for (var i = 0; i < headers.length; i++) {
	// 	if ( !headers[i].bVisible ) {
	// 		continue
	// 	}
	// 	row.push('"' + headers[i].sTitle.replace('"','""') + '"')
	// }
	// data.push(row)

	// for (var i = 0; i < rows_count; i++ ) {
	// 	var cells = $(tbl.row(i).node()).find('td'); //cells

	// 	row = []
	// 	for (var j = 0; j < headers.length; j++) {
	// 		if ( !headers[j].bVisible ) {
	// 			continue
	// 		}
	// 		var v
	// 		if ( j == 0 ) {
	// 			v = parseInt(cells[j].innerText)
	// 		} else {
	// 			v  = '"' + cells[j].innerText.replace('"','""') + '"'
	// 		}

	// 		row.push(v)
	// 	}
	// 	data.push(row)
	// }

	payload.sort(function(a,b) {
		return a[0] - b[0]
	})

    
    var csvContent =  "\uFEFF"
    // console.log("DATA",payload)
	payload.forEach(function(infoArray, index){
   		dataString = infoArray.join(",");
   		csvContent += index < payload.length ? dataString+ "\n" : dataString;
	});

	var fname = JH.GetJsonLangValue(data["metadata"] , "metadataservice_name", true) +".csv"; //file name


	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), fname);
		return
	}

	var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", fname);
	document.body.appendChild(link) // Required for FF
	link.click();
	document.body.removeChild(link)
}
