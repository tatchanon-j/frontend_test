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
 * @author HAII <manorot@haii.or.th>
 * @license HAII
 * @link NULL
 *
 */
class KmController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function index(Request $request)
    {
        return ViewHelper::getInstance()->view("backoffice/km/index");
    }
}
