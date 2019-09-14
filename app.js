const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();
var multer = require('multer')
const language = require('@google-cloud/language')
const languageClient = new language.LanguageServiceClient();



const app = express();
var fs = require('fs'),
path = require('path'),
_ = require('underscore');



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
    const file = req.file;
    
    fileName = getMostRecentFileName('./uploads/')
    const file = fs.readFileSync('./uploads/' + fileName);
    const audioBytes = file.toString('base64');

    const audio = {
        content: audioBytes,
      };

      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      };

      const request = {
        audio: audio,
        config: config,
      };


    return res.send(fileName);
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

//need to input text into function
const getSentimentData = async function(text){
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  const [result] = await languageClient.analyzeSentiment({document});
  return result;
}

const result = getSentimentData("I had a great week! I love my dog.")
const sentiment = result.documentSentiment;
console.log(`Document sentiment:`)
console.log(`  Score: ${sentiment.score}`);
console.log(`  Magnitude: ${sentiment.magnitude}`);