import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Mail, Lock, User, Send, ArrowRight, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

type AuthMode = "login" | "register";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gameId, setGameId] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [gameAccountInfo, setGameAccountInfo] = useState<GameAccountInfo | null>(null);
  const [isGameIdConfirmed, setIsGameIdConfirmed] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Reset game verification when switching modes or changing game ID
  useEffect(() => {
    setGameAccountInfo(null);
    setIsGameIdConfirmed(false);
  }, [mode, gameId]);

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
          toast.success("Account created successfully!");
          navigate("/dashboard");
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
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Login to continue your journey"
                : "Join thousands of players today"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="gaming-card neon-border">
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

              {/* Register Fields */}
              {mode === "register" && (
                <>
                  {/* Game ID Verification */}
                  <div className="space-y-2 animate-fade-in">
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

                  <div className="space-y-2 animate-fade-in">
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
                </>
              )}

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
                    {mode === "login" ? "Login" : "Create Account"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
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
