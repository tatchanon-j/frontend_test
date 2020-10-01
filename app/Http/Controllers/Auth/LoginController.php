<?php
namespace App\Http\Controllers\Auth;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ApiServiceHelper;
use App\Helpers\ViewHelper;
use App\Helpers\LocaleHelper;

/**
 * Login page
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class LoginController extends BaseController
{

    /**
     * Login page
     *
     * @param Illuminate\Http\Request $request
     * @return Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $api = ApiServiceHelper::getInstance();

        $target_url = $request->session()->get(
            ApiServiceHelper::SESSION_LOGIN_TARGET);

        $tk_name = ApiServiceHelper::AUTH_TOKEN_NAME;
        $params = $api->jwtValidate($request->input($tk_name), 'GET', 'login');
        if (isset($params->url) && is_string($params->url)) {
            $target_url = $params->url;
        }

        $in_params = $request->session()->get(
            ApiServiceHelper::SESSION_LOGIN_ERROR);
        if (isset($in_params->req_dta) && isset($in_params->req_dta->url)) {
            $target_url = $in_params->req_dta->url;
        }

        if (isset($in_params->captcha_key)) {
            $captcha_key = $in_params->captcha_key;
        } else {
            $captcha_key = '';
        }

        if (isset($in_params->err)) {
            $error_code = $in_params->err;
        } else {
            $error_code = '';
        }

        if (isset($in_params->error_info)) {
			$error_info = $in_params->error_info;
        } else {
			$error_info = null;
        }

        if (isset($in_params->account)) {
            $user_name = $in_params->account;
        }  else {
            $user_name = '';
        }

		if (isset($in_params->resetpassword_key) ) {
			$resetpassword_key = $in_params->resetpassword_key;
		} else {
			$resetpassword_key = "";
		}
		if ($resetpassword_key != "") {
			$request->session()->reflash(ApiServiceHelper::SESSION_LOGIN_ERROR);
		}

        $params = new \stdClass();

        if (! empty($target_url) && $target_url != '/') {
            $params->url = $target_url;
        }
        $l = LocaleHelper::getInstance()->urlGetLocale();
        if (! empty($l)) {
            $params->lang = $l;
        }

		$hard_error = in_array($error_code,
            array(
                'E005',
                'E006',
                'E007'
            ));

        $service = 'auth/login';
        $apilogin_url = env('API_SERVER') . '/' . $service;
        $auth_token = $api->jwtEncode("POST", $service, $params);

        return ViewHelper::getInstance()->view("auth/login",
            compact('apilogin_url', 'captcha_key', 'error_code', 'auth_token',
                'hard_error','resetpassword_key','user_name','error_info'));
    }

    /**
     * API Server callback when user logout
     *
     * @param Illuminate\Http\Request $request
     * @return Illuminate\Http\Response
     */
    public function callbackLogout(Request $request)
    {
        return ApiServiceHelper::getInstance()->httpCallbackLogout($request);
    }

    /**
     * API Server callback when user login
     *
     * @param Illuminate\Http\Request $request
     * @return Illuminate\Http\Response
     */
    public function callbackLogin(Request $request)
    {
        return ApiServiceHelper::getInstance()->httpCallbackLogin($request);
    }

    /**
     * API Server callback when request account information
     *
     * @param Illuminate\Http\Request $request
     * @return Illuminate\Http\Response
     */
    public function callbackAccountInfo(Request $request)
    {
        return ApiServiceHelper::getInstance()->httpCallbackAccountInfo(
            $request);
    }

    public function refreshAccountInfo(Request $request)
    {
        return ApiServiceHelper::getInstance()->refreshAccountInfo(
            $request,"");
    }
}
