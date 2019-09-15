const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();

async function analyzeSentiment(dialog) {
  const document = {
    content: dialog,
    type: 'PLAIN_TEXT'
  }

  const [result] = await client.analyzeSentiment({document: document});
  const sentiment = result.documentSentiment;

  console.log(`Text: ${dialog}`);
  console.log(`Sentiment score: ${sentiment.score}`);
  console.log(`Sentiment magnitude: ${sentiment.magnitude}`);

  return sentiment;
}

module.exports = analyzeSentiment;