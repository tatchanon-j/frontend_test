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
 * @author
 * @license HAII
 * @link NULL
 *
 */
class ExSvgController extends BaseController
{

    /**
     * Test cpy.
     *
     * @param \Illuminate\Http\Request $request
     */
    public function cpy()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/ex_cpy");
    }

    public function cpyDatas() 
    {
        $cpy_datas = array(
                        array("station_id" => "CPY015", "status_color" => "pink"),
                        array("station_id" => "CPY014", "status_color" => "white"),
                        array("station_id" => "CPY011", "status_color" => "orange"),
                        array("station_id" => "CPY006", "status_color" => "pink"),
                        array("station_id" => "CPY001", "status_color" => "purple"),
                        array("station_id" => "CHM001", "status_color" => "orange"),
                        array("station_id" => "NAN003", "status_color" => "white"),
                        array("station_id" => "NAN004", "status_color" => "pink"),
                        array("station_id" => "NAN007", "status_color" => "purple"),
                        array("station_id" => "WAN001", "status_color" => "pink")
                     );

        return response()->json($cpy_datas);
    }
	
	public function swan()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/swan");
    }
	
	public function swanDatas() 
    {
        $swan_datas = array(
                        array("id" => "path5215", "status_color" => "pink"),
                        array("id" => "path5217", "status_color" => "green"),
                        array("id" => "path5223", "status_color" => "orange"),
                        array("id" => "path5225", "status_color" => "purple")
                     );

        return response()->json($swan_datas);
    }
}
