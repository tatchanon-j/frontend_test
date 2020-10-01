<?php
namespace App\Http\Controllers\Frontoffice\test;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;

/**
* test page
*
* @category PHP
* @package frontend-system-report
* @author CIM Systems (Thailand) <cim@cim.co.th>
* @license HAII
* @link NULL
*
*/
class PoController extends BaseController
{

    /**
    * test page
    *
    * @param Illuminate\Http\Request $request
    */
    public function po(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/test/po");
    }

}
