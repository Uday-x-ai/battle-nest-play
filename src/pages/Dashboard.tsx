import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const userStats = {
  balance: 500,
  totalWins: 24,
  totalEarnings: 12500,
  totalMatches: 87,
  winRate: 27.5,
};

const recentMatches = [
  { id: 1, title: "Fire Storm Championship", position: 1, prize: 2000, date: "Today" },
  { id: 2, title: "Solo Showdown", position: 5, prize: 150, date: "Yesterday" },
  { id: 3, title: "Duo Domination", position: 12, prize: 0, date: "2 days ago" },
  { id: 4, title: "Night Raid Battle", position: 3, prize: 500, date: "3 days ago" },
];

const transactions = [
  { id: 1, type: "credit", amount: 2000, description: "Prize - Fire Storm", date: "Today" },
  { id: 2, type: "debit", amount: 50, description: "Entry - Solo Showdown", date: "Yesterday" },
  { id: 3, type: "credit", amount: 500, description: "Deposit - UPI", date: "2 days ago" },
  { id: 4, type: "debit", amount: 100, description: "Entry - Night Raid", date: "3 days ago" },
];

export default function Dashboard() {
  const [depositAmount, setDepositAmount] = useState("");

  const handleDeposit = () => {
    if (!depositAmount || parseInt(depositAmount) < 10) {
      toast.error("Minimum deposit amount is ₹10");
      return;
    }
    toast.success(`Deposit request of ₹${depositAmount} initiated`);
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    toast.info("Withdrawal feature coming soon!");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground font-display text-xl">
                PG
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
                ProGamer99
              </h1>
              <p className="text-muted-foreground">Player ID: #FF2847591</p>
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
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold",
                          match.position === 1 && "bg-gradient-to-r from-gold to-amber-600 text-background",
                          match.position === 2 && "bg-gray-400/20 text-gray-300",
                          match.position === 3 && "bg-amber-700/30 text-amber-600",
                          match.position > 3 && "bg-muted text-muted-foreground"
                        )}
                      >
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
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                ))}
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
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          tx.type === "credit"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {tx.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.date}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-display font-bold",
                        tx.type === "credit" ? "text-green-500" : "text-destructive"
                      )}
                    >
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </div>
                  </div>
                ))}
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
                  ₹{userStats.balance}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button variant="fire" className="h-12" onClick={handleDeposit}>
                  <Plus className="w-4 h-4" />
                  Add Money
                </Button>
                <Button variant="neon" className="h-12" onClick={handleWithdraw}>
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </Button>
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

              {/* UPI ID */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Pay to UPI ID
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-foreground">
                    ffarena@ybl
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText("ffarena@ybl");
                      toast.success("UPI ID copied!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
