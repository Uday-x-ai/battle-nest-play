import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { TournamentCard, Tournament } from "@/components/tournament/TournamentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const allTournaments: Tournament[] = [
  {
    id: "1",
    title: "Fire Storm Championship",
    type: "squad",
    entryFee: 50,
    prizePool: 5000,
    maxPlayers: 100,
    currentPlayers: 87,
    startTime: "Starting in 15 min",
    status: "live",
  },
  {
    id: "2",
    title: "Solo Showdown",
    type: "solo",
    entryFee: 25,
    prizePool: 2000,
    maxPlayers: 50,
    currentPlayers: 45,
    startTime: "Starting in 30 min",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Duo Domination",
    type: "duo",
    entryFee: 40,
    prizePool: 3500,
    maxPlayers: 60,
    currentPlayers: 42,
    startTime: "Starting in 1 hour",
    status: "upcoming",
  },
  {
    id: "4",
    title: "Night Raid Battle",
    type: "squad",
    entryFee: 100,
    prizePool: 10000,
    maxPlayers: 100,
    currentPlayers: 78,
    startTime: "Today, 9:00 PM",
    status: "upcoming",
  },
  {
    id: "5",
    title: "Beginner's Arena",
    type: "solo",
    entryFee: 10,
    prizePool: 500,
    maxPlayers: 30,
    currentPlayers: 12,
    startTime: "Today, 6:00 PM",
    status: "upcoming",
  },
  {
    id: "6",
    title: "Pro League Finals",
    type: "squad",
    entryFee: 200,
    prizePool: 25000,
    maxPlayers: 100,
    currentPlayers: 100,
    startTime: "Yesterday",
    status: "completed",
  },
  {
    id: "7",
    title: "Weekend Warriors",
    type: "duo",
    entryFee: 30,
    prizePool: 2500,
    maxPlayers: 50,
    currentPlayers: 38,
    startTime: "Tomorrow, 8:00 PM",
    status: "upcoming",
  },
  {
    id: "8",
    title: "Midnight Madness",
    type: "squad",
    entryFee: 75,
    prizePool: 7500,
    maxPlayers: 80,
    currentPlayers: 65,
    startTime: "Tonight, 11:00 PM",
    status: "upcoming",
  },
];

type FilterType = "all" | "solo" | "duo" | "squad";
type StatusFilter = "all" | "live" | "upcoming" | "completed";

export default function Tournaments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredTournaments = allTournaments.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
        {filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">
              No tournaments found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
