<?php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\View;

Route::filter('concerto.facebook_response', function( $route, $request, $value = '' )
{
	$fbActionMapper = App::make('concerto.FbActionMapper');
	list($controllerName, $actionName) = explode('@', Route::currentRouteAction());
	if($fbActionMapper->getFbAction($actionName)) {
		$params = $route->getParameters();
		$fbActionName = $fbActionMapper->getFbAction($actionName);
		return call_user_func_array(array($fbActionMapper->delegate, $fbActionName), $params);
	}
});

// the :view parameter is passed during route definition to allow loading of different base views
Route::filter('concerto.ajax_check', function( $route, $request, $package = '', $view )
{
	if($package !== '')
		$view = $package.'::'.$view;
	$viewData = View::make($view);
	$singlePageHandler = App::make('concerto.SinglePageHandler');
	if($singlePageHandler) {
		$viewData->with('concertoJsGlobals', $singlePageHandler->delegate->getSinglePageJsGlobals());
	}
	if(!Request::ajax()) return Response::make($viewData, 200, array(
		'Cache-Control' => 'no-cache, no-store, max-age=0, must-revalidate',
		'Pragma' => 'no-cache',
		'Expires' => 'Fri, 01 Jan 1990 00:00:00 GMT',
	));
});

Route::filter('concerto.ajax_check_after', function( $response )
{
	if(Request::ajax())
		$response->foundation->headers->replace( array(
			'Cache-Control' => 'no-cache, no-store, max-age=0, must-revalidate',
			'Pragma' => 'no-cache',
			'Expires' => 'Fri, 01 Jan 1990 00:00:00 GMT',
	));
	return $response;
});
