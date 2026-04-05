import { Lock, Sparkles } from "lucide-react";
import { type PremiumModule, MODULE_CONFIG } from "@/hooks/usePurchases";
import { toast } from "sonner";
import { useState } from "react";

interface PremiumGateProps {
  module: PremiumModule;
  onPurchase: (module: PremiumModule) => Promise<void>;
}

const PremiumGate = ({ module, onPurchase }: PremiumGateProps) => {
  const config = MODULE_CONFIG[module];
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await onPurchase(module);
      toast.success("Redirecting to checkout...");
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-6 gap-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-10 h-10 text-primary" />
      </div>
      
      <div className="text-center space-y-2 max-w-sm">
        <h2 className="text-2xl font-display font-bold text-foreground">
          {config.label}
        </h2>
        <p className="text-muted-foreground font-body text-sm">
          Unlock this premium module with a one-time purchase. Access it forever, no subscriptions.
        </p>
      </div>

      <div className="text-3xl font-bold text-primary font-display">
        {config.price}
      </div>

      <button
        onClick={handlePurchase}
        disabled={purchasing}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-body"
      >
        <Sparkles size={18} />
        {purchasing ? "Starting checkout..." : `Unlock ${config.label}`}
      </button>

      <p className="text-xs text-muted-foreground font-body">
        Secure payment powered by Dodo Payments
      </p>
    </div>
  );
};

export default PremiumGate;
