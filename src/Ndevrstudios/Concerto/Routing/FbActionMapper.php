<?php namespace Ndevrstudios\Concerto\Routing;

use Illuminate\Support\Facades\App;

class FbActionMapper {

	private $map = array();
	public $delegate;

	public function __construct(FbShareResponseInterface $delegate)
	{
		$this->delegate = $delegate;
		$self = $this;
		App::bind('concerto.FbActionMapper', function($app) use ($self) {
			return $self;
		});
		$this->map = $this->delegate->getFbActionMap($this);
	}

	public function registerFbAction($actionName, $fbActionName)
	{
		$this->map[$actionName] = $fbActionName;
	}

	public function getFbAction($actionName)
	{
		if(isset($this->map[$actionName]))
			return $this->map[$actionName];
		else
			return false;
	}

}