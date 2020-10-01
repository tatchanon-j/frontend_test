/**
*
*   Main JS application file for report import print preview.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var ri = {}; //initial data


/**
* prepare data
*/
ri.init = function(){
	ri.srv_event_summary_report = "thaiwater30/backoffice/data_integration_report/event_summary_report"; //service event summary report
	ri.srv_download_percent = "thaiwater30/backoffice/data_integration_report/download_percent"; //service download percent
	ri.service = "thaiwater30/backoffice/data_integration_report/report_import_print"; //service report import print
	//chang- ============================
	ri.listchart = []//init list of chart
	//===================================

	var param = {
		start_date : $('#input-date').val() +' '+ $('#input-starttime').val(),
		end_date : $('#input-date').val() +' '+ $('#input-endtime').val()
	};


	$('.btn-print').on('click',ri.printPDF);
	$('#btn-export-pdf').on('click',ri.exportPDF);


	apiService.SendRequest('GET', ri.service, param, function(rs){
		ri.data = JH.GetJsonValue(rs, "data");
		ri.chart_data = JH.GetJsonValue(rs, "chart_data"); //chart data
		ri.chart_data_1 = JH.GetJsonValue(rs, "chart_data_1");
		ri.chart_data_2 = JH.GetJsonValue(rs, "chart_data_2");

		ri.renderTable();
		ri.renderChart();
		ri.renderChart("chart_data_1");
		ri.renderChart("chart_data_2");
	})
}
/**
* print page
*
*/
ri.printPDF = function(){
	$('.in-remark').replaceWith(function(){
		return '<span class='+this.className+'>'+this.value+'</span>'
	})
	$('.td-remark').removeAttr('width');
	$('.td-remark').removeAttr('align');

	location.reload(true);
	window.print();

	$('.in-remark').replaceWith(function(){
		var val = $(this).text();
		return '<input class="in-remark" style="width:400px; margin:1px 0px;" type="text" value="'+val+'"/>'
	})
	$('.td-remark').prop('width','400px');
	$('.td-remark').prop('align','right');
	return false
}

//chang- ri.exportPDF
/**
* export page as pdf
*
*/
ri.exportPDF=function(){
	var elementHTML = window.document.getElementById("pdf-page");
	var list_div_elementHTML = elementHTML.getElementsByClassName("page");
	var list_loop = [];

	for(var i=0;i<list_div_elementHTML.length;i++){
		list_div_elementHTML[i].id = i.toString();
		if(list_div_elementHTML[i].getElementsByClassName('data-high-chart-class').length>0){
			list_div_elementHTML[i].getElementsByClassName('data-high-chart-class')[0].id = "data-high-chart-id-"+i.toString()
		}
		list_loop.push(list_div_elementHTML[i]);
	}

	var list_imgage_page_pdf = []
	var count_loop=0;
	list_loop.forEach(item=>{
		var chart_id = "data-high-chart-id-"+item.id
		var canvas_svg = document.createElement('canvas');
		var chart = $('#'+chart_id).highcharts();
		if(chart!=undefined){
			canvas_svg.height = $('#'+chart_id).height();
			canvas_svg.width = $('#'+chart_id).width();
			var img_svg = new Image;
			var render_width = canvas_svg.width;
			var render_height = render_width * chart.chartHeight / chart.chartWidth
			img_svg.onload = function(){
				canvas_svg.getContext('2d').drawImage(this, 0, 0, render_width, render_height);
				$('#'+chart_id).html(canvas_svg);
				count_loop++;
				if(count_loop>=list_loop.length){
					converthtml2canvas(list_loop)
				}
			};
			var svg = chart.getSVG({
				exporting: {
					sourceWidth: chart.chartWidth,
					sourceHeight: chart.chartHeight
				}
			});
			img_svg.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svg)));
		}
		else{
			count_loop++;
			if(count_loop>=list_loop.length){
				converthtml2canvas(list_loop)
			}
		}
	})
	var converthtml2canvas = function(array_html){
		array_html.forEach(item=>{
			html2canvas(item,{dpi: 300,scale:3}).then(canvas=>{
				var img = canvas.toDataURL("image/jpeg", 1);
				list_imgage_page_pdf.push(img);
				if(list_imgage_page_pdf.length>=list_loop.length){
					geneatePDF(list_imgage_page_pdf,canvas.width,canvas.height);
				}
			});
		})
	}
	var geneatePDF = function(array_img,width,height){
		var doc = new jspdf.jsPDF('L', 'px', [width, height]);
		for(var i=0;i<array_img.length;i++){
			var w = array_img[i].offsetWidth;
			var h = array_img[i].offsetHeight;
			doc.addImage(array_img[i], 'JPEG', 0, 0, w, h);
			doc.addPage();
		}
		doc.save('รายงานการนำเข้าข้อมูล.pdf');
		window.location.reload()
	}
}


/**
* creat chart on page
*
* @param {string} ar data to generate chart
*
*/
ri.renderChart = function(ar){
	var c = "chart_data"; //type of data to generate chart
	var headText = ""; //header of document

	if ( arguments.length == 1){ c = ar; }

	var rs = JH.GetJsonValue(ri , c+".data"); //data to generate chart
	console.log(rs);
	var start_date = JH.GetJsonValue(ri , c+".start_date"); //start date
	var end_date = JH.GetJsonValue(ri , c+".end_date"); //end date

	// if ( arguments.length == 1){ headText = ri.createHeadText(start_date,end_date);}
	if ( JH.GetJsonValue(rs , "result") != "OK" ){ return false; }

	var data = JH.GetJsonValue(rs, "data"); //data to generate chart
	var page = ri.createPage(true); //create page
	var subpage = page.find('div.subpage'); //subpage such as second page,third page

	$('.pdf').append(page);

	var p1 = '<p class="text-center text-head">'+ri.createDetailText(start_date, end_date, c)+'</p>';

	subpage.append(p1);

	var div = $('<div class="data-high-chart-class"><div/>'); //element div
	var chartOption = {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
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
				text: TRANS["detail_col_3"]
			}
		},
		series: [],
		xAxis: {
			categories: []
		},
	}
	var seriesData = [];
	var seriesDataExpected = [] , seriesDataCount = [];
	var categoriesData = [];
	var trRow = [];
	subpage.append(div);
	var table = $('#table-reportimport-detail').clone().removeAttr('id').removeClass('d-none');
	for (var i = 0 ; i < data.length ; i++){
		var d = data[i]; //data  to put on table
		var name = JH.GetJsonValue(d, "agency.agency_shortname.en"); //agnecy short name
		var count_expected = JH.GetJsonValue_Float(d, "download_count_expected"); //download count expected
		var value = JH.GetJsonValue_Float(d, "download_count"); //download count

		var td1 = '<td width="10%">'+name+'</td>'; //table data name
		var td2 = '<td width="30%">'+ JH.GetJsonLangValue(d, "agency.agency_name",true)+'</td>'; //table data agency name
		var td3 = '<td width="15%">'+ ri.numberWithCommas(count_expected) +'</td>'; //tab;e data count expected
		var td4 = '<td width="15%">'+ ri.numberWithCommas(value) +'</td>'; //table data value
		var td5 = '<td width="30%">'+ ri.progressBar(JH.GetJsonValue(d, "download_count_percent")) +'</td>'; //table data downlod count percent

		seriesDataExpected.push(count_expected);
		seriesDataCount.push(value);
		categoriesData.push(name);
		trRow.push('<tr>' + td1+td2+td3+td4+td5 + '</tr>');
	}
	seriesData.push({ name: TRANS["detail_col_3"] , data: seriesDataExpected });
	seriesData.push({ name: TRANS["detail_col_4"] , data: seriesDataCount });
	chartOption["series"] = seriesData;
	chartOption["xAxis"]["categories"] = categoriesData;
	div.highcharts(chartOption);

	subpage.append(table);
	for ( var i = 0 ; i < trRow.length ; i ++ ){
		if(i > 10){
			return;
		}
		table.append(trRow[i]);
		if (subpage[0].scrollHeight > subpage.height()){
			table.find('tr:last').remove();
			//page = ri.createPage(true);
			//$('.pdf').append(page);
			//subpage = page.find('div.subpage');
			//table = $('#table-reportimport-detail').clone().removeAttr('id').removeClass('d-none');
			table.append(trRow[i]);
			subpage.append(table);
		}
	}

}


/**
* create progress bar on column
*
* @param {string} v data import proportion
*
* @return string
*/
ri.progressBar = function(v){
	var v = parseFloat(v)
	return '<div class="progress"><div class="progress-bar" role="progressbar" style="width:'+v+'%;" aria-valuenow="'+v+'"'+
	' aria-valuemin="0" aria-valuemax="100">'+v.toFixed(2)+'%</div></div>';
}



/**
* seting format data date
*
* @param {string} date start date
*
* @return string
*/
ri.dateFormat = function(date){
	var d = date.split("-"); //split date

	if ( LANG == "th" ) { d[0] = parseInt( d[0] )+ 543; }
	d[1] = TRANS["long_" + d[1]];
	d.reverse();
	return d.join(" ");
}

/**
* create title on table
*
* @param {string} start_date start date
* @param {string} end_date end date
* @param {string} chart_name chart name
*
* @return string
*/
ri.createDetailText = function(start_date, end_date, chart_name){
	var s_date = start_date.split(" "); //strat date
	var e_date = end_date.split(" "); // end date

	s_date[0] = ri.dateFormat(s_date[0]);
	e_date[0] = ri.dateFormat(e_date[0]);

	var text = ""; //decrition header

	if (chart_name == "chart_data"){
		text = TRANS["detail_head_2_default"].replace('%start_date%' , s_date[0]);
		text = text.replace('%start_time%' , s_date[1]);
		text = text.replace('%end_time%' , e_date[1]);
	}else{
		text = TRANS["detail_head_1"].replace('%time%' , s_date[1] + ' - ' + e_date[1]);
		text = text.replace('%date%' , s_date[0] );
	}
	return text
}



/**
* create table
*/
ri.renderTable = function(){
	var rs = JH.GetJsonValue(ri , "data"); //initial data to put on table

	if ( JH.GetJsonValue(rs , "data.result") != "OK"){ return false; }

	var data = JH.GetJsonValue(rs , "data.data"); //data to put on table
	var isFirstPage = true; //check first page
	ri.table = ri.getTable(); //new table
	ri.page = $('#page-reportimportr-1 > .subpage').append(ri.table); //add table on page

	for (var i = 0 ; i < data.length ; i++){
		var d = data[i]; //data to put on table
		var length = data.length; //length data
		var percent_event = JH.GetJsonValue(d , "percent_event"); //percent event

		if ( percent_event == 0){
			percent_event = "-";
		}else{
			percent_event = percent_event.toFixed(2) + " %";
		}

		var event_type = JH.GetJsonLangValue(d,'description',true); //event type
		ri.tr = $('<tr></tr>'); //element <tr>
		ri.tr.append($("<td width='20%'></td>").text(event_type) ); //add table data event type
		ri.tr.append($("<td width='10%' align='right'></td>").text(percent_event) ); //add table data percent event
		ri.tr.append($("<td class='td-remark' width='60%'></td>").html( ri.renderRemark(d) )); //add table data remark
		// ri.tr += "<td  width='60%'align='right'>"+ri.renderRemark(d)+"</td>";
		ri.table.append(ri.tr); //put table data into table

		if (isFirstPage){
			if ( ri.page[0].scrollHeight > ri.page.height() ){
				//ri.newPage();
				//isFirstPage = false;
			}
		}else{
			if ( ri.page[0].scrollHeight > ri.page.height() ){
				ri.newPage();
			}
		}
	}

	$('tbody tr.header').next('tr').before("<tr><td width='10%'align='center' rowspan='"+(length + 1)+"'>" + $('#input-endtime').val() + " น.</td></tr>");
	ri.pageAddTextAreaMarker();

	var headerText = $('#header-text').html(); //element title page
	var start_date = JH.GetJsonValue(rs , "start_date"); //start date
	var s_date = start_date.split(" "); //split date
	var end_date = JH.GetJsonValue(rs , "end_date"); //end date
	var e_date = end_date.split(" "); //splait end date

	headerText = headerText.replace('%date%' , ri.dateFormat(s_date[0]));
	headerText = headerText.replace('%time%' , e_date[1] );
	headerText = headerText.replace('%time_range%' , s_date[1] + ' - ' + e_date[1] );
	$('#header-text').html(headerText);
}


/**
* create footer table on report import table
*
*/
ri.pageAddTextAreaMarker = function(){
	var ta = ri.textAreaMarker(); //element text area
	ri.page.append(ta);
	// if ( ri.page[0].scrollHeight > ri.page.height() ){
	// 	ri.page.children().last().remove();
	// 	ri.page = ri.createPage(true);
	// 	$('.pdf').append(ri.page);
	// 	ri.page = ri.page.find('.subpage');
	// 	ri.page.append(ta);
	// }
}



/**
* put the data to footer table
*
* @param {json} rs data event code
*
* @return element
*/
ri.textAreaMarker = function(){
	var ta = $('<textarea style="width:100%"></textarea>'); //create text ares
	ta.val( TRANS["remark_default"] );
	return ta;
}



/**
* put the data to column remark
*
* @param {json} rs data event code
*
* @return string
*/
ri.renderRemark = function(rs){
	var td_remark = ''; //prepare data remark
	var event_code = JH.GetJsonValue(rs, "event_code"); //event code

	for(var i=0; i<event_code.length; i++){
		if ( i != 0 ){ td_remark += "<br/>"; }

		var agency_name = ""; //agency name
		var comma; //add commas
		var ag = JH.GetJsonValue(event_code[i],'agency'); //agency

		for(var j=0; j<ag.length; j++){
			if ( j != 0 && comma != true){ agency_name += ", "; comma = false}
			var agency_lang = ag[j]; //agency multi langauges
			if(agency_lang[JH.GetLang()]){
				agency_name += JH.GetJsonValue(ag[j]['agency_shortname'] , JH.GetLang());
			}else if ( JH.GetJsonValue(ag[j]['agency_shortname'] , 'en') ){
				agency_name += JH.GetJsonValue(ag[j]['agency_shortname'] , 'en');
			}else if ( JH.GetJsonValue(ag[j]['agency_shortname'] , 'th')){
				agency_name += JH.GetJsonValue(ag[j]['agency_shortname'] , 'th');
			}else if ( JH.GetJsonValue(ag[j]['agency_shortname'] , 'jp') ){
				agency_name += JH.GetJsonValue(ag[j]['agency_shortname'] , 'jp');
			}else{
				comma = true
			}
		}
		td_remark += TRANS['sub_event'] +': '  + JH.GetJsonLangValue(event_code[i],'description',true)
		+ "<br/>"+TRANS['agency'] +': ' + agency_name;
	}


	return td_remark;
}



/**
* create new page
*
*/
ri.newPage = function(){
	ri.table.find('tr:last').remove();
	ri.page = ri.createPage(true);
	$('.pdf').append(ri.page);
	ri.table = ri.getTable();
	ri.page = ri.page.find('.subpage');
	ri.page.append(ri.table);
	ri.table.append(ri.tr);
}


/**
* clone new page
*
* @param {boolean} page
*
* @return jquery
*/
ri.createPage = function(page){
	if ( arguments.length == 0){
		return $('#page-landscape').clone().removeAttr('id').removeClass('d-none');
	}else{
		return $('#page').clone().removeAttr('id').removeClass('d-none');
	}
}



/**
* clone table
*
*/
ri.getTable = function(){
	return $('#table-reportimport').clone().removeAttr('id').removeClass('d-none');
}


/**
* setting format number with commas
*
* @param {string} nStr number
*
* @return string
*/
ri.numberWithCommas = function(nStr) {
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
