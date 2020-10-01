var APIDoc = {
	currReqURL : "",
	prevReqURL : "",
	setReqURLTryCount: 0
}

APIDoc.init = function(cfg) {
	APIDoc.needAPIKey = cfg.needAPIKey
	if ( APIDoc.needAPIKey === undefined ) {
		APIDoc.needAPIKey = false
	}
	APIDoc.needToken = cfg.needToken
	if ( APIDoc.needToken === undefined ) {
		APIDoc.needToken = false
	}
	APIDoc.apiCSRF = cfg.apiCSRF
	if (APIDoc.apiCSRF === undefined ) {
		APIDoc.apiCSRF = ""
	}

	APIDoc.changeBanner(cfg.haiiImage,cfg.docsURL)
	APIDoc.changeDocumentUI()
}

APIDoc.changeBanner = function(img_url,docs_url) {
	document.forms[0].style.display = 'none';
	var spans = document.getElementsByTagName("span");
	var span = null
	for (var i = 0; i < spans.length; i++) {
		if ( spans[i].innerText == "swagger" ) {
			span = spans[i]
			break
		}
	}

	if ( span == null ) {
		return
	}

	if ( img_url !== undefined && img_url != "" ) {
		span.innerText = ""
		var p = span.parentElement
		var img = document.createElement("img")
		img.src = img_url
		img.style = "padding-left: 10px"

		var ctrl = img
		if ( docs_url !== undefined && docs_url != "" ) {
			var a = document.createElement("a")
			a.setAttribute('href', docs_url)
			a.appendChild(img,a)
			ctrl = a
		}
		p.insertBefore(ctrl,span)
	}
}

APIDoc.changeDocumentUI = function() {
	var d = document.getElementsByClassName('description')
	if ( d.length == 0 ) {
		window.setTimeout(APIDoc.changeDocumentUI,100)
		return
	}

	var m = document.getElementsByClassName("models")
	if ( m.length > 0 ) {
		m[0].style="display:none"
	}

	if ( APIDoc.needAPIKey ) {
		APIDoc.addAgentKeyUI(d[0])
	}
	if ( APIDoc.needToken ) {
		APIDoc.addTokenKeyUI(d[0])
	}
	// APIDoc.addUnsupportNode(d[0])
}

APIDoc.requestInterceptor = function(req) {
	if ( APIDoc.needToken ) {
		APIDoc.addTokenKey(req)
	}
	APIDoc.prevReqURL = APIDoc.currReqURL
	APIDoc.currReqURL = req.url

	if ( !APIDoc.needAPIKey ) {
		APIDoc.addCSRF(req)
	} else {
		APIDoc.addAgentToken(req)
	}


	return req
}

APIDoc.responseInterceptor = function(resp) {
	APIDoc.setReqURLTryCount = 1
	window.setTimeout(APIDoc.showRequestURL,100)

	return resp
}

APIDoc.addUnsupportNode = function(ctrls) {
	var ui = document.getElementById('swagger-ui')
	var note = document.getElementById('swg-note')

	var p = ctrls[0].parentElement
	p.appendChild(note)
	note.style = ""
}

APIDoc.addAgentKeyUI = function(ctrl) {
	var ui = document.getElementById('swagger-ui')
	var frm = document.getElementById('api-agent-key')

	var p = ctrl.parentElement
	if ( frm.parentElement != p ) {
		p.appendChild(frm)
	}
}
APIDoc.addTokenKeyUI = function(ctrl) {
	var ui = document.getElementById('swagger-ui')
	var frm = document.getElementById('api-token')

	var p = ctrl.parentElement
	if ( frm.parentElement != p ) {
		p.appendChild(frm)
	}
}

APIDoc.showRequestURL = function() {
	var m = document.getElementsByClassName("curl")
	for (var i = 0; i < m.length; i++) {
		var ctrl = m[i].parentElement
		if ( ctrl != null ) {
			tarea = ctrl.childNodes[0]
			ctext = tarea.innerText.split(" ")[3]
			ctrl = ctrl.parentElement
			if ( ctrl != null && ctrl.childNodes.length > 0 ) {
				ctrl = ctrl.childNodes[0]
			}
			ctrl.innerText = ctext.replace(/"/g, "")
		}
		//
		// if ( ctrl != null ) {
		// 	var t = ctrl.innerText
		// 	if ( t == 'Curl' || APIDoc.prevReqURL == t ) {
		// 			ctrl.innerText = APIDoc.currReqURL
		// 			return
		// 	}
		// }
	}
	// APIDoc.setReqURLTryCount++
	// if ( APIDoc.setReqURLTryCount < 5 ) {
	// 	window.setTimeout(APIDoc.hideCurl,100)
	// }
}

APIDoc.addCSRF = function(obj) {
	if ( APIDoc.apiCSRF == "" ) {
		return false
	}

	if( !obj.headers ) {
		obj.headers = {};
	}

	obj.credentials = 'include'
	obj.headers["X-CSRF-Token"] = APIDoc.apiCSRF

	if ( obj.method != "GET" ) {
		obj.headers["X-Nonce"] = APIDoc.getNounce(obj.url)
	}
	return true
}

APIDoc.addAgentToken = function(obj) {
	var ctrl = document.getElementById("input_agent")
	if ( ctrl == null ) {
		return false
	}
	var agent_name = ctrl.value

	ctrl = document.getElementById("input_apikey")
	if ( ctrl == null ) {
		return false
	}
	var api_key = ctrl.value

	if ( agent_name == "" || api_key == "" ) {
		alert("Please enter both Agent Name and API Key")
		return false
	}

	if (APIDoc.nodeID === undefined ) {
		if (localStorage !== undefined) {
			APIDoc.nodeID = parseInt(localStorage.getItem('haii-api-agent-nodeID'))
		}

		if (isNaN(APIDoc.nodeID) || APIDoc.nodeID <= 0) {
			APIDoc.nodeID= Math.floor(Math.random() * (650000 - 1 + 1)) + 1;
			if (localStorage !== undefined) {
				localStorage.setItem('haii-api-agent-nodeID',APIDoc.nodeID)
			}
		}

		APIDoc.agentRequestCounter1 = new Date().getTime()
		APIDoc.agentRequestCounter2 = 0
	} else {
		APIDoc.agentRequestCounter2++
	}

	var now = new Date()
	var payload = {
		"iss": agent_name,
		"sub": obj.url,
		"mth": obj.method,
		"exp": Math.round(now.getTime() / 1000) + 30,
		"jti": APIDoc.nodeID + "." + APIDoc.agentRequestCounter1 + "." + APIDoc.agentRequestCounter2
	}

	var as = "Bearer " + JWTUtil.Sign(forge.util.hexToBytes(api_key),payload)

	if( !obj.headers ) {
		obj.headers = {};
	}
	obj.headers["Authentication"] = as
	return true
}
APIDoc.addTokenKey = function(req) {
	var ctrl = document.getElementById("input_token")
	if ( ctrl == null ) {
		return false
	}
	var token = ctrl.value
	req.url = req.url.replace("{token}", token);
	return true
}


APIDoc.getNounce = function(url) {
	if ( APIDoc.nonceKey === undefined ) {
		if ( !APIDoc.setNounceKey(url) ) {
			return ""
		}
	}

	var nonce_prev = localStorage.getItem(APIDoc.nonceKeyPrevName)
	if ( nonce_prev === undefined || isNaN(nonce_prev) ) {
		nonce_prev = 0
	}

	var np = new Date().getTime()
	while ( np == nonce_prev ) {
		np++
	}

	localStorage.setItem(APIDoc.nonceKeyPrevName,np)

	return JWTUtil.Sign(APIDoc.nonceKey,{"dta": {"key":np}})
}

APIDoc.setNounceKey = function(url) {
	var base_url = url
	while ( base_url != "" ) {
		var k =  "apiservice_" + base_url + "_nonce_key"
		s = localStorage.getItem(k)
		if ( s !== undefined && s != null ) {
			APIDoc.nonceKey =  forge.util.hexToBytes(s)
			APIDoc.nonceKeyName = k
			APIDoc.nonceKeyPrevName = k + "_prev"

			return true
		}

		var i = base_url.lastIndexOf("/")
		if ( i <= 1 ) {
			base_url = ""
		} else {
			base_url = base_url.substring(0,i)
		}
	}
	return false
}

var JWTUtil = {}

JWTUtil.Base64URL = function (obj) {
	if (typeof obj === "object") {
		s = JSON.stringify(obj)
	} else {
		s = obj
	}

	s = forge.util.encode64(s)

	var p = s.indexOf("+")
	if (p >= 0) {
		s = s.replace(/\+/g,"-")
	}
	p = s.indexOf("/")
	if (p >= 0) {
		s = s.replace(/\//g,"_")
	}
	p = s.indexOf('=')
	if (p >= 0) {
		return s.substring(0,p)
	}
	return s
}

JWTUtil.jwtHeader = JWTUtil.Base64URL({
	"alg":"HS256",
	"typ":"JWT"
})

JWTUtil.Sign = function (key,payload) {
	var s =  JWTUtil.jwtHeader + "." + JWTUtil.Base64URL(payload)

	var hmac = forge.hmac.create();
	hmac.start('sha256',key)
	hmac.update(s)
	var hx = hmac.digest().data

	return s + "." + JWTUtil.Base64URL(hx)
}
