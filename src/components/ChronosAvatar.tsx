import { motion } from "framer-motion";

interface ChronosAvatarProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
  size?: number;
}

const ChronosAvatar = ({ isThinking = false, isSpeaking = false, size = 40 }: ChronosAvatarProps) => {
  const isAnimating = isThinking || isSpeaking;

  return (
    <motion.div
      className="rounded-full bg-card flex items-center justify-center flex-shrink-0 border border-primary/30"
      style={{
        width: size,
        height: size,
        boxShadow: isAnimating
          ? `0 0 ${size * 0.4}px hsl(195 100% 50% / 0.3), inset 0 0 ${size * 0.2}px hsl(195 100% 50% / 0.1)`
          : `0 0 ${size * 0.2}px hsl(195 100% 50% / 0.15)`,
      }}
      animate={
        isSpeaking
          ? { scale: [1, 1.12, 1, 1.08, 1], borderColor: ["hsl(195 100% 50% / 0.3)", "hsl(195 100% 50% / 0.8)", "hsl(195 100% 50% / 0.3)"] }
          : isThinking
            ? { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }
            : { scale: 1, opacity: 1 }
      }
      transition={
        isSpeaking
          ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
          : isThinking
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
      }
    >
      {/* Chronos robot face */}
      <svg width={size * 0.6} height={size * 0.35} viewBox="0 0 24 14">
        <line x1="3" y1="7" x2="9" y2="7" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="7" x2="21" y2="7" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="10" y1="7" x2="14" y2="7" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
};

export default ChronosAvatar;
