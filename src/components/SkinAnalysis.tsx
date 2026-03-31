import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Scan, AlertTriangle } from "lucide-react";
import { streamChat, type Msg, type MsgContent } from "@/lib/streamChat";
import { toast } from "sonner";
import ChronosAvatar from "./ChronosAvatar";
import ReactMarkdown from "react-markdown";

const SKIN_PROMPT = `Analyze this image of a skin condition. Please:
1. Describe what you observe (color, texture, size, pattern, location if visible)
2. List the most likely common conditions it could be (e.g., eczema, contact dermatitis, acne, insect bite, fungal infection, etc.)
3. Rate the severity: Mild / Moderate / Needs Medical Attention
4. Provide appropriate home care recommendations
5. List clear red flags that would require immediate medical attention

IMPORTANT: Always include the disclaimer that you are not a dermatologist and this is not a diagnosis. Recommend seeing a dermatologist for persistent or concerning conditions.`;

const SkinAnalysis = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch {
      toast.error("Could not access camera");
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setAnalysis("");

    const content: MsgContent = [
      { type: "text", text: SKIN_PROMPT },
      { type: "image_url", image_url: { url: base64 } },
    ];
    const messages: Msg[] = [{ role: "user", content }];

    let result = "";
    try {
      await streamChat({
        messages,
        onDelta: (chunk) => { result += chunk; setAnalysis(result); },
        onDone: () => setIsAnalyzing(false),
      });
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setAnalysis("");
    stopCamera();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Scan className="text-primary" size={24} />
        <h2 className="text-xl font-display font-bold text-foreground">AI Skin Analysis</h2>
      </div>

      {/* Disclaimer */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-6 flex gap-3">
        <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-muted-foreground font-body">
          This tool provides general information only and is <strong>not a medical diagnosis</strong>. Always consult a dermatologist for persistent or concerning skin conditions.
        </p>
      </div>

      {!capturedImage && !showCamera && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Camera className="text-primary" size={32} />
              <span className="text-sm font-body font-medium text-foreground">Take Photo</span>
              <span className="text-xs text-muted-foreground font-body">Use camera</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Upload className="text-primary" size={32} />
              <span className="text-sm font-body font-medium text-foreground">Upload Image</span>
              <span className="text-xs text-muted-foreground font-body">From gallery</span>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-display font-semibold text-foreground mb-3">Tips for best results</h3>
            <ul className="space-y-2 text-xs text-muted-foreground font-body">
              <li>• Good lighting — natural light works best</li>
              <li>• Focus on the affected area clearly</li>
              <li>• Include surrounding skin for context</li>
              <li>• Take from about 6-12 inches away</li>
            </ul>
          </div>
        </div>
      )}

      {/* Camera view */}
      {showCamera && (
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] object-cover bg-black" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button onClick={capture} className="w-16 h-16 rounded-full bg-primary border-4 border-primary-foreground shadow-lg hover:scale-105 transition-transform" />
            <button onClick={stopCamera} className="w-12 h-12 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
              <X size={20} className="text-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={capturedImage} alt="Skin condition" className="w-full aspect-[4/3] object-cover" />
            <button onClick={reset} className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition-colors">
              <X size={16} />
            </button>
          </div>

          {(isAnalyzing || analysis) && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ChronosAvatar isThinking={isAnalyzing} size={28} />
                <h3 className="text-sm font-display font-semibold text-foreground">Analysis</h3>
              </div>
              {analysis ? (
                <div className="text-sm text-foreground/90 font-body prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex gap-1.5 py-2">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          )}

          <button onClick={reset} className="w-full bg-muted/30 hover:bg-muted/50 text-foreground rounded-xl py-3 text-sm font-medium font-body transition-colors">
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
};

export default SkinAnalysis;
