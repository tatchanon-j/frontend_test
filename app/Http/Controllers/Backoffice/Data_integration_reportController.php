<?php
namespace App\Http\Controllers\Backoffice;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;

/**
 * Admin pages controller
 *
 * @category PHP
 * @package frontend-system-data_integration_report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class Data_integration_reportController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('backoffice/data_integration_report/report_event');
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function report_event(Request $request)
    {
        $agency_id = isset($_GET['agency_id']) ? $_GET['agency_id'] : "" ;
        $event_log_category_id = isset($_GET['event_log_category_id']) ? $_GET['event_log_category_id'] : "" ;
        $event_code_id = isset($_GET['event_code_id']) ? $_GET['event_code_id'] : "" ;
        $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : "" ;
        $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : "" ;
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/report_event",
        compact('agency_id','event_log_category_id','event_code_id','start_date','end_date'));
    }
    public function report_import_by_year(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/report_import_by_year");
    }
    public function report_import_by_date(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/report_import_by_date");
    }
    public function report_import_by_month(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/report_import_by_month");
    }
    public function report_import(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/report_import");
    }
    public function report_import_print(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/report_import_print" , $request->all());
    }
    public function event_report(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/event_report");
    }
    public function metadata_report(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/metadata_report");
    }
    public function water_department(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration_report/water_department");
    }
}
