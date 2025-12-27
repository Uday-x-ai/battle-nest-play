import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string | null;
  game_name: string | null;
  avatar_url: string | null;
  total_wins: number;
  total_earnings: number;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, username, game_name, avatar_url, total_wins, total_earnings")
      .order("total_earnings", { ascending: false })
      .limit(50);

    if (!error && data) {
      const ranked = data.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      setEntries(ranked as LeaderboardEntry[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates for profiles (leaderboard data)
    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Leaderboard update:', payload);
          // Refetch to recalculate rankings when any profile updates
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    entries,
    loading,
    refetch: fetchLeaderboard
  };
}
