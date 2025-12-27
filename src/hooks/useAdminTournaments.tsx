import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TournamentFormData } from "@/components/admin/TournamentForm";
import { Tournament } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";

export function useAdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("start_time", { ascending: false });

      if (error) throw error;
      setTournaments((data || []) as Tournament[]);
    } catch (error: any) {
      console.error("Error fetching tournaments:", error);
      toast.error("Failed to fetch tournaments");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTournament = useCallback(
    async (formData: TournamentFormData) => {
      if (!user) {
        toast.error("You must be logged in");
        return false;
      }

      try {
        const { error } = await supabase.from("tournaments").insert({
          title: formData.title,
          type: formData.type,
          entry_fee: formData.entry_fee,
          prize_pool: formData.prize_pool,
          max_players: formData.max_players,
          start_time: new Date(formData.start_time).toISOString(),
          status: formData.status,
          image_url: formData.image_url || null,
          created_by: user.id,
          map: formData.map || "bermuda",
          room_id: formData.room_id || null,
          room_password: formData.room_password || null,
          per_kill_prize: formData.per_kill_prize || 0,
          win_prize: formData.win_prize || 0,
          description: formData.description || null,
        });

        if (error) throw error;
        toast.success("Tournament created successfully!");
        await fetchTournaments();
        return true;
      } catch (error: any) {
        console.error("Error creating tournament:", error);
        toast.error(error.message || "Failed to create tournament");
        return false;
      }
    },
    [user, fetchTournaments]
  );

  const updateTournament = useCallback(
    async (id: string, formData: TournamentFormData) => {
      try {
        const { error } = await supabase
          .from("tournaments")
          .update({
            title: formData.title,
            type: formData.type,
            entry_fee: formData.entry_fee,
            prize_pool: formData.prize_pool,
            max_players: formData.max_players,
            start_time: new Date(formData.start_time).toISOString(),
            status: formData.status,
            image_url: formData.image_url || null,
            map: formData.map || "bermuda",
            room_id: formData.room_id || null,
            room_password: formData.room_password || null,
            per_kill_prize: formData.per_kill_prize || 0,
            win_prize: formData.win_prize || 0,
            description: formData.description || null,
          })
          .eq("id", id);

        if (error) throw error;
        toast.success("Tournament updated successfully!");
        await fetchTournaments();
        return true;
      } catch (error: any) {
        console.error("Error updating tournament:", error);
        toast.error(error.message || "Failed to update tournament");
        return false;
      }
    },
    [fetchTournaments]
  );

  const deleteTournament = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("tournaments")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Tournament deleted successfully!");
        await fetchTournaments();
        return true;
      } catch (error: any) {
        console.error("Error deleting tournament:", error);
        toast.error(error.message || "Failed to delete tournament");
        return false;
      }
    },
    [fetchTournaments]
  );

  const getStats = useCallback(() => {
    const now = new Date();
    return {
      total: tournaments.length,
      upcoming: tournaments.filter((t) => t.status === "upcoming").length,
      live: tournaments.filter((t) => t.status === "live").length,
      completed: tournaments.filter((t) => t.status === "completed").length,
      totalPrizePool: tournaments.reduce(
        (sum, t) => sum + (t.prize_pool || 0),
        0
      ),
      totalPlayers: tournaments.reduce(
        (sum, t) => sum + (t.current_players || 0),
        0
      ),
    };
  }, [tournaments]);

  return {
    tournaments,
    loading,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    getStats,
  };
}
