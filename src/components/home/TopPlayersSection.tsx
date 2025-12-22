import { Link } from "react-router-dom";
import { Trophy, Medal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const topPlayers = [
  { rank: 1, name: "ProSniper", wins: 156, earnings: 125000, avatar: "PS" },
  { rank: 2, name: "FireBeast99", wins: 142, earnings: 98000, avatar: "FB" },
  { rank: 3, name: "HeadshotKing", wins: 128, earnings: 87000, avatar: "HK" },
  { rank: 4, name: "ShadowNinja", wins: 115, earnings: 72000, avatar: "SN" },
  { rank: 5, name: "EliteGamer", wins: 108, earnings: 65000, avatar: "EG" },
];

export function TopPlayersSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-gold shadow-[0_0_30px_hsl(var(--gold)/0.4)]">
              <Medal className="w-6 h-6 text-background" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                Top Players
              </h2>
              <p className="text-muted-foreground">
                This month's champions
              </p>
            </div>
          </div>
          <Link to="/leaderboard">
            <Button variant="outline" className="group">
              Full Leaderboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Leaderboard Table */}
        <div className="gaming-card overflow-hidden">
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
                {topPlayers.map((player) => (
                  <tr
                    key={player.rank}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm",
                          player.rank === 1 && "bg-gradient-gold text-background",
                          player.rank === 2 && "bg-gray-400/20 text-gray-300",
                          player.rank === 3 && "bg-amber-700/30 text-amber-600",
                          player.rank > 3 && "bg-muted text-muted-foreground"
                        )}
                      >
                        {player.rank}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-border">
                          <AvatarFallback className="bg-gradient-fire text-primary-foreground font-display text-sm">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
