import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  User,
  Wallet,
  Plus,
  Minus,
  RefreshCw,
  Loader2,
  Users,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUser } from "@/hooks/useAdminUsers";
import { format } from "date-fns";

interface UserManagementProps {
  users: AdminUser[];
  loading: boolean;
  onRefresh: () => void;
  onAddRole: (userId: string, role: "admin" | "moderator" | "user") => Promise<boolean>;
  onRemoveRole: (userId: string, role: string) => Promise<boolean>;
  onUpdateWallet: (userId: string, amount: number, type: "deposit" | "withdraw") => Promise<boolean>;
  stats: {
    totalUsers: number;
    admins: number;
    moderators: number;
    totalWalletBalance: number;
  };
}

export function UserManagement({
  users,
  loading,
  onRefresh,
  onAddRole,
  onRemoveRole,
  onUpdateWallet,
  stats,
}: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletType, setWalletType] = useState<"deposit" | "withdraw">("deposit");
  const [walletLoading, setWalletLoading] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.game_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.telegram_id?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.roles.includes("admin")) ||
      (roleFilter === "moderator" && user.roles.includes("moderator")) ||
      (roleFilter === "user" && !user.roles.includes("admin") && !user.roles.includes("moderator"));

    return matchesSearch && matchesRole;
  });

  const handleWalletAction = async () => {
    if (!selectedUser || !walletAmount) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) return;

    setWalletLoading(true);
    const success = await onUpdateWallet(selectedUser.user_id, amount, walletType);
    setWalletLoading(false);

    if (success) {
      setWalletDialogOpen(false);
      setWalletAmount("");
      setSelectedUser(null);
    }
  };

  const openWalletDialog = (user: AdminUser, type: "deposit" | "withdraw") => {
    setSelectedUser(user);
    setWalletType(type);
    setWalletAmount("");
    setWalletDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "fire";
      case "moderator":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-3 h-3" />;
      case "moderator":
        return <ShieldCheck className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl text-foreground">
          User Management
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-border w-48 md:w-64"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32 bg-muted border-border">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="moderator">Moderators</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gaming-card">
          <Users className="w-6 h-6 text-primary mb-2" />
          <div className="font-display font-bold text-2xl text-foreground">
            {stats.totalUsers}
          </div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="gaming-card">
          <Crown className="w-6 h-6 text-fire-orange mb-2" />
          <div className="font-display font-bold text-2xl text-fire-orange">
            {stats.admins}
          </div>
          <div className="text-sm text-muted-foreground">Admins</div>
        </div>
        <div className="gaming-card">
          <ShieldCheck className="w-6 h-6 text-neon-cyan mb-2" />
          <div className="font-display font-bold text-2xl text-neon-cyan">
            {stats.moderators}
          </div>
          <div className="text-sm text-muted-foreground">Moderators</div>
        </div>
        <div className="gaming-card">
          <Wallet className="w-6 h-6 text-green-500 mb-2" />
          <div className="font-display font-bold text-2xl text-green-500">
            ₹{stats.totalWalletBalance.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Balance</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="gaming-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground">
                    User
                  </th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                    Roles
                  </th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                    Wallet
                  </th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                    Stats
                  </th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                    Joined
                  </th>
                  <th className="text-right py-3 px-4 text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {(user.game_name || user.username || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">
                            {user.game_name || user.username || "Unknown"}
                          </div>
                          {user.telegram_id && (
                            <div className="text-xs text-muted-foreground">
                              @{user.telegram_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={getRoleBadgeVariant(role) as any}
                            className="gap-1"
                          >
                            {getRoleIcon(role)}
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-display font-semibold text-green-500">
                        ₹{(user.wallet_balance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                      <div>{user.total_wins || 0} wins</div>
                      <div className="text-xs">
                        ₹{(user.total_earnings || 0).toLocaleString()} earned
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!user.roles.includes("admin") && (
                            <DropdownMenuItem
                              onClick={() => onAddRole(user.user_id, "admin")}
                            >
                              <Crown className="w-4 h-4 mr-2 text-fire-orange" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {user.roles.includes("admin") && (
                            <DropdownMenuItem
                              onClick={() => onRemoveRole(user.user_id, "admin")}
                              className="text-destructive"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          {!user.roles.includes("moderator") && (
                            <DropdownMenuItem
                              onClick={() => onAddRole(user.user_id, "moderator")}
                            >
                              <ShieldCheck className="w-4 h-4 mr-2 text-neon-cyan" />
                              Make Moderator
                            </DropdownMenuItem>
                          )}
                          {user.roles.includes("moderator") && (
                            <DropdownMenuItem
                              onClick={() => onRemoveRole(user.user_id, "moderator")}
                              className="text-destructive"
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Remove Moderator
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openWalletDialog(user, "deposit")}
                          >
                            <Plus className="w-4 h-4 mr-2 text-green-500" />
                            Add Funds
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openWalletDialog(user, "withdraw")}
                          >
                            <Minus className="w-4 h-4 mr-2 text-destructive" />
                            Withdraw Funds
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {searchQuery
                        ? "No users found matching your search."
                        : "No users yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wallet Dialog */}
      <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {walletType === "deposit" ? "Add Funds" : "Withdraw Funds"}
            </DialogTitle>
            <DialogDescription>
              {walletType === "deposit"
                ? `Add funds to ${selectedUser?.game_name || selectedUser?.username || "user"}'s wallet`
                : `Withdraw funds from ${selectedUser?.game_name || selectedUser?.username || "user"}'s wallet`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Current Balance:</span>
              <span className="font-display font-semibold text-green-500">
                ₹{(selectedUser?.wallet_balance || 0).toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Enter amount"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                className="pl-8 bg-muted border-border"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWalletDialogOpen(false)}
              disabled={walletLoading}
            >
              Cancel
            </Button>
            <Button
              variant={walletType === "deposit" ? "default" : "destructive"}
              onClick={handleWalletAction}
              disabled={walletLoading || !walletAmount}
            >
              {walletLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : walletType === "deposit" ? (
                "Add Funds"
              ) : (
                "Withdraw"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
