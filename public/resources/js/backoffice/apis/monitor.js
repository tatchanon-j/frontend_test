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
	self.service_service_name = 'thaiwater30/backoffice/api/service_name'; //service service name
	self.service_agent_name = 'thaiwater30/backoffice/api/agent'; //service agent name
	self.service_method_service = 'thaiwater30/backoffice/api/method_service'; //service method_service
	self.service_access_log		= 'thaiwater30/backoffice/api/access_log'; // service access log

	
apiService.SendRequest('GET',self.service_agent_name,{}, function(rs){
	srvMeta.AgentOption(rs);
})

	// filter-method
	// Setting option multiselect
	$('select[multiple=multiple]').each(function(i, e) {
		$(e).multiselect({
			buttonWidth : '100%',
			maxHeight : 300,
			includeSelectAllOption : true,
			selectAllNumber : false,
			enableFiltering: true,
			selectAllText : self.translator['select_all'],
			allSelectedText : self.translator['all_selected'],
			nonSelectedText : self.translator['none_selected'],
		})
	})

	// Setting data table
	self.groupTableId = 'tbl-key_access_mgmt'; //table id
	ctrl = $('#' + self.groupTableId);
	self.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [ {
			defaultContent : '',
			orderable : false,
			searchable : false,
		},
		{
			data :  srvMeta.renderAccess_time,
		},
		{
			data :  srvMeta.renderAgent_user,
		},
		{
			data :  srvMeta.renderUser,
		},
		{
			data :  srvMeta.renderServer_agent_user,
		},
		{
			data :  srvMeta.renderService,
		},
		{
			data :  srvMeta.renderService_method,
		},
		{
			data :  srvMeta.renderHost,
		},
		{
			data :  srvMeta.renderClient,
		},
		{
			data :  srvMeta.renderRequest_url,
		},
		{
			data :  srvMeta.renderAccess_duration,
		},
		{
			data :  srvMeta.renderRely_code,
		}	],
		order : [ [ 1, 'asc' ] ]
})


/**
* Generate order number
*
*/
self.dataTable.on('order.dt search.dt', function() {
	self.dataTable.column(0, {
		search : 'applied',
		order : 'applied'
	}).nodes().each(function(cell, i) {
		cell.innerHTML = i + 1;
	});
}).draw();


$('#filter_startdate,#filter_enddate').datetimepicker({
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

var currentdate = new Date(); //current date time
datetime = 	currentdate.getFullYear() + "-"
+ ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-"
+ ("0" + currentdate.getDate()).slice(-2) + " "
+ ("0" + currentdate.getHours()).slice(-2) + ":"
+ ("0" + currentdate.getMinutes()).slice(-2);


// Get json data to generate option of dropdown list service.
apiService.SendRequest('GET',self.service_service_name,{}, function(rs){
	srvMeta.gen_filter_service_name(rs);
	srvMeta.gen_filter_date(rs);
})






/**
*Generate option of agent drodown list
*
*@param {json} agent_user Json data from service.

*/
srvMeta.AgentOption = function(au){
	console.log('au',au.data)
	var filter_agent_name = document.getElementById('filter-agent'); //filter service element
	var agent_name = apiService.getFieldValue(au,'data'); //data service

	console.log('agent_name',agent_name)

	if ( agent_name == null ) {
		return
	}

	/* sort option list by alphabet */
	JH.Sort(agent_name,"agent_name",false , function(str){
		return str.toLowerCase();
	});

	for(var i=0; i<agent_name.length; i++){
		var gen_option = document.createElement('option'); //create option element

		if(agent_name[i]['agent_name']){
			var text_option = agent_name[i]['agent_name']; //option name
		}else{
			var text_option = srvMeta.translator['untitle']; //option name without service name
		}

		var value_option = agent_name[i]['id']; //value option

		gen_option.text = text_option;
		gen_option.value = value_option;
		filter_agent_name.add(gen_option);

		//Display filter as multiselect
		$(filter_agent_name).multiselect({includeSelectAllOption: true });
		$(filter_agent_name).multiselect('rebuild');
		$(filter_agent_name).multiselect('selectAll',true);
		$(filter_agent_name).multiselect('updateButtonText');
	}
	
}

srvMeta.MethodServiceOption = function(rs){
	var option = ""
    for (var i = 0; i < rs.length; i++) {
        option += '<option value=' + rs[i].id + '>' + rs[i].method_name + '</option>';

    }
    $('#filter-method').html(option);
    $('#filter-method').multiselect('rebuild')
    $('#filter-method').multiselect('selectAll', false);
    $('#filter-method').multiselect('updateButtonText');
    $('#filter-method').trigger('change')	
}

// put data on data table.
var param  = {}; //prepare parameter
param['dateStart'] = datetime; //start date
param['dateEnd'] = datetime; //end date
apiService.SendRequest('GET',self.service_access_log,param,srvMeta.previewDataTables);

$('#btn_preview').on('click',srvMeta.btnPreviewClick);
$('#div_loading').hide();
}

/**
*Generate option of service drodown list
*
*@param {json} service_name Json data from service.
*/
srvMeta.gen_filter_service_name = function(sn){
	var filter_service_name = document.getElementById('filter-service'); //filter service element
	var service_name = apiService.getFieldValue(sn,'data.service_name'); //data service

	if ( service_name == null ) {
		return
	}

	/* sort option list by alphabet */
	JH.Sort(service_name,"text",false , function(str){
		return str.toLowerCase();
	});

	for(var i=0; i<service_name.length; i++){
		var gen_option = document.createElement('option'); //create option element

		if(service_name[i]['text']){
			var text_option = service_name[i]['text']; //option name
		}else{
			var text_option = srvMeta.translator['untitle']; //option name without service name
		}

		var value_option = service_name[i]['value']; //value option

		gen_option.text = text_option;
		gen_option.value = value_option;
		filter_service_name.add(gen_option);

		//Display filter as multiselect
		$(filter_service_name).multiselect({includeSelectAllOption: true });
		$(filter_service_name).multiselect('rebuild');
		$(filter_service_name).multiselect('selectAll',true);
		$(filter_service_name).multiselect('updateButtonText');
	}
}

/**
*put data on data table.
*
*/
srvMeta.btnPreviewClick = function(){
	var self = srvMeta //initial data
	var param = {} //prepare parameter
	var frm = $('#form_import') //element form input
	var filter_service = $('#filter-service').val() //ifilter service element
	var start_date = $('#filter_startdate').val() //filter start date element
	var end_date = $('#filter_enddate').val() //filter end date element
	var agent = $('#filter-agent').val() //filter agent element
	var method = $('#filter-method').val() //filter method element


	frm.parsley().validate()
	if(!start_date || !filter_service || !end_date || !agent || !method){
		bootbox.alert({
			message : self.translator['msg_err_require_filter'],
			buttons : {
				ok:{
					label: self.translator['btn_close']
				}
			}
		})
		$('.filter-form ul.parsley-errors-list').remove();
		return false
	}

	var date_range = parseInt($('#date_range').val()); //date range
	var startDate = new Date(start_date) //get start date
	var stDate = startDate.setDate( startDate.getDate()); //convert start date to number
	maxDate = startDate.setDate( startDate.getDate() + 30 ); //Max range date from startdate
	var endDate = new Date(end_date) //get end date
	endDate = endDate.setDate( endDate.getDate()); //convert end dte to number

	/* validate startdate over than end date */
	if(stDate > endDate){
		bootbox.alert({
			message: self.translator['msg_stdate_over_endate'],
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})

		return false
	}

	/* validate end date over than max range date */
	if(endDate > maxDate){
		bootbox.alert({
			message: self.translator['msg_err_date_over_range'].replace('%s',30),
			buttons: {
				ok: {
					label: self.translator['btn_close']
				}
			}
		})
		$('#filter_enddate').val('');
		return false
	}

	param['dateStart'] = $('#filter_startdate').val();
	param['dateEnd'] = $('#filter_enddate').val();
	param['user'] = $('#filter-agent').val().join();
	param['service'] = $('#filter-service').val().join();
	param['method'] = $('#filter-method').val().join();

	console.log('param',param)
	$('#div_loading').show()
	$('#div_preview').hide()
	apiService.SendRequest('GET',self.service_access_log,param,srvMeta.previewDataTables)
}

/**
*put data on data table.
*
*@param {json} data Json data from service.
*/
srvMeta.previewDataTables = function(data){
	var self = srvMeta; //initial data
	obj_data = data; //monitor data

	$('#div_loading').hide();
	$('#div_preview').show();

	self.dataTable.clear();

	if ( JH.GetJsonValue(data , "result") != "OK"){ return false; }
	self.dataTable.rows.add( JH.GetJsonValue(data , "data") );
	self.dataTable.draw();

}

/**
*put data on column access time.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} access_time
*/
srvMeta.renderAccess_time = function(row){
	return JH.GetJsonValue(row, 'access_time')
}

/**
*put data on column agent user.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} agent_user
*/
srvMeta.renderAgent_user = function(row){
	return JH.GetJsonValue(row, 'agent_user')
}

/**
*put data on column user.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} user
*/
srvMeta.renderUser = function(row){
	return JH.GetJsonValue(row, 'user')
}

/**
*put data on column servier agent user.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} server_agent_user
*/
srvMeta.renderServer_agent_user = function(row){
	return JH.GetJsonValue(row, 'server_agent_user')
}

/**
*put data on column service.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} service
*/
srvMeta.renderService = function(row){
	return JH.GetJsonValue(row, 'service')
}

/**
*put data on column method.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} service_method
*/
srvMeta.renderService_method = function(row){
	return JH.GetJsonValue(row, 'service_method')
}

/**
*put data on column host.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} host
*/
srvMeta.renderHost = function(row){
	return JH.GetJsonValue(row, 'host')
}

/**
*put data on column host.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} client_ip
*/
srvMeta.renderClient = function(row){
	return JH.GetJsonValue(row, 'client_ip')
}

/**
*put data on column request url.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} request_url
*/
srvMeta.renderRequest_url = function(row){

	return JH.GetJsonValue(row, 'request_url')
}

/**
*put data on column access dulation.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} access duration with comma
*/
srvMeta.renderAccess_duration = function(row){
	var time = JH.GetJsonValue(row, 'access_duration');
	time /=(1000000000);
	return time.toFixed(2);
}

/**
*put data on column reply code.
*
*@param {json} row Json data of each row on data table.
*
*@return {text} access duration with comma
*/
srvMeta.renderRely_code = function(row){
	return JH.GetJsonValue(row, 'reply_code');
}



/**
*Default value of start and end date filter.
*
*/
srvMeta.gen_filter_date = function(rs){
	var date_range = parseInt(rs.data.date_range); //date range
	$('#filter_startdate,#filter_enddate').val(datetime)
}
