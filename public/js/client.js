URL = window.URL || window.webkitURL;

var gumStream; 						
var rec; 							
var input; 							

var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext 

var record_button = document.getElementById("recordButton");
var stop_button = document.getElementById("stopButton");
var pause_button = document.getElementById("pauseButton");

record_button.addEventListener("click", startRec);
stop_button.addEventListener("click", stopRec);
pause_button.addEventListener("click", pauseRec);

function startRec() {
	console.log("record_button clicked");
    
    var constraints = { audio: true, video:false }

	//when recording stop and pause button is enabled
	record_button.disabled = true;
	stop_button.disabled = false;
	pause_button.disabled = false

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
		audioContext = new AudioContext();
		gumStream = stream;
		input = audioContext.createMediaStreamSource(stream);
		rec = new Recorder(input,{numChannels:1})
		rec.record()
		console.log("Recording started");

	}).catch(function(err) { // if error disable stop and pause button
		console.log(err)
    	record_button.disabled = false;
    	stop_button.disabled = true;
    	pause_button.disabled = true
	});
}

function pauseRec(){
	console.log("pause_button clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pause_button.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pause_button.innerHTML="Pause";

	}
}

function stopRec() {
	console.log("stop_button clicked");

	stop_button.disabled = true;
	record_button.disabled = false;
	pause_button.disabled = true;

	pause_button.innerHTML="Pause";
	rec.stop();
	gumStream.getAudioTracks()[0].stop();

	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	var filename = new Date().toISOString();

	au.controls = true;
	au.src = url;

	link.href = url;
	link.download = filename+".wav"; 
	link.innerHTML = "Save to disk";

	li.appendChild(au);
	li.appendChild(document.createTextNode(filename+".wav "))
	li.appendChild(link);
	
	var upload = document.createElement('button');
	upload.innerHTML = "Submit";
    upload.classList.add('btn')
	upload.addEventListener("click", function(event){
		  var fd=new FormData();
		  u_name = document.getElementById("username").value;
		  fd.append("user", u_name);
		  fd.append("audio",blob, filename);
		  fetch('http://localhost:3000/api/stt', {
    		method: 'POST',
    		body: fd,
  		  })
			.then((res) => console.log(res))
			.catch((err) => ('Error occurred', err))
	})
	li.appendChild(document.createTextNode (" "))
	li.appendChild(upload)

	recordingsList.appendChild(li);
}

/*function prevRecordings(){
	fetch('http://localhost:3000/api/stt/d6e0253b-ae2d-43ae-9d42-5e6fd8ef41bc', {
		method: 'GET'
	}).then((res) => {
		var val = res.text().then( resp => {
			var li = document.createElement('li');
			li.innerHTML = resp
			document.getElementById("prevRec").appendChild(li);
		})
	})
}*/

function getPrevRec(){
	u_name = document.getElementById("username").value;
	fetch('http://localhost:3000/api/stt/prev/' + u_name, {
		method: 'GET'
	}).then((res) => {
		var val = res.json().then( resp => {
			rec_text = resp.response
			for (let i = 0; i < rec_text.length; i++) {
				var li = document.createElement('li');
				li.innerHTML = "text:-  " + rec_text[i][0] + "&emsp;&emsp; gender:- " + rec_text[i][1]
				document.getElementById("prevRec").appendChild(li);
			}
		})
	})
}