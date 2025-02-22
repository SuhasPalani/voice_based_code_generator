from pydub import AudioSegment

def resample_audio(input_path, output_path, target_sample_rate=16000):
    """Resample the audio file to a target sample rate (default is 16000 Hz)."""
    try:
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(target_sample_rate)  # Resample to target sample rate
        audio.export(output_path, format="wav")  # Save the resampled file as WAV
        print(f"Resampled audio to {target_sample_rate} Hz: {output_path}")
    except Exception as e:
        print(f"Error resampling audio: {e}")
        raise
