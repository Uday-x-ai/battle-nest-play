import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Loader2, Users, Trophy, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format, isPast } from "date-fns";

interface DbTournament {
  id: string;
  title: string;
  type: string;
  entry_fee: number | null;
  prize_pool: number | null;
  max_players: number;
  current_players: number | null;
  start_time: string;
  status: string | null;
  image_url: string | null;
}

export function LiveTournaments() {
  const [tournaments, setTournaments] = useState<DbTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .in("status", ["live", "upcoming"])
        .order("start_time", { ascending: true })
        .limit(4);

      if (!error && data) {
        setTournaments(data);
      }
      setLoading(false);
    };

    fetchTournaments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-tournaments-home')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        (payload) => {
          console.log('Live tournament update:', payload);
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as DbTournament;
            // Only show live/upcoming tournaments
            if (updated.status === 'live' || updated.status === 'upcoming') {
              setTournaments(prev => {
                const exists = prev.find(t => t.id === updated.id);
                if (exists) {
                  return prev.map(t => t.id === updated.id ? updated : t);
                }
                return [...prev, updated].slice(0, 4);
              });
            } else {
              // Remove if status changed to completed
              setTournaments(prev => prev.filter(t => t.id !== updated.id));
            }
          } else if (payload.eventType === 'INSERT') {
            const newTournament = payload.new as DbTournament;
            if (newTournament.status === 'live' || newTournament.status === 'upcoming') {
              setTournaments(prev => [...prev, newTournament].slice(0, 4));
            }
          } else if (payload.eventType === 'DELETE') {
            setTournaments(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStartTimeDisplay = (startTime: string) => {
    const date = new Date(startTime);
    if (isPast(date)) {
      return "Started";
    }
    const distance = formatDistanceToNow(date, { addSuffix: false });
    return `Starting in ${distance}`;
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "live") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          LIVE
        </Badge>
      );
    }
    if (status === "upcoming") {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/50">
          UPCOMING
        </Badge>
      );
    }
    return <Badge variant="secondary">{status?.toUpperCase()}</Badge>;
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-fire shadow-glow-orange">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                Live & Upcoming
              </h2>
              <p className="text-muted-foreground">
                Jump into the action now
              </p>
            </div>
          </div>
          <Link to="/tournaments">
            <Button variant="outline" className="group">
              View All Tournaments
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && tournaments.length === 0 && (
          <div className="gaming-card text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              No tournaments available
            </h3>
            <p className="text-muted-foreground mb-4">
              Check back soon for upcoming tournaments!
            </p>
            <Link to="/tournaments">
              <Button variant="outline">Browse All Tournaments</Button>
            </Link>
          </div>
        )}

        {/* Tournament Grid */}
        {!loading && tournaments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {tournaments.map((tournament, index) => {
              const spotsLeft = tournament.max_players - (tournament.current_players || 0);
              const isFull = spotsLeft <= 0;

              return (
                <div
                  key={tournament.id}
                  className={cn(
                    "gaming-card group relative overflow-hidden transition-all duration-500 hover:-translate-y-1",
                    index === 0 && "md:col-span-2 neon-border"
                  )}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(tournament.status)}
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
                          ₹{(tournament.prize_pool || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
                          <Zap className="w-3.5 h-3.5" />
                          Entry Fee
                        </div>
                        <div className="font-display font-bold text-lg text-neon-cyan">
                          ₹{tournament.entry_fee || 0}
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
                          /{tournament.max_players} spots
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">
                          {getStartTimeDisplay(tournament.start_time)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-fire rounded-full transition-all duration-500"
                        style={{
                          width: `${((tournament.current_players || 0) / tournament.max_players) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Link to={`/tournaments`}>
                        <Button
                          variant={isFull ? "outline" : "fire"}
                          className="w-full"
                          disabled={isFull}
                        >
                          {isFull
                            ? "Full"
                            : tournament.status === "live"
                            ? "View Match"
                            : "Join Now"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
