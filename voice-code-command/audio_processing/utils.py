import wave
from pydub import AudioSegment
def get_audio_duration(file_path):
    """Check the duration of an audio file."""
    try:
        audio = AudioSegment.from_file(file_path)
        return len(audio) / 1000  # Duration in seconds
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return 0


def get_sample_rate(wav_file_path):
    """Get the sample rate of a WAV file."""
    try:
        with wave.open(wav_file_path, "rb") as wav_file:
            return wav_file.getframerate()
    except Exception as e:
        print(f"Error getting sample rate: {e}")
        return 16000  # Default to 16000 if there's an error
