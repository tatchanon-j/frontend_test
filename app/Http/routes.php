<?php
/*
 * |--------------------------------------------------------------------------
 * | Application Routes
 * |--------------------------------------------------------------------------
 * |
 * | Here is where you can register all of the routes for an application.
 * | It's a breeze. Simply tell Laravel the URIs it should respond to
 * | and give it the controller to call when that URI is requested.
 * |
 */
use App\Helpers\ApiServiceHelper;
use App\Helpers\LocaleHelper;

$l = LocaleHelper::getInstance();

if ($l->urlRedirectLocale()) {
	exit(0);
}

$l->urlSetLocale();

$api = ApiServiceHelper::getInstance();
$api->setAuthUrl('/login', '/login');

// login
Route::group([
	'prefix' => $l->urlGetLocale(),
], function () {
	$path = app_path() . '/Http/Routes/Frontoffice';
	$dir = new DirectoryIterator($path);
	foreach ($dir as $file) {
		//printf($file);
		if ($file != '.' && $file != '..') {
			$filename = $path . '/' . $file->getFilename();
			if (file_exists($filename)) {
				require_once $filename;
			}
		}
	} //end foreach

	$path = app_path() . '/Http/Routes/test';
	$dir = new DirectoryIterator($path);
	foreach ($dir as $file) {
		//printf($file);
		if ($file != '.' && $file != '..') {
			$filename = $path . '/' . $file->getFilename();
			if (file_exists($filename)) {
				require_once $filename;
			}
		}
	} //end foreach

	// $path = app_path() . '/Http/Routes/Backoffice';
	// $dir = new DirectoryIterator($path);
	// foreach ($dir as $file) {
	// 	if ($file != '.' && $file != '..') {
	// 		$filename = $path . '/' . $file->getFilename();
	// 		if (file_exists($filename)) {
	// 			require_once $filename;
	// 		}
	// 	}
	// }

	// หน้าหลักสำหรับผู้ใช้งานทั่วไป
	Route::get('/', 'Frontoffice\HomeController@splash');
	Route::get('/index2', 'Frontoffice\HomeController@splash');
	Route::get('/main', 'Frontoffice\HomeController@main');
	Route::get('/about', 'Frontoffice\HomeController@about');
	Route::get('/contactus', 'Frontoffice\HomeController@contactus');
	Route::get('/proxy', 'Frontoffice\ProxyController@getData');

	// กราฟแต่ละส่วน ในหน้า main
	Route::get('/iframe/graph/dam', 'Frontoffice\IframeController@GraphDam');
	Route::get('/iframe/graph/rain24', 'Frontoffice\IframeController@GraphRain24Hr');
	Route::get('/iframe/graph/waterlevel', 'Frontoffice\IframeController@GraphWaterLevel');
	Route::get('/iframe/graph/waterquality', 'Frontoffice\IframeController@GraphWaterQuality');

	Route::get('/login', 'Auth\LoginController@index');
	// apidocs
	Route::get('/api-docs/agent', 'Common\APIDocsController@agent');
	Route::get('/api-docs/public', 'Common\APIDocsController@publicapi');
	Route::get('/api-docs/dataservice', 'Common\APIDocsController@dataservice');
	Route::get('/api-docs/provinces', 'Common\APIDocsController@provinces');
	Route::get('/api-docs/{docname}', 'Common\APIDocsController@test');
	Route::get('/api-docs', 'Common\APIDocsController@index');

	// list file จาก ให้บริการข้อมูลที่ apiserver ส่งมา
	Route::get('/api_service/{folder}', 'Frontoffice\DataServiceController@getFile');
	// download file ให้บริการข้อมูล
	Route::get('/api_service/{folder}/{file}', 'Frontoffice\DataServiceController@getFile');
	// apiservice upload ไฟล์ให้บริการข้อมูลมาที่ เครื่อง web
	Route::post('/data_service/upload', 'Frontoffice\DataServiceController@postUpload');
	// ไม่ได้ใช้ ใช้สำหรับลบไฟล์ที่หมดอายุของให้บริการข้อมูล
	// Route::get('/data_service/check', 'Frontoffice\DataServiceController@check');
});
// Other locale page
Route::group(
	[
		'prefix' => $l->urlGetLocale(),
		'middleware' => 'api.auth',
	],
	function () {
		// ให้บริการข้อมูล
		Route::get('/data_service', 'Frontoffice\DataServiceController@index');
		Route::get('/data_service/history', 'Frontoffice\DataServiceController@history');

		// หน่วยงานภายนอก
		Route::get('/agency', 'Frontoffice\AgencyController@index');
		Route::get('/agency/agency_summary', 'Frontoffice\AgencyController@agency_summary');
		Route::get('/agency/agency_shopping', 'Frontoffice\AgencyController@agency_shopping');

		Route::get('/api-docs/webservice', 'Common\APIDocsController@webservice');
	}
);
// Other backoffice page
Route::group(
	[
		'prefix' => $l->urlGetLocale() . "/backoffice",
		'middleware' => 'api.auth',
	],
	function () {
		$path = app_path() . '/Http/Routes/Backoffice';
		$dir = new DirectoryIterator($path);
		foreach ($dir as $file) {
			//printf($file);
			if ($file != '.' && $file != '..') {
				$filename = $path . '/' . $file->getFilename();
				if (file_exists($filename)) {
					require_once $filename;
				}
			}
		} //end foreach
		Route::get('/', 'Backoffice\BackofficeController@index');
		Route::get('/logout', 'Auth\LoginController@logout');
		Route::get('/refresh-account-info', 'Auth\LoginController@refreshAccountInfo');
	}
);

// API Server callback
Route::group(
	[
		'prefix' => 'apicb',
	],
	function () {
		ApiServiceHelper::SetStdCallbackRoute(
			'Auth\LoginController@callback'
		);
		\Route::get(
			'/activate-account/{uid}',
			function ($uid) {
				return redirect("/backoffice/admin/user/" . $uid);
			}
		);
	}
);

// igis test page by manorot
Route::get('/igis', function () {
	return View::make('production.map');
});

// download file Datas Warning by permporn
Route::get('/dowload_datas_warning', 'Frontoffice\HomeController@downloafileDatasWarning');
Route::get('/cityplan', 'Frontoffice\HomeController@cityPlan');

// disaster form page by peerapong
Route::group(
	[
		'middleware' => 'api.disaster.auth',
	],
	function () {
		Route::get('/disaster', 'Frontoffice\DisasterController@disasterWarning');
		Route::get('/disaster/index', 'Frontoffice\DisasterController@index');
		Route::post('/disaster/del', 'Frontoffice\DisasterController@del');
		Route::post('/disaster/add', 'Frontoffice\DisasterController@add');
		Route::get('/disaster/logout', function () {
			return Redirect::to(preg_replace("/:\/\//", "://log-me-out:fake-pwd@", url('disaster/logout')));
		});
	}
);

Route::get('/disaster/list', 'Frontoffice\DisasterController@index');
