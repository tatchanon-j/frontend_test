<?php

namespace App\Http\Controllers\Frontoffice;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Storage;

class ProxyController extends Controller
{
    public function getData()
    {
        // echo Request('url');

        // http://stackoverflow.com/questions/26148701/file-get-contents-ssl-operation-failed-with-code-1-and-more
        $arrContextOptions=array(
            "ssl"=>array(
                // "cafile" => "/path/to/bundle/ca-bundle.crt",
                "verify_peer"=>false,
                "verify_peer_name"=>false,
            ),
        );

        $contents = file_get_contents(Request('url'), false, stream_context_create($arrContextOptions));
        if ($contents === false)
        {
            echo "Couldn't fetch the file.";
        }
        return $contents;
    }
}
