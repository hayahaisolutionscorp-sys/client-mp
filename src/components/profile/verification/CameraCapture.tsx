"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Camera, RefreshCw, CameraOff, Check } from "lucide-react"

interface CameraCaptureProps {
    onCapture: (blob: Blob) => void;
    onCancel?: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isSelfieDone, setIsSelfieDone] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    setIsCameraReady(true);
                };
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure you have granted permission.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraReady(false);
    }, [stream]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                setCapturedImage(dataUrl);
                stopCamera();
            }
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            // Convert dataURL to Blob
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => onCapture(blob));
        }

        setIsSelfieDone(true);
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
            <div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover mirror"
                            style={{ transform: "scaleX(-1)" }}
                        />
                        {error && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white">
                                <CameraOff className="h-12 w-12 mb-4 text-slate-400" />
                                <p className="text-sm font-medium">{error}</p>
                                <Button variant="outline" size="sm" onClick={startCamera} className="mt-4 border-white text-white hover:bg-white/10">
                                    Try Again
                                </Button>
                            </div>
                        )}
                        {!isCameraReady && !error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        )}
                    </>
                ) : (
                    <img
                        src={capturedImage}
                        alt="Captured selfie"
                        className="w-full h-full object-cover"
                        style={{ transform: "scaleX(-1)" }}
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex justify-center gap-4 w-full">
                {!capturedImage ? (
                    <Button
                        onClick={capturePhoto}
                        disabled={!isCameraReady}
                        className="rounded-full h-16 w-16 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all active:scale-95"
                    >
                        <Camera className="h-8 w-8 text-white" />
                    </Button>
                ) : (
                    !isSelfieDone ? (<div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={retake}
                            className="rounded-full h-12 px-6 flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retake
                        </Button>
                        <Button
                            onClick={confirmPhoto}
                            className="rounded-full h-12 px-6 flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                            <Check className="h-4 w-4" />
                            Accept
                        </Button>
                    </div>) : (
                        <Button
                            onClick={retake}
                            className="rounded-full h-12 px-6 flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retake
                        </Button>
                    ))}
            </div>
            
            {onCancel && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onCancel} 
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                    Back to previous step
                </Button>
            )}
        </div>
    );
}
