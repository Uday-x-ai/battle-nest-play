import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Users,
  Trophy,
  Wallet,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAdminTournaments } from "@/hooks/useAdminTournaments";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminWithdrawalRequests } from "@/hooks/useWithdrawalRequests";
import { useAdminDepositRequests } from "@/hooks/useDepositRequests";
import { TournamentForm, TournamentFormData } from "@/components/admin/TournamentForm";
import { UserManagement } from "@/components/admin/UserManagement";
import { WithdrawalRequestsManagement } from "@/components/admin/WithdrawalRequestsManagement";
import { DepositRequestsManagement } from "@/components/admin/DepositRequestsManagement";
import { Tournament } from "@/hooks/useTournaments";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AdminTab = "dashboard" | "tournaments" | "users" | "payments";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    tournaments,
    loading: tournamentsLoading,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    getStats,
  } = useAdminTournaments();
  const {
    users,
    loading: usersLoading,
    fetchUsers,
    addRole,
    removeRole,
    updateWalletBalance,
    getStats: getUserStats,
  } = useAdminUsers();
  const {
    requests: withdrawalRequests,
    loading: withdrawalLoading,
    approveRequest,
    rejectRequest,
    getStats: getWithdrawalStats,
    refetch: refetchWithdrawals,
  } = useAdminWithdrawalRequests();
  const {
    requests: depositRequests,
    loading: depositLoading,
    approveRequest: approveDeposit,
    rejectRequest: rejectDeposit,
    getStats: getDepositStats,
    refetch: refetchDeposits,
  } = useAdminDepositRequests();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchTournaments();
      fetchUsers();
    }
  }, [user, isAdmin, fetchTournaments, fetchUsers]);

  const stats = getStats();
  const userStats = getUserStats();

  const handleCreateTournament = () => {
    setEditingTournament(null);
    setFormOpen(true);
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: TournamentFormData) => {
    setFormLoading(true);
    let success: boolean;

    if (editingTournament) {
      success = await updateTournament(editingTournament.id, data);
    } else {
      success = await createTournament(data);
    }

    setFormLoading(false);
    if (success) {
      setFormOpen(false);
      setEditingTournament(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTournament) return;
    await deleteTournament(deletingTournament.id);
    setDeletingTournament(null);
  };

  const filteredTournaments = tournaments.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "live":
        return "success";
      case "upcoming":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

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
            <span className="font-display font-bold text-lg">Admin Panel</span>
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
                  <Trophy className="w-6 h-6 text-primary mb-2" />
                  <div className="font-display font-bold text-2xl text-foreground">
                    {stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tournaments
                  </div>
                </div>
                <div className="gaming-card">
                  <DollarSign className="w-6 h-6 text-green-500 mb-2" />
                  <div className="font-display font-bold text-2xl text-green-500">
                    ₹{stats.totalPrizePool.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Prize Pool
                  </div>
                </div>
                <div className="gaming-card">
                  <Users className="w-6 h-6 text-neon-cyan mb-2" />
                  <div className="font-display font-bold text-2xl text-neon-cyan">
                    {stats.totalPlayers}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Registrations
                  </div>
                </div>
                <div className="gaming-card">
                  <TrendingUp className="w-6 h-6 text-gold mb-2" />
                  <div className="font-display font-bold text-2xl text-gold">
                    {stats.live}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Live Tournaments
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="gaming-card flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <Trophy className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {stats.upcoming}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Upcoming Tournaments
                    </div>
                  </div>
                </div>
                <div className="gaming-card flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {stats.live}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Live Now
                    </div>
                  </div>
                </div>
                <div className="gaming-card flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <Trophy className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {stats.completed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Tournaments */}
              <div className="gaming-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    Recent Tournaments
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("tournaments")}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {tournaments.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          {t.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.current_players}/{t.max_players} players • ₹
                          {t.prize_pool?.toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(t.status)}>
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                  {tournaments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No tournaments yet.{" "}
                      <button
                        onClick={handleCreateTournament}
                        className="text-primary hover:underline"
                      >
                        Create one
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tournaments */}
          {activeTab === "tournaments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="font-display font-bold text-2xl text-foreground">
                  Tournaments
                </h1>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tournaments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-muted border-border w-48 md:w-64"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchTournaments}
                    disabled={tournamentsLoading}
                  >
                    <RefreshCw
                      className={cn("w-4 h-4", tournamentsLoading && "animate-spin")}
                    />
                  </Button>
                  <Button
                    variant="fire"
                    className="gap-2"
                    onClick={handleCreateTournament}
                  >
                    <Plus className="w-4 h-4" />
                    Create Tournament
                  </Button>
                </div>
              </div>

              <div className="gaming-card">
                {tournamentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm text-muted-foreground">
                            Tournament
                          </th>
                          <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                            Type
                          </th>
                          <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                            Players
                          </th>
                          <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                            Prize
                          </th>
                          <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                            Start Time
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
                        {filteredTournaments.map((t) => (
                          <tr key={t.id} className="border-b border-border/50">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-foreground">
                                {t.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Entry: ₹{t.entry_fee}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant="outline" className="capitalize">
                                {t.type}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-center text-muted-foreground">
                              {t.current_players}/{t.max_players}
                            </td>
                            <td className="py-4 px-4 text-center font-display gradient-text">
                              ₹{t.prize_pool?.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                              {format(new Date(t.start_time), "MMM d, yyyy h:mm a")}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant={getStatusBadgeVariant(t.status)}>
                                {t.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/tournaments/${t.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditTournament(t)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeletingTournament(t)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredTournaments.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-12 text-center text-muted-foreground"
                            >
                              {searchQuery
                                ? "No tournaments found matching your search."
                                : "No tournaments yet. Create your first tournament!"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <UserManagement
              users={users}
              loading={usersLoading}
              onRefresh={fetchUsers}
              onAddRole={addRole}
              onRemoveRole={removeRole}
              onUpdateWallet={updateWalletBalance}
              stats={userStats}
            />
          )}

          {/* Payments - Deposits & Withdrawals */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <Tabs defaultValue="deposits" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="deposits">UPI Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                </TabsList>
                <TabsContent value="deposits" className="mt-6">
                  <DepositRequestsManagement
                    requests={depositRequests}
                    loading={depositLoading}
                    onRefresh={refetchDeposits}
                    onApprove={approveDeposit}
                    onReject={rejectDeposit}
                    stats={getDepositStats()}
                  />
                </TabsContent>
                <TabsContent value="withdrawals" className="mt-6">
                  <WithdrawalRequestsManagement
                    requests={withdrawalRequests}
                    loading={withdrawalLoading}
                    onRefresh={refetchWithdrawals}
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    stats={getWithdrawalStats()}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      {/* Tournament Form Dialog */}
      <TournamentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        tournament={editingTournament}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTournament}
        onOpenChange={() => setDeletingTournament(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTournament?.title}"? This
              action cannot be undone and will remove all registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
