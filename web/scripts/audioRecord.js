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
	tuna,
	filter =0;
	var mixerTrack = null;

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

			$('.filter-button').on('click', function(e){

				filter = e.target.dataset.filter;
				
				window.location.hash = '#record';
			});

			priv.bindPlays();


			tuna = new Tuna(context);

		},

		bindPlays : function(){
			$('.play-button-hover').on('click', function(e){
				console.log(e);
				var au = e.target.parent().parent().find(audio);
				console.log(au);
				if(!au.paused){
					au.stop();
				}else{
					au.play();
				}
				
			});
		},

		record: function(stream){
			  navigator.getUserMedia({audio: true}, function(localMediaStream){
			    mediaStream = localMediaStream;
			    source = context.createMediaStreamSource(localMediaStream);
			    var src = priv.applyFilter(filter);
			    console.log(src);
			    console.log(filter);
			    rec = new Recorder(src, {
			      workerPath: '../scripts/recorderWorker.js'
			    });
				
			    rec.record();
			  }, function(err){
			    console.log('Not supported');
			  });
			// Wad.defaultImpulse = "scripts/impulses/matrix-reverb6.wav";
			// var voice = new Wad({
			//     source  : 'mic',
			//     reverb  : {
			//         wet : .7
			//     },
			//     filter  : {
			//         type      : 'highpass',
			//         frequency : 700
			//     },
			//     panning : -.2
			// });


			// mixerTrack = new Wad.Poly({
			//     recConfig : { // The Recorder configuration object. The only required property is 'workerPath'.
			//         workerPath : 'scripts/recorderWorker.js' // The path to the Recorder.js web worker script.
			//     }
			// });
			// mixerTrack.add(voice);
			
			// mixerTrack.rec.record();         // Start recording output from this PolyWad.
			// voice.play();           // Make some noise!
			//             // Take a break.
		},

		stop: function() {
			// mixerTrack.rec.stop();   
			// mixerTrack.rec.createWad();  
			mediaStream.stop();
  			rec.stop();
  	// 		console.log(mixerTrack.rec.recordings);
  			
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
				  	window.location.hash = '#success';
				  	priv.addItem(audio,username);


				  },
				  error: function(gameScore, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    console.log('Failed to create new object, with error code: ' + error.message);
				  }
				});
		},

		addItem : function(audio, username){
			var html= '<li class="ui-li-has-thumb ui-first-child hidden"><a href="#" class="ui-btn ui-btn-icon-right ui-icon-caret-r"><audio id="player" src="'+audio+'"></audio><h2>'+username+'</h2><p>'+username+'</p></a><div class="play-button-hover"><img src="../img/play-button.png" /> </div></li>';

			$('.audio-list').prepend(html);
			$('li.hidden').delay('400').slideToggle('400');
			priv.bindPlays();
		},


		applyFilter: function(filter){
			var src_return = null;

			switch(filter){
				  case 0:
					var echo = new tuna.Echo({
		                  makeupGain: 15,
		                  delay: 0.0045,                                 //0 to 20
		                  impulsePath: "impulses/LargeWideEchoHall.wav",    //path to your speaker impulse
		                  bypass: 0
		              });
		          	source.connect(echo.input);
					src_return = echo;
	
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
			        src_return = convolver;
					//convolver.connect(context.destination);
			        break;
			    case 2:
					var cabinet = new tuna.Cabinet({
		                  makeupGain: 15,
		                  delay: 0.0045,                                 //0 to 20
		                  impulsePath: "impulses/matrix-reverb6.wav",    //path to your speaker impulse
		                  bypass: 0
		              });
		          	source.connect(cabinet.input);
					src_return = cabinet;
			        break;
			    case 3:
		            var phaser = new tuna.Phaser({
		                rate: 6, //0.01 to 8 is a decent range, but higher values are possible
		                depth: 0.8, //0 to 1
		                feedback: 0.9, //0 to 1+
		                stereoPhase: 180, //0 to 180
		                baseModulationFrequency: 700, //500 to 1500
		                bypass: 0
		            });
		        	source.connect(phaser.input);
					src_return = phaser;
			        break;
			    case 4:

		            var tremolo = new tuna.Tremolo({
		                intensity: 0.9, //0 to 1
		                rate: 8, //0.001 to 8
		                stereoPhase: 50, //0 to 180
		                feedback: 0.9, //0 to 1+
		                bypass: 0
		            });
		        	source.connect(tremolo.input);
					src_return = tremolo;
			        break;

			  	default:

		            var tremolo = new tuna.Tremolo({
		                intensity: 0.9, //0 to 1
		                rate: 8, //0.001 to 8
		                stereoPhase: 50, //0 to 180
		                feedback: 0.9, //0 to 1+
		                bypass: 0
		            });
		        	source.connect(tremolo.input);
					src_return = tremolo;
			        break;

			}
		return src_return.output;

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