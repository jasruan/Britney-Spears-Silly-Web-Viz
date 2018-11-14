(function(){
		"use strict";
		var NUM_SAMPLES = 256;
        //tracks to be used
		var SOUND_1 = 'media/Better.mp3';
        var SOUND_2='media/Toxic.m4a';
        //audio 
		var audioElement;
		var analyserNode;
        var delayAmount=0;
        var delayNode;
        //the visual stuff that follows 
		var canvas,ctx,interval;
        var botCanvas, btx;
        var maxRadius=150; 
        var heartScale=2;
        var invert=false, tintRed=false, noise=false, lines=false, grayScale=false, playing=false;
        var circles=true,  stars=false, curves=false;
        //slideshow variables
        var image0= new Image();
         image0.src="images/britney_0.jpg";
        var image1= new Image();
        image1.src="images/britney_1.jpg";
        var image2= new Image();
        image2.src="images/britney_2.jpg";
        var image3= new Image();
         image3.src="images/britney_3.jpg";
        var image4= new Image();
         image4.src="images/britney_4.jpg";
         var image5= new Image();
         image5.src="images/britney_5.jpg";
        //put them in an array
        var images=new Array(image0, image1,image2,image3,image4,image5);
        var counter=0;
        //the counter that helps increment 
        
		function init(){
			// set up canvas stuff
			canvas = document.querySelector('#mainCanvas');
			ctx = canvas.getContext("2d");
            botCanvas=document.querySelector("#bottomCanvas");
            btx=botCanvas.getContext("2d");
            //setting the opacity that's behind the main canvas
            btx.globalAlpha=0.9;
            //placeholder image
            placeImage();
			// get reference to <audio> element on page
			audioElement = document.querySelector('audio');
        
			// call our helper function and get an analyser node
			analyserNode = createWebAudioContextWithAnalyserNode(audioElement);
			
			// get sound track <select> and Full Screen button working
			setupUI();
            
			// load and play default sound into audio element
			playStream(audioElement,SOUND_1);
            
			// start animation loop
			update();
            //draw the next image in line in the next 5000 milliseconds/5 seconds
            interval=setInterval(drawNextImg,5000);
            
		}

		
		function createWebAudioContextWithAnalyserNode(audioElement) {
			var audioCtx, analyserNode, sourceNode;
			// create new AudioContext
			// The || is because WebAudio has not been standardized across browsers yet
			// http://webaudio.github.io/web-audio-api/#the-audiocontext-interface
			audioCtx = new (window.AudioContext || window.webkitAudioContext);
			
			// create an analyser node
			analyserNode = audioCtx.createAnalyser();
            delayNode=audioCtx.createDelay();
            delayNode.delayTime.value=delayAmount;
             
			
			/*
			We will request NUM_SAMPLES number of samples or "bins" spaced equally 
			across the sound spectrum.
			
			If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
			the third is 344Hz. Each bin contains a number between 0-255 representing 
			the amplitude of that frequency.
			*/ 
			
			// fft stands for Fast Fourier Transform
			analyserNode.fftSize = NUM_SAMPLES;
			
			// this is where we hook up the <audio> element to the analyserNode
			sourceNode = audioCtx.createMediaElementSource(audioElement); 
			// here we connect to the destination i.e. speakers
            sourceNode.connect(audioCtx.destination);
            sourceNode.connect(delayNode);
            delayNode.connect(analyserNode);
            //connect to destination
            analyserNode.connect(audioCtx.destination);
           
			return analyserNode;
            
		}
        //all the set up that includes: sliders, checkboxes, and selections 
		function setupUI(){
			document.querySelector("#trackSelect").onchange = function(e){
				playStream(audioElement,e.target.value);
			};
			
			document.querySelector("#fsButton").onclick = function(){
				requestFullscreen(canvas);
			};
            document.querySelector("#slider").onchange=function(e){
                maxRadius=e.target.value *50; 
            };
        //visual effects
            document.querySelector("#tintRed").onchange=function(e){
                if(e.target.checked){
                    tintRed=true;
                }
                else
                    tintRed=false;
            };
             document.querySelector("#invert").onchange=function(e){
                  if(e.target.checked){
                    invert=true;
                }
                else
                    invert=false;
            };
             document.querySelector("#lines").onchange=function(e){
                  if(e.target.checked){
                    lines=true;
                }
                else
                    lines=false;
            };
            document.querySelector("#noise").onchange=function(e){
                if(e.target.checked){
                    noise=true;
                }
                else
                    noise=false;
		  };
              document.querySelector("#grayScale").onchange=function(e){
                if(e.target.checked){
                    grayScale=true;
                }
                else
                    grayScale=false;
		  };
            //for delay/reverb effect slider
            document.querySelector("#delaySlider").onchange=function(e){
                delayAmount=e.target.value;
            };
            //heart size slider
            document.querySelector("#heartSlider").onchange=function(e){
                heartScale=e.target.value/3;
            };
            //for the drawing shapes selection 
            document.querySelector("#shapes").onchange=function(e){
                if(e.target.value=="stars"){
                    stars=true;
                    circles=false;
                    curves=false;
                }
                else if(e.target.value=="curves"){
                    stars=false;
                    circles=false;
                    curves=true;
                }
               else if(e.target.value="circles"){
                  circles=true;
                   stars=false;
                   curves=false;
               }
                
        };
        }
		//play the audio that gets passed in 
		function playStream(audioElement,path){
			audioElement.src = path;
			audioElement.play();
			audioElement.volume = 0.1;
			document.querySelector('#status').innerHTML = "Now playing: " + path;
            
		}
        //the visual filters 
        function manipulatePixels(){
            var imageData=ctx.getImageData(0,0, canvas.width, canvas.height);
            var data=imageData.data;
            var length=data.length;
            var width=imageData.width;
            
            for(var i=0; i<length; i+=4){
                if(tintRed){
                    data[i]=data[i]+100;
                }
                
                if(invert){
                    var red=data[i], green=data[i+1], blue=data[i+2];
                    data[i]=255-red;
                    data[i+1]=255-green;
                    data[i+2]=255-blue;
                }
                if(noise && Math.random()<.10){
                    data[i]=data[i+1]=data[i+2]=255;
                    data[i+3]=255;//alpha
                }
                if(lines){
                    var row=Math.floor(i/4/width);
                    if(row%50 ==0){
                        data[i]=data[i+1]=data[i+2]=data[i+3]=255;
                        data[i+(width*4)]=
                        data[i+(width*4)+1]=
                        data[i+(width*4)+2]=
                        data[i+(width*4)+3]=255;
                    }
                }
                //apply the gray scale filter by finding the average of the 3 rgb values 
                //and then setting the rgb value equal to the average
                if(grayScale){
                var avg=(data[i]+data[i+1]+data[i+2])/3;
                data[i]=avg;
                data[i+1]=avg;
                data[i+2]=avg;
            }
                
            }
            ctx.putImageData(imageData,0,0);
                
        }//end of manip pixels
        
        
    //this method was created to place a place holder image and drawing it to the middle of the behind the
        //scenes function.
        function placeImage(){
            var imgObj = new Image();
            imgObj.onload=function(){
                btx.drawImage(imgObj, botCanvas.width/2-imgObj.width/2, botCanvas.height/2-imgObj.height/2); 
            };
            imgObj.src="images/britney_5.jpg";
        }
        //method was created to progress through the next set of images in the array in order by 
        //incrementing counter  and then going back to the beginning of the array to start over again
        function drawNextImg(){
            //clear the canvas so the images dont overlap each other
            btx.clearRect(0,0,botCanvas.width,botCanvas.height);
            //draw the images in the middle of the canvas and draw the image base on the counter
            btx.drawImage(images[counter],botCanvas.width/2-images[counter].width/2, botCanvas.height/2-images[counter].height/2);
            //increment through the images therefore it doesn't pause!                                   
              counter++;
            if(images.length==counter){
                counter=0;
                //reset from the beginning
            }
        }
        //draw the heart based on x and y parameters and translate the origin to the middle
        function drawHeart(x,y){
            var heart= new Image();
            //load in the image
            heart.src="images/heart.png";
            ctx.save();
            ctx.translate(-32,-28);
            ctx.drawImage(heart,x,y);
            ctx.restore();
        }
        //draw the star and scale it smaller than the actual image 
        function drawStar(x,y){
            var star=new Image();
             //load in the image
            star.src="images/star.png";
            ctx.save();
            ctx.scale(0.5,0.5);
            ctx.drawImage(star,x,y);
            ctx.restore();
        }
        /* Where all the main canvas' animations are draw
        */
		function update() { 
			// this schedules a call to the update() method in 1/60 seconds
			requestAnimationFrame(update);
			/*
				Nyquist Theorem
				http://whatis.techtarget.com/definition/Nyquist-Theorem
				The array of data we get back is 1/2 the size of the sample rate 
			*/
			
			// create a new array of 8-bit integers (0-255)
			var data = new Uint8Array(NUM_SAMPLES/2); 
			
			// populate the array with the frequency data
			// notice these arrays can be passed "by reference" 
            //depending on the datadisplay select value it will show either frequency/waveform
            if(document.querySelector("#dataDisplay").value=="frequency"){
			analyserNode.getByteFrequencyData(data);
            }
            if(document.querySelector("#dataDisplay").value=="waveform"){
			// OR
			analyserNode.getByteTimeDomainData(data); // waveform data
            }
			// DRAW!
			ctx.clearRect(0,0,800,600);  
			var barWidth = 4;
			var barSpacing = 1;
			var barHeight = 100;
			var topSpacing = 50;
            
			
			// loop through the data and draw!
			for(var i=0; i<data.length; i++) { 
				// the higher the amplitude of the sample (bin) the taller the bar
				// remember we have to draw our bars left-to-right and top-down
                if(circles){
                ctx.beginPath();
                ctx.fillStyle=gradient();
	            ctx.arc(i*(barWidth + barSpacing),topSpacing+350-data[i],5,2*Math.PI,false);
                ctx.fill();
                ctx.closePath();
                ctx.beginPath();
                ctx.strokeStyle=gradient();
	            ctx.arc(640-i*(barWidth + barSpacing),topSpacing+350-data[i]-20,5,2*Math.PI,false);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
                }
                var percent=data[i]/255;
                var circleRadius=percent*maxRadius;
            
                //draw heart and move to middle
                ctx.save();
                //have to keep in mind of how the image is scaled to keep it in the middle
                ctx.translate(canvas.width/2+2*(heartScale/2), canvas.height/2+20*(heartScale/2));
                ctx.scale(heartScale +2*percent,heartScale+2*percent);
                drawHeart(0,0);
                ctx.restore();
              
                if(stars){
                //draw the stars when the shape is selected to be drawn aka stars is set to true
                drawStar(i * (barWidth + barSpacing+50),topSpacing + 650-data[i]);
                drawStar(canvas.width*2-i*(barWidth+barSpacing+50),topSpacing +650-data[i]-100);
                }
                //draw quadratic curves if curves is selected and set to true
                if(curves){
                    //will be rainbow curves. 
                    ctx.strokeStyle=gradient;
                    ctx.beginPath();
                    //start from the left end middle of the canvas. 
                    ctx.moveTo(0,canvas.height/2);
                 ctx.quadraticCurveTo(canvas.width/2,data[i]*2,canvas.width,canvas.height/2);
                    ctx.closePath();
                    ctx.stroke();
                }
                //the background circles
                //this is the bigger one that you usually see. 
                ctx.beginPath();
                ctx.arc(canvas.width/2,canvas.height/2, circleRadius*1.2,0,2*Math.PI,false);
                ctx.stroke();
                ctx.closePath();
                //this is a very smalle one that you only see when in the waveform data 
                //it looks like a green circle, but it's really a gradient fill circle. 
                ctx.beginPath();
                ctx.fillStyle=makeColor(255,111,111,.34-percent/3.0);
                ctx.arc(canvas.width/2, canvas.height/2, circleRadius*0.5,0,2*Math.PI,false);
                ctx.fill();
                ctx.closePath(); 
                 
			}
            delayNode.delayTime.value=delayAmount; 
			manipulatePixels();
		} 
		
		// HELPER
		function makeColor(red, green, blue, alpha){
   			var color='rgba('+red+','+green+','+blue+', '+alpha+')';
   			return color;
		}
        //Gradient overlay
        function gradient(){
            var grad=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
            grad.addColorStop(1/7, 'red');
            grad.addColorStop(2 / 7, 'orange');
            grad.addColorStop(3 / 7, 'yellow');
            grad.addColorStop(4 / 7, 'green')
            grad.addColorStop(5 / 7, 'aqua');
            grad.addColorStop(6 / 7, 'blue');
            grad.addColorStop(7/7, 'purple');
            return grad;
        }
		
		 // FULL SCREEN MODE
		function requestFullscreen(element) {
			if (element.requestFullscreen) {
			  element.requestFullscreen();
			} else if (element.mozRequestFullscreen) {
			  element.mozRequestFullscreen();
			} else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
			  element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
			  element.webkitRequestFullscreen();
			}
			// .. and do nothing if the method is not supported
		};
		
		
		window.addEventListener("load",init);
	}());