<?php
namespace App\Http\Controllers\Frontoffice;

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
class AgencyController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return redirect('/agency/agency_summary');
    }

    /**
     * Admin/Group home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function agency_summary(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/agency/agency_summary");
    }
    public function agency_shopping(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/agency/agency_shopping");
    }
}
