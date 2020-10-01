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
class Event_managementController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('backoffice/event_management/event_type');
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function event_type(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/event_type");
    }
    public function event_mail(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/event_mail");
    }
    public function event_method(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/event_method");
    }
    public function event_target(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/event_target");
    }
    public function event_subtype(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/event_subtype");
    }
    public function sink_condition(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/sink_condition");
    }
    public function event_log_sink_method_type(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/event_log_sink_method_type");
    }
    public function event_mgmt_email_sever(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/event_management/event_mgmt_email_sever");
    }



}
