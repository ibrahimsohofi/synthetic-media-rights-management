"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Check, QrCode, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError?: (error: Error) => void;
  onCancel?: () => void;
  supportedFormats?: string[];
  scanInterval?: number;
  showControls?: boolean;
  className?: string;
  scannerTitle?: string;
  scannerDescription?: string;
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  onCancel,
  supportedFormats = ["QR_CODE", "AZTEC", "DATA_MATRIX"],
  scanInterval = 500,
  showControls = true,
  className = "",
  scannerTitle = "Certificate QR Scanner",
  scannerDescription = "Scan a certificate QR code to verify its authenticity",
}: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanSuccessful, setScanSuccessful] = useState(false);
  const [detectedQrCode, setDetectedQrCode] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScanTimestamp = useRef<number>(0);
  const codeReader = useRef<any>(null);

  // Load the QR code library dynamically
  useEffect(() => {
    // Import ZXing library only on client side
    import("@zxing/browser").then(({ BrowserQRCodeReader }) => {
      codeReader.current = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: scanInterval,
        delayBetweenScanSuccess: 1000,
      });
    }).catch(err => {
      console.error("Failed to load QR scanner library:", err);
      setCameraError("Failed to load scanner. Please try again.");
    });

    // Clean up on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      stopScanner();
    };
  }, [scanInterval]);

  // Start scanner and handle camera permissions
  const startScanner = async () => {
    if (!codeReader.current) {
      setCameraError("Scanner not ready. Please try again.");
      return;
    }

    setCameraError(null);
    setScanning(true);
    setScanSuccessful(false);
    setDetectedQrCode("");

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);

        // Auto play video and start decoding
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              startDecoding();
            }).catch(err => {
              console.error("Error playing video:", err);
              setCameraError("Failed to start video stream. Please try again.");
            });
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasPermission(false);
      setCameraError(
        error instanceof Error
          ? `Camera access denied: ${error.message}`
          : "Camera access denied. Please check your permissions."
      );

      if (onScanError && error instanceof Error) {
        onScanError(error);
      }
    }
  };

  // Start decoding QR codes from video stream
  const startDecoding = () => {
    if (!videoRef.current || !codeReader.current) return;

    const decodeFromVideo = async () => {
      if (!videoRef.current || !scanning) return;

      try {
        // Only attempt to decode if enough time has passed since last scan
        const now = Date.now();
        if (now - lastScanTimestamp.current > scanInterval) {
          lastScanTimestamp.current = now;

          // Decode from video stream
          const result = await codeReader.current.decodeOnceFromVideoElement(videoRef.current);

          if (result && result.getText()) {
            const text = result.getText();
            setDetectedQrCode(text);
            setScanSuccessful(true);

            // Play success sound
            const audio = new Audio("/sounds/scan-success.mp3");
            audio.play().catch(e => console.log("Audio playback prevented", e));

            // Highlight detected code on canvas if available
            highlightDetectedCode(result);

            // Stop scanning and call success callback
            setTimeout(() => {
              stopScanner();
              onScanSuccess(text);
            }, 1000); // Brief delay to show success state

            return;
          }
        }
      } catch (err) {
        // Ignore decode errors, they're expected when no QR code is in view
        // Only log unexpected errors
        if (err instanceof Error && !err.message.includes("could not")) {
          console.error("Decode error:", err);
        }
      }

      // Continue scanning if no QR code was detected
      if (scanning) {
        animationFrameId.current = requestAnimationFrame(decodeFromVideo);
      }
    };

    // Start the decode loop
    decodeFromVideo();
  };

  // Highlight the detected QR code on a canvas overlay
  const highlightDetectedCode = (result: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw green rectangle around QR code
    if (result.getResultPoints) {
      const points = result.getResultPoints();

      if (points && points.length >= 3) {
        // Calculate bounding box around QR code
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;

        for (const point of points) {
          minX = Math.min(minX, point.getX());
          minY = Math.min(minY, point.getY());
          maxX = Math.max(maxX, point.getX());
          maxY = Math.max(maxY, point.getY());
        }

        // Add some padding
        const padding = 10;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width, maxX + padding);
        maxY = Math.min(canvas.height, maxY + padding);

        // Draw the rectangle
        ctx.strokeStyle = '#10b981'; // green
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(minX, minY, maxX - minX, maxY - minY);
        ctx.stroke();

        // Add success checkmark
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('✓', maxX - 30, maxY + 30);
      }
    }
  };

  // Stop scanner and release camera
  const stopScanner = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  // Handle cancel button click
  const handleCancel = () => {
    stopScanner();
    if (onCancel) onCancel();
  };

  // Handle retry button click
  const handleRetry = () => {
    setCameraError(null);
    setScanSuccessful(false);
    setDetectedQrCode("");
    startScanner();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="bg-muted/30 p-4 rounded-lg border space-y-4 overflow-hidden">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">{scannerTitle}</h3>
            <p className="text-sm text-muted-foreground">{scannerDescription}</p>
          </div>
          {!scanning && showControls && (
            <Button
              onClick={startScanner}
              className="gap-2"
              variant="outline"
            >
              <Camera className="h-4 w-4" />
              <span>Start Scanner</span>
            </Button>
          )}
        </div>

        {cameraError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {hasPermission === false && (
          <div className="p-4 text-center space-y-2 border rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6 mx-auto" />
            <h4 className="font-medium">Camera access denied</h4>
            <p className="text-sm">Please allow camera access in your browser settings to use the scanner.</p>
          </div>
        )}

        <div className={`relative aspect-[4/3] bg-black rounded-md overflow-hidden ${scanning ? 'block' : 'hidden'}`}>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Scanning indicator overlay */}
          {scanning && !scanSuccessful && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-dashed border-primary/60 rounded-sm animate-pulse"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <QrCode className="h-16 w-16 text-white/80 animate-pulse" />
                <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-md mt-2 animate-pulse">
                  Position QR code in frame
                </span>
              </div>
            </div>
          )}

          {/* Success indicator overlay */}
          {scanSuccessful && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="font-bold text-green-600">QR Code Detected!</p>
                <p className="text-sm mt-1 text-green-800 text-center max-w-[200px] truncate">{detectedQrCode}</p>
              </div>
            </div>
          )}
        </div>

        {scanning && showControls && (
          <div className="flex justify-between">
            <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
            {cameraError && (
              <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2">
                <Loader2 className="h-4 w-4" />
                <span>Retry</span>
              </Button>
            )}
          </div>
        )}

        {!scanning && !cameraError && (
          <div className="text-center text-sm text-muted-foreground p-4 border border-dashed rounded-md">
            <QrCode className="h-12 w-12 mx-auto mb-2 text-muted-foreground/70" />
            <p>Start the scanner to verify a certificate QR code</p>
            <p className="text-xs mt-1">Position the QR code in frame once the scanner starts</p>
          </div>
        )}
      </div>
    </div>
  );
}
