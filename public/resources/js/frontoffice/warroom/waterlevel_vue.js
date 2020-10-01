// @author   Permporn Kuibumrung <permporn@haii.or.th>

$.ajax({
    url: "../resources/js/frontoffice/warroom/waterlevel.json"
}).done(function(data) {
    var app = new Vue({
        el: '#waterlevel',
        data: {
            list: data,
            tab: 1
        },
        methods: {
            limit: function (val, limit) {
                return val.slice(0, 10)
            }
        },
    })
});

//  vue number_format x,xxx.xx
Vue.filter('numberFormat', function (value) {
    n = Number(value).toFixed(2);
    return  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});