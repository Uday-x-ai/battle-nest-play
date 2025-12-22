import { Link } from "react-router-dom";
import { Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-neon-cyan/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="gaming-card neon-border max-w-4xl mx-auto text-center py-12 md:py-16 px-6 md:px-12">
          {/* Icon */}
          <div className="inline-flex p-4 rounded-2xl bg-gradient-fire shadow-glow-orange mb-6">
            <Gamepad2 className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Content */}
          <h2 className="font-display font-black text-3xl md:text-5xl text-foreground mb-4">
            Ready to <span className="gradient-text">Dominate?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Join thousands of players competing daily. Create your account now and 
            get ₹50 bonus on your first deposit!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button variant="fire" size="xl" className="group">
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/tournaments">
              <Button variant="neon" size="xl">
                Browse Tournaments
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Instant Payouts
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              24/7 Support
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-cyan rounded-full" />
              Verified Fair
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
