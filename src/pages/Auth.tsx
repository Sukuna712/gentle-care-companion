import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, AtSign, User, ArrowRight } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreedToTerms) {
      toast.error("Please agree to the terms before creating an account.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <h2 className="font-display font-bold text-lg tracking-widest uppercase text-foreground">
          Chronos
        </h2>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-sm font-body">
            Chronos Protocol Active
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-body cursor-pointer hover:text-foreground transition-colors">
            Documentation
          </span>
          <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-body cursor-pointer hover:text-foreground transition-colors">
            Support
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Hero */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-md">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-sm px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-primary font-body font-medium">
                System Online
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight text-foreground">
              Step into the{" "}
              <span className="text-primary">Chronos Horizon</span>
            </h1>

            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-sm">
              The Next Generation AI chatbot that assists minor injuries like a doctor available at home in a single prompt.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 mt-auto pt-12">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/80 border-2 border-background flex items-center justify-center text-[10px] text-background font-bold">A</div>
              <div className="w-7 h-7 rounded-full bg-primary/80 border-2 border-background flex items-center justify-center text-[10px] text-background font-bold">O</div>
              <div className="w-7 h-7 rounded-full bg-accent/80 border-2 border-background flex items-center justify-center text-[10px] text-background font-bold">+</div>
            </div>
            <span className="text-xs text-muted-foreground font-body">
              Join 40k+ verified nodes
            </span>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                {isLogin ? "Access Terminal" : "Create Identity"}
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {isLogin ? "New operative? " : "Already registered? "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Create identity" : "Log in to terminal"}
                </button>
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">
                    Legal Designation
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full h-11 pl-10 pr-4 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">
                  Comm Link (Email)
                </label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@protocol.com"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">
                  Access Key (Password)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full h-11 pl-10 pr-11 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground/50 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* Cyan underline accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-b-md" />
                </div>
              </div>

              {!isLogin && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors ${
                      agreedToTerms
                        ? "bg-primary border-primary"
                        : "border-border bg-card group-hover:border-muted-foreground"
                    }`}
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    {agreedToTerms && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-body leading-relaxed">
                    By creating an account, you agree to the{" "}
                    <span className="text-primary hover:underline cursor-pointer">Protocol Agreements</span> and{" "}
                    <span className="text-primary hover:underline cursor-pointer">Privacy Shield</span>.
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-foreground font-body text-sm font-semibold tracking-[0.15em] uppercase flex items-center justify-center gap-2 hover:from-primary/30 hover:to-primary/20 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Please wait…"
                  : isLogin
                  ? "Access Terminal"
                  : "Create Account"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-body font-semibold">
                  Federated Login
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex-1 h-11 rounded-md bg-card border border-border flex items-center justify-center gap-2 text-sm text-foreground font-body hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
