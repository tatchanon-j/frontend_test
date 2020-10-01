var modul = {
	metadata: {},
	event_management: {},
	data_integration_report: {},
	data_management: {},
	dba: {},
	apis: {},
	data_integration: {}
};
var unittest = {
	isShow: false,
	search: ''
}
var assert = chai.assert
, expect = chai.expect
, should = chai.should();

unittest.randomString = function(_number){
	var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
	var text;
	var number = 16;
	if ( typeof _number == "number"){
		number = _number;
	}
	for (var i = 0 ; i < number ; i++){
		var index =	Math.floor((Math.random() * str.length) + 1);
		text += str[index];
	}
	return text;
}
unittest.cb = function(done, arg){
	done();
	return { data: arg[0], textStatus: arg[1], jqXHR: arg[2] };
}
unittest.init = function () {
	mocha.setup("bdd")

	unittest.search = decodeURIComponent(window.location.search.replace("?grep=",""));
	unittest.test();

	mocha.run();
}
unittest.test = function(){
	var search = unittest.search;
	var desc = [
		{ name: 'Unit test services', func: unittest.testService }
	]
	for (var i = 0 ; i < desc.length ; i++){
		var m = desc[i];
		unittest.search = search.replace(m.name, "");
		if ( unittest.search.trim() == "" ){ unittest.isShow = false; }
		else { unittest.isShow = true; }
		describe(m.name, m.func);
	}

}
unittest.testService = function(){
	var search = unittest.search;
	var isShow = false;
	var desc = [
		{ name: 'บัญชีข้อมูล', test: modul.metadata },
		{ name: 'บริหารจัดการเหตุการณ์', test: modul.event_management },
		{ name: 'รายงานระบบนำเข้าข้อมูล', test: modul.data_integration_report },
		{ name: 'การบริหารจัดการข้อมูล', test: modul.data_management },
		{ name: 'จัดการฐานข้อมูล', test: modul.dba },
		{ name: 'APIS', test: modul.apis },
		{ name: 'โมดูลเชื่อมโยงฯ', test: modul.data_integration }
	]

	for (var i = 0 ; i < desc.length ; i++){
		var m = desc[i];
		var descName = m.name;
		var unitTest = m.test;
		var sT = search.replace(descName, "");

		// if ( !unittest.isShow ){
		// 	it(descName, function(){});
		// }else{
			describe(descName, function() {
				for(var name in unitTest) {
					if ( sT.trim().length == 0 ){
						it(name, function(){});
					}else if (sT.trim() == name){
						describe(name, unitTest[name]);
					}
				}
			} );
		// }
	}
}
