import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  Users,
  Trophy,
  Wallet,
  Settings,
  Plus,
  Search,
  MoreVertical,
  TrendingUp,
  DollarSign,
  GamepadIcon,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AdminTab = "dashboard" | "tournaments" | "users" | "payments";

const stats = {
  totalUsers: 12547,
  activeUsers: 3421,
  totalRevenue: 458000,
  activeTournaments: 8,
  pendingDeposits: 23,
  pendingWithdrawals: 12,
};

const recentTournaments = [
  { id: 1, title: "Fire Storm Championship", players: 87, prize: 5000, status: "live" },
  { id: 2, title: "Solo Showdown", players: 45, prize: 2000, status: "upcoming" },
  { id: 3, title: "Night Raid Battle", players: 100, prize: 10000, status: "completed" },
];

const pendingPayments = [
  { id: 1, user: "ProSniper", type: "withdrawal", amount: 2000, status: "pending" },
  { id: 2, user: "FireBeast99", type: "deposit", amount: 500, status: "pending" },
  { id: 3, user: "ShadowNinja", type: "withdrawal", amount: 1500, status: "pending" },
];

const users = [
  { id: 1, name: "ProSniper", phone: "9876543210", balance: 2500, status: "active" },
  { id: 2, name: "FireBeast99", phone: "9876543211", balance: 1200, status: "active" },
  { id: 3, name: "ShadowNinja", phone: "9876543212", balance: 800, status: "banned" },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprovePayment = (id: number) => {
    toast.success("Payment approved successfully!");
  };

  const handleRejectPayment = (id: number) => {
    toast.error("Payment rejected!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-fire-orange to-fire-red">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">
              Admin Panel
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="fire">Admin</Badge>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-57px)] p-4 hidden md:block">
          <nav className="space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: TrendingUp },
              { id: "tournaments", label: "Tournaments", icon: Trophy },
              { id: "users", label: "Users", icon: Users },
              { id: "payments", label: "Payments", icon: Wallet },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex gap-2 z-50">
          {[
            { id: "dashboard", icon: TrendingUp },
            { id: "tournaments", icon: Trophy },
            { id: "users", icon: Users },
            { id: "payments", icon: Wallet },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={cn(
                "flex-1 py-3 rounded-lg flex items-center justify-center",
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="font-display font-bold text-2xl text-foreground">
                Dashboard Overview
              </h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="gaming-card">
                  <Users className="w-6 h-6 text-primary mb-2" />
                  <div className="font-display font-bold text-2xl text-foreground">
                    {stats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="gaming-card">
                  <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                  <div className="font-display font-bold text-2xl text-green-500">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="gaming-card">
                  <Trophy className="w-6 h-6 text-gold mb-2" />
                  <div className="font-display font-bold text-2xl text-gold">
                    {stats.activeTournaments}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Tournaments</div>
                </div>
                <div className="gaming-card">
                  <Wallet className="w-6 h-6 text-neon-cyan mb-2" />
                  <div className="font-display font-bold text-2xl text-neon-cyan">
                    {stats.pendingDeposits + stats.pendingWithdrawals}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Payments</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tournaments */}
                <div className="gaming-card">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Recent Tournaments
                  </h3>
                  <div className="space-y-3">
                    {recentTournaments.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{t.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {t.players} players • ₹{t.prize}
                          </div>
                        </div>
                        <Badge
                          variant={
                            t.status === "live"
                              ? "success"
                              : t.status === "upcoming"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Payments */}
                <div className="gaming-card">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Pending Payments
                  </h3>
                  <div className="space-y-3">
                    {pendingPayments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{p.user}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {p.type} • ₹{p.amount}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:bg-green-500/20"
                            onClick={() => handleApprovePayment(p.id)}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/20"
                            onClick={() => handleRejectPayment(p.id)}
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tournaments */}
          {activeTab === "tournaments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-bold text-2xl text-foreground">
                  Tournaments
                </h1>
                <Button variant="fire" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Tournament
                </Button>
              </div>

              <div className="gaming-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm text-muted-foreground">
                          Tournament
                        </th>
                        <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                          Players
                        </th>
                        <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                          Prize
                        </th>
                        <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 text-sm text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTournaments.map((t) => (
                        <tr key={t.id} className="border-b border-border/50">
                          <td className="py-4 px-4 font-semibold text-foreground">
                            {t.title}
                          </td>
                          <td className="py-4 px-4 text-center text-muted-foreground">
                            {t.players}
                          </td>
                          <td className="py-4 px-4 text-center font-display gradient-text">
                            ₹{t.prize}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge
                              variant={
                                t.status === "live"
                                  ? "success"
                                  : t.status === "upcoming"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {t.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display font-bold text-2xl text-foreground">
                  Users
                </h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted border-border w-64"
                  />
                </div>
              </div>

              <div className="gaming-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm text-muted-foreground">
                          User
                        </th>
                        <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                          Phone
                        </th>
                        <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                          Balance
                        </th>
                        <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 text-sm text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border/50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground text-xs">
                                  {u.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-foreground">
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center text-muted-foreground">
                            {u.phone}
                          </td>
                          <td className="py-4 px-4 text-center font-display gradient-text">
                            ₹{u.balance}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge
                              variant={u.status === "active" ? "success" : "destructive"}
                            >
                              {u.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={u.status === "banned" ? "text-green-500" : "text-destructive"}
                              >
                                {u.status === "banned" ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <h1 className="font-display font-bold text-2xl text-foreground">
                Payment Management
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Deposits */}
                <div className="gaming-card">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Pending Deposits
                  </h3>
                  <div className="space-y-3">
                    {pendingPayments
                      .filter((p) => p.type === "deposit")
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <div className="font-semibold text-foreground">{p.user}</div>
                            <div className="text-sm text-green-500">₹{p.amount}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500"
                              onClick={() => handleApprovePayment(p.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Pending Withdrawals */}
                <div className="gaming-card">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-neon-cyan" />
                    Pending Withdrawals
                  </h3>
                  <div className="space-y-3">
                    {pendingPayments
                      .filter((p) => p.type === "withdrawal")
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <div className="font-semibold text-foreground">{p.user}</div>
                            <div className="text-sm text-neon-cyan">₹{p.amount}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500"
                              onClick={() => handleApprovePayment(p.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleRejectPayment(p.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
