const express = require('express');
const bodyParser = require('body-parser');
const speech = require('@google-cloud/speech');
const cors = require('cors')
const fs = require('fs');
const path = require('path')

const multer = require('multer')
const request = require('request');
const _ = require('underscore');

const PORT = process.env.PORT || 3000;

const config = {
  projectId: 'Wellness-2d83d5b2e4ad',
  keyFilename: './Wellness-2d83d5b2e4ad'
};

// const options = {
//   hostname: 'https://speech.googleapis.com/v1',
//   path: '/speech:recognize',
//   method: 'POST',
//   headers: {
//     'content-type': 'application/json',
//     'accept': 'application/json'
//   }
// };

const app = express();
const client = new speech.SpeechClient();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.listen(PORT, function(){
  console.log('Listening on port ' + PORT);
});

// var storage = multer.diskStorage(
//   {
//     destination: './uploads/',
//     filename: function ( req, file, cb ) {
//       //req.body is empty...
//       cb( null, file.originalname+ '-' + Date.now()+".mp3");
//     }
//   }
// );

// const upload = multer({ storage: storage})

app.get('/', (req, res) => {
  return res.send('Welcome to Verso!');
});

// function getMostRecentFileName(dir) {
//   var files = fs.readdirSync(dir);

//   // use underscore for max()
//   return _.max(files, function (f) {
//       var fullpath = path.join(dir, f);

//       // ctime = creation time is used
//       // replace with mtime for modification time
//       return fs.statSync(fullpath).ctime;
//   });
// }
 

app.post('/transcribe', (req, res) => {

  //const file = req.file;
  
  // fileName = getMostRecentFileName('./uploads/')
  // const file = fs.readFileSync('./uploads/' + fileName);
  // console.log("file im sending is: "+ typeof file)
  // const audioBytes = file.toString('base64');
  // //console.log(audioBytes)

  // const audio = {
  //     content: audioBytes,
  //   };

  //   const config = {
  //     encoding: 'FLAC',
  //     sampleRateHertz: 16000,
  //     languageCode: 'en-US',
  //   };

  //   const send = {
  //     audio: audio,
  //     config: config,
  //   };

  //   var options = {
  //     uri: 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyDBJlHj0qmUZjLZjldzGSfgwqBNT2t_irY',
  //     method: 'POST',
  //     json: send
  //   };

  //   console.log(send)
  //   request.post(options, function (error, response, body){
  //      console.log(response)
  //   })
  //   // const response = client.recognize(send);
  //   // const transcription = response.results
  //   //   .map(result => result.alternatives[0].transcript)
  //   //   .join('\n');
  //   // console.log(`Transcription: ${transcription}`);
  


  // return res.send(fileName);
})



app.post('/sentiment', (req, res) => {
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
})
