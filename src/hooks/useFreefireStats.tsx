import { useState, useEffect } from "react";

interface DetailedStats {
  damage: number;
  deaths: number;
  distancetravelled: number;
  headshotkills: number;
  headshots: number;
  highestkills: number;
  knockdown: number;
  pickups: number;
  revives: number;
  survivaltime: number;
  topntimes: number;
  roadkills?: number;
}

interface ModeStats {
  accountid: string;
  detailedstats: DetailedStats;
  gamesplayed: number;
  kills: number;
  wins: number;
}

export interface FreefireStats {
  solostats: ModeStats;
  duostats: ModeStats;
  quadstats: ModeStats;
}

interface FreefireStatsResponse {
  data: FreefireStats;
  metadata: {
    gamemode: string;
    matchmode: string;
    server: string;
    uid: string;
  };
  success: boolean;
}

export function useFreefireStats(gameId: string | null | undefined) {
  const [stats, setStats] = useState<FreefireStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://ffapi.udayscripts.in/api/account/stats?uid=${gameId}&region=IND`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data: FreefireStatsResponse = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setError("Failed to load stats");
        }
      } catch (err) {
        console.error("Error fetching Free Fire stats:", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [gameId]);

  const refetch = () => {
    if (gameId) {
      setLoading(true);
      fetch(`https://ffapi.udayscripts.in/api/account/stats?uid=${gameId}&region=IND`)
        .then((res) => res.json())
        .then((data: FreefireStatsResponse) => {
          if (data.success) {
            setStats(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  return { stats, loading, error, refetch };
}
