(function (factory) {
	if (typeof define === "function" && define["amd"]) {
		define(['jquery', 'history', 'router', 'amplify', 'ko', 'concerto-ko-extras', 'concerto-views-cache'], factory);
	} else {
		factory(koExtras, viewsCache);
	}
}(function (jQuery, History, Router, Amplify, ko, koExtras, viewsCache, undefined) {

	if( Amplify.store() !== undefined ) {
		jQuery.each( Amplify.store(), function(key) {
			Amplify.store(key, null);
		});
	}

	var Concerto = {};

	Concerto.URL = {};
	Concerto.URL.getQS = function (name) {
		var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	}

	Concerto.templatesCache = {};

	for(var routeSignatures in viewsCache['route_templates']) {
		var routeSignature = routeSignatures.split('|');
		for( var i = 0, length = routeSignature.length; i<length; i++ ) {
			Concerto.templatesCache[routeSignature[i]] = viewsCache['route_templates'][routeSignatures];
		}
	}

	for(var routeSignature in Concerto.templatesCache) {
		Amplify.store( routeSignature, Concerto.templatesCache[routeSignature]);
	}

	Concerto.KO = {};
	Concerto.KO.Extra = koExtras;
	Concerto.KO.BaseModelDef = {};

	if( window.ConcertoGlobals && window.ConcertoGlobals.vm_def ) {
		for(var def in window.ConcertoGlobals.vm_def) {
			Concerto.KO.BaseModelDef[def] = window.ConcertoGlobals.vm_def[def];
		}
	}
	window.ConcertoGlobals = undefined;

	Concerto.KO.BaseModel = function() {
		var model = {
			nested: {},
			nest: function( identifier, vm ) {
				this.nested[identifier] = vm;
			},
			getNestedVM: function( identifier ) {
				return this.nested[identifier];
			}
		};

		for(var key in Concerto.KO.BaseModelDef) {
			model[key] = Concerto.KO.BaseModelDef[key];
		};

		return model;
	};

	Concerto.Router = new Router.Router();

	Concerto.Router.Filters = {};
	Concerto.Router.Filters.before = [];
	Concerto.Router.Filters.after = [];

	Concerto.Router.beforeFilter = function( callback ) {
		Concerto.Router.Filters.before.push( callback );
	};

	Concerto.Router.afterFilter = function( callback ) {
		Concerto.Router.Filters.after.push( callback );
	};

	Concerto.Router.Filters.beforeModal = [];
	Concerto.Router.Filters.afterModal = [];

	Concerto.Router.beforeFilterModal = function( callback ) {
		Concerto.Router.Filters.beforeModal.push( callback );
	};

	Concerto.Router.afterFilterModal = function( callback ) {
		Concerto.Router.Filters.afterModal.push( callback );
	};

	Concerto.Page = {};

	Concerto.Page.domTarget = '#main';
	Concerto.Page.domTargetModal = '#modal-body';
	Concerto.Page.viewModel = {};

	Concerto.Page.loadSettings = [];

	Concerto.Page.applyBindings = function( vm, domTarget ) {
		if( vm && domTarget ) {
			ko.cleanNode(jQuery(domTarget)[0]);
			ko.applyBindings( vm, jQuery(domTarget)[0] );
		} else {
			ko.applyBindings( Concerto.Page.viewModel );
		}
	};

	Concerto.Page.load = function( domTarget ) {
		var
			// url = History.getState().url,
			url = Concerto.Router.currentUrl,
			routeSignature = Concerto.Router.getCurrentRouteSignature();
			console.log('routeSignature: ',routeSignature);

		$content = jQuery(domTarget);
		$content.animate({opacity:0},800);
		
		var dfd = jQuery.Deferred();
		var cachedResponse = Amplify.store(routeSignature);
		if (cachedResponse) {
			$content.stop(true,true);
			$content.html(cachedResponse).css('opacity', 100).show();
			dfd.resolve(cachedResponse);
		} else {
			jQuery.ajax({
				url: url,
				success: function(data, textStatus, jqXHR){
					var contentHtml = data;

					Amplify.store(routeSignature, contentHtml);
					$content.stop(true,true);
					$content.html(contentHtml).css('opacity', 100).show();

					dfd.resolve(contentHtml);
				},
				error: function(jqXHR, textStatus, errorThrown){
					return false;
				}
			});
		}

		return dfd;
	}

	Concerto.Router.register = function( url, callback ) {
		Concerto.Router.route(url, function() {
			var self = this;
			var params = arguments;

			for (var i = 0, length = Concerto.Router.Filters.before.length; i < length; i++) {
				Concerto.Router.Filters.before[i].call(self, arguments);
			};

			var pageLoad = Concerto.Page.load(Concerto.Page.domTarget);
			pageLoad.done( function( response ) {
				for (var i = 0, length = Concerto.Router.Filters.after.length; i < length; i++) {
					Concerto.Router.Filters.after[i].call(self, arguments, response);
				};

				callback.call(self, arguments);
			});
		});
	};

	Concerto.Router.registerModal = function( url, callback, parent_page ) {
		Concerto.Router.route(url, function() {
			var self = this;
			var params = arguments;

			for (var i = 0, length = Concerto.Router.Filters.beforeModal.length; i < length; i++) {
				Concerto.Router.Filters.beforeModal[i].call(self, arguments);
			};

			var pageLoad = Concerto.Page.load( Concerto.Page.domTargetModal );
			pageLoad.done( function( response ) {
				for (var i = 0, length = Concerto.Router.Filters.afterModal.length; i < length; i++) {
					Concerto.Router.Filters.afterModal[i].call(self, arguments, response);
				};

				callback.call(self, arguments);

				Concerto.Router.preventChangeStateOnNavigate();
				Concerto.Router.navigate(parent_page);
			});
		});
	};

	Concerto.Page.ajaxifyAnchors = function() {
		var rootUrl = History.getRootUrl();
		// Internal Helper
		$.expr[':'].internal = function(obj, index, meta, stack) {
			// Prepare
			var
				$this = $(obj),
				url = $this.attr('href')||'',
				isInternalLink;
								
			// Check link
			isInternalLink = url.substring(0,rootUrl.length) === rootUrl || url.indexOf(':') === -1;
			isInternalLink = isInternalLink || (url === '#') || (url === 'javascript:;') || (url === '') || (url === undefined);
			
			// Check if the link is absolute
			var external = RegExp('^((f|ht)tps?:)?//(?!' + url + ')');
							
			// Ignore or Keep
			return isInternalLink;
		};
		
		// Valid Helper
		$.expr[':'].valid = function(obj, index, meta, stack) {
			// Prepare
			var
				$this = $(obj),
				url = $this.attr('href'),
				isValidLink;

			isValidLink = (url === '#') || (url === 'javascript:;') || (url === '') || (url === undefined);

			return !isValidLink;
		};

		// Ajaxify
		jQuery('body').on('click','a:internal:valid:not(.no-ajaxy)', function(event) {
			// Prepare
			var	$this = jQuery(this),
				url = '/' + $this.attr('href').replace(rootUrl, '');
			
			// Continue as normal for cmd clicks etc
			if ( event.which == 2 || event.metaKey ) { return true; }
			
			// Ajaxify this link
			event.preventDefault();
			console.log('cometh hither');
			History.pushState(null, '', url);
			return false;
		});
		
		$('body').on('click','a:not(:internal)', function(event) {
			$(this).attr("target", "_blank");
		});
	};

	return Concerto;
}))