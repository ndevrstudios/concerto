<?php namespace Ndevrstudios\Concerto\ResponseHandler;

use Illuminate\Support\Facades\Response;

class KoResponseHandler implements ResponseHandlerInterface {

	private $input = array();
	private $observables = array();
	private $callbacks = array();
	private $output = array();
	private $exclusive;

	public function __construct( $input ) {
		$this->input = $input;
		$this->exclusive = (isset($this->input['observables']['exclusive']))? $this->input['observables']['exclusive']:false;
		if(isset($this->input['observables']['exclusive'])) unset($this->input['observables']['exclusive']);
	}

	public function register( $observable, Closure $callback = null ) {
		$this->observables[] = $observable;
		$this->callbacks[$observable] = $callback;
	}

	public function generate() {
		if( isset($this->observables) )
		foreach( $this->input['observables'] as $observable => $params ) {
			if( !in_array($observable, $this->observables) ) continue;
			$userFuncParams = array();

			if( is_array($params) )
			foreach( $params as $param => $value ) {
				if( is_string($value) && substr($value,0,10) == 'koDepends:' ) {
					$refStr = substr($value,10);
					$refArray = explode('.', $refStr);
					$observableValue = $this->output;
					foreach( $refArray as $index ) {
						$observableValue = $observableValue[$index];
					}
					$userFuncParams[] = $observableValue;
				} else {
					$userFuncParams[] = $value;
				}
			}

			$this->output[$observable] = call_user_func_array($this->callbacks[$observable], $userFuncParams);
		}

		return Response::json($this->output);
	}
};
