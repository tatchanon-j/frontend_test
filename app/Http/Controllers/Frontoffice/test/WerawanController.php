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
* @author Werawan
* @license HAII
* @link NULL
*
*/
class WerawanController extends BaseController
{

    /**
    * test page
    *
    * @param Illuminate\Http\Request $request
    */
    public function werawan(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/test/werawan");
    }

}
