var evt = {}; //Initial data
var arr = [];
var data = [];
evt.init = function(translator) {
    //chang- init service evt.service_get_agency ===================
    evt.service_get_agency = "thaiwater30/backoffice/metadata/agency"
    //==============================================================

	evt.translator = translator; //Text for label and message on java script

	evt.blacklisttableId = 'tbl-dept'; //datatable id
	ctrl = $('#' + evt.blacklisttableId);
	evt.dataTable = ctrl.DataTable({
        dom : 'frlBtip',
		buttons : [{
            text : '<i class="fa fa-plus-circle" aria-hidden="true"></i> Export CSV'
        } ],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		}, {
			data : evt.renderColumDept,
		},  {
			data : evt.renderColumMinist,
		}, {
            data : evt.renderColumLogo,
		}, {
            data : evt.renderCheck1,
        }, {
            data : evt.renderCheck2,
        }, {
            data : evt.renderCheck3,
        }, {
            data : evt.renderCheck4,
        }, {
            data : evt.renderCheck5,
        }, {
            data : evt.renderCheck6,
        }, {
            data : evt.renderCheck7,
        }, {
            data : evt.renderCheck8,
        }, {
            data : evt.renderCheck9,
        }],
		order : [ [ 1, 'asc' ] ],
		rowCallback : evt.dataTableRowCallback,
    })
    //chang- button action to export csv ==========
    evt.dataTable.buttons().action(function(){
        var downloadlink = document.createElement("a");
        downloadlink.download = 'ภาคีข้อมูลน้ำฯ.csv';
        downloadlink.href = 'data:text/csv;charset=utf-8,'+encodeURI(evt.exportCSV());
        downloadlink.click();
    });
    //==============================================
	// generate order number on data table.
	evt.dataTable.on('order.dt search.dt', function() {
		evt.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

    apiService.SendRequest("GET",evt.service_get_agency,{},function(rs){
        for(var i=0;i<rs.data.length;i++){
            var data_val = {
                "agency" : {
                    "deptnameTH" : rs.data[i].agency_name.th, 
                    "deptinit" : 
                    rs.data[i].agency_shortname.en + " : " + rs.data[i].agency_name.en
                },
                "ministry" : {
                    "ministryTH" : rs.data[i].ministry_name.th,
                    "ministryENG" : rs.data[i].ministry_name.en
                },
                "aspects" : rs.data[i].aspects.aspects,
                "leader" : rs.data[i].aspects.leader,
                "dept" :rs.data[i].logo
            }
            if(data_val.aspects == undefined){
                data_val.aspects = []
            }
            if(data_val.leader == undefined){
                data_val.leader = null
            }
            data.push(data_val)
        }
        evt.dataTable.clear();
        evt.dataTable.rows.add(data);
        evt.dataTable.draw();
    });
}

evt.renderCheck = function(row,num) {
    if(JH.GetJsonValue(row, 'aspects').includes(num)){
        return '<i class="fa fa-check text-center" aria-hidden="true"></i>';
    }else if(JH.GetJsonValue(row, 'leader') == num){
        return '<i class="fa fa-check text-center" style="color: red" aria-hidden="true"></i>';
    }else{
        return '';
    }
}

//chang- exportCSV
/**
 * export csv
 */
evt.exportCSV = function(){
    var header = ["ลำดับ","ชื่อหน่วยงาน Agencies","กระทรวง","หัวหน้ากลุ่มคณะทำงาน / คณะทำงาน","ข้อมูลด้านน้ำและภูมิอากาศ"];
    var CSVText = "";
    for(var i=0;i<header.length;i++){
        if(i!=0){
            CSVText += ",";
        }
        CSVText += '"'+header[i]+'"';
    }
    CSVText += "\r\n"
    for(var i=0;i<data.length;i++){
        CSVText += '"' + (i+1).toString() + '",';
        CSVText += '"' + data[i].agency.deptnameTH+" "+data[i].agency.deptinit + '",';
        CSVText += '"' + data[i].ministry.ministryTH+" "+data[i].ministry.ministryENG + '",';
        CSVText += '"' + data[i].leader + '",';
        var aspects_str = "[";
        for(var j=0;j<data[i].aspects.length;j++){
            if(j!=0){
                aspects_str += ",";
            }
            aspects_str += data[i].aspects[j].toString();
        }
        aspects_str += "]"
        CSVText += '"' + aspects_str + '"\r\n';
        CSVText = CSVText.replace('undefined','');
    }
    console.log(CSVText)
    return CSVText
}
/**
* Put data to rows on data table.
*
* @param {json} event_load data to put on data table.
*/
evt.displayDataTables = function(event_load){
	evt.dataTable.clear();
	evt.event_load = data;
	evt.dataTable.rows.add( JH.GetJsonValue(event_load , "data") );
	evt.dataTable.draw();
}

evt.renderColumDept = function(row){
	return '<p class="text-left">' + JH.GetJsonValue(row,'agency.deptnameTH') + '\n' + JH.GetJsonValue(row,'agency.deptinit')  + '<p>';
}

evt.renderColumMinist = function(row){
	return '<p class="text-left">' + JH.GetJsonValue(row,'ministry.ministryTH') + '\n' + JH.GetJsonValue(row,'ministry.ministryENG')  + '<p>';
}

//chang- get logo fron pgadmin ==================
evt.renderColumLogo = function(row){
    var deptPaths = 'data:image/png;base64,';
    var src = deptPaths + JH.GetJsonValue(row,'dept');
    return '<img src="'+ src +'"class="mx-auto my-auto" width="auto" height="50">';
}
//===============================================

evt.renderCheck1 = function(row){
    return evt.renderCheck(row,1);
}

evt.renderCheck2 = function(row){
    return evt.renderCheck(row,2);
}

evt.renderCheck3 = function(row){
    return evt.renderCheck(row,3);
}

evt.renderCheck4 = function(row){
    return evt.renderCheck(row,4);
}

evt.renderCheck5 = function(row){
    return evt.renderCheck(row,5);
}


evt.renderCheck6 = function(row){
    return evt.renderCheck(row,6);
}

evt.renderCheck7 = function(row){
    return evt.renderCheck(row,7);
}

evt.renderCheck8 = function(row){
    return evt.renderCheck(row,8);
}

evt.renderCheck9 = function(row){
    return evt.renderCheck(row,9);
}

// var data = [
//     {
//         "agency" : {
//             "deptnameTH" : "กรมเจ้าท่า",
//             "deptinit" : "MD : Marine Department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงคมนาคม",
//             "ministryENG" : "Ministry of Transport"
//         },
//         "aspects" : [3,5,9],"leader" : null,
//         "dept" : 1
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมแผนที่ทหาร",
//             "deptinit" : "RTSD : Royal Thai Survey Department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงกลาโหม",
//             "ministryENG" : "Ministry of Defence"
//         },
//         "aspects" : [9],"leader" : null,
//         "dept" : 2
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมโยธาธิการและผังเมือง",
//             "deptinit" : "DPT : Department of industrial works"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Industry"
//         },
//         "aspects" : [4,5],"leader" : null,
//         "dept" : 3
//     },{
//         "agency" : {
//             "deptnameTH" : "กรมโรงงานอุตสาหกรรม",
//             "deptinit" : "DIW : Department of industrial works"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงการอุสาหกรรม",
//             "ministryENG" : "Ministry of Industry"
//         },
//         "aspects" : [4,5],"leader" : null,
//         "dept" : 4
//     },{
//         "agency" : {
//             "deptnameTH" : "กรมควบคุมมลพิษ",
//             "deptinit" : "PCD : Pollution Control Department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [],"leader" : 5,
//         "dept" : 5
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมชลประทาน",
//             "deptinit" : "RID : Royal Irrigation Department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงเกษตรและสหกรณ์",
//             "ministryENG" : "Ministry of Agriculture and Cooperatives"
//         },
//         "aspects" : [4,5,6,7],"leader" : 2,
//         "dept" : 6
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมทรัพยากรน้ำบาดาล",
//             "deptinit" : "DGR : Department of Groundwater Resources"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [3,4],"leader" : null,
//         "dept" : 7
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมทรัพยากรธรณี",
//             "deptinit" : "DMR : Department of Mineral Resources"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [6],"leader" : null,
//         "dept" : 8
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมทรัพยากรน้ำ",
//             "deptinit" : "DWR : Department of Water Resources"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [4,5],"leader" : null,
//         "dept" : 9
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมทางหลวง",
//             "deptinit" : "DOH : Department of highways"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงคมนาคม",
//             "ministryENG" : "Ministry of Transport"
//         },
//         "aspects" : [9],"leader" : null,
//         "dept" : 10
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมทางหลวงชนบท",
//             "deptinit" : "DRR : Department of Rural Roads"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงคมนาคม",
//             "ministryENG" : "Ministry of Transport"
//         },
//         "aspects" : [9],"leader" : null,
//         "dept" : 11
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมป้องกันและบรรเทาสาธารณภัย",
//             "deptinit" : "DDPM : Department of Disaster Prevention and Mitigation"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Interior"
//         },
//         "aspects" : [3,4,8],"leader" : 6,
//         "dept" : 12
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมป่าไม้",
//             "deptinit" : "FOREST : Royal forest department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [9],"leader" : null,
//         "dept" : 13
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมฝนหลวงและการบินเกษตร",
//             "deptinit" : "DRRAA : Department of Royal Rainmaking and Agricultural Aviation"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงเกษตรและสหกรณ์ ",
//             "ministryENG" : "Ministry of Agriculture and Cooperatives"
//         },
//         "aspects" : [1],"leader" : null,
//         "dept" : 14
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมพัฒนาที่ดิน",
//             "deptinit" : "LDD : Land Development Department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงเกษตรและสหกรณ์",
//             "ministryENG" : "Ministry of Agriculture and Cooperatives"
//         },
//         "aspects" : [3],"leader" : null,
//         "dept" : 15
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมอุตุนิยมวิทยา",
//             "deptinit" : "TMD : Thai Meteorological Department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม",
//             "ministryENG" : "Ministry of Digital Economy and Society"
//         },
//         "aspects" : [6],"leader" : 1,
//         "dept" : 16
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมอุทกศาสตร์ กองทัพเรือ",
//             "deptinit" : "RTN : Hydrographic Department, Royal thai navy"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงกลาโหม",
//             "ministryENG" : "Ministry of Defence"
//         },
//         "aspects" : [5],"leader" : null,
//         "dept" : 17
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช",
//             "deptinit" : "DNP : Department of National Parks, Wildlife and Plant Conservation"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [9],"leader" : null,
//         "dept" : 18
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย",
//             "deptinit" : "EGAT : Electricity Generating Authority of Thailand"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงพลังงาน",
//             "ministryENG" : "Ministry of Energy"
//         },
//         "aspects" : [2,4],"leader" : 6,
//         "dept" : 19
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "การนิคมอุตสาหกรรมแห่งประเทศไทย",
//             "deptinit" : "IEAT : Industrial Estate Authority of Thailand"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงอุตสาหกรรม",
//             "ministryENG" : "Ministry of Industry"
//         },
//         "aspects" : [5],"leader" : null,
//         "dept" : 20
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "การประปานครหลวง",
//             "deptinit" : "MWA : Metropolitan Waterworks Authority"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Interior"
//         },
//         "aspects" : [4,5],"leader" : null,
//         "dept" : 21
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "การประปาส่วนภูมิภาค",
//             "deptinit" : "PWA : Provincial Waterworks Authority"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Interior"
//         },
//         "aspects" : [5],"leader" : 4,
//         "dept" : 22
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "ศูนย์เตือนภัยพิบัติแห่งชาติ",
//             "deptinit" : "NDWC : National Disaster Warning Center"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Interior"
//         },
//         "aspects" : [6],"leader" : null,
//         "dept" : 23
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "ศูนย์เทคโนโลยีอิเล็กทรอนิกส์และคอมพิวเตอร์แห่งชาติ",
//             "deptinit" : "NECTEC : National Electronics and Computer Technology Center"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัย และนวัตกรรม",
//             "ministryENG" : "Ministry of Higher Education, Science, Research and Innovation"
//         },
//         "aspects" : [8],"leader" : null,
//         "dept" : 24
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สถาบันสารสนเทศทรัพยากรน้ำ (องค์การมหาชน)",
//             "deptinit" : "HII : Hydro Informatics Institute"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัย และนวัตกรรม",
//             "ministryENG" : "Ministry of Higher Education, Science, Research and Innovation"
//         },
//         "aspects" : [1,2,3,4,5,6,7],"leader" : 9,
//         "dept" : 25
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรุงเทพมหานคร (สำนักการระบายน้ำ)",
//             "deptinit" : "BMA : Department of Drainage and Sewerage"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Interior"
//         },
//         "aspects" : [5,6],"leader" : null,
//         "dept" : 26
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงบประมาณ",
//             "deptinit" : "BB : Bureau of the Budget"
//         },
//         "ministry" : {
//             "ministryTH" : "สำนักนายกรัฐมนตรี",
//             "ministryENG" : "Prime Minister's Office"
//         },
//         "aspects" : [8],"leader" : null,
//         "dept" : 27
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงานคณะกรรมการวิจัยแห่งชาติ",
//             "deptinit" : "NRCT : National Research Council of Thailand"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัย และนวัตกรรม",
//             "ministryENG" : "Ministry of Higher Education, Science, Research and Innovation"
//         },
//         "aspects" : [8],"leader" : null,
//         "dept" : 28
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงานกองทุนสนับสนุนการวิจัย",
//             "deptinit" : "TRF : The Thailand Research Fund"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัย และนวัตกรรม",
//             "ministryENG" : "Ministry of Higher Education, Science, Research and Innovation"
//         },
//         "aspects" : [8],"leader" : null,
//         "dept" : 29
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงานคณะกรรมการพัฒนาเศรษฐกิจและสังคมแห่งชาติ",
//             "deptinit" : "NESDB : Office of the National Economic and Social"
//         },
//         "ministry" : {
//             "ministryTH" : "สำนักนายกรัฐมนตรี",
//             "ministryENG" : "Prime Minister's Office"
//         },
//         "aspects" : [8],"leader" : null,
//         "dept" : 30
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงานคณะกรรมการกฤษฎีกา",
//             "deptinit" : "KRISDIKA : Office of the Council of State"
//         },
//         "ministry" : {
//             "ministryTH" : "สำนักนายกรัฐมนตรี",
//             "ministryENG" : "Prime Minister's Office"
//         },
//         "aspects" : [8],"leader" : null,
//         "dept" : 31
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ ",
//             "deptinit" : "GISTDA : Geo-Informatics and Space Technology Development Agency"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัย และนวัตกรรม",
//             "ministryENG" : "Ministry of Higher Education, Science, Research and Innovation"
//         },
//         "aspects" : [],"leader" : 3,
//         "dept" : 32
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงานพัฒนารัฐบาลดิจิทัล (องค์การมหาชน)(สพร.)",
//             "deptinit" : "DGA : Digital Government Development Agency"
//         },
//         "ministry" : {
//             "ministryTH" : "สำนักนายกรัฐมนตรี",
//             "ministryENG" : "Prime Minister's Office"
//         },
//         "aspects" : [9],"leader" : null,
//         "dept" : 33
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักงานสถิติแห่งชาติ",
//             "deptinit" : "NSO : National Statistical Office"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม",
//             "ministryENG" : "Ministry of Digital Economy and Society"
//         },
//         "aspects" : [],"leader" : 8,
//         "dept" : 34
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "องค์การก๊าซเรือนกระจก (องค์การมหาชน)",
//             "deptinit" : "TGO : THAILAND GREENHOUSE GAS MANAGEMENT ORGANIZATION (PUBLIC ORGANIZATION)"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [4],"leader" : null,
//         "dept" : 35
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมควบคุมโรค",
//             "deptinit" : "DDC : Department of Disease Control"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงสาธารณสุข ",
//             "ministryENG" : "Ministry of Public Health"
//         },
//         "aspects" : [9],
//         "leader" : null,
//         "dept" : 36
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมอนามัย",
//             "deptinit" : "DOH : Department of Health"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงสาธารณสุข",
//             "ministryENG" : "Ministry of Public Health"
//         },
//         "aspects" : [9],
//         "leader" : null,
//         "dept" : 37
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมการข้าว",
//             "deptinit" : "RD : RICE Department"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงเกษตรและสหกรณ์ ",
//             "ministryENG" : "Ministry of Agriculture and Cooperatives"
//         },
//         "aspects" : [3],"leader" : null,
//         "dept" : 38
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมส่งเสริมการปกครองส่วนท้องถิ่น",
//             "deptinit" : "DLA : Department of Local Administration"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Interior"
//         },
//         "aspects" : [3,4],"leader" : null,
//         "dept" : 39
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมส่งเสริมการเกษตร",
//             "deptinit" : "DOAE : Department of Agricultural Extension"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงเกษตรและสหกรณ์ ",
//             "ministryENG" : "Ministry of Agriculture and Cooperatives"
//         },
//         "aspects" : [3],"leader" : null,
//         "dept" : 40
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมทรัพยากรทะเลและชายฝั่ง",
//             "deptinit" : "DMCR : Department of Marine and Coastal Resources"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม",
//             "ministryENG" : "Ministry of Natural Resources and Environment"
//         },
//         "aspects" : [5],"leader" : null,
//         "dept" : 41
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "สำนักปลัดกระทรวงเกษตรและสหกรณ์",
//             "deptinit" : "OPSMOAC : OFFICE OF THE PERMANENT SECRETARY FOR MINISTRY OF AGRICULTURE AND COOPERATIVES"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงเกษตรและสหกรณ์",
//             "ministryENG" : "Ministry of Agriculture and Cooperatives"
//         },
//         "aspects" : [9],"leader" : null,
//         "dept" : 42
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "องค์การจัดการน้ำเสีย (องค์การมหาชน)",
//             "deptinit" : "WMA : Wastewater Management Authority"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงมหาดไทย",
//             "ministryENG" : "Ministry of Interior"
//         },
//         "aspects" : [5],"leader" : null,
//         "dept" : 43
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมประมง",
//             "deptinit" : "DOF : Department of Fisheries"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงเกษตรและสหกรณ์",
//             "ministryENG" : "Ministry of Agriculture and Cooperatives"
//         },
//         "aspects" : [5],"leader" : null,
//         "dept" : 44
//     },
//     {
//         "agency" : {
//             "deptnameTH" : "กรมข่าว กองทัพอากาศ",
//             "deptinit" : "RTAF : Director of Intelligence Directorate of Intelligence"
//         },
//         "ministry" : {
//             "ministryTH" : "กระทรวงกลาโหม",
//             "ministryENG" : "Ministry of Defence"
//         },
//         "aspects" : [9],
//         "leader" : null,
//         "dept" : 45
//     }
// ]
