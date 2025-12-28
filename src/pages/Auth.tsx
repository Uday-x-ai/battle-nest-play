import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Mail, Lock, User, Send, ArrowRight, Loader2, Search, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthMode = "login" | "register";
type AuthStep = "form" | "email-verification";

interface GameAccountInfo {
  nickname: string;
  level: number;
  accountId: string;
}

const emailSchema = z.string().trim().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const gameIdSchema = z.string().trim().min(6, "Game ID must be at least 6 characters").max(20, "Game ID is too long").regex(/^\d+$/, "Game ID must contain only numbers");

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [authStep, setAuthStep] = useState<AuthStep>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gameId, setGameId] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [gameAccountInfo, setGameAccountInfo] = useState<GameAccountInfo | null>(null);
  const [isGameIdConfirmed, setIsGameIdConfirmed] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Reset when switching modes
  useEffect(() => {
    setGameAccountInfo(null);
    setIsGameIdConfirmed(false);
    setAuthStep("form");
    setOtp("");
  }, [mode]);

  useEffect(() => {
    setGameAccountInfo(null);
    setIsGameIdConfirmed(false);
  }, [gameId]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const sendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success("OTP sent to your email!");
      setResendTimer(60);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp?action=verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      toast.success("Email verified! Welcome to FF Arena!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Invalid or expired OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const verifyGameId = async () => {
    try {
      gameIdSchema.parse(gameId);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`https://ffapi.udayscripts.in/api/account?uid=${gameId}&region=IND`);
      
      if (!response.ok) {
        throw new Error("Failed to verify game ID");
      }
      
      const data = await response.json();
      
      if (data.basicinfo && data.basicinfo.nickname) {
        setGameAccountInfo({
          nickname: data.basicinfo.nickname,
          level: data.basicinfo.level,
          accountId: data.basicinfo.accountid
        });
        toast.success("Game account found!");
      } else {
        toast.error("Game account not found. Please check your Game ID.");
        setGameAccountInfo(null);
      }
    } catch (error) {
      console.error("Error verifying game ID:", error);
      toast.error("Failed to verify Game ID. Please try again.");
      setGameAccountInfo(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const confirmGameAccount = () => {
    setIsGameIdConfirmed(true);
    toast.success("Game account confirmed!");
  };

  const resetGameVerification = () => {
    setGameAccountInfo(null);
    setIsGameIdConfirmed(false);
    setGameId("");
  };

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (mode === "register") {
        if (!isGameIdConfirmed || !gameAccountInfo) {
          toast.error("Please verify and confirm your Game ID first");
          setIsLoading(false);
          return;
        }
      }

      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(email, password, {
          game_name: gameAccountInfo?.nickname || "",
          telegram_id: telegramId || undefined,
          game_id: gameId
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please login instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! Please verify your email.");
          // Send OTP after successful registration
          await sendOtp();
          setAuthStep("email-verification");
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px]" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-fire-orange to-fire-red flex items-center justify-center shadow-glow-orange">
                <Gamepad2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl">
                <span className="gradient-text">FF</span>
                <span className="text-foreground">Arena</span>
              </span>
            </Link>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
              {authStep === "email-verification" 
                ? "Verify Your Email" 
                : mode === "login" 
                  ? "Welcome Back" 
                  : "Create Account"}
            </h1>
            <p className="text-muted-foreground">
              {authStep === "email-verification"
                ? "Enter the OTP sent to your email"
                : mode === "login"
                  ? "Login to continue your journey"
                  : "Join thousands of players today"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="gaming-card neon-border">
            {authStep === "email-verification" ? (
              // Email Verification Step (after registration)
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-fire-orange to-fire-red flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit code to<br />
                    <span className="text-foreground font-medium">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="button"
                  variant="fire"
                  onClick={verifyOtp}
                  disabled={isVerifyingOtp || otp.length !== 6}
                  className="w-full"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  {resendTimer > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend in <span className="text-foreground font-medium">{resendTimer}s</span>
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={sendOtp}
                      disabled={isSendingOtp}
                      className="text-primary hover:text-primary/80"
                    >
                      {isSendingOtp ? "Sending..." : "Resend OTP"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex mb-6 bg-muted rounded-lg p-1">
                  <button
                    className={`flex-1 py-2.5 rounded-md font-display font-semibold transition-all ${
                      mode === "login"
                        ? "bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground shadow-glow-orange"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMode("login")}
                  >
                    Login
                  </button>
                  <button
                    className={`flex-1 py-2.5 rounded-md font-display font-semibold transition-all ${
                      mode === "register"
                        ? "bg-gradient-to-r from-fire-orange to-fire-red text-primary-foreground shadow-glow-orange"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMode("register")}
                  >
                    Register
                  </button>
                </div>

                {mode === "login" ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-muted border-border"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 bg-muted border-border"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      variant="fire" 
                      className="w-full group" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Login
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-muted border-border"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 bg-muted border-border"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Game ID Verification */}
                    <div className="space-y-2">
                      <Label htmlFor="gameId" className="text-foreground">
                        Free Fire Game ID
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="gameId"
                            type="text"
                            placeholder="Enter your Game ID (e.g., 3659196149)"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            className="pl-10 bg-muted border-border"
                            disabled={isGameIdConfirmed}
                            required
                          />
                        </div>
                        {!isGameIdConfirmed && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={verifyGameId}
                            disabled={isVerifying || !gameId}
                            className="shrink-0"
                          >
                            {isVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Game Account Info Card */}
                    {gameAccountInfo && !isGameIdConfirmed && (
                      <div className="animate-fade-in p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-fire-orange to-fire-red flex items-center justify-center">
                            <User className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-display font-bold text-foreground text-lg">{gameAccountInfo.nickname}</p>
                            <p className="text-sm text-muted-foreground">Level {gameAccountInfo.level}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="fire"
                            onClick={confirmGameAccount}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Account
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetGameVerification}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Try Different ID
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Confirmed Account Badge */}
                    {isGameIdConfirmed && gameAccountInfo && (
                      <div className="animate-fade-in p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-semibold text-foreground">{gameAccountInfo.nickname}</p>
                            <p className="text-xs text-muted-foreground">Level {gameAccountInfo.level} • ID: {gameId}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetGameVerification}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Change
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="telegramId" className="text-foreground">
                        Telegram ID <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="telegramId"
                          type="text"
                          placeholder="@username"
                          value={telegramId}
                          onChange={(e) => setTelegramId(e.target.value)}
                          className="pl-10 bg-muted border-border"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit"
                      variant="fire" 
                      className="w-full group" 
                      size="lg"
                      disabled={isLoading || !isGameIdConfirmed}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
