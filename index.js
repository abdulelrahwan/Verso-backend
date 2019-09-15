const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs');

const PORT = process.env.PORT || 3000;

const convertSpeech = require('./src/speechRecognition');
const analyzeSentiment = require('./src/sentimentAnalysis');

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

app.post('/verso', async (req, res, next) => {
  try {
    console.log('Verso request received!')
  
    // TODO: receive the body of the req (base64 audio) and send it to convertSpeech()

    // The name of the audio file to transcribe
    const fileName = './sample.wav';
  
    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');
  
    console.log('Transcribing speech...')
    const speech = await convertSpeech(audioBytes);

    console.log('Speech Transcribed. Analyzing.')
    const analysis = await analyzeSentiment(speech);

    console.log('Done.');
    next()
  } catch (error) {
    console.log('Error Transcribing.')
    next(error)
  }
})
