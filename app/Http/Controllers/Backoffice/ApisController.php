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
class ApisController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('backoffice/apis/key_access_mgmt');
    }
    public function key_access_mgmt(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/apis/key_access_mgmt");
    }
    public function monitor(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/apis/monitor");
    }
    public function monitor_api_service(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/apis/monitor_api_service");
    }
    public function apitest(Request $request)
    {
        return ViewHelper::GetInstance()->view("backoffice/apis/apitest");
    }
    public function monitor_server(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/apis/monitor_server");
    }
    public function email_test(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/apis/email_test");
    }
}
