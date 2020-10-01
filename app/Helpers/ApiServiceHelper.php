<?php
namespace App\Helpers;

use App\Helpers\LocaleHelper;

/**
 * Helper Class for API Server communication.
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class ApiServiceHelper
{

    /**
     * Singleton of the class ApiServiceHelper.
     *
     * @var ApiServiceHelper
     */
    static $theInstance;

    /**
     * API Agent secret key.
     * Get the vaue from env('API_APPKEY')
     *
     * @var array binary string.
     */
    private $AppKey;

    /**
     * API Service CSRF cookie name
     */
    const CSRF_COOKIE = 'API-CSRF';

    /**
     * API Service secret key size in bytes
     */
    const APPKEY_SIZE = 32;

    /**
     * API Service jwt token name
     */
    const AUTH_TOKEN_NAME = '_tk';

    const CSRF_PARAM_NAME = "_csrf";

    /**
     * session data key for login error code
     */
    const SESSION_LOGIN_ERROR = 'login-error';

    /**
     * session data key for account information
     */
    const SESSION_ACCOUNT_INFO = 'account-info';

    const SESSION_ACCOUNT_UPDATE_TIME = 'account-update-time';

    /**
     * session data key for login target URL
     */
    const SESSION_LOGIN_TARGET = 'login-target';

    /**
     * Login page URLL
     *
     * @var string
     */
    protected $loginUrl = 'backoffice/login';

    /**
     * Page to show after logout
     *
     * @var string
     */
    protected $logoutToUrl = 'backoffice/login';

    /**
     * User account information
     *
     * @var array
     */
    protected $accountInfo = null;

    public function __construct()
    {
        $k = env('API_APPKEY');
        $this->AppKey = hex2bin($k);
        if (strlen($this->AppKey) != self::APPKEY_SIZE) {
            throw new \Exception("Invalid API_APPKEY size");
        }
    }

    /**
     * Return singleton of the class
     *
     * @return App\Helpers\ApiServiceHelper
     */
    public static function getInstance()
    {
        if (self::$theInstance == null) {
            self::$theInstance = new ApiServiceHelper();
        }
        return self::$theInstance;
    }

    /**
     * Set and login and after logout URL
     *
     * @param string $login_url
     * @param string $logout_to_url
     */
    public function setAuthUrl($login_url, $logout_to_url)
    {
        $this->loginUrl = $login_url;
        $this->logoutToUrl = $logout_to_url;
    }

    /**
     * A function to be called from Middleware to handle API service authentication
     *
     * @param \Illuminate\Http\Request $request
     * @param function $next
     */
    public function middlewareHandler($request, $next)
    {
        $csrf = $request->cookie(self::CSRF_COOKIE);
        if ( isset($_SERVER['REQUEST_URI'])) {
          $target_url = $_SERVER['REQUEST_URI'];
        } else {
          $target_url = '';
        }

        if (empty($csrf)) {
            $l = LocaleHelper::getInstance();

            $request->session()->put(self::SESSION_LOGIN_TARGET, $target_url);
            return redirect($l->laravelUrl($this->loginUrl));
        } else {
            $this->accountInfo = $request->session()->get(
                self::SESSION_ACCOUNT_INFO);
            if ($this->accountInfo == NULL) {
                return $this->refreshAccountInfo($request,$target_url);
            }
        }

        return $next($request);
    }

    public function refreshAccountInfo($request,$target_url) {
         $api = self::getInstance();
         $service = 'auth/account-info';
         $l = LocaleHelper::getInstance();

         $request->session()->put(\App\Helpers\ApiServiceHelper::SESSION_ACCOUNT_UPDATE_TIME,time());

         if ( $target_url == "" && isset($_SERVER['HTTP_REFERER'])) {
            $target_url = $_SERVER['HTTP_REFERER'];
         }

         $params = new \stdClass();
         $params->lang = $l->getLocale();
         $params->url = $target_url;
         $params->csrf = $request->cookie(self::CSRF_COOKIE);

         $auth_token = $api->jwtEncode("GET", $service, $params);
         $url = env('API_SERVER') . '/' . $service . '?' .
                    self::AUTH_TOKEN_NAME . '=' . $auth_token .
                    '&' . self::CSRF_PARAM_NAME . '=' . $request->cookie(self::CSRF_COOKIE);
         return redirect($url);
    }

    /**
     * Encodes data with MIME base64 URL variant
     *
     * @param string $data
     * @return string
     */
    public function base64urlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decodes data encoded with MIME base64 URL variant
     *
     * @param string $data
     * @return string
     */
    public function base64urlDecode($data)
    {
        return base64_decode(
            str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=',
                STR_PAD_RIGHT));
    }

    /**
     * Calculate sha256 hmac hash of "$d" using API Service secret key
     *
     * @param string $d
     */
    public function hmacHash($d)
    {
        return hash_hmac('sha256', $d, $this->AppKey, true);
    }

    /**
     * Encode JWT token with env('API_APPID') as an issuer
     *
     * @param string $method
     *            request method "GET","PUT","POST","DELETE","PATCH"
     * @param string $service
     *            request service
     * @param mixed $params
     *            request parameters
     * @param int $exp
     *            unix timestamp for expire date
     * @param int $nbf
     *            unix timestamp for not-before date
     * @return string JWT token
     */
    public function jwtEncode($method, $service, $params = NULL, $exp = NULL,
        $nbf = NULL)
    {
        $h = '{"alg":"HS256","typ":"JWT"}';
        $d = array(
            'iss' => env('API_APPID'),
            'sub' => $service,
            'mth' => strtoupper($method)
        );
        if ($exp != NULL) {
            $d['exp'] = $exp;
        }
        if ($nbf != NULL) {
            $d['nbf'] = $nbf;
        }
        if ($params != NULL) {
            $d['dta'] = $params;
        }

        $ds = json_encode($d);

        $r = $this->base64urlEncode($h) . '.' . $this->base64urlEncode($ds);
        $hx = $this->hmacHash($r);
        $r .= '.' . $this->base64urlEncode($hx);

        return $r;
    }

    /**
     * Decode JWT token "$d"
     *
     * @param string $d
     * @return boolean|mixed return decoded JWT token or false if "$d" is an invalid token
     */
    public function jwtDecode($d)
    {
        $a = explode('.', $d, 3);
        if (count($a) != 3) {
            return false;
        }

        $h = json_decode($this->base64urlDecode($a[0]), false, 2);
        if (! isset($h->typ) || strcasecmp($h->typ, 'JWT') != 0 ||
             ! isset($h->alg) || strcasecmp($h->alg, 'HS256') != 0) {
            return false;
        }

        $hx = $this->hmacHash($a[0] . '.' . $a[1]);
        $hi = $this->base64urlDecode($a[2]);

        if (hash_equals($hx, $hi)) {
            return json_decode($this->base64urlDecode($a[1]));
        } else {
            return false;
        }
    }

    /**
     * Validate JWT token "$d" against "$method" and "$service"
     *
     * @param string $d
     *            JWT token
     * @param string $method
     *            request method
     * @param string $service
     *            request service
     * @return boolean true if token "$d" is valid
     */
    public function jwtValidate($d, $method, $service)
    {
        if (! ($data = $this->jwtDecode($d))) {
            return false;
        }

        if (! isset($data->sub) || $data->sub != $service || ! isset($data->mth) ||
             $data->mth != $method) {
            return false;
        }

        if (isset($data->exp) && $data->exp > 0 && $data->exp < time()) {
            return false;
        }

        if (isset($data->nbf) && $data->nbf > 0 && $data->nbf > time()) {
            return false;
        }

        if (isset($data->dta)) {
            return $data->dta;
        }
        return false;
    }

    /**
     * Set API service standard callback handler
     *
     * @param string $ctrl_prefix
     *            Handler name prefix
     */
    public static function setStdCallbackRoute($ctrl_prefix)
    {
        \Route::match(['get','post'],'/logout', $ctrl_prefix . 'Logout');
        \Route::match(['get','post'],'/login', $ctrl_prefix . 'Login');
        \Route::match(['get','post'],'/account-info', $ctrl_prefix . 'AccountInfo');
    }

    /**
     * API service login callback handler
     *
     * @param \Illuminate\Http\Request $request
     */
    public function httpCallbackLogin(\Illuminate\Http\Request $request)
    {
        $tk_name = self::AUTH_TOKEN_NAME;
        $params = $this->jwtValidate($request->input($tk_name), 'GET', 'login');

        if (! $params) {
            abort(422);
        }

        if (isset($params->csrf) && isset($params->account)) {
            $max_age = isset($params->csrf_maxage) ? $params->csrf_maxage : 0;

            $url = $this->setAccountInfo($request, $params);
            return redirect($url)->withCookie(
                cookie(self::CSRF_COOKIE, $params->csrf, $max_age / 60));
        } else {
            $lang = '';
            if (isset($params->req_dta) && isset($params->req_dta->lang)) {
                $lang = $params->req_dta->lang;
            }

            $request->session()->flash(self::SESSION_LOGIN_ERROR, $params);

            $url = LocaleHelper::getInstance()->laravelUrl($this->loginUrl,$lang);
            return redirect($url);
        }
    }

    /**
     * Save account information in "$params" from login callback response to session
     *
     * @param \Illuminate\Http\Request $request
     *            Laravel request information
     * @param mixed $params
     *            account information from API Service
     *            {
     *            "req_dta": {
     *            "url": login target URL
     *            "lang": login preferred language
     *            }
     *            "csrf": API service CSRF
     *            "csrf_maxage": API service session max age
     *            "account": {
     *            "account": login user account
     *            "full_name": login user full name
     *            "groups": list of effective user group names
     *            }}
     */
    public function setAccountInfo(\Illuminate\Http\Request $request, $params)
    {
        if (! isset($params)) {
            return "/";
        }

        if (isset($params->account)) {
            $account_info = $params->account;
            if (isset($account_info->groups)) {
                $gs = array();
                foreach ($account_info->groups as $g) {
                    $gs[$g] = true;
                }
                $account_info->groups = $gs;
            }

            $request->session()->put(self::SESSION_ACCOUNT_INFO, $account_info);
        }

        //Entrance to realm
        $url = '/backoffice';
        $lang = '';
        if (isset($params->req_dta)) {
            if (isset($params->req_dta->url) && is_string($params->req_dta->url)) {
                $url = $params->req_dta->url;
            }
            if (isset($params->req_dta->lang) &&
                 is_string($params->req_dta->lang)) {
                $lang = $params->req_dta->lang;
            }
        }
        $l = LocaleHelper::getInstance();
        return $l->laravelUrl($url, $lang);
    }

    /**
     * Generate JWT logout token
     *
     * @return string JWT logout token
     */
    public function getLogoutToken()
    {
        $l = LocaleHelper::getInstance();

        $params = new \stdClass();
        $params->lang = $l->getLocale();
        $params->csrf = \Request::cookie(self::CSRF_COOKIE);

        return $this->jwtEncode("POST", "auth/logout", $params);
    }

    /**
     * API service logout callback handler
     *
     * @param \Illuminate\Http\Request $request
     */
    public function httpCallbackLogout(\Illuminate\Http\Request $request)
    {
        $tk_name = self::AUTH_TOKEN_NAME;
        $params = $this->jwtValidate($request->input($tk_name), 'GET', 'logout');

        $lang = '';
        $csrf = '';
        if (isset($params->req_dta)) {
            if (isset($params->req_dta->lang)) {
                $lang = $params->req_dta->lang;
            }

            if (isset($params->req_dta->lang)) {
                $csrf = $params->req_dta->csrf;
            }
        }

        $l = LocaleHelper::getInstance();

        if ($csrf != '' && $csrf == $request->cookie(self::CSRF_COOKIE)) {
            $request->session()->flush();
            $url = $l->laravelUrl($this->logoutToUrl, $lang);

            return redirect($url)->withCookie(
                \Cookie::forget(self::CSRF_COOKIE));
        } else {
            $url = $l->laravelUrl($this->logoutToUrl, $lang);
            return redirect($url);
        }
    }

    /**
     * Return API service login user account information
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function getAccountInfo(\Illuminate\Http\Request $request = NULL)
    {
        if ($request == NULL) {
            $request = app('request');
        }

        return $request->session()->get(self::SESSION_ACCOUNT_INFO);
    }

    /**
     * API service get_account_information callback handler
     *
     * @param \Illuminate\Http\Request $request
     */
    public function httpCallbackAccountInfo(\Illuminate\Http\Request $request)
    {
        $tk_name = self::AUTH_TOKEN_NAME;
        $params = $this->jwtValidate($request->input($tk_name), 'GET',
            'account-info');

        $url = $this->setAccountInfo($request, $params);
        return redirect($url);
    }

    /**
     * Return true if login user is a member of "$group_name"
     *
     * @param string $group_name
     * @return boolean
     */
    public function isMemberOf($group_name)
    {
    	if ( $this->accountInfo == NULL || !isset($this->accountInfo->groups) ) {
    		return FALSE;
    	}
    	
    	//Check for wild card
    	if ( strpos($group_name,'*') === FALSE ) {
    		return isset($this->accountInfo->groups[$group_name]);
    	}  
    	
    	$p = str_replace('.', '\\.', $group_name);
    	$p = strtr($p, array(
    			'*' => '.*', // 0 or more (lazy) - asterisk (*)
    			'?' => '.', // 1 character - question mark (?)
    	));
    	    		    	   	    
    	foreach ($this->accountInfo->groups as $key => $value) {
    		if ( preg_match("/$p/", $key) ) {
    			return true;
    		}
    	}

        return false;
    }

    /**
     * Return true if login user is allow to access API service "$srv_name"
     *
     * @param string $srv_name
     *            * @return boolean
     */
    public function isAllowService($srv_name)
    {
    	$r = env("API_PERM_REALM");
    	if ( $r == "" ) {
    		$r = env("API_APPID");
    	}
        $perm_name = $r . '.srv.' . $srv_name;        
        return $this->isMemberOf($perm_name);
    }


    /**
     * Prune menu tree using login user service permission group
     *
     * @param array $menu
     *            full menu tree of the web site
     * @return array menu after pruned
     */
    public function filterServiceTree($menu)
    {
    	$r = array();

        foreach ($menu as $m) {
            // there is srv in menu? ---> for menu without submenu
        	if (isset($m['srv']) && !$this->isAllowService($m['srv'])) {
                continue;
            }                   

            if (isset($m['items']) && count($m['items']) > 0) {
                //Header menu
                // echo '<script>console.log("Header Menu")</script>';
                $items = $this->filterServiceTree($m['items']);
                $filterd_submenu = true;
            } else {
              // Submenu
                // echo '<script>console.log("Sub Menu")</script>';
                $items = array();
                $filterd_submenu = false;
            }

            $a = array();
            foreach ($m as $k => $v) {
                if ($k != 'items') {
                    $a[$k] = $v;
                } else {
                    if (count($items) > 0) {
                        $a['items'] = $items;
                    }
                }
            }

            if ( !$filterd_submenu || count($items) > 0  ) {
				$r[] = $a;
            }
        }
        return $r;
    }
}
