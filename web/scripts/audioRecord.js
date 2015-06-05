define(['jquery'], function($) {
    'use strict';

    var navigator = window.navigator,
		Context = window.AudioContext || window.webkitAudioContext,
		context = new Context();

    navigator.getUserMedia = (
  		navigator.getUserMedia ||
    	navigator.webkitGetUserMedia ||
    	navigator.mozGetUserMedia ||
    	navigator.msGetUserMedia
	);

	var mediaStream = null,
	rec = null,
	url = '',
	recording = false;

	var priv = {



		init: function(recordButtonSelector){
			$(recordButtonSelector).on('click', function(e){
				if(recording){
					priv.stop();
					$(recordButtonSelector).text('Record');
					recording = false;
				}else{
					priv.record();
					$(recordButtonSelector).text('Stop Recording');
					recording = true;
				}
			})

		},

		record: function(stream){
			  navigator.getUserMedia({audio: true}, function(localMediaStream){
			    mediaStream = localMediaStream;
			    var mediaStreamSource = context.createMediaStreamSource(localMediaStream);
			    rec = new Recorder(mediaStreamSource, {
			      workerPath: '../scripts/recorderWorker.js'
			    });

			    rec.record();
			  }, function(err){
			    console.log('Not supported');
			  });
		},

		stop: function() {
			mediaStream.stop();
  			rec.stop();

			rec.exportWAV(function(e){
			   rec.clear();
			   Recorder.forceDownload(e, "test.wav");
			   url = Recorder.getUrl(e, 'test.wav');
			   console.log(url);
			   
			});
		},

		getUrl : function(){
			return url;
		}


	};

	var audioRecord = {

		init : function(selector){
			priv.init(selector);
		},
        
        record : function() {
            priv.record();
        },

        stop: function() {
            priv.stop();
        },

        getUrl: function(){
            priv.getUrl();
        }
    };

    return audioRecord;

});