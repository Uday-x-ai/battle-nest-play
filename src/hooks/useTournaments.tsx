import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Tournament {
  id: string;
  title: string;
  type: "solo" | "duo" | "squad" | "clash_squad";
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  start_time: string;
  status: "live" | "upcoming" | "completed";
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  map?: string;
  room_id?: string;
  room_password?: string;
  per_kill_prize?: number;
  win_prize?: number;
  description?: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  registered_at: string;
  slot_number: number | null;
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const { user, profile, refreshProfile } = useAuth();

  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("start_time", { ascending: true });

    if (!error && data) {
      setTournaments(data as Tournament[]);
    }
    setLoading(false);
  };

  const fetchUserRegistrations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("tournament_registrations")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      setRegistrations(data as TournamentRegistration[]);
    }
  };

  useEffect(() => {
    fetchTournaments();

    // Subscribe to real-time updates for tournaments
    const channel = supabase
      .channel('tournaments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        (payload) => {
          console.log('Tournament update:', payload);
          if (payload.eventType === 'INSERT') {
            setTournaments(prev => [...prev, payload.new as Tournament]);
          } else if (payload.eventType === 'UPDATE') {
            setTournaments(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new as Tournament : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTournaments(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const isRegistered = (tournamentId: string) => {
    return registrations.some(r => r.tournament_id === tournamentId);
  };

  const getTakenSlots = async (tournamentId: string): Promise<number[]> => {
    const { data, error } = await supabase
      .from("tournament_registrations")
      .select("slot_number")
      .eq("tournament_id", tournamentId)
      .not("slot_number", "is", null);

    if (error || !data) return [];
    return data.map(r => r.slot_number as number);
  };

  const joinTournament = async (tournamentId: string, slotNumber?: number) => {
    if (!user) {
      toast.error("Please login to join a tournament");
      return { success: false };
    }

    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) {
      toast.error("Tournament not found");
      return { success: false };
    }

    if (isRegistered(tournamentId)) {
      toast.error("You are already registered for this tournament");
      return { success: false };
    }

    if (tournament.current_players >= tournament.max_players) {
      toast.error("Tournament is full");
      return { success: false };
    }

    if (profile && profile.wallet_balance < tournament.entry_fee) {
      toast.error("Insufficient wallet balance");
      return { success: false };
    }

    // Verify slot is still available
    if (slotNumber !== undefined) {
      const takenSlots = await getTakenSlots(tournamentId);
      if (takenSlots.includes(slotNumber)) {
        toast.error("This slot has already been taken. Please choose another slot.");
        return { success: false };
      }
    }

    // Deduct entry fee from wallet
    const { error: walletError } = await supabase
      .from("profiles")
      .update({ wallet_balance: (profile?.wallet_balance || 0) - tournament.entry_fee })
      .eq("user_id", user.id);

    if (walletError) {
      toast.error("Failed to process entry fee");
      return { success: false };
    }

    // Record transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "entry_fee",
      amount: -tournament.entry_fee,
      description: `Entry fee for ${tournament.title}`,
      tournament_id: tournamentId
    });

    // Register for tournament with slot
    const { error } = await supabase
      .from("tournament_registrations")
      .insert({
        tournament_id: tournamentId,
        user_id: user.id,
        slot_number: slotNumber ?? null
      });

    if (error) {
      // Refund if registration fails
      await supabase
        .from("profiles")
        .update({ wallet_balance: (profile?.wallet_balance || 0) })
        .eq("user_id", user.id);
      toast.error("Failed to join tournament");
      return { success: false };
    }

    toast.success(`Successfully joined ${tournament.title}!`);
    await fetchTournaments();
    await fetchUserRegistrations();
    await refreshProfile();
    return { success: true };
  };

  const leaveTournament = async (tournamentId: string) => {
    if (!user) return { success: false };

    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false };

    // Refund entry fee
    const { error: walletError } = await supabase
      .from("profiles")
      .update({ wallet_balance: (profile?.wallet_balance || 0) + tournament.entry_fee })
      .eq("user_id", user.id);

    if (walletError) {
      toast.error("Failed to process refund");
      return { success: false };
    }

    // Record refund transaction
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "refund",
      amount: tournament.entry_fee,
      description: `Refund for leaving ${tournament.title}`,
      tournament_id: tournamentId
    });

    const { error } = await supabase
      .from("tournament_registrations")
      .delete()
      .eq("tournament_id", tournamentId)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to leave tournament");
      return { success: false };
    }

    toast.success("Left tournament and received refund");
    await fetchTournaments();
    await fetchUserRegistrations();
    await refreshProfile();
    return { success: true };
  };

  return {
    tournaments,
    loading,
    registrations,
    isRegistered,
    joinTournament,
    leaveTournament,
    getTakenSlots,
    refetch: fetchTournaments
  };
}
