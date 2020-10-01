<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;
use Symfony\Component\HttpFoundation\Cookie;
use Closure;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        '/data_service/upload',
        '/data_service/check',
        '/apicb/*'
    ];

    protected $cached = [
	'index2','main'
    ];

    protected function addCookieToResponse($request, $response)
    {
		foreach ($this->except as $except) {
            if ($request->is($except)) {
                return $response;
            }
        }

		$response->headers->setCookie(
			new Cookie('XSRF-TOKEN',
				$request->session()->token(),
				time() + 60 * 120,
				'/',
				null,
				config('session.secure'),
				true)
			);

		return $response;
	}

	public function handle($request, Closure $next)
    {
        foreach ($this->cached as $cached) {
            if ($request->is($cached)) {
				config()->set('session.driver', 'array');
                $r =  $next($request);
				return $this->enableCache($request,$r);
            }
        }

        return parent::handle($request, $next);
    }

	public function enableCache($request,$response) {
		$t = new \DateTime();
		$response->setLastModified($t);
		$t->add(new \DateInterval('PT15M'));
    	$response->setExpires($t);
		$response->setPublic();
		$response->setVary('Accept-Encoding');
		return $response;
	}
}
