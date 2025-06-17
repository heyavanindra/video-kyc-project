import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate} from "react-router-dom"
function ReactView() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingStartTimeRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
const navigate = useNavigate()
  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      console.log("Models loaded");
    };
    loadModels();
  }, []);

  // Start webcam
  useEffect(() => {
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    };
    startVideo();
  }, []);

  // Face detection
  useEffect(() => {
    if (!modelsLoaded) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      setFaceDetected(!!detection);
    }, 300);

    return () => clearInterval(interval);
  }, [modelsLoaded]);

  // Recording logic
  useEffect(() => {
    const stream = videoRef.current?.srcObject;

    // ✅ Start recording if face is detected and not already recording
    if (faceDetected && !recording && stream) {
      recordedChunksRef.current = [];
      setRecordedVideoUrl(null);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordingStartTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        if (duration >= 6) {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          console.log("Saved 6-second video");
        } else {
          console.log("Recording cancelled (face lost early)");
        }
        setRecording(false);
      };

      recorder.start();
      setRecording(true);
      console.log("🎥 Started recording");

      // Auto-stop after 6 seconds
      const timer = setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          console.log("Auto-stopped after 6s");
        }
      }, 6000);

      return () => clearTimeout(timer);
    }

    // Stop recording if face disappears before 6s
    if (!faceDetected && recording && mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      console.log("Face lost, recording stopped and will restart on re-detection");
    }
  }, [faceDetected]);

 useEffect(() => {
  if (!recordedVideoUrl) return;

  const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
  const file = new File([blob], "face-video.webm", { type: "video/webm" });

  const formData = new FormData();
  formData.append("file", file);
  console.log(file)

  async function saveVideo() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/video`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Video saved successfully:", response.data);
      if (response.status === 200) {
        console.log("Video URL:", response.data.user.videoUrl);
        navigate("/verified"); 
      }
    } catch (error) {
      console.error("Error saving video:", error);
    }
  }

  saveVideo();
}, [recordedVideoUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">🎥 Auto Face Recording</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        width="640"
        height="480"
        style={{ border: faceDetected ? "3px solid green" : "3px solid red" }}
      />

      <p className="mt-4 text-lg">
        {faceDetected ? "Face Detected" : "No Face Detected"}
      </p>
      <p className="text-sm text-gray-600">
        {recording ? "Recording in progress..." : "Waiting for face..."}
      </p>

      {recordedVideoUrl && (
        <div className="mt-6 w-full max-w-2xl">
          <p className="mb-2 text-sm text-gray-600">🎞️ Last Recorded Video:</p>
          <video
            src={recordedVideoUrl}
            controls
            width="640"
            height="480"
            className="rounded shadow"
          />
        </div>
      )}
    </div>
  );
}

export default ReactView;
