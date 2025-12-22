import { Link } from "react-router-dom";
import { Trophy, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px] animate-float" style={{ animationDelay: "-3s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Season 5 Now Live</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl leading-tight">
            <span className="block text-foreground">Compete. Win.</span>
            <span className="block gradient-text glow-text">Dominate.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the ultimate Free Fire tournament platform. Battle against the best players, 
            win massive prize pools, and climb the leaderboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/tournaments">
              <Button variant="fire" size="xl" className="group">
                Join Tournament
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="neon" size="xl">
                View Leaderboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="font-display font-bold text-2xl md:text-4xl gradient-text">
                50K+
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                Players
              </div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-2xl md:text-4xl gradient-text-neon">
                ₹10L+
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                Prize Pool
              </div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-2xl md:text-4xl text-gold">
                500+
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                Tournaments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
