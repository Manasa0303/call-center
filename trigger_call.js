require('dotenv').config();
const plivo = require('plivo'); // Plivo Node.js Helper Library

const authId = process.env.PLIVO_AUTH_ID;
const authToken = process.env.PLIVO_AUTH_TOKEN;
const sourceNumber = process.env.PLIVO_SOURCE_NUMBER;
const targetNumber = process.env.TARGET_NUMBER;

if (!authId || !authToken) {
    console.error('Error: PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN must be set in .env file');
    process.exit(1);
}

const client = new plivo.Client(authId, authToken);

// Get the answer URL from command line or hardcode if testing
const answerUrl = process.argv[2];

if (!answerUrl) {
    console.error('Usage: node trigger_call.js <ANSWER_URL>');
    console.error('Example: node trigger_call.js https://your-server.ngrok-free.app/ivr/welcome');
    process.exit(1);
}

console.log(`Initiating call From: ${sourceNumber} To: ${targetNumber}`);
console.log(`Answer URL: ${answerUrl}`);

client.calls.create(
    sourceNumber, // from
    targetNumber, // to
    answerUrl,    // answer_url
    {
        answer_method: 'GET', // Or POST, matching our server
    }
).then(function (response) {
    console.log('Call initiated successfully!');
    console.log(response);
}, function (err) {
    console.error('Error initiating call:');
    console.error(err);
});
