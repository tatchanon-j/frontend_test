var srvMeta = {}; //innitail data
var datetime; //prepare date timr default
var obj_data; //prepare data monitor

/**
* prepare data.
*
* @param {json} translator Text for use on page
*
* @return text
*/
srvMeta.init = function(translator) {
	var self = srvMeta; //innitail data
	self.translator = translator; //Text for label and message on java script
}