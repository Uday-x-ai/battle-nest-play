import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  processed_by: string | null;
  processed_at: string | null;
  notes: string | null;
  profile?: {
    username: string | null;
    game_name: string | null;
  };
}

export function useWithdrawalRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchUserRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data as WithdrawalRequest[]);
    }
    setLoading(false);
  };

  const createRequest = async (amount: number) => {
    if (!user || !profile) {
      toast.error("Please login to create a withdrawal request");
      return { success: false };
    }

    if (amount < 100) {
      toast.error("Minimum withdrawal is ₹100");
      return { success: false };
    }

    if (!profile.upi_id) {
      toast.error("Please set your UPI ID first");
      return { success: false, needsUpi: true };
    }

    if (profile.wallet_balance < amount) {
      toast.error("Insufficient balance");
      return { success: false };
    }

    // Deduct balance immediately
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ wallet_balance: profile.wallet_balance - amount })
      .eq("user_id", user.id);

    if (balanceError) {
      toast.error("Failed to process request");
      return { success: false };
    }

    // Create withdrawal request
    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user.id,
      amount: amount,
      upi_id: profile.upi_id,
      status: "pending"
    });

    if (error) {
      // Refund the balance if request creation fails
      await supabase
        .from("profiles")
        .update({ wallet_balance: profile.wallet_balance })
        .eq("user_id", user.id);
      toast.error("Failed to create withdrawal request");
      return { success: false };
    }

    toast.success(`Withdrawal request for ₹${amount} submitted!`);
    await fetchUserRequests();
    return { success: true };
  };

  useEffect(() => {
    fetchUserRequests();

    if (!user) return;

    const channel = supabase
      .channel(`withdrawal-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Withdrawal request update:', payload);
          if (payload.eventType === 'INSERT') {
            setRequests(prev => [payload.new as WithdrawalRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.map(r => 
              r.id === (payload.new as WithdrawalRequest).id ? payload.new as WithdrawalRequest : r
            ));
            const updated = payload.new as WithdrawalRequest;
            if (updated.status === 'approved') {
              toast.success(`Your withdrawal of ₹${updated.amount} has been processed!`);
            } else if (updated.status === 'rejected') {
              toast.error(`Your withdrawal request was rejected. Amount refunded.`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    requests,
    loading,
    createRequest,
    refetch: fetchUserRequests
  };
}

// Admin hook for managing all withdrawal requests
export function useAdminWithdrawalRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchAllRequests = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    const { data: requestsData } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (requestsData && requestsData.length > 0) {
      const userIds = [...new Set(requestsData.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, game_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const enrichedData = requestsData.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || null
      }));
      
      setRequests(enrichedData as WithdrawalRequest[]);
    } else {
      setRequests([]);
    }
    setLoading(false);
  };

  const approveRequest = async (requestId: string, userId: string, amount: number) => {
    if (!user || !isAdmin) {
      toast.error("Admin access required");
      return { success: false };
    }

    // Update request status
    const { error: requestError } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "approved",
        processed_by: user.id,
        processed_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (requestError) {
      toast.error("Failed to approve request");
      return { success: false };
    }

    // Create transaction record
    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: "withdrawal",
      amount: -amount,
      description: "Withdrawal approved"
    });

    toast.success("Withdrawal request approved!");
    await fetchAllRequests();
    return { success: true };
  };

  const rejectRequest = async (requestId: string, userId: string, amount: number, notes?: string) => {
    if (!user || !isAdmin) {
      toast.error("Admin access required");
      return { success: false };
    }

    // Update request status
    const { error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "rejected",
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to reject request");
      return { success: false };
    }

    // Refund the balance
    const { data: profileData } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", userId)
      .single();

    const currentBalance = profileData?.wallet_balance || 0;

    await supabase
      .from("profiles")
      .update({ wallet_balance: currentBalance + amount })
      .eq("user_id", userId);

    // Create refund transaction
    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: "refund",
      amount: amount,
      description: "Withdrawal rejected - refunded"
    });

    toast.success("Withdrawal request rejected and refunded");
    await fetchAllRequests();
    return { success: true };
  };

  const getStats = () => {
    const pending = requests.filter(r => r.status === "pending").length;
    const approved = requests.filter(r => r.status === "approved").length;
    const rejected = requests.filter(r => r.status === "rejected").length;
    const totalPending = requests
      .filter(r => r.status === "pending")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return { pending, approved, rejected, totalPending, total: requests.length };
  };

  useEffect(() => {
    fetchAllRequests();

    if (!user || !isAdmin) return;

    const channel = supabase
      .channel('admin-withdrawal-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests'
        },
        () => {
          fetchAllRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  return {
    requests,
    loading,
    approveRequest,
    rejectRequest,
    getStats,
    refetch: fetchAllRequests
  };
}
