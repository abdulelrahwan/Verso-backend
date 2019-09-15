const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function convertSpeech(base64Audio) {
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: base64Audio,
  };

  const config = {
    encoding: 'LINEAR16',
    languageCode: 'en-US',
  };

  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  return transcription
}

module.exports = {convertSpeech};