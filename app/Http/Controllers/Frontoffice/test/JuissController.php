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
* @author Nutthawut Paleegui <nutthawut@haii.or.th>
* @license HAII
* @link NULL
*
*/
class JuissController extends BaseController
{

    /**
    * test page
    *
    * @param Illuminate\Http\Request $request
    */
    public function show(Request $request)
    {
		$name = "phone";
        return ViewHelper::getInstance()->view("frontoffice/test/juiss", compact("name"));
    }

}
