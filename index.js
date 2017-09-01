const express = require('express');
const app = express();

const exec = require('child_process').exec;
const _ = require('lodash');
const mediainfo = require('mediainfo-q');
const async = require('async');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var multer  = require('multer');
var upload = multer({ dest: 'tmp/' })

const fs = require('fs');
const hash = require('custom-hash');
hash.configure({maxLength: 10});
const _FILEPATH = 'tmp/';

const token = process.env.TOKEN;

function getMediaInfo(filePath) {
	return new Promise(function(resolve, reject) {
		mediainfo(filePath)
		  .then(function (res) {
		    resolve(res);
		  }).catch(function (err) {
		    console.error("MediaInfoError",err);
		    reject(err);
		  });
	});
}

function getSecondsFromTimestamp(timestamp) {
	var time = timestamp.split(":");

	return time[0]*60*60 + time[1]*60 + time[2];
}

function calculateFrame(frameRate, startTime, seconds, frame) {
	var frameSeconds, start;
	start = getSecondsFromTimestamp(startTime);

	if(start === 0){
		frameSeconds = seconds;
	} else {
		frameSeconds = seconds - start;
	}
	frame = (frameSeconds * Math.floor(frameRate));
	return frame;
}

function extractFrames(videoName, imgHash, secondsBetween, frameCount) {
    return new Promise(function(resolve, reject) {
	    var frame, framerate, command, video, timecode, startTime, videoPath, imgFiles;
	      
	    startTime = '00:00:00';
	    videoPath = _FILEPATH+videoName;
	      
	    getMediaInfo(videoPath).then(function(info) {
	        video =  _.filter(info[0].tracks, function(track) { return track.type === "Video"; })[0];
	        timecode = _.filter(info[0].tracks, function(track) { return track.type === "OtherTime code"; })[0];
	        
	        if(timecode !== null && timecode !== undefined) {
	          startTime = timecodeTrack.time_code_of_first_frame;
	        }

	        frameRate = video.frame_rate.split(' ')[0];
	        frame = 0;
	        imgFiles = [];
	        command = '';

	        for(var i = 1; i <= frameCount; i++){
	        	frame = calculateFrame(frameRate, startTime, i*secondsBetween, frame);
	        	var imgFileName = _FILEPATH + imgHash + i + '.png';
	        	command  =  command+ 'ffmpeg -i ' + videoPath +' -s 640x480 -qscale 28 -vf "select=gte(n\\, ' + frame + ')" -frames:v 1 ' +  imgFileName +' -y && ';
	        	imgFiles.push(imgFileName);
	        }

			//Grab screen shot for each frame
			 command = command.slice(0, -3);
			 child = exec(command);
			 child.stdout.pipe(process.stdout);
			 child.on('exit', function(){
			 	fs.unlinkSync(videoPath);
				resolve(imgFiles);
			 });
	    });
    });
}


function readImages(imgArray){
	return new Promise(function(resolve, reject){
		var imgFiles = [];
		async.each(imgArray, function (img, callback) {
		    fs.readFile(img, "base64", function (err, data) {
		        if (err) return callback(err);
		        
		        imgFiles.push(data);
		        callback();
		    });
		}, function (err) {
		    if (err){
		    	console.error(err.message);
		    	reject(err);
		    }
		    _.each(imgArray, function(img){ fs.unlinkSync(img); });
			resolve(imgFiles);
		});
		
	});
}

app.post('/frames', upload.single('file'), function(req, res){ 
	
	if(req.body.token == undefined || req.body.token != token) {
		res.status(401).send( {
			message: "Invalid Token"
		});
	} else {
		//Save Video to /tmp/
		var videoFile, videoName, imgHash, secondsBetween, frameCount;
		videoFile = req.file;
		secondsBetween = req.body.secondsBetween;
		frameCount = req.body.frameCount;

		videoName = req.file.filename;
		imgHash = hash.digest('image' + Date.now());

		//Extract Frames
		extractFrames(videoName, imgHash, secondsBetween, frameCount).
		//Grab Frame Files as Base 64 Array
		then(readImages).
		//Send Files Back in Response as JSON string
		then( function (images, imgArray) {
			res.json(images);
		}).
		catch ( function(err){
			console.log(err);
			res.status(500).send();
		});
	}

});

app.get('/', function(req, res){
	console.log('videoFrame app accessed!');
	res.status(200).send();
});

app.listen(8080);