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
class Data_integrationController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('backoffice/data_integration/hi_script');
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function hi_script(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/hi_script");
    }
    public function mgmt_script(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/mgmt_script");
    }
    public function mgmt_conv(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/mgmt_conv");
    }
    public function mgmt_metadata(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/mgmt_metadata");
    }



    public function hi_script_rain(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/hi_script_rain");
    }
    public function mgmt_script_rain(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/mgmt_script_rain");
    }
    public function mgmt_conv_rain(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/mgmt_conv_rain");
    }
    public function mgmt_metadata_rain(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/mgmt_metadata_rain");
    }
    public function compare_image(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/compare_image");
    }
    public function compare_transection(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/compare_transection");
    }
    public function compare_master(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/compare_master");
    }
    public function mgmt_cron(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/mgmt_cron");
    }
    public function cron_setting(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/cron_setting");
    }
    public function config_variable(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/data_integration/config_variable");
    }
}
