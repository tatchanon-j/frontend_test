<?php
namespace App\Http\Controllers\Frontoffice;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use App\Helpers\ViewHelper;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

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
class HomeController extends BaseController
{

    /**
     * Home page
     *
     * @param Illuminate\Http\Request $request
     */
    public function main(Request $request)
    {
            return ViewHelper::getInstance()->view("frontoffice/home/main");
    }
    public function about(Request $request)
    {
            return ViewHelper::getInstance()->view("frontoffice/home/about");
    }
    public function contactus(Request $request)
    {
            return ViewHelper::getInstance()->view("frontoffice/home/contactus");
    }
    public function splash(Request $request)
    {
        $p = null;
        if ( $request->path() == 'index2' ){ $p = 'index2' ;}
        return ViewHelper::getInstance()->view("frontoffice/home/userThailand", compact('p'));
    }
    public function downloafileDatasWarning(Request $request)
    {

        // download URL

        $url = 'http://live1.haii.or.th/product/latest/flashflood/FFPI_Table.html';
 
        $filename = basename($url);

        $file_date_txt = 'FFPI_Table_date.txt';

        $date_now = date_format(date_create(date("Y-m-d H:i:s")),"Y-m-d H:i:s");

        $files = Storage::disk('public')->files();

        $disk = Storage::disk('public');

        if(time() > strtotime(date('Y-m-d').' 10:50')) {

            if (!empty($files)) {
                if ($disk->get($file_date_txt) == '') {
                // $date_file_txt  = date_format(date_create($disk->get($file_date_txt)),"Y-m-d H:i:s");

                // $diff_date  = date_diff(date_create($date_now),date_create($date_file_txt))->format("%R%a");

                // echo " [date_now =".$date_now ."] [date_file_txt =".$date_file_txt ."] ";

                // echo " [diff_date = ".$diff_date . " day] ";

                //if(($diff_date*1) < 0){
                    $disk->put($file_date_txt, $date_now);
                    file_put_contents('datas/'.$filename, file_get_contents($url));
                    echo " >>> update file successful";
                }else{
                    echo " >>> file update to date";
                }
            }else{
                $disk->put($file_date_txt, $date_now);
                file_put_contents('datas/'.$filename, file_get_contents($url));
                echo " >>> download file successful";
            }
        }else{
            $disk->put($file_date_txt, "");
            echo " time < 10.50 AM";
        }

        // download FTP

        // $filename       = 'สรุปรายงานสถานการณ์น้ำหลาก-ดินถล่มประจำว.xlsx';

        // $new_filename   = "dwr_data_lastest.xlsx";

        // $file_date_txt  = "date_file.txt";

        // Get all files in this directory.
        // $files = Storage::disk('public')->files();

        // $disk = Storage::disk('public');

        // $date_now   = date_format(date_create(date("Y-m-d")),"Y-m-d");

        // // Check if directory is empty.
        // if (!empty($files)) {

        //     $date_file_ftp = date_format(date_create(date(DATE_RFC2822, Storage::disk('ftp_dwr')->lastModified($filename))),"Y-m-d");

        //     $date_file_txt  = date_format(date_create($disk->get($file_date_txt)),"Y-m-d");

        //     $diff_date  = date_diff(date_create($date_file_ftp),date_create($date_file_txt))->format("%R%a");

        //     echo " [date_file_ftp =".$date_file_ftp ."] [date_file_txt =".$date_file_txt ."] ";

        //     echo " [diff_date = ".$diff_date . " day] ";

        //     if(($diff_date*1) > 0){

        //         $disk->put($file_date_txt, $date_file_ftp);
        //         $disk->put($new_filename, Storage::disk('ftp_dwr')->get($filename));
        //         echo " >>> update file successful";

        //     }else{

        //         echo " >>> file update to date";
        //     }
        // }else{
            
        //     $disk->put($new_filename, Storage::disk('ftp_dwr')->get($filename));
        //     echo " >>> dowload file successful";
        // }
    }
    public function cityPlan(Request $request)
    {
        return ViewHelper::getInstance()->view("frontoffice/home/cityplan");
    }
}
