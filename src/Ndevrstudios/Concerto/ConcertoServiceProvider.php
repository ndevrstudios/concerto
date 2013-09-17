<?php namespace Ndevrstudios\Concerto;

use Illuminate\Support\ServiceProvider;

class ConcertoServiceProvider extends ServiceProvider {

	/**
	 * Indicates if loading of the provider is deferred.
	 *
	 * @var bool
	 */
	protected $defer = false;

	/**
	 * Bootstrap the application events.
	 *
	 * @return void
	 */
	public function boot()
	{
		$this->package('ndevrstudios/concerto', 'ndevrstudios/concerto');

		$this->app['ndevrstudios.concerto'] = $this->app->share(function() {
			return new Concerto;
		});

		$this->app['ndevrstudios.KoResponseHandler'] = $this->app->share(function() {
			return new \ResponseHandler\KoResponseHandler;
		});
	}

	/**
	 * Register the service provider.
	 *
	 * @return void
	 */
	public function register()
	{
		//
	}

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return array();
	}

}