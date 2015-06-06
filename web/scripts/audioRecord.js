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
			});

			$('.filter-button-a').on('click', function(e){
				console.log('filter', e);
				//var filter = e.target.data('filter');
				
				window.location.hash = '#record';
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
				priv.applyFilter(3);
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
			   priv.saveWav(url,'sarasgm');
			   
			   
			}, 'audio/wav');
		},

		getUrl : function(){
			return url;
		},

		saveWav : function(audio, username){

			var AudiogramItem = Parse.Object.extend("AudiogramItem");
			var audiogramObject = new AudiogramItem();
			audiogramObject.set("username", username);
			audiogramObject.set("audioURL", audio);
			audiogramObject.save(null, {
				  success: function(gameScore) {
				    // Execute any logic that should take place after the object is saved.
				    console.log('New object created with objectId: ' + gameScore.id);
				  },
				  error: function(gameScore, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    console.log('Failed to create new object, with error code: ' + error.message);
				  }
				});
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
			    case 2:
					var cabinet = new tuna.Cabinet({
		                  makeupGain: 1,                                 //0 to 20
		                  impulsePath: "impulses/impulse_guitar.wav",    //path to your speaker impulse
		                  bypass: 0
		              });
		          	source.connect(cabinet.input);
					cabinet.connect(rec.node);
			        break;
			    case 3:
		            var phaser = new tuna.Phaser({
		                rate: 1.2, //0.01 to 8 is a decent range, but higher values are possible
		                depth: 0.8, //0 to 1
		                feedback: 0.9, //0 to 1+
		                stereoPhase: 180, //0 to 180
		                baseModulationFrequency: 700, //500 to 1500
		                bypass: 0
		            });
		        	source.connect(phaser.input);
					phaser.connect(rec.node);
			        break;
			    case 4:

		            var tremolo = new tuna.Tremolo({
		                intensity: 0.2, //0 to 1
		                rate: 8, //0.001 to 8
		                stereoPhase: 0, //0 to 180
		                feedback: 0.9, //0 to 1+
		                bypass: 0
		            });
		        	source.connect(tremolo.input);
					tremolo.connect(rec.node);
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