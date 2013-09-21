(function (factory) {
	if (typeof define === "function" && define["amd"]) {
		define(["vendor/Knockout/knockout-2.3.0.min"], factory);
	} else {
		factory(ko);
	}
}(function (ko, undefined) {
	var ext = {};
	ext.koViewModel = function( identifier ) {
		var self = this;

		self.identifier = (identifier)? identifier:null;

	    self.observables = {};
	    self.subscriptions = [];

	    // called when responses for listed observables are loaded
	    self.ko_callbacks = {};

	    // default callback when response is loaded for an observable
	    self.ko_callback_default = function( key, response ) {
	        self.observables[key]( response );
	        // console.log( 'Observable ' + key + ' set to: ' + response );
	    };

	    // generic remote call for loading observable values
	    self.getKnockoutRemote = function( options ) {
	        var query = {};
	        if( options.observables === undefined ) {
	            for(var key in self.observables)
	                query[key] = null;
	        } else {
	            if( options.observables.exclusive !== undefined )
	                if( options.observables.exclusive === false )
	                    for(var key in this.observables)
	                        query[key] = null;
	            for(var key in options.observables)
	                query[key] = options.observables[key];
	        }
	        // console.log('query', query);

	        var root = self;
	        var endpoint = (options.endpoint)? options.endpoint:this.endpoint;
			var processResponse = function(response) {
	            for(var key in response) {
	                if( root.ko_callbacks[key] !== undefined ) {
	                    root.ko_callbacks[key].call(root, key, response[key]);
	                } else {
	                    root.ko_callback_default.call(root, key, response[key])
	                }
	            }

	            if( options.success !== undefined ) options.success.call(root, root, response);
	        }

	        if(self.persist && window.amplify && window.amplify.store(endpoint))
	        	processResponse(window.amplify.store(endpoint));
	        else
		        $.post(endpoint, { observables: query }, function(response) {
		        	if(self.persist && window.amplify) window.amplify.store(endpoint, response);
		        	processResponse(response);
		        });
	    };

	    self.batchSubscribe = function( observables, callback ) {
	    	self.batchSubscriptionObservable = ko.computed( function() {
	    		var res = [];
		    	for (var i = 0; i < observables.length; i++) {
		    		res.push(self.observables[observables[i]]());
		    	}
		    	return res;
	    	});

	    	self.batchSubscriptionObservable.subscribe(function() {
	    		callback.call(self, arguments);
	    	});
	    };

	    self.clearSubscriptions = function() {
	        for(var sub in this.subscriptions) sub.dispose();
	    };

		return self;
	};

	ext.koPaginator = function( urlCallback ) {
		var self = this;
		self.pageSize = ko.observable(1),
		self.pageIndex = ko.observable('0'),
		self.totalItems = ko.observable(0),
		self.maxPageIndex = ko.computed( function () {
			return Math.ceil(self.totalItems() / self.pageSize()) - 1;
		});
		self.previousPage = function () {
			if (self.pageIndex() > 0) {
				return self.pageUrlAt(parseInt(self.pageIndex())-1);
			}
		};
		self.nextPage = function () {
			if (self.pageIndex() < self.maxPageIndex()) {
				return self.pageUrlAt(parseInt(self.pageIndex())+1);
			}
		};
		if(urlCallback)
			self.pageUrlAt = urlCallback;
		else
			self.pageUrlAt = function(index) {
				return index;
			};

		self.allPages = ko.computed(function () {
			var pages = [];
			for (i = 0; i <= self.maxPageIndex() ; i++) {
				pages.push({ pageNumber: (i + 1) });
			}
			return pages;
		});

		return self;
	};

	window.koExtras = ext;

	return { koViewModel: ext.koViewModel, koPaginator: ext.koPaginator };
}))//(this)