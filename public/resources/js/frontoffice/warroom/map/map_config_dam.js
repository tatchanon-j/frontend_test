
var path = '../';
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
    // dam
    $.ajax({
        url: path + "../resources/json/damSample.json"

    }).done(function(data) {
        
        var app = new Vue({
            //el: '#dam',
            data: {
                list: data
            },
            methods: {
                limit: function (val, limit) {
                    return val.slice(0, 10)
                },
                /*color: function(val) {
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
                },*/
                linkToMarker: function(id, lat, lng) {
                    //console.log(id +"/////"+ lat +"/////"+ lng)
                    gotoMarker(id, lat, lng);
                }
            }
        })

        // convert json to geojson
        var geojson_dam = GeoJSON.parse(data, {Point: ['dam_lat', 'dam_long']});  //map ตาม พิกัด

        // create layer from geojson
        var myLayer = L.geoJSON(geojson_dam, {
            onEachFeature: function(feature, layer) {
                var popupContent = '<strong>' + "เขื่อน" + feature.properties.dam_name + ' (' +
                    feature.properties.dam_id + '</strong>)<br>จ.' + feature.properties.province_name +
                    ' อ.' + feature.properties.amphoe_name + '<br>ข้อมูลน้ำในเขื่อน ' + Number(feature.properties.dam_storage_percent).toFixed(2)  + ' % ' +' <a href="chart/' + feature.properties.dam_id + '"><i class="fa fa-bar-chart" aria-hidden="true"></i></a>';

                layer.bindPopup(popupContent);
            },
            pointToLayer: function (feature, latlng) {
                var markerColor;

                if (feature.properties.dam_storage_percent <= 30) {
                    markerColor = marker_icons['dam']['yellow'];
                } else if (feature.properties.dam_storage_percent <= 50) {
                    markerColor = marker_icons['dam']['green'];
                } else if (feature.properties.dam_storage_percent <= 80) {
                    markerColor = marker_icons['dam']['blue'];
                } else if (feature.properties.dam_storage_percent <= 100) {
                    markerColor = marker_icons['dam']['min'];
                } else if (feature.properties.dam_storage_percent > 100) {
                    markerColor = marker_icons['dam']['red'];
                } /*else {
                    markerColor = marker_icons['dam']['gray'];
                }*/

                // create marker object and assign to global array (for access outside map)
                var marker = L.marker(latlng, {icon: markerColor, riseOnHover: true}).bindTooltip('<strong>' + "เขื่อน" + feature.properties.dam_name + ' (' +
                    feature.properties.dam_id + '</strong>)<br>จ.' + feature.properties.province_name +
                    ' อ.' + feature.properties.amphoe_name + '<br>ข้อมูลน้ำในเขื่อน ' + Number(feature.properties.dam_storage_percent).toFixed(2)  + ' % '
                    );
                markerMap[feature.properties.dam_id] = marker;

                return marker;
                // return L.damMarker(latlng, markerColor).bindLabel(feature.properties.label);
            },
            filter: function(feature, layer) {
                return feature.properties.dam_storage_percent > 0;
            }
        }).addTo(map);
    });
}

