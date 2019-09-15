const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs');
const path = require('path')
const request = require('request');

const PORT = process.env.PORT || 3000;

const {convertSpeech} = require('./src/speechRecognition');
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.listen(PORT, function(){
  console.log('Listening on port ' + PORT);
});

app.get('/', (req, res) => {
  return res.send('Welcome to Verso!');
});

app.post('/transcribe', async (req, res, next) => {
  try {
    console.log('Transcribe request received!')
  
    // TODO: receive the body of the req (base64 audio) and send it to convertSpeech()
    
    // The name of the audio file to transcribe
    const fileName = './sample.wav';
  
    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');
  
    await convertSpeech(audioBytes)

    next()
  } catch (error) {
    console.log('Error Transcribing.')
    next(error)
  }
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
