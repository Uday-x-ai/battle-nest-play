import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal" | "entry_fee" | "prize" | "refund";
  amount: number;
  description: string | null;
  tournament_id: string | null;
  created_at: string;
}

export function useWallet() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile, refreshProfile } = useAuth();

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setTransactions(data as WalletTransaction[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();

    if (!user) return;

    // Subscribe to real-time transaction updates
    const channel = supabase
      .channel(`wallet-transactions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New transaction:', payload);
          setTransactions(prev => [payload.new as WalletTransaction, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const deposit = async (amount: number) => {
    if (!user) {
      toast.error("Please login to deposit");
      return { success: false };
    }

    if (amount < 10) {
      toast.error("Minimum deposit is ₹10");
      return { success: false };
    }

    // Update wallet balance
    const { error: walletError } = await supabase
      .from("profiles")
      .update({ wallet_balance: (profile?.wallet_balance || 0) + amount })
      .eq("user_id", user.id);

    if (walletError) {
      toast.error("Failed to process deposit");
      return { success: false };
    }

    // Record transaction
    const { error } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: amount,
      description: "Wallet deposit"
    });

    if (error) {
      toast.error("Failed to record transaction");
      return { success: false };
    }

    toast.success(`₹${amount} deposited successfully!`);
    await refreshProfile();
    await fetchTransactions();
    return { success: true };
  };

  const withdraw = async (amount: number) => {
    if (!user) {
      toast.error("Please login to withdraw");
      return { success: false };
    }

    if (amount < 100) {
      toast.error("Minimum withdrawal is ₹100");
      return { success: false };
    }

    if (!profile || profile.wallet_balance < amount) {
      toast.error("Insufficient balance");
      return { success: false };
    }

    // Update wallet balance
    const { error: walletError } = await supabase
      .from("profiles")
      .update({ wallet_balance: profile.wallet_balance - amount })
      .eq("user_id", user.id);

    if (walletError) {
      toast.error("Failed to process withdrawal");
      return { success: false };
    }

    // Record transaction
    const { error } = await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      amount: -amount,
      description: "Wallet withdrawal"
    });

    if (error) {
      toast.error("Failed to record transaction");
      return { success: false };
    }

    toast.success(`₹${amount} withdrawal request submitted!`);
    await refreshProfile();
    await fetchTransactions();
    return { success: true };
  };

  return {
    transactions,
    loading,
    deposit,
    withdraw,
    refetch: fetchTransactions
  };
}
