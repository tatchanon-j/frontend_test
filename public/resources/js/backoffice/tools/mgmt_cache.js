/**
*
*   Main JS application file for management cache page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/


var srvData = {}; //initial data

/**
* prepare data
*
* @param {json} translator Text for use on page
*
*/
srvData.init = function(translator) {
	var self = srvData; //initial data
	self.translator	= translator; //Text for label and message on java script
	self.service_cache_list = 'cache/cache_list'; //service cache list

	self.groupTableId = 'tbl-mgmt-cache'; //id of table management cache
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
			data :  srvData.renderColumnName
		},
		{
			data :  srvData.renderColumnUpdateAt
		},
		{
			data :  srvData.renderColumnUpdateCount
		},
		{
			data :  srvData.renderColumnAccessCount
		},
		{
			data : srvData.renderColumnRegenCache,
			orderable : false,
			searchable : false,
		} ],
		order : [ [ 1, 'asc' ] ],
		rowCallback : self.dataTableRowCallback
	})

	self.dataTable.on('order.dt search.dt', function() {
		self.dataTable.column(0, {
			search : 'applied',
			order : 'applied'
		}).nodes().each(function(cell, i) {
			cell.innerHTML = i + 1;
		});
	}).draw();

	ctrl.on('click', '.btn-regen-cache',self.reGennearateCache)

	apiService.SendRequest('GET', self.service_cache_list, {}, self.disPlayCache)

}



/**
* generate data rows on data tabls
*
* @param {json} cache cache data
*/
srvData.disPlayCache = function(cache){
	var a = []; //array cache data

	srvData.dataTable.clear()
	if ( JH.GetJsonValue(cache , "result") != "OK"){ return false; }

	var data_cache = apiService.getFieldValue(cache,'data'); //initial cache data

	if(data_cache == null){return }

	for(var i=0; i<data_cache.length; i++){
		var data_c = data_cache[i]; //cache data
		if(data_c !== null){
			a.push(data_c);
		}
	}
	srvData.dataTable.rows.add(a);
	srvData.dataTable.draw()

}

/**
* put data into column name
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnName = function(row){
	return JH.GetJsonValue(row,'name')
}


/**
* put data into column latest update
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnUpdateAt = function(row){
	if ( !JH.GetJsonValue(row,'last_update') ){ return ''; }
	return moment(JH.GetJsonValue(row,'last_update')).format("YYYY-MM-DD HH:mm");
}


/**
* put data into column update count
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnUpdateCount = function(row){
	return JH.GetJsonValue(row,'update_count')
}


/**
* put data into column access count
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnAccessCount = function(row){
	return JH.GetJsonValue(row,'access_count')
}


/**
* create buton regenerate cache
*
* @param {json} row The data for the whole row
*/
srvData.renderColumnRegenCache = function(row){
	var s = '<i class="fa fa-refresh btn btn-regen-cache" data-key="'+row.name+'" title="Regenerate cache"></i>'
	return s
}



/**
* regenerate cache
*
*/
srvData.reGennearateCache = function(){
	var name_cache = $(this).attr('data-key')
	var srv = 'cache/cache_update/'+ name_cache

	var s = srvData.translator['msg_regen_cache_con'].replace('%s',name_cache)

	// Dialog box to comfirm generate key.
	bootbox.confirm({
		message: s,
		reorder: true,
		buttons: {
			confirm: {
				label: '<i class="fa fa-check"></i> ' +  srvData.translator['btn_confirm'],
				className: 'btn-success'
			},
			cancel: {
				label: '<i class="fa fa-times"></i> ' +  srvData.translator['btn_cancel'],
				className: 'btn-danger'
			}
		},
		callback: function (result) {
			if(result){
				apiService.SendRequest('PUT', srv, {},function(data, status, jqxhr){
					if (data["result"] == "NO"){
						bootbox.alert({
							message: srvData.translator['msg_regenerate_cache_fail'],
							buttons: {
								ok: {
									label: srvData.translator['btn_close']
								}
							}
						})
						return false;
					}

					bootbox.alert({
						message: srvData.translator['msg_regenerate_cache_success'],
						buttons: {
							ok: {
								label: srvData.translator['btn_close']
							}
						}
					})
					apiService.SendRequest('GET', srvData.service_cache_list, {}, srvData.disPlayCache)

				})
				return true
			}
		}
	});
}
