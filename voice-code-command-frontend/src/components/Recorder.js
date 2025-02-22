import { useState } from "react";

export default function Recorder() {
    const [transcription, setTranscription] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState("");
    const [confidence, setConfidence] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [stream, setStream] = useState(null);

    const startRecording = async () => {
        try {
            setIsRecording(true);
            setError("");
            setTranscription("");
            setGeneratedCode("");
            setConfidence(null);

            const userStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    sampleSize: 16,
                },
            });

            const recorder = new MediaRecorder(userStream, {
                mimeType: "audio/webm;codecs=opus",
            });

            setStream(userStream);
            setMediaRecorder(recorder);

            let chunks = [];
            recorder.ondataavailable = (event) => chunks.push(event.data);

            recorder.onstop = async () => {
                // Convert to Blob and set the file name to match MIME type (webm)
                const audioBlob = new Blob(chunks, { type: "audio/webm" });

                const formData = new FormData();
                formData.append("audio", audioBlob, "recording.webm"); // Change extension to .webm

                try {
                    console.log("Sending audio for transcription...");
                    const response = await fetch("http://127.0.0.1:5000/transcribe", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    console.log("Transcription Response:", data);

                    if (!response.ok) {
                        throw new Error(data.error || "Failed to fetch transcription");
                    }

                    if (data.status === "error") {
                        setError(data.error || "Error in transcription");
                        setTranscription("");
                        setGeneratedCode("");
                    } else {
                        setTranscription(data.transcription);
                        setGeneratedCode(data.generated_code); // Display generated code
                        setConfidence(data.confidence);
                        setError("");
                    }
                } catch (error) {
                    console.error("Transcription error:", error);
                    setError(error.message || "Error in transcription");
                    setTranscription("");
                    setGeneratedCode("");
                } finally {
                    setIsRecording(false);
                    userStream.getTracks().forEach((track) => track.stop());
                }
            };

            recorder.start();
        } catch (error) {
            console.error("Recording error:", error);
            setError(error.message || "Error accessing microphone");
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setIsRecording(false);
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isRecording === null}
                className={`px-4 py-2 rounded ${
                    isRecording
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
                {isRecording ? "Stop Recording" : "Start Recording"}
            </button>

            {error && <p className="text-red-500 mt-2">Error: {error}</p>}

            {transcription && (
                <div className="mt-4">
                    <h3 className="font-bold">Transcription:</h3>
                    <p>{transcription}</p>
                    {confidence !== null && (
                        <p className="text-gray-600 text-sm">
                            Confidence: {(confidence * 100).toFixed(1)}%
                        </p>
                    )}
                </div>
            )}

            {generatedCode && (
                <div className="mt-4">
                    <h3 className="font-bold">Generated Python Code:</h3>
                    <pre className="bg-gray-100 p-4 rounded">{generatedCode}</pre>
                </div>
            )}
        </div>
    );
}
