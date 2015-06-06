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
	source = null,
	tuna;

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
				this.applyFilter(1);
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
			   //this.applyFilter(1,url);
			   console.log(url);
			   
			});
		},

		getUrl : function(){
			return url;
		},

		applyFilter: function(filter){


			switch(filter){
				  case 0:
				  	var chorus = new tuna.Chorus({
		                 rate: 1.5,
		                 feedback: 0.2,
		                 delay: 0.0045,
		                 bypass: 0
		             });
			        source.connect(chorus.input);
					chorus.connect(rec.node);
			        break;
			    case 1:
					var convolver = new tuna.Convolver({
	                    highCut: 22050,                         //20 to 22050
	                    lowCut: 20,                             //20 to 22050
	                    dryLevel: 1,                            //0 to 1+
	                    wetLevel: 1,                            //0 to 1+
	                    level: 1,                               //0 to 1+, adjusts total output of both wet and dry
	                    impulse: "../scripts/impulses/impulse_rev.wav",    //the path to your impulse response
	                    bypass: 0
	                });
			        source.connect(convolver.input);
					convolver.connect(rec.node);
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