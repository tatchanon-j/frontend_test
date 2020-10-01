/**
 *
 *   dam page for analyst
 *
 *   @author Peerapong Srisom <peerapong@haii.or.th>
 *   @license HAII
 *
 */

var dam = {};

// http://localhost/project/thaiwater/haii.or.th/fronend-thaiwater30/public/backoffice/analyst/dam
/*dam_load
  agency
  dam_data  = data latest rid and egat
  graph_data
  basin
  dam_datatype -> for graph
  dam_large = ชื่อเขือน -> for graph
  dam_medium  = ชื่อเขือน -> for graph
  dam_hour = data lastest egat dam hourly

dam
  damsize = 2  // dam medium
  dam_medium

  damsize = 1  // dam large
  dam_daily
  dam_hour

1 ใช้ ใช้ api dam load
2. เลือกเงื่อนไข ใช้ api dam
*/

dam.init = function(translator) {
  dam.translator = translator; //Text for label and message on java script
  dam.service_url_load = "thaiwater30/analyst/dam_load";
  dam.service_url = "thaiwater30/analyst/dam";
  dam.service_dam_yearly_graph_url = "thaiwater30/analyst/dam_yearly_graph";
  dam.datatable = {};
  dam.Dam_table_rid_daily = $("#rid_daily");
  dam.initMap();
  dam.Dam_AllMarker = {};
  dam.Dam_rid_daily_data = {};
  dam.Dam_egat_daily_data = {};
  dam.Dam_egat_hourly_data = {};

  /* Event on click display button */
  $('#btn_display').on('click', dam.onClickDisplay);

  $('#tab_rid_daily,#tab_egat_daily,#tab_egat_hourly,#tab_egat_load,#tab_rid_load').css('max-height', '660px').css('overflow', 'auto');
  $('.content-medium,.content-all').css('max-height', '700px').css('overflow', 'auto');

  // click open modal-dam chart
  $(document).on('click','a[data-toggle="modal-dam"]' , function(e){
      e.preventDefault();
      $('#modal-dam').find('iframe').attr( 'src', 'iframe/graph/dam?station='+$(this).attr('href') );
      $('#modal-dam').modal();
      return false;
  });

  // click open tabs
  $('a[href="#tab_rid_daily"] ').on('click', function(event) {
    event.preventDefault();
    dam.dam_genMap(dam.Dam_rid_daily_data);
  });
  $('a[href="#tab_egat_daily"] ').on('click', function(event) {
    event.preventDefault();
    dam.dam_genMap(dam.Dam_egat_daily_data);
  });
  $('a[href="#tab_egat_hourly"] ').on('click', function(event) {
    event.preventDefault();
    dam.dam_genMap(dam.Dam_egat_hourly_data);
  });
  $('a[href="#tab_rid_load"] ').on('click', function(event) {
    event.preventDefault();
    dam.dam_genMap(dam.Dam_rid_daily_data);
  });
  $('a[href="#tab_egat_load"] ').on('click', function(event) {
    event.preventDefault();
    dam.dam_genMap(dam.Dam_egat_daily_data);
  });

  $('#filter_basin,#filter_date,.dam_gharp_compare,#btn_display').prop("disabled",true);
  $(document).on('change', 'select[name=filter_dam_size]', function(event) {
    event.preventDefault();
    switch (this.value) {
      case '99': // dam load
        location.reload();
        $('#btn_display').hide();
        break;
      case '1': // dam large
        $(".content-large").show();
        $(".content-load , .content-medium , .content-all").hide();
        $('#filter_basin').prop("disabled",true);
        $('#filter_date').prop("disabled",false);
        $('#btn_display').prop("disabled",false);
        $('.dam_gharp_compare').hide();
        dam.onClickDisplay();
        break;
      case '2': // dam medium
        $(".content-medium").show();
        $(".content-load , .content-large , .content-all").hide();
        $('#filter_basin').prop("disabled",true);
        $('#filter_date').prop("disabled",false);
        $('#btn_display').prop("disabled",false);
        $('.dam_gharp_compare').hide();
        $('#btn_display').show();
        dam.onClickDisplay();
        break;
      default: // dam all
        $(".content-all").show();
        $(".content-load , .content-large , .content-medium").hide();
        $('#filter_basin,#filter_date').prop("disabled",false);
        $('#btn_display').prop("disabled",false);
        $('.dam_gharp_compare').hide();
        $('#btn_display').show();
        dam.onClickDisplay();
        break;
    }
  });

  // call service
  // apiService.SendRequest(methos (GET/PUT/POST),service_url,parameter,function,function return error model custom);
  apiService.SendRequest('GET', dam.service_url_load, null, dam.handleGetServiceDamLoad);

  // 4 dam graph compare
  dam.handleGetServiceDamGraphCompare();
}

/**
 *   get data from service
 *   @param {object} data - json data object from service
 *   @param {String} txtStatus - get status
 */
dam.handleGetServiceDamLoad = function(data, txtStatus) {
  // init data on service load
  var dam_data = dam.getJsonValue(data, "dam_data.data");
  dam.Dam_rid_daily_data  = JsonQuery(dam_data).where({'agency.agency_name.th.$li' : 'กรม'}).exec();
  dam.Dam_egat_daily_data = JsonQuery(dam_data).where({'agency.agency_name.th.$li' : 'การ'}).exec();
  dam.Dam_egat_hourly_data = dam.getJsonValue(data, "dam_hour.data");

  // set dam datatale scale
  JH.Set('scale', data.scale.data.scale);
  // gen table scale map
  srvTHF.SetDam_Scale(data.scale.data);
  dam.Dam_genTableScale();
  // set dam map scale
  srvTHF.SetDam_Scale(data.scale.data);
  // gen map ride daily
  dam.dam_genMap(dam.Dam_rid_daily_data);
  // render table load
  dam.renderTable("rid_load", "กรม", dam.Dam_rid_daily_data);
  dam.renderTable("egat_load", "การ", dam.Dam_egat_daily_data);
  // render table daily
  dam.renderTable("rid_daily", "กรม", dam.Dam_rid_daily_data);
  dam.renderTable("egat_daily", "การ", dam.Dam_egat_daily_data);
  dam.renderHourlyTable(data)

  // set filter
  dam.genSelectBasin(data.basin.data);
  dam.genSelectdamSize();
  dam.setDefaultFilterDate(data.dam_data.data[0].dam_date);
};

/**
 * search button click
 * @method
 * @param  {[type]} data      [get data form service]
 * @param  {[type]} txtStatus [get status]
 *
 */
dam.handleGetServiceDam = function(data, txtStatus) {
  var date = dam.getFilterDate();
  var basin = dam.getFilterBasin();
  var damSize = dam.getFilterDamSize();

  if (damSize == 1) {
    // large dam
    // dam data daily rid and egat
    var dam_data = dam.getJsonValue(data, "data.dam_daily");
    dam.Dam_rid_daily_data  = JsonQuery(dam_data).where({'agency.agency_name.th.$li' : 'กรม'}).exec();
    dam.Dam_egat_daily_data = JsonQuery(dam_data).where({'agency.agency_name.th.$li' : 'การ'}).exec();
    // dam data hourly egat
    dam.Dam_egat_hourly_data = dam.getJsonValue(data, "data.dam_hourly");

    // clear and update datatable
    dam.datatable.rid_daily.clear()
    dam.datatable.egat_daily.clear()
    dam.hourlyDataTable.clear()
    dam.updateDataTable(dam.datatable.rid_daily, dam.Dam_rid_daily_data);
    dam.updateDataTable(dam.datatable.egat_daily, dam.Dam_egat_daily_data);
    dam.updateDataTable(dam.hourlyDataTable, dam.Dam_egat_hourly_data);

    // render map first tab
    dam.dam_genMap(dam.Dam_rid_daily_data);

    $("a[href='#tab_rid_daily']").click();
    $(".content-large").show();
    $(".content-medium").hide();
    $(".content-all").hide();

  } else if (damSize == 2) {

    // medium dam
    var dam_medium_data = dam.getJsonValue(data, "data.dam_medium");
    if (!$.fn.DataTable.isDataTable('#rid_medium_dam')) { // datatable not init
      dam.renderMediumTable(dam_medium_data);
    } else {
      dam.mediumDataTable.clear()
      dam.updateDataTable(dam.mediumDataTable, dam_medium_data);
      dam.dam_genMap(dam_medium_data);
    }

    $(".content-large").hide();
    $(".content-medium").show();
    $(".content-all").hide();

  }else {
    // all dam
    var dam_all_data = dam.getJsonValue(data, "data.dam_daily");
    if (!$.fn.DataTable.isDataTable('#all_dam')) { // datatable not init
      dam.renderAllTable(dam_all_data);
    } else {
      dam.allDataTable.clear()
      dam.updateDataTable(dam.allDataTable, dam_all_data);
    }
    dam.dam_genMap(dam_all_data);

    $(".content-large").hide();
    $(".content-medium").hide();
    $(".content-all").show();
  }
}

/**
 * Setting default date from data
 *
 * @param {text} latest data date text from service
 *
 */
dam.setDefaultFilterDate = function(date) {
  $("#filter_date").datepicker('setDate', date);
};

/**
 *   genarate select basin
 *   @param {object} data - result จาก service
 */
dam.genSelectBasin = function(data) {
  $('#filter_basin').append($('<option>').text("ทั้งหมด").attr('value', ""));
  $.each(data, function(i, value) {
    $('#filter_basin').append($('<option>').text(dam.getJsonValue(value, "basin_name.th")).attr('value', dam.getJsonValue(value, "basin_code")));
  });
};

dam.genSelectdamSize = function() {
  var obj = {
    "0": "ทั้งหมด",
    "1": "เขื่อนขนาดใหญ่",
    "2": "เขื่อนขนาดกลาง",
    "99": "เริ่มต้น",
  };

  $.each(obj, function(key, value) {
    var selected = '';
    if(key==0)key = '';
    if(key==1)selected = 'selected';
    $('#filter_dam_size').append($('<option '+selected+'>').text(value).attr('value', key));
  });

  // default dam size to start
  $('#filter_dam_size').val('99');
};


dam.Gen_GraphLink = function(link , text , title , modal, style){
    return '<a href="'+link+'" title="'+title+'" data-toggle="'+modal+'" style="'+ style +'">'+text+'</a>';
}

dam.renderAmphoe = function(row) {
  ret = dam.getJsonValue(row, "geocode.amphoe_name.th");
  return ret;
};

dam.renderProvince = function(row) {
  ret = dam.getJsonValue(row, "geocode.province_name.th");
  return ret;
};

dam.renderTumbon = function(row) {
  ret = dam.getJsonValue(row, "geocode.tumbon_name.th");
  return ret;
};

dam.renderBasinName = function(row) {
  ret = dam.getJsonValue(row, "basin.basin_name.th");
  return (ret) ? ret : '-';
};

dam.renderDamName = function(row) {
  name = "เขื่อน" + dam.getJsonValue(row, "dam.dam_name.th");
  return dam.Dam_GraphLink(JH.GetJsonValue(row, "dam.id") + "&dam_size=" + dam.getFilterDamSize() + "&tab=1", name,name);
};

dam.renderTime = function(row) {
  date =  dam.getJsonValue(row, "dam_date");
  return moment(date).format('hh:mm:ss')
};

dam.renderStorage = function(row) {
  color = srvTHF.GetValue(JH.Get('scale'), dam.getJsonValue(row, "dam_storage_percent"), "operator", "term", "color")
  ret = srvTHF.NumFormat(dam.getJsonValue(row, "dam_storage")) + "(<span style='color:" + color + "'>" + srvTHF.NumFormat(dam.getJsonValue(row, "dam_storage_percent")) + "</span>)";
  return ret;
};

dam.renderInflow = function(row) {
  ret = srvTHF.NumFormat(dam.getJsonValue(row, "dam_inflow"));
  return ret;
};

dam.renderUseWater = function(row) {
  ret = srvTHF.NumFormat(dam.getJsonValue(row, "dam_uses_water")) + "(" + srvTHF.NumFormat(dam.getJsonValue(row, "dam_uses_water_percent")) + ")";
  return ret;
};

dam.renderUseWaterOnly = function(row) {
  ret = srvTHF.NumFormat(dam.getJsonValue(row, "dam_uses_water"));
  return ret;
};

dam.renderRelease = function(row) {
  ret = srvTHF.NumFormat(dam.getJsonValue(row, "dam_released"));
  return ret;
};

dam.renderAreaName = function(row) {
  row = dam.getJsonValue(row, "geocode.area_name.th");
  return (row=='') ? 'อื่น ๆ' : row;
};

dam.renderAreaCode = function(row) {
  ret = dam.getJsonValue(row, "geocode.area_code");
  return ret;
};

dam.getFilterDate = function() {
  return $('#filter_date').val();
};

dam.getFilterBasin = function() {
  return $('#filter_basin').val();
};

dam.getFilterDamSize = function() {
  return $('#filter_dam_size').val();
};

/**
 *[getJsonValue override global function JH.GetJsonValue]
 * @param  {[type]} source [json data from service]
 * @param  {[type]} key    [key ที่ต้องการตรวจสอบและคืนค่า]
 * @return {[type]}        [description]
 */
dam.getJsonValue = function(source, key) {
  return JH.GetJsonValue(source, key);
}

/**
 * Prepare data to get data form service to dislay.
 *
 */
dam.onClickDisplay = function() {
  var date = dam.getFilterDate();
  var basin = dam.getFilterBasin();
  var damSize = dam.getFilterDamSize();

  // if (!date || !damSize) {
  //   bootbox.alert({
  //     message: dam.translator['msg_err_require_filter'],
  //     buttons: {
  //       ok: {
  //         label: dam.translator['btn_close']
  //       }
  //     }
  //   })
  //   return false
  // }

  param = {
    dam_date: date,
    basin_id: basin,
    dam_size: damSize,
  }

  apiService.SendRequest('GET', dam.service_url, param, dam.handleGetServiceDam);
}

/**
 * [renderTable api service ใส่ข้อมูลเขื่อน 2 หน่วยงานมาใน tag json เดียวกัน
 *   ตัวอย่างการเรียกใ้งาน
 *     dam.renderTable("rid_daily", "กรม", data.dam_data.data);
 * * ]]
 * @param  {[type]} tableId     [table id]
 * @param  {[type]} agency_name [สำหรับ search ข้อมูลมาใส่ ตาราง โดย แยกเป็น กรมชล กับการไฟฟ้าฝ่ายผลิต]
 * @param  {[type]} tableData   [data from api]
 * @return {[type]}             [description]
 */
dam.renderTable = function(tableId, agencyName, tableData) {

  dam.datatable[tableId] = $("#" + tableId).DataTable({
    columns: [
      {
        data: dam.renderAreaName, width: "0", visible: false
      },
      {
        data: dam.renderAreaCode, width: "0", visible: false
      },
       {
      data: dam.renderDamName
    }, {
      data: dam.renderInflow
    }, {
      data: dam.renderStorage,
      type: 'dam'
    }, {
      data: dam.renderUseWater,
      type: 'dam'
    }, {
      data: dam.renderRelease
    }, ],
    drawCallback: function ( settings ) {
        var api = this.api();
        var rows = api.rows( {page:'current'} ).nodes();
        var last = null;
        var columnCount = this.find('thead th').length;

        api.column(0, {page:'current'} ).data().each( function ( group, i ) {
            if ( last !== group ) {
                // group by area_name
                $(rows).eq( i ).before(
                    '<tr class="gr"><th colspan="'+columnCount+'">'+group+'</th></tr>'
                );

                last = group;
            }
        } );

    },
    search: {
      //search: agencyName
    },
    searching: false,
    paging: false,
    bAutoWidth: false,
  });

  dam.tableCustomSort()

  dam.datatable[tableId].clear();
  dam.datatable[tableId].rows.add(tableData);
  dam.datatable[tableId].column(0).visible(false);
  dam.datatable[tableId].draw();
}

/**
 * Push data from service on datable.
 *
 * @param {json} data
 */
dam.updateDataTable = function(dataTable, data) {
  dataTable.rows.add(data);
  dataTable.draw()
}

dam.renderHourlyTable = function(data) {
  dam.hourlyDataTable = $("#egat_hourly").DataTable({
    columns: [
      {
        data: dam.renderAreaName, width: "0", visible: false
      },
      {
        data: dam.renderAreaCode, width: "0", visible: false
      },
      {
        data: dam.renderDamName
      },{
        data: dam.renderTime
      },{
        data: dam.renderInflow
      }, {
        data: dam.renderStorage,
        type: 'dam'
      }, {
        data: dam.renderUseWater,
        type: 'dam'
      }, {
        data: dam.renderRelease
      }
    ],
    drawCallback: function ( settings ) {
        var api = this.api();
        var rows = api.rows( {page:'current'} ).nodes();
        var last = null;
        var columnCount = this.find('thead th').length;

        api.column(0, {page:'current'} ).data().each( function ( group, i ) {
            if ( last !== group ) {
                // group by area_name
                $(rows).eq( i ).before(
                    '<tr class="gr"><th colspan="'+columnCount+'">'+group+'</th></tr>'
                );

                last = group;
            }
        } );

    },
    order: [
      [1, 'asc']
    ],
    searching: false,
    paging: false,
    bAutoWidth: false,
  });

  dam.tableCustomSort()
  dam.hourlyDataTable.clear();
  dam.hourlyDataTable.rows.add(dam.getJsonValue(data, "dam_hour.data"));
  dam.hourlyDataTable.draw();
}

dam.renderMediumTable = function(data) {
  dam.mediumDataTable = $("#rid_medium_dam").DataTable({
    columns: [
    {
      data: dam.renderAreaName, width: "0", visible: false
    },
    {
      data: dam.renderAreaCode, width: "0", visible: false
    },
    {
      data: dam.renderDamName
    }, {
      data: dam.renderAmphoe
    }, {
      data: dam.renderProvince,
    },{
      data: dam.renderInflow
    }, {
      data: dam.renderStorage,
      type: 'dam'
    }, {
      data: dam.renderUseWaterOnly,
      type: 'dam'
    }, {
      data: dam.renderRelease
    } ],
    drawCallback: function ( settings ) {
        var api = this.api();
        var rows = api.rows( {page:'current'} ).nodes();
        var last = null;
        var columnCount = this.find('thead th').length;

        api.column(0, {page:'current'} ).data().each( function ( group, i ) {
            if ( last !== group ) {
                // group by area_name
                $(rows).eq( i ).before(
                    '<tr class="gr"><th colspan="'+columnCount+'">'+group+'</th></tr>'
                );

                last = group;
            }
        } );

    },
    order: [
      [1, 'asc']
    ],
    searching: false,
    paging: false,
    bAutoWidth: false,
    bFilter: false
  });

  dam.tableCustomSort()
  dam.mediumDataTable.clear();
  dam.mediumDataTable.rows.add(dam.getJsonValue(data, "data.dam_medium"));
  // dam.mediumDataTable.rows.add(data);
  dam.mediumDataTable.draw();
}

dam.renderAllTable = function(data) {
  dam.allDataTable = $("#all_dam").DataTable({
    columns: [
    {
      data: dam.renderDamName
    }, {
      data: dam.renderAmphoe
    }, {
      data: dam.renderProvince,
    }, {
      data: dam.renderBasinName,
      type: 'dam'
    }, {
      data: dam.renderRelease
    } ],
    order: [
      [4, 'desc']
    ],

    searching: false,
    paging: false,
    bAutoWidth: false
  });

  dam.tableCustomSort()
  dam.allDataTable.clear();
  dam.allDataTable.rows.add(data);
  // dam.mediumDataTable.rows.add(data);
  dam.allDataTable.draw();
}

/**
 * [tableCustomSort สำหรับ sort column ให้เป็นตัวเลข เช่น column ที่มี ค่า 1,250(29%) ]
 * @return {[type]} [description]
 */
dam.tableCustomSort = function() {
  // custom sort
  jQuery.fn.dataTableExt.oSort['dam-asc'] = function(x, y) {
    x = numeral(x.split(" ")[0]).value();
    y = numeral(y.split(" ")[0]).value();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  };
  jQuery.fn.dataTableExt.oSort['dam-desc'] = function(x, y) {
    x = numeral(x.split(" ")[0]).value();
    y = numeral(y.split(" ")[0]).value();
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
  };
}

/*
* init dam map
*
*/
dam.initMap = function (){
    $('#dam_map').height('700px');
    dam.GEOJSON_THAILAND_STYLE = {fillOpacity: 0,opacity: 0,interactive: false};
    dam.GEOJSON_FOCUS_STYLE = {opacity: 1};
    dam.dam_map = LL.Map('dam_map');
    L.geoJson(LL.GetGeoJsonThailand(), {style: dam.GEOJSON_THAILAND_STYLE, onEachFeature: dam.onEachFeature_Dam } ).addTo(dam.dam_map);
}

/*
*
*/

dam.onEachFeature = function(map, feature, layer){
	if (typeof dam.FEATURE_PROVINCE == "undefined") {
		dam.FEATURE_PROVINCE = {};
	}
	if (typeof dam.FEATURE_PROVINCE[map] == "undefined") {
		dam.FEATURE_PROVINCE[map] = [];
	}
	dam.FEATURE_PROVINCE[map][feature.properties.prov_code] = layer;
	dam.FEATURE_PROVINCE[map][feature.properties.title] = layer;
}

dam.onEachFeature_Dam = function(feature, layer){
	dam.onEachFeature("dam", feature, layer)
}

dam.dam_genMap = function(data){
	if (typeof dam.Dam_AllMarker != "undefined") {
		dam.dam_map.removeLayer(dam.Dam_AllMarker);
	}
	dam.Dam_AllMarker = new L.FeatureGroup();
	if (typeof data != "object" || data == null) {
		return false;
	}

	for (i = 0; i < data.length ; i++){
		var d = data[i];
		var dam_lat = JH.GetJsonValue(d, "dam.dam_lat");
		var dam_long = JH.GetJsonValue(d, "dam.dam_long");
    if (dam_lat == "" && dam_long == ""){
        continue;
    }

		var dsp = JH.GetJsonValue(d , "dam_storage_percent");
    var color = srvTHF.Dam_GetColorname(dsp);

    m = srvTHF.Dam_Marker([dam_lat , dam_long] , d , color);
		m.bindPopup(dam.Dam_PopupText(d)).bindTooltip(dam.Dam_TooltipText(d));
		m.on('popupopen', function(e){ this.unbindTooltip(); });
		m.on('popupclose', function(e){ this.bindTooltip( dam.Dam_TooltipText(this.options.properties) ); });
		dam.Dam_AllMarker.addLayer(m);
	}
	dam.Dam_AllMarker.addTo(dam.dam_map);
}

dam.Dam_genTableScale = function(){
    var table = $('#dam_table_scale');
    var scale = srvTHF.GetDam_Scale();
    table.empty();
    text = "<td>"+dam.translator["dam_scale_text"]+"</td>";
    for (var i = scale.length - 1 ; i >= 0 ; i--){
        var s = scale[i];
        var color = JH.GetJsonValue(s, "color");
        var t = JH.GetJsonValue(s, "text");
        text += '<td bgcolor="'+color+'">'+t+'</td>';
    }
    table.append(text);
}

/**
*   gen popup text in map on click
*   @param {object} d - object
*   @return {string} popup text
*/
dam.Dam_PopupText = function(d){
	text = dam.Dam_TooltipText(d);
  text += dam.Dam_GraphLink(JH.GetJsonValue(d, "dam.id") + "&dam_size=" + dam.getFilterDamSize() + "&tab=1",'<i class="fa fa-bar-chart" aria-hidden="true"></i>', '');

	return text
}

/**
*   gen tooltip text in map on hover
*   @param {object} d - object
*   @return {string} tooltip text
*/
dam.Dam_TooltipText = function(d){
    text = dam.translator['dam'] + ' : ' + dam.Dam_render_name(d) + '<br/>';
    text += dam.translator['loca'] + ' : ' + dam.Dam_render_loca(d) + '<br/>';
    text += dam.translator['dam_inflow'] + ' : ' + dam.Dam_render_inflow(d) + '<br/>';
    text += dam.translator['dam_storage'] + ' : ' + dam.Dam_render_storage(d) + '<br/>';
    text += dam.translator['dam_uses_water'] + ' : ' + dam.Dam_render_uses_water(d) + '<br/>';
    text += dam.translator['dam_released'] + ' : ' + dam.Dam_render_release(d) + '<br/>';
    return text;
}

dam.Dam_GraphLink = function(link , text, title){
    return dam.Gen_GraphLink(link , text , title , "modal-dam");
}

/**
*   render dam name
*   @param {object} row - object
*   @return {string} dam name
*/
dam.Dam_render_name = function(row){
    var id = JH.GetJsonValue(row["dam"] , "id");
    var text = dam.translator["dam"] + JH.GetJsonLangValue(row["dam"] , "dam_name", true).replace("*","");
    return dam.Dam_GraphLink(id , text);
}

/**
*   render location
*   @param {object} row - object
*   @return {string} location
*/
dam.Dam_render_loca = function(row){
    var text = dam.translator["short_tumbon"] + dam.Dam_render_tumbon_name(row) + dam.translator["short_amphoe"] + dam.Dam_render_amphoe_name(row) + dam.translator["short_province"] + dam.Dam_render_province_name(row);
    return text;
}

/**
*   render province name
*   @param {object} row - object
*   @return {string} province name
*/
dam.Dam_render_province_name = function(row){
  return JH.GetJsonLangValue(row["geocode"] , "province_name");
}

/**
*   render province name
*   @param {object} row - object
*   @return {string} province name
*/
dam.Dam_render_tumbon_name = function(row){
  return JH.GetJsonLangValue(row["geocode"] , "tumbon_name");
}

/**
*   render amphoe name
*   @param {object} row - object
*   @return {string} amphoe name
*/
dam.Dam_render_amphoe_name = function(row){
  return JH.GetJsonLangValue(row["geocode"] , "amphoe_name");
}

/**
*   render dam inflow
*   @param {object} row - object
*   @return {string} dam inflow
*/
dam.Dam_render_inflow = function(row){
    return srvTHF.NumFormat( JH.GetJsonValue(row,"dam_inflow") );
}

/**
*   render dam storage
*   @param {object} row - object
*   @return {string} dam storage (dam storage percent %)
*/
dam.Dam_render_storage = function(row){
    var dam_storage = JH.GetJsonValue(row, "dam_storage");
    dam_storage = numeral( Math.round(dam_storage) ).format('0,0');
    var dam_storage_percent = JH.GetJsonValue(row, "dam_storage_percent");
    dam_storage_percent = Math.round(dam_storage_percent);
    return dam_storage+
    ' (<font color="'+srvTHF.Dam_GetColor(dam_storage_percent)+'">'+dam_storage_percent+'%</font>)';
}

/**
*   render dam uses water
*   @param {object} row - object
*   @return {string} dam uses water (dam uses water percent%)
*/
dam.Dam_render_uses_water = function(row){
    var dam_uses_water_percent = JH.GetJsonValue(row, "dam_uses_water_percent");
    dam_uses_water_percent = Math.round(dam_uses_water_percent);
    return srvTHF.NumFormat(JH.GetJsonValue(row, "dam_uses_water"))+' ('+dam_uses_water_percent+'%)';
}

/**
*   render dam released
*   @param {object} row - object
*   @return {string} dam released
*/
dam.Dam_render_release = function(row){
    return srvTHF.NumFormat(JH.GetJsonValue(row, "dam_released"));
}

/**
*   handler series data
*   @param {object} rs - result from service
*/
dam.handlerSeriesData = function(rs) {

    var seriesData = [];
    var loop = 0;

    $.each(rs, function(data, items) {

        var newData = [];
        var limit = 0;

        $.each(items.data, function(data,item) {
            var year = '2017';
            var month = moment(item.date,"YYYY-MM-DD").add(0, 'month').format('MM')
            var day = moment(item.date,"YYYY-MM-DD").add(0, 'day').format('DD');
            item.date = year+'-'+month+'-'+day;

            mm = moment.utc( item.date );
            if ( mm.format('mm') != '00' ){ return; }
            var datetime = parseInt( mm.format('x') );

            newData.push([datetime,item.value]);
             // if(limit===10){
             //   return false;
             // }
            limit++;
        });
        var newSeriesData = {
            name: ''+items.year+'',
            data: newData,
            type:'line'
        };

        seriesData.push(newSeriesData);
        loop++;
    });
    return seriesData;
};

/**
 * load dam graph compare {bhumibol,sirikit,pasak,kwaihoi}
 * @method
 * @return    [load graph service]
 */
dam.handleGetServiceDamGraphCompare = function(){
  var dam_list = {1:'dam_bhumibol',12:'dam_sirikit',11:'dam_pasak',36:'dam_kwaihoi'};
  $.each(dam_list,function(dam_id, dam_name) {
      dam.Dam_graph_compare_load(dam_id,'dam_storage',dam_name+'_storage');
      dam.Dam_graph_compare_load(dam_id,'dam_inflow',dam_name+'_inflow');
      dam.Dam_graph_compare_load(dam_id,'dam_released',dam_name+'_released');
  });
}

/**
 * request dam graph compare service
 * @method
 * @param  {[string]} dam_id    [id]
 * @param  {[string]} data_type [dam_storage,dam_inflow,dam_released]
 * @param  {[string]} dam_name  [bhumibol,sirikit,pasak,kwaihoi]
 * @return {[object]}           [object]
 */
dam.Dam_graph_compare_load = function (dam_id,data_type,dam_name){
  var year = moment(new Date(),"YYYY-MM-DD").add(0, 'year').format('Y');
  var year_1 = moment(new Date(),"YYYY-MM-DD").add(-1, 'year').format('Y');
  var year_2 = moment(new Date(),"YYYY-MM-DD").add(-2, 'year').format('Y');
  var new_year = year+','+year_1+','+year_2;

  var param = {
    dam_id:dam_id,
    year:new_year,
    month:'01',
    day:'01',
    data_type:data_type,
  }
  apiService.SendRequest('GET', dam.service_dam_yearly_graph_url, param,function(data){
      dam.Dam_graph_compare_render(data,data_type,dam_name);
  });
}

/**
 * datatype text tile
 * @method
 * @param  {[type]} data_type [dam_storage,dam_inflow,dam_released]
 * @return {[string]}         [data type name]
 */
dam.Dam_graph_compare_title = function (data_type){
  var title = {
    'dam_storage':'ปริมาตรน้ำในอ่าง',
    'dam_inflow':'ปริมาตรน้ำไหลลงอ่าง',
    'dam_released':'ปริมาตรน้ำระบาย'
  }
  return title[data_type];
}

/**
 * Graph comparr render
 * @method
 * @param  {[object]} data      [dam object]
 * @param  {[string]} data_type [dam_storage,dam_inflow,dam_released]
 * @param  {[type]} dam_name    [dam name and class div name]
 * @return                      [render graph]
 */
dam.Dam_graph_compare_render = function (data,data_type,dam_name){
  var series = dam.getJsonValue(data, "data.graph_data");
  var seriesData = dam.handlerSeriesData(series);
  var damChart_option = {
      chart: {
         zoomType: false
      },
      xAxis: {
          categories : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          //tickInterval: 30 * 24 * 3600 * 1000, // 1 month
          type: 'datetime',
          title: { text: 'วันที่' },
          labels: {
              formatter: function() {
                  return moment(new Date(this.value)).format('DD MMM');
              },
          }
      },
      yAxis: {
          title: {
              text: 'ล้าน ลบม./วัน'
          }
      },
      tooltip: {
            xDateFormat: '%m %b',
            shared: true
        },
      series: seriesData
  };
  damChart_option['title'] = { text: dam.Dam_graph_compare_title(data_type) };
  Highcharts.chart(dam_name, damChart_option);
}
