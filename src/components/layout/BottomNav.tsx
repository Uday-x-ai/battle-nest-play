import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Trophy, BarChart3, User, Shield, LogOut, Wallet, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/dashboard", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setSheetOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-fire flex items-center justify-center shadow-glow-orange group-hover:shadow-[0_0_40px_hsl(var(--fire-orange)/0.6)] transition-shadow">
                <Gamepad2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">
                <span className="gradient-text">FF</span>
                <span className="text-foreground">Arena</span>
              </span>
            </Link>

            {/* Wallet Balance / Login */}
            {user ? (
              <Link to="/dashboard">
                <Button variant="neon" size="sm" className="gap-1.5 px-3 h-9">
                  <Wallet className="w-4 h-4" />
                  <span>₹{(profile?.wallet_balance || 0).toFixed(0)}</span>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="fire" size="sm" className="px-4 h-9">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            // Profile item opens sheet if logged in
            if (item.href === "/dashboard" && user) {
              return (
                <Sheet key={item.href} open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all duration-200",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-xl transition-all duration-200",
                        isActive && "bg-primary/15"
                      )}>
                        <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
                      </div>
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[70vh]">
                    <SheetHeader className="pb-4">
                      <SheetTitle className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-fire flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                          {(profile?.game_name || profile?.username || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="font-display font-bold text-lg">
                            {profile?.game_name || profile?.username || "Player"}
                          </div>
                          <div className="text-sm text-muted-foreground font-normal">
                            Balance: ₹{(profile?.wallet_balance || 0).toFixed(2)}
                          </div>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-2 pb-6">
                      <Link to="/dashboard" onClick={() => setSheetOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                          <User className="w-5 h-5" />
                          Dashboard
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setSheetOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3 h-12">
                            <Shield className="w-5 h-5 text-primary" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/15"
                )}>
                  <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}