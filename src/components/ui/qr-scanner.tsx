"use client";

import React, { useState, useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowUpDown, Camera, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface QRScannerProps {
  onResult: (result: string) => void;
  width?: number;
  height?: number;
}

export function QRScanner({ onResult, width = 320, height = 320 }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load the QR code scanner library dynamically
  useEffect(() => {
    let jsQR: any = null;

    const loadJsQR = async () => {
      try {
        // In a real implementation, you would use a proper import
        // This is a workaround for the demo that attempts to load from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
        script.async = true;

        script.onload = () => {
          jsQR = window.jsQR;
          startCamera();
        };

        script.onerror = () => {
          setError("Failed to load QR scanner library. Please try again later.");
        };

        document.body.appendChild(script);

        return () => {
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (err) {
        setError("Failed to initialize QR scanner. Please try again later.");
        console.error("QR Scanner load error:", err);
      }
    };

    loadJsQR();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopCamera();
    };
  }, []);

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setError("Camera access not supported by your browser");
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);

      if (videoDevices.length > 0 && !currentCamera) {
        setCurrentCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error getting cameras:", err);
      setError("Failed to access camera devices");
    }
  };

  // Start camera with selected device
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access not supported by your browser");
        return;
      }

      await getAvailableCameras();

      if (!videoRef.current) return;

      // Stop any existing stream
      stopCamera();

      // Create constraints based on available cameras
      const constraints: MediaStreamConstraints = {
        video: currentCamera
          ? { deviceId: { exact: currentCamera } }
          : { facingMode: 'environment' }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        setScanResult(null);
        setError(null);
        scanQRCode();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access the camera. Please check permissions and try again.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Switch camera
  const switchCamera = async () => {
    if (cameras.length <= 1) return;

    const currentIndex = cameras.findIndex(c => c.deviceId === currentCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCurrentCamera(cameras[nextIndex].deviceId);

    // Restart camera with new device
    await startCamera();
  };

  // Scan QR code from video frame
  const scanQRCode = () => {
    if (!scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data from canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Scan for QR code using jsQR library
      if (window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          // QR code detected
          setScanning(false);
          setScanResult(code.data);
          onResult(code.data);

          // Draw QR code boundaries
          ctx.beginPath();
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#4ade80";
          ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
          ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
          ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
          ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ctx.stroke();

          return;
        }
      }
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  // Restart scanning
  const restartScan = () => {
    setScanResult(null);
    setScanning(true);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-square bg-black mb-4 rounded-lg overflow-hidden">
        {/* Scanner UI with targeting overlay */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full hidden"
        />

        {/* Scanning overlay */}
        {scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2/3 h-2/3 border-2 border-white rounded-lg relative">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-green-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-green-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-green-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-green-500 rounded-br-lg"></div>
            </div>
            {/* Scanning animation */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-green-500 animate-scan-line"></div>
          </div>
        )}

        {/* Success overlay */}
        {scanResult && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-white text-center">QR Code detected!</p>
            <p className="text-white/70 text-xs mt-2 text-center px-4 truncate max-w-full">
              {scanResult.length > 40 ? scanResult.substring(0, 37) + '...' : scanResult}
            </p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
            <p className="text-white text-center px-4">{error}</p>
          </div>
        )}

        {/* Camera controls */}
        {cameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full"
            title="Switch camera"
            type="button"
          >
            <ArrowUpDown className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {scanResult && (
        <div className="w-full text-center mb-4">
          <button
            onClick={restartScan}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 rounded-md text-sm font-medium"
            type="button"
          >
            <Camera className="h-4 w-4" />
            Scan Again
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes scan-line {
          0% {
            transform: translateY(-100px);
          }
          50% {
            transform: translateY(100px);
          }
          100% {
            transform: translateY(-100px);
          }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
