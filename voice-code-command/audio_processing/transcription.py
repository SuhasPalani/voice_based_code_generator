import requests
import os
from .utils import get_sample_rate

def transcribe_audio(audio_content, wav_file_path):
    """Send audio to Google Speech-to-Text API."""
    sample_rate = get_sample_rate(wav_file_path)  # Get the sample rate from the WAV file
    url = f"https://speech.googleapis.com/v1/speech:recognize?key={os.getenv('GOOGLE_API_KEY')}"

    data = {
        "config": {
            "encoding": "LINEAR16",  # Assuming the encoding is LINEAR16
            "sampleRateHertz": sample_rate,  # Use the sample rate from the WAV file
            "languageCode": "en-US",
            "enableAutomaticPunctuation": True,
            "model": "default",
            "useEnhanced": True,
        },
        "audio": {"content": audio_content},
    }

    try:
        response = requests.post(url, json=data)
        if response.status_code != 200:
            return {"error": "Failed to transcribe audio", "details": response.json()}

        return response.json()
    except Exception as e:
        print(f"Error in transcribe_audio: {e}")
        return {"error": "Failed to transcribe audio", "details": str(e)}
