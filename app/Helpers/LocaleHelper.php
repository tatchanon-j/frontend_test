<?php
namespace App\Helpers;

use App\Helpers\ViewHelper;

/**
 * Helper Class for handle multiple language site.
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class LocaleHelper
{

    /**
     * List of valid locales.
     * Generate from env('SITE_LOCALES')
     *
     * @var array
     */
    protected $validLocales;

    /**
     * Default locale code.
     * Get the value from env('SITE_LOCALE_DEFAULT')
     * The helper will use this locale if no locale was specified
     *
     * @var string
     */
    protected $defaultLocale;

    /**
     * Fallback locale code.
     * Get the vaue from env('SITE_LOCALE_FALLBACK')
     * The helper will use this locale if the require locale is not exist
     *
     * @var string
     */
    protected $fallbackLocale;

    /**
     * Known locales language name.
     * Any unknown locale with use locale code as a name
     *
     * @var array
     */
    protected static $langNames = array(
        'th' => 'ภาษาไทย',
        'en' => 'English',
        'jp' => '日本語'
    );

    /**
     * URL string for prepend in the front of each resource.
     * This variable can be set to empty string if the site was placed at the
     * root of web domain. Get the value from env('SITE_URLPREFIX')
     *
     * @var string
     */
    protected $urlPrefix;

    /**
     * Perl regular expression to capture locale code from URL
     *
     * @var string
     */
    const LOCALE_URL_PREG = '/^\/([a-z]{2}(?:\-[A-Z]{2}){0,1})((?:\/.*)|)$/';

    /**
     * Perl regular expression validate locale code
     *
     * @var string
     */
    const LOCALE_PREG = '/^([a-z]{2}(?:\-[A-Z]{2}){0,1})$/';

    /**
     * Singleton of the class LocaleHelper.
     *
     * @var ViewHelper
     */
    static $theInstance;

    public function __construct()
    {
        $this->validLocales = array();
        $locales = explode(',', env("SITE_LOCALES", "th"));
        
        foreach ($locales as $l) {
            if (! preg_match(self::LOCALE_PREG, $l)) {
                continue;
            }
            $n = isset(self::$langNames[$l]) ? self::$langNames[$l] : strtoupper(
                $l);

            $this->validLocales[$l] = $n;
        }

        $d = env('SITE_LOCALE_DEFAULT');
        if (isset($this->validLocales[$d])) {
            $this->defaultLocale = $d;
        } else {
            $d = config('app.locale');
            if (isset($this->validLocales[$d])) {
                $this->defaultLocale = $d;
            } else {
                reset($this->validLocales);
                $this->defaultLocale = key($this->validLocales);
            }
        }

        $this->fallbackLocale = '';
        $d = env('SITE_LOCALE_FALLBACK');
        if (isset($this->validLocales[$d])) {
            $this->fallbackLocale = $d;
        } else {
            $d = config('app.fallback_locale');
            if (isset($this->validLocales[$d])) {
                $this->fallbackLocale = $d;
            }
        }

        
        $this->urlPrefix = env('SITE_URLPREFIX', '');
    }

    /**
     * Return all valid locales
     *
     * @return array of valid locale codes
     */
    public function getAllLocales()
    {
        $item = implode(" ",array_keys($this->validLocales));
        echo '<script>console.log("'.$item.'")</script>';
        return array_keys($this->validLocales);
    }

    /**
     * Return singleton of the class
     *
     * @return App\Helpers\LocaleHelper
     */
    public static function getInstance()
    {
        if (self::$theInstance == null) {
            self::$theInstance = new LocaleHelper();
        }

        return  self::$theInstance;
    }

    /**
     * Remove $this->urlPrefix (if exists) from the URL
     *
     * @param string $url
     * @return string
     */
    public function urlStripPrefix($url)
    {
        // remove scheme/host/port/user because we expected that the url will come from
        // our host
        $a = parse_url($url);
        $url = '';
        if ( isset($a['path']) ) {
            $url = $a['path'];
        }
        if ( isset($a['fragment']) ) {
            $url .= '#' . $a['fragment'];
        }
        if ( isset($a['query']) ) {
            $url .= '?' . $a['query'];
        }

        if ($this->urlPrefix == '') {
            return $url;
        }
        $p = strpos($url, $this->urlPrefix);
        if ($p === false || $p > 0) {
            return $url;
        }
        $st = strlen($this->urlPrefix);
        if ($st >= strlen($url)) {
            return '';
        }
        return substr($url, $st);
    }

    /**
     * Redirect request to incorrect or non-existed locale code to the fallback
     * locale
     *
     * @return boolean "true" if the request is redirect using HTTP redirect
     */
    public function urlRedirectLocale()
    {
        if ( !isset($_SERVER['REQUEST_URI'])) {
          return false;
        }
        $uri = $this->urlStripPrefix($_SERVER['REQUEST_URI']);
        if ($uri == '') {
            return false;
        }

        $st = 0;
        if ($uri{0} == '/') {
            ++ $st;
        }

        $l = '';
        if (($p = strpos($uri, '/', $st)) === false) {
            $l = substr($uri, $st);
        } else {
            $l = substr($uri, $st, $p - $st);
        }

        if (! preg_match(self::LOCALE_PREG, $l)) {
            return false;
        }

        if ($l == $this->defaultLocale) {
            header("Location:" . $this->httpUrl());
            return true;
        }

        if (empty($this->fallbackLocale) || isset($this->validLocales[$l])) {
            return false;
        }

        header("Location:" . $this->httpUrl('', $this->fallbackLocale));
        return true;
    }

    /**
     * Remove locale code prefix (if exists) from the url
     *
     * @param string $url
     *            request URL
     * @param string $remove_params
     *            if "true" aso remove the request parameters
     *            in URL (?x=...)
     * @return string url without locale code prefix
     */
    public function urlStripLang($url = '', $remove_params = false)
    {
        if (empty($url)) {
            if ( !isset($_SERVER['REQUEST_URI'])) {
              return '';
            }
            $url = $_SERVER['REQUEST_URI'];
        }

        $url = $this->urlStripPrefix($url);
        if (preg_match(self::LOCALE_URL_PREG, $url, $a)) {
            $url = $a[2];
        }

        if ($remove_params && ($pos = strpos($url, '?')) !== false) {
            $url = substr($url, 0, $pos);
        }

        return $url;
    }

    /**
     * Clean up a URL by remove double slash (//) and tailing slash
     *
     * @param string $url
     * @return string
     */
    public function cleanUrl($url)
    {
        if ($url == '') {
            return $url;
        }

        $url = str_replace('//', '/', $url);
        if (substr($url, - 1) == '/' && $url != '/') {
            $url = substr($url, 0, strlen($url) - 1);
        }

        return $url;
    }

    /**
     * Generate URL with locale code prefix but without $this->urlPrefix for
     * use in laravel redirect
     *
     * @param string $url
     * @param string $lang
     * @return string
     */
    public function laravelUrl($url = '', $lang = '')
    {
        if ($lang == '') {
            $lang = $this->getLocale();
        }

        if ($lang == $this->defaultLocale) {
            $lang = '';
        }
        $url = $this->urlStripLang($url);

        if (empty($lang)) {
            $r = $url;
        } else {
            $r = '/' . $lang . '/' . $url;
        }

        return $this->cleanUrl($r);
    }

    /**
     * Generate URL with locale code prefix for
     * use in src attribue in HTML tag
     *
     * @param string $url
     * @param string $lang
     * @return string
     */
    public function httpUrl($url = '', $lang = '')
    {
        if ($lang == '') {
            $lang = $this->getLocale();
        }

        if ($lang == $this->defaultLocale) {
            $lang = '';
        }
        $url = $this->urlStripLang($url);

        if (empty($lang)) {
            $r = $this->urlPrefix . '/' . $url;
        } else {
            $r = $this->urlPrefix . '/' . $lang . '/' . $url;
        }

        return $this->cleanUrl($r);
    }

    /**
     * Set application locale from local code prefix in URL
     */
    public function urlSetLocale()
    {
        $l = \Request::segment(1);
        if (isset($this->validLocales[$l])) {
            \App::setLocale($l);
        }
    }

    /**
     * Return locale code if the application locale is not default locale
     * otherwise return local code.
     * This function is require because we don't show default locale in URL
     *
     * @return string
     */
    public function urlGetLocale()
    {
        if ($this->getLocale() == $this->defaultLocale) {
            return '';
        } else {
            return $this->getLocale();
        }
    }

    /**
     * Return application locale code
     *
     * @return string
     */
    public function getLocale()
    {
        return \App::getLocale();
    }

    /**
     * Set application locale code
     *
     * @param string $l
     */
    public function setLocale($l)
    {
        return \App::setLocale($l);
    }

    /**
     * Generate the language swithcher HTML code
     *
     * @param string $switcher_class
     *            CSS code for language switcher
     * @param string $msg
     *            Message to show after the swither
     * @return string HTML code for language switcher
     */
    public function buildSwitcher($switcher_class = '', $msg = '')
    {
        $view = ViewHelper::getInstance();

        if (count($this->validLocales) < 2) {
            return '';
        }

        $fp = env('SITE_LOCALE_FLAGS', '/resources/images/flags') . '/';

        $current_locale = $this->getLocale();
        if ($switcher_class != '') {
            $result = '<div class="' . $switcher_class . '">';
        } else {
            $result = '';
        }

        $result .= '<a href="#" class="dropdown-toggle"' .
             ' data-toggle="dropdown" aria-expanded="true">' .
             $view->resourceHTML('image', $fp . $current_locale . '.png') . $msg .
             '</a><ul class="dropdown-menu"  style="padding-left:20px;">';
        foreach ($this->validLocales as $l => $n) {
            if ($l == $current_locale) {
                $a = 'javascript:void();';
            } else {
                $a = $this->httpUrl('', $l);
            }
            $result .= '<li><a href="' . $a . '">' .
                 $view->resourceHTML('image', $fp . $l . '.png') . $n .
                 '</a></li>';
        }
        $result .= '</ul>';

        if ($switcher_class != '') {
            $result .= '</div>';
        }

        return $result;
    }

    /**
     * Return locale flag HTML img tag and name of the specified "$lang".
     * The flag must be stored in env('SITE_LOCALE_FLAGS') or
     * '/resources/images/flags' if SITE_LOCALE_FLAGS is not exists
     *
     * @param string $lang
     * @return mixed locale flag and name of locale "$lang" exists, otherwise false
     */
    public function getLocaleInfo($lang)
    {
        if (! isset($this->validLocales[$lang])) {
            return false;
        }

        $view = ViewHelper::getInstance();

        return array(
            'flag' => $view->resourceHTML('image',
                env('SITE_LOCALE_FLAGS', '/resources/images/flags') . '/' . $lang .
                     '.png'),
            'name' => $this->validLocales[$lang]
        );
    }
}