import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  IndianRupee,
  Loader2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DepositRequest } from "@/hooks/useDepositRequests";

interface DepositRequestsManagementProps {
  requests: DepositRequest[];
  loading: boolean;
  onRefresh: () => void;
  onApprove: (requestId: string, userId: string, amount: number) => Promise<{ success: boolean }>;
  onReject: (requestId: string, notes?: string) => Promise<{ success: boolean }>;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    totalPending: number;
    total: number;
  };
}

export function DepositRequestsManagement({
  requests,
  loading,
  onRefresh,
  onApprove,
  onReject,
  stats,
}: DepositRequestsManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<DepositRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.profile?.game_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (request: DepositRequest) => {
    setProcessing(request.id);
    await onApprove(request.id, request.user_id, request.amount);
    setProcessing(null);
  };

  const handleRejectClick = (request: DepositRequest) => {
    setRejectingRequest(request);
    setRejectNotes("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingRequest) return;
    setProcessing(rejectingRequest.id);
    await onReject(rejectingRequest.id, rejectNotes);
    setProcessing(null);
    setRejectDialogOpen(false);
    setRejectingRequest(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-display font-bold text-2xl text-foreground">
          Deposit Requests
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-border w-48 md:w-64"
            />
          </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gaming-card">
          <Clock className="w-6 h-6 text-yellow-500 mb-2" />
          <div className="font-display font-bold text-2xl text-yellow-500">
            {stats.pending}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="gaming-card">
          <IndianRupee className="w-6 h-6 text-yellow-500 mb-2" />
          <div className="font-display font-bold text-2xl text-yellow-500">
            ₹{stats.totalPending.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Pending Amount</div>
        </div>
        <div className="gaming-card">
          <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
          <div className="font-display font-bold text-2xl text-green-500">
            {stats.approved}
          </div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="gaming-card">
          <XCircle className="w-6 h-6 text-destructive mb-2" />
          <div className="font-display font-bold text-2xl text-destructive">
            {stats.rejected}
          </div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Requests Table */}
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
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {request.profile?.game_name || request.profile?.username || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {request.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-display font-bold gradient-text">
                        ₹{Number(request.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                      {format(new Date(request.created_at), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {request.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={() => handleApprove(request)}
                            disabled={processing === request.id}
                          >
                            {processing === request.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRejectClick(request)}
                            disabled={processing === request.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {request.processed_at
                            ? format(new Date(request.processed_at), "MMM d")
                            : "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "No requests found matching your filters."
                        : "No deposit requests yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reject Deposit Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this deposit request of ₹
              {rejectingRequest?.amount}? You can add a note explaining the reason.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Reason for rejection (optional)"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            className="bg-muted border-border"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={processing === rejectingRequest?.id}
            >
              {processing === rejectingRequest?.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
