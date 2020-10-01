
var srvFrontend = {}
srvFrontend.apiUrl = "haii-system-report/Frontend/"
srvFrontend.init = function(translator) {

  var self = srvData
	self.translator = translator
	//self.service = 'thaiwater30/converter/getStationID'
}

/**
* Hide element id div_loading and div_preview.
*
*/
srvFrontend.initHide = function(){
  $('#div_loading , #div_preview').hide()
}

/**
* Show element id div_loading and hide element id div_preview.
*
*/
srvFrontend.divLoading = function(){
  $('#div_loading').show(0)
  $('#div_preview').hide(0)
}

/**
* Hide element id div_loading and show element id div_preview.
*
*/
srvFrontend.divPreview = function(){
  $('#div_loading').hide(0)
  $('#div_preview').show(0)
}
