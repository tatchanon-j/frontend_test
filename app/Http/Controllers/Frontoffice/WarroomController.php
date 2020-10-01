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
class WarroomController extends BaseController
{

    /**
     * Admin home page
     *
     * @param \Illuminate\Http\Request $request
     */
    public function main()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/main");
    }

    public function home()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/home");
    }

    public function homeNight()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/home-night");
    }

    /**
     * show storm home page
     * @author   Weanika Chumjai <weanika@haii.or.th>
     * @return [type] [description]
     */
    public function stormEx()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/storm_ex");
    }

    public function storm()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/storm");
    }

    /**
     * [dam description]
     * @author   Thitiporn Meeprasert <thitiporn@haii.or.th>
     * @return [type] [description]
     */
    public function dam()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/dam");
    }

    /**
     * [dam test vue view]
     * @author   Thitiporn Meeprasert <thitiporn@haii.or.th>
     * @return [type] [description]
     */
    public function damVue()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/dam_vue");
    }

    /**
     * [salinity description]
     * @author   Thitiporn Meeprasert <thitiporn@haii.or.th>
     * @return [type] [description]
     */
    public function salinity()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/salinity");
    }

    /**
     * [rainfall description]
     * @author   Nutthawut Paleegui<nutthawut@haii.or.th>
     * @return [type] [description]
     */
    public function rainfall()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/rainfall");
    }
	
    public function rainfall24h()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/rainfall24h");
    }
	
	/**
     * show rainfall 24h home page
     * @author   Permporn Kuibumrung <permporn@haii.or.th>
     * @return [type] [description]
     */
	public function rainfall24hHome()
    {
		return ViewHelper::getInstance()->view("frontoffice/warroom/rainfall24h_home");
    }
	
	/**
     * show water level home page
     * @author   Permporn Kuibumrung <permporn@haii.or.th>
     * @return [type] [description]
     */
    public function waterlevel()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/waterlevel");
    }


	public function waterlevelHome()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/waterlevel_home");
    }

    /**
     * show dam home page
     * @author   Weanika Chumjai <weanika@haii.or.th>
     * @return [type] [description]
     */
    public function damHome()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/dam_home");
    }	


    /**
     * show rain-wrf home page
     * @author    <@haii.or.th>
     * @return [type] [description]
     */
    public function rain()
    {
        return ViewHelper::getInstance()->view("frontoffice/warroom/rain");
    }   
}
