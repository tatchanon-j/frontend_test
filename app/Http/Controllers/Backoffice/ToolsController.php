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
class ToolsController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('backoffice/tools/mgmt_cache');
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function mgmt_cache(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/mgmt_cache");
    }
    public function ignore_data(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/ignore_data");
    }
    public function check_image(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/check_image");
    }
    public function mgmt_display(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/mgmt_display");
    }
    public function compare_image(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/compare_image");
    }
    public function compare_transection(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/compare_transection");
    }
    public function compare_master(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/compare_master");
    }
    public function display_setting(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/display_setting");
    }
    // public function manage_one(Request $request)
    // {
    //     return ViewHelper::getInstance()->view("backoffice/tools/manage_one");
    // }
    // public function manage_two(Request $request)
    // {
    //     return ViewHelper::getInstance()->view("backoffice/tools/manage_two");
    // }
    public function blacklist(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/tools/blacklist");
    }
    public function manage_two(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/config_variable");
    }
}
