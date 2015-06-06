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
				priv.applyFilter(2);
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
			   priv.saveWav(e);
			   Recorder.forceDownload(e, "test.wav");
			   url = Recorder.getUrl(e, 'test.wav');
			   console.log(url);
			   
			});
		},

		getUrl : function(){
			return url;
		},

		saveWav : function(e, username){
			var AudiogramItem = Parse.Object.extend("AudiogramItem");
			var audiogramObject = new AudiogramItem();
			var parseFile = new Parse.File(username+'.wav', e);

			parseFile.save().then(function() {
			  	var AudiogramItem = Parse.Object.extend("AudiogramItem");
			  	var audiogramObject = new AudiogramItem();
				audiogramObject.set("username", username);
				audiogramObject.set("audio", parseFile);
				audiogramObject.save().then(function(){
					console.log('file saved');
				});
			}, function(error) {
				console.log("error", error);
			  // The file either could not be read, or could not be saved to Parse.
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
			    	var wahwah = new tuna.WahWah({
		                automode: true, //true/false
		                baseFrequency: 0.5, //0 to 1
		                excursionOctaves: 3, //1 to 6
		                sweep: 0, //0 to 1
		                resonance: 2, //1 to 100
		                sensitivity: 1, //-1 to 1
		                bypass: 0
		            });
		          	source.connect(wahwah.input);
					wahwah.connect(rec.node);
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