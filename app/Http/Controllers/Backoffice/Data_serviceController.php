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
class Data_serviceController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('/backoffice/data_service/data_service_to_agency');
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    // public function data_service_register(Request $request)
    // 
    //     return ViewHelper::getInstance()->view("backoffice/data_service/data_service_register");
    // }
    public function data_service_management(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_management");
    }
    public function data_service_summary(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_summary");
    }
    public function data_service_to_agency(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_to_agency");
    }
    public function data_service_upload_result(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_upload_result");
    }
    public function data_service_approve(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_approve");
    }
    public function data_service_to_agency_print($id = null)
    {
        if ( $id == null ){ return ViewHelper::getInstance()->view("errors/503"); }
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_to_agency_print" , compact('id'));
    }
    public function data_service_summary_print(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_summary_print" , $request->all());
    }
    public function data_service_admin(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_service/data_service_admin");
    }
}
