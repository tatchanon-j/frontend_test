/**
 *
 *   srvTHF Object for index, main page
 *
 *   @author CIM Systems (Thailand) <cim@cim.co.th>
 *   @license HAII
 *
 */
var srvTHF = {
  cache: {}
};

/**
 *   set value into cache
 *   @param {mix} key - cache name
 *   @param {mix} value - ค่าที่ต้องการเก็บ
 */
srvTHF.Set = function(key, value) {
  srvTHF["cache"][key] = value;
}

/**
 *   get value from cache
 *   @param {mix} key - cache name
 *   @return {mix} value from cache
 */
srvTHF.Get = function(key) {
  return JH.GetJsonValue(srvTHF, "cache." + key);
}
srvTHF.SetLang = function(lang) {
  srvTHF.Set("lang", lang);
}

/**
 *  แปลงตัวเลขให้อยู่ในรุปแบบ x,x.xx
 *  @param {string} number - ตัวเลขที่ต้องการแปลง
 *  @return {string} ตัวเลขที่แปลงเสร็จแล้ว
 */
srvTHF.NumFormat = function(number) {
  if (typeof numeral != "function") {
    return "";
  }
  if (number === "") {
    return "";
  }
  return numeral(number).format('0,0.00')
}

/**
 *  แปลงปี ให้เป็น พ.ศ.(+543) ถ้าเป็นภาษาไทย
 *  @param {string} datetime - วันที่ต้องการแปลง
 *  @return {string} วันที่ที่แปลงเสร็จแล้ว
 */
srvTHF.DateFormat = function(datetime) {
  return JH.DateFormat(datetime, "YYYY-MM-DD");
}

/**
 *  เปรียบเทียบค่าจาก object ถ้าใช่ให้คืนค่า object[data]
 *  @param {object} source - object , array(object)
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @param {string} oper - operator ที่อยู่ใน source
 *  @param {string} term - term ที่อยู่ใน source
 *  @param {string} data - data ที่อยู่ใน source
 *  @return {} object[data]
 */
srvTHF.GetValue = function(source, value, oper, term, data) {
  for (var i = 0; i < source.length; i++) {
    var s = source[i];
    switch (s[oper]) {
      case "between":
        if (value >= s["term"] && value <= s["term_2"]) {
          return JH.GetJsonValue(s, data);
        }
        break;
      default:
        if (eval(value + s[oper] + s[term])) {
          return JH.GetJsonValue(s, data);
        }
    }

  }
  return "";
}

/**
 *  สร้าง marker
 *  @param {array} latlng
 *  @param {object} option
 *  @param {string} iconClass - class ที่ต้องการ
 *  @return {L.marker} marker
 */
srvTHF.GenMarker = function(latlng, option, iconClass) {
  if (typeof L != "object") {
    return null;
  }
  var icon = L.divIcon({
    className: iconClass,
    iconSize: L.point(15, 15)
  });
  // var icon = L.divIcon({className: iconClass, iconSize: L.point(32, 32)});
  return L.marker(latlng, {
    icon: icon,
    "properties": option
  });
}

// rain
/**
 *  ตั้งค่า rain
 *  @param {object} o -
 */
srvTHF.SetRain_Setting = function(o) {
  srvTHF.Set("Rain_scale", JH.GetJsonValue(o, "scale"));
  srvTHF.Set("Rain_level_color", JH.GetJsonValue(o, "level_color"));
  srvTHF.Set("Rain_rule", JH.GetJsonValue(o, "rule"));
}

/**
 *  render rain scale table in modal
 */
srvTHF.renderModalRainTable = function() {
  var s = srvTHF.GetRain_Level_Color();
  var table = $('#modal-rain-table').find('tbody');
  for (var i in s) {
    var sc = s[i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    table.append(tr);
  }
}

/**
 *  คืนค่า rain sacle จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetRain_Sacle = function() {
  return srvTHF.Get("Rain_scale");
}

/**
 *  คืนค่า rain level color จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetRain_Level_Color = function() {
  return srvTHF.Get("Rain_level_color");
}

/**
 *  คืนค่า rain rule จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetRain_Rule = function() {
  return srvTHF.Get("Rain_rule");
}

/**
 *  คืน สี ของเงื่อนไข rain sacle ที่ value ถูกเงื่อนไขที่ตั้งไว้
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} ค่า color ใน rain sacle ที่ถูกเงื่อนไข
 */
srvTHF.Rain_GetColor = function(value) {
  return srvTHF.GetValue(srvTHF.GetRain_Sacle(), value, "operator", "term",
    "color");
}

/**
 *  คืน ชื่อสี ของเงื่อนไข rain sacle ที่ value ถูกเงื่อนไขที่ตั้งไว้
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} ค่า colorname ใน rain sacle ที่ถูกเงื่อนไข
 */
srvTHF.Rain_GetColorname = function(value) {
  return srvTHF.GetValue(srvTHF.GetRain_Sacle(), value, "operator", "term",
    "colorname");
}

/**
 *  คืน ระดับ ของเงื่อนไข rain rule ที่ value ถูกเงื่อนไขที่ตั้งไว้
 *  @param {int} zone -
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @param {string} riantype - ค่าของเงื่อนไขที่ต้องการเปรียบเทียบ
 *  @return {string} ค่า level ใน rain rule ที่ถูกเงื่อนไข
 */
srvTHF.Rain_GetRuleLevel = function(zone, value, riantype) {
  return srvTHF.GetValue(JH.GetJsonValue(srvTHF.GetRain_Rule(), zone), value,
    "operator", riantype, "level");
}

/**
 *  คืน สี ของ rain level color ตาม level ที่ใส่มา
 *  @param {int} level -
 *  @return {string} ค่า color ใน rain level color ที่ถูกเงื่อนไข
 */
srvTHF.Rain_GetLevelColor = function(level) {
  return JH.GetJsonValue(srvTHF.GetRain_Level_Color(), level);
}

/**
 *  สร้าง rain marker
 *  @param {array} latlng - array lat long
 *  @param {object} option - option เพิ่มเติม
 *  @param {string} color - สีของ marker
 *  @return {L.marker} marker
 */
srvTHF.Rain_Marker = function(latlng, option, color) {
  return srvTHF.GenMarker(latlng, option,
    'user-marker user-marker-rain user-marker-rain-' + color);
}

// waterlevel
/**
 *  ตั้งค่า waterlevel
 *  @param {object} o -
 */
srvTHF.SetWaterLevel_Setting = function(o) {
  srvTHF.Set("WaterLevel_scale", JH.GetJsonValue(o, "scale"));
  srvTHF.Set("WaterLevel_rule", JH.GetJsonValue(o, "rule"));
  srvTHF.Set("WaterLevel_level", JH.GetJsonValue(o, "level"));
  srvTHF.Set("WaterLevel_no_storage", JH.GetJsonValue(o, "no_storage"));
  srvTHF.Set("WaterLevel_not_today", JH.GetJsonValue(o, "not_today"));
}

srvTHF.SetCCTV_Setting = function(o) {
  srvTHF.Set("cctv_scale", JH.GetJsonValue(o, "media_type"));
  var t = JH.GetJsonValue(o, "media_type");

}

/**
 *  render waterlevel scale table in modal
 */
srvTHF.renderModalWaterlevelTable = function() {
  var s = srvTHF.GetWaterLevel_Level();
  var table = $('#modal-waterlevel-table').find('tbody');
  for (var i in s) {
    var sc = s[i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    table.append(tr);
  }
}

/**
 *  คืนค่า waterlevel sacle จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetWaterLevel_Scale = function() {
  return srvTHF.Get("WaterLevel_scale");
}

/**
 *  คืนค่า waterlevel rule จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetWaterLevel_Rule = function() {
  return srvTHF.Get("WaterLevel_rule");
}

/**
 *  คืนค่า waterlevel level จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetWaterLevel_Level = function() {
  return srvTHF.Get("WaterLevel_level");
}

/**
 *  คืนค่า waterlevel no storage จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetWaterLevel_NoStorage = function() {
  return srvTHF.Get("WaterLevel_no_storage");
}

/**
 *  คืนค่า waterlevel not today จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
srvTHF.GetWaterLevel_NotToday = function() {
  return srvTHF.Get("WaterLevel_not_today");
}

/**
 *  คืน สี ของเงื่อนไข waterlevel sacle ที่ value ถูกเงื่อนไขที่ตั้งไว้
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} ค่า color ใน waterlevel sacle ที่ถูกเงื่อนไข
 */
srvTHF.WaterLevel_GetColor = function(value) {
  if (value === "") {
    return "";
  }
  return srvTHF.GetValue(srvTHF.GetWaterLevel_Scale(), value, "operator",
    "term", "color");
}

/**
 *  คืน ชื่อสี ของเงื่อนไข waterlevel sacle ที่ value ถูกเงื่อนไขที่ตั้งไว้
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} ค่า colorname ใน waterlevel sacle ที่ถูกเงื่อนไข
 */
srvTHF.WaterLevel_GetColorName = function(value) {

  if (value === "") {
    return "";
  }
  return srvTHF.GetValue(srvTHF.GetWaterLevel_Scale(), value, "operator",
    "term", "colorname");
}
srvTHF.CCTV_GetColorName = function(value) {
  if (value == "img") {
    return "img";
  } else if (value == "vdo") {
    return "vdo";
  }
}

/**
 *  คืน ระดับ ของเงื่อนไข waterlevel sacle ที่ value ถูกเงื่อนไขที่ตั้งไว้
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} ค่า level ใน waterlevel sacle ที่ถูกเงื่อนไข
 */
srvTHF.WaterLevel_GetRulelevel = function(value) {
  if (value === "") {
    return "";
  }
  return srvTHF.GetValue(srvTHF.GetWaterLevel_Rule(), value, "operator",
    "term", "level");
}

/**
 *  คืน สี ของระดับใน waterlevel level
 *  @param {number} value - ระดับ
 *  @return {string} ค่า color ใน waterlevel level
 */
srvTHF.WaterLevel_GetlevelColor = function(value) {
  if (value === "") {
    return "";
  }
  return JH.GetJsonValue(srvTHF.GetWaterLevel_Level(), value + ".color");
}

/**
 *  คืน ชื่อสี ของระดับใน waterlevel level
 *  @param {number} value - ระดับ
 *  @return {string} ค่า name ใน waterlevel level
 */
srvTHF.WaterLevel_GetlevelColorName = function(value) {
  if (value === "") {
    return "";
  }
  return JH.GetJsonValue(srvTHF.GetWaterLevel_Level(), value + ".colorname");
}

/**
 *  คืน สถานะการณ์
 *  @param {number} value - ระดับ
 *  @return {string}
 */
srvTHF.WaterLevel_GetSituation = function(value, trans) {
  if (value === "") {
    return "";
  }
  return "<font color='" + srvTHF.WaterLevel_GetColor(value) + "'>" +
    JH.GetJsonValue(trans, srvTHF.GetValue(srvTHF.GetWaterLevel_Scale(),
      value, "operator", "term", "trans")) + "</font>";
}

/**
 *  สร้าง waterlevel marker
 *  @param {array} latlng -
 *  @param {object} option -
 *  @param {string} color - สีของ marker
 *  @return {L.marker}
 */
srvTHF.WaterLevel_Marker = function(latlng, option, color) {

  return srvTHF.GenMarker(latlng, option,
    'user-marker user-marker-waterlevel user-marker-waterlevel-' + color);
}

srvTHF.CCTV_Marker = function(latlng, option, color) {

  return srvTHF.GenMarker(latlng, option,
  'user-marker user-marker-cctv user-marker-cctv-' + color);
}

// dam
/**
 *  ตั้งค่า dam sacle
 *  @param {object} scale -
 */
srvTHF.SetDam_Scale = function(scale) {
  srvTHF.Set("Dam_scale", scale["scale"]);
  srvTHF.Set("Dam_Low", scale["low"]);
  srvTHF.Set("Dam_High", scale["high"]);
  srvTHF.Set("Dam_Low_Text", scale["low_text"]);
  srvTHF.Set("Dam_High_Text", scale["high_text"]);
}

/**
 *  render dam scale table in modal
 */
srvTHF.renderModalDamTable = function() {
  var table = $('#modal-dam-table').find('tbody');
  // low
  var low = srvTHF.GetDam_Setting_Low();
  var tr = document.createElement('tr');
  var td1 = document.createElement('td');
  var td2 = document.createElement('td');

  td1.bgColor = JH.GetJsonValue(low, "color");
  td2.innerText = TRANSLATOR[JH.GetJsonValue(low, "trans")];

  tr.appendChild(td1);
  tr.appendChild(td2);
  table.append(tr);
  // high
  var high = srvTHF.GetDam_Setting_High();
  var tr = document.createElement('tr');
  var td1 = document.createElement('td');
  var td2 = document.createElement('td');

  td1.bgColor = JH.GetJsonValue(high, "color");
  td2.innerText = TRANSLATOR[JH.GetJsonValue(high, "trans")];

  tr.appendChild(td1);
  tr.appendChild(td2);
  table.append(tr);

}

/**
 *  คืนค่า dam sacle
 *  @return {object}
 */
srvTHF.GetDam_Scale = function() {
  return srvTHF.Get("Dam_scale");
}

/**
 *  คืนค่า dam setting low text
 *  @return {string}
 */
srvTHF.GetDam_Setting_Low = function() {
  return srvTHF.Get("Dam_Low");
}

/**
 *  คืนค่า dam setting high text
 *  @return {string}
 */
srvTHF.GetDam_Setting_High = function() {
  return srvTHF.Get("Dam_High");
}

/**
 *  คืนค่า dam setting low text
 *  @return {string}
 */
srvTHF.GetDam_Setting_LowText = function() {
  return srvTHF.Get("Dam_Low_Text");
}

/**
 *  คืนค่า dam setting high text
 *  @return {string}
 */
srvTHF.GetDam_Setting_HighText = function() {
  return srvTHF.Get("Dam_High_Text");
}

/**
 *  คืนค่า สี ของ dam scale ที่ถูกตามเงื่อนไข
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} color ของค่า ที่ถูกตามเงื่อนไข
 */
srvTHF.Dam_GetColor = function(value) {
  return srvTHF.GetValue(srvTHF.GetDam_Scale(), value, "operator", "term",
    "color");
}

/**
 *  คืนค่า ชื่อสี ของ dam scale ที่ถูกตามเงื่อนไข
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} colorname ของค่า ที่ถูกตามเงื่อนไข
 */
srvTHF.Dam_GetColorname = function(value) {
  return srvTHF.GetValue(srvTHF.GetDam_Scale(), value, "operator", "term",
    "colorname");
}

/**
 *  sort data แยกตาม water_store กับ water_percent
 *  แยก text สำหรับหน้า main เขื่อนน้ำน้อยวิกฤต(%ใช้การฯ) : เขื่อนน้ำมากวิกฤต(%รนก.)
 *  @param {array} data - array object ที่ต้องการ sort
 */
srvTHF.Dam_SortData = function(data) {
  srvTHF.Dam_Low = [];
  srvTHF.Dam_High = [];
  srvTHF.Dam_text = {};
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var water_percent = JH.GetJsonValue(d, "dam_uses_water_percent");
    water_percent = numeral(Math.round(water_percent)).format('0,0');
    var water_store = JH.GetJsonValue(d, "dam_storage_percent");
    water_store = numeral(Math.round(water_store)).format('0,0');
    if (water_store > 80) {
      srvTHF.Dam_High.push(d);
    } else if (water_percent <= 20) {
      srvTHF.Dam_Low.push(d);
    }
  }
  srvTHF.Dam_Low.sort(function(a, b) {
    return a["dam_uses_water_percent"] - b["dam_uses_water_percent"];
  });
  srvTHF.Dam_High.sort(function(a, b) {
    return b["dam_storage_percent"] - a["dam_storage_percent"];
  });
}

/**
 *  คืนค่า ชื่อสถานี ทั้งหมดที่ water_percent <= 20
 *  @return {string}
 */
srvTHF.GetDam_Low_Text = function() {
  return srvTHF.GetDam_Text(srvTHF.Dam_Low, 'low');
}

/**
 *  คืนค่า ชื่อสถานี ทั้งหมดที่ water_store > 80
 *  @return {string}
 */
srvTHF.GetDam_High_Text = function() {
  return srvTHF.GetDam_Text(srvTHF.Dam_High, 'high');
}

/**
 *  คืนค่า ชื่อสถานี ทั้งหมดที่ จาก source ที่ใส่มา
 *  @param {object} source - srvTHF.Dam_Low , srvTHF.Dam_High
 *  @param {string} type - lom,high
 *  @return {string} ชื่อสถานี ทั้งหมด
 */
srvTHF.GetDam_Text = function(source, type) {
  if (JH.GetJsonValue(srvTHF.Dam_text, type)) {
    return JH.GetJsonValue(srvTHF.Dam_text, type);
  }
  srvTHF.Dam_text[type] = "";
  var text = "";
  for (var i = 0; i < source.length; i++) {
    if (i != 0) {
      text += ",";
    }
    var d = source[i];
    text += " <label>" + srvTHF.Get("dam") + JH.GetJsonLangValue(d["dam"],
      "dam_name").replace("*", "") + " (";
    var v = "";
    if (type == "high") {
      v = JH.GetJsonValue(d, "dam_storage_percent");
    } else {
      v = JH.GetJsonValue(d, "dam_uses_water_percent");
    }
    v = numeral(Math.round(v)).format('0,0');
    text += v + "%)</label>";
  }
  srvTHF.Dam_text[type] = text;
  return text;
}

/**
 *  สร้าง dam marker
 *  @param {array} latlng -
 *  @param {object} option -
 *  @param {string} color - สีของ marker
 *  @return {L.marker}
 */
srvTHF.Dam_Marker = function(latlng, option, color) {
  return srvTHF.GenMarker(latlng, option,
    'user-marker user-marker-dam user-marker-dam-' + color);
}

// water quality
/**
 *  ตั้งค่า waterquality
 *  @param {object} setting -
 */
srvTHF.SetWaterQuality_Setting = function(setting) {
  srvTHF.Set("WaterQuality_Scale", JH.GetJsonValue(setting, "scale"));
  srvTHF.Set("WaterQuality_Display", JH.GetJsonValue(setting, "display"));
  srvTHF.Set("WaterQuality_Default", JH.GetJsonValue(setting, "default"));
  srvTHF.Set("WaterQuality_not_today", JH.GetJsonValue(setting, "not_today"));
}

/**
 *  render waterquality scale table in modal
 */
srvTHF.renderModalWaterqualityTable = function() {
  var scale = srvTHF.GetWaterQuality_Scale();
  // salinity
  var tbSa = $('#modal-waterquality-salinity-table').find('tbody');
  for (var i = 0; i < scale["salinity"].length; i++) {
    var sc = scale["salinity"][i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = TRANSLATOR["salinity_value_" + sc["operator"]].replace(
      "%s", sc["term"]);
    td3.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbSa.append(tr);
  }
  // do
  var tbDo = $('#modal-waterquality-do-table').find('tbody');
  for (var i = 0; i < scale["do"].length; i++) {
    var sc = scale["do"][i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = TRANSLATOR["salinity_value_" + sc["operator"]].replace(
      "%s", sc["term"]);
    td3.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbDo.append(tr);
  }
  // ph
  var tbPh = $('#modal-waterquality-ph-table').find('tbody');
  for (var i = 0; i < scale["ph"].length; i++) {
    var sc = scale["ph"][i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = JH.GetJsonValue(sc, "text");
    td3.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbPh.append(tr);
  }
  // turbid
  var tbTurbid = $('#modal-waterquality-turbid-table').find('tbody');
  for (var i = 0; i < scale["turbid"].length; i++) {
    var sc = scale["turbid"][i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = JH.GetJsonValue(sc, "text");
    td3.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbTurbid.append(tr);
  }
  // tds
  var tbTds = $('#modal-waterquality-tds-table').find('tbody');
  for (var i = 0; i < scale["tds"].length; i++) {
    var sc = scale["tds"][i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = JH.GetJsonValue(sc, "operator") + JH.GetJsonValue(sc,
      "term");
    td3.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tbTds.append(tr);
  }
}

/**
 *  คืนค่า waterquality scale
 *  @return {object}
 */
srvTHF.GetWaterQuality_Scale = function() {
  return srvTHF.Get("WaterQuality_Scale");
}

/**
 *  คืนค่า waterquality display
 *  @return {object}
 */
srvTHF.GetWaterQuality_Display = function() {
  return srvTHF.Get("WaterQuality_Display");
}

/**
 *  คืนค่า waterquality default
 *  @return {object}
 */
srvTHF.GetWaterQuality_Default = function() {
  return srvTHF.Get("WaterQuality_Default");
}

/**
 *  คืนค่า waterquality not today
 *  @return {object}
 */
srvTHF.GetWaterQuality_not_today = function() {
  return srvTHF.Get("WaterQuality_not_today");
}

/**
 *  คืนค่า สี โดยเทียบกับตัวเปรียบเทียบ
 *  @param {object} d - oject waterquality
 *  @return {string} สี
 */
srvTHF.WaterQuality_GetMarkerColor = function(d) {
  var salinity = "",
    ph = "",
    turbid = "",
    tds = "",
    _do = "";
  var isSalinity = true,
    isPh = true,
    isTurbid = true,
    isTds = true,
    isDo = true;
  var defaultColor = srvTHF.GetWaterQuality_Default().color;
  if (JH.GetJsonValue(d, "waterquality_salinity") !== "") {
    salinity = srvTHF.WaterQuality_GetColor_salinity(JH.GetJsonValue_Float(d,
      "waterquality_salinity"));
    isSalinity = salinity == defaultColor ? true : false;
  }
  if (JH.GetJsonValue(d, "waterquality_ph") !== "") {
    ph = srvTHF.WaterQuality_GetColor_ph(JH.GetJsonValue_Float(d,
      "waterquality_ph"));
    isPh = ph == defaultColor ? true : false;
  }
  if (JH.GetJsonValue(d, "waterquality_turbid") !== "") {
    turbid = srvTHF.WaterQuality_GetColor_turbid(JH.GetJsonValue_Float(d,
      "waterquality_turbid"));
    isTurbid = turbid == defaultColor ? true : false;
  }
  if (JH.GetJsonValue(d, "waterquality_tds") !== "") {
    tds = srvTHF.WaterQuality_GetColor_tds(JH.GetJsonValue_Float(d,
      "waterquality_tds"));
    isTds = tds == defaultColor ? true : false;
  }
  if (JH.GetJsonValue(d, "waterquality_do") !== "") {
    _do = srvTHF.WaterQuality_GetColor_do(JH.GetJsonValue_Float(d,
      "waterquality_do"));
    isDo = _do == defaultColor ? true : false;
  }
  if (isSalinity && isPh && isTurbid && isTds && isDo) {
      return defaultColor;
  }
  return "red";
}

/**
 *  คืนค่า สี ของ waterquality scale
 *  @param {object} scale -
 *  @param {number} value -
 *  @return {string} สี
 */
srvTHF.WaterQuality_GetColor = function(scale, value) {
  color = srvTHF.GetValue(scale, value, "operator", "term", "color");
  if (color == "") {
    color = srvTHF.GetWaterQuality_Default().color;
  }
  return color;
}

/**
 *  คืนค่า สี ของ waterquality scale salinity
 *  @param {number} value -
 *  @return {string} สี
 */
srvTHF.WaterQuality_GetColor_salinity = function(value) {
  return srvTHF.WaterQuality_GetColor(JH.GetJsonValue(srvTHF.GetWaterQuality_Scale(),
    "salinity"), value);
}

/**
 *  คืนค่า สี ของ waterquality scale do
 *  @param {number} value -
 *  @return {string} สี
 */
srvTHF.WaterQuality_GetColor_do = function(value) {
  return srvTHF.WaterQuality_GetColor(JH.GetJsonValue(srvTHF.GetWaterQuality_Scale(),
    "do"), value);
}

/**
 *  คืนค่า สี ของ waterquality scale ph
 *  @param {number} value -
 *  @return {string} สี
 */
srvTHF.WaterQuality_GetColor_ph = function(value) {
  return srvTHF.WaterQuality_GetColor(JH.GetJsonValue(srvTHF.GetWaterQuality_Scale(),
    "ph"), value);
}

/**
 *  คืนค่า สี ของ waterquality scale turbid
 *  @param {number} value -
 *  @return {string} สี
 */
srvTHF.WaterQuality_GetColor_turbid = function(value) {
  return srvTHF.WaterQuality_GetColor(JH.GetJsonValue(srvTHF.GetWaterQuality_Scale(),
    "turbid"), value);
}

/**
 *  คืนค่า สี ของ waterquality scale tds
 *  @param {number} value -
 *  @return {string} สี
 */
srvTHF.WaterQuality_GetColor_tds = function(value) {
  return srvTHF.WaterQuality_GetColor(JH.GetJsonValue(srvTHF.GetWaterQuality_Scale(),
    "tds"), value);
}

/**
 *  คืนค่า text ของ waterquality scale salinity
 *  @param {number} value -
 *  @param {string} _param - ph,turbid,...
 *  @return {string}
 */
srvTHF.WaterQuality_GetText_ = function(value, _param) {
  return srvTHF.GetValue(JH.GetJsonValue(srvTHF.GetWaterQuality_Scale(),
    _param), value, "operator", "term", "text");
  // return srvTHF.WaterQuality_GetColor( JH.GetJsonValue( srvTHF.GetWaterQuality_Scale() , _param ) , value );
}

/**
 *  สร้าง waterquality marker
 *  @param {array} latlng -
 *  @param {object} option -
 *  @param {string} color - สีของ marker
 *  @return {L.marker}
 */
srvTHF.WaterQuality_Marker = function(latlng, option, color) {
  // console.log('quality', option, color);
  return srvTHF.GenMarker(latlng, option,
    'user-marker user-marker-waterquality user-marker-waterquality-' + color);
}

/**
 *  ตั้งค่า storm
 *  @param {object} setting -
 */
srvTHF.SetStorm_Setting = function(setting) {
  srvTHF.Set("Storm_Scale", setting);
}

/**
 *  คืนค่า storm scale
 *  @return {object}
 */
srvTHF.GetStorm_Scale = function() {
  return srvTHF.Get("Storm_Scale");
}

/**
 *  คืน สี ของเงื่อนไข storm sacle ที่ value ถูกเงื่อนไขที่ตั้งไว้
 *  @param {number} value - ค่าที่ต้องการเปรียบเทียบ
 *  @return {string} ค่า color ใน storm sacle ที่ถูกเงื่อนไข
 */
srvTHF.Storm_GetColor = function(value) {
  return srvTHF.GetValue(srvTHF.GetStorm_Scale(), value, "operator", "term",
    "color");
}

/**
 *  render storm scale table in modal
 */
srvTHF.renderModalStormTable = function() {
  var scale = srvTHF.GetStorm_Scale().slice(0);
  scale.reverse();
  var table = $('#modal-storm-table').find('tbody');
  for (var i = 0; i < scale.length; i++) {
    var sc = scale[i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');
    var td5 = document.createElement('td');

    td1.innerText = JH.GetJsonValue(sc, "strength");
    td2.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = JH.GetJsonValue(sc, "category");
    td3.innerText = JH.GetJsonValue(sc, "knots_text");
    td4.innerText = JH.GetJsonValue(sc, "mph_text");
    td5.innerText = JH.GetJsonValue(sc, "kmh_text");

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    table.append(tr);
  }
}


// pre_rain
/**
 *  ตั้งค่า pre rain
 *  @param {object} setting -
 */
srvTHF.SetPreRain_Setting = function(setting) {
  srvTHF.Set("PreRain_Rule", JH.GetJsonValue(setting, "rule"));
  srvTHF.Set("PreRain_LevelText", JH.GetJsonValue(setting, "level-text"));
}

/**
 *  render prerain scale table in modal
 */
srvTHF.renderModalClockTable = function() {
  var s = srvTHF.GetPreRain_LevelText();
  var table = $('#modal-clock-table').find('tbody');
  for (var i in s) {
    var sc = s[i];
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');

    td1.bgColor = JH.GetJsonValue(sc, "color");
    td2.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

    tr.appendChild(td1);
    tr.appendChild(td2);
    table.append(tr);
  }
}

/**
 *  คืนค่า setting ของ prerain leveltext
 *  @return {object} setting
 */
srvTHF.GetPreRain_LevelText = function() {
  return srvTHF.Get("PreRain_LevelText");
}

/**
 *  คืนค่า setting ของ prerain rule
 *  @return {object} setting
 */
srvTHF.GetPreRain_Rule = function() {
  return srvTHF.Get("PreRain_Rule");
}

/**
 *  คืนค่า ระดับของ คาดการณ์ฝน ในโซนนี้
 *  @param {string} zone - โซนของ จังหวัด
 *  @param {float} value - ค่าที่จะใช้เทียบ
 *  @return {int} ระดับของ ค่า ในโซนนี้
 */
srvTHF.PreRain_GetLevel = function(zone, value) {
  return srvTHF.GetValue(JH.GetJsonValue(srvTHF.GetPreRain_Rule(), zone),
    value, "operator", "term", "level");
}

//wave
/**
 *  ตั้งค่า wave
 *  @param {object} setting - setting
 */
srvTHF.SetWave_Setting = function(setting) {
  srvTHF.Set("Wave_Setting", setting);
}

/**
 *  render prerain scale table in modal
 */
srvTHF.renderModalWaveTable = function() {
  var sc = srvTHF.GetWave_Setting();
  var table = $('#modal-wave-table').find('tbody');
  var tr = document.createElement('tr');
  var td1 = document.createElement('td');
  var td2 = document.createElement('td');

  td1.bgColor = JH.GetJsonValue(sc, "color");
  td2.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];

  tr.appendChild(td1);
  tr.appendChild(td2);
  table.append(tr);
}

/**
 *  คืนค่า wave setting
 *  @return {object} setting
 */
srvTHF.GetWave_Setting = function() {
  return srvTHF.Get("Wave_Setting");
}

/**
 *  สร้าง wave marker
 *  @param {array} latlng - array lat long
 *  @param {object} option - option เพิ่มเติม
 *  @param {string} color - สี
 *  @return {L.marker} marker
 */
srvTHF.Wave_Marker = function(latlng, option, color) {
  return srvTHF.GenMarker(latlng, option,
    'user-marker user-marker-wave user-marker-wave-' + color);
}

// warning
/**
 *  ตั้งค่า Warning_Setting
 *  @return {object} setting
 */
srvTHF.SetWarning_Setting = function(setting) {
    srvTHF.Set("Warning_Setting", setting);
  }
  /**
   *  คืนค่า Warning_Setting
   *  @return {object} setting
   */
srvTHF.GetWarning_Setting = function() {
  return srvTHF.Get("Warning_Setting");
}

/**
 *  คืนค่า flood forecast level จากค่าที่่ตั้งไว้
 *  @return {object} o
 */
// srvTHF.GetFloodWarning_Level = function() {
//   return srvTHF.Get("FloodWarning_level");
// }
/**
 *  render flood forecast dwr table in modal
 */
// srvTHF.renderModalFloodWarningTable = function() {
//   var s = srvTHF.GetFloodForecast_Level();
//   var table = $('#modal-flood-warning-table').find('tbody');
//   for (var i in s) {
//     var sc = s[i];
//     var tr = document.createElement('tr');
//     var td1 = document.createElement('td');
//     var td2 = document.createElement('td');
//
//     td1.bgColor = JH.GetJsonValue(sc, "color");
//     td2.innerText = TRANSLATOR[JH.GetJsonValue(sc, "trans")];
//
//     tr.appendChild(td1);
//     tr.appendChild(td2);
//     table.append(tr);
//   }
// }
