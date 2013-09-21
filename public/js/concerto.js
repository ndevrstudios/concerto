(function (factory) {
	if (typeof define === "function" && define["amd"]) {
		define(['jquery', 'history', 'router', 'amplify', 'concerto-ko-extras', 'concerto-views-cache'], factory);
	} else {
		factory(koExtras, viewsCache);
	}
}(function (jQuery, History, Router, Amplify, koExtras, viewsCache, undefined) {
	console.log(viewsCache);
	var Concerto = {};
	Concerto.Router = new Router.Router();

	Concerto.templatesCache = {};

	for(var routeSignatures in viewsCache['route_templates']) {
		var routeSignature = routeSignatures.split('|');
		for( var i = 0, length = routeSignature.length; i<length; i++ ) {
			Concerto.templatesCache[routeSignature[i]] = viewsCache['route_templates'][routeSignatures];
		}
	}

	for(var routeSignature in Concerto.templatesCache) {
		amplify.store( routeSignature, Concerto.templatesCache[routeSignature]);
	}

	Concerto.koBaseModel = {
		nested: {}
	};

	if( window.ConcertoGlobals && window.ConcertoGlobals.vm_def ) {
		for(var def in window.ConcertoGlobals.vm_def) {
			Concerto.koBaseModel[def] = window.ConcertoGlobals.vm_def[def];
		}
	}
	console.log(Concerto.koBaseModel);
	return Concerto;
}))