const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors')
const fs = require('fs');
const request = require('request-promise-native');
const resolveCwd = require('resolve-cwd');

const PORT = process.env.PORT || 3000;
const upload = multer({ dest: './uploads/'});

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
