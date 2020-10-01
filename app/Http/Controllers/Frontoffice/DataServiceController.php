<?php
namespace App\Http\Controllers\Frontoffice;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;
use Illuminate\Support\Facades\Storage;

/**
* Home (First Page)
*
* @category PHP
* @package frontend-system-report
* @author CIM Systems (Thailand) <cim@cim.co.th>
* @license HAII
* @link NULL
*
*/
class DataServiceController extends BaseController
{
    /**
    * DATA_SERVICE_PATH storage path
    */
    const DATA_SERVICE_PATH = 'data_service/';

    public function index(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/data_service/data_service");
    }
    public function history(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/data_service/history");
    }
    public function postUpload(Request $request){
        #code ...
        // upload file from api server
        if ( !$request->has('folder') ){ return abort(403, 'no folder');} // ไม่ส่ง folder มา
        if ( !$request->hasFile('zip') ){ return abort(403, 'no file');} // ไม่ส่ง zip มา

        $folder = Storage::getDriver()->getAdapter()->applyPathPrefix(self::DATA_SERVICE_PATH) . $request->input('folder') ;
        Storage::makeDirectory(self::DATA_SERVICE_PATH . $request->input('folder'));

        $rs = array();
        foreach( $request->file('zip') as $i => $f){
            $extension = $f->getClientOriginalExtension(); // getting file extension
            $fileName = $f->getClientOriginalName();
            $f->move( $folder , $fileName );
            $rs[] = array(
                'index' => $i,
                'filename' => $fileName,
                'folder' => $folder
            );
        }
        return json_encode($rs);
    }

    public function getFile($folder = null, $file = null){
        if ( !$folder ){ return abort(404); }
        $a = \App\Helpers\ApiServiceHelper::getInstance();
        $p = $a->base64urlDecode($folder);
        $path = self::DATA_SERVICE_PATH . $p;
        if ( !$file ){ // มาจาก api
            $allFile = Storage::allFiles($path);
            // dd($path, $allFile);
            if (sizeof( $allFile ) == 0 ){
                abort(404, "no file");
            }

            $files = array();
            foreach ($allFile as $key => $value) {
                $f = explode("/",$value);
                $files[] = array(
                    'name' => $f[ sizeof($f) - 1 ],
                    'size' => $this->FormatSizeUnits( Storage::size($value) )
                );
            }

            if ( sizeof($files) == 1 ){ // มีไฟล์เดียว คืนไฟล์ไปเลย
                return $this->RetunFile($path . '/' . $files[0]['name'], $files[0]['name']);
            }
            return ViewHelper::getInstance()->view("frontoffice/data_service/file", compact('folder','files'));
        }else{ // มีไฟล์ แสดงว่ามาจากกดเลือกไฟล์
            $file = $a->base64urlDecode($file);
            return $this->RetunFile($path . '/' . $file, $file);
        }
    }

    /**
    * Format size
    *
    * @param number $bytes - Numbers need to format.
    * @return string - format size with unit
    */
    public function FormatSizeUnits($bytes){
        if ($bytes >= 1073741824){
            $bytes = number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            $bytes = number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            $bytes = number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            $bytes = $bytes . ' bytes';
        } elseif ($bytes == 1) {
            $bytes = $bytes . ' byte';
        } else {
            $bytes = '0 bytes';
        }

        return $bytes;
    }

    /**
    * Response file
    *
    * @param string $path - file location in storage/app.
    * @param string $filename - default $filename.
    * @return response()->download
    */
    public function RetunFile($path, $filename){
        if ( is_null($path) ){ abort(404); }
        $storage_path = Storage::getDriver()->getAdapter()->applyPathPrefix($path);
        if ( !file_exists($storage_path) ) {
            abort(404);
        }

        return response()->download($storage_path,  $filename, []);
    }

    public function check(Request $request){
        phpinfo();
        // if ( $request->has('time') && $request->input('time') > 0){
        //     $exp = $request->input('time');
        // }else{
        //     $exp = 7 * 60 * 60;
        // }
        //
        // $DATA_SERVICE_PATH = self::DATA_SERVICE_PATH;
        // $this->removeOldFile($DATA_SERVICE_PATH, $exp);
    }

    /**
     * Scan and remove file expire
     *
     * @param string $dir - folder in storage/app
     * @param int $exp - expire date in timestamp
     * @return int - count all files in folder
     */
    function removeOldFile($dir, $exp){
        echo 'scan directories : ' . $dir . "\r\n";
        $folders = Storage::directories($dir);
        $countFolders = sizeof( $folders );
        $countFiles = 0;
        if ( $countFolders == 0 ){ // โฟลเดอร์ขั้นสุดท้ายแล้ว
            $files = Storage::files($dir);
            foreach($files as $ff){
                $lastModified = Storage::lastModified($ff);
                if ( ($lastModified + $exp) < time() ){
                    Storage::delete($ff);
                }
            }
            return sizeof( Storage::files($dir) );
        }
        foreach($folders as $ff){
            $countFiles = $this->removeOldFile($ff, $exp);
            if ( $countFiles == 0 ){
                Storage::deleteDirectory($ff);
            }
        }

        return $countFiles;
    }
}
