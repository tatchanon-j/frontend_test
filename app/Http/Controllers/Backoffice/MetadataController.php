<?php
namespace App\Http\Controllers\Backoffice;

use App\Helpers\ViewHelper;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;

/**
 * Admin pages controller
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class MetadataController extends BaseController {

	/**
	 * Admin home page
	 *
	 * @param \Illuminate\Http\Request $request
	 */
	public function index(Request $request) {
		return redirect('backoffice/metadata/summary_meta');
	}
	public function metadata(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/metadata");
	}
	public function metadata_b(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/metadata_b");
	}
	public function category(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/category");
	}
	public function subcat(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/subcat");
	}
	public function agency(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/agency");
	}
	public function department(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/department");
	}
	public function frequency(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/frequency");
	}
	public function ministry(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/ministry");
	}
	public function hydroinfo(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/hydroinfo");
	}
	public function service_method(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/service_method");
	}
	public function unit(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/unit");
	}
	public function summary_meta(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/summary_meta");
	}
	public function method(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/method");
	}
	public function data_format(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/data_format");
	}
	public function metadata_status(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/metadata_status");
	}
	public function metadata_show(Request $request) {
		return ViewHelper::getInstance()->view("backoffice/metadata/metadata_show");
	}
}
