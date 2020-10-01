<?php
namespace App\Http\Controllers\Backoffice;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;

/**
 * Home (First Page)
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class bof_data_serviceController extends BaseController
{

    /**
     * Home page
     *
     * @param Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
            return ViewHelper::getInstance()->view("frontoffice/data_service/data_service");
    }
    public function history(Request $request)
    {
            return ViewHelper::getInstance()->view("frontoffice/data_service/history");
    }
}
