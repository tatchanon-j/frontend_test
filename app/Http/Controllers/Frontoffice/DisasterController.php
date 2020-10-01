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
 * @author Peerapong Srisom <peerapong@haii.or.th>
 * @license HAII
 * @link NULL
 *
 */
class DisasterController extends BaseController
{
    protected   $connection = 'disaster_sqlite';
    public      $table         = 'data_warning';
    public      $db;

    public function __construct()
    {
        $this->db = \DB::connection($this->connection);
    }

    /**
     * all list 
     *
     */
    public function index()
    {
        
        $rs = $this->db->select('select * from data_warning ');
 
        return response()->json($rs);
    }

    /**
     * add list 
     *
     * @param Illuminate\Http\Request $request
     */
    public function add(Request $request)
    {
        
        $rs = $this->db->insert('insert into ' . $this->table . ' (event_datetime,tumbon,amphur,province,warning_description) values (?, ?, ?, ?, ?)', [$request->disasterEventDatetime,$request->disasterDistrict,$request->disasterAmphoe, $request->disasterProvince, $request->disasterWarningDescription]);

        return response()->json($rs);

    }

    /**
     * delete list 
     *
     * @param Illuminate\Http\Request $request
     */
    public function del(Request $request)
    {

        $rs = $this->db->table($this->table)->where('id',$request->id)->delete();

        return response()->json($rs);

    }
    
    /**
     * view list 
     *
     */
    public function disasterWarning()
    {
        return ViewHelper::getInstance()->view("frontoffice/disaster_warning/main");
    }
}
