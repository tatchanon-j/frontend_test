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
class DashboardController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('backoffice/dashboad');
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function dashboard(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/dashboard");
    }
}
