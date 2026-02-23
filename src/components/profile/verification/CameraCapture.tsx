"use client"
import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Camera, RefreshCw, CameraOff, Check, Loader2 } from "lucide-react"
import { useThemeSettings } from "@/hooks/theme-settings"

interface CameraCaptureProps {
    onCapture: (blob: Blob) => void;
    onRetake?: () => void;
    onCancel?: () => void;
    facingMode?: "user" | "environment";
}

export default function CameraCapture({ onCapture, onRetake, onCancel, facingMode = "user" }: CameraCaptureProps) {
    const isFrontFacing = facingMode === "user";
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';
    
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isSelfieDone, setIsSelfieDone] = useState(false);
    const isMounted = useRef(true);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStream(null);
        setIsCameraReady(false);
    }, []);

    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });

            // Check if component is still mounted before setting state
            if (!isMounted.current) {
                mediaStream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = mediaStream;
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    if (isMounted.current) {
                        setIsCameraReady(true);
                    }
                };
            }
        } catch (err) {
            if (isMounted.current) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please ensure you have granted permission.");
            }
        }
    }, [facingMode]);

    useEffect(() => {
        isMounted.current = true;
        startCamera();
        return () => {
            isMounted.current = false;
            stopCamera();
        };
    }, [startCamera, stopCamera]);

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
        setIsSelfieDone(false);
        onRetake?.();
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl mx-auto py-4">
            {/* Camera Area - Enlarged & Square */}
            <div className="relative flex-1 aspect-square max-h-[400px] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white mx-auto">
                <div className="absolute inset-0 w-full h-full">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            style={{ transform: isFrontFacing ? "scaleX(-1)" : "none" }}
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3">
                                <Loader2 className="h-10 w-10 animate-spin" style={{ color: primaryColor }} />
                                <p className="text-xs font-medium text-slate-500">Initializing camera...</p>
                            </div>
                        )}
                    </>
                ) : (
                    <img
                        src={capturedImage}
                        alt="Captured selfie"
                        className="w-full h-full object-cover"
                        style={{ transform: isFrontFacing ? "scaleX(-1)" : "none" }}
                    />
                )}
                <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>

            {/* Controls Area - Right Side */}
            <div className="flex flex-row md:flex-col items-center justify-center gap-4 w-full md:w-40 shrink-0">
                {!capturedImage ? (
                    <div className="flex flex-col items-center gap-3">
                        <Button
                            onClick={capturePhoto}
                            disabled={!isCameraReady}
                            className="rounded-full h-20 w-20 p-0 shadow-xl transition-all active:scale-90 hover:brightness-110 flex items-center justify-center"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Camera className="h-10 w-10 text-white" />
                        </Button>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Capture</p>
                    </div>
                ) : (
                    !isSelfieDone ? (
                        <div className="flex flex-row md:flex-col gap-4">
                            <Button
                                variant="outline"
                                onClick={retake}
                                className="rounded-2xl h-14 md:w-32 px-6 flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50 transition-all font-semibold"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Retake
                            </Button>
                            <Button
                                onClick={confirmPhoto}
                                className="rounded-2xl h-14 md:w-32 px-6 flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all font-semibold"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Check className="h-5 w-5" />
                                Accept
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={retake}
                            className="rounded-2xl h-14 md:w-32 px-6 flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50 transition-all font-semibold"
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retake
                        </Button>
                    )
                )}
                
                {onCancel && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onCancel} 
                        className="mt-4 hover:bg-slate-100 transition-all text-xs"
                        style={{ color: primaryColor }}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );
}
