import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const leaderboardData = [
  { rank: 1, name: "ProSniper", wins: 156, earnings: 125000, avatar: "PS", change: "up" },
  { rank: 2, name: "FireBeast99", wins: 142, earnings: 98000, avatar: "FB", change: "same" },
  { rank: 3, name: "HeadshotKing", wins: 128, earnings: 87000, avatar: "HK", change: "up" },
  { rank: 4, name: "ShadowNinja", wins: 115, earnings: 72000, avatar: "SN", change: "down" },
  { rank: 5, name: "EliteGamer", wins: 108, earnings: 65000, avatar: "EG", change: "up" },
  { rank: 6, name: "NightHawk", wins: 102, earnings: 58000, avatar: "NH", change: "same" },
  { rank: 7, name: "BlazeMaster", wins: 98, earnings: 52000, avatar: "BM", change: "up" },
  { rank: 8, name: "StormRider", wins: 95, earnings: 48000, avatar: "SR", change: "down" },
  { rank: 9, name: "VenomStrike", wins: 91, earnings: 44000, avatar: "VS", change: "up" },
  { rank: 10, name: "IronWolf", wins: 88, earnings: 41000, avatar: "IW", change: "same" },
];

type TimeFilter = "daily" | "weekly" | "monthly" | "allTime";

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");

  const topThree = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

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
        <div className="flex justify-center gap-2 mb-12">
          {(["daily", "weekly", "monthly", "allTime"] as TimeFilter[]).map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? "fire" : "ghost"}
              onClick={() => setTimeFilter(filter)}
              className="capitalize"
            >
              {filter === "allTime" ? "All Time" : filter}
            </Button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-12">
          {/* 2nd Place */}
          <div className="order-1 md:order-1 mt-8">
            <div className="gaming-card text-center relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gray-400/20 flex items-center justify-center border-2 border-gray-400">
                <span className="font-display font-bold text-gray-300 text-xl">2</span>
              </div>
              <Avatar className="w-16 h-16 mx-auto mt-8 border-2 border-gray-400">
                <AvatarFallback className="bg-gray-600 text-foreground font-display">
                  {topThree[1].avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-display font-bold text-lg text-foreground mt-3">
                {topThree[1].name}
              </h3>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-1">
                <Trophy className="w-4 h-4" />
                {topThree[1].wins} wins
              </div>
              <div className="font-display font-bold text-xl gradient-text mt-2">
                ₹{topThree[1].earnings.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="order-2 md:order-2">
            <div className="gaming-card neon-border text-center relative bg-gradient-to-b from-gold/10 to-transparent">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gold to-amber-600 flex items-center justify-center shadow-[0_0_30px_hsl(var(--gold)/0.5)]">
                  <Crown className="w-8 h-8 text-background" />
                </div>
              </div>
              <Avatar className="w-20 h-20 mx-auto mt-10 border-4 border-gold shadow-[0_0_20px_hsl(var(--gold)/0.4)]">
                <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground font-display text-xl">
                  {topThree[0].avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-display font-bold text-xl text-foreground mt-4">
                {topThree[0].name}
              </h3>
              <Badge variant="gold" className="mt-2">
                Champion
              </Badge>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-3">
                <Trophy className="w-4 h-4 text-gold" />
                {topThree[0].wins} wins
              </div>
              <div className="font-display font-black text-2xl text-gold mt-2">
                ₹{topThree[0].earnings.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-3 mt-12">
            <div className="gaming-card text-center relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-700/30 flex items-center justify-center border-2 border-amber-700">
                <span className="font-display font-bold text-amber-600 text-xl">3</span>
              </div>
              <Avatar className="w-14 h-14 mx-auto mt-8 border-2 border-amber-700">
                <AvatarFallback className="bg-amber-900 text-foreground font-display">
                  {topThree[2].avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-display font-bold text-lg text-foreground mt-3">
                {topThree[2].name}
              </h3>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-1">
                <Trophy className="w-4 h-4" />
                {topThree[2].wins} wins
              </div>
              <div className="font-display font-bold text-xl gradient-text mt-2">
                ₹{topThree[2].earnings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="gaming-card max-w-4xl mx-auto overflow-hidden">
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
                  <th className="text-center py-4 px-4 font-display text-sm text-muted-foreground uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {rest.map((player) => (
                  <tr
                    key={player.rank}
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
                            {player.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-display font-semibold text-foreground">
                          {player.wins}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-display font-bold gradient-text">
                        ₹{player.earnings.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                          player.change === "up" &&
                            "bg-green-500/20 text-green-400",
                          player.change === "down" &&
                            "bg-red-500/20 text-red-400",
                          player.change === "same" &&
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {player.change === "up" && <TrendingUp className="w-3 h-3" />}
                        {player.change === "down" && (
                          <TrendingUp className="w-3 h-3 rotate-180" />
                        )}
                        {player.change === "same" && "–"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <Button variant="ghost" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page 1 of 10
            </span>
            <Button variant="ghost" size="sm">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
