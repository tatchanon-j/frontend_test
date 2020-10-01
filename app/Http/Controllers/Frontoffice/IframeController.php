<?php
namespace App\Http\Controllers\Frontoffice;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;

/**
* Iframe (Modal Page)
*
* @category PHP
* @package frontend-system-report
* @author CIM Systems (Thailand) <cim@cim.co.th>
* @license HAII
* @link NULL
*
*/
class IframeController extends BaseController
{

    /**
    * Graph-dam page
    *
    * @param Illuminate\Http\Request $request
    */
    public function GraphDam(Request $request)
    {
        $dam_station = isset($_GET['dam']) ? $_GET['dam'] : "" ;
        $name = isset($_GET['name']) ? $_GET['name'] : "" ;
        return ViewHelper::getInstance()->view("frontoffice/iframe/graph-dam", compact('dam_station','name'));
    }
    public function GraphRain24Hr(Request $request)
    {
        $station = isset($_GET['station']) ? $_GET['station'] : "" ;
        $province = isset($_GET['province']) ? $_GET['province'] : "" ;
        $name = isset($_GET['name']) ? $_GET['name'] : "" ;
        return ViewHelper::getInstance()->view("frontoffice/iframe/graph-rain24", compact('station','province','name'));
    }
    public function GraphWaterLevel(Request $request)
    {
        $station = isset($_GET['station']) ? $_GET['station'] : "" ;
        $station_type = isset($_GET['station_type']) ? $_GET['station_type'] : "" ;
        $province = isset($_GET['province']) ? $_GET['province'] : "" ;
        $name = isset($_GET['name']) ? $_GET['name'] : "" ;
        return ViewHelper::getInstance()->view("frontoffice/iframe/graph-waterlevel", compact('station','station_type','province','name'));
    }
    public function graphWaterQuality(Request $request)
    {
        $station = isset($_GET['station']) ? $_GET['station'] : "" ;
        $province = isset($_GET['province']) ? $_GET['province'] : "" ;
        $name = isset($_GET['name']) ? $_GET['name'] : "" ;
        return ViewHelper::getInstance()->view("frontoffice/iframe/graph-waterquality", compact('station','province','name'));
    }
    public function splash(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/home/UserThailand");
    }
}
