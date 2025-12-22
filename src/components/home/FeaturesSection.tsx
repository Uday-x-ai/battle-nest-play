import { Shield, Wallet, Trophy, Bell, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Daily Tournaments",
    description: "Multiple tournaments every day with varying prize pools and entry fees.",
    color: "primary",
  },
  {
    icon: Wallet,
    title: "Instant Withdrawals",
    description: "Win and withdraw your earnings instantly via UPI or bank transfer.",
    color: "neon-cyan",
  },
  {
    icon: Shield,
    title: "Secure & Fair",
    description: "Anti-cheat systems and verified results ensure fair gameplay.",
    color: "secondary",
  },
  {
    icon: Bell,
    title: "Match Alerts",
    description: "Never miss a match with instant notifications and reminders.",
    color: "gold",
  },
  {
    icon: Users,
    title: "Community",
    description: "Join thousands of players and climb the competitive ladder.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "Quick Matchmaking",
    description: "Get matched and start playing within minutes, not hours.",
    color: "neon-cyan",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold text-2xl md:text-4xl text-foreground mb-4">
            Why Choose <span className="gradient-text">FF Arena?</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need to compete at the highest level
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="gaming-card hover:-translate-y-1 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                  ${feature.color === "primary" ? "bg-primary/20 text-primary group-hover:shadow-glow-orange" : ""}
                  ${feature.color === "neon-cyan" ? "bg-neon-cyan/20 text-neon-cyan group-hover:shadow-glow-cyan" : ""}
                  ${feature.color === "secondary" ? "bg-secondary/20 text-secondary group-hover:shadow-glow-purple" : ""}
                  ${feature.color === "gold" ? "bg-gold/20 text-gold" : ""}
                `}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
