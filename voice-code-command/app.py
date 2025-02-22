from flask import Flask, request, jsonify
from flask_cors import CORS
from audio_processing.conversion import convert_mp3_to_wav, convert_webm_to_wav
from audio_processing.resampling import resample_audio
from audio_processing.transcription import transcribe_audio
from audio_processing.utils import get_audio_duration, get_sample_rate
from code_generation.openai import generate_code_from_text
import mimetypes
import base64
import os

app = Flask(__name__)
CORS(app)

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
        resampled_wav_path = "resampled_audio.wav"  # Path to the resampled WAV file

        if os.path.exists(wav_path):
            os.remove(wav_path)

        if os.path.exists(resampled_wav_path):
            os.remove(resampled_wav_path)
    
        # Step 1: Handle different audio formats
        if mime_type == "video/webm":  # WebM file
            webm_path = temp_path + ".webm"
            audio_file.save(webm_path)
            convert_webm_to_wav(webm_path, wav_path)  # Convert WebM to WAV
            os.remove(webm_path)  # Remove WebM file

        elif mime_type == "audio/wav":  # Already a WAV file
            audio_file.save(wav_path)

        elif mime_type == "audio/mpeg":  # MP3 file
            mp3_path = temp_path + ".mp3"
            audio_file.save(mp3_path)
            convert_mp3_to_wav(mp3_path, wav_path)  # Convert MP3 to WAV
            os.remove(mp3_path)  # Remove MP3 file

        else:
            return jsonify({"error": "Unsupported audio format"}), 400

        # Step 2: Resample the audio to a fixed sample rate (16000 Hz)
        resample_audio(wav_path, resampled_wav_path, target_sample_rate=16000)

        # Step 3: Get audio duration
        duration = get_audio_duration(resampled_wav_path)
        print(f"Audio Duration: {duration} seconds")

        if duration < 1:
            os.remove(resampled_wav_path)
            return jsonify({"error": "Audio too short to transcribe"}), 400

        # Step 4: Get sample rate (before removing resampled file)
        sample_rate = get_sample_rate(resampled_wav_path)
        print(f"Sample Rate: {sample_rate}")

        with open(resampled_wav_path, "rb") as f:
            audio_content = base64.b64encode(f.read()).decode("utf-8")

        os.remove(resampled_wav_path)  # Cleanup

        transcription_result = transcribe_audio(audio_content, resampled_wav_path)

        if "error" in transcription_result:
            return jsonify(transcription_result), 400

        if transcription_result.get("results") and transcription_result["results"][0].get("alternatives"):
            transcript = transcription_result["results"][0]["alternatives"][0]["transcript"]
            confidence = transcription_result["results"][0]["alternatives"][0].get("confidence", 0)

            # Now, generate code based on the transcript using AI
            generated_code = generate_code_from_text(transcript)

            return jsonify({
                "transcription": transcript,
                "confidence": confidence,
                "generated_code": generated_code,
                "status": "success",
            })

        return jsonify({"error": "No transcription found"}), 400

    except Exception as e:
        print(f"Error in transcribe endpoint: {e}")
        return jsonify({"error": str(e), "status": "error"}), 500


if __name__ == "__main__":
    app.run(debug=True)
