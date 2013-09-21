<?php namespace Ndevrstudios\Concerto\Support\Console;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class DumpViewsCacheCommand extends Command {
	
	/**
	 * The console command name.
	 *
	 * @var string
	 */
	protected $name = 'concerto:viewscache';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Dumps the JSON returned by your passed class\'s instance to the public views cache.';

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Execute the console command.
	 *
	 * @return void
	 */
	public function fire()
	{
		switch ($action = $this->argument('dump'))
		{
			case 'dump' :
				$this->dumpCache($this->argument('classname'));
				break;
			default :
				$this->error("Invalid action [{$action}].");
		}
	}

	protected function dumpCache($classname)
	{
		$this->info('Resolving delegate instance for '.$classname);
		$instance = new $classname;
		if($instance)
			$this->info('Success');
		// dd(getcwd().'/vendor/ndevrstudios/concerto/public/js/concerto-views-cache.js');
		$cache = str_replace('{{ cache }}', $instance->getViewsCacheArray(), $this->getJsFileTemplate());
		file_put_contents(getcwd().'/vendor/ndevrstudios/concerto/public/js/concerto-views-cache.js', $cache);
		$this->info('Cache dumped in public/js/concerto-views-cache.js');
	}

	protected function getJsFileTemplate()
	{
		return <<<EOT
(function (factory) {
	if (typeof define === "function" && define["amd"]) {
		define([], factory);
	} else {
		factory();
	}
}(function (undefined) {
	var cacheArray = {{ cache }};
	return cacheArray;
}))
EOT;
	}

	/**
	 * Get the console command arguments.
	 *
	 * @return array
	 */
	protected function getArguments()
	{
		return array(
			array('dump', InputArgument::REQUIRED, "Dump the cache to JS file."),
			array('classname', InputArgument::REQUIRED, "Class conforming to DumpViewsCacheInterface."),
		);
	}

	/**
	 * Get the console command options.
	 *
	 * @return array
	 */
	protected function getOptions()
	{
		return array();
	}
}
