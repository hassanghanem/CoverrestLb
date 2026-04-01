<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class AppMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');
        $app_key = $request->header('App-key');

        if ($app_key == config("app.frontend_app_key")) {
            $lang = $request->header('Accept-Language', 'en');
            // Parse the locale from Accept-Language header (remove quality values and take first locale)
            $lang = explode(',', $lang)[0];
            $lang = explode(';', $lang)[0];
            $lang = str_replace('_', '-', strtolower(trim($lang)));
            App::setLocale($lang);

            $response = $next($request);
            $response->headers->set('Content-Type', 'application/json; charset=utf-8');
            return $response;
        }

        return response()->json([
            'result' => false,
            'message' => __('Access denied'),
        ]);
    }
}
