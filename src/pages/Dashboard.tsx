import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  QrCode,
  Copy,
  RefreshCw,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useTournaments } from "@/hooks/useTournaments";
import { useWithdrawalRequests } from "@/hooks/useWithdrawalRequests";
import { useDepositRequests } from "@/hooks/useDepositRequests";
import { useFreefireStats } from "@/hooks/useFreefireStats";
import { FreefireStatsCard } from "@/components/dashboard/FreefireStatsCard";
import { supabase } from "@/integrations/supabase/client";

// Generate random transaction reference for UPI
const generateTransactionRef = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}${random}`;
};

export default function Dashboard() {
  const [depositAmount, setDepositAmount] = useState("");
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [upiId, setUpiId] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const { user, profile, loading, refreshProfile } = useAuth();
  const { transactions, refetch: refetchWallet } = useWallet();
  const { requests: withdrawalRequests, createRequest: createWithdrawalRequest } = useWithdrawalRequests();
  const { requests: depositRequests, createRequest: createDepositRequest, createApprovedDeposit } = useDepositRequests();
  const { tournaments, registrations } = useTournaments();
  const { stats: ffStats, loading: ffLoading, error: ffError, refetch: refetchFFStats } = useFreefireStats(profile?.game_id);
  const navigate = useNavigate();

  // Generate new transaction ref when deposit dialog opens
  const generateNewRef = useCallback(() => {
    setTransactionRef(generateTransactionRef());
  }, []);

  // Verify payment with API
  const verifyPayment = useCallback(async (isAutoCheck = false): Promise<boolean> => {
    if (!transactionRef || !depositAmount) {
      console.log("Skipping verification - missing transactionRef or depositAmount");
      return false;
    }
    
    if (!isAutoCheck) {
      setVerifyingPayment(true);
    }
    
    console.log(`Verifying payment - transactionRef: ${transactionRef}, isAutoCheck: ${isAutoCheck}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { transactionRef }
      });
      
      console.log("Verification response:", data, error);
      
      if (error) throw error;
      
      if (data.STATUS === "TXN_SUCCESS") {
        const txnAmount = parseFloat(data.TXNAMOUNT);
        const expectedAmount = parseInt(depositAmount);
        
        if (txnAmount >= expectedAmount) {
          // Payment verified - create deposit request as approved
          const result = await createApprovedDeposit(expectedAmount, data.BANKTXNID || transactionRef);
          if (result.success) {
            toast.success(`Payment of ₹${txnAmount} verified successfully!`);
            setDepositDialogOpen(false);
            setDepositAmount("");
            setUpiTransactionId("");
            await refetchWallet();
            await refreshProfile();
            
            // Trigger confetti celebration
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            setTimeout(() => {
              confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
              });
              confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
              });
            }, 250);
            
            return true;
          }
        } else if (!isAutoCheck) {
          toast.error(`Amount mismatch. Expected ₹${expectedAmount}, received ₹${txnAmount}`);
        }
        return true;
      } else if (data.RESPCODE === "334") {
        if (!isAutoCheck) {
          toast.info("Payment not found yet. Please complete the payment and try again.");
        }
        return false;
      } else {
        if (!isAutoCheck) {
          toast.error(data.RESPMSG || "Payment verification failed");
        }
        return false;
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      if (!isAutoCheck) {
        toast.error("Failed to verify payment. Please try again.");
      }
      return false;
    } finally {
      if (!isAutoCheck) {
        setVerifyingPayment(false);
      }
    }
  }, [transactionRef, depositAmount, createDepositRequest, refetchWallet, refreshProfile]);

  useEffect(() => {
    if (profile?.upi_id) {
      setUpiId(profile.upi_id);
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleDeposit = () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 1) {
      toast.error("Minimum deposit amount is ₹1");
      return;
    }
    generateNewRef();
    setDepositDialogOpen(true);
  };

  const handleSubmitDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!upiTransactionId.trim()) {
      toast.error("Please enter UPI transaction ID");
      return;
    }
    setSubmittingDeposit(true);
    const result = await createDepositRequest(amount, upiTransactionId);
    setSubmittingDeposit(false);
    if (result.success) {
      setDepositDialogOpen(false);
      setDepositAmount("");
      setUpiTransactionId("");
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 100) {
      toast.error("Minimum withdrawal amount is ₹100");
      return;
    }
    if (!profile?.upi_id) {
      toast.error("Please set your UPI ID first");
      setUpiDialogOpen(true);
      return;
    }
    const result = await createWithdrawalRequest(amount);
    if (result.success) {
      setDepositAmount("");
    }
  };

  const handleSaveUpi = async () => {
    if (!user) return;
    
    if (!upiId.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId.trim())) {
      toast.error("Please enter a valid UPI ID (e.g., name@upi)");
      return;
    }

    setSavingUpi(true);
    const { error } = await supabase
      .from("profiles")
      .update({ upi_id: upiId.trim() })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save UPI ID");
    } else {
      toast.success("UPI ID saved successfully!");
      await refreshProfile();
      setUpiDialogOpen(false);
    }
    setSavingUpi(false);
  };

  const getRequestStatusBadge = (status: string) => {
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
        {/* Email Verification Warning */}
        {user && !user.email_confirmed_at && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="flex items-center gap-2 text-yellow-500">
              <Mail className="h-4 w-4" />
              Please verify your email address to access all features. Check your inbox for the verification link.
            </AlertDescription>
          </Alert>
        )}

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
            <Button variant="ghost" size="icon" onClick={() => setUpiDialogOpen(true)}>
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

            {/* Free Fire Stats */}
            {profile.game_id && (
              <FreefireStatsCard 
                stats={ffStats} 
                loading={ffLoading} 
                error={ffError} 
                onRefresh={refetchFFStats} 
              />
            )}

            {/* Deposit Requests */}
            {depositRequests.length > 0 && (
              <div className="gaming-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5 text-green-500" />
                    Deposit Requests
                  </h3>
                  {depositRequests.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      {depositRequests.length} requests
                    </span>
                  )}
                </div>
                <ScrollArea className={depositRequests.length > 5 ? "h-[320px]" : ""}>
                  <div className="space-y-3 pr-4">
                    {depositRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              ₹{Number(req.amount).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(req.created_at).toLocaleDateString()} • TXN: {req.upi_transaction_id}
                            </div>
                          </div>
                        </div>
                        {getRequestStatusBadge(req.status)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Withdrawal Requests */}
            {withdrawalRequests.length > 0 && (
              <div className="gaming-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Withdrawal Requests
                  </h3>
                  {withdrawalRequests.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      {withdrawalRequests.length} requests
                    </span>
                  )}
                </div>
                <ScrollArea className={withdrawalRequests.length > 5 ? "h-[320px]" : ""}>
                  <div className="space-y-3 pr-4">
                    {withdrawalRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              ₹{Number(req.amount).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(req.created_at).toLocaleDateString()} • {req.upi_id}
                            </div>
                          </div>
                        </div>
                        {getRequestStatusBadge(req.status)}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

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
                {transactions.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    {transactions.length} transactions
                  </span>
                )}
              </div>
              {transactions.length > 0 ? (
                <ScrollArea className={transactions.length > 5 ? "h-[320px]" : ""}>
                  <div className="space-y-3 pr-4">
                    {transactions.map((tx) => (
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
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              )}
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

              {/* UPI ID Display */}
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">UPI ID (for withdrawals)</div>
                    <div className="text-sm font-medium text-foreground">
                      {profile.upi_id || "Not set"}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setUpiDialogOpen(true)}>
                    {profile.upi_id ? "Edit" : "Set"}
                  </Button>
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
              <p className="text-xs text-muted-foreground text-center mt-3">
                Withdrawals require admin approval
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Dialog */}
      <Dialog open={upiDialogOpen} onOpenChange={setUpiDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Set UPI ID</DialogTitle>
            <DialogDescription>
              Enter your UPI ID to receive withdrawals. This is required for processing withdrawal requests.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="yourname@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="bg-muted border-border"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUpiDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="fire" onClick={handleSaveUpi} disabled={savingUpi}>
              {savingUpi ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save UPI ID"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Add Money via UPI
            </DialogTitle>
            <DialogDescription>
              Scan the QR code to pay ₹{depositAmount}, then click "Verify Payment".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* QR Code Section */}
            <div className="flex flex-col items-center p-4 bg-white rounded-lg">
              <QRCodeSVG
                value={`upi://pay?pa=paytmqr1aictmo962@paytm&pn=Paytm&am=${depositAmount}&tr=${transactionRef}&tn=Deposit`}
                size={180}
                level="H"
                includeMargin
              />
              <div className="mt-3 text-center">
                <div className="font-display font-bold text-2xl text-black">
                  ₹{depositAmount}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Order ID: {transactionRef}
                </div>
              </div>
            </div>

            {/* UPI ID Display */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Pay to UPI ID</div>
                  <div className="font-display font-semibold text-primary text-sm">paytmqr1aictmo962@paytm</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("paytmqr1aictmo962@paytm");
                    toast.success("UPI ID copied!");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Verify Payment Button */}
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => verifyPayment(false)}
              disabled={verifyingPayment}
            >
              {verifyingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Payment
                </>
              )}
            </Button>

            {/* Generate New QR */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={generateNewRef}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New QR Code
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDepositDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
