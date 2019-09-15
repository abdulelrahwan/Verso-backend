const express = require('express');
// const session = require('express-session');
const bodyParser = require('body-parser');
// const passport = require('passport');
const speech = require('@google-cloud/speech');
var multer = require('multer')
const request = require('request');
var Firebase = require('firebase')
let cors = require('cors')



var config = {
  projectId: 'Wellness-2d83d5b2e4ad',
  keyFilename: './Wellness-2d83d5b2e4ad'
};

const app = express();
var fs = require('fs'),
path = require('path'),
_ = require('underscore');
const client = new speech.SpeechClient();

Firebase.initializeApp({
  databaseURL: "https://wellness-1568474056109.firebaseio.com/",
  serviceAccount: './wellness-1568474056109-export.json', //this is file that I downloaded from Firebase Console
});

var db = Firebase.database();
var personRef = db.ref("person");


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(express.json());
app.use(cors());


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
            cb( null, Date.now() + '-' + file.originalname);
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
    //console.log(audioBytes)

    const audio = {
        content: audioBytes,
      };

      const config = {
        encoding: 'FLAC',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      };

      const send = {
        audio: audio,
        config: config,
      };

      var options = {
        uri: 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyDBJlHj0qmUZjLZjldzGSfgwqBNT2t_irY',
        method: 'POST',
        json: send
      };

      console.log(send)
      request.post(options, function (error, response, body){
         console.log(response)
      })
      // const response = client.recognize(send);
      // const transcription = response.results
      //   .map(result => result.alternatives[0].transcript)
      //   .join('\n');
      // console.log(`Transcription: ${transcription}`);
    


    return res.send(fileName);
})



app.post('/sentiment', function(req,res){
  const text = req.body.text;
  console.log(text)

  const lol  = {
    content: text,
    type: 'PLAIN_TEXT',
  };
  const document = {
    document:lol
  }
  var options = {
    uri: 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=AIzaSyDBJlHj0qmUZjLZjldzGSfgwqBNT2t_irY',
    method: 'POST',
    json: {
      "document": lol
    }
  };
  request.post(options, function (error, response, body) {
    console.log(body);
    res.send(200)
  }
  
  )
  console.log(document)
  // request.post('https://language.googleapis.com/v1/documents:analyzeSentiment?key=AIzaSyDBJlHj0qmUZjLZjldzGSfgwqBNT2t_irY',
  // lol, function(err, httpResponse, body){
  //     console.log(body);
  //   })


})


app.post('/addToDB', function(req,res){
  const afraid = req.body.afraid;
  const happy = req.body.happy;
  const neutral = req.body.neutral;
  const sad = req.body.sad;
  const anger = req.body.anger;
  const sentimentMagnitude = req.body.sentimentMagnitude;
  const sentimentScore = req.body.sentimentScore;
  const date = Date.now();

  const data = {
     afraid: req.body.afraid,
     happy : req.body.happy,
     neutral: req.body.neutral,
     sad: req.body.sad,
     anger: req.body.anger,
     sentimentMagnitude: req.body.sentimentMagnitude,
     sentimentScore: req.body.sentimentScore,
     date: Date.now()
  }
  personRef.push(data, function(err){
    if(err){
      res.send(err);
    } else {
      res.json({message: "Success: User Save.", result: true, data:data});
    }
  })

})


app.get('/sentimentScores', function(req, res){
  var scores = []
  personRef.once('value', (snapshot) => {
    snapshot.forEach((child) => {
      console.log(child.key, child.val()); 
      scores.push(child.val().sentimentScore)
      console.log("scores: " + scores);
      
    })
    res.send({scores: scores})
  })
  // scoresString = JSON.stringify(scores);
  
})

app.get('/avgFeelings',function (req, res){
  var happyScores = [];
  var sadScores = [];
  var angryScores = [];
  var neutralScores = [];
  var afraidScores = [];

  var happyAvg;
  var sadAvg;
  var angryAvg;
  var neutralScores;
  var afraidScores;

  personRef.once('value', (snapshot) => {
    snapshot.forEach((child) => {
      happyScores.push(child.val().happy);
      sadScores.push(child.val().sad);
      angryScores.push(child.val().anger);
      neutralScores.push(child.val().neutral);
      afraidScores.push(child.val().afraid);

    })
    var sum = 0;
    happyScores.forEach(function(element){
      sum = sum + element
    })
    happyAvg = sum / happyScores.length;
    console.log("happyavg: "+ happyAvg);

    sum = 0;
    sadScores.forEach(function(element){
      sum = sum + element
    })
    sadAvg = sum / sadScores.length; 

    sum = 0;
    angryScores.forEach(function(element){
      sum = sum + element
    })
    angryAvg = sum / angryScores.length; 
    

    sum = 0;
    neutralScores.forEach(function(element){
      sum = sum + element
    })
    neutralAvg = sum / neutralScores.length; 
    
    sum = 0;
    afraidScores.forEach(function(element){
      sum = sum + element
    })
    afraidAvg = sum / afraidScores.length; 
    
    var averages = {
      happyAvg: happyAvg,
      sadAvg: sadAvg,
      angryAvg: angryAvg,
      neutralAvg: neutralAvg,
      afraidAvg: afraidAvg
    }

    res.json({message: "Success: User Save.", result: true, data: averages});
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
