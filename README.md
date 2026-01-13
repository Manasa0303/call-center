# InspireWorks IVR Demo (Plivo Voice API)

A multi-level Interactive Voice Response (IVR) system demonstrating Plivo Voice API integration with outbound calling, language selection, and branching call flow logic.

## 🎯 Features

- **Outbound Calling**: Initiate calls to any phone number via web interface
- **Multi-Level IVR Menu**:
  - **Level 1**: Language selection (English/Spanish)
  - **Level 2**: Action selection (Play audio/Connect to associate)
- **Language-Specific Audio**: Different audio files for English and Spanish
- **Call Forwarding**: Connect callers to a live associate
- **Error Handling**: Graceful handling of invalid inputs with menu retry
- **Modern Web UI**: Clean, responsive control panel for initiating calls

## 📁 Project Structure

```
plivo/
├── server.js              # Express server with IVR logic and Plivo XML responses
├── public/
│   ├── index.html        # Web UI for initiating calls
│   └── style.css         # Styling for web interface
├── .env                  # Environment variables (Plivo credentials)
├── package.json          # Node.js dependencies
└── README.md            # This file
```

## 🛠️ Prerequisites

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **Plivo Account**: [Sign up at Plivo](https://www.plivo.com/)
- **ngrok**: For exposing local server to the internet ([Download ngrok](https://ngrok.com/))

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server framework
- `plivo` - Plivo SDK for Node.js
- `body-parser` - Parse incoming request bodies
- `dotenv` - Environment variable management

### 2. Configure Plivo Credentials

Create a `.env` file in the project root with your Plivo credentials:

```env
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_SOURCE_NUMBER=your_plivo_phone_number
TARGET_NUMBER=default_target_phone_number
```

**Where to find these:**
- Log in to [Plivo Console](https://console.plivo.com/)
- `PLIVO_AUTH_ID` and `PLIVO_AUTH_TOKEN`: Dashboard → Account Settings
- `PLIVO_SOURCE_NUMBER`: Your Plivo phone number (must be in E.164 format, e.g., `14155551234`)
- `TARGET_NUMBER`: Default phone number to call (optional, can be set in UI)

### 3. Start the Server

```bash
node server.js
```

Server will start on `http://localhost:3000`

### 4. Expose Server with ngrok

In a **new terminal window**, run:

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding    https://abc123.ngrok-free.dev -> http://localhost:3000
```

**Copy the `https://` URL** - you'll need this base URL (without `/ivr/welcome`).

## 🚀 How to Use

### Making a Call

1. **Open your browser**: Navigate to `http://localhost:3000`
2. **Enter ngrok URL**: Paste your ngrok base URL (e.g., `https://abc123.ngrok-free.dev`)
3. **Enter target phone number**: The number you want to call (E.164 format without spaces)
4. **Click "Make Call"**: Initiates the outbound call

### IVR Flow

Once the call is answered:

#### **Level 1 - Language Selection**
- Caller hears: *"Welcome to Inspire Works. Press 1 for English. Press 2 for Spanish."*
- **Press 1** → Continue in English
- **Press 2** → Continue in Spanish (*"Seleccionó Español..."*)

#### **Level 2 - Action Selection**

**English Path:**
- Caller hears: *"You selected English. Press 1 to play a message. Press 2 to talk to an associate."*
- **Press 1** → Plays trumpet audio + goodbye message
- **Press 2** → Connects to associate at `919035864327`

**Spanish Path:**
- Caller hears: *"Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado."*
- **Press 1** → Plays music audio + Spanish goodbye message
- **Press 2** → Connects to associate at `919035864327`

#### **Invalid Input Handling**
- Invalid entries at any level will prompt retry or redirect to welcome menu

## 🎵 Audio Files

- **English Audio**: `https://s3.amazonaws.com/plivocloud/Trumpet.mp3`
- **Spanish Audio**: `https://s3.amazonaws.com/plivocloud/music.mp3`
- **Associate Number**: `919035864327` (configurable in `server.js`)

## 🧪 Testing the System

### Quick Test Checklist:
- [ ] Server running on port 3000
- [ ] ngrok tunnel active and URL copied
- [ ] Entered ngrok URL in web interface
- [ ] Clicked "Make Call" and call initiated
- [ ] Answered phone and heard welcome message
- [ ] Pressed 1 or 2 for language
- [ ] Heard Level 2 menu in selected language
- [ ] Tested audio playback (Press 1)
- [ ] Tested call forwarding (Press 2)

### Debugging Tips:

**Check Server Logs**: The console shows detailed logging:
```
Initiating call From: [source] To: [target]
Incoming call received
BASE_URL: https://...
Level 1: Received digit: 1
Level 2: Received digit: 1, Language: en
```

**Common Issues:**
- **Call not progressing**: Ensure BASE_URL is being set (check logs)
- **No audio**: Verify ngrok tunnel is active
- **Invalid number**: Use E.164 format (country code + number, no spaces)

## 📋 API Endpoints

### Web UI
- `GET /` - Serve web interface

### API
- `POST /api/call` - Initiate outbound call
  - Body: `{ "targetNumber": "918031274121", "answerUrl": "https://your-ngrok-url" }`

### IVR Endpoints (Called by Plivo)
- `GET/POST /ivr/welcome` - Initial welcome message and language selection
- `POST /ivr/level1_process` - Process language selection
- `POST /ivr/action_process` - Process action selection (audio or associate)

## 🔧 Technology Stack

- **Backend**: Node.js + Express
- **API Integration**: Plivo Voice API
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Tunneling**: ngrok
- **Call Flow**: Plivo XML

## 📝 Assignment Compliance

✅ **Outbound Call**: Initiated via web UI with configurable target number  
✅ **Multi-Level IVR**: 2 levels (Language → Action)  
✅ **DTMF Handling**: Correct processing of digit inputs at each level  
✅ **Branching Logic**: Language-specific responses and actions  
✅ **Error Handling**: Invalid input handling with retry/redirect  
✅ **Audio Playback**: Language-specific MP3 files  
✅ **Call Forwarding**: Connects to live associate number  
✅ **Frontend**: Modern web UI for call initiation  
✅ **Documentation**: Comprehensive README with setup and testing instructions  

## 🎬 Demo Video

[3-5 minute demonstration showing]:
1. Starting the server and ngrok
2. Entering configuration in web UI
3. Initiating a call
4. Navigating Level 1 (Language selection)
5. Navigating Level 2 (Action selection)
6. Demonstrating audio playback
7. Demonstrating call forwarding to associate

## 📞 Support

For Plivo API documentation: https://www.plivo.com/docs/voice/api/overview/


**Built for InspireWorks Forward Deployed Engineer Technical Assignment**
