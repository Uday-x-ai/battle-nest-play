import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Phone, Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "register";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [gameName, setGameName] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (!phone || phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setOtpSent(true);
    toast.success("OTP sent to your phone!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOtp();
      return;
    }
    if (mode === "register" && !gameName) {
      toast.error("Please enter your in-game name");
      return;
    }
    toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!");
  };

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
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10 bg-muted border-border"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* OTP */}
              {otpSent && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="otp" className="text-foreground">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="bg-muted border-border text-center font-display text-lg tracking-widest"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => toast.info("OTP resent!")}
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              {/* Register Fields */}
              {mode === "register" && otpSent && (
                <>
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="gameName" className="text-foreground">
                      In-Game Name
                    </Label>
                    <Input
                      id="gameName"
                      type="text"
                      placeholder="Your Free Fire name"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      className="bg-muted border-border"
                    />
                  </div>
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
              <Button type="submit" variant="fire" className="w-full group" size="lg">
                {!otpSent
                  ? "Send OTP"
                  : mode === "login"
                  ? "Login"
                  : "Create Account"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Telegram Login */}
            <Button variant="neon" className="w-full gap-2">
              <Send className="w-5 h-5" />
              Login with Telegram
            </Button>
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
