import { TournamentCard, Tournament } from "@/components/tournament/TournamentCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";

const liveTournaments: Tournament[] = [
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
];

export function LiveTournaments() {
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

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {liveTournaments.map((tournament, index) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              featured={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
