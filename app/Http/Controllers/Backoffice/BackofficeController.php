<?php
namespace App\Http\Controllers\Backoffice;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;

/**
* Login page
*
* @category PHP
* @package frontend-system-report
* @author CIM Systems (Thailand) <cim@cim.co.th>
* @license HAII
* @link NULL
*
*/
class BackofficeController extends BaseController
{

    /**
    * Login page
    *
    * @param Illuminate\Http\Request $request
    * @return Illuminate\Http\Response
    */
    public function index(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/home");
    }


}
