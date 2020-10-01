<?php
namespace App\Http\Middleware;

use App\Helpers\ApiServiceHelper;
use Closure;
use Illuminate\Contracts\Auth\Guard;

/**
 * Authentication Middleware for API Service login
 *
 * @category PHP
 * @package frontend-system-report
 * @author CIM Systems (Thailand) <cim@cim.co.th>
 * @license HAII
 * @link NULL
 *      
 */
class ApiAuth
{

    /**
     * The Guard implementation.
     *
     * @var Guard
     */
    protected $auth;

    /**
     * Create a new filter instance.
     *
     * @param Guard $auth            
     * @return void
     */
    public function __construct()
    {}

    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request            
     * @param \Closure $next            
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        return ApiServiceHelper::getInstance()->middlewareHandler($request, 
            $next);
    }
}
