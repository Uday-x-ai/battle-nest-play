import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Wallet,
  Trophy,
  Target,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Settings,
  Bell,
  Copy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useTournaments } from "@/hooks/useTournaments";

export default function Dashboard() {
  const [depositAmount, setDepositAmount] = useState("");
  const { user, profile, loading } = useAuth();
  const { transactions, deposit, withdraw } = useWallet();
  const { tournaments, registrations } = useTournaments();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 10) {
      toast.error("Minimum deposit amount is ₹10");
      return;
    }
    await deposit(amount);
    setDepositAmount("");
  };

  const handleWithdraw = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 100) {
      toast.error("Minimum withdrawal amount is ₹100");
      return;
    }
    await withdraw(amount);
    setDepositAmount("");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const userStats = {
    balance: profile.wallet_balance || 0,
    totalWins: profile.total_wins || 0,
    totalEarnings: profile.total_earnings || 0,
    totalMatches: registrations.length,
    winRate: registrations.length > 0 ? ((profile.total_wins / registrations.length) * 100).toFixed(1) : 0,
  };

  // Get recent matches from registrations with tournament data
  const recentMatches = registrations.slice(0, 4).map(reg => {
    const tournament = tournaments.find(t => t.id === reg.tournament_id);
    return {
      id: reg.id,
      title: tournament?.title || "Unknown Tournament",
      position: "-",
      prize: 0,
      date: new Date(reg.registered_at).toLocaleDateString()
    };
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground font-display text-xl">
                {getInitials(profile.game_name || profile.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                {profile.game_name || profile.username || "Player"}
              </h1>
              <p className="text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="gaming-card text-center">
                <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl gradient-text">
                  {userStats.totalWins}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  Total Wins
                </div>
              </div>
              <div className="gaming-card text-center">
                <Target className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-neon-cyan">
                  {userStats.totalMatches}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  Matches
                </div>
              </div>
              <div className="gaming-card text-center">
                <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-green-500">
                  {userStats.winRate}%
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  Win Rate
                </div>
              </div>
              <div className="gaming-card text-center">
                <Wallet className="w-6 h-6 text-gold mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-gold">
                  ₹{userStats.totalEarnings.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  Total Earned
                </div>
              </div>
            </div>

            {/* Recent Matches */}
            <div className="gaming-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Recent Matches
                </h3>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/tournaments")}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentMatches.length > 0 ? recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold bg-muted text-muted-foreground">
                        #{match.position}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {match.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {match.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {match.prize > 0 ? (
                        <span className="font-display font-bold gradient-text">
                          +₹{match.prize}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No matches yet. Join a tournament!
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className="gaming-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Transaction History
                </h3>
              </div>
              <div className="space-y-3">
                {transactions.length > 0 ? transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          tx.amount > 0
                            ? "bg-green-500/20 text-green-500"
                            : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {tx.amount > 0 ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {tx.description || tx.type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-display font-bold",
                        tx.amount > 0 ? "text-green-500" : "text-destructive"
                      )}
                    >
                      {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount)}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Wallet */}
          <div className="space-y-6">
            <div className="gaming-card neon-border sticky top-24">
              <div className="text-center mb-6">
                <Wallet className="w-10 h-10 text-neon-cyan mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-1">
                  Wallet Balance
                </div>
                <div className="font-display font-black text-4xl gradient-text-neon">
                  ₹{userStats.balance.toFixed(2)}
                </div>
              </div>

              {/* Deposit Form */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">
                  Enter Amount
                </label>
                <Input
                  type="number"
                  placeholder="₹ 100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-muted border-border text-center font-display text-lg"
                />
                <div className="flex gap-2">
                  {[50, 100, 200, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-muted-foreground"
                      onClick={() => setDepositAmount(amount.toString())}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="fire" className="h-12" onClick={handleDeposit}>
                  <Plus className="w-4 h-4" />
                  Add Money
                </Button>
                <Button variant="neon" className="h-12" onClick={handleWithdraw}>
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
