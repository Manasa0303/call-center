require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const plivo = require('plivo');
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize Plivo Client for Outbound Calls
const authId = process.env.PLIVO_AUTH_ID;
const authToken = process.env.PLIVO_AUTH_TOKEN;
const sourceNumber = process.env.PLIVO_SOURCE_NUMBER;

const client = new plivo.Client(authId, authToken);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store the base URL for building absolute URLs in IVR responses
let BASE_URL = '';

// API Endpoint to Trigger Call from Frontend
app.post('/api/call', (req, res) => {
    const targetNumber = req.body.targetNumber || process.env.TARGET_NUMBER;
    let answerUrl = req.body.answerUrl; // Input from frontend

    if (!answerUrl) {
        return res.status(400).json({ error: 'Answer URL (Ngrok) is required.' });
    }

    // SANITIZATION FIX:
    // If the user pasted the full path (e.g. .../ivr/welcome), we strip it down to just the domain.
    try {
        // This handles cases like "https://xyz.ngrok.io/ivr/welcome" -> "https://xyz.ngrok.io"
        const urlObj = new URL(answerUrl);
        answerUrl = urlObj.origin;
    } catch (error) {
        // If invalid URL, we'll let it fail naturally or keep as is
        console.warn('Invalid URL provided, using as-is:', answerUrl);
    }

    // Store the base URL globally for IVR endpoints to use
    BASE_URL = answerUrl;

    console.log(`Initiating call From: ${sourceNumber} To: ${targetNumber}`);
    console.log(`Answer URL: ${answerUrl}/ivr/welcome`);

    client.calls.create(
        sourceNumber,
        targetNumber,
        `${answerUrl}/ivr/welcome`,
        { answer_method: 'GET' }
    ).then(function (response) {
        console.log('Call initiated:', response);
        res.json({ success: true, message: 'Call initiated successfully!', data: response });
    }, function (err) {
        console.error('Error initiating call:', err);
        res.status(500).json({ success: false, error: err.message });
    });
});

// 1. Incoming Call / Start of IVR
app.all('/ivr/welcome', (req, res) => {
    const response = new plivo.Response();
    console.log('Incoming call received');
    console.log('BASE_URL:', BASE_URL);

    const getInput = response.addGetInput({
        action: `${BASE_URL}/ivr/level1_process`,
        method: 'POST',
        numDigits: 1
    });

    getInput.addSpeak('Welcome to Inspire Works. Press 1 for English. Press 2 for Spanish.');
    response.addSpeak('No input received. Goodbye.');

    const xmlResponse = response.toXML();
    console.log('Generated XML:', xmlResponse);

    res.set('Content-Type', 'text/xml');
    res.send(xmlResponse);
});

// 2. Process Level 1 Input (Language)
app.all('/ivr/level1_process', (req, res) => {
    console.log('=== Level 1 Process Called ===');
    console.log('Request Method:', req.method);
    console.log('Request Body:', req.body);
    console.log('Request Query:', req.query);

    const digit = req.body.Digits;
    const response = new plivo.Response();

    console.log(`Level 1: Received digit: ${digit}`);

    if (digit === '1') {
        const getInput = response.addGetInput({
            action: `${BASE_URL}/ivr/action_process?lang=en`,
            method: 'POST',
            numDigits: 1
        });
        getInput.addSpeak('You selected English. Press 1 to play a message. Press 2 to talk to an associate.');
    } else if (digit === '2') {
        const getInput = response.addGetInput({
            action: `${BASE_URL}/ivr/action_process?lang=es`,
            method: 'POST',
            numDigits: 1
        });
        getInput.addSpeak('Seleccionó Español. Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado.', { language: 'es-US' });
    } else {
        response.addSpeak('Invalid selection. Please try again.');
        response.addRedirect(`${BASE_URL}/ivr/welcome`);
    }

    res.set('Content-Type', 'text/xml');
    res.send(response.toXML());
});

// 3. Process Level 2 Input (Action)
app.all('/ivr/action_process', (req, res) => {
    const digit = req.body.Digits;
    const lang = req.query.lang || 'en';
    const response = new plivo.Response();

    console.log(`Level 2: Received digit: ${digit}, Language: ${lang}`);

    if (digit === '1') {
        // Play language-specific audio
        let audioUrl;
        if (lang === 'en') {
            // English audio - A pleasant trumpet melody
            audioUrl = 'https://s3.amazonaws.com/plivocloud/Trumpet.mp3';
            response.addSpeak('Playing your message in English.');
        } else {
            // Spanish audio - A pleasant music track
            audioUrl = 'https://s3.amazonaws.com/plivocloud/music.mp3';
            response.addSpeak('Reproduciendo su mensaje en español.', { language: 'es-US' });
        }
        response.addPlay(audioUrl);
        response.addSpeak(lang === 'en' ? 'Thank you for calling. Goodbye!' : 'Gracias por llamar. Adiós!',
            lang === 'es' ? { language: 'es-US' } : {});
    } else if (digit === '2') {
        // Updated associate number
        const associateNumber = '919035864327';
        if (lang === 'en') {
            response.addSpeak('Connecting you to an associate. Please hold.');
        } else {
            response.addSpeak('Conectándole con un asociado. Por favor espere.', { language: 'es-US' });
        }
        response.addDial({ callerId: sourceNumber }).addNumber(associateNumber);
    } else {
        if (lang === 'en') {
            response.addSpeak('Invalid input. Please try again.');
        } else {
            response.addSpeak('Entrada inválida. Por favor, inténtelo de nuevo.', { language: 'es-US' });
        }
        // Redirect back to language menu
        response.addRedirect(`${BASE_URL}/ivr/welcome`);
    }

    res.set('Content-Type', 'text/xml');
    res.send(response.toXML());
});

app.listen(PORT, () => {
    console.log(`IVR Server is running on port ${PORT}`);
});
