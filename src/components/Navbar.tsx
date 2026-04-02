import { motion } from "framer-motion";
import { Activity, Bell, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-red">
            <Activity className="h-5 w-5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">
              MEDI<span className="text-primary">ROUTE</span>
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest">
              EMERGENCY DISPATCH
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
          <a href="#hospitals" className="hover:text-foreground transition-colors">Hospitals</a>
          <a href="#routing" className="hover:text-foreground transition-colors">Routing</a>
          <a href="#analytics" className="hover:text-foreground transition-colors">Analytics</a>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block font-mono text-xs text-secondary glow-text-cyan">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
          <div className="relative">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span className="text-xs font-mono text-success">ONLINE</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
