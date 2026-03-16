import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, SwitchCamera, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  disabled?: boolean;
}

const CameraCapture = ({ onCapture, disabled }: CameraCaptureProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert("Unable to access camera. Please grant camera permission.");
      setIsOpen(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (isOpen && !captured) startCamera();
    return () => stopCamera();
  }, [isOpen, captured, startCamera, stopCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    setCaptured(base64);
    stopCamera();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCaptured(reader.result as string);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const sendPhoto = () => {
    if (captured) {
      onCapture(captured);
      setCaptured(null);
      setIsOpen(false);
    }
  };

  const retake = () => {
    setCaptured(null);
  };

  if (!isOpen) {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-all disabled:opacity-40"
          title="Open camera to scan injury"
        >
          <Camera size={18} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-all disabled:opacity-40"
          title="Upload an image"
        >
          <Upload size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-slide-up">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">
            {captured ? "Review Photo" : "Scan Your Injury"}
          </h2>
          <button
            onClick={() => { setIsOpen(false); setCaptured(null); stopCamera(); }}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
          {captured ? (
            <img src={captured} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-center gap-3">
          {captured ? (
            <>
              <Button variant="outline" onClick={retake}>Retake</Button>
              <Button onClick={sendPhoto} className="gap-2">
                <Send size={16} /> Analyze Injury
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")}
                className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center"
              >
                <SwitchCamera size={20} />
              </button>
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-chronos hover:opacity-90 transition-opacity"
              >
                <Camera size={24} />
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center font-body">
          Take a clear photo of the affected area for Chronos to analyze.
        </p>
      </div>
    </div>
  );
};

export default CameraCapture;
