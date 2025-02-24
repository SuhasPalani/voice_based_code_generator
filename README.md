# Voice-Based Code Generator

This repository contains a **Voice-Based Code Generator** application that allows users to generate code using voice commands. The project is built using **React** for the frontend and **Flask** for the backend, integrating **OpenAI's API** and **Google LLM's API** for code generation and transcription functionalities.

---

## Features
- **Voice Input**: Record voice commands through the frontend.
- **Code Generation**: Convert transcribed voice commands into code using OpenAI and Google language models.
- **Audio Processing**: Handle audio resampling and conversion to ensure compatibility with transcription services.
- **Frontend-Backend Communication**: Seamless interaction between the React-based frontend and Flask backend.

---

## Project Structure

### Backend: `voice-code-command`
The backend is implemented in Python using Flask and includes audio processing and code generation modules.

#### Directory Structure:
```
voice-code-command/
├── audio_processing/
│   ├── __init__.py
│   ├── conversion.py       # Handles audio format conversion
│   ├── resampling.py       # Resamples audio files for compatibility
│   ├── transcription.py    # Transcribes audio to text using OpenAI API
│   ├── utils.py            # Utility functions for audio processing
├── code_generation/
│   ├── __init__.py
│   ├── openai.py           # Integrates OpenAI API for code generation
├── app.py                  # Main Flask application entry point
```

#### Key Dependencies:
- Flask
- OpenAI and Google Python SDK
- Pydub (for audio processing)
- ffmpeg (required for audio conversion)

---

### Frontend: `voice-code-command-frontend`
The frontend is built with React and provides a user-friendly interface for recording voice commands and displaying generated code.

#### Directory Structure:
```
voice-code-command-frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Interpreter.js  # Displays transcribed text and generated code
│   │   │   ├── Recorder.js     # Handles voice recording functionality
│   ├── App.js                  # Main React component
│   ├── index.js                # Entry point of the React app
```

#### Key Dependencies:
- React
- Axios (for API requests)
- Web Audio API (for recording)

---

## Setup Instructions

### Prerequisites:
1. Python 3.8+
2. Node.js 16+
3. ffmpeg installed on your system

### Backend Setup:
1. Navigate to the backend directory:
   ```bash
   cd voice-code-command
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows, use `env\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file with the following variables:
   ```
   OPENAI_API_KEY=
   ```
5. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup:
1. Navigate to the frontend directory:
   ```bash
   cd voice-code-command-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

---

## Usage

1. Start both the backend (`Flask`) and frontend (`React`) servers.
2. Open the frontend in your browser at `http://localhost:3000`.
3. Use the recorder to input voice commands.
4. View transcriptions and generated code in real-time.

---

## Technologies Used

- **Backend**: Flask, OpenAI API, Pydub, ffmpeg
- **Frontend**: React, Web Audio API

---

## Future Enhancements

1. Support for multiple programming languages.
2. Real-time error handling during transcription or code generation.
3. Improved UI/UX for better accessibility.

