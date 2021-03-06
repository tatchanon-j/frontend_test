var cfg = {
    map: {
        center: [13.36, 100.98],    // map center lat, lng, default [13.36, 105.98]
        zoom: 6,    // zoom level, default 6
        min_zoom: 4,      // minimum zoom level, default 1 (Min level = large area)
        control: {
            enabled_layer_control: true     // enable layer control, default true
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
        url: "resources/json/sample.json"
    }).done(function(data) {
        // convert json to geojson
        var geojson_rainfall24h = GeoJSON.parse(data, {Point: ['tele_station_lat', 'tele_station_long']});

        // create layer from geojson
        var myLayer = L.geoJSON(geojson_rainfall24h, {
            onEachFeature: function(feature, layer) {
                var popupContent = '<strong>' + feature.properties.tele_station_name + ' (' +
                    feature.properties.tele_station_id + '</strong>)<br>จ.' + feature.properties.province_name +
                    ' อ.' + feature.properties.amphoe_name + '<br>ฝน 24 ชม ' + Number(feature.properties.rainfall24h).toFixed(2)  + ' มม. เวลา ' +
                    feature.properties.rainfall24h_time;

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
                markerMap[feature.id] = marker;

                return marker;
                // return L.circleMarker(latlng, markerColor).bindLabel(feature.properties.label);
            },
            filter: function(feature, layer) {
                return feature.properties.rainfall24h > 0;
            }
        }).addTo(map);
    });
}