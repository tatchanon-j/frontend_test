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
class AdminController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect("backoffice/admin/group");
    }

    public function apitest(Request $request)
    {
        return ViewHelper::GetInstance()->view("backoffice/admin/apitest");
    }
    public function unittest(Request $request)
    {
        return ViewHelper::GetInstance()->view("backoffice/admin/unittest");
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function group(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/admin/group");
    }

    /**
     * Admin/User home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function user(Request $request,$uid = 0)
    {
        return ViewHelper::getInstance()->view("backoffice/admin/user",compact("uid"));
    }

    public function user_history(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/admin/user_history");
    }

    public function user_setting(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/admin/user_setting");
    }

    public function management_system(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/admin/management_system");
    }

    public function reset_password(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/admin/reset_password");
    }
}
