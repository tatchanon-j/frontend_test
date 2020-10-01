/**
*
* Leaflet Object for handler leaflet.
*
* @author CIM Systems (Thailand) <cim@cim.co.th>
* @license HAII
*
*/
var LL = {};

/**
* init LL
*/
LL.init = function(){
    JH.Set('LL.geojson', GEOJSON);
    JH.Set('LL.zoom', 6);
    JH.Set('LL.center_latlng', new L.LatLng(13.039, 101.48949999999999));
    // JH.Set('LL.access_token', 'pk.eyJ1IjoiYXRrIiwiYSI6ImNpaXpyMDV4NjAwNTF1ZGx3dzdybjNlbGsifQ.NjdfIWMjtHthaoFOsC3uyQ');
    JH.Set('LL.tilmap', 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png');
}

/**
*
* @param {string} element_id - element id
* @param {object} option - custom option
* @return {L.map} new L.map
*/
LL.Map = function(element_id, option){
    if ( !element_id ){ return false; }
    var _option = {
        center: JH.Get('LL.center_latlng'),
        zoom: JH.Get('LL.zoom'),
        zoomControl: false,
    };
    if ( option ){
        _option = $.extend({}, _option, option);
    }

    map = new L.Map(element_id, _option);
    tileLayer = LL.DefaultlTileLayer(map);
    JH.Set('LL.tileLayer', tileLayer);
    return map;
}
/**
* Set tileLayer map with default
* @param {L.Map} map - map
* @param {object} option - custom option
*/
LL.DefaultlTileLayer = function(map, option){
    if ( !map ){ return false; }
    var geojson = JH.Get('LL.geojson');
    var tilmap = JH.Get('LL.tilmap');
    var _option = {
        id: 'OpenStreetMap.HOT',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    };

    if ( option ){
        _option = $.extend(_option, option);
    }
    tileLayer = L.tileLayer(tilmap, _option).addTo(map);
    return tileLayer;
}

/**
* Get geojson thailand
* @return {geojson}
*/
LL.GetGeoJsonThailand = function(){
    return JH.Get('LL.geojson');
}

/**
* Set map to center default
* @param {L.map} map - map
*/
LL.CenterDefault = function(map){
    map.setView(JH.Get('LL.center_latlng'), JH.Get('LL.zoom') );
}
