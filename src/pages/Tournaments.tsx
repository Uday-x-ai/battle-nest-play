import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTournaments } from "@/hooks/useTournaments";

type FilterType = "all" | "solo" | "duo" | "squad";
type StatusFilter = "all" | "live" | "upcoming" | "completed";

export default function Tournaments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { tournaments, loading, isRegistered, joinTournament, leaveTournament } = useTournaments();

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Transform tournaments to match the TournamentCard interface
  const transformedTournaments = filteredTournaments.map(t => ({
    id: t.id,
    title: t.title,
    type: t.type,
    entryFee: t.entry_fee,
    prizePool: t.prize_pool,
    maxPlayers: t.max_players,
    currentPlayers: t.current_players,
    startTime: new Date(t.start_time).toLocaleString(),
    status: t.status,
    image: t.image_url || undefined
  }));

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
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-r from-fire-orange to-fire-red shadow-glow-orange">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">
              Tournaments
            </h1>
            <p className="text-muted-foreground">
              Find and join the perfect match for you
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="gaming-card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {(["all", "solo", "duo", "squad"] as FilterType[]).map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "fire" : "ghost"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "capitalize",
                    typeFilter !== type && "text-muted-foreground"
                  )}
                >
                  {type}
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(["all", "live", "upcoming", "completed"] as StatusFilter[]).map(
                (status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "neon" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "capitalize",
                      statusFilter !== status && "text-muted-foreground"
                    )}
                  >
                    {status}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filteredTournaments.length}</span> tournaments
          </p>
        </div>

        {/* Tournament Grid */}
        {transformedTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {transformedTournaments.map((tournament) => (
              <TournamentCard 
                key={tournament.id} 
                tournament={tournament}
                isRegistered={isRegistered(tournament.id)}
                onJoin={() => joinTournament(tournament.id)}
                onLeave={() => leaveTournament(tournament.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">
              No tournaments found
            </h3>
            <p className="text-muted-foreground">
              {tournaments.length === 0 ? "No tournaments available yet" : "Try adjusting your filters or search terms"}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
