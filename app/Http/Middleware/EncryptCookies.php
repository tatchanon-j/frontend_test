<?php
namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as BaseEncrypter;
use App\Helpers\ApiServiceHelper;

class EncryptCookies extends BaseEncrypter
{

    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array
     */
    protected $except = [
        ApiServiceHelper::CSRF_COOKIE
    ];
}
