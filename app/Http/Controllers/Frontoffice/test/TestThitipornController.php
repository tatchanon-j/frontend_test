<?php
namespace App\Http\Controllers\Frontoffice\Test;

use App\Helpers\ViewHelper;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

/**
 * test controller
 *
 * @category PHP
 * @package thaiwater30
 * @author Thitiporn Meeprasert <thitiporn@haii.or.th>
 * @license HAII
 * @link NULL
 *
 */
class TestThitipornController extends BaseController {

	/**
	 * test page
	 *
	 * @param Illuminate\Http\Request $request
	 */
	public function index(Request $request) {
		$name = 'thitiporn';
		return ViewHelper::getInstance()->view("frontoffice/test/thitiporn", compact('name'));
	}

}
