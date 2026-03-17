import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface VoiceControlProps {
  onTranscript: (text: string) => void;
  textToSpeak?: string;
  disabled?: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
}

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const VoiceControl = ({ onTranscript, textToSpeak, disabled, onSpeakingChange }: VoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);
  const lastSpokenRef = useRef("");

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Stop any ongoing speech so the mic can hear the user
    synthRef.current.cancel();
    onSpeakingChange?.(false);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
      recognition.stop();
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript, onSpeakingChange]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Speak new text
  useEffect(() => {
    if (!textToSpeak || isMuted || textToSpeak === lastSpokenRef.current) return;
    lastSpokenRef.current = textToSpeak;

    // Strip markdown for cleaner speech
    const clean = textToSpeak
      .replace(/[*_#`~>\-\[\]()]/g, "")
      .replace(/\n+/g, ". ")
      .trim();

    if (!clean) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.onstart = () => onSpeakingChange?.(true);
    utterance.onend = () => onSpeakingChange?.(false);
    utterance.onerror = () => onSpeakingChange?.(false);
    synthRef.current.speak(utterance);
  }, [textToSpeak, isMuted, onSpeakingChange]);

  return (
    <div className="flex gap-1.5">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
          isListening
            ? "bg-destructive text-destructive-foreground animate-pulse shadow-[0_0_16px_hsl(0_72%_55%/0.4)]"
            : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30"
        }`}
        title={isListening ? "Stop listening" : "Speak to Chronos"}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
      <button
        onClick={() => {
          setIsMuted(!isMuted);
          if (!isMuted) synthRef.current.cancel();
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isMuted
            ? "bg-muted text-muted-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
        title={isMuted ? "Unmute Chronos" : "Mute Chronos"}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
};

export default VoiceControl;
