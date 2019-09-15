const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors')
const fs = require('fs');
const request = require('request-promise-native');
const resolveCwd = require('resolve-cwd');
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: './uploads/'});
const Firebase = require('firebase')
const speech = require('@google-cloud/speech');
const convertSpeech = require('./src/speechRecognition');
const analyzeSentiment = require('./src/sentimentAnalysis');

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



app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.listen(PORT, function(){
  console.log('Listening on port ' + PORT);
});

app.get('/', (req, res) => {
  return res.send('Welcome to Verso!');
});

app.post('/verso', upload.single('dialog'), async (req, res, next) => {
  try {
    console.log('Verso request received!')



    // The name of the audio file to transcribe
    const fileName = './' + req.file.path;
  
    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');
  
    console.log('Analyzing Tone...');
    const emotions = await request({
      method: 'POST',
      uri: 'http://localhost:5000/verso',
      json: true,
      body: {filePath: resolveCwd(fileName)}
    })

    console.log('Tone Analyzed. Results: ', JSON.stringify(emotions));

    console.log('Transcribing speech...');
    const speech = await convertSpeech(audioBytes);

    console.log('Speech Transcribed. Analyzing.')
    const positivity = await analyzeSentiment(speech);

    const results = {...emotions, ...positivity}
    console.log('Done.', results);
    next()
  } catch (error) {
    console.log('Error Transcribing.')
    next(error)
  }
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

