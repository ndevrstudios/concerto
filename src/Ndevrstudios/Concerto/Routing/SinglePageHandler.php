<?php namespace Ndevrstudios\Concerto\Routing;

use Illuminate\Support\Facades\App;

class SinglePageHandler {

	public $delegate;
	private $globalJs;

	public function __construct(SinglePageInterface $delegate)
	{
		$this->delegate = $delegate;
		$self = $this;
		App::bind('concerto.SinglePageHandler', function($app) use ($self) {
			return $self;
		});
		$this->globalsJs = $this->delegate->getSinglePageJsGlobals();
	}

	public function getJsGlobals() {
		return $this->globalsJs;
	}
}
