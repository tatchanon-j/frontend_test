<?php
namespace App\Http\Controllers\Backoffice;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;

/**
* Admin pages controller
*
* @category PHP
* @package frontend-system-report
* @author CIM Systems (Thailand) <cim@cim.co.th>
* @license HAII
* @link NULL
*
*/
class Data_managementController extends BaseController
{

    /**
    * Admin home page
    *
    * @param \Illuminate\Http\Request $request
    */
    public function index(Request $request)
    {
        return redirect('backoffice/data_management/monitor_data');
    }

    /**
    * Admin/Group home page
    *
    * @param \Illuminate\Http\Request $request
    */
    public function monitor_data(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/monitor_data");
    }
    public function check_data_error(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/check_data_error");
    }
    public function check_latest_data(Request $request)
    {
        $station_id = isset($_GET['station_id']) ? $_GET['station_id'] : "" ;
        $data_type = isset($_GET['data_type']) ? $_GET['data_type'] : "" ;
        $date = isset($_GET['date']) ? $_GET['date'] : "" ;
        return ViewHelper::getInstance()->view("backoffice/data_management/check_latest_data",
        compact('station_id','data_type','date'));
    }
    public function check_metadata(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/check_metadata");
    }
    public function error_data(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/error_data");
    }
    public function import_data(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/import_data");
    }
    public function mon_error_dgmt(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/mon_error_dgmt");
    }
    public function record_data(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/record_data");
    }
    public function record_error_data(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_management/record_error_data");
    }
}
