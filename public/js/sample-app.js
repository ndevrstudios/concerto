/*
 * sample-app.js
 */

var ConcertoBaseUrl = '/packages/ndevrstudios/concerto/js/';

require.config({
	baseUrl: '/packages/<vendor>/<package>/',
	shim: {
		"history": {
			exports: "History"
		},
		"router": {
			exports: "staterouter"
		},
		"amplify": {
			exports: "amplify"
		}
	},
	paths: {
		"history": ConcertoBaseUrl+'vendor/History/jquery.history-1.8.min',
		"router": ConcertoBaseUrl+'vendor/History/jquery.history.staterouter',
		"jquery": ConcertoBaseUrl+'vendor/jQuery/jquery-2.0.3.min',
		"amplify": ConcertoBaseUrl+'vendor/Amplify/amplify-1.1.0.min',
		"concerto-ko-extras": ConcertoBaseUrl+'concerto-ko-extras',
		"concerto-views-cache": ConcertoBaseUrl+'concerto-views-cache',
		"ko": ConcertoBaseUrl+'vendor/Knockout/knockout-2.3.0.min',
		"concerto": ConcertoBaseUrl+'Concerto',
	},
	waitSeconds: 30
});

require([
		'jquery', 														// jQuery
		'ko', 															// ko
		'history', 														// History
		'router',														// Router
		"amplify", 														// Amplify
		'concerto'							 							// Concerto
		],
function( jQuery,
			ko,
			History,
			Router,
			Amplify,
			Concerto ) {

	$(document).ready( function() {
		console.log(Concerto);
	});
});