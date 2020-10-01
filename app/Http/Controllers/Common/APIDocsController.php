<?php
namespace App\Http\Controllers\Common;

use App\Helpers\ViewHelper;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

/**
 * APIDocs page
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class APIDocsController extends BaseController {
	public function index(Request $request) {
		return ViewHelper::getInstance()->view("api-docs/index");
	}

	public function webservice(Request $request) {
		$doc_name = "webservice";
		return ViewHelper::getInstance()->view("api-docs/docs", compact("doc_name"));
	}

	public function agent(Request $request) {
		$doc_name = "agent";
		return ViewHelper::getInstance()->view("api-docs/docs", compact("doc_name"));
	}

	public function publicapi(Request $request) {
		$doc_name = "public";
		return ViewHelper::getInstance()->view("api-docs/docs", compact("doc_name"));
	}

	public function dataservice(Request $request) {
		$doc_name = "dataservice";
		return ViewHelper::getInstance()->view("api-docs/docs", compact("doc_name"));
	}

	public function provinces(Request $request) {
		$doc_name = "provinces";
		return ViewHelper::getInstance()->view("api-docs/docs", compact("doc_name"));
	}

	public function test(Request $request, $docname) {
		$doc_name = $docname;
		return ViewHelper::getInstance()->view("api-docs/docs", compact("doc_name"));
	}
}
