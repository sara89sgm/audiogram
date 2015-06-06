require.config({
	paths: {
		'jquery' : "vendor/jquery-2.1.0.min",
		'recorderWorker' :'recorderWorker'
	}

});

require(['jquery', 'audioRecord'], function($, AudioRecord){
	Parse.initialize("u4iFjc0mVSgWBiNYJkDgXzeXbKAGIqoz44tGJsAj", "PCRQt6sDNhvL3UDGIDAZhzPCq9f2G635m3CzAu9n");

	AudioRecord.init('.recordButton');



});