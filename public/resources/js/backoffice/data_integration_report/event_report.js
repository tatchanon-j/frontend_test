/**
*
*   Main JS application file for event report page.
*		This file is control the options and display data.
*   ES6
*   @author CIM Systems (Thailand) <cim@cim.co.th>
*   @license HAII
*
*/
let er = {}

/**
* Prepare data for page.
*
* @param {json} translator Text label.
*/
er.init = (translator) => {
    er.btn_display = $('#btn_display')
    er.filter_startdate = $('#filter_startdate')
    er.filter_agent = $('#filter_agent')
    er.filter_category = $('#filter_category')
    er.filter_event = $('#filter_event')
    er.Event = 'event'
    er.translator = translator
    er.serviceUrl = '/thaiwater30/backoffice/data_integration_report/event_report'

    er.filter_startdate.datepicker()
    er.filter_category.on('change', er.filterCategoryChange)
    er.btn_display.on('click', er.btnDisplayClick)

    er.tbl = $('#tbl').DataTable({
		dom : 'frltip',
		language : translator,
		columns : [
			{
				data :  'datetime'
			},
			{
				data :  'type',
			},
			{
				data :  'id',
			},
			{
				data :  'log_id',
			},
			{
				data :  'name',
			},
			{
				data :  'detail',
			},
		],
		order : [ [ 1, 'desc' ] ],
	})

    apiService.SendRequest("GET", er.serviceUrl + "_load", {}, er.initCallback)
}

//  เตรียม filter
er.initCallback = (rs) =>{
    if ( JH.GetJsonValue(rs, "result") != 'OK'){
        return false
    }
    let data = JH.GetJsonValue(rs, "data")
    let agent = JH.GetJsonValue(data, "agent")
    let event = JH.GetJsonValue(data, "event")
    JH.Set(er.Event, event)

    er.generateSelectOption(er.filter_agent, agent, {text: 'account', value: 'account'}, (d)=> JH.GetJsonValue(d, 'agent_type.value') == 3)
    er.generateSelectOption(er.filter_category, event, {text: 'code', value: 'id'})

    if ( event[0] ){
        er.filter_category.triggerHandler('change');
    }

    er.ReadyCallback()
}

//  filter category change
//  generate new filter_event
er.filterCategoryChange = () =>{
    let category = er.filter_category.val()
    let event = JH.Get(er.Event)
    let data

    for (let i = 0; i < event.length; i++){
        let e = event[i]
        if ( JH.GetJsonValue(e, 'id') == category ){
            data = e.subevent
        }
    }

    if ( data ){
        er.generateSelectOption(er.filter_event, data, {text: 'description', value: 'id'})
    }
}

// generate selec option from data
er.generateSelectOption = ($e, data, o = {text: 'text', value: 'id'}, isAdd = (d)=> true ) =>{
    if ( !$e instanceof jQuery ){
        return false
    }
    if ( !(JH.GetJsonValue(o, 'text') || JH.GetJsonValue(o, 'value')) ){
        // o ต้องมี text และ value
        return false
    }
    $e.empty()
    for (let i = 0; i < data.length; i++){
        let d = data[i]
        let text = JH.GetJsonLangValue(d, o.text)
        let value = JH.GetJsonLangValue(d, o.value)

        if ( isAdd(d) ){
            $e.append($("<option/>", {
                value: value,
                text: text
            }))
        }

    }
}

// ให้ดึงข้อมูลเลยตาม link ที่มาจาก email
er.ReadyCallback = ()=> {
    let qs = JH.QueryStringToJSON(window.location.search)

    let date = JH.GetJsonValue(qs, 'date')
    let agent = JH.GetJsonValue(qs, 'agent')
    let category = JH.GetJsonValue(qs, 'category')
    let event = JH.GetJsonValue(qs, 'event')

    if ( date ){
        er.filter_startdate.val(date)
    }
    if ( agent ){
        er.filter_agent.val(agent)
    }
    if ( category ){
        er.filter_category.val(category)
        er.filter_category.triggerHandler('change');
    }
    if ( event ){
        er.filter_event.val(event)
        er.btn_display.triggerHandler('click')
    }
}

//  กดปุ่ม display
//  ดึง service มาแสดงข้อมูลในตาราง
er.btnDisplayClick = () => {
    apiService.SendRequest("GET", er.serviceUrl, $('#frm').serialize(), (rs)=>{
        if ( JH.GetJsonValue(rs, "result") != "OK"){
            return false
        }
        let data = JH.GetJsonValue(rs, "data")
        er.tbl.clear();
    	er.tbl.rows.add(data);
    	er.tbl.draw();
    })
}
