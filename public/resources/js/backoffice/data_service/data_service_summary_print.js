/**
*
*   sp Object for handler data service summary print page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var sp = {};

/**
*   Initial sp
*/
sp.init = function(){
    sp.service = "thaiwater30/backoffice/data_service/summaryInit";

    var param = {
        datestart: $('#input-datestart').val(),
        dateend: $('#input-dateend').val(),
        user_id: parseInt($('#input-user').val()),
        agency_id: parseInt($('#input-agency').val())
    };
    //chang- comment ===========
    // var date = new Date();
    // if(
    //     param.datestart==date.toISOString().split('T')[0] &&
    //     param.dateend==date.toISOString().split('T')[0]){
    //         param = {}
    //     }
    //=================
    apiService.GetCachedRequest(sp.service, param , function(rs){
        sp.order = rs.order;
        sp.agency = rs.agency;
        //chang- เพิ่ม getOrderAgency===================
        arr_result = [[],[]]
        if(sp.order.data!=null){
        arr_result = sp.getOrderAgency(sp.order.data)
        }
        else{
            sp.order.data = []
        }
        sp.array_order_agency = arr_result[0]
        sp.array_meta_data = arr_result[1]
        //=============================================
        sp.renderPrint();
    });
}
//chang- add sp.getOrderAgency
/**
 * render agency to array
 * @param {*} order - order ของ agency
 */
sp.getOrderAgency = function(order){
    var array_order_agency = []
    var array_meta_data = []
    var empty_agency = {id:null,
        name:{th:"ไม่มีชื่อหน่วยงาน",en:"",jp:""},
        count:0
    }
    for(var i=0;i<order.length;i++){
        
        var hasnotOrderAgency = true
        var hasnotMeatadata = true


        //หน่วยงาน
        for(var j=0;j<array_order_agency.length;j++){
            if(array_order_agency[j].name.th==order[i].user_agency_name.th &&
                 array_order_agency[j].name.th!=undefined &&
                 array_order_agency[j].name.th!=""){
                     array_order_agency[j].count = array_order_agency[j].count+1
                     hasnotOrderAgency=false
                     break
                 }
            else if(array_order_agency[j].name.en==order[i].user_agency_name.en &&
                array_order_agency[j].name.en!=undefined &&
                array_order_agency[j].name.en!=""){
                    array_order_agency[j].count = array_order_agency[j].count+1
                    hasnotOrderAgency=false
                    break
                }
            else if(array_order_agency[j].name.jp==order[i].user_agency_name.jp &&
                array_order_agency[j].name.jp!=undefined &&
                array_order_agency[j].name.jp!=""){
                    array_order_agency[j].count = array_order_agency[j].count+1
                    hasnotOrderAgency=false
                    break
                }
        }

        //ประเภทข้อมูล
        for(var j=0;j<array_meta_data.length;j++){
            if(array_meta_data[j].name.th==order[i].metadata.metadataservice_name.th &&
                array_meta_data[j].name.th!=undefined &&
                array_meta_data[j].name.th!=""){
                    array_meta_data[j].count = array_meta_data[j].count+1
                    hasnotMeatadata=false
                     break
                 }
            else if(array_meta_data[j].name.en==order[i].metadata.metadataservice_name.en &&
                array_meta_data[j].name.en!=undefined &&
                array_meta_data[j].name.en!=""){
                    array_meta_data[j].count = array_meta_data[j].count+1
                    hasnotMeatadata=false
                    break
                }
            else if(array_meta_data[j].name.jp==order[i].metadata.metadataservice_name.jp &&
                array_meta_data[j].name.jp!=undefined &&
                array_meta_data[j].name.jp!=""){
                    array_meta_data[j].count = array_meta_data[j].count+1
                    hasnotMeatadata=false
                    break
                }
        }

        if((order[i].user_agency_name.th == undefined &&
            order[i].user_agency_name.jp == undefined &&
            order[i].user_agency_name.en == undefined )||
            (order[i].user_agency_name.th == "" &&
                order[i].user_agency_name.jp == "" &&
                order[i].user_agency_name.en == "" )){
                    empty_agency.count = empty_agency.count+1
                }
        else if(hasnotOrderAgency){
            array_order_agency.push({
                id:null,
                name:order[i].user_agency_name,
                count:1});
        }

        if(hasnotMeatadata &&(order[i].metadata.metadataservice_name.th != undefined ||
            order[i].metadata.metadataservice_name.jp != undefined ||
            order[i].metadata.metadataservice_name.en != undefined )){
            array_meta_data.push({
                name:order[i].metadata.metadataservice_name,
                count:1
            })
        }
    }
    // for(var i=0;i<array_order_agency.length;i++){
    //     for(var j=0;j<agency.length;j++){
    //         if(array_order_agency[i].name.th==agency[j].agency_name.th){
    //             array_order_agency[i].id = agency[j].id
    //             break
    //         }
    //         else if(array_order_agency[i].name.en==agency[j].agency_name.en){
    //             array_order_agency[i].id = agency[j].id
    //             break
    //         }
    //         else if(array_order_agency[i].name.jp==agency[j].agency_name.jp){
    //             array_order_agency[i].id = agency[j].id
    //             break
    //         }
    //     }
    // }
    // if(empty_agency.count>0){
    //     array_order_agency.push(empty_agency);
    // }
    array_meta_data.sort((a, b) => (a.count < b.count) ? 1 : -1)
    return [array_order_agency,array_meta_data]
}

/**
*   render print page
*/
sp.renderPrint = function(){
    sp.renderAgency();
    sp.renderTable1();
    //chang- comment sp.renderTable2() กับ sp.renderChart() ==============
    // sp.renderTable2();
    // sp.renderChart();
    //====================================================================
    sp.renderTable3();
    sp.renderChart2();
}

/**
*   render selected agency
*/
sp.renderAgency = function(){
    var text = "";
    if ( parseInt($('#input-agency').val()) == 0){
        text = TRANSLATOR["all_agency"];
    }else{
        if (sp.agency.result == "OK" && sp.agency.data){
            var data = sp.agency.data;
            for(var i = 0 ; i < data.length ; i++){
                var d = data[i];
                var value = JH.GetJsonValue(d , "id");
                if (value == $('#input-agency').val()){
                    text = JH.GetJsonLangValue(d , "agency_name",true);
                    break;
                }
            }
        }
    }
    $('#page-summary-1').find('span[name="agency"]').text(text);

}

sp.createPage = function(page){
	if ( arguments.length == 0){
		return $('#page-landscape').clone().removeAttr('id').removeClass('d-none');
	}else{
		return $('#page').clone().removeAttr('id').removeClass('d-none');
	}
}

/**
*   render table
*/
// sp.renderTable = function(){
//     var data = sp.order.data;
//     var isFirstPage = true;
//     sp.table = sp.getTable();
//     sp.table2 = sp.getTable();
//     sp.table3 = sp.getTable();
//     sp.page = $('#page-summary-1 > .subpage').append(sp.table);
//     sp.page = $('#page-summary-2 > .subpage').append(sp.table2);
//     sp.page = $('#page-summary-3 > .subpage').append(sp.table3);

//     if(typeof data === 'undefined' || data == null){return false}

//     for (var i = 0 ; i < data.length ; i++){
//         var d = data[i];

//         sp.tr = "<tr>";
//         sp.tr += "<td align='center'>" + (i+1) + "</td>";
//         sp.tr += "<td>" + JH.GetJsonValue(d , "order_header_id") + "</td>";
//         sp.tr += "<td>" + JH.GetJsonLangValue(d , "metadata.metadataservice_name",true) + "</td>";
//         sp.tr += "<td>" + JH.GetJsonValue(d , "user_fullname",true) + "</td>";
//         sp.tr += "<td>" + JH.GetJsonLangValue(d , "user_agency_name") + "</td>";
//         sp.tr += "<td>" + JH.GetJsonLangValue(d , "service.servicemethod_name",true) + "</td>";
//         sp.tr += "<td>" + sp.renderDate(d , "order_header_order_datetime") + "</td>";
//         sp.tr += "<td>" + sp.renderDate(d , "detail_source_result_date") + "</td>";
//         sp.tr += "<td>" + sp.renderOrderResult(d) + "</td>";
//         sp.tr += "</tr>";
//         sp.table.append(sp.tr);

//         if (isFirstPage){
//             if ( sp.table.height() > ($('#page-summary-1').find('.subpage').height() - $('#page-header').height()) ){
//                 sp.newPage();
//                 isFirstPage = false;
//             }
//         }else{
//             if ( sp.table.height() > $('div.page:last > .subpage').height() ){
//                 sp.newPage();
//             }
//         }
//     }
// }

/**
*   render date
*   @param {object} d - object ที่เก็บค่า
*   @param {string} key - key ที่ต้องการดึง
*   @return {string} d[key]
*/
sp.renderDate = function(d , key){
    var date = JH.GetJsonValue(d , key);
    if (date == ""){ return ""; }
    return date.split("T")[0];
}

/**
*   render order result
*   @param {object} d - object ที่เก็บค่า
*   @return {string} d[detail_source_result]
*/
sp.renderOrderResult = function(d){
    var status = JH.GetJsonValue(d,"detail_source_result");
    if (status == ""){ return ""; }
    return TRANSLATOR["source_result_" + status];
}

/**
*   add new page
*/
sp.newPage = function(){
    sp.table.find('tr:last').remove();

    //chang- change #page-landscape to #page
    sp.page = $('#page').clone().removeAttr('id').removeClass('d-none');
    $('.pdf').append(sp.page);
    sp.table = sp.getTable();
    sp.page.find('.subpage').append(sp.table);
    sp.table.append(sp.tr);
}

/**
*   get table-summary
*   @return {element} table
*/
sp.getTable = function(){
    return $('#table-summary').clone().removeAttr('id').removeClass('d-none');
}

sp.getTable2 = function(){
    return $('#table-summary2').clone().removeAttr('id').removeClass('d-none');
}

sp.getTable3 = function(){
    return $('#table-summary3').clone().removeAttr('id').removeClass('d-none');
}

//chang- แก้ไขให้ดึงข้อมูลมาจากตาราง
sp.renderTable1 = function(){
    // var data = ['จำนวนคำขอข้อมูล','จำนวนหน่วยงานภาคีที่ขอข้อมูล','จำนวน API ที่เรียกใช้ข้อมูล','จำนวนหน่วยงานที่เรียกใช้ API ล่าสุด'];
    var data = ['จำนวนคำขอข้อมูล','จำนวนหน่วยงานภาคีที่ขอข้อมูล'];
    var value = [sp.order.data.length,
        sp.array_order_agency.length];
    // var type = ['รายการ','หน่วยงาน','ครั้ง','หน่วยงาน'];
    var type = ['รายการ','หน่วยงาน'];
    // var desc = ['','','','หน่วยงานภาคี 13 + 1 (หน่วยงานราชการอื่น)'];
    var desc = ['',''];
    var isFirstPage = true;
    sp.table = sp.getTable();
    sp.page = $('#page-summary-1 > .subpage').append(sp.table);

    if(typeof data === 'undefined' || data == null){return false}

    for (var i = 0 ; i < data.length ; i++){
        sp.tr = "<tr>";
        sp.tr += "<td align='center'>" + (i+1) + "</td>";
        sp.tr += "<td>" + data[i] + "</td>";
        sp.tr += "<td>" + value[i] + "</td>";
        sp.tr += "<td>" + type[i] + "</td>";
        sp.tr += "<td>" + desc[i] + "</td>";
        sp.tr += "</tr>";
        sp.table.append(sp.tr);

        if (isFirstPage){
            if ( sp.table.height() > ($('#page-summary-1').find('.subpage').height() - $('#page-header').height()) ){
                sp.newPage();
                isFirstPage = false;
            }
        }else{
            if ( sp.table.height() > $('div.page:last > .subpage').height() ){
                sp.newPage();
            }
        }
    }
}

sp.renderTable2 = function(){
    var data = ['การประปานครหลวง','กรมป้องกันและบรรเทาสาธารณภัย','สถาบันสารสนเทศทรัพยากรน้ำ','ศูนย์อำนวยการน้ำแห่งชาติ','ศูนย์เทคโนโลยีอิเล็กทรอนิกส์ฯ','กรมฝนหลวง','**สำนักงานบรรเทาทุกข์ฯ','การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย','กรมประมง','กรมทางหลวงชนบท','กรมควบคุมมลพิษ','กรมส่งเสริมการเกษตร','กรมการข่าว กองทัพอากาศ','สำนักปลัดกระทรวงเกษตรและสหกรณ์'];
    var value =['2,208,096','487,907','280,798','83,498','32,893','22,954','11,093','5,930','2,514','79','32','15','10','8'];
    var isFirstPage = true;
    sp.table = sp.getTable2();
    sp.page = $('#page-summary-2 > .subpage').append(sp.table);

    if(typeof data === 'undefined' || data == null){return false}

    for (var i = 0 ; i < data.length ; i++){
        sp.tr = "<tr>";
        sp.tr += "<td align='center'>" + (i+1) + "</td>";
        sp.tr += "<td>" + data[i] + "</td>";
        sp.tr += "<td>" + value[i] + "</td>";
        sp.tr += "</tr>";
        sp.table.append(sp.tr);

        if (isFirstPage){
            if ( sp.table.height() > ($('#page-summary-2').find('.subpage').height() - $('#page-header').height()) ){
                sp.newPage();
                isFirstPage = false;
            }
        }else{
            if ( sp.table.height() > $('div.page:last > .subpage').height() ){
                sp.newPage();
            }
        }
    }

}

sp.renderChart = function(ar){
	var c = "chart_data"; //type of data to generate chart
	var headText = ""; //header of document

	if ( arguments.length == 1){ c = ar; }

	var rs = chart_data; //data to generate chart
    console.log(rs);
    
    var data = ['การประปานครหลวง','กรมป้องกันและบรรเทาสาธารณภัย','สถาบันสารสนเทศทรัพยากรน้ำ','ศูนย์อำนวยการน้ำแห่งชาติ','ศูนย์เทคโนโลยีอิเล็กทรอนิกส์ฯ','กรมฝนหลวง','**สำนักงานบรรเทาทุกข์ฯ','การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย','กรมประมง','กรมทางหลวงชนบท','กรมควบคุมมลพิษ','กรมส่งเสริมการเกษตร','กรมการข่าว กองทัพอากาศ','สำนักปลัดกระทรวงเกษตรและสหกรณ์']; //data to generate chart
    var value =[2208096,487907,280798,83498,32893,22954,11093,5930,2514,79,32,15,10,8];
	var page = $('#page-summary-chart');
	var subpage = page.find('div.subpage'); //subpage such as second page,third page

	$('.pdf').append(page);


	var div = $('<div/>'); //element div
	var chartOption = {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
            height: (10/16 * 100) + '%',
			type: 'column'
		},
		legend: {
			itemStyle: {
				fontSize: '17px',
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: 'สรุปจำนวนการเรียกใช้ API'
            },
            labels: {
                reserveSpace: true,
                style: {
                    fontSize: '17px'
                }
            }
		},
		series: [],
		xAxis: {
            categories: [],
            labels: {
                rotation: -45,
                align: 'right',
                reserveSpace: true,
                style: {
                    fontSize: '17px'
                }
            }
        },
        plotOptions: {
            series: {
                pointWidth: 40
            }
        }
	}
	var seriesData = [];
	var seriesDataExpected = [] , seriesDataCount = [];
	var categoriesData = [];
	var trRow = [];
	subpage.append(div);
	var table = $('#table-reportimport-detail').clone().removeAttr('id').removeClass('d-none');
	for (var i = 0 ; i < data.length ; i++){
		var d = data[i]; //data  to put on table
		var name = data[i]; //agnecy short name
		var count_expected = value[i]; //download count expected

		var td1 = '<td width="10%">'+name+'</td>'; //table data name
		var td2 = '<td width="30%">'+ 'สรุปจำนวนการเรียกใช้ API'+'</td>'; //table data agency name
		var td3 = '<td width="15%">'+ sp.numberWithCommas(count_expected) +'</td>'; //tab;e data count expected
		var td4 = '<td width="15%">'+ sp.numberWithCommas(3) +'</td>'; //table data value
		var td5 = '<td width="30%">'+ sp.progressBar(JH.GetJsonValue(d, "download_count_percent")) +'</td>'; //table data downlod count percent

		seriesDataExpected.push(count_expected);
		//seriesDataCount.push(value);
		categoriesData.push(name);
		trRow.push('<tr>' + td1+td2+td3+td4+td5 + '</tr>');
	}
	seriesData.push({ name: 'จำนวน' , data: seriesDataExpected });

	chartOption["series"] = seriesData;
	chartOption["xAxis"]["categories"] = categoriesData;
	div.highcharts(chartOption);

}

//chang- ดึงข้อมูลมาจากฐานข้อมูล
sp.renderTable3 = function(){
    // var data = ['ชื่อข้อมูลพื้นฐานของเขื่อนขนาดกลาง เช่น รหัส, ชื่อ, พิกัด ฯลฯ','ข้อมูลน้ำในเขื่อนขนาดกลาง','ข้อมูลพื้นฐานทรัพยาการน้ำตำบล','ข้อมูลพื้นฐานทรัพยากรณ์น้ำจังหวัด','ข้อมูลพื้นฐานทรัพยาการน้ำตำบล','ข้อมูลพื้นฐานทรัพยากรณ์น้ำจังหวัด','ข้อมูลหลังการขุดลอก 16 ร่องน้ำเศรษฐกิจ','ข้อมูลคาดการณ์ความสูงคลื่น SWAN Model','ข้อมูลสถานีคาดการณ์ความสูงคลื่น (SWAN Model)','ข้อมูลของโครงการที่เกี่ยวข้องกับน้ำ','ข้อมูลคาดการณ์ฝน','ข้อมูลสถานีคาดการณ์น้ำท่วม ลุ่มน้ำภาคตะวันออก (EAST)']; //data to generate chart
    //chang- นำข้อมูลเขา้ตาราง =========================================
    var data = []
    var value = [];
    for(var i=0;i<sp.array_meta_data.length;i++){
        if(sp.array_meta_data[i].name.th != undefined && sp.array_meta_data[i].name.th !=""){
            data.push(sp.array_meta_data[i].name.th)
            value.push(sp.array_meta_data[i].count)
        }
        else if(sp.array_meta_data.name[i].en != undefined && sp.array_meta_data[i].name.en !=""){
            data.push(sp.array_meta_data[i].name.en)
            value.push(sp.array_meta_data[i].count)
        }
        else if(sp.array_meta_data[i].name.jp != undefined && sp.array_meta_data[i].name.jp !=""){
            data.push(sp.array_meta_data[i].name.jp)
            value.push(sp.array_meta_data[i].count)
        }
    }
    //=================================================================
    var isFirstPage = true;
    sp.table = sp.getTable3();
    sp.page = $('#page-summary-3 > .subpage').append(sp.table);

    if(typeof data === 'undefined' || data == null){return false}

    for (var i = 0 ; i < data.length ; i++){
        sp.tr = "<tr>";
        sp.tr += "<td align='center'>" + (i+1) + "</td>";
        sp.tr += "<td>" + data[i] + "</td>";
        sp.tr += "<td>" + value[i] + "</td>";
        sp.tr += "<td>" + '' + "</td>";
        sp.tr += "<td>" + '' + "</td>";
        sp.tr += "</tr>";
        sp.table.append(sp.tr);

        if (isFirstPage){
            if ( sp.table.height() > ($('#page-summary-3').find('.subpage').height() - $('#page-header').height()) ){
                sp.newPage();
                isFirstPage = false;
            }
        }else{
            if ( sp.table.height() > $('div.page:last > .subpage').height() ){
                sp.newPage();
            }
        }
    }

}

sp.renderChart2 = function(ar){
	if ( arguments.length == 1){ c = ar; }
    // var data = ['ชื่อข้อมูลพื้นฐานของเขื่อนขนาดกลาง เช่น รหัส, ชื่อ, พิกัด ฯลฯ','ข้อมูลน้ำในเขื่อนขนาดกลาง','ข้อมูลพื้นฐานทรัพยาการน้ำตำบล','ข้อมูลพื้นฐานทรัพยากรณ์น้ำจังหวัด','ข้อมูลพื้นฐานทรัพยาการน้ำตำบล','ข้อมูลพื้นฐานทรัพยากรณ์น้ำจังหวัด','ข้อมูลหลังการขุดลอก 16 ร่องน้ำเศรษฐกิจ','ข้อมูลคาดการณ์ความสูงคลื่น SWAN Model','ข้อมูลสถานีคาดการณ์ความสูงคลื่น (SWAN Model)','ข้อมูลของโครงการที่เกี่ยวข้องกับน้ำ','ข้อมูลคาดการณ์ฝน','ข้อมูลสถานีคาดการณ์น้ำท่วม ลุ่มน้ำภาคตะวันออก (EAST)']; //data to generate chart
    // var value = [100,90,80,70,60,50,40,30,20,10,5,1];
    // var data = ['ชื่อข้อมูลพื้นฐานของเขื่อนขนาดกลาง เช่น รหัส, ชื่อ, พิกัด ฯลฯ','ข้อมูลน้ำในเขื่อนขนาดกลาง','ข้อมูลพื้นฐานทรัพยาการน้ำตำบล','ข้อมูลพื้นฐานทรัพยากรณ์น้ำจังหวัด','ข้อมูลพื้นฐานทรัพยาการน้ำตำบล','ข้อมูลพื้นฐานทรัพยากรณ์น้ำจังหวัด','ข้อมูลหลังการขุดลอก 16 ร่องน้ำเศรษฐกิจ','ข้อมูลคาดการณ์ความสูงคลื่น SWAN Model','ข้อมูลสถานีคาดการณ์ความสูงคลื่น (SWAN Model)','ข้อมูลของโครงการที่เกี่ยวข้องกับน้ำ','ข้อมูลคาดการณ์ฝน','ข้อมูลสถานีคาดการณ์น้ำท่วม ลุ่มน้ำภาคตะวันออก (EAST)']; //data to generate chart
    //chang- นำข้อมูลเขา้ตาราง =========================================
    var data = []
    var value = [];
    for(var i=0;i<sp.array_meta_data.length;i++){
        if(sp.array_meta_data[i].name.th != undefined && sp.array_meta_data[i].name.th !=""){
            data.push(sp.array_meta_data[i].name.th)
            value.push(sp.array_meta_data[i].count)
        }
        else if(sp.array_meta_data.name[i].en != undefined && sp.array_meta_data[i].name.en !=""){
            data.push(sp.array_meta_data[i].name.en)
            value.push(sp.array_meta_data[i].count)
        }
        else if(sp.array_meta_data[i].name.jp != undefined && sp.array_meta_data[i].name.jp !=""){
            data.push(sp.array_meta_data[i].name.jp)
            value.push(sp.array_meta_data[i].count)
        }
    }
    //=================================================================
	var page = $('#page-summary-chart-2');
	var subpage = page.find('div.subpage'); //subpage such as second page,third page

	$('.pdf').append(page);


	var div = $('<div/>'); //element div
	var chartOption = {
		chart: {
            height: (9/16 * 100) + '%',
			type: 'column'
		},
		legend: {
            layout: 'vertical',
            floating: true,
            backgroundColor: '#FFFFFF',
            align: 'right',
            verticalAlign: 'left',
			itemStyle: {
                fontSize: '17px',
			}
        },
        xAxis: {
            categories: [],
            labels: {
                rotation: -90,
                align: 'right',
                reserveSpace: true,
                style: {
                    fontSize: '17px'
                }
            }
        },
		yAxis: {
			min: 0,
			title: {
                text: '',
                rotation: 0,
            },
            labels: {
                reserveSpace: true,
                style: {
                    fontSize: '17px'
                }
            }

		},
        series: [],
        plotOptions: {
            series: {
                pointWidth: 40
            }
        }
	}
	var seriesData = [];
	var seriesDataExpected = [] , seriesDataCount = [];
	var categoriesData = [];
	var trRow = [];
	subpage.append(div);

	for (var i = 0 ; i < data.length ; i++){
		var d = data[i]; //data  to put on table
		var name = data[i]; //agnecy short name
		var count_expected = value[i]; //download count expected

		var td1 = '<td width="10%">'+name+'</td>'; //table data name
		var td2 = '<td width="30%">'+ 'Test'+'</td>'; //table data agency name
		var td3 = '<td width="15%">'+ sp.numberWithCommas(count_expected) +'</td>'; //tab;e data count expected
		seriesDataExpected.push(count_expected);
		
		categoriesData.push(name);
		trRow.push('<tr>' + td1+td2+td3 + '</tr>');
    }
    chartOption["xAxis"]["categories"] = categoriesData;
	seriesData.push({ name: 'จำนวน Record' , data: seriesDataExpected });
	chartOption["series"] = seriesData;
	div.highcharts(chartOption);
}

/**
* setting format number with commas
*
* @param {string} nStr number
*
* @return string
*/
sp.numberWithCommas = function(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

sp.progressBar = function(v){
	var v = parseFloat(v)
	return '<div class="progress"><div class="progress-bar" role="progressbar" style="width:'+v+'%;" aria-valuenow="'+v+'"'+
	' aria-valuemin="0" aria-valuemax="100">'+v.toFixed(2)+'%</div></div>';
}

sp.createPage = function(page){
	if ( arguments.length == 0){
		return $('#page-landscape').clone().removeAttr('id').removeClass('d-none');
	}else{
		return $('#page').clone().removeAttr('id').removeClass('d-none');
	}
}

var chart_data = 
{"data":[{"id":1,"code":"CRITICAL","description":{"th":"CRITICAL","en":"Critical","jp":"Japan"},"percent_event":0,"event_code":null},{"id":2,"code":"ERROR","description":{"th":"Error conditions","en":"Error conditions","jp":""},"percent_event":0,"event_code":null},{"id":3,"code":"WARNING","description":{"th":"May indicate that an error will occur if action is not taken","en":"Test","jp":"Japn"},"percent_event":0,"event_code":null},{"id":4,"code":"NOTICE","description":{"th":"Events that are unusual, but not error conditions","en":"Events that are unusual, but not error conditions","jp":""},"percent_event":0,"event_code":null},{"id":5,"code":"INFORMATION","description":{"th":"Normal operational messages that require no action","en":"Normal operational messages that require no action","jp":""},"percent_event":0,"event_code":null},{"id":6,"code":"DEBUG","description":{"th":"Information useful to developers for debugging the application","en":"Information useful to developers for debugging the application","jp":""},"percent_event":0,"event_code":null}],"chart_data":{"data":{"result":"OK","data":[{"download_count_expected":1,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":57,"agency_name":{"en":"AVISO (Archiving, Validation and Interpretation of Satellite Oceanographic)","jp":"衛星海洋データのアーカイブ、検証、解釈","th":"AVISO (Archiving, Validation and Interpretation of Satellite Oceanographic)"},"agency_shortname":{"en":"AVISO","jp":"","th":"AVISO"}}},{"download_count_expected":1,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":52,"agency_name":{"en":"Digital Typhoon","jp":"","th":"Digital Typhoon"},"agency_shortname":{"en":"DT","jp":"","th":"DT"}}},{"download_count_expected":25,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":50,"agency_name":{"en":"Kochi University","jp":"","th":"Kochi University"},"agency_shortname":{"en":"KoU","jp":"","th":"KoU"}}},{"download_count_expected":2,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":56,"agency_name":{"en":"Ocean Weather Inc. ","jp":"","th":"Ocean Weather Inc. "},"agency_shortname":{"en":"OWI","jp":"","th":"OWI"}}},{"download_count_expected":8,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":55,"agency_name":{"en":"United States Department of Agriculture","jp":"","th":"United States Department of Agriculture"},"agency_shortname":{"en":"USDA","jp":"","th":"USDA"}}},{"download_count_expected":52,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":51,"agency_name":{"en":"US Naval Research Laboratory","jp":"","th":"US Naval Research Laboratory"},"agency_shortname":{"en":"USNRL","jp":"","th":"USNRL"}}},{"download_count_expected":4,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":65,"agency_name":{"en":"Weather Underground ","jp":"","th":"Weather Underground "},"agency_shortname":{"en":"wunderground","jp":"","th":"wunderground"}}},{"download_count_expected":72,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":14,"agency_name":{"en":"Pollution Control Department","jp":"","th":"กรมควบคุมมลพิษ "},"agency_shortname":{"en":"PCD","jp":"","th":"คพ."}}},{"download_count_expected":149,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":12,"agency_name":{"en":"Royal Irrigation Department","jp":"","th":"กรมชลประทาน "},"agency_shortname":{"en":"RID","jp":"","th":""}}},{"download_count_expected":2,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":2,"agency_name":{"en":"Department of Mineral Resources","jp":"鉱物資源省","th":"กรมทรัพยากรธรณี"},"agency_shortname":{"en":"DMR.","jp":"","th":"ทธ."}}},{"download_count_expected":288,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":3,"agency_name":{"en":"Department of Water Resources","jp":"","th":"กรมทรัพยากรน้ำ "},"agency_shortname":{"en":"DWR","jp":"","th":""}}},{"download_count_expected":857,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":13,"agency_name":{"en":"Thai Meteorological Department","jp":"","th":"กรมอุตุนิยมวิทยา "},"agency_shortname":{"en":"TMD","jp":"","th":""}}},{"download_count_expected":2170,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":6,"agency_name":{"en":"Hydrographics Department, Royal Thai Navy","jp":"","th":"กรมอุทกศาสตร์ "},"agency_shortname":{"en":"RTN","jp":"","th":"อศ"}}},{"download_count_expected":168,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":21,"agency_name":{"en":"Department of National Parks, Wildlife and Plant Conservation","jp":"国立公園・野生生物・植物保護省","th":"กรมอุทยานแห่งขาติ สัตว์ป่าและพันธุ์พืช"},"agency_shortname":{"en":"DNP","jp":"","th":"อส."}}},{"download_count_expected":985,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":8,"agency_name":{"en":"Electricity Generating Authority of Thailand","jp":"","th":"การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย"},"agency_shortname":{"en":"EGAT","jp":"","th":""}}},{"download_count_expected":144,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":23,"agency_name":{"en":"Metropolitan Waterworks Authority","jp":"","th":"การประปานครหลวง"},"agency_shortname":{"en":"MWA","jp":"","th":"กปน."}}},{"download_count_expected":1,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":7,"agency_name":{"en":"Provincial Waterworks Authority","jp":"","th":"การประปาส่วนภูมิภาค"},"agency_shortname":{"en":"PWA","jp":"","th":""}}},{"download_count_expected":24,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":41,"agency_name":{"en":"University College London","jp":"","th":"มหาวิทยาลัยลอนดอน"},"agency_shortname":{"en":"UCL","jp":"","th":""}}},{"download_count_expected":572,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":9,"agency_name":{"en":"Hydro – Informatics Institute (Public Organization)","jp":"","th":"สถาบันสารสนเทศทรัพยากรน้ำ (องค์การมหาชน)"},"agency_shortname":{"en":"HII","jp":"","th":"สสน."}}},{"download_count_expected":769,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":10,"agency_name":{"en":"Department of Bangkok","jp":"","th":"สำนักการระบายน้ำ กรุงเทพมหานคร"},"agency_shortname":{"en":"BMA","jp":"","th":"สรบ กทม."}}},{"download_count_expected":55,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":11,"agency_name":{"en":"Geo-Informatics and Space Technology Development Agency","jp":"","th":"สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (องค์การมหาชน)"},"agency_shortname":{"en":"GISTDA","jp":"","th":""}}},{"download_count_expected":1,"download_count_actual":0,"download_count":0,"download_count_percent":0,"download_lastest_date":"","download_date":"","number_of_record":0,"number_of_file":0,"agency":{"id":60,"agency_name":{"en":"THAILAND GREENHOUSE GAS MANAGEMENT ORGANIZATION (PUBLIC ORGANIZATION)","jp":"","th":"องค์การบริหารจัดการก๊าซเรือนกระจก (องค์การมหาชน)"},"agency_shortname":{"en":"TGO","jp":"","th":"อบก"}}}]}}}