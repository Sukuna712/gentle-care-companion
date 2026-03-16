import { motion } from "framer-motion";

interface BaymaxAvatarProps {
  isThinking?: boolean;
  size?: number;
}

const BaymaxAvatar = ({ isThinking = false, size = 40 }: BaymaxAvatarProps) => {
  return (
    <motion.div
      className="rounded-full bg-card flex items-center justify-center shadow-soft flex-shrink-0"
      style={{ width: size, height: size }}
      animate={
        isThinking
          ? { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }
          : { scale: 1, opacity: 1 }
      }
      transition={
        isThinking
          ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
    >
      {/* Baymax face */}
      <svg width={size * 0.6} height={size * 0.35} viewBox="0 0 24 14">
        <line x1="3" y1="7" x2="9" y2="7" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15" y1="7" x2="21" y2="7" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="10" y1="7" x2="14" y2="7" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
};

export default BaymaxAvatar;
