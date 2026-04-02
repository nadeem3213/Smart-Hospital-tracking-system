import { motion } from "framer-motion";
import { Activity, LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Login failed", description: data.message, variant: "destructive" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const userName = data.user?.name || "User";
      toast({ title: `Welcome back, ${userName}!`, description: "You are now connected to the dispatch network." });
      navigate("/dashboard");
    } catch {
      toast({ title: "Connection Error", description: "Could not connect to the server. Please make sure the backend is running.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 scan-line pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(0_85%_55%/0.08)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 glow-red">
              <Activity className="h-6 w-6 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse-slow" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold tracking-wide text-foreground">
                MEDI<span className="text-primary">ROUTE</span>
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground tracking-widest">
                EMERGENCY DISPATCH
              </p>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome <span className="text-secondary glow-text-cyan">Back</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access the dispatch system</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-mono text-muted-foreground tracking-wider">
              EMAIL ADDRESS
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="operator@mediroute.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-muted/50 border-border focus:border-secondary/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono text-muted-foreground tracking-wider">
              PASSWORD
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 bg-muted/50 border-border focus:border-secondary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-red font-semibold gap-2"
          >
            {loading ? (
              <span className="font-mono text-xs">AUTHENTICATING...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-secondary hover:text-secondary/80 font-medium inline-flex items-center gap-1 transition-colors"
              >
                Create Account <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground font-mono mt-6 tracking-wider">
          SECURE • ENCRYPTED • HIPAA COMPLIANT
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
