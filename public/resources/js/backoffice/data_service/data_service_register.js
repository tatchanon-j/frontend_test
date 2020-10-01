/**
*
*   srvData Object for handler data service management page.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
var srvData = {}

/**
*   Initial srvData
*   @param {object} trans - translate object from laravel
*/
srvData.init = function(trans) {
	var self = srvData

	self.groupTableId = 'tbl-record-err-data'
	ctrl = $('#' + self.groupTableId)
	self.dataTable = ctrl.DataTable({
		dom : 'frltip',
		language : g_dataTablesTranslator,
		columns : [
		{
			data :  '',
		},{
			data : ''
		},
		{
			data :  '',
		},
		{
			data : '',
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

}
