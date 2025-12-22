import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trophy,
  Users,
  Clock,
  Zap,
  ArrowLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tournament = {
  id: "1",
  title: "Fire Storm Championship",
  type: "squad",
  entryFee: 50,
  prizePool: 5000,
  maxPlayers: 100,
  currentPlayers: 87,
  startTime: "Starting in 15 min",
  status: "live",
  roomId: "FIRE2024",
  roomPassword: "storm99",
  rules: [
    "No teaming allowed",
    "No hacking or exploiting",
    "Respect all players",
    "Winner decided by total kills",
    "Top 10 players win prizes",
  ],
  prizeDistribution: [
    { position: "1st", prize: 2000 },
    { position: "2nd", prize: 1000 },
    { position: "3rd", prize: 500 },
    { position: "4th-5th", prize: 250 },
    { position: "6th-10th", prize: 150 },
  ],
  registeredPlayers: [
    { name: "ProSniper", avatar: "PS" },
    { name: "FireBeast99", avatar: "FB" },
    { name: "HeadshotKing", avatar: "HK" },
    { name: "ShadowNinja", avatar: "SN" },
    { name: "EliteGamer", avatar: "EG" },
  ],
};

export default function TournamentDetail() {
  const { id } = useParams();
  const [isJoined, setIsJoined] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleJoin = () => {
    setIsJoined(true);
    toast.success("Successfully joined the tournament!");
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const spotsLeft = tournament.maxPlayers - tournament.currentPlayers;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/tournaments"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Header */}
            <div className="gaming-card">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge
                  variant="outline"
                  className={cn(
                    "uppercase font-display",
                    tournament.type === "solo" && "border-neon-cyan text-neon-cyan",
                    tournament.type === "duo" && "border-secondary text-secondary",
                    tournament.type === "squad" && "border-primary text-primary"
                  )}
                >
                  {tournament.type}
                </Badge>
                {tournament.status === "live" && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    LIVE
                  </Badge>
                )}
              </div>

              <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                {tournament.title}
              </h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="font-display font-bold text-xl gradient-text">
                    ₹{tournament.prizePool.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Prize Pool
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Zap className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                  <div className="font-display font-bold text-xl text-neon-cyan">
                    ₹{tournament.entryFee}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Entry Fee
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Users className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <div className="font-display font-bold text-xl text-foreground">
                    {spotsLeft}/{tournament.maxPlayers}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Spots Left
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Clock className="w-5 h-5 text-gold mx-auto mb-2" />
                  <div className="font-display font-bold text-xl text-gold">
                    15:00
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Starts In
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details - Only visible after joining */}
            {isJoined && (
              <div className="gaming-card neon-border animate-fade-in">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-neon-cyan" />
                  Room Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Room ID
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xl text-foreground">
                        {tournament.roomId}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(tournament.roomId, "Room ID")
                        }
                      >
                        {copied === "Room ID" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      Password
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xl text-foreground">
                        {tournament.roomPassword}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(tournament.roomPassword, "Password")
                        }
                      >
                        {copied === "Password" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Join the custom room 5 minutes before the match starts.
                    Make sure to use your registered in-game name.
                  </p>
                </div>
              </div>
            )}

            {/* Rules */}
            <div className="gaming-card">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Match Rules
              </h3>
              <ul className="space-y-3">
                {tournament.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-display text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-muted-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Registered Players */}
            <div className="gaming-card">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Registered Players ({tournament.currentPlayers})
              </h3>
              <div className="flex flex-wrap gap-2">
                {tournament.registeredPlayers.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground text-xs">
                        {player.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{player.name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 text-muted-foreground">
                  <span className="text-sm">
                    +{tournament.currentPlayers - tournament.registeredPlayers.length} more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <div className="gaming-card sticky top-24">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Prize Distribution
              </h3>
              <div className="space-y-3 mb-6">
                {tournament.prizeDistribution.map((prize, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      index === 0 && "bg-gradient-to-r from-gold/20 to-amber-600/20 border border-gold/30",
                      index === 1 && "bg-gray-400/10 border border-gray-400/20",
                      index === 2 && "bg-amber-700/10 border border-amber-700/20",
                      index > 2 && "bg-muted/50"
                    )}
                  >
                    <span
                      className={cn(
                        "font-display font-semibold",
                        index === 0 && "text-gold",
                        index === 1 && "text-gray-300",
                        index === 2 && "text-amber-600",
                        index > 2 && "text-muted-foreground"
                      )}
                    >
                      {prize.position}
                    </span>
                    <span className="font-display font-bold gradient-text">
                      ₹{prize.prize}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Spots filled</span>
                  <span className="text-foreground font-semibold">
                    {tournament.currentPlayers}/{tournament.maxPlayers}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fire-orange to-fire-red rounded-full transition-all duration-500"
                    style={{
                      width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Join Button */}
              {isJoined ? (
                <Button variant="neon" className="w-full" disabled>
                  <CheckCircle className="w-5 h-5" />
                  Joined
                </Button>
              ) : (
                <Button variant="fire" className="w-full" onClick={handleJoin}>
                  Join for ₹{tournament.entryFee}
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4">
                Entry fee will be deducted from your wallet
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
