<?php

namespace App\Http\Middleware;

use Closure;
use Request;
use Response;

class ApiDisasterAuth
{

/**
 * Handle an incoming request.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  \Closure  $next
 * @return mixed
 */
    public function handle($request, Closure $next)
    {

        if (Request::getUser() != 'disaster' || Request::getPassword() != 'disaster@thaiwater30') {

            $headers = array('WWW-Authenticate' => 'Basic');
            return Response::make('Invalid credentials.', 401, $headers);

        }

        return $next($request);

    }

}
