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
	recording = false,
	tuna;

	var priv = {

		source : null,

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


			tuna = new Tuna(context);

		},

		record: function(stream){
			  navigator.getUserMedia({audio: true}, function(localMediaStream){
			    mediaStream = localMediaStream;
			    var mediaStreamSource = context.createMediaStreamSource(localMediaStream);
			    source = mediaStreamSource;
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
  			this.applyFilter(0);
			rec.exportWAV(function(e){
			   rec.clear();
			   Recorder.forceDownload(e, "test.wav");
			   url = Recorder.getUrl(e, 'test.wav');
			   console.log(url);
			   
			});
		},

		getUrl : function(){
			return url;
		},

		applyFilter: function(filter){
			audioNode = rec.getNode();

			switch(filter){
				  case 0:
				  	var chorus = new tuna.Chorus({
		                 rate: 1.5,
		                 feedback: 0.2,
		                 delay: 0.0045,
		                 bypass: 0
		             });
			        source.connect(chorus.input);
					chorus.connect(audioNode);
			        break;
			    case 1:
			        var chorus = new tuna.Chorus({
		                 rate: 1.5,
		                 feedback: 0.2,
		                 delay: 0.0045,
		                 bypass: 0
		             });
			        audioNode.connect(chorus.input);
					chorus.connect(anotherNativeNode);
			        break;

			}

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