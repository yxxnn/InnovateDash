import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FaceLogin() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Click to enable camera");
  const [stream, setStream] = useState(null);

  // Initialize camera
  const initializeCamera = async () => {
    try {
      setError("");
      setMessage("Accessing camera...");
      
      // Request camera permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
        setMessage("Camera ready. Position your face in the circle.");
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      setMessage("Camera access denied");
      console.error("Camera error:", err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      setMessage("Click to enable camera");
    }
  };

  // Capture face
  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    try {
      setLoading(true);
      setError("");
      setMessage("Recognizing face...");

      // Capture video frame
      const context = canvasRef.current.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // In production, you would send the image to a face recognition API
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful recognition
      setMessage("Face recognized! Logging in...");
      
      // Simulate login
      const mockToken = "user_" + Math.random().toString(16).slice(2);
      localStorage.setItem("userToken", mockToken);
      localStorage.setItem("userId", "u1"); // Demo user

      setTimeout(() => {
        stopCamera();
        navigate("/pwid");
      }, 1500);
    } catch (err) {
      setError("Face recognition failed. Please try again.");
      setMessage("Try again");
      console.error("Face capture error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f9f0]" style={{ backgroundColor: "#f0f9f0" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-[#f0f9f0]" style={{ backgroundColor: "#f0f9f0" }}>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-[#19e619] p-1.5 rounded-lg text-white">
            <span className="material-symbols-outlined block text-2xl">
              diversity_1
            </span>
          </div>
          <h2 className="text-[#0e1b0e] text-xl font-bold tracking-tight">
            Companion
          </h2>
        </button>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white border-2 border-[#19e619]/20 px-4 py-1.5 rounded-full font-bold text-[#444] hover:bg-gray-50 transition-colors shadow-sm text-sm">
            <span className="material-symbols-outlined text-lg">help</span>
            How it works
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 pt-28">
        <div className="w-full max-w-[500px]">
          <div className="bg-white shadow-xl shadow-black/5 rounded-xl border border-zinc-200 p-8 md:p-10">
            {/* Form Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-[#e7f3e7] rounded-full mb-4">
                <span className="material-symbols-outlined text-[#19e619] text-3xl">
                  face
                </span>
              </div>
              <h1 className="text-zinc-900 text-2xl font-bold">
                Face Login
              </h1>
              <p className="text-zinc-500 text-sm mt-2">
                Use your face to sign in securely.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Camera Container */}
            <div className="mb-8">
              <div className="relative bg-zinc-100 rounded-xl overflow-hidden border-2 border-dashed border-zinc-300">
                {/* Hidden Canvas for Face Capture */}
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={360}
                  className="hidden"
                />

                {/* Video or Placeholder */}
                {cameraActive ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-80 object-cover"
                    />
                    {/* Face Detection Circle Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-4 border-[#19e619] rounded-full opacity-60 animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 border-4 border-[#19e619] h-40 rounded-full opacity-40"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-80 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-zinc-300 mb-4">
                      videocam
                    </span>
                    <p className="text-zinc-500 text-sm">Camera is off</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">
                    info
                  </span>
                  <span>
                    {message}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!cameraActive ? (
                <button
                  onClick={initializeCamera}
                  disabled={loading}
                  className="w-full bg-[#19e619] hover:bg-[#15c213] disabled:bg-zinc-400 text-zinc-900 text-sm font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.99] shadow-md shadow-[#19e619]/10 flex items-center justify-center gap-2"
                >
                  <span>Enable Camera</span>
                  <span className="material-symbols-outlined text-xl">
                    videocam
                  </span>
                </button>
              ) : (
                <>
                  <button
                    onClick={captureFace}
                    disabled={loading}
                    className="w-full bg-[#19e619] hover:bg-[#15c213] disabled:bg-zinc-400 text-zinc-900 text-sm font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.99] shadow-md shadow-[#19e619]/10 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? "Recognizing..." : "Confirm Face"}</span>
                    <span className="material-symbols-outlined text-xl">
                      {loading ? "schedule" : "check_circle"}
                    </span>
                  </button>
                  <button
                    onClick={stopCamera}
                    disabled={loading}
                    className="w-full bg-white border-2 border-zinc-300 hover:border-zinc-400 text-zinc-700 text-sm font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Cancel</span>
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </>
              )}
            </div>

            {/* Security Message */}
            <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
              <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">shield</span>
                Face data is processed locally and securely
              </p>
            </div>
          </div>

          {/* Alternative Login */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-zinc-500">
              <button
                onClick={() => navigate("/login/code?role=user")}
                className="text-[#19e619] font-bold hover:underline"
              >
                Use email and password instead
              </button>
            </p>
            <p className="text-sm text-zinc-500">
              <button
                onClick={() => navigate("/login?role=user")}
                className="text-[#19e619] font-bold hover:underline"
              >
                Back to sign in options
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-10 text-center text-zinc-400 text-xs">
        <p>© 2024 Companion Independent Living. All rights reserved.</p>
      </footer>

      {/* Background Blurs */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#19e619]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#19e619]/5 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
