from pydub import AudioSegment
import ffmpeg

def convert_mp3_to_wav(mp3_file_path, wav_file_path):
    """Convert MP3 to WAV using pydub."""
    try:
        audio = AudioSegment.from_mp3(mp3_file_path)
        audio.export(wav_file_path, format="wav")
        print(f"Converted MP3 to WAV: {wav_file_path}")
    except Exception as e:
        print(f"Error converting MP3 to WAV: {e}")
        raise


def convert_webm_to_wav(webm_file_path, wav_file_path):
    """Convert WebM to WAV using ffmpeg."""
    try:
        ffmpeg.input(webm_file_path).output(
            wav_file_path, acodec="pcm_s16le", ar="16000"
        ).run()
        print(f"Converted WebM to WAV: {wav_file_path}")
    except ffmpeg.Error as e:
        print(f"Error converting WebM to WAV: {e}")
        raise
