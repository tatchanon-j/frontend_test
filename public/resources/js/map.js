// global variables
var map;    // map object
var markerMap = new Array();    // map markers
var geojson = new Array();      // geojson layers
var marker_icons = new Array();     // marker icons
var latLngsBounds = new Array();    // boundary

// set map view to selected marker coordinate and open popup
function gotoMarker(id, lat, lng) {
    markerMap[id].openPopup();
    map.setView([lat, lng], 8, {
                animation: true
            });
}

// highlight province boundry on mouse over
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#000',
        dashArray: ''
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties.title);
}

// reset province boundary highlight when mouseout
function resetHighlight(e) {
    geojson['province'].resetStyle(e.target);
    info.update("No selection");
}

// set text info for province on top right
function initInfo() {
    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = (props ? props : "Infomation");
    };
    info.addTo(map);
}

function initMarker() {
    // L.Icon.Default.imagePath = '/public/resources/images';
    var imagePath = cfg.path + 'resources/images/marker';

    // circle
    var whiteCircle = L.icon({
        iconUrl: imagePath + '/circle/whiteMarker.png',
        iconSize: [8, 8]
    });
    var redCircle = L.icon({
        iconUrl: imagePath + '/circle/redMarker.png',
        iconSize: [8, 8]
    });
    var orangeCircle = L.icon({
        iconUrl: imagePath + '/circle/orangeMarker.png',
        iconSize: [8, 8]
    });
    var yellowCircle = L.icon({
        iconUrl: imagePath + '/circle/yellowMarker.png',
        iconSize: [8, 8]
    });
    var greenCircle = L.icon({
        iconUrl: imagePath + '/circle/greenMarker.png',
        iconSize: [8, 8]
    });
    var grayCircle = L.icon({
        iconUrl: imagePath + '/circle/grayMarker.png',
        iconSize: [8, 8]
    });

    // rectangle
    var whiteRectangle = L.icon({
        iconUrl: imagePath + '/rectangle/white.png',
        iconSize: [8, 8]
    });
    var redRectangle = L.icon({
        iconUrl: imagePath + '/rectangle/red.png',
        iconSize: [8, 8]
    });
    var orangeRectangle = L.icon({
        iconUrl: imagePath + '/rectangle/orange.png',
        iconSize: [8, 8]
    });
    var greenRectangle = L.icon({
        iconUrl: imagePath + '/rectangle/green.png',
        iconSize: [8, 8]
    });

    var marker_types = {
        "circle" : {
            "white" : whiteCircle,
            "red"   : redCircle,
            "orange" : orangeCircle,
            "yellow" : yellowCircle,
            "green" : greenCircle,
            "gray" : grayCircle,
        }
    };

    return marker_types;
}

// param
// baselayer and default, center, zoom,
function initmap(cfg) {
    // marker setup
    marker_icons = initMarker();

    // base map layers
    OSM_ATTR = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    var base = [];
    base['osm_blackandwhite'] = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {id: 'OpenStreetMap.BlackAndWhite', attribution: OSM_ATTR});
    base['osm_mapnik'] = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {id: 'OpenStreetMap.Mapnik', attribution: OSM_ATTR});
    base['osm_hot'] = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {id: 'OpenStreetMap.HOT', attribution: OSM_ATTR});
    base['Thunderforest_Landscape'] = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
    base['Thunderforest_Outdoors'] = L.tileLayer('http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
    base['Esri_DeLorme'] = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme',
    });
    base['Esri_WorldStreetMap'] = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });
    base['Esri_WorldTopoMap'] = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });
    base['Esri_WorldImagery'] = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    base['CartoDB_DarkMatter'] = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    // default value
    var zoom = (cfg.map.zoom === undefined) ? 6 : cfg.map.zoom;
    var minzoom = (cfg.map.min_zoom === undefined) ? 1 : cfg.map.min_zoom;
    var center = (cfg.map.center === undefined) ? [13.36, 105.98] : cfg.map.center;
    var double_click_zoom = (cfg.map.double_click_zoom === undefined) ? true : cfg.map.double_click_zoom;
    var enabled_layer_control = (cfg.map.enabled_layer_control === undefined) ? true : cfg.map.enabled_layer_control;
    var show_boundary = (cfg.map.show_boundary === undefined) ? true : cfg.map.show_boundary;
    var default_base_layers = (cfg.map.default_base_layers === undefined) ? 'Esri_WorldStreetMap' : cfg.map.default_base_layers;

    // init map
    map = L.map('map', {
        center: center, // thailand
        zoom: zoom,
        minZoom: minzoom,
        layers: [base[default_base_layers]],
        // Tell the map to use a loading control
        loadingControl: true,
        // Home button to default zoom and extent
        defaultExtentControl: true
    });

    if (double_click_zoom != true) {
        map.doubleClickZoom.disable();
    }

    // load province boundary
    if (show_boundary == true) {
        geojson['province'] = new L.GeoJSON.AJAX(cfg.path + "resources/json/boundary/thailand77.json", {
            style: {
                weight: 1,
                opacity: 0.7,
                color: 'black',
                dashArray: '2',
                fillOpacity: 0,
                fillColor: 'white'
                // fillColor: getColor(feature.properties.density)
            },
            onEachFeature: function(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                })
            }
        }).addTo(map);
    }

    // init overlay map, create this function from map_config.js
    initOverlay();

    // create basemap object from config
    var baseMaps = new Object();
    var layerLength = cfg.base_layer.length;
    if (layerLength <= 0) {
        baseMaps['Esri DeLorme'] = base[default_base_layers];
    } else {
        for (var i = 0; i < layerLength; i++) {
            baseMaps[cfg.base_layer[i].name] = base[cfg.base_layer[i].layer];
        }
    }

    // create overlays map object
    var overlayMaps = {
        // "โทรมาตร": geojson['rainfall24h']
    };

    // add map layers control
    if (enabled_layer_control == true) {
        L.control.layers(baseMaps, overlayMaps).addTo(map);
    }

    // control info box
    initInfo();
}