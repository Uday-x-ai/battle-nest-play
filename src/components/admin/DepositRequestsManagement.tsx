import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  IndianRupee,
  Loader2,
  User,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DepositRequest } from "@/hooks/useDepositRequests";
import { toast } from "sonner";

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
      r.upi_transaction_id.toLowerCase().includes(searchQuery.toLowerCase());

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
          <Badge className="bg-green-500">
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
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display font-bold text-xl md:text-2xl text-foreground">
          UPI Deposit Requests
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted border-border w-full sm:w-48 md:w-64"
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="gaming-card p-3 md:p-4">
          <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mb-1 md:mb-2" />
          <div className="font-display font-bold text-xl md:text-2xl text-yellow-500">
            {stats.pending}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="gaming-card p-3 md:p-4">
          <IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mb-1 md:mb-2" />
          <div className="font-display font-bold text-xl md:text-2xl text-yellow-500">
            ₹{stats.totalPending.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Pending Amt</div>
        </div>
        <div className="gaming-card p-3 md:p-4">
          <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500 mb-1 md:mb-2" />
          <div className="font-display font-bold text-xl md:text-2xl text-green-500">
            {stats.approved}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="gaming-card p-3 md:p-4">
          <XCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive mb-1 md:mb-2" />
          <div className="font-display font-bold text-xl md:text-2xl text-destructive">
            {stats.rejected}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Status Filter - Scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize shrink-0"
          >
            {status}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredRequests.map((request) => (
              <div key={request.id} className="gaming-card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {request.profile?.game_name || request.profile?.username || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "MMM d, h:mm a")}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount: </span>
                    <span className="font-display font-bold text-green-500">
                      ₹{Number(request.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">TXN: </span>
                    <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded truncate max-w-[100px]">
                      {request.upi_transaction_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0"
                      onClick={() => copyToClipboard(request.upi_transaction_id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-green-500 hover:text-green-600 hover:bg-green-500/10"
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
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRejectClick(request)}
                      disabled={processing === request.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredRequests.length === 0 && (
              <div className="gaming-card py-8 text-center text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No requests found."
                  : "No deposit requests yet."}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="gaming-card hidden md:block">
            <ScrollArea className={filteredRequests.length > 5 ? "h-[400px]" : ""}>
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
                        UPI Transaction ID
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
                          <span className="font-display font-bold text-green-500">
                            ₹{Number(request.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {request.upi_transaction_id}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(request.upi_transaction_id)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
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
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          {searchQuery || statusFilter !== "all"
                            ? "No requests found matching your filters."
                            : "No deposit requests yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reject Deposit Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this deposit of ₹{rejectingRequest?.amount}?
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
