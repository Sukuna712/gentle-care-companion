import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Wind, Flame, Droplets, AlertTriangle, Zap } from "lucide-react";

interface FirstAidCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  steps: string[];
  warning?: string;
}

const cards: FirstAidCard[] = [
  {
    id: "cpr",
    title: "CPR",
    icon: <Heart size={32} />,
    color: "from-red-500/20 to-red-900/20 border-red-500/30",
    steps: [
      "Call emergency services immediately",
      "Place the person on their back on a firm surface",
      "Put the heel of one hand on the center of the chest",
      "Place other hand on top, interlace fingers",
      "Push hard & fast — 2 inches deep, 100-120 compressions/min",
      "After 30 compressions, give 2 rescue breaths",
      "Continue until help arrives or the person recovers",
    ],
    warning: "Only perform if the person is unresponsive and not breathing normally.",
  },
  {
    id: "choking",
    title: "Choking",
    icon: <Wind size={32} />,
    color: "from-blue-500/20 to-blue-900/20 border-blue-500/30",
    steps: [
      "Ask: 'Are you choking?' — if they can't speak, act fast",
      "Stand behind the person, wrap arms around their waist",
      "Make a fist with one hand, place above the navel",
      "Grasp fist with other hand",
      "Perform quick upward thrusts (Heimlich maneuver)",
      "Repeat until the object is expelled",
      "If unconscious, begin CPR and check mouth for object",
    ],
    warning: "For infants, use back blows and chest thrusts instead.",
  },
  {
    id: "burns",
    title: "Burns",
    icon: <Flame size={32} />,
    color: "from-orange-500/20 to-orange-900/20 border-orange-500/30",
    steps: [
      "Remove the person from the heat source",
      "Cool the burn under cool running water for 10-20 minutes",
      "Do NOT use ice, butter, or toothpaste",
      "Remove jewelry or tight clothing near the burn",
      "Cover loosely with a sterile, non-stick bandage",
      "Take over-the-counter pain relief if needed",
      "Seek medical help for burns larger than your palm",
    ],
    warning: "For chemical or electrical burns, call emergency services immediately.",
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    icon: <Droplets size={32} />,
    color: "from-rose-500/20 to-rose-900/20 border-rose-500/30",
    steps: [
      "Apply direct pressure with a clean cloth or bandage",
      "Press firmly — don't lift the cloth to check",
      "If blood soaks through, add more cloth on top",
      "Elevate the injured limb above the heart if possible",
      "Apply a tourniquet only as a last resort for life-threatening limb bleeding",
      "Keep the person warm and still",
      "Call emergency services if bleeding doesn't stop in 10 minutes",
    ],
    warning: "For embedded objects, do NOT remove — pad around the object and seek help.",
  },
  {
    id: "seizure",
    title: "Seizures",
    icon: <Zap size={32} />,
    color: "from-purple-500/20 to-purple-900/20 border-purple-500/30",
    steps: [
      "Clear the area of hard or sharp objects",
      "Do NOT restrain the person or put anything in their mouth",
      "Cushion their head with something soft",
      "Time the seizure — call 911 if it lasts over 5 minutes",
      "Turn them on their side once the seizure stops",
      "Stay with them until they are fully conscious",
      "Speak calmly and reassure them as they recover",
    ],
  },
  {
    id: "allergic",
    title: "Allergic Reaction",
    icon: <AlertTriangle size={32} />,
    color: "from-yellow-500/20 to-yellow-900/20 border-yellow-500/30",
    steps: [
      "Call emergency services if there are signs of anaphylaxis",
      "Help the person use their epinephrine auto-injector (EpiPen) if they have one",
      "Have them sit upright to help breathing",
      "If they have antihistamines, help them take it",
      "Monitor breathing and consciousness",
      "If they become unresponsive, begin CPR",
      "A second dose of epinephrine can be given after 5-15 minutes if no improvement",
    ],
    warning: "Signs of anaphylaxis: difficulty breathing, swollen throat, dizziness, rapid pulse.",
  },
];

const FirstAidCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const card = cards[currentIndex];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-display font-bold text-foreground">First Aid Quick Cards</h2>
        <p className="text-xs text-muted-foreground font-body">Swipe through emergency procedures</p>
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-full max-w-md bg-gradient-to-br ${card.color} border rounded-2xl p-5 space-y-4`}
          >
            <div className="flex items-center gap-3">
              <div className="text-foreground">{card.icon}</div>
              <h3 className="text-xl font-display font-bold text-foreground">{card.title}</h3>
            </div>

            <ol className="space-y-2">
              {card.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm font-body text-foreground/90">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {card.warning && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                <AlertTriangle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs font-body text-destructive/90">{card.warning}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-4">
          <button onClick={goPrev} className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30"}`}
              />
            ))}
          </div>
          <button onClick={goNext} className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstAidCards;
