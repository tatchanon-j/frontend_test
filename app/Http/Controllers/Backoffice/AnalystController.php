<?php
namespace App\Http\Controllers\Backoffice;

use App\Helpers\ViewHelper;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

/**
 * Analyst pages controller
 *
 * @category PHP
 * @package frontend-system-report
 * @author HAII <rd-dev@haii.or.th>
 * @license HAII
 * @link NULL
 *
 */
class AnalystController extends BaseController {

	/**
	 * analyst home page
	 *
	 * @param \Illuminate\Http\Request $request
	 */
	public function index(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/analyst/main");
	}
	/**
	 * [analystDam dam page for analyst by thitiporn]
	 * @param  Request $request [description]
	 * @return [type]           [description]
	 */
	public function analystDam(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/analyst/dam");
	}

	/**
	 * graph dam compare
	 *
	 * @author    Peerapong srisom <peerapong@haii.or.th>
	 * @param Illuminate\Http\Request $request
	 */
	public function graphDam(Request $request)
	{
			$station = isset($_GET['station']) ? $_GET['station'] : "" ;
			$dam_size = isset($_GET['dam_size']) ? $_GET['dam_size'] : "" ;
			$graphtype = isset($_GET['graphtype']) ? $_GET['graphtype'] : "yearly";
			if($dam_size == '2') $graphtype = 'medium';
			return ViewHelper::getInstance()->view("backoffice/analyst/iframe/graph-dam-{$graphtype}", compact('station','dam_size'));
	}

	/**
	 * rain page
	 *
	 * @param Illuminate\Http\Request $request
	 */
	public function rain(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/analyst/rain");
	}

	/**
	 * graph rain
	 * @author    Werawan Prongpanom<werawan@haii.or.th>
	 * @return [type] [description]
	 */
	public function graphRain(Request $request) {
		$station = isset($_GET['station']) ? $_GET['station'] : "";
		$province = isset($_GET['province']) ? $_GET['province'] : "";
		$name = isset($_GET['name']) ? $_GET['name'] : "";
		$tab = isset($_GET['tab']) ? $_GET['tab'] : "";
		return ViewHelper::getInstance()->view("backoffice/analyst/iframe/graph_rain", compact('station', 'province', 'name', 'tab'));
	}

	/**
	 * waterlevel page
	 *
	 * @param Illuminate\Http\Request $request
	 */
	public function waterlevel(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/analyst/waterlevel");
	}

	/**
	 * graph waterlevel
	 * @author    Werawan Prongpanom<werawan@haii.or.th>
	 * @return [type] [description]
	 */
	public function graphWaterlevel(Request $request) {
		$station = isset($_GET['station']) ? $_GET['station'] : "";
		$province = isset($_GET['province']) ? $_GET['province'] : "";
		$name = isset($_GET['name']) ? $_GET['name'] : "";
		$tab = isset($_GET['tab']) ? $_GET['tab'] : "";

		return ViewHelper::getInstance()->view("backoffice/analyst/iframe/graph_waterlevel", compact('station', 'province', 'name', 'tab'));
	}

	/**
	 * waterquality page
	 *
	 * @author    Peerapong srisom <peerapong@haii.or.th>
	 * @param Illuminate\Http\Request $request
	 */
	public function waterQuality(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/analyst/waterquality");
	}

	/**
	 * graph waterquality compare station
	 *
	 * @author    Peerapong srisom <peerapong@haii.or.th>
	 * @param Illuminate\Http\Request $request
	 */
	public function graphWaterQuality(Request $request)
	{
			$station = isset($_GET['station']) ? $_GET['station'] : "" ;
			$province = isset($_GET['province']) ? $_GET['province'] : "" ;
			$name = isset($_GET['name']) ? $_GET['name'] : "" ;
			$graphtype = isset($_GET['graphtype']) ? $_GET['graphtype'] : "station";
			return ViewHelper::getInstance()->view("backoffice/analyst/iframe/graph-waterquality-compare{$graphtype}", compact('station','province','name'));
	}

	/**
	 * weather image
	 *
	 * @author    Peerapong srisom <peerapong@haii.or.th>
	 * @param Illuminate\Http\Request $request
	 */
	public function weather(Request $request)
	{
			return ViewHelper::getInstance()->view("backoffice/analyst/weather");
	}

}
