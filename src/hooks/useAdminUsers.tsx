import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  user_id: string;
  username: string | null;
  game_name: string | null;
  telegram_id: string | null;
  avatar_url: string | null;
  wallet_balance: number | null;
  total_wins: number | null;
  total_earnings: number | null;
  created_at: string;
  updated_at: string;
  email?: string;
  roles: string[];
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const roleMap = new Map<string, string[]>();
      roles?.forEach((r) => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      const usersWithRoles: AdminUser[] = (profiles || []).map((p) => ({
        ...p,
        roles: roleMap.get(p.user_id) || ["user"],
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const addRole = useCallback(async (userId: string, role: "admin" | "moderator" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role })
        .select();

      if (error) {
        if (error.code === "23505") {
          toast.error("User already has this role");
          return false;
        }
        throw error;
      }

      toast.success(`Role "${role}" added successfully`);
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Failed to add role");
      return false;
    }
  }, [fetchUsers]);

  const removeRole = useCallback(async (userId: string, role: "admin" | "moderator" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast.success(`Role "${role}" removed successfully`);
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Failed to remove role");
      return false;
    }
  }, [fetchUsers]);

  const updateWalletBalance = useCallback(async (userId: string, amount: number, type: "deposit" | "withdraw") => {
    try {
      // Get current balance
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = profile?.wallet_balance || 0;
      const newBalance = type === "deposit" 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (newBalance < 0) {
        toast.error("Insufficient balance for withdrawal");
        return false;
      }

      // Update balance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          type: type === "deposit" ? "deposit" : "withdrawal",
          amount: type === "deposit" ? amount : -amount,
          description: `Admin ${type}: ₹${amount}`,
        });

      if (txError) throw txError;

      toast.success(`₹${amount} ${type === "deposit" ? "added to" : "withdrawn from"} wallet`);
      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error updating wallet:", error);
      toast.error("Failed to update wallet");
      return false;
    }
  }, [fetchUsers]);

  const getStats = useCallback(() => {
    const totalUsers = users.length;
    const admins = users.filter((u) => u.roles.includes("admin")).length;
    const moderators = users.filter((u) => u.roles.includes("moderator")).length;
    const totalWalletBalance = users.reduce((sum, u) => sum + (u.wallet_balance || 0), 0);

    return { totalUsers, admins, moderators, totalWalletBalance };
  }, [users]);

  return {
    users,
    loading,
    fetchUsers,
    addRole,
    removeRole,
    updateWalletBalance,
    getStats,
  };
}
