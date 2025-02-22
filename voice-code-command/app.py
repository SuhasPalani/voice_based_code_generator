from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import mimetypes
import os
from dotenv import load_dotenv
import wave
from pydub import AudioSegment
import ffmpeg

# Load environment variables
app = Flask(__name__)
CORS(app)
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def get_wav_properties(audio_file):
    """Extract WAV file properties."""
    try:
        with wave.open(audio_file, "rb") as wav_file:
            return {
                "channels": wav_file.getnchannels(),
                "sample_width": wav_file.getsampwidth(),
                "framerate": wav_file.getframerate(),
            }
    except Exception as e:
        print(f"Error reading WAV properties: {e}")
        return None

def convert_webm_to_wav(webm_file_path, wav_file_path):
    """Convert WebM to WAV using ffmpeg."""
    try:
        ffmpeg.input(webm_file_path).output(wav_file_path, acodec="pcm_s16le", ar="16000").run()
        print(f"Converted WebM to WAV: {wav_file_path}")
    except ffmpeg.Error as e:
        print(f"Error converting WebM to WAV: {e}")
        raise

def get_audio_duration(file_path):
    """Check the duration of an audio file."""
    try:
        audio = AudioSegment.from_file(file_path)
        return len(audio) / 1000  # Duration in seconds
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return 0

def transcribe_audio(audio_content, encoding_type="LINEAR16", sample_rate=16000):
    """Send audio to Google Speech-to-Text API."""
    url = f"https://speech.googleapis.com/v1/speech:recognize?key={GOOGLE_API_KEY}"
    data = {
        "config": {
            "encoding": encoding_type,
            "sampleRateHertz": sample_rate,
            "languageCode": "en-US",
            "enableAutomaticPunctuation": True,
            "model": "default",
            "useEnhanced": True,
        },
        "audio": {"content": audio_content},
    }

    try:
        response = requests.post(url, json=data)
        print("Google API Response:", response.json())

        if response.status_code != 200:
            return {"error": "Failed to transcribe audio", "details": response.json()}

        return response.json()
    except Exception as e:
        print(f"Error in transcribe_audio: {e}")
        return {"error": "Failed to transcribe audio", "details": str(e)}

def generate_code_from_text(prompt):
    """Use OpenAI API to generate Python code based on the transcribed text."""
    try:
        if not OPENAI_API_KEY:
            return "Error: Missing OpenAI API key."

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        # More structured prompt
        refined_prompt = f"Write a Python function based on the following description:\n\n{prompt}\n\nEnsure the code is complete and formatted properly."

        data = {
            "model": "gpt-3.5-turbo",  # Changed from gpt-4 to gpt-3.5-turbo
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that generates Python code."},
                {"role": "user", "content": refined_prompt}
            ],
            "max_tokens": 200,
            "temperature": 0.5,
        }

        print("Sending request to OpenAI:", data)

        response = requests.post(
            "https://api.openai.com/v1/chat/completions",  # Changed endpoint
            headers=headers,
            json=data
        )

        response_data = response.json()
        print("OpenAI Response:", response_data)  # Debugging output

        if response.status_code != 200:
            return f"Error: OpenAI API request failed. Details: {response_data}"

        if "choices" in response_data and len(response_data["choices"]) > 0:
            return response_data["choices"][0]["message"]["content"].strip()

        return "Error: OpenAI did not return code."

    except Exception as e:
        print(f"Error generating code: {e}")
        return f"Error: {e}"


    except Exception as e:
        print(f"Error generating code: {e}")
        return f"Error: {e}"



@app.route("/transcribe", methods=["POST"])
def transcribe():
    """Handle audio file upload and process transcription, then generate code from transcription."""
    try:
        if not request.files:
            return jsonify({"error": "No files in request"}), 400

        audio_file = request.files.get("audio")
        if not audio_file:
            return jsonify({"error": "No audio file provided"}), 400

        print(f"Received file: {audio_file.filename}")
        mime_type, _ = mimetypes.guess_type(audio_file.filename)
        print(f"MIME Type: {mime_type}")

        temp_path = "temp_audio"
        wav_path = "temp_audio.wav"

        if mime_type == "video/webm":  # WebM file
            webm_path = temp_path + ".webm"
            audio_file.save(webm_path)

            convert_webm_to_wav(webm_path, wav_path)  # Convert to WAV
            os.remove(webm_path)  # Remove WebM file

        elif mime_type == "audio/wav":  # Already a WAV file
            audio_file.save(wav_path)

        else:
            return jsonify({"error": "Unsupported audio format"}), 400

        duration = get_audio_duration(wav_path)
        print(f"Audio Duration: {duration} seconds")

        if duration < 1:
            os.remove(wav_path)
            return jsonify({"error": "Audio too short to transcribe"}), 400

        with open(wav_path, "rb") as f:
            audio_content = base64.b64encode(f.read()).decode("utf-8")

        os.remove(wav_path)  # Cleanup

        transcription_result = transcribe_audio(audio_content)

        if "error" in transcription_result:
            return jsonify(transcription_result), 400

        if (
            transcription_result.get("results")
            and transcription_result["results"][0].get("alternatives")
        ):
            transcript = transcription_result["results"][0]["alternatives"][0]["transcript"]
            confidence = transcription_result["results"][0]["alternatives"][0].get("confidence", 0)

            # Now, generate code based on the transcript using AI
            generated_code = generate_code_from_text(transcript)

            return jsonify({"transcription": transcript, "confidence": confidence, "generated_code": generated_code, "status": "success"})

        return jsonify({"error": "No transcription found"}), 400

    except Exception as e:
        print(f"Error in transcribe endpoint: {e}")
        return jsonify({"error": str(e), "status": "error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
