import { useState } from "react";
import { Mic, Square, X, Copy } from "lucide-react"; // Added Copy icon
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import "../App.css"; // Ensure your custom styles are imported

export default function Recorder() {
  const [transcription, setTranscription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(""); // Feedback state for copy action

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
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

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
            setGeneratedCode(data.generated_code);
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

  const clearScreen = () => {
    setTranscription("");
    setGeneratedCode("");
    setConfidence(null);
    setError("");
    setCopyFeedback(""); // Reset copy feedback when clearing the screen
  };

  const copyCodeToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        setCopyFeedback("Code copied to clipboard!"); // Feedback after copying
        setTimeout(() => setCopyFeedback(""), 2000); // Reset feedback after 2 seconds
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Voice to Code Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isRecording === null}
            className={`
                            flex items-center gap-2 px-6 py-3 rounded-full
                            transition-all duration-300 transform hover:scale-105
                            ${
                              isRecording
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-blue-500 hover:bg-blue-600"
                            } text-white font-medium shadow-md
                        `}
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {transcription && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Transcription</h3>
            <p className="text-gray-700 leading-relaxed">{transcription}</p>
            {confidence !== null && (
              <div className="mt-3 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-sm text-gray-600">
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}

        {generatedCode && (
          <div className="bg-gray-900 p-6 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3 text-white">
              Generated Code
            </h3>
            <pre className="text-green-400 font-mono text-sm">
              {generatedCode}
            </pre>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={copyCodeToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Code</span>
              </button>

              {copyFeedback && (
                <span className="text-green-500 text-sm">{copyFeedback}</span>
              )}
            </div>
          </div>
        )}

        {/* Conditionally render the Clear Screen button only if there's generated code */}
        {generatedCode && (
          <div className="flex justify-center mt-4">
            <button onClick={clearScreen} className="clear-screen-btn">
              <X className="w-5 h-5" />
              <span>Clear Screen</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
