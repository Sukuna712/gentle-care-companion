import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PremiumModule = "health_vitals" | "family_profiles" | "symptom_checker";

export const MODULE_CONFIG: Record<PremiumModule, { label: string; price: string; productId: string }> = {
  health_vitals: { label: "Health Vitals Dashboard", price: "$4.99", productId: "DODO_PRODUCT_VITALS" },
  family_profiles: { label: "Family Profiles", price: "$3.99", productId: "DODO_PRODUCT_FAMILY" },
  symptom_checker: { label: "Symptom Checker", price: "$4.99", productId: "DODO_PRODUCT_SYMPTOMS" },
};

export const usePurchases = () => {
  const { session } = useAuth();
  const [unlockedModules, setUnlockedModules] = useState<Set<PremiumModule>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    if (!session?.user?.id) {
      setUnlockedModules(new Set());
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_purchases")
      .select("module_name")
      .eq("user_id", session.user.id);

    if (!error && data) {
      setUnlockedModules(new Set(data.map((p) => p.module_name as PremiumModule)));
    }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const isUnlocked = (module: PremiumModule) => unlockedModules.has(module);

  const purchaseModule = async (module: PremiumModule) => {
    if (!session) return;

    const config = MODULE_CONFIG[module];

    try {
      const { data, error } = await supabase.functions.invoke("dodo-checkout", {
        body: {
          module_name: module,
          product_id: config.productId,
        },
      });

      if (error) throw error;
      if (data?.checkout_url) {
        window.open(data.checkout_url, "_blank");
      }
    } catch (e: any) {
      console.error("Purchase error:", e);
      throw e;
    }
  };

  return { unlockedModules, isUnlocked, purchaseModule, loading, refetch: fetchPurchases };
};
