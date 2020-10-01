var srvDS = {};
srvDS.SetLang = function(lang){
    srvDS.lang = lang;
}
// get json value
srvDS.GetJsonValue = function(source , key){
	return JH.GetJsonValue(source , key);
}
// get json language value
srvDS.GetJsonLangValue = function(source , key){
	return JH.GetJsonLangValue(source , key,true);
}
// alert error
srvDS.Alert = function(msg){
    bootbox.dialog({
        message : msg,
        buttons : {
            danger : {
                label : apiService.transMessage('CLOSE'),
                className : 'btn-danger',
            }
        }
    });
}
// alert
srvDS.Popup = function(msg){
    bootbox.alert(msg);
}
