<?php namespace Ndevrstudios\Concerto\ResponseHandler;

interface ResponseHandlerInterface {
	public function register ( $observable, Closure $callback = null );
	public function generate ();
}