/**
*
*   Main JS application file for report import page.
*		This file is control the options and display data.
*
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/

var ri = {} //initial data


/**
* prepare data
*
* @param {json} translator Text for use on page
*
* @return text
*/
ri.init = function(translator) {
	ri.translator = translator; ////Text for label and message on java script

	/* Event on click preview button */
	$( "#btn_preview" ).click(function() {
		ri.btnPreviewClick()
	});

	$("#filter_date").datepicker('setDate', new Date());
	$('#filter_start_time,#filter_end_time').datetimepicker({
		// disabledDates: true,
		format: 'HH:mm'
	});

	$("#btn_print").on("click", ri.btnPrintClick);
}



/**
* open print preview on new windows
*
*/
ri.btnPrintClick = function(){
	var frm = $('#form_import'); //element form import
	var starttime = $('#filter_start_time').val(); //start time
	var endtime = $('#filter_end_time').val(); //end time
	var filter_date = $('#filter_date').val(); //filter date

	/* validate filter  */
	if(starttime > endtime || !starttime || !endtime || !filter_date){
		bootbox.alert({
			message : ri.translator['msg_err_filter_time'],
			buttons : {
				ok : {
					label : ri.translator['btn_close']
				}
			}
		});
		return false
	}


	frm.parsley().validate();
	if(!frm.parsley().isValid()){
		$('ul.parsley-errors-list').remove()
		bootbox.alert({
			message : ri.translator['msg_err_filter_required'],
			buttons : {
				ok : {
					label	: ri.translator['btn_close']
				}
			}
		})

		return false
	}

	var date = $('#filter_date').val().replace(/\//g,'-'); //date
	var param = "filter_date="+ date +
	"&filter_start_time="+ $('#filter_start_time').val()+
	"&filter_end_time="+ $('#filter_end_time').val(); //parameter

	window.open(_URL_ + "?" + param , '_blank');
}
