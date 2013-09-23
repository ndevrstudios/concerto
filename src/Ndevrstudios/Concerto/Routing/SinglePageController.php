<?php namespace Ndevrstudios\Concerto\Routing;

use \Ndevrstudios\Concerto\Routing\SinglePageInterface;
use \Ndevrstudios\Concerto\Routing\SinglePageHandler;
use \Ndevrstudios\Concerto\Routing\Controller;

class SinglePageController extends Controller implements SinglePageInterface {

	public function __construct()
	{

	}

	public function getSinglePageJsGlobals()
	{
		return json_encode( array(
			'vm_def' => array(
				'logged_in' => Auth::check(),
				'user_data' => User::first()->toArray(),
			)
		));
	}
}