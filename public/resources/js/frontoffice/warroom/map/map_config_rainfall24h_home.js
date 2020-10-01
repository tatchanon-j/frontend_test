var path = '../../';
var cfg = {
    path: path,
    map: {
        center: [13.36, 100.98],    // map center lat, lng, default [13.36, 105.98]
        zoom: 6,    // zoom level, default 6
        min_zoom: 4,      // minimum zoom level, default 1 (Min level = large area)
        double_click_zoom: true,  //disable double click zoom, default true
        control: {
            enabled_layer_control: false     // enable layer control, default true
            // others control (to develop)
        },
        show_boundary: true,    // show province boundary, default true
        default_base_layers: 'Esri_WorldStreetMap'     // default 'Esri_WorldStreetMap'
    },
    base_layer: [   // if not specific, will show only Esri_WorldStreetMap
        {
            name: 'OSM B&W',
            layer: 'osm_blackandwhite'
        }, {
            name: 'OSM Mapnik',
            layer: 'osm_mapnik'
        }, {
            name: 'OSM Hot',
            layer: 'osm_hot'
        }, {
            name: 'Esri WorldStreetMap',
            layer: 'Esri_WorldStreetMap'
        }, {
            name: 'Esri DeLorme',
            layer: 'Esri_DeLorme'
        }, {
            name: 'Esri WorldTopoMap',
            layer: 'Esri_WorldTopoMap'
        }, {
            name: 'Esri WorldImagery',
            layer: 'Esri_WorldImagery'
        }, {
            name: 'CartoDB DarkMatter',
            layer: 'CartoDB_DarkMatter'
        }
    ],
    overlay_layer: [
        // {
        //     name: 'โทรมาตรฝน',
        //     layer: ''
        // }, {
        //     name: 'test',
        //     layer: ''
        // }
    ]
}

// =========================================================

function initOverlay() {
    // rainfall 24h
    $.ajax({
        url: path + "resources/js/frontoffice/warroom/rainfall24h_home.json"
    }).done(function(data) {
        /*var app = new Vue({
            el: '#rainfall24h',
            data: {
                list: data
            },
            methods: {
                limit: function (val, limit) {
                    return val.slice(0, 10)
                },
                color: function(val) {
                    if (val > 90) {
                        color = '#ee141f';
                    } else if (val >= 75) {
                        color = '#ca6504';
                    } else if (val >= 50) {
                        color = '#fe8a04';
                    } else if (val >= 35) {
                        color = '#f6d300';
                    } else if (val >= 20) {
                        color = '#66c803';
                    } else if (val >= 10) {
                        color = '#9ceeb2';
                    } else if (val >= 0) {
                        color = '#a9d1fc';
                    }

                    return color;
                }
            }
        })*/

        // convert json to geojson
        var geojson_rainfall24h = GeoJSON.parse(data, {Point: ['tele_station_lat', 'tele_station_long']});

        // create layer from geojson
        var myLayer = L.geoJSON(geojson_rainfall24h, {
            onEachFeature: function(feature, layer) {
                var popupContent = '<strong>' + feature.properties.tele_station_name + ' (' +
                    feature.properties.tele_station_id + '</strong>)<br>จ.' + feature.properties.province_name +
                    ' อ.' + feature.properties.amphoe_name + '<br>ฝน 24 ชม ' + Number(feature.properties.rainfall24h).toFixed(2)  + ' มม. เวลา ' +
                    feature.properties.rainfall24h_time + ' <a href="chart/' + feature.properties.tele_station_id + '"><i class="fa fa-bar-chart" aria-hidden="true"></i></a>';

                layer.bindPopup(popupContent);
            },
            pointToLayer: function (feature, latlng) {
                var markerColor;

                if (feature.properties.rainfall24h > 90) {
                    markerColor = marker_icons['circle']['red'];
                } else if (feature.properties.rainfall24h > 50) {
                    markerColor = marker_icons['circle']['orange'];
                } else if (feature.properties.rainfall24h > 10) {
                    markerColor = marker_icons['circle']['yellow'];
                } else if (feature.properties.rainfall24h > 0) {
                    markerColor = marker_icons['circle']['green'];
                } else if (feature.properties.rainfall24h == 0) {
                    markerColor = marker_icons['circle']['white'];
                } else {
                    markerColor = marker_icons['circle']['gray'];
                }

                // create marker object and assign to global array (for access outside map)
                var marker = L.marker(latlng, {icon: markerColor, riseOnHover: true}).bindTooltip('<strong>' + feature.properties.tele_station_name + ' (' +
                    feature.properties.tele_station_id + '</strong>)<br>จ.' + feature.properties.province_name +
                    ' อ.' + feature.properties.amphoe_name + '<br>ฝน 24 ชม ' + Number(feature.properties.rainfall24h).toFixed(2)  + ' มม. เวลา ' +
                    feature.properties.rainfall24h_time);
                markerMap[feature.properties.tele_station_id] = marker;

                return marker;
                // return L.circleMarker(latlng, markerColor).bindLabel(feature.properties.label);
            },
            filter: function(feature, layer) {
                return feature.properties.rainfall24h > 0;
            }
        }).addTo(map);
    });
}