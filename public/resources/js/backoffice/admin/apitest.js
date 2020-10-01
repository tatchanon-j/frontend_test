var apiTester = {}

apiTester.init = function () {
	$('#test-api-url-prefix').text("(" + apiService.ServerURL + ")")
	
	$('#test-get').on('click',apiTester.SendGET)
	$('#test-post').on('click',apiTester.SendPOST)
	$('#test-put').on('click',apiTester.SendPUT)
	$('#test-delete').on('click',apiTester.SendDELETE)
	$('#test-patch').on('click',apiTester.SendPATCH)
	$('#test-file-post').on('click',apiTester.SendFile)

	$('#test-nonce-btn').on('click',apiTester.GenerateNonce)
}


apiTester.SendGET = function () {
	apiTester.Send("GET")
}

apiTester.SendPOST = function () {
	apiTester.Send("POST")
}

apiTester.SendPUT = function () {
	apiTester.Send("PUT")
}

apiTester.SendDELETE = function () {
	apiTester.Send("DELETE")
}

apiTester.SendPATCH = function () {
	apiTester.Send("PATCH")
}

apiTester.SendFile = function () {
	var frm = $('#send-file-form')

	$('#test-result').text("Sending ...")
	var srv = "/dataimport/download/1/uploadfile"
	apiService.SendRequest("POST",srv,frm,apiTester.ShowResult,
		function(jqXHR, textStatus, errorThrown) {
			apiTester.ShowError(srv, jqXHR, textStatus, errorThrown)
		},true)
}

apiTester.ShowResult = function (data) {
	if ( data === undefined || data == null ) {
		$('#test-result').text("null")
	} else {	
		var s = JSON.stringify(data,null,"  ")
		$('#test-result').text(s)		
	}	
}	

apiTester.ShowError = function (url,jqXHR, textStatus, errorThrown) {
	var s =  apiService.GetAjaxErrorMessage(jqXHR, textStatus, errorThrown)
	$('#test-result').text(s)	
	
	apiService.cbServiceAjaxError(url,jqXHR, textStatus, errorThrown)
}	

apiTester.Send = function (method) {
	var srv = $('#test-service').val()
	if ( srv == "" ) {
			alert("Service is empty")
			return
	}
	var params = null
	var s = $('#test-params').val()
	if (s != "") {
		try {
			params = JSON.parse(s)
		}
		catch(err) {
			alert("Invalid JSON parameters")
			return
		}	
	}
	
	$('#test-result').text("Sending ...")
	apiService.SendRequest(method,srv,params,apiTester.ShowResult,
		function(jqXHR, textStatus, errorThrown) {
			apiTester.ShowError(srv, jqXHR, textStatus, errorThrown)
		})
	
}

apiTester.GenerateNonce = function () {
	$('#test-nonce-value').val(apiService.getNonce())
}
