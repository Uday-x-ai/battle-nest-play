import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, TrendingUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaderboard } from "@/hooks/useLeaderboard";

type TimeFilter = "daily" | "weekly" | "monthly" | "allTime";

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");
  const { entries, loading } = useLeaderboard();

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  const getInitials = (entry: typeof entries[0]) => {
    const name = entry.game_name || entry.username || "U";
    return name.slice(0, 2).toUpperCase();
  };

  const getName = (entry: typeof entries[0]) => {
    return entry.game_name || entry.username || "Unknown Player";
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-gold to-amber-600 shadow-[0_0_40px_hsl(var(--gold)/0.4)] mb-6">
            <Crown className="w-10 h-10 text-background" />
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl text-foreground mb-4">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Top performers earning real rewards
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-12">
          {(["daily", "weekly", "monthly", "allTime"] as TimeFilter[]).map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? "fire" : "ghost"}
              onClick={() => setTimeFilter(filter)}
              className="capitalize text-xs sm:text-sm px-3 py-2 sm:px-4"
              size="sm"
            >
              {filter === "allTime" ? "All Time" : filter}
            </Button>
          ))}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">No players yet</h3>
            <p className="text-muted-foreground">Be the first to compete and earn your spot!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
              <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-8 md:mb-12">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 md:mt-8">
                  <div className="gaming-card text-center relative flex md:block items-center gap-4 p-4 md:p-6">
                    <div className="relative md:absolute md:-top-6 md:left-1/2 md:-translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-400/20 flex items-center justify-center border-2 border-gray-400 shrink-0">
                      <span className="font-display font-bold text-gray-300 text-lg md:text-xl">2</span>
                    </div>
                    <Avatar className="w-12 h-12 md:w-16 md:h-16 md:mx-auto md:mt-8 border-2 border-gray-400 shrink-0">
                      <AvatarFallback className="bg-gray-600 text-foreground font-display">
                        {getInitials(topThree[1])}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left md:text-center">
                      <h3 className="font-display font-bold text-base md:text-lg text-foreground md:mt-3">
                        {getName(topThree[1])}
                      </h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm mt-1 md:justify-center">
                        <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                        {topThree[1].total_wins} wins
                      </div>
                    </div>
                    <div className="font-display font-bold text-lg md:text-xl gradient-text md:mt-2 shrink-0">
                      ₹{topThree[1].total_earnings.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2">
                  <div className="gaming-card neon-border text-center relative bg-gradient-to-b from-gold/10 to-transparent flex md:block items-center gap-4 p-4 md:p-6 md:overflow-visible">
                    <div className="relative md:absolute md:-top-8 md:left-1/2 md:-translate-x-1/2 shrink-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-gold to-amber-600 flex items-center justify-center shadow-[0_0_30px_hsl(var(--gold)/0.5)]">
                        <Crown className="w-6 h-6 md:w-8 md:h-8 text-background" />
                      </div>
                    </div>
                    <Avatar className="w-14 h-14 md:w-20 md:h-20 md:mx-auto md:mt-10 border-4 border-gold shadow-[0_0_20px_hsl(var(--gold)/0.4)] shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground font-display text-lg md:text-xl">
                        {getInitials(topThree[0])}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left md:text-center">
                      <h3 className="font-display font-bold text-lg md:text-xl text-foreground md:mt-4">
                        {getName(topThree[0])}
                      </h3>
                      <Badge variant="gold" className="mt-1 md:mt-2">
                        Champion
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm mt-2 md:mt-3 md:justify-center">
                        <Trophy className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                        {topThree[0].total_wins} wins
                      </div>
                    </div>
                    <div className="font-display font-black text-xl md:text-2xl text-gold md:mt-2 shrink-0">
                      ₹{topThree[0].total_earnings.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:mt-12">
                  <div className="gaming-card text-center relative flex md:block items-center gap-4 p-4 md:p-6">
                    <div className="relative md:absolute md:-top-6 md:left-1/2 md:-translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-700/30 flex items-center justify-center border-2 border-amber-700 shrink-0">
                      <span className="font-display font-bold text-amber-600 text-lg md:text-xl">3</span>
                    </div>
                    <Avatar className="w-10 h-10 md:w-14 md:h-14 md:mx-auto md:mt-8 border-2 border-amber-700 shrink-0">
                      <AvatarFallback className="bg-amber-900 text-foreground font-display text-sm">
                        {getInitials(topThree[2])}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left md:text-center">
                      <h3 className="font-display font-bold text-base md:text-lg text-foreground md:mt-3">
                        {getName(topThree[2])}
                      </h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm mt-1 md:justify-center">
                        <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                        {topThree[2].total_wins} wins
                      </div>
                    </div>
                    <div className="font-display font-bold text-lg md:text-xl gradient-text md:mt-2 shrink-0">
                      ₹{topThree[2].total_earnings.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table - Desktop */}
            {rest.length > 0 && (
              <div className="gaming-card max-w-4xl mx-auto overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-4 px-4 font-display text-sm text-muted-foreground uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="text-left py-4 px-4 font-display text-sm text-muted-foreground uppercase tracking-wider">
                          Player
                        </th>
                        <th className="text-center py-4 px-4 font-display text-sm text-muted-foreground uppercase tracking-wider">
                          Wins
                        </th>
                        <th className="text-right py-4 px-4 font-display text-sm text-muted-foreground uppercase tracking-wider">
                          Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((player) => (
                        <tr
                          key={player.user_id}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-display font-bold text-sm text-muted-foreground">
                              {player.rank}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="border-2 border-border">
                                <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground font-display text-sm">
                                  {getInitials(player)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-foreground">
                                {getName(player)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Trophy className="w-4 h-4 text-primary" />
                              <span className="font-display font-semibold text-foreground">
                                {player.total_wins}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-display font-bold gradient-text">
                              ₹{player.total_earnings.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leaderboard Cards - Mobile */}
            {rest.length > 0 && (
              <div className="md:hidden space-y-3">
                {rest.map((player) => (
                  <div
                    key={player.user_id}
                    className="gaming-card p-4 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-display font-bold text-sm text-muted-foreground shrink-0">
                      {player.rank}
                    </div>
                    <Avatar className="border-2 border-border shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground font-display text-sm">
                        {getInitials(player)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {getName(player)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-primary" />
                          {player.total_wins}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-sm gradient-text">
                        ₹{player.total_earnings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
