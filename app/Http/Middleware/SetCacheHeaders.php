<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCacheHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $type = 'private', $maxAge = 0): Response
    {
        $response = $next($request);

        if (!$response instanceof \Illuminate\Http\Response && !$response instanceof \Illuminate\Http\JsonResponse) {
            return $response;
        }

        if ($type === 'public') {
            $response->headers->remove('Cache-Control');
            $response->headers->remove('Pragma');
            $response->headers->remove('Expires');
            $response->headers->set('Cache-Control', "public, max-age={$maxAge}");
        } elseif ($type === 'private' && $maxAge > 0) {
            $response->headers->remove('Cache-Control');
            $response->headers->remove('Pragma');
            $response->headers->remove('Expires');
            $response->headers->set('Cache-Control', "private, max-age={$maxAge}");
        } else {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }
}
