import { Link } from "react-router-dom";
import { Users, Trophy, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Tournament {
  id: string;
  title: string;
  type: "solo" | "duo" | "squad" | "clash_squad";
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  startTime: string;
  status: "live" | "upcoming" | "completed";
  image?: string;
}

interface TournamentCardProps {
  tournament: Tournament;
  featured?: boolean;
  isRegistered?: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}

export function TournamentCard({ tournament, featured = false, isRegistered = false, onJoin, onLeave }: TournamentCardProps) {
  const spotsLeft = tournament.maxPlayers - tournament.currentPlayers;
  const isFull = spotsLeft <= 0;

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRegistered && onLeave) {
      onLeave();
    } else if (!isRegistered && onJoin) {
      onJoin();
    }
  };

  return (
    <div
      className={cn(
        "gaming-card group relative overflow-hidden transition-all duration-500 hover:-translate-y-1",
        featured && "md:col-span-2 neon-border"
      )}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {tournament.status === "live" && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            LIVE
          </Badge>
        )}
        {tournament.status === "upcoming" && (
          <Badge className="bg-primary/20 text-primary border-primary/50">
            UPCOMING
          </Badge>
        )}
        {tournament.status === "completed" && (
          <Badge variant="secondary">COMPLETED</Badge>
        )}
      </div>

      {/* Type Badge */}
      <Badge
        variant="outline"
        className={cn(
          "absolute top-4 left-4 z-10 uppercase font-display",
          tournament.type === "solo" && "border-neon-cyan text-neon-cyan",
          tournament.type === "duo" && "border-secondary text-secondary",
          tournament.type === "squad" && "border-primary text-primary"
        )}
      >
        {tournament.type}
      </Badge>

      {/* Content */}
      <div className="pt-12 space-y-4">
        <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors">
          {tournament.title}
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Trophy className="w-3.5 h-3.5" />
              Prize Pool
            </div>
            <div className="font-display font-bold text-lg gradient-text">
              ₹{tournament.prizePool.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Zap className="w-3.5 h-3.5" />
              Entry Fee
            </div>
            <div className="font-display font-bold text-lg text-neon-cyan">
              ₹{tournament.entryFee}
            </div>
          </div>
        </div>

        {/* Players & Time */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              <span className={cn("font-semibold", spotsLeft <= 5 && "text-destructive")}>
                {spotsLeft}
              </span>
              /{tournament.maxPlayers} spots left
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {tournament.startTime}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-fire rounded-full transition-all duration-500"
            style={{
              width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%`,
            }}
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isRegistered ? (
            <Button
              variant="neon"
              className="w-full"
              onClick={handleAction}
              disabled={tournament.status === "completed"}
            >
              {tournament.status === "live" ? "View Match" : "Leave Tournament"}
            </Button>
          ) : (
            <Link to={`/tournaments/${tournament.id}`}>
              <Button
                variant={isFull ? "outline" : "fire"}
                className="w-full"
                disabled={isFull || tournament.status === "completed"}
              >
                {isFull
                  ? "Full"
                  : tournament.status === "live"
                  ? "View Match"
                  : tournament.status === "completed"
                  ? "View Results"
                  : "Join Now"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
