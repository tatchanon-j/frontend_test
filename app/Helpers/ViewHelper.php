<?php
namespace App\Helpers;

/**
 *
 * Helper Class for render blade template.
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *
 */
class ViewHelper
{

    /**
     * Singleton of the class ViewHelper.
     *
     * @var ViewHelper
     */
    static $theInstance;

    /**
     * Store system configuration for use in blade view rendering.
     * The main configuration file must be in 'resources/views/{site_mode}/config.php.
     * In addition to config.php you can place small php configuration files for
     * each asset in 'resources/views/{site_mode}/config.d/'.
     * {site_mode} must be set in .env SITE_VIEWMODE configuration. If no
     * SITE_VIEWMODE is set the default is 'production'.
     *
     * @var array()
     */
    protected $viewConfig;

    /**
     * Store user configuration for use in blade view rendering.
     *
     * @var array()
     */
    protected $userSetting;

    /**
     *
     * @var \Illuminate\View\Factory
     */
    protected $viewFactory;

    /**
     * UI Theme to be use in blade view rendering.
     * Get default value from env('SITE_THEME_DEFAULT').
     *
     * @var string
     */
    protected $themeName;

    /**
     * The array of processed assets.
     * Use to prevent duplicate rendering of the asset.
     * The array key is asset name.
     *
     * @var array()
     */
    protected $processedAsset;

    /**
     * The array of processed resources.
     * Use to prevent insert duplicated resources.
     * The array key is a serialize string of resource content.
     *
     * @var array() of
     */
    protected $includedAssetResouces;

    /**
     * The array of assets waiting to be rendered in current view
     *
     * @var array()
     */
    protected $assetContent;

    /**
     * The array of resources waiting to be rendered in current view
     *
     * @var array()
     */
    protected $localContent;

    /**
     * URL string for prepend in the front of each resource.
     * This variable can be set to empty string if the site was placed at the
     * root of web domain. Get the value from env('SITE_URLPREFIX')
     *
     * @var string
     */
    protected $urlPrefix;

    public function __construct()
    {
        $this->viewConfig = null;
        $this->userSetting = array();
        $this->viewFactory = null;
        $this->themeName = '';
        $this->processedAsset = array();
        $this->includedAssetResouces = array();
        $this->assetContent = array();
        $this->localContent = array();
    }

    /**
     * Return singleton of the class
     *
     * @return App\Helpers\ViewHelper
     */
    public static function getInstance()
    {
        if (self::$theInstance == null) {
            self::$theInstance = new ViewHelper();
        }
        return self::$theInstance;
    }

    /**
     * Get/Set user configuration.
     * if "$v" is not null, set the user configuration "$cfg_name"
     * and return "$v", otherwise return the user configuration or
     * false if configuration not exists
     *
     * @param string $cfg_name
     * @param mixed $v
     * @return mixed
     */
    public function option($cfg_name, $v = null)
    {
        if ($v !== null) {
            $this->userSetting[$cfg_name] = $v;
            return $v;
        }
        if (! isset($this->userSetting[$cfg_name])) {
            return false;
        }
        return $this->userSetting[$cfg_name];
    }

    /**
     * Intialize the view.
     * This method will be call internally when user render with view method
     */
    protected function init()
    {
        $this->viewConfig = array();
        $this->viewFactory = app()['view'];

        $m = str_replace('..', '', env('SITE_VIEWMODE', 'production'));
        $p = base_path('resources/views/' . $m);

        $this->viewFactory->getFinder()->addLocation($p);

        $this->readConfig($p . '/config.php');

        $cfg = $p . '/config.d';
        $this->viewConfig['config.d'] = array();
        if (file_exists($cfg) && is_dir($cfg)) {
            foreach (glob($cfg . '/*.php') as $f) {
                $this->readConfig($f);
            }
        }

        $this->themeName = env('SITE_THEME_DEFAULT', 'default');
        if (isset($_COOKIE['SITE_THEME'])) {
            if (in_array($_COOKIE['SITE_THEME'],
                explode(',', env('SITE_THEMES', 'default')))) {
                $this->themeName = $_COOKIE['SITE_THEME'];
            }
        }

        $this->urlPrefix = env('SITE_URLPREFIX', '');
    }

    /**
     * Read system configuration from the given file name "$cfg".
     *
     * @param string $cfg
     *            configuaration file name
     */
    protected function readConfig($cfg)
    {
        if (! file_exists($cfg)) {
            return;
        }
        $d = (include $cfg);

        if (isset($d['options']) && is_array($d['options'])) {
            foreach ($d['options'] as $k => $v) {
                $this->userSetting[$k] = $v;
            }
        }
        if (isset($d['asset']) && is_array($d['asset'])) {
            foreach ($d['asset'] as $k => $v) {
                $this->viewConfig['asset'][$k] = $v;
            }
        }
    }

    /**
     * Render blade template content of the given "$view"
     *
     * @param string $view
     * @param array $data
     */
    public function view($view, $data = array())
    {
        if (! $this->viewConfig) {
            $this->init();
        }
        // return response()->json(['name' => 'Abigail', 'state' => 'CA']);
        return $this->viewFactory->make($view, $data);
    }

    /**
     * Evaluate and generate HTML resource markup for the asset "$asset_name"
     *
     * @param string $asset_name
     */
    protected function buildAssetElements($asset_name)
    {
        if (isset($this->processedAsset[$asset_name])) {
            return;
        }
        $this->processedAsset[$asset_name] = true;

        $asset = $this->viewConfig['asset'][$asset_name];
        if (isset($asset['use'])) {
            if (is_array($asset['use'])) {
                $u = $asset['use'];
            } else {
                $u = array(
                    $asset['use']
                );
            }

            foreach ($u as $a) {
                $this->buildAssetElements($a);
            }
        }

        if (! isset($asset['content'])) {
            return;
        }
        foreach ($asset['content'] as $a) {
            $k = $this->getAssetResourceKey($a);
            if ($k == '') {
                continue;
            }

            if (! isset($this->includedAssetResouces[$k])) {
                $this->includedAssetResouces[$k] = true;
                $this->assetContent[] = $a;
            }
        }
    }

    /**
     * Generate uniq key for a resource "$a"
     *
     * @param array $a
     *            (resouce_type,html_src,html_tag_parameters,is_append_file_date_to_src)
     */
    protected function getAssetResourceKey($a)
    {
        if (count($a) == 0 || $a[0] == '') {
            return '';
        }
        $c = count($a);
        if ($c > 3) {
            $c = 3;
        }
        $k = '';
        for ($i = 0; $i < $c; $i ++) {
            $k .= $a[$i] . "\t";
        }

        return $k;
    }

    /**
     * Add resource to the view content
     *
     * @param mixed $rtype
     *            resource type or resource information in 4 elements array of
     *            (resouce_type,html_src,html_tag_parameters,is_append_file_date_to_src)
     * @param string $src
     *            source of the resource
     * @param string $params
     *            additional attributes for the html tag
     * @param string $append_date
     *            if "true" append modify date of the resource file in the format
     *            ?v={unix_time_stamp}
     */
    public function resource($rtype, $src = '', $params = '', $append_date = true)
    {
        $a = array(
            $rtype,
            $src,
            $params,
            $append_date
        );
        if (($k = $this->getAssetResourceKey($a)) == '') {
            return;
        }

        if (! isset($this->includedAssetResouces[$k])) {
            $this->includedResouceAsset[$k] = true;
            $this->localContent[] = $a;
        }

        return;
    }

    /**
     * Add asset to the view content
     *
     * @param
     *            list of asset name
     */
    public function asset(...$ns)
    {
        foreach ($ns as $n) {
            if (! isset($this->viewConfig['asset']) ||
                 ! isset($this->viewConfig['asset'][$n])) {
                $this->resource('warning', 'unknown asset ' . $n);
                continue;
            }

            $elements = array();
            $this->buildAssetElements($n);
        }
        return;
    }

    /**
     * Render all pending assets and resources to HTML tag and clear the pending
     * buffer
     *
     * @return string HTML Redering result
     */
     public function flushAsset($flush_js)
     {
       $result = '';
       $a = array();
       $l = array();
       foreach ($this->assetContent as $e) {
         if ( $this->isShowResource($flush_js,$e) ) {
           $result .= $this->resourceHTML($e) . "\n";
         } else {
           array_push($a,$e);
         }
       }
       foreach ($this->localContent as $e) {
         if ( $this->isShowResource($flush_js,$e) ) {
           $result .= $this->resourceHTML($e) . "\n";
         } else {
           array_push($l,$e);
         }
       }
       $this->assetContent = $a;
       $this->localContent = $l;
       
       return $result;
     }

    private function isShowResource($flush_js,$e) {
      $rtype = strtolower($e[0]);
      if (substr($rtype, 0, 6) == 'theme-') {
          $rtype = substr($rtype, 6);
      } else {
          if (substr($rtype, 0, 7) == 'vendor-') {
              $rtype = substr($rtype, 7);
          } else {
              if (substr($rtype, 0, 7) == 'static-') {
                  $rtype = substr($rtype, 7);
              }
          }
      }

      $isJS = $rtype == 'js'  || $rtype == 'script';
      if ( $flush_js ) { return $isJS; } else { return !$isJS; }
    }


    /**
     * Generate canonical src attributes for HTML tag of specified "$src"
     *
     * @param string $src
     *            resource source
     * @param string $append_date
     *            if true , append unix timestamp of the "$src"
     *            modify date in the format ?v={timestamp}
     * @param boolean $use_nonmin_js
     *            if "true", use a non-minify version of the javascript instead
     *            of the minified version specified in "$src".
     */
    public function buildResourceSrc($src, $append_date = true,
        $use_nonmin_js = false)
    {
        if (empty($src)) {
            return '';
        }
        // external resource http:// or //
        if (preg_match('/^(?:[a-z]*[\:]{0,1})\/\//', $src)) {
            return $src;
        }

        if ($src[0] != '/') {
            $src = '/resources/' . $src;
        }

        $src = str_replace('//', '/', $src);

        if ($use_nonmin_js && preg_match('/(.*)\.min\.js$/', $src, $a)) {
            $new_src = $a[1] . '.js';

            if (file_exists(public_path($new_src))) {
                $src = $new_src;
            }
        }
        if (! $append_date) {
            return $this->urlPrefix . $src;
        }

        $pp = public_path() . $src;

        if (file_exists($pp)) {
            if (($t = filemtime($pp))) {
                $src .= '?v=' . $t;
            }
        }

        return $this->urlPrefix . $src;
    }

    /**
     * Generate HTML tag of the specified resource
     *
     * @param mixed $rtype
     *            resource type or resource information in 4 elements array of
     *            (resouce_type,html_src,html_tag_parameters,is_append_file_date_to_src)
     * @param string $src
     *            source of the resource
     * @param string $params
     *            additional attributes for the html tag
     * @param string $append_date
     *            if "true" append modify date of the resource file in the format
     *            ?v={unix_time_stamp}
     */
    public function resourceHTML($rtype, $src = '', $params = '',
        $append_date = true)
    {
        if (is_array($rtype)) {
            $rinf = $rtype;
            while (count($rinf) < 4) {
                $rinf[] = '';
            }
        } else {
            $rinf = array(
                $rtype,
                $src,
                $params,
                $append_date
            );
        }

        $rtype = strtolower($rinf[0]);
        if (substr($rtype, 0, 6) == 'theme-') {
            $rtype = substr($rtype, 6);
            $rinf[1] = '/resources/themes/' . $this->themeName . '/' . $rinf[1];
        } else {
            if (substr($rtype, 0, 7) == 'vendor-') {
                $rtype = substr($rtype, 7);
                $rinf[1] = '/vendor/' . $rinf[1];
            } else {
                if (substr($rtype, 0, 7) == 'static-') {
                    $x = substr($rtype, 7);
                    $r = '';
                    switch ($x) {
                        case 'js':
                        case 'script':
                            $r = "<script>\n" . $rinf[1] . "\n</script>\n";
                            break;
                        case 'css':
                            $r = "<style>\n" . $rinf[1] . "\n</style>\n";
                            break;
                    }
                    if ($r != '') {
                        return $r;
                    }
                }
            }
        }

        switch ($rtype) {
            case 'img':
            case 'image':
                $r = '<img src="' . $this->buildResourceSrc($rinf[1], $rinf[3]) .
                     '" ' . $rinf[2] . ' />';
                break;
            case 'js':
            case 'script':
                $r = '<script src="' .
                     $this->buildResourceSrc($rinf[1], $rinf[3],
                        env('APP_DEBUG', false)) . '" ' . $rinf[2] . ' ></script>';
                break;
            case 'css':
            case 'stylesheet':
                $r = '<link href="' . $this->buildResourceSrc($rinf[1],
                    $rinf[3]) . '" rel="stylesheet" ' .
                     (empty($rinf[2]) ? 'media="all"' : $rinf[2]) . ' />';
                break;
            case 'link':
                $r = '<link href="' . $this->buildResourceSrc($rinf[1],
                    $rinf[3]) . '" ' . $rinf[2] . ' />';
                break;
            case 'meta':
                $r = '<meta ' . $rinf[1] . ' ' . $rinf[2] . ' />';
                break;

            default:
                $r = '<!--';
                for ($i = 0; $i < 3; $i ++) {
                    if ($rinf[$i] != '') {
                        $r .= ' ' . $rinf[$i];
                    }
                }
                $r .= ' -->';
        }

        return $r;
    }

    /*
     * Return project version for the file "version.txt"
     * @return string
     */
    public function getProjectVersion()
    {
        $version = '';
        $fn = base_path() . '/version.txt';
        if (file_exists($fn)) {
            if ($f = fopen($fn, 'r')) {
                $version = fgets($f);
                fclose($f);
            }
        }

        return $version;
    }
}
