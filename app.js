const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const speech = require('@google-cloud/speech');
var multer = require('multer')
const request = require('request');


var config = {
  projectId: 'Wellness-2d83d5b2e4ad',
  keyFilename: './Wellness-2d83d5b2e4ad'
};

const app = express();
var fs = require('fs'),
path = require('path'),
_ = require('underscore');

const client = new speech.SpeechClient();


const options = {
    hostname: 'https://speech.googleapis.com/v1',
    path: '/speech:recognize',
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json'
    }
};


var listener = app.listen(8888, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});


var storage = multer.diskStorage(
    {
        destination: './uploads/',
        filename: function ( req, file, cb ) {
            //req.body is empty...
            cb( null, file.originalname+ '-' + Date.now()+".mp3");
        }
    }
);

const upload = multer({ storage: storage})



app.get('/firmware/new', function(req, res) {
    return res.send("YOUR MOM");
  });


app.post('/transcribe', upload.single('avatar'), function(req, res) {
    //const file = req.file;
    
    fileName = getMostRecentFileName('./uploads/')
    const file = fs.readFileSync('./uploads/' + fileName);
    console.log("file im sending is: "+ typeof file)
    const audioBytes = file.toString('base64');
    console.log(audioBytes)

    const audio = {
        content: audioBytes,
      };

      const config = {
        encoding: 'FLAC',
        sampleRateHertz: 16000,
        audioChannelCount: 1,
        languageCode: 'en-US',
      };

      const send = {
        audio: audio,
        config: config,
      };

      // const response = client.recognize(send);
      // const transcription = response.results
      //   .map(result => result.alternatives[0].transcript)
      //   .join('\n');
      // console.log(`Transcription: ${transcription}`);
      


    request.post('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyDBJlHj0qmUZjLZjldzGSfgwqBNT2t_irY',{request:{
      audio: audio,
      config: config,
    }}, function(err, httpResponse, body){
      console.log(body);
    })


    return res.send(fileName);
})



app.post('/sentiment', function(req,res){
  const text = "This is the worst hackathon in the world I hate it."
  console.log(text)

  const lol  = {
    content: text,
    type: 'PLAIN_TEXT',
  };
  const document = {
    document:lol
  }

  console.log(document)
  request.post('https://language.googleapis.com/v1/documents:analyzeSentiment?key=AIzaSyDBJlHj0qmUZjLZjldzGSfgwqBNT2t_irY',
  {document: document}, function(err, httpResponse, body){
      console.log(body);
    })


})




function getMostRecentFileName(dir) {
    var files = fs.readdirSync(dir);

    // use underscore for max()
    return _.max(files, function (f) {
        var fullpath = path.join(dir, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).ctime;
    });
}