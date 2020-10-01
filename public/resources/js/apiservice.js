var apiService = {}

apiService.defaultTranslator = {
	'ERR_NOTCONNECTED' : 'Not connected\nPlease check your network connection or server CORS\'s OPTION response.',
	'ERR_PARSERERROR' : 'Requested JSON parse failed',
	'ERR_TIMEOUT' : 'Time out error',
	'ERR_ABORT' : 'Ajax request aborted',
	'REQ_ERROR' : 'Error requesting',
	'CLOSE' : 'Close'
}

apiService.init = function(base_url, csrf, trans) {
	if (base_url.slice(-1) === '/') {
		base_url = base_url.substr(0, base_url.length - 1)
	}

	apiService.ServerURL = base_url
	apiService.ClientCSRF = csrf
	if (trans !== undefined) {
		apiService.Translator = trans
	}
	apiService.ErrorLookup = null
	apiService.AjaxCache = {}
	apiService.NonceKeyName = "apiservice_" + apiService.ServerURL + "_nonce_key"
}

// //////////////////////////
// Core
apiService.Alert = function(msg) {
	var title = apiService.transMessage('REQ_ERROR')

	if (bootbox === null || typeof bootbox !== "object") {
		alert(title + "\r\n" + msg)
	}

	bootbox.dialog({
		message : '<PRE>' + msg + '</PRE>',
		title : title,
		buttons : {
			danger : {
				label : apiService.transMessage('CLOSE'),
				className : 'btn-success',
				callback : function() {
				}
			}
		}
	});
}

apiService.transMessage = function(id) {
	if (apiService.Translator !== undefined
			&& apiService.Translator[id] !== undefined) {
		return apiService.Translator[id]
	} else {
		if (apiService.defaultTranslator[id] !== undefined) {
			return apiService.defaultTranslator[id]
		}
	}
	return id
}

apiService.SetErrorLookup = function(fn) {
	apiService.ErrorLookup = fn
}

apiService.GetAjaxErrorMessage = function(jqXHR, textStatus, errorThrown) {
	var msg
	var status
	if ( jqXHR === undefined || jqXHR.status === undefined ) {
		status = 600
	} else {
		status = jqXHR.status
	}

	if (jqXHR.status === 0) {
		msg = apiService.transMessage('ERR_NOTCONNECTED')
	} else if (errorThrown === 'parsererror') {
		msg = apiService.transMessage('ERR_PARSERERROR')
	} else if (errorThrown === 'timeout') {
		msg = apiService.transMessage('ERR_TIMEOUT')
	} else if (errorThrown === 'abort') {
		msg = apiService.transMessage('ERR_ABORT')
	} else {
		var rt
		if (jqXHR.responseText !== undefined) {
			rt = jqXHR.responseText
		}

		msg = false
		if (typeof apiService.ErrorLookup === "function") {
			msg = apiService.ErrorLookup(jqXHR.status, rt)
		}
		if (typeof msg !== 'string') {
			msg = jqXHR.status + " " + rt
		}
	}
	var msgs = []
	if (typeof msg === 'string') {
		msgs.push(msg)
	}

	var err = jqXHR.responseJSON
	if (err !== undefined && err != null) {
		if (err.constructor == Array) {
			for (var i = 0; i < err.length; i++) {
				msgs.push(err[i])
			}
		} else {
			var s = String(err)
			if (s != "") {
				msgs.push(s)
			}
		}
	}

	return msgs
}

apiService.cbServiceAjaxError = function(url, jqXHR, textStatus, errorThrown) {
	var msgs = apiService.GetAjaxErrorMessage(jqXHR, textStatus, errorThrown)

	var msg = ''
	for (var i = 0; i < msgs.length; i++) {
		msg += "    " + msgs[i] + "\r\n"
	}

	apiService.Alert(msg)
}

apiService.GetCachedRequest = function(service, params, user_success,
		user_error) {
	var key = service + '?' + JSON.stringify(params)
	if (apiService.AjaxCache[key] !== undefined) {
		user_success(apiService.AjaxCache[key])
		return;
	}

	apiService.SendRequest('GET', service, params, function(data) {
		apiService.AjaxCache[key] = data
		user_success(data)
	}, user_error)
}

apiService.BuildURL = function(service) {
	url = apiService.ServerURL
	if (service.charAt(0) !== '/') {
		url += '/'
	}
	url += service;
	url += '?_csrf=' + apiService.ClientCSRF
	return url
}

apiService.SendRequest = function(method, service, params, user_success,
		user_error, is_file_upload) {
	url = apiService.ServerURL
	if (service.charAt(0) !== '/')
		url += '/'
	url += service;
	apiService.lastURL = url

	var error_func = user_error
	if (typeof (error_func) !== "function") {
		error_func = function(jqXHR, textStatus, errorThrown) {
			apiService.cbServiceAjaxError(url, jqXHR, textStatus, errorThrown)
		};
	}

	var success_func = user_success
	if (typeof (success_func) !== "function") {
		success_func = null
	}

	var upm = method.toUpperCase();
	
	var ajax_params = {
		url : url,
		type : upm,
		dataType : "json",
		success : success_func,
		error : error_func,
		xhrFields : {
			withCredentials : true
		},
		headers : {
			'X-CSRF-Token' : apiService.ClientCSRF
		}
	}
	
	if ( upm != "GET" ) {
		ajax_params.headers['X-Nonce'] = apiService.getNonce()
		// ajax_params.headers['X-Debug'] = apiService.getNonceInfo()
	}

	if (is_file_upload !== undefined && is_file_upload) {
		var jform = $(params)
		if ( jform.is('form') ) {
			ajax_params.data = new FormData(jform[0])
		} else {
			ajax_params.data = params
		}
		ajax_params.cache = false,
		ajax_params.processData = false
		ajax_params.contentType = false
	} else {
		var sendasform = apiService.checkSendAsForm(upm,params)
		ajax_params.data = sendasform.data

		if ( sendasform.isFormData ) {
			ajax_params.contentType = "application/x-www-form-urlencoded; charset=utf-8"
		} else {
			ajax_params.contentType = "application/json; charset=utf-8"
		}
		ajax_params.cache = (upm == "GET")
	}

	$.ajax(ajax_params)
}

apiService.getNonceInfo = function() {
	if ( apiService.NonceKeyString === undefined ) {
		return ""
        }

	return apiService.NonceKeyString.substr(0,4) + "..." + apiService.NonceKeyString.slice(-4)
}

apiService.getNonce = function() {
	var prev_key_name = apiService.NonceKeyName + "_prev"

	var nonce_prev = localStorage.getItem(prev_key_name)
	if ( nonce_prev === undefined || isNaN(prev_key_name) ) {
		nonce_prev = 0
	}
		
	var np = new Date().getTime()
	while ( np == nonce_prev ) {
		np++
	}
		
	localStorage.setItem(prev_key_name,np)
	if ( apiService.NonceKey === undefined || apiService.NonceKey == null ) {
		 apiService.NonceKeyString = localStorage.getItem(apiService.NonceKeyName)
		 console.log('NonceKey',apiService.NonceKeyString)
         apiService.NonceKey = CryptoJS.enc.Hex.parse(apiService.NonceKeyString)
	}

	if ( apiService.NonceJWTHeader === undefined ) {
		var header = {
				"alg": "HS256",
				"typ": "JWT"
		};
		apiService.NonceJWTHeader = apiService.base64url(CryptoJS.enc.Utf8.parse(JSON.stringify(header)))
	}
	
	var tk = apiService.NonceJWTHeader + "." 
		+ apiService.base64url(CryptoJS.enc.Utf8.parse(JSON.stringify({"dta": {"key":np}})))
			
	return tk + "." + apiService.base64url(CryptoJS.HmacSHA256(tk, apiService.NonceKey));	
}

apiService.base64url = function(source) {
	 // Encode in classical base64
	 encodedSource = CryptoJS.enc.Base64.stringify(source);

	 // Remove padding equal characters
	 encodedSource = encodedSource.replace(/=+$/, '');

	 // Replace characters according to base64url specifications
	 encodedSource = encodedSource.replace(/\+/g, '-');
	 encodedSource = encodedSource.replace(/\//g, '_');

	 return encodedSource;
}

apiService.checkSendAsForm = function(method,params) {
	// Not an object, treat it as a formdata
	if ( typeof params != "object" || params === null ) {
		return {"isFormData":true,"data": params}
	}

	var js = $(params)
	if ( js.is('form') ) {
		return {"isFormData":true,"data": js.serialize()}
	}

	// GET/DELETE data must be send as formdata, let jquery handle it
	if ( method == "GET") {
		return {"isFormData":true,"data": params}
	}

	// POST/PUT/PATCH we can send it as JSON
	return {"isFormData":false,"data": JSON.stringify(params)}
}

apiService.parseLinkHeader = function(jqXHR) {
	var header = jqXHR.getResponseHeader('Link')
	if (header == null || header == "") {
		return {}
	}

	// Split parts by comma
	var parts = header.split(',');
	var links = {};
	// Parse each part into a named link
	for (var i = 0; i < parts.length; i++) {
		var section = parts[i].split(';');
		if (section.length !== 2) {
			continue
		}
		var url = section[0].replace(/<(.*)>/, '$1').trim();
		var name = section[1].replace(/rel="(.*)"/, '$1').trim();
		links[name] = url
	}
	return links
}

// ///////////
// Functions
apiService.logout = function(token) {
	var form = $('<form>', {
		action : apiService.ServerURL + '/auth/logout',
		method : 'post'
	})

	form.append($('<input>', {
		type : 'hidden',
		name : '_tk',
		value : token
	}))

	$('body').append(form);
	form.submit()
}

apiService.getFieldValue = function(obj, key) {
	if ( obj === undefined || obj === null ) {
		return null
	}
	var r = obj
	var as = key.split(".")

	for ( var i = 0 ; i < as.length; i++ ) {
		if ( typeof obj != "object" || r === null ) {
			return null
		}
		r = r[as[i]]
		if (r === undefined) {
			return null
		}
	}

	return r
}
