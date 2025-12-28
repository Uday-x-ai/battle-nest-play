import { useState } from "react";
import { FreefireStats } from "@/hooks/useFreefireStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Skull, Target, Trophy, Crosshair, Heart, Timer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FreefireStatsCardProps {
  stats: FreefireStats | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function FreefireStatsCard({ stats, loading, error, onRefresh }: FreefireStatsCardProps) {
  const [activeMode, setActiveMode] = useState<"solo" | "duo" | "squad">("squad");

  if (loading) {
    return (
      <div className="gaming-card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading Free Fire stats...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="gaming-card">
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-2">Unable to load Free Fire stats</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getModeStats = () => {
    switch (activeMode) {
      case "solo":
        return stats.solostats;
      case "duo":
        return stats.duostats;
      case "squad":
        return stats.quadstats;
    }
  };

  const currentStats = getModeStats();
  const kd = currentStats.detailedstats.deaths > 0 
    ? (currentStats.kills / currentStats.detailedstats.deaths).toFixed(2) 
    : currentStats.kills.toFixed(2);
  const winRate = currentStats.gamesplayed > 0 
    ? ((currentStats.wins / currentStats.gamesplayed) * 100).toFixed(1) 
    : "0";
  const headshotRate = currentStats.kills > 0
    ? ((currentStats.detailedstats.headshotkills / currentStats.kills) * 100).toFixed(1)
    : "0";
  const avgKills = currentStats.gamesplayed > 0
    ? (currentStats.kills / currentStats.gamesplayed).toFixed(1)
    : "0";

  return (
    <div className="gaming-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/6499/6499200.png" 
            alt="Free Fire" 
            className="w-6 h-6"
          />
          Free Fire Stats
        </h3>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as typeof activeMode)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="solo">Solo</TabsTrigger>
          <TabsTrigger value="duo">Duo</TabsTrigger>
          <TabsTrigger value="squad">Squad</TabsTrigger>
        </TabsList>

        <TabsContent value={activeMode} className="mt-0">
          {/* Main Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 text-gold mx-auto mb-1" />
              <div className="font-display font-bold text-xl text-gold">{currentStats.wins}</div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Skull className="w-5 h-5 text-destructive mx-auto mb-1" />
              <div className="font-display font-bold text-xl text-destructive">{currentStats.kills.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Kills</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Target className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
              <div className="font-display font-bold text-xl text-neon-cyan">{currentStats.gamesplayed}</div>
              <div className="text-xs text-muted-foreground">Matches</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <Crosshair className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="font-display font-bold text-xl gradient-text">{kd}</div>
              <div className="text-xs text-muted-foreground">K/D Ratio</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/20 rounded-lg p-2 text-center">
              <div className="font-semibold text-foreground">{winRate}%</div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
            <div className="bg-muted/20 rounded-lg p-2 text-center">
              <div className="font-semibold text-foreground">{headshotRate}%</div>
              <div className="text-xs text-muted-foreground">Headshot %</div>
            </div>
            <div className="bg-muted/20 rounded-lg p-2 text-center">
              <div className="font-semibold text-foreground">{avgKills}</div>
              <div className="text-xs text-muted-foreground">Avg Kills</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Highest Kills</span>
                <span className="font-semibold text-foreground">{currentStats.detailedstats.highestkills}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Headshot Kills</span>
                <span className="font-semibold text-foreground">{currentStats.detailedstats.headshotkills}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Knockdowns</span>
                <span className="font-semibold text-foreground">{currentStats.detailedstats.knockdown?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revives</span>
                <span className="font-semibold text-foreground">{currentStats.detailedstats.revives || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Top 10 Finishes</span>
                <span className="font-semibold text-foreground">{currentStats.detailedstats.topntimes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Damage Dealt</span>
                <span className="font-semibold text-foreground">{currentStats.detailedstats.damage.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
