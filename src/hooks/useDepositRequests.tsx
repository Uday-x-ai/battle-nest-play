import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  processed_by: string | null;
  processed_at: string | null;
  notes: string | null;
  // Joined profile data
  profile?: {
    username: string | null;
    game_name: string | null;
  };
}

export function useDepositRequests() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("deposit_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data as DepositRequest[]);
    }
    setLoading(false);
  };

  const createRequest = async (amount: number) => {
    if (!user) {
      toast.error("Please login to create a deposit request");
      return { success: false };
    }

    if (amount < 10) {
      toast.error("Minimum deposit is ₹10");
      return { success: false };
    }

    const { error } = await supabase.from("deposit_requests").insert({
      user_id: user.id,
      amount: amount,
      status: "pending"
    });

    if (error) {
      toast.error("Failed to create deposit request");
      return { success: false };
    }

    toast.success(`Deposit request for ₹${amount} submitted!`);
    await fetchUserRequests();
    return { success: true };
  };

  useEffect(() => {
    fetchUserRequests();

    if (!user) return;

    // Real-time subscription for deposit request updates
    const channel = supabase
      .channel(`deposit-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposit_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Deposit request update:', payload);
          if (payload.eventType === 'INSERT') {
            setRequests(prev => [payload.new as DepositRequest, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.map(r => 
              r.id === (payload.new as DepositRequest).id ? payload.new as DepositRequest : r
            ));
            const updated = payload.new as DepositRequest;
            if (updated.status === 'approved') {
              toast.success(`Your deposit of ₹${updated.amount} has been approved!`);
            } else if (updated.status === 'rejected') {
              toast.error(`Your deposit request was rejected.`);
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

// Admin hook for managing all deposit requests
export function useAdminDepositRequests() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchAllRequests = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    // Fetch deposit requests
    const { data: requestsData } = await supabase
      .from("deposit_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (requestsData && requestsData.length > 0) {
      // Fetch profiles for all users
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
      
      setRequests(enrichedData as DepositRequest[]);
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

    // Start a transaction-like operation
    // 1. Update request status
    const { error: requestError } = await supabase
      .from("deposit_requests")
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

    // 2. Get current wallet balance
    const { data: profileData } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", userId)
      .single();

    const currentBalance = profileData?.wallet_balance || 0;

    // 3. Update wallet balance
    const { error: walletError } = await supabase
      .from("profiles")
      .update({ wallet_balance: currentBalance + amount })
      .eq("user_id", userId);

    if (walletError) {
      toast.error("Failed to update wallet balance");
      return { success: false };
    }

    // 4. Create transaction record
    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: userId,
        type: "deposit",
        amount: amount,
        description: "Deposit approved"
      });

    if (txError) {
      console.error("Failed to create transaction record:", txError);
    }

    toast.success("Deposit request approved!");
    await fetchAllRequests();
    return { success: true };
  };

  const rejectRequest = async (requestId: string, notes?: string) => {
    if (!user || !isAdmin) {
      toast.error("Admin access required");
      return { success: false };
    }

    const { error } = await supabase
      .from("deposit_requests")
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

    toast.success("Deposit request rejected");
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

    // Real-time subscription for all deposit requests
    const channel = supabase
      .channel('admin-deposit-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposit_requests'
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
