import { useState, useEffect } from "react";
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
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTournaments } from "@/hooks/useTournaments";

interface RegisteredUser {
  user_id: string;
  registered_at: string;
  profile?: {
    username: string | null;
    game_name: string | null;
    avatar_url: string | null;
  };
}

export default function TournamentDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { tournaments, loading: tournamentsLoading, isRegistered, joinTournament, leaveTournament, registrations } = useTournaments();
  const [copied, setCopied] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [joining, setJoining] = useState(false);

  const tournament = tournaments.find((t) => t.id === id);
  const isJoined = id ? isRegistered(id) : false;

  // Fetch registered users for admin view
  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      if (!id || !isAdmin) return;
      
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from("tournament_registrations")
          .select(`
            user_id,
            registered_at
          `)
          .eq("tournament_id", id);

        if (error) throw error;

        // Fetch profiles for each user
        if (data && data.length > 0) {
          const userIds = data.map((r) => r.user_id);
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, username, game_name, avatar_url")
            .in("user_id", userIds);

          if (profilesError) throw profilesError;

          const usersWithProfiles = data.map((reg) => ({
            ...reg,
            profile: profiles?.find((p) => p.user_id === reg.user_id),
          }));

          setRegisteredUsers(usersWithProfiles);
        } else {
          setRegisteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching registered users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchRegisteredUsers();
  }, [id, isAdmin]);

  const handleJoin = async () => {
    if (!id || !user) {
      toast.error("Please login to join the tournament");
      return;
    }
    setJoining(true);
    const success = await joinTournament(id);
    if (success) {
      toast.success("Successfully joined the tournament!");
    }
    setJoining(false);
  };

  const handleLeave = async () => {
    if (!id) return;
    setJoining(true);
    const success = await leaveTournament(id);
    if (success) {
      toast.success("Successfully left the tournament!");
    }
    setJoining(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  if (tournamentsLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Tournament Not Found</h1>
            <Link to="/tournaments">
              <Button variant="outline">Back to Tournaments</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const spotsLeft = tournament.max_players - (tournament.current_players || 0);

  const prizeDistribution = [
    { position: "1st", prize: Math.round((tournament.prize_pool || 0) * 0.4) },
    { position: "2nd", prize: Math.round((tournament.prize_pool || 0) * 0.2) },
    { position: "3rd", prize: Math.round((tournament.prize_pool || 0) * 0.1) },
    { position: "4th-5th", prize: Math.round((tournament.prize_pool || 0) * 0.05) },
    { position: "6th-10th", prize: Math.round((tournament.prize_pool || 0) * 0.03) },
  ];

  const rules = [
    "No teaming allowed",
    "No hacking or exploiting",
    "Respect all players",
    "Winner decided by total kills",
    "Top 10 players win prizes",
  ];

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

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
                {tournament.status === "upcoming" && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    UPCOMING
                  </Badge>
                )}
                {tournament.status === "completed" && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                    COMPLETED
                  </Badge>
                )}
                {isAdmin && (
                  <Badge className="bg-primary/20 text-primary border-primary/50 gap-1.5">
                    <Shield className="w-3 h-3" />
                    ADMIN VIEW
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
                    ₹{(tournament.prize_pool || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Prize Pool
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Zap className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                  <div className="font-display font-bold text-xl text-neon-cyan">
                    ₹{tournament.entry_fee || 0}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Entry Fee
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Users className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <div className="font-display font-bold text-xl text-foreground">
                    {spotsLeft}/{tournament.max_players}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Spots Left
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Clock className="w-5 h-5 text-gold mx-auto mb-2" />
                  <div className="font-display font-bold text-sm text-gold">
                    {new Date(tournament.start_time).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    Start Date
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details - Only visible after joining */}
            {isJoined && tournament.status === "live" && (
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
                        ROOM123
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard("ROOM123", "Room ID")}
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
                        PASS456
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard("PASS456", "Password")}
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

            {/* Admin: Registered Users List */}
            {isAdmin && (
              <div className="gaming-card border-2 border-primary/30">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Registered Players ({tournament.current_players || 0})
                  <Badge variant="outline" className="ml-2 border-primary text-primary">
                    Admin Only
                  </Badge>
                </h3>
                
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : registeredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No players registered yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registeredUsers.map((regUser, index) => (
                      <div
                        key={regUser.user_id}
                        className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground text-sm">
                              {getInitials(regUser.profile?.game_name || regUser.profile?.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">
                              {regUser.profile?.game_name || regUser.profile?.username || "Unknown Player"}
                            </div>
                            {regUser.profile?.username && regUser.profile?.game_name && (
                              <div className="text-xs text-muted-foreground">
                                @{regUser.profile.username}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Registered</div>
                          <div>{formatDate(regUser.registered_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rules */}
            <div className="gaming-card">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Match Rules
              </h3>
              <ul className="space-y-3">
                {rules.map((rule, index) => (
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <div className="gaming-card sticky top-24">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                Prize Distribution
              </h3>
              <div className="space-y-3 mb-6">
                {prizeDistribution.map((prize, index) => (
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
                    {tournament.current_players || 0}/{tournament.max_players}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fire-orange to-fire-red rounded-full transition-all duration-500"
                    style={{
                      width: `${((tournament.current_players || 0) / tournament.max_players) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Join/Leave Button */}
              {tournament.status === "completed" ? (
                <Button variant="outline" className="w-full" disabled>
                  Tournament Ended
                </Button>
              ) : isJoined ? (
                <Button variant="outline" className="w-full" onClick={handleLeave} disabled={joining}>
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {joining ? "Processing..." : "Joined - Click to Leave"}
                </Button>
              ) : (
                <Button variant="fire" className="w-full" onClick={handleJoin} disabled={joining || spotsLeft <= 0}>
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {joining ? "Joining..." : spotsLeft <= 0 ? "Tournament Full" : `Join for ₹${tournament.entry_fee || 0}`}
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
