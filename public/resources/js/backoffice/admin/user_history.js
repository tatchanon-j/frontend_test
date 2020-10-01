/**
*
*   Main JS application file for user history page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var srvSessionLog = {}; //initial data

/**
* prepare data
*
* @param {string} lang language name
* @param {json} translator Text for use on page
*
*/
srvSessionLog.init = function(lang, translator) {
	var self = srvSessionLog; //initial data
	self.lang = lang; //language name
	self.translator = translator; //Text for label and message on javascript
	self.dateFormat = 'YYYY-MM-DD HH:mm'; //date format

	moment.locale(lang);

	// Genalate Data table
	self.dataTableId = 'sessionlog-tbl'
	ctrl = $('#' + self.dataTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frlBtip',
		buttons: [],
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},{
			data : function(row) { return self.renderDateTime('login_at',row) },
			sType: 'moment'
		}, {
			data : function(row) { return self.renderDateTime('logout_at',row) },
			sType: 'moment'
		}, {
			data : 'user_account',
		},{
			data : 'client_ip',
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'desc' ] ],
		rowCallback : ''
	})

	$.fn.dataTableExt.oSort['moment-asc']  = function(x,y) {
		var xt = moment(x,self.dateFormat).unix()
		var yt = moment(y,self.dateFormat).unix()

		return ((xt < yt) ? -1 : ((xt > yt) ?  1 : 0));
	};

	$.fn.dataTableExt.oSort['moment-desc'] = function(x,y) {
		var xt = moment(x,self.dateFormat).unix()
		var yt = moment(y,self.dateFormat).unix()

    	return ((xt < yt) ?  1 : ((xt > yt) ? -1 : 0));
	};

	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	//Multiselect
	var ctrl = $('#sessionlog-sessionlog_userids')
	ctrl.multiselect({
		buttonWidth : '100%',
		maxHeight : 300,
		includeSelectAllOption : true,
		selectAllNumber : false,
		enableFiltering: true,
		selectAllText : self.translator['select_all'],
		allSelectedText : self.translator['all_selected'],
		nonSelectedText : self.translator['none_selected'],
	})

	$('#sessionlog-sessionlog_startat,#sessionlog-sessionlog_stopat').datetimepicker({
		format : 'YYYY-MM-DD HH:mm',
		icons: {
			time: 'fa fa-clock-o',
			date: 'fa fa-calendar',
			up: 'fa fa-chevron-up',
			down: 'fa fa-chevron-down',
			previous: 'fa fa-chevron-left',
			next: 'fa fa-chevron-right',
			today: 'fa fa-check',
			clear: 'fa fa-trash',
			close: 'fa fa-times'
		}
	})

	var currentdate = new Date(); //current date
	datetime = 	currentdate.getFullYear() + "-"
							+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
							+ ("0" + currentdate.getDate()).slice(-2)
	$('#sessionlog-sessionlog_startat').val(datetime + " 00:00");
	$('#sessionlog-sessionlog_stopat').val(datetime + " 23:59");


	 $('#sessionlog-btn_preview').on('click',self.previewSessionLog)
	 $('#sessionlog-btn_export').on('click',self.exportSessionLog)

	self.sessionLogDateRange = [datetime,datetime]
	apiService.SendRequest("GET","uac/users-setting",$('#sessionlog-form'),self.loadUserList)
}


/**
* translate message
*
* @param {string} msg message
*
* @return {string} message
*
*/
srvSessionLog.translate = function (msg) {
	var self = srvSessionLog; //initial data

	if (typeof self.translator != "object" || self.translator == null) {
		return msg
	}

	var v = self.translator[msg]; //message translate
	if ( v === undefined ) {
		return msg
	}
	return v
}


/**
* get user list.
*
* @param {json} data user data
*
*/
srvSessionLog.loadUserList = function(data) {
	var self = srvSessionLog; //initial data
	var ctrl = $('#sessionlog-sessionlog_userids'); //sessionlog userids element
	var h = ""; //option element

	$.each(data.users,function(i,u){
		h += '<option value="' + u.id + '">' + u.account + '</option>'
	})
	ctrl.html(h)
	ctrl.multiselect('rebuild');
	ctrl.multiselect('selectAll',false);
	ctrl.multiselect('updateButtonText');

	var st = data.setting
	self.smallusercount_threshold = st.sessionlog_smallusercount_threshold
	self.singleusercount_maxdays = st.sessionlog_singleusercount_maxdays
	self.smallusercount_maxdays = st.sessionlog_smallusercount_maxdays
	self.largeusercount_maxdays = st.sessionlog_largeusercount_maxdays
	self.previewSessionLog();
}


/**
* set fomat date to get data history.
*
* @param {json} d
*
* @return {string} date
*/
srvSessionLog.formatRFC3339 = function(d) {
	function pad(n){return n<10 ? '0'+n : n}
	return d.substring(0,10) + "T" + d.substring(11,18) + ":00"
}


/**
* get session data log.
*
*/
srvSessionLog.previewSessionLog = function() {
	var self = srvSessionLog; //initial data
	var st = $('#sessionlog-sessionlog_startat').val(); //sessionlog_startat element
	var ed = $('#sessionlog-sessionlog_stopat').val(); //sessionlog_stopat eleemnt

	$('#sessionlog-sessionlog_startat-rfc3339').val(srvSessionLog.formatRFC3339(st))
	$('#sessionlog-sessionlog_stopat-rfc3339').val(srvSessionLog.formatRFC3339(ed))

	self.sessionLogDateRange = [st,ed]
	apiService.SendRequest("GET","uac/sessionlogs",$('#sessionlog-form'),srvSessionLog.loadSessionLogList)
}


/**
* get session data list.
*
* @param {json} data session log data
*
*/
srvSessionLog.loadSessionLogList = function(data) {
	srvSessionLog.dataTable.clear()
	srvSessionLog.dataTable.rows.add(data.sessionlogs)
	srvSessionLog.dataTable.draw()
}


/**
* generate data date time.
*
* @param {json} fldname field name data
* @param {json} row The data for the whole row
* @param {json} type The data type requested for the cell
* @param {json} set Value to set if the type parameter is set. Otherwise, undefined.
* @param {json} meta An object that contains additional information about the cell being requested.
*
* @return {string} date and time
*
*/
srvSessionLog.renderDateTime = function(fldname,row, type, set, meta) {
	var self = srvSessionLog; //initial data
	var v = moment(row[fldname]) //date data

	if (v.get('year') <= 1970) {
		if  (fldname == 'logout_at') {
			return self.translate('still_login')
		}
		return ""
	}
	return v.format(self.dateFormat)
}


/**
* export report session data.
*
*/
srvSessionLog.exportSessionLog = function() {
	var self = srvSessionLog; //initial data
	var data = []; //the session log data
	var tbl = srvSessionLog.dataTable; //table element
	var rows_count = tbl.data().count(); //amount row

	if ( rows_count == 0 ) {
		bootbox.alert("no data to export")
	}

	var headers = tbl.settings()[0].aoColumns; //headers data
	var row = []; //row data

	for (var i = 0; i < headers.length; i++) {
		if ( !headers[i].bVisible ) {
			continue
		}
		row.push('"' + headers[i].sTitle.replace('"','""') + '"')
	}
	data.push(row)

	for (var i = 0; i < rows_count; i++ ) {
		var cells = $(tbl.row(i).node()).find('td'); //cells

		row = []
		for (var j = 0; j < headers.length; j++) {
			if ( !headers[j].bVisible ) {
				continue
			}
			var v
			if ( j == 0 ) {
				v = parseInt(cells[j].innerText)
			} else {
				v  = '"' + cells[j].innerText.replace('"','""') + '"'
			}

			row.push(v)
		}
		data.push(row)
	}

	data.sort(function(a,b) {
		return a[0] - b[0]
	})

	var csvContent = "";
	data.forEach(function(infoArray, index){
   		dataString = infoArray.join(",");
   		csvContent += index < data.length ? dataString+ "\n" : dataString;
	});

	var fname = document.title; //file name
	var st = self.sessionLogDateRange[0].toString().substr(0,10); //start date
	var ed = self.sessionLogDateRange[1].toString().substr(0,10); //end date

	fname += " (" + st
	if ( st != ed ) {
		fname += " to "
		fname += ed
	}
	fname += ").csv"

	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), fname);
		return
	}

	var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", fname);
	document.body.appendChild(link) // Required for FF
	link.click();
	document.body.removeChild(link)
}
